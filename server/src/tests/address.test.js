import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Address, ADDRESS_LABELS, DEFAULT_COUNTRY, WARD_BOUNDARIES } from '../models/address.model.js';
import { addressService } from '../services/address.service.js';

/**
 * Unit tests for Address schema validation and default behaviors.
 */
export const runAddressValidationTests = async () => {
  console.log('🧪 Running Address Validation Tests...');

  const validUserId = new mongoose.Types.ObjectId();

  // 1. Missing required fields
  const emptyAddress = new Address({});
  let valErr;
  try {
    await emptyAddress.validate();
  } catch (err) {
    valErr = err;
  }
  assert.ok(valErr, 'Validation error should be thrown for empty address');
  assert.ok(valErr.errors.userId, 'userId must be required');
  assert.ok(valErr.errors.fullName, 'fullName must be required');
  assert.ok(valErr.errors.phone, 'phone must be required');
  assert.ok(valErr.errors.province, 'province must be required');
  assert.ok(valErr.errors.district, 'district must be required');
  assert.ok(valErr.errors.municipality, 'municipality must be required');
  assert.ok(valErr.errors.wardNumber, 'wardNumber must be required');
  assert.ok(valErr.errors.tole, 'tole must be required');

  // 2. Invalid ward number boundaries (below 1 or above 50 or float)
  const invalidWardUnder = new Address({
    userId: validUserId,
    fullName: 'Ramesh Sharma',
    phone: '+977 9841234567',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 0,
    tole: 'New Road',
  });
  let wardErr;
  try {
    await invalidWardUnder.validate();
  } catch (err) {
    wardErr = err;
  }
  assert.ok(wardErr?.errors?.wardNumber, 'Ward 0 should fail validation');

  const invalidWardOver = new Address({
    userId: validUserId,
    fullName: 'Ramesh Sharma',
    phone: '+977 9841234567',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 51,
    tole: 'New Road',
  });
  let wardOverErr;
  try {
    await invalidWardOver.validate();
  } catch (err) {
    wardOverErr = err;
  }
  assert.ok(wardOverErr?.errors?.wardNumber, 'Ward 51 should fail validation');

  // 3. Invalid phone number format
  const invalidPhoneAddress = new Address({
    userId: validUserId,
    fullName: 'Ramesh Sharma',
    phone: '12345',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 10,
    tole: 'New Road',
  });
  let phoneErr;
  try {
    await invalidPhoneAddress.validate();
  } catch (err) {
    phoneErr = err;
  }
  assert.ok(phoneErr?.errors?.phone, 'Invalid phone number should fail validation');

  // 4. Invalid label enum
  const invalidLabelAddress = new Address({
    userId: validUserId,
    fullName: 'Ramesh Sharma',
    phone: '+977 9841234567',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 10,
    tole: 'New Road',
    label: 'vacation-home',
  });
  let labelErr;
  try {
    await invalidLabelAddress.validate();
  } catch (err) {
    labelErr = err;
  }
  assert.ok(labelErr?.errors?.label, 'Invalid label should fail validation');

  // 5. Valid address with defaults check
  const validAddress = new Address({
    userId: validUserId,
    fullName: 'Ramesh Sharma',
    phone: '+977 9841234567',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    wardNumber: 10,
    tole: 'New Road',
    street: 'Kanti Path',
    landmark: 'Opposite Bishal Bazaar',
  });
  await validAddress.validate();

  assert.equal(validAddress.country, DEFAULT_COUNTRY, 'Country should default to Nepal');
  assert.equal(validAddress.label, ADDRESS_LABELS.HOME, 'Label should default to home');
  assert.equal(validAddress.isActive, true, 'isActive should default to true');
  assert.equal(validAddress.isDefaultShipping, false, 'isDefaultShipping should default to false');
  assert.equal(validAddress.isDefaultBilling, false, 'isDefaultBilling should default to false');

  console.log('✅ Address validation tests passed successfully');
};

/**
 * Unit tests for address ownership security and isolation.
 */
export const runAddressOwnershipTests = async () => {
  console.log('🧪 Running Address Ownership Tests...');

  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const addressAId = new mongoose.Types.ObjectId().toString();

  // Mock Address.findById to return User A's address
  const originalFindById = Address.findById;
  Address.findById = (id) => ({
    _id: id,
    userId: userAId,
    fullName: 'User A Recipient',
    phone: '+977 9841111111',
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu',
    wardNumber: 1,
    tole: 'Thamel',
    country: 'Nepal',
    label: 'home',
    isActive: true,
    isDefaultShipping: true,
    isDefaultBilling: false,
    save: async function () { return this; },
  });

  try {
    // 1. User A retrieves own address -> succeeds
    const userAAddress = await addressService.getAddressForUser(userAId, addressAId);
    assert.equal(userAAddress.userId, userAId, 'User A should access their own address');

    // 2. User B tries to retrieve User A's address -> ForbiddenError
    let getErr;
    try {
      await addressService.getAddressForUser(userBId, addressAId);
    } catch (err) {
      getErr = err;
    }
    assert.equal(getErr?.statusCode, 403, 'User B should get 403 Forbidden accessing User A address');

    // 3. User B tries to update User A's address -> ForbiddenError
    let updateErr;
    try {
      await addressService.updateAddress(userBId, addressAId, { fullName: 'Hacker Name' });
    } catch (err) {
      updateErr = err;
    }
    assert.equal(updateErr?.statusCode, 403, 'User B should get 403 Forbidden updating User A address');

    // 4. User B tries to deactivate User A's address -> ForbiddenError
    let deactErr;
    try {
      await addressService.deactivateAddress(userBId, addressAId);
    } catch (err) {
      deactErr = err;
    }
    assert.equal(deactErr?.statusCode, 403, 'User B should get 403 Forbidden deactivating User A address');

    console.log('✅ Address ownership security tests passed successfully');
  } finally {
    Address.findById = originalFindById;
  }
};

