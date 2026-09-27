import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  VALID_ORDER_TRANSITIONS,
  canTransitionOrderStatus,
  isValidOrderStatus,
  isActiveOrderStatus,
  isHistoricalOrderStatus,
} from '../constants/order.constants.js';
import { createDeliveryAddressSnapshot } from '../utils/orderAddressSnapshot.js';
import { extractAuthoritativeQuoteSnapshot } from '../utils/orderQuoteSnapshot.js';
import { generateOrderNumber } from '../utils/orderIdGenerator.js';

test('SajiloMarts Order Lifecycle Validation Test Suite', async (t) => {
  await t.test('1. Valid sequential status transitions succeed', () => {
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.ORDER_RECEIVED, ORDER_STATUSES.SOURCING), true);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.SOURCING, ORDER_STATUSES.PURCHASED), true);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.PURCHASED, ORDER_STATUSES.IN_TRANSIT), true);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.IN_TRANSIT, ORDER_STATUSES.ARRIVED_IN_NEPAL), true);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.ARRIVED_IN_NEPAL, ORDER_STATUSES.OUT_FOR_DELIVERY), true);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.OUT_FOR_DELIVERY, ORDER_STATUSES.DELIVERED), true);
  });

  await t.test('2. Illegal forward jumps and invalid transitions are rejected', () => {
    // Cannot skip from Order Received directly to Delivered
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.ORDER_RECEIVED, ORDER_STATUSES.DELIVERED), false);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.ORDER_RECEIVED, ORDER_STATUSES.OUT_FOR_DELIVERY), false);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.SOURCING, ORDER_STATUSES.DELIVERED), false);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.PURCHASED, ORDER_STATUSES.DELIVERED), false);
  });

  await t.test('3. Terminal Delivered status cannot be moved backward', () => {
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.DELIVERED, ORDER_STATUSES.SOURCING), false);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.DELIVERED, ORDER_STATUSES.ORDER_RECEIVED), false);
    assert.strictEqual(canTransitionOrderStatus(ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED), false);
    assert.deepStrictEqual(VALID_ORDER_TRANSITIONS[ORDER_STATUSES.DELIVERED], []);
  });

  await t.test('4. Order ID generation is unpredictable, formatted correctly, and non-sequential', () => {
    const id1 = generateOrderNumber();
    const id2 = generateOrderNumber();
    assert.match(id1, /^SM-\d{8}-[A-F0-9]{6}$/);
    assert.match(id2, /^SM-\d{8}-[A-F0-9]{6}$/);
    assert.notStrictEqual(id1, id2);
  });

  await t.test('5. Delivery address snapshot isolates mutable customer profile changes', () => {
    const originalAddress = {
      fullName: 'Ram Bahadur Shrestha',
      phone: '9841234567',
      label: 'Home',
      tole: 'New Road',
      wardNumber: 22,
      municipality: 'Kathmandu Metropolitan',
      district: 'Kathmandu',
      province: 'Bagmati Province',
      country: 'Nepal',
      landmark: 'Near Bishal Bazar',
    };

    const snapshot = createDeliveryAddressSnapshot(originalAddress);
    assert.strictEqual(snapshot.fullName, 'Ram Bahadur Shrestha');
    assert.strictEqual(snapshot.district, 'Kathmandu');

    // Mutating original object does NOT mutate frozen snapshot
    originalAddress.fullName = 'Hari Prasad';
    originalAddress.district = 'Pokhara';
    assert.strictEqual(snapshot.fullName, 'Ram Bahadur Shrestha');
    assert.strictEqual(snapshot.district, 'Kathmandu');
  });

  await t.test('6. Authoritative quote snapshot extraction enforces server calculation integrity', () => {
    const mockQuote = {
      sourceCurrency: 'INR',
      destinationCurrency: 'NPR',
      productPriceInr: 5000,
      quantity: 2,
      subtotalInr: 10000,
      conversionMultiplier: 1.65,
      exchangeRate: 1.65,
      convertedAmountNpr: 16500,
      paymentMode: 'cod_50_50',
      feeRate: 0.12,
      appliedRate: 0.12,
      rateAmountNpr: 1980,
      finalAmountNpr: 18480,
      payNowAmountNpr: 9240,
      remainingCodAmountNpr: 9240,
    };

    const snapshot = extractAuthoritativeQuoteSnapshot(mockQuote);
    assert.strictEqual(snapshot.finalAmountNpr, 18480);
    assert.strictEqual(snapshot.payNowAmountNpr, 9240);
    assert.strictEqual(snapshot.remainingCodAmountNpr, 9240);
    assert.strictEqual(snapshot.conversionMultiplier, 1.65);
  });
});
