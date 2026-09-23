import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isResourceOwner,
  assertResourceOwnership,
  assertOwnerOrAdmin,
  extractOwnerId,
} from '../utils/ownership.js';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/index.js';

test('Customer Ownership Enforcement Test Suite', async (t) => {
  const customerId1 = '64b1f2e3d4c5b6a7b8c9d001';
  const customerId2 = '64b1f2e3d4c5b6a7b8c9d002';
  const adminId = '64b1f2e3d4c5b6a7b8c9da01';

  await t.test('1. extractOwnerId resolves owner correctly', () => {
    assert.equal(extractOwnerId({ userId: customerId1 }, 'userId'), customerId1);
    assert.equal(extractOwnerId({ user: customerId1 }, 'userId'), customerId1);
    assert.equal(extractOwnerId({ user: { _id: customerId1 } }, 'user'), customerId1);
    assert.equal(extractOwnerId(null), null);
  });

  await t.test('2. isResourceOwner matches trusted owner only', () => {
    const resource = { userId: customerId1 };
    assert.equal(isResourceOwner(resource, customerId1), true);
    assert.equal(isResourceOwner(resource, customerId2), false);
    assert.equal(isResourceOwner(resource, null), false);
  });

  await t.test('3. assertResourceOwnership rejects unauthorized cross-customer access', () => {
    const resource = { user: customerId1 };

    // Owner access -> No exception
    assert.doesNotThrow(() => {
      assertResourceOwnership(resource, customerId1, 'Request', 'user');
    });

    // Cross-customer access -> ForbiddenError (403)
    assert.throws(
      () => {
        assertResourceOwnership(resource, customerId2, 'Request', 'user');
      },
      (err) => err instanceof ForbiddenError && err.statusCode === 403
    );

    // Unauthenticated access -> UnauthorizedError (401)
    assert.throws(
      () => {
        assertResourceOwnership(resource, null, 'Request', 'user');
      },
      (err) => err instanceof UnauthorizedError && err.statusCode === 401
    );

    // Missing resource -> NotFoundError (404)
    assert.throws(
      () => {
        assertResourceOwnership(null, customerId1, 'Request', 'user');
      },
      (err) => err instanceof NotFoundError && err.statusCode === 404
    );
  });

  await t.test('4. assertOwnerOrAdmin permits both owner and admin, rejects other customers', () => {
    const resource = { userId: customerId1 };

    const ownerReq = { user: { id: customerId1, role: 'customer' } };
    const strangerReq = { user: { id: customerId2, role: 'customer' } };
    const adminReq = { user: { id: adminId, role: 'admin' } };

    // Owner succeeds
    assert.doesNotThrow(() => {
      assertOwnerOrAdmin(resource, ownerReq, 'Address', 'userId');
    });

    // Admin succeeds
    assert.doesNotThrow(() => {
      assertOwnerOrAdmin(resource, adminReq, 'Address', 'userId');
    });

    // Cross-customer fails
    assert.throws(
      () => {
        assertOwnerOrAdmin(resource, strangerReq, 'Address', 'userId');
      },
      (err) => err instanceof ForbiddenError && err.statusCode === 403
    );
  });
});
