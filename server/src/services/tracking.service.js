import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { Order } from '../models/order.model.js';
import { ORDER_STATUS_LABELS } from '../constants/order.constants.js';
import {
  BadRequestError,
  NotFoundError,
  assertResourceOwnership,
} from '../utils/index.js';

/**
 * Tracking Service
 * Provides customer-safe order tracking data from real backend status history.
 * No fabricated tracking numbers, ETAs, or courier info.
 */
export class TrackingService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Retrieves customer-safe tracking data for a specific order.
   * Enforces ownership — customer can only track their own orders.
   * @param {string} userId - Authenticated customer ID
   * @param {string} orderIdOrNumber - Order ObjectId or customer-facing orderNumber
   * @returns {Promise<object>} Customer-safe tracking response
   */
  async getOrderTracking(userId, orderIdOrNumber) {
    this.validateObjectId(userId, 'User ID');

    if (!orderIdOrNumber || typeof orderIdOrNumber !== 'string') {
      throw new BadRequestError('Invalid order identifier');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdOrNumber);
    const query = isObjectId
      ? { _id: orderIdOrNumber }
      : { orderNumber: String(orderIdOrNumber).trim().toUpperCase() };

    const order = await Order.findOne(query)
      .populate('paymentSubmission', 'paymentMode paymentMethod paymentStatus submittedAt verifiedAt')
      .lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Strict customer ownership verification
    assertResourceOwnership(order, userId, 'Order', 'user');

    return this.serializeTrackingResponse(order);
  }

  /**
   * Serializes an order document into a customer-safe tracking response.
   * Strips internal notes, admin IDs, and sensitive operational data.
   * @param {object} order - Lean order document
   * @returns {object} Customer-safe tracking data
   */
  serializeTrackingResponse(order) {
    if (!order) return null;

    // Build customer-safe status timeline from real statusHistory
    const timeline = this.buildStatusTimeline(order.statusHistory || []);

    // Build delivery info — only include fields that actually have values
    const deliveryInfo = this.buildDeliveryInfo(order.deliveryInfo);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      productName: order.productName,
      marketplace: order.marketplace,
      quantity: order.quantity,

      // Current status
      currentStatus: order.currentStatus,
      currentStatusLabel: ORDER_STATUS_LABELS[order.currentStatus] || order.currentStatus,

      // Real status timeline
      timeline,

      // Delivery information (only when actually assigned)
      deliveryInfo,

      // Payment status summary
      payment: order.paymentSubmission ? {
        paymentMode: order.paymentSubmission.paymentMode,
        paymentMethod: order.paymentSubmission.paymentMethod,
        paymentStatus: order.paymentSubmission.paymentStatus,
        submittedAt: order.paymentSubmission.submittedAt,
        verifiedAt: order.paymentSubmission.verifiedAt,
      } : null,

      // Delivery address snapshot
      deliveryAddress: order.deliveryAddressSnapshot || null,

      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Builds customer-safe status timeline from real statusHistory entries.
   * Does NOT fabricate timestamps for future/uncompleted statuses.
   * @param {Array} statusHistory - Raw status history array
   * @returns {Array} Sorted, customer-safe timeline entries
   */
  buildStatusTimeline(statusHistory) {
    if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
      return [];
    }

    return statusHistory
      .map((entry) => ({
        status: entry.status,
        statusLabel: ORDER_STATUS_LABELS[entry.status] || entry.status,
        changedAt: entry.changedAt,
        // Only include customer-safe notes, strip internal operational notes
        note: entry.note && !entry.note.startsWith('[INTERNAL]') ? entry.note : null,
      }))
      .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
  }

  /**
   * Builds customer-safe delivery info.
   * Returns null if no real delivery data is available.
   * Never fabricates carrier names, tracking numbers, or ETAs.
   * @param {object} deliveryInfo - Raw delivery info object
   * @returns {object|null}
   */
  buildDeliveryInfo(deliveryInfo) {
    if (!deliveryInfo) return null;

    const hasAnyData = deliveryInfo.carrier ||
      deliveryInfo.trackingNumber ||
      deliveryInfo.estimatedDeliveryDate ||
      deliveryInfo.actualDeliveryDate;

    if (!hasAnyData) return null;

    return {
      carrier: deliveryInfo.carrier || null,
      trackingNumber: deliveryInfo.trackingNumber || null,
      estimatedDeliveryDate: deliveryInfo.estimatedDeliveryDate || null,
      actualDeliveryDate: deliveryInfo.actualDeliveryDate || null,
    };
  }

  /**
   * Public tracking lookup by order number only.
   * Limited information returned — no ownership check required but shows minimal data.
   * @param {string} orderNumber - Customer-facing order number
   * @returns {Promise<object>} Minimal public tracking data
   */
  async getPublicTrackingByOrderNumber(orderNumber) {
    if (!orderNumber || typeof orderNumber !== 'string') {
      throw new BadRequestError('Order number is required');
    }

    const cleanNumber = String(orderNumber).trim().toUpperCase();
    if (cleanNumber.length < 4 || cleanNumber.length > 30) {
      throw new BadRequestError('Invalid order number format');
    }

    const order = await Order.findOne({ orderNumber: cleanNumber })
      .select('orderNumber currentStatus statusHistory deliveryInfo createdAt')
      .lean();

    if (!order) {
      throw new NotFoundError('No order found with this order number');
    }

    // Public view — very limited data, no customer PII
    return {
      orderNumber: order.orderNumber,
      currentStatus: order.currentStatus,
      currentStatusLabel: ORDER_STATUS_LABELS[order.currentStatus] || order.currentStatus,
      timeline: this.buildStatusTimeline(order.statusHistory || []),
      deliveryInfo: this.buildDeliveryInfo(order.deliveryInfo),
      createdAt: order.createdAt,
    };
  }
}

export const trackingService = new TrackingService();
export default trackingService;
