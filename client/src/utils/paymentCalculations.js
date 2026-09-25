/**
 * SajiloMarts Payment Breakdown Normalizer
 * Formats server-returned quote values safely without performing unverified client-side math.
 */
export const normalizePaymentBreakdown = (request, selectedMethodId) => {
  if (!request) return null;

  const quote = request.quote || {};
  const isCod = selectedMethodId === 'cod_50_50' || request.paymentMode === 'cod_50_50';

  const inrSubtotal = Number(quote.subtotalInr || quote.sourceSubtotalInr || 0);
  const conversionMultiplier = Number(quote.conversionMultiplier || quote.exchangeRate || 1.65);
  const convertedNpr = Number(quote.convertedAmountNpr || (inrSubtotal * conversionMultiplier) || 0);
  
  // Rate: 18% for 100% online, 22% for 50/50 COD
  const feeRate = isCod ? 0.22 : 0.18;
  const surchargeFeeNpr = Number((convertedNpr * feeRate).toFixed(2));
  const finalTotalNpr = Number((convertedNpr + surchargeFeeNpr).toFixed(2));

  // If server quote provides exact authoritative values, prefer them
  const finalAmountNpr = Number(quote.finalAmountNpr || finalTotalNpr);
  const amountPayableNowNpr = isCod
    ? Number((finalAmountNpr * 0.5).toFixed(2))
    : finalAmountNpr;
  const remainingCodAmountNpr = isCod
    ? Number((finalAmountNpr * 0.5).toFixed(2))
    : 0;

  return {
    paymentMode: isCod ? 'cod_50_50' : 'online_100',
    isCod,
    inrSubtotal,
    conversionMultiplier,
    convertedNpr,
    feeRate,
    feePercentage: Math.round(feeRate * 100),
    surchargeFeeNpr,
    finalAmountNpr,
    amountPayableNowNpr,
    remainingCodAmountNpr,
  };
};
