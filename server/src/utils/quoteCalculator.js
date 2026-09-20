import {
  EXCHANGE_RATE,
  ONLINE_SURCHARGE_RATE,
  COD_SURCHARGE_RATE,
  COD_SPLIT_RATIO,
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

/**
 * Calculates financial quote for 50% COD / 50% Pay mode.
 * Formula:
 *   Converted NPR = INR Subtotal * 1.65
 *   Final NPR = Converted NPR * 1.22
 *   Pay Now = 50%, Remaining COD = 50%
 * @param {number} unitPriceInr - Product price in INR
 * @param {number} [quantity=1] - Product quantity
 * @returns {object} Calculated quote details
 */
export const calculateCodQuote = (unitPriceInr, quantity = 1) => {
  const cleanPrice = Number(unitPriceInr);
  const cleanQty = Math.max(1, Math.floor(Number(quantity) || 1));

  if (!cleanPrice || cleanPrice <= 0 || !Number.isFinite(cleanPrice)) {
    throw new Error('Invalid product price for COD quote calculation');
  }

  const sourceSubtotalInr = roundCurrency(cleanPrice * cleanQty);
  const convertedAmountNpr = roundCurrency(sourceSubtotalInr * EXCHANGE_RATE);
  const rateAmountNpr = roundCurrency(convertedAmountNpr * COD_SURCHARGE_RATE);
  const finalAmountNpr = roundCurrency(convertedAmountNpr + rateAmountNpr);
  const payNowAmountNpr = roundCurrency(finalAmountNpr * COD_SPLIT_RATIO);
  const remainingCodAmountNpr = roundCurrency(finalAmountNpr - payNowAmountNpr);

  return {
    sourceCurrency: SOURCE_CURRENCY,
    destinationCurrency: DESTINATION_CURRENCY,
    sourceUnitPriceInr: roundCurrency(cleanPrice),
    quantity: cleanQty,
    sourceSubtotalInr,
    exchangeRate: EXCHANGE_RATE,
    convertedAmountNpr,
    paymentMode: 'cod_50_50',
    appliedRate: COD_SURCHARGE_RATE,
    rateAmountNpr,
    finalAmountNpr,
    payNowAmountNpr,
    remainingCodAmountNpr,
    calculatedAt: new Date(),
  };
};


export default {
  calculateOnlineQuote,
  calculateCodQuote,
};

