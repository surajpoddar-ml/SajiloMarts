import { BaseService } from './base.service.js';
import {
  calculateOnlineQuote,
  calculateCodQuote,
} from '../utils/quoteCalculator.js';
import { BadRequestError } from '../utils/index.js';

/**
 * Authoritative Quote Calculation Service
 * Enforces server-side 1 INR = 1.65 NPR rate, 18% online fee, 22% COD fee, and 50/50 split.
 */
export class QuoteService extends BaseService {
  /**
   * Calculates financial quote for a given price, quantity, and payment mode.
   * @param {number} unitPriceInr - Product price in INR
   * @param {number} [quantity=1] - Quantity
   * @param {string} [paymentMode='online_100'] - 'online_100' or 'cod_50_50'
   * @returns {object} Calculated quote object
   */
  calculateQuote(unitPriceInr, quantity = 1, paymentMode = 'online_100') {
    const cleanPrice = Number(unitPriceInr);
    const cleanQty = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!cleanPrice || cleanPrice <= 0 || !Number.isFinite(cleanPrice)) {
      throw new BadRequestError('Invalid product price in INR');
    }

    if (paymentMode === 'online_100') {
      return calculateOnlineQuote(cleanPrice, cleanQty);
    } else if (paymentMode === 'cod_50_50') {
      return calculateCodQuote(cleanPrice, cleanQty);
    } else {
      throw new BadRequestError(`Unsupported payment mode: ${paymentMode}. Must be 'online_100' or 'cod_50_50'`);
    }
  }

  /**
   * Convenience wrapper for 100% online quote.
   */
  calculateOnlineQuote(unitPriceInr, quantity = 1) {
    return this.calculateQuote(unitPriceInr, quantity, 'online_100');
  }

  /**
   * Convenience wrapper for 50% COD / 50% Pay quote.
   */
  calculateCodQuote(unitPriceInr, quantity = 1) {
    return this.calculateQuote(unitPriceInr, quantity, 'cod_50_50');
  }

  /**
   * Creates an immutable quote snapshot payload for persistence.
   */
  createQuoteSnapshot(unitPriceInr, quantity = 1, paymentMode = 'online_100') {
    return this.calculateQuote(unitPriceInr, quantity, paymentMode);
  }
}

export const quoteService = new QuoteService();
export default quoteService;
