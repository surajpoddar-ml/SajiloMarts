import assert from 'node:assert/strict';
import { User, USER_ROLES } from '../models/user.model.js';

/**
 * Unit test suite for User Model validation and normalization rules.
 */
export const runUserValidationTests = async () => {
  console.log('🧪 Running Core User Validation Tests...');

  // 1. Test missing required fields
  const emptyUser = new User({});
  let validationErr;
  try {
    await emptyUser.validate();
  } catch (err) {
    validationErr = err;
  }
  assert.ok(validationErr, 'Validation error should be thrown for empty user');
  assert.ok(validationErr.errors.name, 'Name should be required');
  assert.ok(validationErr.errors.email, 'Email should be required');
  assert.ok(validationErr.errors.password, 'Password should be required');

  // 2. Test short name validation
  const shortNameUser = new User({ name: 'A', email: 'test@example.com', password: 'Password123!' });
  let shortNameErr;
  try {
    await shortNameUser.validate();
  } catch (err) {
    shortNameErr = err;
  }
  assert.ok(shortNameErr?.errors?.name, 'Name under 2 chars should fail validation');

  // 3. Test short password validation
  const shortPasswordUser = new User({ name: 'Valid Name', email: 'test@example.com', password: '123' });
  let shortPasswordErr;
  try {
    await shortPasswordUser.validate();
  } catch (err) {
    shortPasswordErr = err;
  }
  assert.ok(shortPasswordErr?.errors?.password, 'Password under 8 chars should fail validation');

  // 4. Test invalid email format
  const invalidEmailUser = new User({ name: 'Valid Name', email: 'invalid-email', password: 'Password123!' });
  let invalidEmailErr;
  try {
    await invalidEmailUser.validate();
  } catch (err) {
    invalidEmailErr = err;
  }
  assert.ok(invalidEmailErr?.errors?.email, 'Malformed email should fail validation');

  // 5. Test invalid role string
  const invalidRoleUser = new User({ name: 'Valid Name', email: 'test@example.com', password: 'Password123!', role: 'superadmin' });
  let invalidRoleErr;
  try {
    await invalidRoleUser.validate();
  } catch (err) {
    invalidRoleErr = err;
  }
  assert.ok(invalidRoleErr?.errors?.role, 'Arbitrary role should fail validation');

  // 6. Test valid customer user document
  const validUser = new User({
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    password: 'SecurePassword123!',
    phone: '+977 9841234567',
  });
  await validUser.validate();

  console.log('✅ Core User validation tests passed successfully');
};

/**
 * Unit test suite for User Model email normalization.
 */
export const runEmailNormalizationTests = async () => {
  console.log('🧪 Running Email Normalization Tests...');

  // 1. Email lowercase conversion
  const upperCaseUser = new User({
    name: 'Priya Patel',
    email: 'Priya.Patel@EXAMPLE.COM',
    password: 'Password123!',
  });
  assert.equal(upperCaseUser.email, 'priya.patel@example.com', 'Email should be normalized to lowercase');

  // 2. Email whitespace trimming
  const paddedUser = new User({
    name: 'Priya Patel',
    email: '   user.test@example.com   ',
    password: 'Password123!',
  });
  assert.equal(paddedUser.email, 'user.test@example.com', 'Email should be trimmed of whitespace');

  // 3. Combined mixed case with leading/trailing spaces
  const mixedUser = new User({
    name: 'Priya Patel',
    email: '  User@Example.COM  ',
    password: 'Password123!',
  });
  assert.equal(mixedUser.email, 'user@example.com', 'Mixed-case whitespace-padded email should normalize');

  console.log('✅ Email normalization tests passed successfully');
};

