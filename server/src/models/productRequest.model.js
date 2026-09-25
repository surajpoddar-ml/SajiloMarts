import mongoose from 'mongoose';

export const SUPPORTED_MARKETPLACES = Object.freeze([
  'amazon-india',
  'flipkart',
  'myntra',
  'meesho',
  'nykaa',
  'tata-1mg',
  'ajio',
  'other',
]);

/**
 * Authoritative Sourcing Request Lifecycle Statuses
 */
export const REQUEST_STATUSES = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  QUOTE_READY: 'quote_ready',
  QUOTED: 'quoted', // Alias for quote_ready for backward compatibility
  CUSTOMER_CONFIRMED: 'customer_confirmed',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_SUBMITTED: 'payment_submitted',
  PAYMENT_UNDER_REVIEW: 'payment_under_review',
  PAYMENT_VERIFIED: 'payment_verified',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
});

export const PRODUCT_URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

export const quoteSnapshotSchema = new mongoose.Schema(
  {
    sourceCurrency: { type: String, default: 'INR', required: true },
    destinationCurrency: { type: String, default: 'NPR', required: true },
    currency: { type: String, default: 'NPR' },
    productPriceInr: { type: Number },
    sourceUnitPriceInr: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotalInr: { type: Number },
    sourceSubtotalInr: { type: Number, required: true },
    conversionMultiplier: { type: Number, default: 1.65 },
    exchangeRate: { type: Number, required: true },
    convertedAmountNpr: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ['online_100', 'cod_50_50', 'online_full'],
      required: true,
    },
    feeRate: { type: Number },
    appliedRate: { type: Number, required: true },
    rateAmountNpr: { type: Number, required: true },
    finalAmountNpr: { type: Number, required: true },
    amountPayableNow: { type: Number },
    payNowAmountNpr: { type: Number, required: true },
    remainingCodAmount: { type: Number, default: 0 },
    remainingCodAmountNpr: { type: Number, required: true, default: 0 },
    calculatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    quoteStatus: {
      type: String,
      enum: ['pending', 'ready', 'accepted', 'rejected', 'expired'],
      default: 'ready',
    },
  },
  { _id: false }
);

const productRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      immutable: [true, 'Request ownership cannot be reassigned'],
      index: true,
    },
    productUrl: {
      type: String,
      required: [true, 'Product URL is required'],
      trim: true,
      maxlength: [2000, 'Product URL cannot exceed 2000 characters'],
      validate: {
        validator: function (url) {
          if (!url || typeof url !== 'string') return false;
          if (!PRODUCT_URL_REGEX.test(url)) return false;
          try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Product URL must be a valid absolute HTTP or HTTPS URL',
      },
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    marketplace: {
      type: String,
      required: [true, 'Marketplace is required'],
      enum: {
        values: SUPPORTED_MARKETPLACES,
        message: 'Invalid marketplace specified',
      },
      default: 'other',
      trim: true,
      lowercase: true,
    },
    productPriceInr: {
      type: Number,
      required: [true, 'Indian product price in INR is required'],
      min: [0.01, 'Product price must be greater than zero'],
      validate: {
        validator: (val) => typeof val === 'number' && Number.isFinite(val) && val > 0,
        message: 'Product price must be a valid positive number',
      },
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a positive whole integer',
      },
    },
    variant: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [100, 'Variant description cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [1000, 'Customer notes cannot exceed 1000 characters'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(REQUEST_STATUSES),
        message: 'Invalid request status',
      },
      default: REQUEST_STATUSES.SUBMITTED,
      required: true,
      index: true,
    },
    quote: {
      type: quoteSnapshotSchema,
      required: false,
      default: null,
    },
    paymentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentSubmission',
      required: false,
      default: null,
    },
    internalNotes: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
      select: false,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'product_requests',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        if (!_doc.$locals?.isAdmin) {
          delete ret.internalNotes;
        }
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
        return ret;
      },
    },
  }
);

export const ProductRequest = mongoose.model('ProductRequest', productRequestSchema);
export default ProductRequest;
