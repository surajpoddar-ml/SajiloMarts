import mongoose from 'mongoose';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../constants/order.constants.js';

/**
 * Delivery Address Snapshot Schema (Immutable point-in-time address)
 */
export const deliveryAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    label: { type: String, default: 'Home', trim: true },
    tole: { type: String, required: true, trim: true },
    wardNumber: { type: Number, required: true },
    municipality: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    country: { type: String, default: 'Nepal', trim: true },
    landmark: { type: String, default: null, trim: true },
  },
  { _id: false }
);

/**
 * Status History Entry Schema
 */
export const orderStatusHistorySchema = new mongoose.Schema(
  {
    previousStatus: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: { type: String, default: null, trim: true, maxlength: 500 },
  },
  { _id: false }
);

/**
 * Order Schema
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order Number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      immutable: [true, 'Order ownership cannot be reassigned'],
      index: true,
    },
    productRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductRequest',
      required: [true, 'Product request reference is required'],
      unique: true,
      index: true,
    },
    paymentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentSubmission',
      required: [true, 'Payment submission reference is required'],
      index: true,
    },

    // Product Snapshot
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    productUrl: {
      type: String,
      required: [true, 'Product URL is required'],
      trim: true,
    },
    marketplace: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      type: String,
      default: null,
      trim: true,
    },
    customerNotes: {
      type: String,
      default: null,
      trim: true,
    },

    // Financial & Authoritative Pricing Snapshot
    productPriceInr: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotalInr: {
      type: Number,
      required: true,
      min: 0,
    },
    conversionMultiplier: {
      type: Number,
      required: true,
      default: 1.65,
    },
    feeRate: {
      type: Number,
      required: true,
      default: 0.12,
    },
    convertedAmountNpr: {
      type: Number,
      required: true,
      min: 0,
    },
    finalAmountNpr: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['online_100', 'cod_50_50', 'online_full'],
      required: true,
    },
    amountPayableNow: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingCodAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NPR',
      trim: true,
      uppercase: true,
    },

    // Delivery Address Immutable Snapshot
    deliveryAddressSnapshot: {
      type: deliveryAddressSnapshotSchema,
      required: [true, 'Delivery address snapshot is required'],
    },

    // Lifecycle Status & Tracking
    currentStatus: {
      type: String,
      enum: {
        values: Object.values(ORDER_STATUSES),
        message: 'Invalid order status: {VALUE}',
      },
      default: ORDER_STATUSES.ORDER_RECEIVED,
      required: true,
      index: true,
    },
    statusHistory: {
      type: [orderStatusHistorySchema],
      default: () => [
        {
          previousStatus: null,
          status: ORDER_STATUSES.ORDER_RECEIVED,
          changedAt: new Date(),
          note: 'Order created and initial payment verified.',
        },
      ],
    },

    // Carrier and Delivery Metadata (populated only when actually assigned)
    deliveryInfo: {
      carrier: { type: String, default: null, trim: true },
      trackingNumber: { type: String, default: null, trim: true },
      estimatedDeliveryDate: { type: Date, default: null },
      actualDeliveryDate: { type: Date, default: null },
    },

    // Administrative & Security
    internalNotes: {
      type: String,
      default: null,
      trim: true,
      select: false,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'orders',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        if (!_doc.$locals?.isAdmin) {
          delete ret.internalNotes;
        }
        ret.statusLabel = ORDER_STATUS_LABELS[ret.currentStatus] || ret.currentStatus;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        if (!_doc.$locals?.isAdmin) {
          delete ret.internalNotes;
        }
        ret.statusLabel = ORDER_STATUS_LABELS[ret.currentStatus] || ret.currentStatus;
        return ret;
      },
    },
  }
);

// Composite indexes for fast customer queries
orderSchema.index({ user: 1, currentStatus: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

/**
 * Checks whether the given user ID matches the order owner
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {boolean}
 */
orderSchema.methods.isOwnedBy = function (userId) {
  if (!userId || !this.user) return false;
  return this.user.toString() === userId.toString();
};

export const Order = mongoose.model('Order', orderSchema);
export default Order;

