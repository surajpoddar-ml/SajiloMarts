import test from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { Address } from '../models/address.model.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { addressService } from '../services/address.service.js';
import { productRequestService } from '../services/productRequest.service.js';

dotenv.config();

test('MongoDB Atlas Authorization & Model Integration Test Suite', async (t) => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI not configured, skipping Atlas live integration test.');
    return;
  }

  await connectDatabase();
  console.log('📦 Connected to MongoDB Atlas for RBAC & Authorization verification');

  const testSuffix = Date.now();
  const customerEmail = `atlas.cust.${testSuffix}@sastomarts.com`;
  const adminEmail = `atlas.admin.${testSuffix}@sastomarts.com`;

  let customerUser = null;
  let adminUser = null;
  let createdAddress = null;
  let createdRequest = null;

  try {
    await t.test('1. Atlas verifies valid role creation and default role', async () => {
      customerUser = await User.create({
        name: 'Atlas Customer',
        email: customerEmail,
        password: 'Password123!',
        role: USER_ROLES.CUSTOMER,
        isActive: true,
        isEmailVerified: true,
      });

      assert.equal(customerUser.role, 'customer');

      adminUser = await User.create({
        name: 'Atlas Admin',
        email: adminEmail,
        password: 'Password123!',
        role: USER_ROLES.ADMIN,
        isActive: true,
        isEmailVerified: true,
      });

      assert.equal(adminUser.role, 'admin');
    });

    await t.test('2. Atlas schema rejects invalid roles', async () => {
      await assert.rejects(
        async () => {
          await User.create({
            name: 'Invalid Role User',
            email: `invalid.role.${testSuffix}@sastomarts.com`,
            password: 'Password123!',
            role: 'superadmin',
          });
        },
        (err) => err.name === 'ValidationError'
      );
    });

    await t.test('3. Address ownership persistence in Atlas', async () => {
      createdAddress = await addressService.createAddress(customerUser._id.toString(), {
        fullName: 'Atlas Test Address',
        phone: '+9779801234567',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        municipality: 'Kathmandu Metropolitan City',
        wardNumber: 3,
        tole: 'New Road',
        isDefaultShipping: true,
      });

      assert.equal(createdAddress.userId.toString(), customerUser._id.toString());

      // Read back with ownership verification
      const fetched = await addressService.getAddressForUser(customerUser._id.toString(), createdAddress._id.toString());
      assert.equal(fetched.fullName, 'Atlas Test Address');
      assert.equal(fetched.tole, 'New Road');
    });

    await t.test('4. Product Request ownership persistence in Atlas', async () => {
      createdRequest = await productRequestService.createRequest(customerUser._id.toString(), {
        productName: 'Atlas Sourcing Product',
        productUrl: 'https://www.flipkart.com/item/123',
        productPriceInr: 1000,
        quantity: 2,
        paymentMode: 'online_100',
      });

      assert.equal(createdRequest.user.toString(), customerUser._id.toString());
      assert.equal(createdRequest.status, REQUEST_STATUSES.SUBMITTED);

      // Verify admin details retrieval
      const adminDetails = await productRequestService.getAdminRequestDetails(adminUser._id.toString(), createdRequest._id.toString());
      assert.equal(adminDetails.productName, 'Atlas Sourcing Product');
      assert.equal(adminDetails.user.email, customerEmail);
    });
  } finally {
    // Clean up created Atlas documents
    if (createdAddress) {
      await Address.findByIdAndDelete(createdAddress._id);
    }
    if (createdRequest) {
      await ProductRequest.findByIdAndDelete(createdRequest._id);
    }
    if (customerUser) {
      await User.findByIdAndDelete(customerUser._id);
    }
    if (adminUser) {
      await User.findByIdAndDelete(adminUser._id);
    }
    await disconnectDatabase();
    console.log('🧹 Cleaned up Atlas RBAC test documents and disconnected cleanly');
  }
});
