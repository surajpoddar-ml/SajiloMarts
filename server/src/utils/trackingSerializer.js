import { ORDER_STATUS_LABELS } from '../constants/order.constants.js';

/**
 * Serializes raw order data into a customer-safe tracking response.
 * Strips internal notes, admin user IDs, and internal system metadata.
 * @param {object} order - Raw order document or lean object
 * @returns {object|null} Customer-safe tracking data
 */
export function serializeTrackingResponse(order) {
  if (!order || typeof order !== 'object') return null;

  const raw = typeof order.toObject === 'function' ? order.toObject() : { ...order };

  // Build customer-safe timeline from real statusHistory
  const timeline = buildSafeTimeline(raw.statusHistory || []);

  // Build delivery info only when real data is available
  const deliveryInfo = buildSafeDeliveryInfo(raw.deliveryInfo);

  return {
    orderId: raw._id,
    orderNumber: raw.orderNumber,
    productName: raw.productName,
    marketplace: raw.marketplace,
    quantity: raw.quantity,
    currentStatus: raw.currentStatus,
    currentStatusLabel: ORDER_STATUS_LABELS[raw.currentStatus] || raw.currentStatus,
    timeline,
    deliveryInfo,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Builds a customer-safe timeline from real status history entries.
 * Does NOT fabricate timestamps for future/uncompleted statuses.
 * @param {Array} statusHistory
 * @returns {Array}
 */
export function buildSafeTimeline(statusHistory) {
  if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
    return [];
  }

  return statusHistory
    .map((entry) => ({
      status: entry.status,
      statusLabel: ORDER_STATUS_LABELS[entry.status] || entry.status,
      changedAt: entry.changedAt,
      note: entry.note && !String(entry.note).startsWith('[INTERNAL]') ? entry.note : null,
    }))
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

/**
 * Builds customer-safe delivery info.
 * Returns null if no real data is available. Never fabricates.
 * @param {object} deliveryInfo
 * @returns {object|null}
 */
export function buildSafeDeliveryInfo(deliveryInfo) {
  if (!deliveryInfo) return null;

  const hasData = deliveryInfo.carrier ||
    deliveryInfo.trackingNumber ||
    deliveryInfo.estimatedDeliveryDate ||
    deliveryInfo.actualDeliveryDate;

  if (!hasData) return null;

  return {
    carrier: deliveryInfo.carrier || null,
    trackingNumber: deliveryInfo.trackingNumber || null,
    estimatedDeliveryDate: deliveryInfo.estimatedDeliveryDate || null,
    actualDeliveryDate: deliveryInfo.actualDeliveryDate || null,
  };
}

export default {
  serializeTrackingResponse,
  buildSafeTimeline,
  buildSafeDeliveryInfo,
};
