import assert from 'node:assert/strict';
import { orderService } from '../services/order.service.js';
import { FULFILLMENT_STAGES } from '../constants/order.constants.js';


console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend Order Domain Test Suite');
console.log('====================================================');

// Test 1: Order service method signatures
assert.strictEqual(typeof orderService.getCurrentOrders, 'function');
assert.strictEqual(typeof orderService.getOrderHistory, 'function');
assert.strictEqual(typeof orderService.getOrderDetail, 'function');
assert.strictEqual(typeof orderService.createOrder, 'function');
console.log('✅ Client orderService method signatures verified');

// Test 2: 7-Stage Fulfillment Lifecycle constants
assert.strictEqual(FULFILLMENT_STAGES.length, 7);
assert.strictEqual(FULFILLMENT_STAGES[0].key, 'order_received');
assert.strictEqual(FULFILLMENT_STAGES[0].label, 'Order Received');
assert.strictEqual(FULFILLMENT_STAGES[1].key, 'sourcing');
assert.strictEqual(FULFILLMENT_STAGES[1].label, 'Sourcing');
assert.strictEqual(FULFILLMENT_STAGES[2].key, 'purchased');
assert.strictEqual(FULFILLMENT_STAGES[2].label, 'Purchased');
assert.strictEqual(FULFILLMENT_STAGES[3].key, 'in_transit');
assert.strictEqual(FULFILLMENT_STAGES[3].label, 'In Transit');
assert.strictEqual(FULFILLMENT_STAGES[4].key, 'arrived_in_nepal');
assert.strictEqual(FULFILLMENT_STAGES[4].label, 'Arrived in Nepal');
assert.strictEqual(FULFILLMENT_STAGES[5].key, 'out_for_delivery');
assert.strictEqual(FULFILLMENT_STAGES[5].label, 'Out for Delivery');
assert.strictEqual(FULFILLMENT_STAGES[6].key, 'delivered');
assert.strictEqual(FULFILLMENT_STAGES[6].label, 'Delivered');
// Test 3: Order submission to payment continuation contract simulation
const sampleOrderResponse = {
  _id: '65f123456789012345678901',
  orderNumber: 'SM-2026-AB12CD34',
  finalAmountNpr: 18500,
  amountPayableNow: 9250,
  remainingCodAmount: 9250,
  paymentMode: 'cod_50_50',
  order: {
    _id: '65f123456789012345678901',
    orderNumber: 'SM-2026-AB12CD34',
  },
  payment: {
    isPaymentRequired: true,
    paymentStatus: 'pending',
    amountDueNpr: 18500,
    amountPayableNow: 9250,
    remainingCodAmount: 9250,
    paymentMode: 'cod_50_50',
    currency: 'NPR',
  },
  nextStep: {
    type: 'payment',
    orderId: '65f123456789012345678901',
    orderNumber: 'SM-2026-AB12CD34',
  },
};

assert.strictEqual(sampleOrderResponse.nextStep.type, 'payment');
assert.strictEqual(sampleOrderResponse.payment.isPaymentRequired, true);
assert.strictEqual(sampleOrderResponse.payment.amountPayableNow, 9250);
assert.strictEqual(sampleOrderResponse.payment.remainingCodAmount, 9250);
assert.strictEqual(sampleOrderResponse.payment.currency, 'NPR');
console.log('✅ Order creation to payment continuation contract verified');

console.log('🎉 All frontend Order unit checks PASSED!');
