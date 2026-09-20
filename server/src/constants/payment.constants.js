/**
 * Payment Modes, Methods, and Lifecycle Status Constants
 */
export const PAYMENT_MODES = Object.freeze({
  ONLINE_100: 'online_100',
  COD_50_50: 'cod_50_50',
});

export const PAYMENT_METHODS = Object.freeze({
  ESEWA: 'esewa',
  KHALTI: 'khalti',
  MYPAY: 'mypay',
});

export const PAYMENT_STATUSES = Object.freeze({
  PENDING: 'pending',
  PROOF_SUBMITTED: 'proof_submitted',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

export default {
  PAYMENT_MODES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
};
