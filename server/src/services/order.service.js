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
  serializeCustomerOrder,
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
   * Sanitizes and enforces safe server-side bounds for pagination queries.
   * Max limit: 50, Default: 10
   */
  sanitizePaginationOptions(query = {}) {
    const rawPage = parseInt(query.page, 10);
    const rawLimit = parseInt(query.limit, 10);

    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(50, rawLimit) : 10;

    return { page, limit };
  }

  /**
   * Sanitizes sort criteria against a strict allowlist.
   * Prevents arbitrary query injection or execution of malicious MongoDB expressions.
   * Default: { createdAt: -1, _id: -1 }
   */
  sanitizeSortCriteria(options = {}) {
    const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'finalAmountNpr', 'currentStatus', 'orderNumber', 'productName'];
    const sortBy = typeof options.sortBy === 'string' && ALLOWED_SORT_FIELDS.includes(options.sortBy)
      ? options.sortBy
      : 'createdAt';

    const sortOrder = options.sortOrder === 1 || options.sortOrder === '1' || options.sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrder, _id: -1 };
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

    // 4. Resolve or initialize payment submission
    let payment = null;
    if (request.paymentSubmission) {
      payment = await PaymentSubmission.findById(request.paymentSubmission);
    }
    if (!payment) {
      payment = new PaymentSubmission({
        productRequest: request._id,
        user: userId,
        paymentMode: quoteSnapshot.paymentMode || 'online_100',
        paymentMethod: 'esewa',
        amountDueNpr: quoteSnapshot.finalAmountNpr,
        amountPaidNpr: quoteSnapshot.payNowAmountNpr,
        remainingAmountNpr: quoteSnapshot.remainingCodAmountNpr || 0,
        paymentStatus: PAYMENT_STATUSES.PENDING,
      });
      await payment.save();
      request.paymentSubmission = payment._id;
      await request.save();
    } else {
      assertResourceOwnership(payment, userId, 'Payment submission', 'user');
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
      const serialized = serializeCustomerOrder(existingOrder);
      const isPaymentRequired = (existingOrder.amountPayableNow > 0) && (!payment || payment.paymentStatus === PAYMENT_STATUSES.PENDING);
      const paymentState = {
        isPaymentRequired,
        paymentStatus: payment?.paymentStatus || PAYMENT_STATUSES.PENDING,
        amountDueNpr: existingOrder.finalAmountNpr,
        amountPayableNow: existingOrder.amountPayableNow,
        remainingCodAmount: existingOrder.remainingCodAmount,
        paymentMode: existingOrder.paymentMode,
        currency: 'NPR',
      };
      const nextStep = {
        type: isPaymentRequired ? 'payment' : 'order',
        orderId: existingOrder._id,
        orderNumber: existingOrder.orderNumber,
        requestId: request._id,
      };
      return {
        ...serialized,
        order: serialized,
        payment: paymentState,
        nextStep,
      };
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

    // Multi-document transaction handling (Atlas replica sets support sessions; standalone instances fallback cleanly)
    const session = await mongoose.startSession().catch(() => null);
    const useTransaction = session && typeof session.withTransaction === 'function';

    let resultOrder;
    if (useTransaction) {
      try {
        await session.withTransaction(async () => {
          const [created] = await Order.create([order], { session });
          resultOrder = created;

          await ProductRequest.findByIdAndUpdate(
            request._id,
            { order: created._id, status: REQUEST_STATUSES.PROCESSING },
            { session }
          );

          await PaymentSubmission.findByIdAndUpdate(
            payment._id,
            { order: created._id },
            { session }
          );
        });
        await session.endSession();
      } catch (txnError) {
        await session.endSession().catch(() => {});
        if (txnError.code === 11000) {
          const concurrentExisting = await Order.findOne({ productRequest: request._id });
          if (concurrentExisting) resultOrder = concurrentExisting;
          else throw new ConflictError('An order for this sourcing request already exists');
        } else if (!txnError.message?.includes('Transaction numbers are only allowed on a replica set member or mongos')) {
          throw txnError;
        }
      }
    }

    // Atomic sequential fallback for non-replica set deployments
    if (!resultOrder) {
      try {
        resultOrder = await order.save();
      } catch (err) {
        if (err.code === 11000) {
          const concurrentExisting = await Order.findOne({ productRequest: request._id });
          if (concurrentExisting) resultOrder = concurrentExisting;
          else throw new ConflictError('An order for this sourcing request already exists');
        } else {
          throw err;
        }
      }

      // Update references on ProductRequest and PaymentSubmission
      try {
        request.order = resultOrder._id;
        request.status = REQUEST_STATUSES.PROCESSING;
        await request.save();

        payment.order = resultOrder._id;
        await payment.save();
      } catch (cleanupErr) {
        // Avoid orphan order in partial failure
        await Order.findByIdAndDelete(resultOrder._id).catch(() => {});
        throw cleanupErr;
      }
    }

    const serialized = serializeCustomerOrder(resultOrder);
    const isPaymentRequired = (resultOrder.amountPayableNow > 0) && (!payment || payment.paymentStatus === PAYMENT_STATUSES.PENDING);
    const paymentState = {
      isPaymentRequired,
      paymentStatus: payment?.paymentStatus || PAYMENT_STATUSES.PENDING,
      amountDueNpr: resultOrder.finalAmountNpr,
      amountPayableNow: resultOrder.amountPayableNow,
      remainingCodAmount: resultOrder.remainingCodAmount,
      paymentMode: resultOrder.paymentMode,
      currency: 'NPR',
    };
    const nextStep = {
      type: isPaymentRequired ? 'payment' : 'order',
      orderId: resultOrder._id,
      orderNumber: resultOrder.orderNumber,
      requestId: request._id,
    };

    return {
      ...serialized,
      order: serialized,
      payment: paymentState,
      nextStep,
    };
  }



  /**
   * Retrieves paginated active current orders for an authenticated customer.
   * Filters out delivered and completed orders authoritatively on the server.
   */
  async getCurrentOrders(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const { page, limit } = this.sanitizePaginationOptions(options);
    const sortCriteria = this.sanitizeSortCriteria(options);

    const skip = (page - 1) * limit;
    const orderFilter = {
      user: userId,
      currentStatus: { $in: ACTIVE_FULFILLMENT_STATUSES },
    };

    let orders = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        [orders, total] = await Promise.all([
          Order.find(orderFilter)
            .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(orderFilter),
        ]);
      } catch {
        orders = [];
        total = 0;
      }
    }

    if (total > 0 || orders.length > 0) {
      const sanitizedOrders = orders.map((order) => serializeCustomerOrder(order));

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

    // Fallback query for legacy ProductRequests in active state
    const requestFilter = {
      user: userId,
      status: { $in: ACTIVE_ORDER_STATUSES },
    };

    const [legacyRequests, legacyTotal] = await Promise.all([
      ProductRequest.find(requestFilter)
        .populate('deliveryAddress', 'fullName phone label tole municipality district province')
        .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductRequest.countDocuments(requestFilter),
    ]);

    const sanitizedLegacy = legacyRequests.map((req) => serializeCustomerOrder(req));

    return {
      orders: sanitizedLegacy,
      pagination: {
        total: legacyTotal,
        page,
        limit,
        totalPages: Math.ceil(legacyTotal / limit) || 1,
        hasNextPage: page * limit < legacyTotal,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves paginated order history (delivered / completed / cancelled) for an authenticated customer.
   */
  async getOrderHistory(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const { page, limit } = this.sanitizePaginationOptions(options);
    const sortCriteria = this.sanitizeSortCriteria(options);

    const skip = (page - 1) * limit;
    const orderFilter = {
      user: userId,
      currentStatus: { $in: HISTORICAL_FULFILLMENT_STATUSES },
    };

    let orders = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        [orders, total] = await Promise.all([
          Order.find(orderFilter)
            .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(orderFilter),
        ]);
      } catch {
        orders = [];
        total = 0;
      }
    }

    if (total > 0 || orders.length > 0) {
      const sanitizedOrders = orders.map((order) => serializeCustomerOrder(order));

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

    // Fallback query for legacy ProductRequests in completed state
    const requestFilter = {
      user: userId,
      status: { $in: COMPLETED_ORDER_STATUSES },
    };

    const [legacyRequests, legacyTotal] = await Promise.all([
      ProductRequest.find(requestFilter)
        .populate('deliveryAddress', 'fullName phone label tole municipality district province')
        .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductRequest.countDocuments(requestFilter),
    ]);

    const sanitizedLegacy = legacyRequests.map((req) => serializeCustomerOrder(req));

    return {
      orders: sanitizedLegacy,
      pagination: {
        total: legacyTotal,
        page,
        limit,
        totalPages: Math.ceil(legacyTotal / limit) || 1,
        hasNextPage: page * limit < legacyTotal,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves single order detail with strict customer ownership verification.
   * Supports lookup by either MongoDB ObjectId or customer-facing orderNumber.
   */
  async getOrderDetailForCustomer(userId, orderIdOrNumber) {
    this.validateObjectId(userId, 'User ID');

    if (!orderIdOrNumber || typeof orderIdOrNumber !== 'string') {
      throw new BadRequestError('Invalid Order ID format');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrNumber);

    // 1. Try finding in authoritative Order model first
    const orderQuery = isObjectId
      ? { _id: orderIdOrNumber }
      : { orderNumber: String(orderIdOrNumber).trim().toUpperCase() };

    let orderDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        orderDoc = await Order.findOne(orderQuery)
          .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
          .populate('productRequest', 'productName productUrl marketplace quantity variant notes')
          .lean();
      } catch {
        orderDoc = null;
      }
    }

    if (orderDoc) {
      assertResourceOwnership(orderDoc, userId, 'Order', 'user');
      const serialized = serializeCustomerOrder(orderDoc);
      const isPaymentRequired = (serialized.amountPayableNow > 0) && (!serialized.payment || serialized.payment.paymentStatus === 'pending');
      const nextStep = {
        type: isPaymentRequired ? 'payment' : (['proof_submitted', 'under_review'].includes(serialized.payment?.paymentStatus) ? 'verification' : 'order'),
        orderId: serialized._id,
        orderNumber: serialized.orderNumber,
      };
      return {
        ...serialized,
        nextStep,
      };
    }

    // 2. Fallback to legacy ProductRequest for backward compatibility
    if (isObjectId) {
      const legacyDoc = await ProductRequest.findById(orderIdOrNumber)
        .populate('deliveryAddress')
        .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus amountDueNpr amountPaidNpr remainingAmountNpr transactionCode submittedAt verifiedAt')
        .lean();

      if (legacyDoc) {
        assertResourceOwnership(legacyDoc, userId, 'Order', 'user');
        const serialized = serializeCustomerOrder(legacyDoc);
        const isPaymentRequired = (serialized.amountPayableNow > 0) && (!serialized.payment || serialized.payment.paymentStatus === 'pending');
        const nextStep = {
          type: isPaymentRequired ? 'payment' : (['proof_submitted', 'under_review'].includes(serialized.payment?.paymentStatus) ? 'verification' : 'order'),
          orderId: serialized._id,
          orderNumber: serialized.orderNumber,
        };
        return {
          ...serialized,
          nextStep,
        };
      }
    }

    throw new NotFoundError('Order not found');
  }

  /**
   * Asserts that a user has administrator privileges.
   */
  async assertAdmin(adminUserId) {

    this.validateObjectId(adminUserId, 'Admin User ID');
    const { User, USER_ROLES } = await import('../models/user.model.js');
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Administrative privileges required');
    }
    return adminUser;
  }

  /**
   * Privileged Order Status Update
   * Enforces transition policies and logs changedBy in status history.
   * @param {string} adminUserId - Authenticated Admin User ID
   * @param {string} orderId - Order ID or orderNumber
   * @param {object} updateData - { status, note, deliveryInfo }
   * @returns {Promise<object>}
   */
  async updateOrderStatus(adminUserId, orderId, updateData = {}) {
    await this.assertAdmin(adminUserId);

    const { status: targetStatus, note, deliveryInfo } = updateData;

    if (!targetStatus) {
      throw new BadRequestError('Target order status is required');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(orderId);
    const orderQuery = isObjectId
      ? { _id: orderId }
      : { orderNumber: String(orderId).trim().toUpperCase() };

    const order = await Order.findOne(orderQuery);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const currentStatus = order.currentStatus;

    if (!canTransitionOrderStatus(currentStatus, targetStatus)) {
      throw new BadRequestError(`Invalid order status transition from "${ORDER_STATUS_LABELS[currentStatus] || currentStatus}" to "${ORDER_STATUS_LABELS[targetStatus] || targetStatus}"`);
    }

    // Append to status history
    order.addStatusHistory(targetStatus, adminUserId, note);

    if (deliveryInfo && typeof deliveryInfo === 'object') {
      if (deliveryInfo.carrier) order.deliveryInfo.carrier = String(deliveryInfo.carrier).trim();
      if (deliveryInfo.trackingNumber) order.deliveryInfo.trackingNumber = String(deliveryInfo.trackingNumber).trim();
      if (deliveryInfo.estimatedDeliveryDate) order.deliveryInfo.estimatedDeliveryDate = new Date(deliveryInfo.estimatedDeliveryDate);
      if (deliveryInfo.actualDeliveryDate) order.deliveryInfo.actualDeliveryDate = new Date(deliveryInfo.actualDeliveryDate);
    }

    if (targetStatus === ORDER_STATUSES.DELIVERED && !order.deliveryInfo.actualDeliveryDate) {
      order.deliveryInfo.actualDeliveryDate = new Date();
    }

    const saved = await order.save();
    return serializeCustomerOrder(saved);
  }
}

export const orderService = new OrderService();
export default orderService;


