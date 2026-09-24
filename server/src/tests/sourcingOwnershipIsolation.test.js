import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { assertResourceOwnership, isResourceOwner } from '../utils/ownership.js';
import { ForbiddenError, UnauthorizedError } from '../utils/index.js';

test('Sourcing Request Customer Ownership Isolation Test Suite', async (t) => {
  const customerAId = new mongoose.Types.ObjectId().toString();
  const customerBId = new mongoose.Types.ObjectId().toString();

  const requestOfA = {
    _id: new mongoose.Types.ObjectId(),
    user: customerAId,
    productName: 'Customer A Product',
    productPriceInr: 1500,
  };

  const addressOfB = {
    _id: new mongoose.Types.ObjectId(),
    userId: customerBId,
    fullName: 'Recipient B',
  };

  await t.test('1. Customer A is confirmed as owner of their own request', () => {
    assert.strictEqual(isResourceOwner(requestOfA, customerAId, 'user'), true);
    assert.doesNotThrow(() => assertResourceOwnership(requestOfA, customerAId, 'Product request', 'user'));
  });

  await t.test('2. Customer B is strictly forbidden from accessing Customer A request', () => {
    assert.strictEqual(isResourceOwner(requestOfA, customerBId, 'user'), false);
    assert.throws(
      () => assertResourceOwnership(requestOfA, customerBId, 'Product request', 'user'),
      (err) => err instanceof ForbiddenError
    );
  });

  await t.test('3. Cross-customer delivery address assignment is rejected', () => {
    assert.throws(
      () => assertResourceOwnership(addressOfB, customerAId, 'Delivery address', 'userId'),
      (err) => err instanceof ForbiddenError
    );
  });

  await t.test('4. Unauthenticated access throws UnauthorizedError', () => {
    assert.throws(
      () => assertResourceOwnership(requestOfA, null, 'Product request', 'user'),
      (err) => err instanceof UnauthorizedError
    );
  });
});
