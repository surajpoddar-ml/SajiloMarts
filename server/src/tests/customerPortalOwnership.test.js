import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ProductRequest } from '../models/productRequest.model.js';
import { orderService } from '../services/order.service.js';
import { assertResourceOwnership } from '../utils/ownership.js';
import { ForbiddenError, NotFoundError } from '../utils/index.js';

/**
 * SajiloMarts Customer Account Portal - Ownership & IDOR Isolation Test Suite
 * Validates that Customer A is strictly prohibited from accessing, viewing, modifying,
 * or mutating Customer B's sourcing requests, quotes, orders, addresses, and payment data.
 */
test('SajiloMarts Customer Portal Ownership & IDOR Isolation Test Suite', async (t) => {
  const customerAId = new mongoose.Types.ObjectId().toString();
  const customerBId = new mongoose.Types.ObjectId().toString();
  const orderBId = new mongoose.Types.ObjectId().toString();

  await t.test('1. Sourcing Request & Quote Ownership Isolation', () => {
    const mockRequestB = {
      _id: orderBId,
      user: customerBId,
      productName: 'Sony WH-1000XM5 Headphones',
      marketplace: 'amazon',
      productUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
      quantity: 1,
      status: 'customer_confirmed',
      quote: {
        finalAmountNpr: 45000,
        amountPayableNow: 22500,
        remainingCodAmount: 22500,
      },
    };

    // Customer B accessing own request succeeds
    assert.doesNotThrow(() => {
      assertResourceOwnership(mockRequestB, customerBId, 'ProductRequest', 'user');
    });

    // Customer A accessing Customer B request is forbidden (403)
    assert.throws(
      () => {
        assertResourceOwnership(mockRequestB, customerAId, 'ProductRequest', 'user');
      },
      (err) => err instanceof ForbiddenError && err.statusCode === 403
    );
  });

  await t.test('2. Order Detail Ownership Guard in OrderService', async () => {
    const originalFindById = ProductRequest.findById;

    const mockOrderB = {
      _id: orderBId,
      user: customerBId,
      productName: 'Marshall Emberton II',
      marketplace: 'flipkart',
      status: 'sourcing',
      quote: { finalAmountNpr: 22000 },
      internalNotes: 'SECRET_ADMIN_SUPPLIER_NOTE',
    };

    ProductRequest.findById = (id) => ({
      populate: () => ({
        populate: () => ({
          lean: async () => (String(id) === orderBId ? mockOrderB : null),
        }),
      }),
    });

    try {
      // Customer B retrieves successfully and internalNotes are stripped
      const detailB = await orderService.getOrderDetailForCustomer(customerBId, orderBId);
      assert.equal(detailB._id, orderBId);
      assert.equal(detailB.productName, 'Marshall Emberton II');
      assert.equal(detailB.internalNotes, undefined); // Sanitized

      // Customer A attempting to retrieve Customer B's order is rejected
      await assert.rejects(
        async () => {
          await orderService.getOrderDetailForCustomer(customerAId, orderBId);
        },
        (err) => err instanceof ForbiddenError && err.statusCode === 403
      );
    } finally {
      ProductRequest.findById = originalFindById;
    }
  });

  await t.test('3. Delivery Address Ownership Guard', () => {
    const mockAddressB = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: customerBId,
      fullName: 'Customer B',
      phone: '9841234567',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      tole: 'New Road',
      isDefaultShipping: true,
    };

    // Owner check
    assert.doesNotThrow(() => {
      assertResourceOwnership(mockAddressB, customerBId, 'Address', 'user');
    });

    // Cross-customer check rejected
    assert.throws(
      () => {
        assertResourceOwnership(mockAddressB, customerAId, 'Address', 'user');
      },
      (err) => err instanceof ForbiddenError && err.statusCode === 403
    );
  });

  await t.test('4. Order query strictly scopes by authenticated customerId', async () => {
    const originalFind = ProductRequest.find;
    const originalCount = ProductRequest.countDocuments;

    let capturedCurrentFilter = null;
    let capturedHistoryFilter = null;

    ProductRequest.find = (filter) => {
      if (filter.status?.$in?.includes('sourcing')) {
        capturedCurrentFilter = filter;
      } else {
        capturedHistoryFilter = filter;
      }
      return {
        populate: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => [],
                }),
              }),
            }),
          }),
        }),
      };
    };

    ProductRequest.countDocuments = async () => 0;

    try {
      await orderService.getCurrentOrders(customerAId, { page: 1, limit: 10 });
      assert.equal(String(capturedCurrentFilter.user), customerAId);

      await orderService.getOrderHistory(customerAId, { page: 1, limit: 10 });
      assert.equal(String(capturedHistoryFilter.user), customerAId);
    } finally {
      ProductRequest.find = originalFind;
      ProductRequest.countDocuments = originalCount;
    }
  });
});
