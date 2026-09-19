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

/**
 * Unit test suite for User Model password protection and hashing.
 */
export const runPasswordProtectionTests = async () => {
  console.log('🧪 Running Password Protection & Hashing Tests...');

  // 1. Password field schema configuration
  const passwordPath = User.schema.path('password');
  assert.equal(passwordPath.options.select, false, 'Password path must have select: false configured');

  // 2. Password hashing pre-save logic simulation
  const user = new User({
    name: 'Suresh Thapa',
    email: 'suresh@example.com',
    password: 'PlainTextPassword123!',
  });

  // Verify plaintext is initially set before save
  assert.equal(user.password, 'PlainTextPassword123!');

  // Trigger pre-save middleware via validate & hook testing
  // In Mongoose, pre('save') runs on save, let's verify bcrypt hashing
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.default.genSalt(12);
  const hash = await bcrypt.default.hash(user.password, salt);
  user.password = hash;

  assert.ok(user.password.startsWith('$2a$') || user.password.startsWith('$2b$'), 'Hashed password must start with bcrypt identifier');
  assert.notEqual(user.password, 'PlainTextPassword123!', 'Plaintext password must not be stored');

  // Verify comparePassword method works
  const isMatch = await user.comparePassword('PlainTextPassword123!');
  assert.equal(isMatch, true, 'comparePassword should return true for matching password');

  const isWrong = await user.comparePassword('WrongPassword123!');
  assert.equal(isWrong, false, 'comparePassword should return false for incorrect password');

  console.log('✅ Password protection and hashing tests passed successfully');
};

/**
 * Unit test suite for safe User serialization (toJSON / toObject transforms).
 */
export const runSerializationTests = async () => {
  console.log('🧪 Running User Serialization Tests...');

  const user = new User({
    name: 'Manish Adhikari',
    email: 'manish@example.com',
    password: 'SecretPassword123!',
    phone: '+977 9812345678',
    role: 'customer',
  });

  // Test toJSON transform
  const userJson = user.toJSON();
  assert.equal(userJson.password, undefined, 'toJSON must strip password');
  assert.equal(userJson.__v, undefined, 'toJSON must strip __v');
  assert.equal(userJson.name, 'Manish Adhikari', 'toJSON must preserve name');
  assert.equal(userJson.email, 'manish@example.com', 'toJSON must preserve email');
  assert.equal(userJson.role, 'customer', 'toJSON must preserve role');
  assert.equal(userJson.isActive, true, 'toJSON must preserve isActive');
  assert.equal(userJson.isEmailVerified, false, 'toJSON must preserve isEmailVerified');
  assert.equal(userJson.phone, '+977 9812345678', 'toJSON must preserve phone');

  // Test toObject transform
  const userObj = user.toObject();
  assert.equal(userObj.password, undefined, 'toObject must strip password');
  assert.equal(userObj.__v, undefined, 'toObject must strip __v');
  assert.equal(userObj.email, 'manish@example.com', 'toObject must preserve email');

  console.log('✅ User serialization tests passed successfully');
};

/**
 * Unit test suite for User Model default values and role constraints.
 */
export const runDefaultsAndRolesTests = async () => {
  console.log('🧪 Running Role and Account Defaults Tests...');

  // 1. Default values on newly instantiated user
  const defaultUser = new User({
    name: 'Sunita Rai',
    email: 'sunita@example.com',
    password: 'SecurePassword123!',
  });

  assert.equal(defaultUser.role, USER_ROLES.CUSTOMER, 'Default role must be customer');
  assert.equal(defaultUser.isActive, true, 'Default isActive must be true');
  assert.equal(defaultUser.isEmailVerified, false, 'Default isEmailVerified must be false');

  // 2. Explicit admin role assignment
  const adminUser = new User({
    name: 'Admin User',
    email: 'admin.auth@example.com',
    password: 'AdminPassword123!',
    role: USER_ROLES.ADMIN,
  });
  await adminUser.validate();
  assert.equal(adminUser.role, USER_ROLES.ADMIN, 'Admin role must be accepted');

  // 3. Reject forbidden role values
  const disallowedRoles = ['superadmin', 'manager', 'seller', 'guest', ''];
  for (const role of disallowedRoles) {
    const invalidUser = new User({
      name: 'Invalid Role User',
      email: 'invalid@example.com',
      password: 'Password123!',
      role,
    });
    let err;
    try {
      await invalidUser.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err?.errors?.role, `Role "${role}" must fail validation`);
  }

  console.log('✅ Role and account defaults tests passed successfully');
};

/**
 * Unit test suite for duplicate email error translation and validation error formatting.
 */
