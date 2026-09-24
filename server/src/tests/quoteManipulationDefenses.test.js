import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteService } from '../services/quote.service.js';

test('Quote Manipulation Defenses Test Suite', async (t) => {
  await t.test('1. Ignores fraudulent client-supplied finalAmount and rates in safe calculation', () => {
    const maliciousPayload = {
      productPriceInr: 1000,
      quantity: 1,
      paymentMode: 'online_100',
      // Client manipulation attempts:
      finalAmountNpr: 100, // True math is 1947
      amountPayableNow: 50,
      remainingCodAmount: 0,
      conversionMultiplier: 1.0,
      exchangeRate: 1.0,
      feeRate: 0.01,
      appliedRate: 0.01,
      rateAmountNpr: 10,
    };

    const calculated = quoteService.generateSafeQuote(maliciousPayload);

    // Assert that server discarded all client values and computed authoritatively
    assert.strictEqual(calculated.finalAmountNpr, 1947);
    assert.strictEqual(calculated.amountPayableNow, 1947);
    assert.strictEqual(calculated.conversionMultiplier, 1.65);
    assert.strictEqual(calculated.feeRate, 0.18);
    assert.strictEqual(calculated.rateAmountNpr, 297);
  });

  await t.test('2. Ignores fraudulent 50/50 COD client numbers', () => {
    const maliciousCodPayload = {
      productPriceInr: 2000,
      quantity: 1,
      paymentMode: 'cod_50_50',
      finalAmountNpr: 1000, // True math: 2000 * 1.65 * 1.22 = 4026
      amountPayableNow: 1,
      remainingCodAmount: 999,
      feeRate: 0.05,
    };

    const calculated = quoteService.generateSafeQuote(maliciousCodPayload);

    assert.strictEqual(calculated.finalAmountNpr, 4026);
    assert.strictEqual(calculated.amountPayableNow, 2013);
    assert.strictEqual(calculated.remainingCodAmount, 2013);
    assert.strictEqual(calculated.feeRate, 0.22);
  });

  await t.test('3. Rejects negative or non-finite product price manipulation', () => {
    assert.throws(
      () => quoteService.generateSafeQuote({ productPriceInr: -500 }),
      (err) => err.message.includes('Valid product price in INR is required')
    );

    assert.throws(
      () => quoteService.generateSafeQuote({ productPriceInr: NaN }),
      (err) => err.message.includes('Valid product price in INR is required')
    );
  });
});
