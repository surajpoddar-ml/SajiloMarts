import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { BadRequestError, NotFoundError, assertResourceOwnership } from '../utils/index.js';

// Established SajiloMarts fulfillment & active order statuses
export const ACTIVE_ORDER_STATUSES = [
  REQUEST_STATUSES.CUSTOMER_CONFIRMED,
  REQUEST_STATUSES.PAYMENT_PENDING,
  REQUEST_STATUSES.PAYMENT_SUBMITTED,
  REQUEST_STATUSES.PAYMENT_UNDER_REVIEW,
  REQUEST_STATUSES.PAYMENT_VERIFIED,
  REQUEST_STATUSES.PROCESSING,
  'in_transit',
  'arrived_in_nepal',
  'out_for_delivery',
  'order_received',
  'sourcing',
  'purchased',
];

export const COMPLETED_ORDER_STATUSES = [
  REQUEST_STATUSES.COMPLETED,
  'delivered',
  REQUEST_STATUSES.CANCELLED,
  'refunded',
];

/**
 * Order Service
 * Authoritatively queries customer orders (current active vs historical) with server pagination.
 */
export class OrderService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
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