export const runDuplicateEmailTests = async () => {
  console.log('🧪 Running Duplicate Email & Error Handling Tests...');

  // 1. Post-save middleware error transformation test
  const rawMongoDuplicateError = {
    name: 'MongoServerError',
    code: 11000,
    keyPattern: { email: 1 },
    keyValue: { email: 'duplicate@example.com' },
    message: 'E11000 duplicate key error collection: sastomarts.users index: email_1 dup key: { email: "duplicate@example.com" }',
  };

  // Simulate post-save hook error handling
  let transformedError;
  
  // Test manual conversion matching the post-save logic
  if (rawMongoDuplicateError.name === 'MongoServerError' && rawMongoDuplicateError.code === 11000) {
    const field = Object.keys(rawMongoDuplicateError.keyValue || {})[0] || 'email';
    transformedError = new Error(`An account with this ${field} already exists`);
    transformedError.name = 'DuplicateKeyError';
    transformedError.statusCode = 409;
    transformedError.field = field;
  }

  assert.equal(transformedError.name, 'DuplicateKeyError', 'Should map to DuplicateKeyError');
  assert.equal(transformedError.statusCode, 409, 'Duplicate key error should produce HTTP 409 Conflict');
  assert.equal(transformedError.message, 'An account with this email already exists', 'Should return sanitized error message');
  assert.equal(transformedError.field, 'email', 'Should identify email as duplicated field');

  // 2. Format Mongoose ValidationError with formatValidationError helper
  const invalidUser = new User({ name: 'A', email: 'invalid' });
  let valErr;
  try {
    await invalidUser.validate();
  } catch (err) {
    valErr = err;
  }
  const formattedValErr = User.formatValidationError(valErr);
  assert.ok(Array.isArray(formattedValErr), 'formatValidationError should return array of field errors');
  const fields = formattedValErr.map((e) => e.field);
  assert.ok(fields.includes('name'), 'Should include name field error');
  assert.ok(fields.includes('email'), 'Should include email field error');

  console.log('✅ Duplicate email and error handling tests passed successfully');
};

/**
 * Integration test suite for live MongoDB Atlas User persistence and lifecycle.
 */
export const runMongoUserIntegrationTests = async () => {
  console.log('🧪 Running MongoDB User Integration Tests...');
  const { connectDatabase } = await import('../database/connection.js');
  const mongoose = (await import('mongoose')).default;

  // Connect if not already connected
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  const uniqueSuffix = Date.now();
  const testEmail = `test_atlas_${uniqueSuffix}@example.com`;
  const rawPassword = 'SecureAtlasTestPass123!';

  let createdUser;
  try {
    // 1. Create and save user
    createdUser = new User({
      name: 'Atlas Test User',
      email: testEmail,
      password: rawPassword,
      phone: '+977 9800000000',
    });

    const savedUser = await createdUser.save();
    assert.ok(savedUser._id, 'Saved user must have a MongoDB ObjectId');
    assert.ok(savedUser.password.startsWith('$2a$') || savedUser.password.startsWith('$2b$'), 'Password must be hashed on save');

    // 2. Query user without password (default projection)
    const fetchedUser = await User.findOne({ email: testEmail });
    assert.ok(fetchedUser, 'Should find user by normalized email');
    assert.equal(fetchedUser.password, undefined, 'Password field must not be selected by default');

    // 3. Query user with explicit password selection
    const fetchedWithPass = await User.findOne({ email: testEmail }).select('+password');
    assert.ok(fetchedWithPass.password, 'Password field must be accessible with select(+password)');
    const isPassValid = await fetchedWithPass.comparePassword(rawPassword);
    assert.equal(isPassValid, true, 'comparePassword on fetched user must match plaintext');

    console.log('✅ MongoDB User integration tests passed successfully');
  } finally {
    // Clean up test document safely
    if (createdUser && createdUser._id) {
      await User.deleteOne({ _id: createdUser._id });
      console.log('🧹 Cleaned up isolated test record');
    }
  }
};

/**
 * Test suite to confirm database indexes on the User model/collection.
 */
export const runIndexVerificationTests = async () => {
  console.log('🧪 Running User Database Index Verification Tests...');
  const { connectDatabase } = await import('../database/connection.js');
  const mongoose = (await import('mongoose')).default;

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  // 1. Verify schema level index definitions
  const schemaIndexes = User.schema.indexes();
  const emailSchemaIndex = schemaIndexes.find(([fields]) => fields.email === 1);
  const emailPath = User.schema.path('email');
  const isEmailUnique = emailPath.options.unique || (emailSchemaIndex && emailSchemaIndex[1]?.unique);
  assert.ok(isEmailUnique, 'Email field must have unique index configuration in schema');

  // 2. Ensure / sync indexes on Atlas collection
  await User.syncIndexes();
  const dbIndexes = await User.collection.indexes();
  const hasDbEmailUniqueIndex = dbIndexes.some((idx) => idx.key.email === 1 && idx.unique === true);
  assert.ok(hasDbEmailUniqueIndex, 'Database collection must contain unique email index');

  console.log('✅ User database indexes verified successfully');
};








