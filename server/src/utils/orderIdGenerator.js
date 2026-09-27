import crypto from 'crypto';

/**
 * Generates an authoritative, unpredictable, unique customer-facing Order ID.
 * Format: SM-YYYYMMDD-XXXXXX (e.g. SM-20260927-A8F3K9)
 * - Safe from enumeration attacks
 * - Embeds date for operational clarity
 * - Uses cryptographically secure random characters
 */
export function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SM-${dateStr}-${randomBytes}`;
}

/**
 * Generates a unique order number ensuring no collision with existing records.
 * @param {import('mongoose').Model} OrderModel
 * @param {number} maxAttempts
 * @returns {Promise<string>}
 */
export async function generateUniqueOrderNumber(OrderModel, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateOrderNumber();
    if (!OrderModel) return candidate;
    const existing = await OrderModel.exists({ orderNumber: candidate });
    if (!existing) {
      return candidate;
    }
  }
  // Fallback with extra random entropy
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const extraEntropy = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `SM-${dateStr}-${extraEntropy}`;
}

export default {
  generateOrderNumber,
  generateUniqueOrderNumber,
};
