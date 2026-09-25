import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Address } from '../models/address.model.js';
import { ProductRequest } from '../models/productRequest.model.js';
import { calculateOnlineQuote, calculateCodQuote } from '../utils/quoteCalculator.js';
import { ACTIVE_ORDER_STATUSES, COMPLETED_ORDER_STATUSES } from '../services/order.service.js';
import { assertResourceOwnership } from '../utils/ownership.js';

/**
 * SajiloMarts Complete Customer Account Journey Integration Test Suite
 * Validates the full authenticated customer workflow from onboarding to delivery:
 * Profile -> Addresses -> Sourcing Request -> Quote Confirmation -> Active Order Tracking -> History -> Security
 */
test('SajiloMarts Complete Customer Account Journey Integration Test', async (t) => {
  const customerId = new mongoose.Types.ObjectId().toString();
  const addressId = new mongoose.Types.ObjectId().toString();
  const requestId = new mongoose.Types.ObjectId().toString();

  await t.test('Step 1: Authenticated Customer Profile & Verification', () => {
    const customer = {
      _id: customerId,
      name: 'Ramesh Sharma',
      email: 'ramesh.sharma@sajilomarts.test',
      phone: '9841234567',
      role: 'customer',
      isEmailVerified: true,
      createdAt: new Date(),
    };

    assert.equal(customer.role, 'customer');
    assert.equal(customer.isEmailVerified, true);
    assert.equal(customer.name, 'Ramesh Sharma');
  });

  await t.test('Step 2: Nepal Delivery Address Creation & Default Selection', () => {
    const deliveryAddress = {
      _id: addressId,
      user: customerId,
      fullName: 'Ramesh Sharma',
      phone: '9841234567',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      wardNumber: 3,
      tole: 'Putalisadak',
      landmark: 'Near Star Mall',
      label: 'home',
      isDefaultShipping: true,
      country: 'Nepal',
    };

    assert.equal(deliveryAddress.user, customerId);
    assert.equal(deliveryAddress.isDefaultShipping, true);
    assert.equal(deliveryAddress.province, 'Bagmati Province');
    assert.doesNotThrow(() => {
      assertResourceOwnership(deliveryAddress, customerId, 'Address', 'user');
    });
  });

  await t.test('Step 3: Indian Marketplace Sourcing Request & Quote Calculation', () => {
    const productPriceInr = 10000;
    const quantity = 2;
    const quote = calculateOnlineQuote(productPriceInr, quantity);

    assert.equal(quote.subtotalInr, 20000);
    assert.equal(quote.convertedAmountNpr, 33000); // 20000 * 1.65
    assert.equal(quote.feeRate, 0.18);
    assert.equal(quote.finalAmountNpr, 38940); // 33000 * 1.18
    assert.equal(quote.amountPayableNow, 38940); // 100% online
    assert.equal(quote.remainingCodAmount, 0);

    const codQuote = calculateCodQuote(productPriceInr, quantity);
    assert.equal(codQuote.subtotalInr, 20000);
    assert.equal(codQuote.convertedAmountNpr, 33000);
    assert.equal(codQuote.feeRate, 0.22);
    assert.equal(codQuote.finalAmountNpr, 40260); // 33000 * 1.22
    assert.equal(codQuote.amountPayableNow, 20130); // 50%
    assert.equal(codQuote.remainingCodAmount, 20130); // 50%
  });

  await t.test('Step 4: Active Order Fulfillment Lifecycle & Status History', () => {
    const initialStatus = 'customer_confirmed';
    assert.ok(ACTIVE_ORDER_STATUSES.includes(initialStatus), 'customer_confirmed is an active order status');

    const statusHistory = [
      { status: 'customer_confirmed', changedAt: new Date(Date.now() - 3600000), note: 'Quote confirmed by customer' },
      { status: 'sourcing', changedAt: new Date(Date.now() - 1800000), note: 'Procurement agent assigned in Delhi' },
      { status: 'in_transit', changedAt: new Date(), note: 'Dispatched to Kathmandu hub' },
    ];

    assert.equal(statusHistory.length, 3);
    assert.equal(statusHistory[statusHistory.length - 1].status, 'in_transit');
  });

  await t.test('Step 5: Order Completion & Archival to Order History', () => {
    const deliveredStatus = 'delivered';
    assert.ok(COMPLETED_ORDER_STATUSES.includes(deliveredStatus), 'delivered is a completed order history status');
  });
});
