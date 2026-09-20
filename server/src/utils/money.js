/**
 * Monetary and Financial Precision Utilities
 * Guarantees deterministic 2-decimal arithmetic and avoids floating point drift.
 */

/**
 * Rounds a number to exactly two decimal places using standard commercial half-up rounding.
 * @param {number} amount
 * @returns {number}
 */
export const roundCurrency = (amount) => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 0;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Multiplies amounts with fixed decimal precision.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export const multiplyMoney = (a, b) => {
  return roundCurrency(a * b);
};

/**
 * Sums amounts with fixed decimal precision.
 * @param  {...number} amounts
 * @returns {number}
 */
export const addMoney = (...amounts) => {
  const sum = amounts.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  return roundCurrency(sum);
};

export default {
  roundCurrency,
  multiplyMoney,
  addMoney,
};
