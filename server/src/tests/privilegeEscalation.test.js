import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistrationInput, validateUpdateProfileInput } from '../validations/auth.validation.js';
import { requireAdmin } from '../middlewares/rbac.middleware.js';
import { ValidationError, ForbiddenError } from '../utils/index.js';

test('Privilege Escalation Defenses Test Suite', async (t) => {
  await t.test('1. Role escalation during registration is blocked', () => {
    assert.throws(
      () => {
        validateRegistrationInput({
          name: 'Attacker',
          email: 'attacker@example.com',
          password: 'Password123!',
          role: 'admin',
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'role')
    );
  });

  await t.test('2. Role and status mutation during profile update is blocked', () => {
    assert.throws(
      () => {
        validateUpdateProfileInput({
          name: 'Attacker',
          role: 'admin',
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'extraFields')
    );

    assert.throws(
      () => {
        validateUpdateProfileInput({
          isActive: true,
          isEmailVerified: true,
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'extraFields')
    );
  });

  await t.test('3. Prototype pollution and prohibited key injection is rejected', () => {
    assert.throws(
      () => {
        validateRegistrationInput(
          JSON.parse('{"name": "Attacker", "email": "attacker2@example.com", "password": "Password123!", "$where": "1==1"}')
        );
      },
      (err) => err instanceof ValidationError
    );
  });

  await t.test('4. Customer attempting to execute administrative guard is blocked', () => {
    const customerReq = {
      user: {
        id: '64b1f2e3d4c5b6a7b8c9d009',
        email: 'customer@sastomarts.com',
        role: 'customer',
        isActive: true,
      },
    };

    let caughtErr = null;
    try {
      requireAdmin(customerReq, {}, () => {});
    } catch (err) {
      caughtErr = err;
    }

    assert.equal(caughtErr instanceof ForbiddenError, true);
    assert.equal(caughtErr?.statusCode, 403);
  });
});
