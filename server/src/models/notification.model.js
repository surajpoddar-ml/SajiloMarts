import mongoose from 'mongoose';

/**
 * SajiloMarts Customer Notification Model
 * Stores in-app notifications for order updates, payment events, and support messages.
 * Deduplication enforced via compound unique index on { user, type, eventKey }.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'order_created',
        'status_changed',
        'payment_submitted',
        'payment_verified',
        'payment_rejected',
        'support_message',
        'system',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    relatedSupport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportConversation',
      default: null,
    },
    // Unique event key for deduplication
    eventKey: {
      type: String,
      default: null,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'notifications',
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Efficient queries for user notifications
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

// Deduplication: prevent duplicate notifications for the same event
notificationSchema.index(
  { user: 1, type: 1, eventKey: 1 },
  {
    unique: true,
    partialFilterExpression: { eventKey: { $type: 'string' } },
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
