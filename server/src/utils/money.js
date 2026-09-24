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

/**
 * Subtracts amounts with fixed decimal precision.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export const subtractMoney = (a, b) => {
  return roundCurrency((Number(a) || 0) - (Number(b) || 0));
};

/**
 * Splits an amount evenly into parts without loss of cents/paisa.
 * Guarantees sum(parts) === roundCurrency(amount).
 * @param {number} amount
 * @param {number} [parts=2]
 * @returns {number[]}
 */
export const splitMoneyEvenly = (amount, parts = 2) => {
  const roundedTotal = roundCurrency(amount);
  const basePart = roundCurrency(roundedTotal / parts);
  const remainder = roundCurrency(roundedTotal - (basePart * (parts - 1)));

  const result = new Array(parts).fill(basePart);
  result[result.length - 1] = remainder;
  return result;
};

/**
 * Converts major currency unit (e.g. NPR/INR) to integer minor units (paisa/cents).
 * @param {number} amount
 * @returns {number}
 */
export const toMinorUnits = (amount) => {
  return Math.round(roundCurrency(amount) * 100);
};

/**
 * Converts integer minor units (paisa/cents) to major currency units (NPR/INR).
 * @param {number} minorAmount
 * @returns {number}
 */
export const fromMinorUnits = (minorAmount) => {
  return roundCurrency((Number(minorAmount) || 0) / 100);
};

export default {
  roundCurrency,
  multiplyMoney,
  addMoney,
  subtractMoney,
  splitMoneyEvenly,
  toMinorUnits,
  fromMinorUnits,
};

