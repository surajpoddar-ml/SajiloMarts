import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { User } from '../models/user.model.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { productRequestService } from '../services/productRequest.service.js';

test('MongoDB Atlas Sourcing & Quote Integration Test Suite', async (t) => {
  let testUser = null;
  let testRequest = null;

  t.before(async () => {
    await connectDatabase();
    // Create isolated test customer in Atlas
    testUser = await User.create({
      name: 'Atlas Sourcing Tester',
      email: `sourcing_atlas_${Date.now()}@sastomarts.com`,
      password: 'StrongPassword123!',
      role: 'customer',
      isEmailVerified: true,
      isActive: true,
    });
  });

  t.after(async () => {
    if (testRequest) {
      await ProductRequest.findByIdAndDelete(testRequest._id);
    }
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }
    await disconnectDatabase();
  });

  await t.test('1. Atlas creates sourcing request with authoritative quote snapshot', async () => {
    const rawPayload = {
      productUrl: 'https://www.amazon.in/dp/B08N5WRWNW?utm_source=facebook',
      productName: 'Boat Wireless Headset',
      productPriceInr: 1500,
      quantity: 2,
      paymentMode: 'online_100',
    };

    testRequest = await productRequestService.createRequest(testUser._id.toString(), rawPayload);

    assert(testRequest._id);
    assert.strictEqual(testRequest.user.toString(), testUser._id.toString());
    assert.strictEqual(testRequest.productUrl, 'https://www.amazon.in/dp/B08N5WRWNW');
    assert.strictEqual(testRequest.marketplace, 'amazon-india');
    assert.strictEqual(testRequest.status, REQUEST_STATUSES.SUBMITTED);
    assert(testRequest.quote);
    assert.strictEqual(testRequest.quote.subtotalInr, 3000);
    assert.strictEqual(testRequest.quote.conversionMultiplier, 1.65);
    // 3000 * 1.65 = 4950 * 1.18 = 5841
    assert.strictEqual(testRequest.quote.finalAmountNpr, 5841);
  });

  await t.test('2. Atlas persists quote recalculation and quote confirmation', async () => {
    // Recalculate to COD 50/50
    const updated = await productRequestService.generateAndSaveQuote(
      testUser._id.toString(),
      testRequest._id.toString(),
      { paymentMode: 'cod_50_50' }
    );

    assert.strictEqual(updated.status, REQUEST_STATUSES.QUOTE_READY);
    assert.strictEqual(updated.quote.paymentMode, 'cod_50_50');
    // 3000 * 1.65 = 4950 * 1.22 = 6039
    assert.strictEqual(updated.quote.finalAmountNpr, 6039);
    assert.strictEqual(updated.quote.amountPayableNow, 3019.5);
    assert.strictEqual(updated.quote.remainingCodAmount, 3019.5);

    // Confirm quote
    const confirmed = await productRequestService.confirmQuote(
      testUser._id.toString(),
      testRequest._id.toString()
    );

    assert.strictEqual(confirmed.status, REQUEST_STATUSES.CUSTOMER_CONFIRMED);
    assert(confirmed.quote.confirmedAt);
  });
});
