/**
 * Authoritative Order Fulfillment Lifecycle Statuses and Constants
 * SajiloMarts: "Shop from India. We Deliver to Nepal."
 */
export const ORDER_STATUSES = Object.freeze({
  ORDER_RECEIVED: 'order_received',
  SOURCING: 'sourcing',
  PURCHASED: 'purchased',
  IN_TRANSIT: 'in_transit',
  ARRIVED_IN_NEPAL: 'arrived_in_nepal',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
});

/**
 * Exact Human-Readable Customer-Facing Labels
 */
export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUSES.ORDER_RECEIVED]: 'Order Received',
  [ORDER_STATUSES.SOURCING]: 'Sourcing',
  [ORDER_STATUSES.PURCHASED]: 'Purchased',
  [ORDER_STATUSES.IN_TRANSIT]: 'In Transit',
  [ORDER_STATUSES.ARRIVED_IN_NEPAL]: 'Arrived in Nepal',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
  [ORDER_STATUSES.REFUNDED]: 'Refunded',
});

export const ACTIVE_FULFILLMENT_STATUSES = Object.freeze([
  ORDER_STATUSES.ORDER_RECEIVED,
  ORDER_STATUSES.SOURCING,
  ORDER_STATUSES.PURCHASED,
  ORDER_STATUSES.IN_TRANSIT,
  ORDER_STATUSES.ARRIVED_IN_NEPAL,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
]);

/**
 * Explicit Valid Order Status Transitions
 * Normal progression: Order Received -> Sourcing -> Purchased -> In Transit -> Arrived in Nepal -> Out for Delivery -> Delivered
 */
export const VALID_ORDER_TRANSITIONS = Object.freeze({
  [ORDER_STATUSES.ORDER_RECEIVED]: [
    ORDER_STATUSES.SOURCING,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.SOURCING]: [
    ORDER_STATUSES.PURCHASED,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.PURCHASED]: [
    ORDER_STATUSES.IN_TRANSIT,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.IN_TRANSIT]: [
    ORDER_STATUSES.ARRIVED_IN_NEPAL,
  ],
  [ORDER_STATUSES.ARRIVED_IN_NEPAL]: [
    ORDER_STATUSES.OUT_FOR_DELIVERY,
  ],
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: [
    ORDER_STATUSES.DELIVERED,
  ],
  [ORDER_STATUSES.DELIVERED]: [], // Terminal state
  [ORDER_STATUSES.CANCELLED]: [
    ORDER_STATUSES.REFUNDED,
  ],
  [ORDER_STATUSES.REFUNDED]: [], // Terminal state
});

/**
 * Validates whether a transition from one status to another is permitted.
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
export function canTransitionOrderStatus(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return false;
  const allowed = VALID_ORDER_TRANSITIONS[currentStatus];
  if (!Array.isArray(allowed)) return false;
  return allowed.includes(targetStatus);
}

export default {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ACTIVE_FULFILLMENT_STATUSES,
  HISTORICAL_FULFILLMENT_STATUSES,
  VALID_ORDER_TRANSITIONS,
  isValidOrderStatus,
  isHistoricalOrderStatus,
  isActiveOrderStatus,
  canTransitionOrderStatus,
};


