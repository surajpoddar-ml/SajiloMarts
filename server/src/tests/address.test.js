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

