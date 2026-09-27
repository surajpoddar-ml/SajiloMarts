import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { Address } from '../models/address.model.js';
import { Order } from '../models/order.model.js';
import {
  ORDER_STATUSES,
  ACTIVE_FULFILLMENT_STATUSES,
  HISTORICAL_FULFILLMENT_STATUSES,
  ORDER_STATUS_LABELS,
  VALID_ORDER_TRANSITIONS,
  canTransitionOrderStatus,
} from '../constants/order.constants.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  assertResourceOwnership,
  generateUniqueOrderNumber,
  createDeliveryAddressSnapshot,
  extractAuthoritativeQuoteSnapshot,
} from '../utils/index.js';

// Established SajiloMarts fulfillment & active order statuses
export const ACTIVE_ORDER_STATUSES = [
  ...ACTIVE_FULFILLMENT_STATUSES,
  REQUEST_STATUSES.CUSTOMER_CONFIRMED,
  REQUEST_STATUSES.PAYMENT_PENDING,
  REQUEST_STATUSES.PAYMENT_SUBMITTED,
  REQUEST_STATUSES.PAYMENT_UNDER_REVIEW,
  REQUEST_STATUSES.PAYMENT_VERIFIED,
  REQUEST_STATUSES.PROCESSING,
];

export const COMPLETED_ORDER_STATUSES = [
  ...HISTORICAL_FULFILLMENT_STATUSES,
  REQUEST_STATUSES.COMPLETED,
  REQUEST_STATUSES.CANCELLED,
];

/**
 * Order Service
 * Authoritatively manages order creation, fulfillment lifecycles, and customer order queries.
 */
