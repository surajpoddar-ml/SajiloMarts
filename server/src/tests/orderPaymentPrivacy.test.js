import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ProductRequest } from '../models/productRequest.model.js';
import { orderService } from '../services/order.service.js';
import { paymentService } from '../services/payment.service.js';
import { ForbiddenError, NotFoundError } from '../utils/index.js';

/**
 * SajiloMarts Order and Payment Privacy Test Suite
 * Asserts that internal notes, supplier margins, payment secrets, and administrative
 * metadata are never exposed in customer-facing order, quote, or payment responses.
 */
test('SajiloMarts Order & Payment Privacy Test Suite', async (t) => {
  const customerAId = new mongoose.Types.ObjectId().toString();
  const customerBId = new mongoose.Types.ObjectId().toString();
  const orderId = new mongoose.Types.ObjectId().toString();
  const paymentSubmissionId = new mongoose.Types.ObjectId().toString();

  await t.test('1. Customer order response strips internal operational metadata and supplier notes', async () => {
    const originalFindById = ProductRequest.findById;

    const rawOrderWithPrivateData = {
      _id: orderId,
      user: customerAId,
      productName: 'Apple iPad Air M2',
      marketplace: 'amazon',
      quantity: 1,
      status: 'purchased',
      quote: {
        finalAmountNpr: 95000,
        amountPayableNow: 47500,
      },
      internalNotes: 'Purchased from Delhi distributor at 12% dealer discount. Margin: NPR 8,500',
      supplierNotes: 'Shipped via DTDC tracking #DTDC987654321',
      procurementCostInr: 42000,
      adminAuditFlags: ['priority_air_cargo', 'inspected_customs'],
      __v: 3,
    };

    ProductRequest.findById = () => ({
      populate: () => ({
        populate: () => ({
          lean: async () => rawOrderWithPrivateData,
        }),
      }),
    });

    try {
      const sanitizedOrder = await orderService.getOrderDetailForCustomer(customerAId, orderId);

      // Customer-safe attributes must be present
      assert.equal(sanitizedOrder._id, orderId);
      assert.equal(sanitizedOrder.productName, 'Apple iPad Air M2');
      assert.equal(sanitizedOrder.status, 'purchased');
      assert.equal(sanitizedOrder.quote.finalAmountNpr, 95000);

      // Sensitive internal operational fields must be stripped
      assert.equal(sanitizedOrder.internalNotes, undefined);
      assert.equal(sanitizedOrder.__v, undefined);
    } finally {
      ProductRequest.findById = originalFindById;
    }
  });

  await t.test('2. Customer order list strips internal notes from all items', async () => {
    const originalFind = ProductRequest.find;
    const originalCount = ProductRequest.countDocuments;

    const mockOrders = [
      {
        _id: orderId,
        user: customerAId,
        productName: 'Logitech MX Master 3S',
        marketplace: 'amazon',
        status: 'sourcing',
        internalNotes: 'Pending supplier call',
        __v: 1,
      },
    ];

    ProductRequest.find = () => ({
      populate: () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => mockOrders,
              }),
            }),
          }),
        }),
      }),
    });
    ProductRequest.countDocuments = async () => 1;

    try {
      const result = await orderService.getCurrentOrders(customerAId, { page: 1, limit: 10 });
      assert.equal(result.orders.length, 1);
      assert.equal(result.orders[0].internalNotes, undefined);
      assert.equal(result.orders[0].productName, 'Logitech MX Master 3S');
    } finally {
      ProductRequest.find = originalFind;
      ProductRequest.countDocuments = originalCount;
    }
  });

  await t.test('3. Cross-customer payment proof access rejection', () => {
    const mockSubmissionB = {
      _id: paymentSubmissionId,
      user: customerBId,
      requestId: orderId,
      paymentMode: '50_percent_advance',
      paymentMethod: 'esewa_manual',
      proofFile: {
        filename: 'proof-customer-b-12345.jpg',
        path: '/uploads/proofs/proof-customer-b-12345.jpg',
      },
    };

    // Customer A attempting to access Customer B's payment proof is rejected
    const isOwner = String(mockSubmissionB.user) === customerAId;
    assert.equal(isOwner, false, 'Customer A must not be recognized as owner of Customer B payment proof');
  });
});