/**
 * Unit tests for default shipping address logic.
 */
export const runShippingDefaultTests = async () => {
  console.log('🧪 Running Shipping Default Tests...');

  const userId = new mongoose.Types.ObjectId().toString();
  const addressId1 = new mongoose.Types.ObjectId().toString();
  const addressId2 = new mongoose.Types.ObjectId().toString();

  // Mock addresses in memory
  const addressStore = [
    {
      _id: addressId1,
      userId,
      fullName: 'Default Recipient',
      phone: '+977 9841234567',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      wardNumber: 3,
      tole: 'Lazimpat',
      country: 'Nepal',
      label: 'home',
      isActive: true,
      isDefaultShipping: true,
      isDefaultBilling: false,
      save: async function () { return this; },
    },
    {
      _id: addressId2,
      userId,
      fullName: 'Second Recipient',
      phone: '+977 9841234567',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      wardNumber: 4,
      tole: 'Baluwatar',
      country: 'Nepal',
      label: 'work',
      isActive: true,
      isDefaultShipping: false,
      isDefaultBilling: false,
      save: async function () { return this; },
    },
  ];

  const origFindById = Address.findById;
  const origUpdateMany = Address.updateMany;
  const origFindOne = Address.findOne;

  Address.findById = (id) => addressStore.find((a) => a._id === id);
  Address.updateMany = async (filter, update) => {
    for (const a of addressStore) {
      if (a.userId === filter.userId && (!filter._id?.$ne || a._id !== filter._id.$ne)) {
        if (update.$set?.isDefaultShipping !== undefined) {
          a.isDefaultShipping = update.$set.isDefaultShipping;
        }
      }
    }
  };
  Address.findOne = (query) => addressStore.find((a) => a.userId === query.userId && a.isActive && a.isDefaultShipping);

  try {
    // 1. Initial check - address 1 is default shipping
    const initialDefault = await addressService.getDefaultShippingAddress(userId);
    assert.equal(initialDefault._id, addressId1, 'Address 1 should initially be default shipping');

    // 2. Set address 2 as default shipping
    await addressService.setDefaultShippingAddress(userId, addressId2);
    assert.equal(addressStore[0].isDefaultShipping, false, 'Address 1 should no longer be default shipping');
    assert.equal(addressStore[1].isDefaultShipping, true, 'Address 2 should now be default shipping');

    // 3. Inactive address cannot be set as default shipping
    addressStore[0].isActive = false;
    let inactiveErr;
    try {
      await addressService.setDefaultShippingAddress(userId, addressId1);
    } catch (err) {
      inactiveErr = err;
    }
    assert.equal(inactiveErr?.statusCode, 400, 'Inactive address cannot be set as default shipping');

    console.log('✅ Shipping default tests passed successfully');
  } finally {
    Address.findById = origFindById;
    Address.updateMany = origUpdateMany;
    Address.findOne = origFindOne;
  }
};

/**
 * Unit tests for default billing address logic.
 */
export const runBillingDefaultTests = async () => {
  console.log('🧪 Running Billing Default Tests...');

  const userId = new mongoose.Types.ObjectId().toString();
  const addressId1 = new mongoose.Types.ObjectId().toString();
  const addressId2 = new mongoose.Types.ObjectId().toString();

  const addressStore = [
    {
      _id: addressId1,
      userId,
      fullName: 'Billing Recipient 1',
      phone: '+977 9841234567',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      wardNumber: 3,
      tole: 'Lazimpat',
      country: 'Nepal',
      label: 'work',
      isActive: true,
      isDefaultShipping: true,
      isDefaultBilling: true,
      save: async function () { return this; },
    },
    {
      _id: addressId2,
      userId,
      fullName: 'Billing Recipient 2',
      phone: '+977 9841234567',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      wardNumber: 4,
      tole: 'Baluwatar',
      country: 'Nepal',
      label: 'home',
      isActive: true,
      isDefaultShipping: false,
      isDefaultBilling: false,
      save: async function () { return this; },
    },
  ];

  const origFindById = Address.findById;
  const origUpdateMany = Address.updateMany;
  const origFindOne = Address.findOne;

  Address.findById = (id) => addressStore.find((a) => a._id === id);
  Address.updateMany = async (filter, update) => {
    for (const a of addressStore) {
      if (a.userId === filter.userId && (!filter._id?.$ne || a._id !== filter._id.$ne)) {
        if (update.$set?.isDefaultBilling !== undefined) {
          a.isDefaultBilling = update.$set.isDefaultBilling;
        }
      }
    }
  };
  Address.findOne = (query) => addressStore.find((a) => a.userId === query.userId && a.isActive && a.isDefaultBilling);

  try {
    // 1. Initial check - address 1 is default billing
    const initialDefault = await addressService.getDefaultBillingAddress(userId);
    assert.equal(initialDefault._id, addressId1, 'Address 1 should initially be default billing');

    // 2. Set address 2 as default billing
    await addressService.setDefaultBillingAddress(userId, addressId2);
    assert.equal(addressStore[0].isDefaultBilling, false, 'Address 1 should no longer be default billing');
    assert.equal(addressStore[1].isDefaultBilling, true, 'Address 2 should now be default billing');
    // Note: Address 1 remains default shipping (independent)
    assert.equal(addressStore[0].isDefaultShipping, true, 'Address 1 should maintain shipping default independently');

    console.log('✅ Billing default tests passed successfully');
  } finally {
    Address.findById = origFindById;
    Address.updateMany = origUpdateMany;
    Address.findOne = origFindOne;
  }
};

