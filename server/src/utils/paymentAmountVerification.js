/**
 * Authoritative Payment Amount Verification Utilities
 *
 * The backend is the sole authority for payable amounts. These utilities
 * ensure that provider-reported amounts match server-calculated expectations.
 */

/**
 * Compares two monetary amounts with tolerance for floating-point imprecision.
 * @param {number} expected - Server-authoritative expected amount
 * @param {number} actual - Provider-reported actual amount
 * @param {number} [toleranceNpr=0.01] - Maximum acceptable difference in NPR
 * @returns {boolean}
 */
export const amountsMatch = (expected, actual, toleranceNpr = 0.01) => {
  if (typeof expected !== 'number' || typeof actual !== 'number') return false;
  if (!Number.isFinite(expected) || !Number.isFinite(actual)) return false;
  return Math.abs(expected - actual) <= toleranceNpr;
};

/**
 * Validates that a provider amount matches the server-authoritative amount.
 * Returns a detailed result object for audit logging.
 *
 * @param {number} expectedAmountNpr - Server-computed amount due
 * @param {number} providerAmountNpr - Amount reported by the payment provider
 * @param {string} currency - Expected currency (must be 'NPR')
 * @returns {object} - { valid, expectedAmount, providerAmount, difference, currency }
 */
export const validatePaymentAmount = (expectedAmountNpr, providerAmountNpr, currency = 'NPR') => {
  const expected = Number(expectedAmountNpr);
  const actual = Number(providerAmountNpr);

  if (currency !== 'NPR') {
    return {
      valid: false,
      reason: `Currency mismatch: expected NPR, got ${currency}`,
      expectedAmount: expected,
      providerAmount: actual,
      difference: 0,
      currency,
    };
  }

  if (!Number.isFinite(expected) || expected <= 0) {
    return {
      valid: false,
      reason: 'Invalid expected amount',
      expectedAmount: expected,
      providerAmount: actual,
      difference: 0,
      currency,
    };
  }

  if (!Number.isFinite(actual) || actual <= 0) {
    return {
      valid: false,
      reason: 'Provider reported invalid or zero amount',
      expectedAmount: expected,
      providerAmount: actual,
      difference: expected,
      currency,
    };
  }

  const difference = Math.abs(expected - actual);
  const matches = amountsMatch(expected, actual);

  return {
    valid: matches,
    reason: matches ? 'Amounts match' : `Amount mismatch: expected ${expected} NPR, got ${actual} NPR (diff: ${difference.toFixed(2)})`,
    expectedAmount: expected,
    providerAmount: actual,
    difference: Number(difference.toFixed(2)),
    currency,
  };
};

/**
 * Validates that a payment amount is positive, finite, and within acceptable bounds.
 * @param {number} amount - Amount to validate
 * @param {string} [label='Amount'] - Label for error messages
 * @returns {{ valid: boolean, amount: number, error?: string }}
 */
export const validateAmountBounds = (amount, label = 'Amount') => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return { valid: false, amount: num, error: `${label} must be a positive number` };
  }
  if (num > 10000000) {
    return { valid: false, amount: num, error: `${label} exceeds maximum allowed value` };
  }
  return { valid: true, amount: num };
};

export default {
  amountsMatch,
  validatePaymentAmount,
  validateAmountBounds,
};
