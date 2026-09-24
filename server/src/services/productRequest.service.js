import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { Address } from '../models/address.model.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { quoteService } from './quote.service.js';
import { BadRequestError, NotFoundError, ForbiddenError, assertResourceOwnership } from '../utils/index.js';

/**
 * Product Request Service
 * Handles sourcing requests, ownership isolation, and administrative lifecycle management.
 */
export class ProductRequestService extends BaseService {
  /**
   * Helper: Validates Mongoose ObjectId.
   */
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Helper: Validates customer delivery address ownership.
   * Prevents cross-customer address assignment.
   */
  async assertDeliveryAddressOwnership(userId, addressId) {
    if (!addressId) return null;
    this.validateObjectId(addressId, 'Delivery Address ID');
    const address = await Address.findById(addressId);
    if (!address || !address.isActive) {
      throw new NotFoundError('Delivery address not found or inactive');
    }
    assertResourceOwnership(address, userId, 'Delivery address', 'userId');
    return address;
  }

  /**
   * Helper: Asserts that a user holds the administrative role.
   * @param {string} adminUserId
   */
  async assertAdmin(adminUserId) {
    this.validateObjectId(adminUserId, 'Admin User ID');
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Administrative privileges required');
    }
    return adminUser;
  }

  /**
   * Creates a new sourcing request for an authenticated customer.
   * Calculates initial quote snapshot if price provided and binds ownership strictly to user.
   * @param {string} userId - Authenticated user ID
   * @param {object} requestData - Input fields
   * @returns {Promise<import('mongoose').Document>}
   */
  async createRequest(userId, requestData) {
    if (!userId) {
      throw new BadRequestError('Authenticated User ID is required to create a sourcing request');
    }
    this.validateObjectId(userId, 'User ID');

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Customer account not found');
    }
    if (user.isActive === false) {
      throw new ForbiddenError('Customer account is deactivated or inactive');
    }

    // Mass assignment and ownership tampering protection - strict allowlist
    const {
      user: _ignoreUser,
      userId: _ignoreUserId,
      _id: _ignoreId,
      status: _ignoreStatus,
      internalNotes: _ignoreInternalNotes,
      quote: _ignoreQuote,
      paymentSubmission: _ignorePayment,
      createdAt: _c,
      updatedAt: _u,
      role: _r,
      finalAmount: _f,
      finalAmountNpr: _fn,
      amountPayableNow: _ap,
      payNowAmountNpr: _pna,
      remainingCodAmount: _rc,
      remainingCodAmountNpr: _rcn,
      conversionMultiplier: _cm,
      exchangeRate: _er,
      feeRate: _fr,
      appliedRate: _ar,
      rateAmountNpr: _ran,
      convertedAmountNpr: _can,
      calculatedAt: _ca,
      __proto__: _proto,
      constructor: _const,
      prototype: _pt,
      productUrl,
      productName,
      marketplace,
      productPriceInr,
      quantity,
      variant,
      notes,
      deliveryAddress,
      paymentMode,
      currency,
    } = requestData;

    // Normalize and validate the product URL safely
    const cleanUrl = normalizeProductUrl(productUrl);
    const cleanMarketplace = resolveAuthoritativeMarketplace(cleanUrl, marketplace);

    // Delivery address ownership validation
    if (deliveryAddress) {
      await this.assertDeliveryAddressOwnership(userId, deliveryAddress);
    }

    const cleanQty = quantity !== undefined ? Math.max(1, Math.floor(Number(quantity) || 1)) : 1;
    let initialQuote = null;

    if (productPriceInr !== undefined && productPriceInr !== null && Number(productPriceInr) > 0) {
      const mode = (paymentMode === 'cod_50_50' || paymentMode === 'COD_50_50') ? 'cod_50_50' : 'online_100';
      initialQuote = quoteService.calculateQuote(
        Number(productPriceInr),
        cleanQty,
        mode
      );
    }

    const productRequest = new ProductRequest({
      user: userId,
      productUrl: cleanUrl,
      productName: productName.trim(),
      marketplace: cleanMarketplace,
      productPriceInr: productPriceInr !== undefined && productPriceInr !== null ? Number(productPriceInr) : undefined,
      quantity: cleanQty,
      variant: variant ? String(variant).trim() : null,
      notes: notes ? String(notes).trim() : null,
      deliveryAddress: deliveryAddress || null,
      currency: currency || 'INR',
      status: REQUEST_STATUSES.SUBMITTED,
      quote: initialQuote,
    });

    return productRequest.save();
  }

  /**
   * Retrieves a single sourcing request ensuring customer ownership.
   * Populates delivery address summary and sanitizes internal administrative notes.
   * @param {string} userId - User ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<object>}
   */
  async getRequestDetailsForCustomer(userId, requestId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId)
      .populate('deliveryAddress', 'fullName phone label tole municipality district province country postalCode')
      .lean();

    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    assertResourceOwnership(request, userId, 'Product request', 'user');

    // Customer safe representation (no internal notes)
    const { internalNotes, __v, ...customerSafeRequest } = request;
    return customerSafeRequest;
  }

  /**
   * Calculates and saves authoritative quote snapshot for a customer request.
   * Updates request state to 'quote_ready' and stores immutable calculation snapshot.
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - ProductRequest ID
   * @param {object} [quoteOptions={}] - Optional payment mode / price override
   * @returns {Promise<import('mongoose').Document>}
   */
  async generateAndSaveQuote(userId, requestId, quoteOptions = {}) {
    const request = await this.getRequestForUser(userId, requestId);

    // Explicit state check: only allow quote generation in pre-fulfillment/negotiation states
    const ALLOWED_QUOTE_STATES = [
      REQUEST_STATUSES.DRAFT,
      REQUEST_STATUSES.SUBMITTED,
      REQUEST_STATUSES.UNDER_REVIEW,
      REQUEST_STATUSES.QUOTE_READY,
      REQUEST_STATUSES.QUOTED,
    ];

    if (!ALLOWED_QUOTE_STATES.includes(request.status)) {
      throw new BadRequestError(
        `Cannot calculate or modify quote for request in '${request.status}' status`
      );
    }

    const price = quoteOptions.productPriceInr !== undefined
      ? Number(quoteOptions.productPriceInr)
      : request.productPriceInr;

    const quantity = quoteOptions.quantity !== undefined
      ? Math.max(1, Math.floor(Number(quoteOptions.quantity) || 1))
      : request.quantity || 1;

    const paymentMode = quoteOptions.paymentMode || request.paymentMode || 'online_100';

    if (!price || price <= 0 || !Number.isFinite(price)) {
      throw new BadRequestError('A valid product price in INR is required to generate a quote');
    }

    // Authoritative server-side calculation
    const quoteSnapshot = quoteService.calculateQuote(price, quantity, paymentMode);

    request.productPriceInr = price;
    request.quantity = quantity;
    request.quote = quoteSnapshot;
    request.status = REQUEST_STATUSES.QUOTE_READY;

    return request.save();
  }

  /**
   * Retrieves authoritative quote snapshot for a customer request with ownership isolation.
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<object>}
   */
  async getQuoteForUser(userId, requestId) {
    const request = await this.getRequestForUser(userId, requestId);
    if (!request.quote) {
      throw new NotFoundError('No quote has been generated for this sourcing request yet');
    }
  /**
   * Confirms an authoritative quote by the customer.
   * Transitions status from 'quote_ready' to 'customer_confirmed' and stamps confirmedAt.
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async confirmQuote(userId, requestId) {
    const request = await this.getRequestForUser(userId, requestId);

    if (!request.quote) {
      throw new BadRequestError('Cannot confirm a request that does not have an active quote');
    }

    const ALLOWED_CONFIRM_STATES = [REQUEST_STATUSES.QUOTE_READY, REQUEST_STATUSES.QUOTED];
    if (!ALLOWED_CONFIRM_STATES.includes(request.status)) {
      throw new BadRequestError(
        `Cannot confirm quote for request in '${request.status}' state. Quote must be ready.`
      );
    }

    if (request.quote.expiresAt && new Date(request.quote.expiresAt) < new Date()) {
      request.status = REQUEST_STATUSES.EXPIRED;
      if (request.quote) request.quote.quoteStatus = 'expired';
      await request.save();
      throw new BadRequestError('This quote has expired. Please request a new quote.');
    }

    request.status = REQUEST_STATUSES.CUSTOMER_CONFIRMED;
    if (request.quote) {
      request.quote.confirmedAt = new Date();
      request.quote.quoteStatus = 'accepted';
    }

    return request.save();
  }

  /**
   * Lists sourcing requests for an authenticated customer.
   * Excludes internal administrative fields and guarantees customer isolation.
   * @param {string} userId - Authenticated user ID
   * @param {object} [options={}] - Query options (page, limit, sortBy, sortOrder)
   * @returns {Promise<{ requests: Array<object>, pagination: object }>}
   */
  async listUserRequests(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 1 || options.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const filter = { user: userId };

    // Deterministic compound sort with _id as tie-breaker
    const sortCriteria = { [sortBy]: sortOrder, _id: -1 };

    const [requests, total] = await Promise.all([
      ProductRequest.find(filter)
        .populate('deliveryAddress', 'fullName phone label tole municipality district province')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductRequest.countDocuments(filter),
    ]);

    // Format safe customer response
    const sanitizedRequests = requests.map((req) => {
      const { internalNotes, __v, ...safeReq } = req;
      return safeReq;
    });

    return {
      requests: sanitizedRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Lists sourcing requests for an authenticated user (legacy helper).
   * @param {string} userId - User ID
   * @returns {Promise<Array<import('mongoose').Document>>}
   */
  async getUserRequests(userId) {
    this.validateObjectId(userId, 'User ID');
    return ProductRequest.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Allows customer to update editable details on their own submitted sourcing request.
   * Customers cannot modify status, internal notes, quote calculations, or reassign ownership.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - Request ID
   * @param {object} updateData - Allowed update payload
   * @returns {Promise<import('mongoose').Document>}
   */
  async updateCustomerRequest(userId, requestId, updateData) {
    const request = await this.getRequestForUser(userId, requestId);

    if (request.status !== REQUEST_STATUSES.SUBMITTED && request.status !== REQUEST_STATUSES.UNDER_REVIEW) {
      throw new BadRequestError('Cannot modify sourcing request after quotes have been finalized or approved');
    }

    // Only allow customer-editable fields (e.g. notes, product specifications)
    const {
      productTitle,
      productUrl,
      productPriceInr,
      quantity,
      customerNotes,
      paymentMode,
    } = updateData;

    if (productTitle !== undefined) request.productTitle = productTitle;
    if (productUrl !== undefined) request.productUrl = productUrl;
    if (customerNotes !== undefined) request.customerNotes = customerNotes;
    if (productPriceInr !== undefined || quantity !== undefined || paymentMode !== undefined) {
      if (productPriceInr !== undefined) request.productPriceInr = productPriceInr;
      if (quantity !== undefined) request.quantity = quantity;
      if (paymentMode !== undefined) request.paymentMode = paymentMode;

      request.quote = quoteService.calculateQuote(
        request.productPriceInr,
        request.quantity,
        request.paymentMode
      );
    }

    return request.save();
  }

  /**
   * Retrieves complete administrative details for a sourcing request.
   * Exposes internal notes, customer contact, and payment proof references.
   * @param {string} adminUserId - Admin User ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async getAdminRequestDetails(adminUserId, requestId) {
    await this.assertAdmin(adminUserId);
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId)
      .select('+internalNotes')
      .populate('user', 'name email phone role')
      .populate('paymentSubmission');

    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    return request;
  }

  /**
   * Updates internal admin notes on a request (admin only).
   * @param {string} adminUserId - Admin User ID
   * @param {string} requestId - Request ID
   * @param {string} internalNotes - Private notes
   * @returns {Promise<import('mongoose').Document>}
   */
  async updateInternalNotes(adminUserId, requestId, internalNotes) {
    await this.assertAdmin(adminUserId);
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId).select('+internalNotes');
    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    request.internalNotes = internalNotes ? String(internalNotes).trim() : null;
    return request.save();
  }

  /**
   * Controlled request status transition engine.
   * Enforces authoritative transition state machines for both customers and administrators.
   * @param {string} userId - User ID (Customer or Admin)
   * @param {string} requestId - ProductRequest ID
   * @param {string} targetStatus - Desired target status
   * @param {object} [options={}] - Options (e.g. isAdmin flag, cancellation reason)
   * @returns {Promise<import('mongoose').Document>}
   */
  async transitionRequestStatus(userId, requestId, targetStatus, options = {}) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    const isCallerAdmin = Boolean(options.isAdmin);
    if (!isCallerAdmin) {
      assertResourceOwnership(request, userId, 'Product request', 'user');
    }

    // Validate transition
    validateStatusTransition(request.status, targetStatus, isCallerAdmin);

    const oldStatus = request.status;
    request.status = targetStatus;

    const saved = await request.save();
    return saved;
  }

  /**
   * Updates request lifecycle status (admin only).
   * @param {string} adminUserId - Admin User ID
   * @param {string} requestId - Request ID
   * @param {string} newStatus - New status value
   * @returns {Promise<import('mongoose').Document>}
   */
  async updateRequestStatus(adminUserId, requestId, newStatus) {
    await this.assertAdmin(adminUserId);
    return this.transitionRequestStatus(adminUserId, requestId, newStatus, { isAdmin: true });
  }
}

export const productRequestService = new ProductRequestService();
export default productRequestService;
