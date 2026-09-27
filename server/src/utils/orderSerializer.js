import { ORDER_STATUS_LABELS } from '../constants/order.constants.js';

/**
 * Shapes a raw Order document or object into a customer-safe view.
 * Strips internal notes, supplier details, internal system metadata, and private administrative data.
 * @param {object} order - Mongoose document or plain object
 * @returns {object} Sanitized, customer-safe order object
 */
export function serializeCustomerOrder(order) {
  if (!order || typeof order !== 'object') return null;

  const raw = typeof order.toObject === 'function' ? order.toObject() : { ...order };

  // Calculate clean status and label
  const currentStatus = raw.currentStatus || raw.status;
  const statusLabel = ORDER_STATUS_LABELS[currentStatus] || currentStatus;

  // Format payment info safely without internal secrets
  const payment = raw.paymentSubmission || {};
  const safePayment = payment && typeof payment === 'object' ? {
    paymentMode: payment.paymentMode || raw.paymentMode,
    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.paymentStatus,
    amountDueNpr: payment.amountDueNpr ?? raw.finalAmountNpr,
    amountPaidNpr: payment.amountPaidNpr ?? raw.amountPayableNow ?? 0,
    remainingAmountNpr: payment.remainingAmountNpr ?? raw.remainingCodAmount ?? 0,
    transactionCode: payment.transactionCode || null,
    submittedAt: payment.submittedAt || null,
    verifiedAt: payment.verifiedAt || null,
  } : null;

  // Format status history safely (strip internal operational notes if not customer safe)
  const safeStatusHistory = Array.isArray(raw.statusHistory)
    ? raw.statusHistory.map((entry) => ({
        status: entry.status,
        statusLabel: ORDER_STATUS_LABELS[entry.status] || entry.status,
        changedAt: entry.changedAt,
        note: entry.note || null,
      }))
    : [];

  return {
    _id: raw._id,
    id: raw._id,
    orderNumber: raw.orderNumber || (raw._id ? `SM-${String(raw._id).slice(-8).toUpperCase()}` : null),
    productName: raw.productName,
    productUrl: raw.productUrl,
    marketplace: raw.marketplace,
    quantity: raw.quantity,
    variant: raw.variant || null,
    customerNotes: raw.customerNotes || raw.notes || null,

    // Pricing & Financials
    productPriceInr: raw.productPriceInr,
    subtotalInr: raw.subtotalInr,
    conversionMultiplier: raw.conversionMultiplier,
    feeRate: raw.feeRate,
    convertedAmountNpr: raw.convertedAmountNpr,
    finalAmountNpr: raw.finalAmountNpr,
    paymentMode: raw.paymentMode,
    amountPayableNow: raw.amountPayableNow,
    remainingCodAmount: raw.remainingCodAmount,
    currency: raw.currency || 'NPR',

    // Snapshots
    quoteSnapshot: raw.quoteSnapshot || raw.quote || null,
    deliveryAddressSnapshot: raw.deliveryAddressSnapshot || raw.deliveryAddress || null,

    // Status & Tracking
    currentStatus,
    status: currentStatus,
    statusLabel,
    statusHistory: safeStatusHistory,
    deliveryInfo: raw.deliveryInfo || null,

    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export default {
  serializeCustomerOrder,
};
