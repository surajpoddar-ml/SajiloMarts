import mongoose from 'mongoose';
import { PAYMENT_MODES, PAYMENT_METHODS } from '../constants/payment.constants.js';

const paymentSubmissionSchema = new mongoose.Schema(
  {
    productRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductRequest',
      required: [true, 'ProductRequest ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      immutable: [true, 'Payment ownership cannot be reassigned'],
      index: true,
    },
    paymentMode: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_MODES),
        message: 'Invalid payment mode',
      },
      required: [true, 'Payment mode is required'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PAYMENT_METHODS),
        message: 'Invalid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    amountDueNpr: {
      type: Number,
      required: [true, 'Amount due in NPR is required'],
      min: [0, 'Amount due cannot be negative'],
    },
    amountPaidNpr: {
      type: Number,
      required: [true, 'Amount paid in NPR is required'],
      min: [0, 'Amount paid cannot be negative'],
    },
    remainingAmountNpr: {
      type: Number,
      default: 0,
      min: [0, 'Remaining amount cannot be negative'],
    },
    transactionCode: {
      type: String,
      required: false,
      default: null,
      trim: true,
      maxlength: [100, 'Transaction code cannot exceed 100 characters'],
    },
    paymentProof: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: 'payment_submissions',
  }
);

export const PaymentSubmission = mongoose.model('PaymentSubmission', paymentSubmissionSchema);
export default PaymentSubmission;
