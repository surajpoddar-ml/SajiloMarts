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
    if (trimmed.length < 3 || trimmed.length > 100) {
      throw new BadRequestError('Transaction code must be between 3 and 100 characters');
    }
    // Prevent malicious scripts / tags in transaction codes
    if (/[<>{}]/.test(trimmed)) {
      throw new BadRequestError('Transaction code contains invalid characters');
    }
  }

  return {
    transactionCode: transactionCode ? transactionCode.trim() : undefined,
  };
}
