import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdminUpdateUser } from '../validations/admin.validation.js';
import { adminService } from '../services/admin.service.js';
import { User } from '../models/user.model.js';
import { ValidationError, BadRequestError } from '../utils/index.js';

test('Administrative Safety Controls Test Suite', async (t) => {
  await t.test('1. Invalid roles are rejected by administrative validation', () => {
    assert.throws(
      () => {
        validateAdminUpdateUser({
          role: 'superadmin',
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'role')
    );

    assert.throws(
      () => {
        validateAdminUpdateUser({
          role: 'root',
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'role')
    );
  });

  await t.test('2. Unpermitted fields in admin payload are rejected', () => {
    assert.throws(
      () => {
        validateAdminUpdateUser({
          password: 'NewPassword123!',
          passwordHash: 'injected_hash',
        });
      },
      (err) => err instanceof ValidationError && err.errors.some((e) => e.field === 'extraFields')
    );
  });

  await t.test('3. Admin self-deactivation is rejected', async () => {
    const adminId = '64b1f2e3d4c5b6a7b8c9da01';

    // Mock User.findById
    const originalFindById = User.findById;
    User.findById = async (id) => {
      return {
        _id: id,
        role: 'admin',
        isActive: true,
        save: async function () { return this; },
      };
    };

    try {
      await assert.rejects(
        async () => {
          await adminService.updateCustomerAccount(adminId, adminId, { isActive: false });
        },
        (err) => err instanceof BadRequestError && err.message.includes('Administrators cannot deactivate their own account')
      );
    } finally {
      User.findById = originalFindById;
    }
  });

  await t.test('4. Removing or deactivating the last administrator is rejected', async () => {
    const adminId1 = '64b1f2e3d4c5b6a7b8c9da01';
    const adminId2 = '64b1f2e3d4c5b6a7b8c9da02';

    const originalFindById = User.findById;
    const originalCountDocuments = User.countDocuments;

    User.findById = async (id) => {
      return {
        _id: id,
        role: 'admin',
        isActive: true,
        save: async function () { return this; },
      };
    };

    // Simulate 0 remaining active admins if adminId2 is removed
    User.countDocuments = async () => 0;

    try {
      await assert.rejects(
        async () => {
          await adminService.updateCustomerAccount(adminId1, adminId2, { isActive: false });
        },
        (err) => err instanceof BadRequestError && err.message.includes('Cannot demote or deactivate the last active administrator')
      );
    } finally {
      User.findById = originalFindById;
      User.countDocuments = originalCountDocuments;
    }
  });
});
