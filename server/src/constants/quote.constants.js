/**
 * Centralized Authoritative Exchange Rates and Pricing Surcharge Constants
 * STRICT BUSINESS RULE: 1 INR = 1.65 NPR
 */
export const EXCHANGE_RATE = 1.65;
export const ONLINE_SURCHARGE_RATE = 0.18;
export const COD_SURCHARGE_RATE = 0.22;
export const COD_SPLIT_RATIO = 0.5;

export const SOURCE_CURRENCY = 'INR';
export const DESTINATION_CURRENCY = 'NPR';

export const QUOTE_CONSTANTS = Object.freeze({
  EXCHANGE_RATE,
  ONLINE_SURCHARGE_RATE,
  COD_SURCHARGE_RATE,
  COD_SPLIT_RATIO,
  SOURCE_CURRENCY,
  DESTINATION_CURRENCY,
});

export default QUOTE_CONSTANTS;