export class OrderService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Safe, server-authoritative Order Creation from a validated Sourcing Request.
   * Enforces customer ownership, quote snapshot integrity, delivery address snapshot, and payment readiness.
   * @param {string} userId - Authenticated customer ID
   * @param {string} requestId - Sourcing ProductRequest ID
   * @param {object} [options]
   * @returns {Promise<import('mongoose').Document>}
   */
  async createOrderFromSourcingRequest(userId, requestId, options = {}) {
    this.validateObjectId(userId, 'Customer ID');
    this.validateObjectId(requestId, 'Product Request ID');

    // 1. Fetch sourcing request
    const request = await ProductRequest.findById(requestId).populate('deliveryAddress');
    if (!request) {
      throw new NotFoundError('Sourcing request not found');
    }

    // 2. Strict ownership verification
    assertResourceOwnership(request, userId, 'Sourcing request', 'user');

    // 3. Verify quote validity & extract snapshot
    if (!request.quote) {
      throw new BadRequestError('Sourcing request does not have an approved quote');
    }
    const quoteSnapshot = extractAuthoritativeQuoteSnapshot(request.quote);

    // 4. Verify payment readiness
    if (!request.paymentSubmission) {
      throw new BadRequestError('Payment submission is required before order creation');
    }
    const payment = await PaymentSubmission.findById(request.paymentSubmission);
    if (!payment) {
      throw new NotFoundError('Associated payment submission not found');
    }
    assertResourceOwnership(payment, userId, 'Payment submission', 'user');

    // Payment must be submitted or verified (never uninitialized)
    if (![PAYMENT_STATUSES.PROOF_SUBMITTED, PAYMENT_STATUSES.UNDER_REVIEW, PAYMENT_STATUSES.VERIFIED].includes(payment.paymentStatus)) {
      throw new BadRequestError(`Payment is not in an eligible state for order creation (current status: ${payment.paymentStatus})`);
    }

    // 5. Verify delivery address and create immutable snapshot
    let deliveryAddressDoc = request.deliveryAddress;
    if (!deliveryAddressDoc && options.deliveryAddressId) {
      this.validateObjectId(options.deliveryAddressId, 'Delivery Address ID');
      deliveryAddressDoc = await Address.findById(options.deliveryAddressId);
    }
    if (!deliveryAddressDoc) {
      throw new BadRequestError('A valid Nepal delivery address is required for order creation');
    }
    assertResourceOwnership(deliveryAddressDoc, userId, 'Delivery address', 'user');
    const deliveryAddressSnapshot = createDeliveryAddressSnapshot(deliveryAddressDoc);

    // 6. Idempotency / Duplicate Check
    const existingOrder = await Order.findOne({ productRequest: request._id });
    if (existingOrder) {
      return existingOrder; // Safe idempotent return
    }

    // 7. Generate safe customer-facing unique order number
    const orderNumber = await generateUniqueOrderNumber(Order);

    // 8. Construct authoritative Order document
    const order = new Order({
      orderNumber,
      user: userId,
      productRequest: request._id,
      paymentSubmission: payment._id,
      productName: request.productName,
      productUrl: request.productUrl,
      marketplace: request.marketplace,
      quantity: request.quantity,
      variant: request.variant,
      customerNotes: request.notes,
      productPriceInr: quoteSnapshot.productPriceInr,
      subtotalInr: quoteSnapshot.subtotalInr,
      conversionMultiplier: quoteSnapshot.conversionMultiplier,
      feeRate: quoteSnapshot.feeRate,
      convertedAmountNpr: quoteSnapshot.convertedAmountNpr,
      finalAmountNpr: quoteSnapshot.finalAmountNpr,
      paymentMode: quoteSnapshot.paymentMode,
      amountPayableNow: quoteSnapshot.payNowAmountNpr,
      remainingCodAmount: quoteSnapshot.remainingCodAmountNpr,
      currency: 'NPR',
      quoteSnapshot,
      deliveryAddressSnapshot,
      currentStatus: ORDER_STATUSES.ORDER_RECEIVED,
      statusHistory: [
        {
          previousStatus: null,
          status: ORDER_STATUSES.ORDER_RECEIVED,
          changedAt: new Date(),
          note: 'Order placed and initial payment verified.',
        },
      ],
    });

    const savedOrder = await order.save();

    // 9. Update references on ProductRequest and PaymentSubmission
    request.order = savedOrder._id;
    request.status = REQUEST_STATUSES.PROCESSING;
    await request.save();

    payment.order = savedOrder._id;
    await payment.save();

    return savedOrder;
  }


  /**
   * Retrieves paginated active current orders for an authenticated customer.
   */
  async getCurrentOrders(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 1 || options.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const filter = {
      user: userId,
      status: { $in: ACTIVE_ORDER_STATUSES },
    };

    const sortCriteria = { [sortBy]: sortOrder, _id: -1 };

    const [orders, total] = await Promise.all([
      ProductRequest.find(filter)
        .populate('deliveryAddress', 'fullName phone label tole municipality district province')
        .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductRequest.countDocuments(filter),
    ]);

    const sanitizedOrders = orders.map((order) => {
      const { internalNotes, __v, ...safeOrder } = order;
      return safeOrder;
    });

    return {
      orders: sanitizedOrders,
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
   * Retrieves paginated order history (completed / delivered / cancelled) for an authenticated customer.
   */
  async getOrderHistory(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(options.limit, 10) || 10));
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 1 || options.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const filter = {
      user: userId,
      status: { $in: COMPLETED_ORDER_STATUSES },
    };

    const sortCriteria = { [sortBy]: sortOrder, _id: -1 };

    const [orders, total] = await Promise.all([
      ProductRequest.find(filter)
        .populate('deliveryAddress', 'fullName phone label tole municipality district province')
        .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductRequest.countDocuments(filter),
    ]);

    const sanitizedOrders = orders.map((order) => {
      const { internalNotes, __v, ...safeOrder } = order;
      return safeOrder;
    });

    return {
      orders: sanitizedOrders,
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
   * Retrieves single order detail with customer ownership verification.
   */
  async getOrderDetailForCustomer(userId, orderId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(orderId, 'Order ID');

    const order = await ProductRequest.findById(orderId)
      .populate('deliveryAddress')
      .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountDueNpr amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
      .lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    assertResourceOwnership(order, userId, 'Order', 'user');

    const { internalNotes, __v, ...safeOrder } = order;
    return safeOrder;
  }
}

export const orderService = new OrderService();
export default orderService;
