/**
 * SajiloMarts Authoritative Payment Modes & Configurations
 */
export const PAYMENT_MODES = {
  FULL_ONLINE: 'online_100',
  COD_50_50: 'cod_50_50',
};

export const PAYMENT_METHOD_CONFIGS = {
  esewa: {
    id: 'esewa',
    name: 'eSewa Digital Wallet',
    mode: PAYMENT_MODES.FULL_ONLINE,
    feeRate: 0.18,
    feePercentage: 18,
    description: 'Instant full wallet prepayment via eSewa with 18% cross-border logistics fee.',
  },
  khalti: {
    id: 'khalti',
    name: 'Khalti Digital Wallet',
    mode: PAYMENT_MODES.FULL_ONLINE,
    feeRate: 0.18,
    feePercentage: 18,
    description: 'Full prepayment via Khalti digital wallet with 18% cross-border fee.',
  },
  mypay: {
    id: 'mypay',
    name: 'MyPay Mobile Wallet',
    mode: PAYMENT_MODES.FULL_ONLINE,
    feeRate: 0.18,
    feePercentage: 18,
    description: 'Full online prepayment via MyPay with 18% service fee.',
  },
  cod_50_50: {
    id: 'cod_50_50',
    name: '50% COD / 50% Pay',
    mode: PAYMENT_MODES.COD_50_50,
    feeRate: 0.22,
    feePercentage: 22,
    description: '50% paid online now, 50% cash on delivery upon Nepal doorstep arrival.',
  },
};

/**
 * Calculates authoritative payment breakdown strictly matching server formula:
 * Full Online: INR * 1.65 * 1.18 = final NPR (100% pay now, 0 COD)
 * 50% COD: INR * 1.65 * 1.22 = final NPR (50% pay now, 50% COD)
 */
export const calculateAuthoritativePaymentBreakdown = (unitPriceInr, quantity = 1, paymentMode = PAYMENT_MODES.FULL_ONLINE) => {
  const price = Number(unitPriceInr) || 0;
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const isCod = paymentMode === PAYMENT_MODES.COD_50_50 || paymentMode === 'cod';

  const sourceSubtotalInr = price * qty;
  const conversionMultiplier = 1.65;
  const convertedSubtotalNpr = Math.round(sourceSubtotalInr * conversionMultiplier);

  const feeRate = isCod ? 0.22 : 0.18;
  const multiplier = isCod ? 1.22 : 1.18;

  // Server exact arithmetic
  const finalAmountNpr = Math.round(sourceSubtotalInr * conversionMultiplier * multiplier);
  const amountPayableNowNpr = isCod ? Math.round(finalAmountNpr * 0.5) : finalAmountNpr;
  const remainingCodAmountNpr = isCod ? finalAmountNpr - amountPayableNowNpr : 0;

  return {
    sourceSubtotalInr,
    quantity: qty,
    conversionMultiplier,
    convertedSubtotalNpr,
    paymentMode: isCod ? PAYMENT_MODES.COD_50_50 : PAYMENT_MODES.FULL_ONLINE,
    isCod,
    feeRate,
    feePercentage: Math.round(feeRate * 100),
    finalAmountNpr,
    amountPayableNowNpr,
    remainingCodAmountNpr,
  };
};

/**
 * Normalizes payment breakdown from an existing request snapshot
 */
export const normalizePaymentBreakdown = (request, selectedMethodId) => {
  if (!request) return null;
  const mode = selectedMethodId === 'cod_50_50' || request.paymentMode === 'cod_50_50'
    ? PAYMENT_MODES.COD_50_50
    : PAYMENT_MODES.FULL_ONLINE;
  return calculateAuthoritativePaymentBreakdown(request.productPriceInr, request.quantity, mode);
};

export default {
  PAYMENT_MODES,
  PAYMENT_METHOD_CONFIGS,
  calculateAuthoritativePaymentBreakdown,
  normalizePaymentBreakdown,
};
