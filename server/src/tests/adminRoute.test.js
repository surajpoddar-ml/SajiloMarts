import test from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../middlewares/rbac.middleware.js';
import { adminService } from '../services/admin.service.js';

test('Administrative Route Protection Test Suite', async (t) => {
  await t.test('1. Unauthenticated request to admin route is rejected', () => {
    let nextCalled = false;
    let caughtErr = null;
    const req = { user: null };
    const res = {};
    const next = (err) => {
      if (err) caughtErr = err;
      else nextCalled = true;
    };

    try {
      requireAdmin(req, res, next);
    } catch (err) {
      caughtErr = err;
    }

    assert.equal(nextCalled, false);
    assert.equal(caughtErr?.statusCode, 401);
  });

  await t.test('2. Customer access to admin route is forbidden', () => {
    let nextCalled = false;
    let caughtErr = null;
    const req = {
      user: {
        id: '64b1f2e3d4c5b6a7b8c9d0e1',
        email: 'customer@example.com',
        role: 'customer',
        isActive: true,
      },
    };
    const res = {};
    const next = (err) => {
      if (err) caughtErr = err;
      else nextCalled = true;
    };

    try {
      requireAdmin(req, res, next);
    } catch (err) {
      caughtErr = err;
    }

    assert.equal(nextCalled, false);
    assert.equal(caughtErr?.statusCode, 403);
    assert.equal(caughtErr?.message, 'You do not have permission to access this resource');
  });

  await t.test('3. Deactivated admin access to admin route is rejected', () => {
    let nextCalled = false;
    let caughtErr = null;
    const req = {
      user: {
        id: '64b1f2e3d4c5b6a7b8c9d0e2',
        email: 'disabled-admin@sastomarts.com',
        role: 'admin',
        isActive: false,
      },
    };
    const res = {};
    const next = (err) => {
      if (err) caughtErr = err;
      else nextCalled = true;
    };

    try {
      requireAdmin(req, res, next);
    } catch (err) {
      caughtErr = err;
    }

    assert.equal(nextCalled, false);
    assert.equal(caughtErr?.statusCode, 401);
  });

  await t.test('4. Active admin access to admin route succeeds', () => {
    let nextCalled = false;
    let caughtErr = null;
    const req = {
      user: {
        id: '64b1f2e3d4c5b6a7b8c9d0e3',
        email: 'admin@sastomarts.com',
        role: 'admin',
        isActive: true,
      },
    };
    const res = {};
    const next = (err) => {
      if (err) caughtErr = err;
      else nextCalled = true;
    };

    requireAdmin(req, res, next);

    assert.equal(nextCalled, true);
    assert.equal(caughtErr, null);
  });
});
