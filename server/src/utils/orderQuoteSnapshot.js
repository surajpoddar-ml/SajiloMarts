import { BadRequestError } from './badRequestError.js';

/**
 * Validates and extracts an authoritative quote snapshot from a ProductRequest.
 * Enforces that financial calculation is server-bound and cannot be client-manipulated.
 * @param {object} quote - Quote subdocument from ProductRequest
 * @returns {object} Authoritative sanitized quote snapshot
 */
export function extractAuthoritativeQuoteSnapshot(quote) {
  if (!quote || typeof quote !== 'object') {
    throw new BadRequestError('A valid authoritative quote is required to generate an order');
  }

  const finalAmountNpr = Number(quote.finalAmountNpr);
  const payNowAmountNpr = Number(quote.payNowAmountNpr || quote.amountPayableNow);
  const remainingCodAmountNpr = Number(quote.remainingCodAmountNpr ?? quote.remainingCodAmount ?? 0);
  const conversionMultiplier = Number(quote.conversionMultiplier || quote.exchangeRate || 1.65);
  const feeRate = Number(quote.feeRate || quote.appliedRate || 0.12);
  const convertedAmountNpr = Number(quote.convertedAmountNpr || (finalAmountNpr - (quote.rateAmountNpr || 0)));

  if (!Number.isFinite(finalAmountNpr) || finalAmountNpr <= 0) {
    throw new BadRequestError('Invalid or zero final amount in authoritative quote');
  }

  if (!Number.isFinite(payNowAmountNpr) || payNowAmountNpr <= 0) {
    throw new BadRequestError('Invalid or zero payable advance amount in authoritative quote');
  }

  return Object.freeze({
    sourceCurrency: String(quote.sourceCurrency || 'INR').toUpperCase(),
    destinationCurrency: String(quote.destinationCurrency || 'NPR').toUpperCase(),
    productPriceInr: Number(quote.productPriceInr || quote.sourceUnitPriceInr || 0),
    quantity: Number(quote.quantity || 1),
    subtotalInr: Number(quote.subtotalInr || quote.sourceSubtotalInr || 0),
    conversionMultiplier,
    exchangeRate: Number(quote.exchangeRate || conversionMultiplier),
    convertedAmountNpr,
    paymentMode: quote.paymentMode || 'online_100',
    feeRate,
    appliedRate: Number(quote.appliedRate || feeRate),
    rateAmountNpr: Number(quote.rateAmountNpr || 0),
    finalAmountNpr,
    payNowAmountNpr,
    remainingCodAmountNpr,
    calculatedAt: quote.calculatedAt || new Date(),
  });
}

export default {
  extractAuthoritativeQuoteSnapshot,
};
