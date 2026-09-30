import { BadRequestError } from '../utils/index.js';
import { PAYMENT_MODES, PAYMENT_METHODS } from '../constants/payment.constants.js';

/**
 * Validates checkout payment initialization payload.
 */
export function validateInitializePaymentInput(data = {}) {
  const { requestId, paymentMode, paymentMethod } = data;

  if (!requestId || typeof requestId !== 'string' || !requestId.trim()) {
    throw new BadRequestError('Valid product request ID is required for checkout');
  }

  if (!paymentMode || !Object.values(PAYMENT_MODES).includes(paymentMode)) {
    throw new BadRequestError(`Payment mode must be one of: ${Object.values(PAYMENT_MODES).join(', ')}`);
  }

  if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    throw new BadRequestError(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`);
  }

  return {
    requestId: requestId.trim(),
    paymentMode,
    paymentMethod,
  };
}

/**
 * Validates payment proof submission payload.
 * Enforces safe character set, minimum length, and rejects injection patterns.
 */
export function validateSubmitProofInput(data = {}, hasFile = false) {
  const { transactionCode } = data;

  if (!transactionCode && !hasFile) {
    throw new BadRequestError('Either transaction reference code or payment receipt screenshot must be provided');
  }

  if (transactionCode) {
    if (typeof transactionCode !== 'string') {
      throw new BadRequestError('Transaction code must be a string');
    }
    const trimmed = transactionCode.trim();
    if (trimmed.length < 4) {
      throw new BadRequestError('Transaction code must be at least 4 characters');
    }
    if (trimmed.length > 100) {
      throw new BadRequestError('Transaction code cannot exceed 100 characters');
    }
    // Only allow safe alphanumeric characters, dashes, underscores, and dots
    if (!/^[a-zA-Z0-9\-_./\s]+$/.test(trimmed)) {
      throw new BadRequestError('Transaction code contains invalid characters. Only letters, numbers, dashes, underscores, and dots are allowed.');
    }
    // Prevent HTML/script injection
    if (/[<>{}()'"`;]/.test(trimmed)) {
      throw new BadRequestError('Transaction code contains unsafe characters');
    }
    // Reject SQL injection patterns
    if (/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i.test(trimmed)) {
      throw new BadRequestError('Transaction code contains invalid content');
    }
  }

  return {
    transactionCode: transactionCode ? transactionCode.trim() : undefined,
  };
}
