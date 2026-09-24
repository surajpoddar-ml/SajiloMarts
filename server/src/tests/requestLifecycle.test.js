import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStatusTransition,
  ALLOWED_TRANSITIONS,
  CUSTOMER_PERMITTED_ACTIONS,
} from '../utils/requestLifecycle.js';
import { REQUEST_STATUSES } from '../models/productRequest.model.js';
import { BadRequestError, ForbiddenError } from '../utils/index.js';

test('Sourcing Request Lifecycle Protection Test Suite', async (t) => {
  await t.test('1. Allows valid customer state transitions', () => {
    // Draft -> Submitted
    assert.doesNotThrow(() =>
      validateStatusTransition(REQUEST_STATUSES.DRAFT, REQUEST_STATUSES.SUBMITTED, false)
    );

    // Quote Ready -> Customer Confirmed
    assert.doesNotThrow(() =>
      validateStatusTransition(REQUEST_STATUSES.QUOTE_READY, REQUEST_STATUSES.CUSTOMER_CONFIRMED, false)
    );

    // Submitted -> Cancelled
    assert.doesNotThrow(() =>
      validateStatusTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.CANCELLED, false)
    );
  });

  await t.test('2. Rejects customer unauthorized status jump attempts', () => {
    // Customer cannot set quote_ready directly
    assert.throws(
      () => validateStatusTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.QUOTE_READY, false),
      (err) => err instanceof ForbiddenError
    );

    // Customer cannot set converted directly
    assert.throws(
      () => validateStatusTransition(REQUEST_STATUSES.DRAFT, REQUEST_STATUSES.CONVERTED, false),
      (err) => err instanceof BadRequestError || err instanceof ForbiddenError
    );

    // Customer cannot set under_review directly
    assert.throws(
      () => validateStatusTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.UNDER_REVIEW, false),
      (err) => err instanceof ForbiddenError
    );
  });

  await t.test('3. Rejects illegal transitions from terminal states', () => {
    // Cannot transition out of cancelled
    assert.throws(
      () => validateStatusTransition(REQUEST_STATUSES.CANCELLED, REQUEST_STATUSES.SUBMITTED, true),
      (err) => err instanceof BadRequestError
    );

    // Cannot transition out of completed
    assert.throws(
      () => validateStatusTransition(REQUEST_STATUSES.COMPLETED, REQUEST_STATUSES.QUOTE_READY, true),
      (err) => err instanceof BadRequestError
    );
  });

  await t.test('4. Allows valid administrative transitions', () => {
    assert.doesNotThrow(() =>
      validateStatusTransition(REQUEST_STATUSES.SUBMITTED, REQUEST_STATUSES.UNDER_REVIEW, true)
    );
    assert.doesNotThrow(() =>
      validateStatusTransition(REQUEST_STATUSES.UNDER_REVIEW, REQUEST_STATUSES.QUOTE_READY, true)
    );
  });
});
