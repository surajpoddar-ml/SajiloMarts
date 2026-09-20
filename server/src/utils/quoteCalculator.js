import {
  EXCHANGE_RATE,
  ONLINE_SURCHARGE_RATE,
  SOURCE_CURRENCY,
  DESTINATION_CURRENCY,
} from '../constants/quote.constants.js';
import { roundCurrency } from './money.js';

/**
 * Calculates financial quote for 100% Online Payment mode.
 * Formula:
 *   Converted NPR = INR Subtotal * 1.65
 *   Final NPR = Converted NPR * 1.18
 *   Pay Now = Final NPR, Remaining COD = 0
 * @param {number} unitPriceInr - Product price in INR
 * @param {number} [quantity=1] - Product quantity
 * @returns {object} Calculated quote details
 */
export const calculateOnlineQuote = (unitPriceInr, quantity = 1) => {
  const cleanPrice = Number(unitPriceInr);
  const cleanQty = Math.max(1, Math.floor(Number(quantity) || 1));

  if (!cleanPrice || cleanPrice <= 0 || !Number.isFinite(cleanPrice)) {
    throw new Error('Invalid product price for online quote calculation');
  }

  const sourceSubtotalInr = roundCurrency(cleanPrice * cleanQty);
  const convertedAmountNpr = roundCurrency(sourceSubtotalInr * EXCHANGE_RATE);
  const rateAmountNpr = roundCurrency(convertedAmountNpr * ONLINE_SURCHARGE_RATE);
  const finalAmountNpr = roundCurrency(convertedAmountNpr + rateAmountNpr);
  const payNowAmountNpr = finalAmountNpr;
  const remainingCodAmountNpr = 0;

  return {
    sourceCurrency: SOURCE_CURRENCY,
    destinationCurrency: DESTINATION_CURRENCY,
    sourceUnitPriceInr: roundCurrency(cleanPrice),
    quantity: cleanQty,
    sourceSubtotalInr,
    exchangeRate: EXCHANGE_RATE,
    convertedAmountNpr,
    paymentMode: 'online_100',
    appliedRate: ONLINE_SURCHARGE_RATE,
    rateAmountNpr,
    finalAmountNpr,
    payNowAmountNpr,
    remainingCodAmountNpr,
    calculatedAt: new Date(),
  };
};

export default {
  calculateOnlineQuote,
};
