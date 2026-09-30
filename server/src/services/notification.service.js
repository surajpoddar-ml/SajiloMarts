import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { Notification } from '../models/notification.model.js';
import { BadRequestError } from '../utils/index.js';

/**
 * Notification Service
 * Creates, retrieves, and manages customer notifications.
 * Idempotent creation via eventKey deduplication.
 */
export class NotificationService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Creates a notification idempotently.
   * If eventKey is provided and a duplicate exists, silently returns the existing one.
   * @param {object} data - { user, type, title, message, relatedOrder?, relatedSupport?, eventKey? }
   * @returns {Promise<object>}
   */
  async createNotification(data = {}) {
    const { user, type, title, message, relatedOrder, relatedSupport, eventKey } = data;

    this.validateObjectId(user, 'User ID');

    if (!type || !title || !message) {
      throw new BadRequestError('Notification type, title, and message are required');
    }

    // Idempotent: if eventKey exists, check for duplicate
    if (eventKey) {
      const existing = await Notification.findOne({
        user,
        type,
        eventKey,
      }).lean();

      if (existing) {
        return existing; // Already created, skip
      }
    }

    try {
      const notification = await Notification.create({
        user,
        type,
        title: String(title).substring(0, 200),
        message: String(message).substring(0, 500),
        relatedOrder: relatedOrder || null,
        relatedSupport: relatedSupport || null,
        eventKey: eventKey || null,
        isRead: false,
      });

      return notification;
    } catch (err) {
      // Handle duplicate key error (concurrent inserts with same eventKey)
      if (err.code === 11000) {
        const existing = await Notification.findOne({ user, type, eventKey }).lean();
        return existing;
      }
      throw err;
    }
  }

  /**
   * Creates a notification for an order event.
   * @param {string} userId
   * @param {string} orderId
   * @param {string} eventType - 'order_created' | 'status_changed' etc.
   * @param {string} title
   * @param {string} message
   * @param {string} eventKey - Unique key for dedup
   */
  async notifyOrderEvent(userId, orderId, eventType, title, message, eventKey) {
    return this.createNotification({
      user: userId,
      type: eventType,
      title,
      message,
      relatedOrder: orderId,
      eventKey,
    });
  }

  /**
   * Creates a notification for a payment event.
   */
  async notifyPaymentEvent(userId, orderId, eventType, title, message, eventKey) {
    return this.createNotification({
      user: userId,
      type: eventType,
      title,
      message,
      relatedOrder: orderId,
      eventKey,
    });
  }

  /**
   * Creates a notification for a support message.
   */
  async notifySupportMessage(userId, conversationId, title, message, eventKey) {
    return this.createNotification({
      user: userId,
      type: 'support_message',
      title,
      message,
      relatedSupport: conversationId,
      eventKey,
    });
  }

  /**
   * Lists notifications for a user with pagination.
   * @param {string} userId
   * @param {object} options - { page, limit, unreadOnly }
   * @returns {Promise<object>}
   */
  async listNotifications(userId, options = {}) {
    this.validateObjectId(userId, 'User ID');

    const { page = 1, limit = 20, unreadOnly = false } = options;
    const query = { user: userId };

    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page: Math.max(1, parseInt(page, 10)),
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  /**
   * Gets unread count for a user.
   */
  async getUnreadCount(userId) {
    this.validateObjectId(userId, 'User ID');
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(userId, notificationId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(notificationId, 'Notification ID');

    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { isRead: true } },
      { new: true }
    ).lean();

    return result;
  }

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    this.validateObjectId(userId, 'User ID');

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return { modifiedCount: result.modifiedCount };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