/**
 * Live MongoDB Atlas integration test for the Address model and service.
 */
export const runMongoAddressIntegrationTests = async () => {
  console.log('🧪 Running MongoDB Address Atlas Integration Tests...');
  const { connectDatabase } = await import('../database/connection.js');
  const { User } = await import('../models/user.model.js');
  const mongoose = (await import('mongoose')).default;

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  const uniqueSuffix = Date.now();
  let testUser;
  const createdAddressIds = [];

  try {
    // 1. Create temporary test User
    testUser = await User.create({
      name: 'Address Test User',
      email: `address_test_${uniqueSuffix}@example.com`,
      password: 'SecureAddressPass123!',
      phone: '+977 9801234567',
    });

    // 2. Sync indexes
    await Address.syncIndexes();
    const indexes = await Address.collection.indexes();
    assert.ok(indexes.some((idx) => idx.key.userId === 1 && idx.key.isActive === 1), 'Compound index userId+isActive should exist');

    // 3. Create address 1 via service
    const addr1 = await addressService.createAddress(testUser._id.toString(), {
      fullName: 'Suman Thapa',
      phone: '+977 9841000001',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      wardNumber: 3,
      tole: 'Maharajgunj',
      isDefaultShipping: true,
      isDefaultBilling: true,
    });
    createdAddressIds.push(addr1._id);
    assert.equal(addr1.isDefaultShipping, true);
    assert.equal(addr1.isDefaultBilling, true);

    // 4. Create address 2 setting isDefaultShipping = true
    const addr2 = await addressService.createAddress(testUser._id.toString(), {
      fullName: 'Suman Thapa Office',
      phone: '+977 9841000002',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      wardNumber: 4,
      tole: 'Baluwatar',
      isDefaultShipping: true,
      label: 'work',
    });
    createdAddressIds.push(addr2._id);

    // Verify address 1 is no longer default shipping, but remains default billing
    const refreshedAddr1 = await Address.findById(addr1._id);
    assert.equal(refreshedAddr1.isDefaultShipping, false, 'Addr 1 shipping default should have been cleared');
    assert.equal(refreshedAddr1.isDefaultBilling, true, 'Addr 1 billing default should remain');

    // 5. Query user addresses
    const userAddresses = await addressService.getUserAddresses(testUser._id.toString());
    assert.equal(userAddresses.length, 2, 'User should have 2 active addresses');

    // 6. Deactivate address 2
    const deactivatedAddr2 = await addressService.deactivateAddress(testUser._id.toString(), addr2._id.toString());
    assert.equal(deactivatedAddr2.isActive, false, 'Addr 2 should be inactive');
    assert.equal(deactivatedAddr2.isDefaultShipping, false, 'Inactive addr cannot remain default shipping');

    console.log('✅ MongoDB Address Atlas integration tests passed successfully');
  } finally {
    // Clean up test documents safely
    if (createdAddressIds.length > 0) {
      await Address.deleteMany({ _id: { $in: createdAddressIds } });
    }
    if (testUser && testUser._id) {
      await User.deleteOne({ _id: testUser._id });
    }
    console.log('🧹 Cleaned up isolated address integration test records');
  }
};

/**
 * Master test runner executing all Address unit and Atlas integration tests.
 */
export const runAllAddressTests = async () => {
  console.log('====================================================');
  console.log('🚀 Executing Complete Address Model & Service Test Suite');
  console.log('====================================================');

  await runAddressValidationTests();
  await runAddressOwnershipTests();
  await runShippingDefaultTests();
  await runBillingDefaultTests();
  await runMongoAddressIntegrationTests();

  console.log('====================================================');
  console.log('🎉 All Address unit & Atlas integration tests PASSED!');
  console.log('====================================================');
};

if (process.argv[1]?.includes('address.test.js')) {
  runAllAddressTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Address test suite failed:', err);
      process.exit(1);
    });
}



