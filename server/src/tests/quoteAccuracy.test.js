import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteService } from '../services/quote.service.js';
import { calculateOnlineQuote, calculateCodQuote } from '../utils/quoteCalculator.js';
import { roundCurrency, splitMoneyEvenly } from '../utils/money.js';

test('Quote Calculation Accuracy Test Suite', async (t) => {
  await t.test('1. Authoritative 100% Online Quote calculation math', () => {
    // ₹1000 x 1 unit
    // INR subtotal: 1000
    // Converted NPR: 1000 * 1.65 = 1650
    // Online fee 18%: 1650 * 0.18 = 297
    // Final NPR: 1650 + 297 = 1947
    const quote1 = quoteService.calculateQuote(1000, 1, 'online_100');
    assert.strictEqual(quote1.subtotalInr, 1000);
    assert.strictEqual(quote1.convertedAmountNpr, 1650);
    assert.strictEqual(quote1.rateAmountNpr, 297);
    assert.strictEqual(quote1.finalAmountNpr, 1947);
    assert.strictEqual(quote1.amountPayableNow, 1947);
    assert.strictEqual(quote1.remainingCodAmount, 0);

    // ₹2500 x 2 units
    // INR subtotal: 5000
    // Converted NPR: 5000 * 1.65 = 8250
    // Online fee 18%: 8250 * 0.18 = 1485
    // Final NPR: 8250 + 1485 = 9735
    const quote2 = quoteService.calculateQuote(2500, 2, 'ONLINE_FULL');
    assert.strictEqual(quote2.subtotalInr, 5000);
    assert.strictEqual(quote2.convertedAmountNpr, 8250);
    assert.strictEqual(quote2.finalAmountNpr, 9735);
    assert.strictEqual(quote2.amountPayableNow, 9735);
    assert.strictEqual(quote2.remainingCodAmount, 0);
  });

  await t.test('2. Authoritative 50/50 COD Quote calculation math', () => {
    // ₹1000 x 1 unit
    // INR subtotal: 1000
    // Converted NPR: 1000 * 1.65 = 1650
    // COD fee 22%: 1650 * 0.22 = 363
    // Final NPR: 1650 + 363 = 2013
    // 50% Pay Now: 1006.50, 50% COD: 1006.50
    const codQuote = quoteService.calculateQuote(1000, 1, 'cod_50_50');
    assert.strictEqual(codQuote.subtotalInr, 1000);
    assert.strictEqual(codQuote.convertedAmountNpr, 1650);
    assert.strictEqual(codQuote.rateAmountNpr, 363);
    assert.strictEqual(codQuote.finalAmountNpr, 2013);
    assert.strictEqual(codQuote.amountPayableNow, 1006.5);
    assert.strictEqual(codQuote.remainingCodAmount, 1006.5);
    assert.strictEqual(
      roundCurrency(codQuote.amountPayableNow + codQuote.remainingCodAmount),
      codQuote.finalAmountNpr
    );
  });

  await t.test('3. Fractional price and non-trivial rounding integrity', () => {
    const fractionalQuote = quoteService.calculateQuote(999.99, 3, 'cod_50_50');
    assert(fractionalQuote.finalAmountNpr > 0);
    assert.strictEqual(
      roundCurrency(fractionalQuote.amountPayableNow + fractionalQuote.remainingCodAmount),
      fractionalQuote.finalAmountNpr
    );
  });

  await t.test('4. splitMoneyEvenly ensures exact whole-cent partition', () => {
    const parts = splitMoneyEvenly(2013.01, 2);
    assert.strictEqual(parts.length, 2);
    assert.strictEqual(roundCurrency(parts[0] + parts[1]), 2013.01);
  });
});
