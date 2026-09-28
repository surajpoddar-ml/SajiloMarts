import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { assertResourceOwnership, ForbiddenError } from '../utils/index.js';
import { serializeCustomerOrder } from '../utils/orderSerializer.js';


test('SajiloMarts Customer Order Privacy & IDOR Protection Test Suite', async (t) => {
  const customerA = new mongoose.Types.ObjectId().toString();
  const customerB = new mongoose.Types.ObjectId().toString();
  const orderId = new mongoose.Types.ObjectId().toString();

  const mockOrder = {
    _id: orderId,
    orderNumber: 'SM-20260927-A8F3K9',
    user: customerA,
    productName: 'Sony WH-1000XM5 Wireless Headphones',
    productUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
    marketplace: 'amazon-india',
    quantity: 1,
    productPriceInr: 26990,
    subtotalInr: 26990,
    conversionMultiplier: 1.65,
    feeRate: 0.12,
    convertedAmountNpr: 44533.5,
    finalAmountNpr: 49877.52,
    paymentMode: 'cod_50_50',
    amountPayableNow: 24938.76,
    remainingCodAmount: 24938.76,
    currentStatus: 'order_received',
    internalNotes: 'SECRET SUPPLIER DISCOUNT: ₹1,500; Vendor ID: VEND-9921',
    statusHistory: [
      {
        previousStatus: null,
        status: 'order_received',
        changedAt: new Date(),
        note: 'Order placed and initial payment verified.',
      },
    ],
  };

  await t.test('1. Owner Customer A has full authorized access to own order', () => {
    assert.doesNotThrow(() => {
      assertResourceOwnership(mockOrder, customerA, 'Order', 'user');
    });
  });

  await t.test('2. IDOR Defense: Attacker Customer B is strictly rejected from Customer A order', () => {
    assert.throws(
      () => {
        assertResourceOwnership(mockOrder, customerB, 'Order', 'user');
      },
      (err) => {
        assert.strictEqual(err instanceof ForbiddenError, true);
        assert.match(err.message, /do not have permission/i);
        return true;
      }
    );
  });

  await t.test('3. Privacy: Serializer strictly strips internal operational metadata and vendor notes', () => {
    const serialized = serializeCustomerOrder(mockOrder);

    assert.strictEqual(serialized.productName, 'Sony WH-1000XM5 Wireless Headphones');
    assert.strictEqual(serialized.orderNumber, 'SM-20260927-A8F3K9');
    assert.strictEqual(serialized.finalAmountNpr, 49877.52);

    // Verify private internal notes and operational secrets are stripped
    assert.strictEqual(serialized.internalNotes, undefined);
    assert.strictEqual(JSON.stringify(serialized).includes('SECRET SUPPLIER DISCOUNT'), false);
    assert.strictEqual(JSON.stringify(serialized).includes('VEND-9921'), false);
  });

  await t.test('4. Payment ownership protection strictly prevents Customer B access to Customer A payment proof', () => {
    const mockPayment = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: customerA,
      paymentStatus: 'proof_submitted',
      transactionCode: 'TXN-998822',
      paymentProof: 'uploads/proof-123.jpg',
    };

    assert.throws(
      () => {
        assertResourceOwnership(mockPayment, customerB, 'Payment submission', 'user');
      },
      (err) => {
        assert.strictEqual(err instanceof ForbiddenError, true);
        return true;
      }
    );
  });

  await t.test('5. Serializer computes authoritative payment continuation state without client overrides', () => {
    const serialized = serializeCustomerOrder(mockOrder);
    assert.strictEqual(serialized.amountPayableNow, 24938.76);
    assert.strictEqual(serialized.remainingCodAmount, 24938.76);
    assert.strictEqual(serialized.paymentMode, 'cod_50_50');
    assert.strictEqual(serialized.currency, 'NPR');
  });
});
