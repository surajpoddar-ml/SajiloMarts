import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../constants/payment.constants.js';

/**
 * PaymentConfig Schema
 * Stores provider-specific QR code configuration for manual payment workflows.
 * Each provider (esewa, khalti, mypay) has exactly one configuration document.
 * Only admin-authorized operations can modify these configurations.
 */
const paymentConfigSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: [true, 'Payment provider is required'],
      enum: {
        values: Object.values(PAYMENT_METHODS),
        message: 'Invalid payment provider: {VALUE}',
      },
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // QR code image stored as base64 data URI or secure internal path
    qrImageData: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    // Provider-specific payment instructions displayed to customer
    instructions: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters'],
    },
    // Account holder name displayed below QR
    accountName: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [200, 'Account name cannot exceed 200 characters'],
    },
    // Account/wallet number
    accountNumber: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [50, 'Account number cannot exceed 50 characters'],
    },
    // Whether this payment method is currently active/available
    isActive: {
      type: Boolean,
      default: true,
    },
    // Admin who last configured this entry
    configuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'payment_configs',
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        // Never expose configuredBy admin details to non-admin callers
        return ret;
      },
    },
  }
);

// Ensure exactly one config per provider
paymentConfigSchema.index({ provider: 1 }, { unique: true });

export const PaymentConfig = mongoose.model('PaymentConfig', paymentConfigSchema);
export default PaymentConfig;
