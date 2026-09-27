/**
 * SajiloMarts 7-Stage Fulfillment Order Status Stages
 */
export const FULFILLMENT_STAGES = [
  { key: 'order_received', label: 'Order Received', icon: '📝', description: 'Order created & payment verified' },
  { key: 'sourcing', label: 'Sourcing', icon: '🔍', description: 'Procuring from Indian merchant' },
  { key: 'purchased', label: 'Purchased', icon: '🛍️', description: 'Item purchased in India warehouse' },
  { key: 'in_transit', label: 'In Transit', icon: '✈️', description: 'Cross-border transport India → Nepal' },
  { key: 'arrived_in_nepal', label: 'Arrived in Nepal', icon: '🏢', description: 'Customs cleared & at KTM hub' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', description: 'Dispatched for local doorstep delivery' },
  { key: 'delivered', label: 'Delivered', icon: '📦', description: 'Successfully handed over to recipient' },
];

export default {
  FULFILLMENT_STAGES,
};
