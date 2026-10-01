/**
 * Payment Modes, Methods, and Lifecycle Status Constants
 *
 * Reviewed: Prompt 23 — Payment Integrations & Reconciliation
 * These constants are the single source of truth for all payment enums.
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

/**
 * Full payment lifecycle statuses.
 * Original statuses preserved; provider-related statuses added for real integrations.
 */
export const PAYMENT_STATUSES = Object.freeze({
  PENDING: 'pending',
  INITIATED: 'initiated',
  PROOF_SUBMITTED: 'proof_submitted',
  UNDER_REVIEW: 'under_review',
  PROVIDER_PENDING: 'provider_pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

/**
 * Verification sources — distinguishes how a payment was confirmed.
 */
export const VERIFICATION_SOURCES = Object.freeze({
  PROVIDER_API: 'provider_api',
  PROVIDER_CALLBACK: 'provider_callback',
  MANUAL_ADMIN: 'manual_admin',
  SYSTEM: 'system',
});

export default {
  PAYMENT_MODES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  VERIFICATION_SOURCES,
};
