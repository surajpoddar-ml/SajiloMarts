import mongoose from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUSES, VERIFICATION_SOURCES } from '../constants/payment.constants.js';

/**
 * PaymentReconciliation Model
 * Records the authoritative reconciliation of each payment verification attempt.
 * Links internal payment records to provider-reported data for audit and dispute resolution.
 *
 * Sensitive provider metadata is stripped from customer-facing responses.
 */
const paymentReconciliationSchema = new mongoose.Schema(
  {
    paymentSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentSubmission',
      required: [true, 'Payment submission reference is required'],
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_METHODS),
        message: 'Invalid payment provider',
      },
      required: [true, 'Payment provider is required'],
    },
    providerRefId: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    providerPaymentId: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    expectedAmountNpr: {
      type: Number,
      required: [true, 'Expected amount is required'],
      min: [0, 'Expected amount cannot be negative'],
    },
    receivedAmountNpr: {
      type: Number,
      required: false,
      default: 0,
      min: [0, 'Received amount cannot be negative'],
    },
    amountMatches: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'NPR',
      trim: true,
    },
    reconciliationStatus: {
      type: String,
      enum: ['matched', 'mismatched', 'pending', 'failed', 'manual_review'],
      default: 'pending',
      index: true,
    },
    verificationSource: {
      type: String,
      enum: Object.values(VERIFICATION_SOURCES),
      required: false,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    providerStatus: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    // Provider raw response (safe subset — never includes secrets)
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'payment_reconciliations',
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        // Strip provider raw response from customer-facing serialization
        delete ret.providerResponse;
        return ret;
      },
    },
  }
);

paymentReconciliationSchema.index({ paymentSubmission: 1, createdAt: -1 });
paymentReconciliationSchema.index({ reconciliationStatus: 1, createdAt: -1 });
paymentReconciliationSchema.index({ provider: 1, providerRefId: 1 });

export const PaymentReconciliation = mongoose.model('PaymentReconciliation', paymentReconciliationSchema);
export default PaymentReconciliation;
