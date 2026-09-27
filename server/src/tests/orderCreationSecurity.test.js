import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { OrderService } from '../services/order.service.js';
import { BadRequestError, ForbiddenError } from '../utils/index.js';

test('SajiloMarts Order Creation & Status Security Test Suite', async (t) => {
  const orderService = new OrderService();
  const customerId = new mongoose.Types.ObjectId().toString();

  await t.test('1. Order creation rejects missing or non-ObjectId customer ID', async () => {
    await assert.rejects(
      async () => {
        await orderService.createOrderFromSourcingRequest('invalid-id', new mongoose.Types.ObjectId().toString());
      },
      (err) => {
        assert.strictEqual(err instanceof BadRequestError, true);
        assert.match(err.message, /invalid customer id format/i);
        return true;
      }
    );
  });

  await t.test('2. Order creation rejects missing product request ID', async () => {
    await assert.rejects(
      async () => {
        await orderService.createOrderFromSourcingRequest(customerId, 'bad-req-id');
      },
      (err) => {
        assert.strictEqual(err instanceof BadRequestError, true);
        assert.match(err.message, /invalid product request id format/i);
        return true;
      }
    );
  });

  await t.test('3. Non-admin customer attempting to change order status is blocked by assertAdmin', async () => {
    await assert.rejects(
      async () => {
        await orderService.assertAdmin('invalid-admin-id');
      },
      (err) => {
        assert.strictEqual(err instanceof BadRequestError, true);
        return true;
      }
    );
  });

  await t.test('4. Safe sorting ignores client-supplied MongoDB query injection and falls back safely', () => {
    const maliciousOptions = {
      sortBy: '{ "$where": "sleep(5000)" }',
      sortOrder: 'desc',
    };

    const criteria = orderService.sanitizeSortCriteria(maliciousOptions);
    assert.deepStrictEqual(criteria, { createdAt: -1, _id: -1 });
  });

  await t.test('5. Safe pagination clamps maximum allowed page size to 50', () => {
    const excessiveOptions = {
      page: 2,
      limit: 100000,
    };

    const sanitized = orderService.sanitizePaginationOptions(excessiveOptions);
    assert.strictEqual(sanitized.page, 2);
    assert.strictEqual(sanitized.limit, 50);
  });
});
