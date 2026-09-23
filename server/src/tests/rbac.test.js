import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, USER_ROLES, ALL_ROLES } from '../models/user.model.js';
import { isValidRole, isAdminRole, isCustomerRole } from '../constants/roles.js';
import { requireRole, requireAdmin, requireCustomer, requirePermission } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS, hasPermission } from '../constants/permissions.js';
import { validateRegistrationInput } from '../validations/auth.validation.js';

dotenv.config();

test('Roles & Authentication Authorization Test Suite', async (t) => {
  await t.test('1. Role constants & validation', () => {
    assert.equal(USER_ROLES.CUSTOMER, 'customer');
    assert.equal(USER_ROLES.ADMIN, 'admin');
    assert.deepEqual(ALL_ROLES, ['customer', 'admin']);

    assert.equal(isValidRole('customer'), true);
    assert.equal(isValidRole('admin'), true);
    assert.equal(isValidRole('CUSTOMER'), true);
    assert.equal(isValidRole('ADMIN'), true);
    assert.equal(isValidRole('superadmin'), false);
    assert.equal(isValidRole('moderator'), false);
    assert.equal(isValidRole(null), false);
    assert.equal(isValidRole(''), false);

    assert.equal(isAdminRole('admin'), true);
    assert.equal(isAdminRole('customer'), false);
    assert.equal(isCustomerRole('customer'), true);
    assert.equal(isCustomerRole('admin'), false);
  });

  await t.test('2. Public registration role injection defense', () => {
    // Should reject registration payload containing role: 'admin'
    assert.throws(
      () => {
        validateRegistrationInput({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'admin',
        });
      },
      (err) => {
        return (
          err.name === 'ValidationError' &&
          err.errors &&
          err.errors.some((e) => e.field === 'role')
        );
      }
    );

    // Should accept customer registration payload
    const valid = validateRegistrationInput({
      name: 'Legit Customer',
      email: 'customer@example.com',
      password: 'Password123!',
    });
    assert.equal(valid.name, 'Legit Customer');
    assert.equal(valid.email, 'customer@example.com');
  });

  await t.test('3. Reusable role guards behavior', () => {
    const adminGuard = requireAdmin;
    const customerGuard = requireCustomer;

    // Unauthenticated request
    let nextCalled = false;
    let caughtError = null;
    try {
      adminGuard({}, {}, () => { nextCalled = true; });
    } catch (err) {
      caughtError = err;
    }
    assert.equal(nextCalled, false);
    assert.equal(caughtError?.statusCode, 401);

    // Inactive account request
    nextCalled = false;
    caughtError = null;
    try {
      adminGuard({ user: { id: '123', role: 'admin', isActive: false } }, {}, () => { nextCalled = true; });
    } catch (err) {
      caughtError = err;
    }
    assert.equal(nextCalled, false);
    assert.equal(caughtError?.statusCode, 401);

    // Customer accessing admin guard -> 403 Forbidden
    nextCalled = false;
    caughtError = null;
    try {
      adminGuard({ user: { id: '123', role: 'customer', isActive: true } }, {}, () => { nextCalled = true; });
    } catch (err) {
      caughtError = err;
    }
    assert.equal(nextCalled, false);
    assert.equal(caughtError?.statusCode, 403);

    // Admin accessing admin guard -> Success
    nextCalled = false;
    adminGuard({ user: { id: '123', role: 'admin', isActive: true } }, {}, () => { nextCalled = true; });
    assert.equal(nextCalled, true);

    // Customer accessing customer guard -> Success
    nextCalled = false;
    customerGuard({ user: { id: '123', role: 'customer', isActive: true } }, {}, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  await t.test('4. Permission structure & deny-by-default', () => {
    assert.equal(hasPermission('customer', PERMISSIONS.CUSTOMER_PROFILE_READ), true);
    assert.equal(hasPermission('customer', PERMISSIONS.CUSTOMER_ADDRESS_CREATE), true);
    assert.equal(hasPermission('customer', PERMISSIONS.ADMIN_CUSTOMER_UPDATE), false);
    assert.equal(hasPermission('customer', PERMISSIONS.ADMIN_PAYMENT_REVIEW), false);

    assert.equal(hasPermission('admin', PERMISSIONS.ADMIN_CUSTOMER_UPDATE), true);
    assert.equal(hasPermission('admin', PERMISSIONS.ADMIN_PAYMENT_REVIEW), true);
    assert.equal(hasPermission('admin', PERMISSIONS.CUSTOMER_PROFILE_READ), true);

    const permGuard = requirePermission(PERMISSIONS.ADMIN_CUSTOMER_UPDATE);

    // Customer executing admin permission guard -> 403 Forbidden
    let nextCalled = false;
    let caughtError = null;
    try {
      permGuard({ user: { id: '123', role: 'customer', isActive: true } }, {}, () => { nextCalled = true; });
    } catch (err) {
      caughtError = err;
    }
    assert.equal(nextCalled, false);
    assert.equal(caughtError?.statusCode, 403);

    // Admin executing admin permission guard -> Success
    nextCalled = false;
    permGuard({ user: { id: '123', role: 'admin', isActive: true } }, {}, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });
});
