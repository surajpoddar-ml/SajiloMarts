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
