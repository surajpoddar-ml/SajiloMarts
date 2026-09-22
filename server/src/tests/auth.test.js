import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { USER_ROLES } from '../constants/roles.js';
import {
  registerCustomer,
  loginCustomer,
  normalizeEmail,
} from '../services/auth.service.js';
import {
  validateRegistrationInput,
  validateLoginInput,
} from '../validations/auth.validation.js';
import { toSafeUser, createAuthToken, verifyToken } from '../utils/index.js';
import { connectDatabase, disconnectDatabase } from '../database/connection.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Auth Test Suite');
console.log('====================================================');

async function testRegistrationSecurity() {
  console.log('🧪 Testing Customer Registration Security...');

  // 1. Validation test: Missing name
  assert.throws(
    () => validateRegistrationInput({ email: 'test@example.com', password: 'password123' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'name')
  );

  // 2. Validation test: Invalid email
  assert.throws(
    () => validateRegistrationInput({ name: 'John Doe', email: 'invalid-email', password: 'password123' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email')
  );

  // 3. Validation test: Short password
  assert.throws(
    () => validateRegistrationInput({ name: 'John Doe', email: 'john@example.com', password: 'short' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'password')
  );

  // 4. Validation test: Invalid phone
  assert.throws(
    () => validateRegistrationInput({ name: 'John Doe', email: 'john@example.com', password: 'password123', phone: '1234' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'phone')
  );

  // 5. Security test: Privilege & Role Injection Rejection
  assert.throws(
    () => validateRegistrationInput({
      name: 'Hacker',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'admin',
    }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'role')
  );

  // 6. Security test: Mass Assignment Extra Fields Rejection
  assert.throws(
    () => validateRegistrationInput({
      name: 'Attacker',
      email: 'attacker@example.com',
      password: 'password123',
      customSecret: 'payload',
    }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'extraFields')
  );

  // 7. Email Normalization
  assert.equal(normalizeEmail('  TEST.User@EXAMPLE.Com '), 'test.user@example.com');

  console.log('✅ Registration security & validation tests passed successfully');
}

async function testLoginAndAccountSecurity() {
  console.log('🧪 Testing Login and Account Status Security...');

  // 1. Validation test: Missing email
  assert.throws(
    () => validateLoginInput({ password: 'password123' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email')
  );

  // 2. Validation test: Missing password
  assert.throws(
    () => validateLoginInput({ email: 'user@example.com' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'password')
  );

  // 3. Validation test: Invalid email format
  assert.throws(
    () => validateLoginInput({ email: 'not-an-email', password: 'password123' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email')
  );

  // 4. Validation test: Reject extra unknown fields
  assert.throws(
    () => validateLoginInput({ email: 'user@example.com', password: 'password123', extra: 'bad' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'extraFields')
  );

  // 5. Valid Login Input
  const cleanLogin = validateLoginInput({ email: '  USER@example.COM ', password: 'secretpassword' });
  assert.equal(cleanLogin.email, 'user@example.com');
  assert.equal(cleanLogin.password, 'secretpassword');

  console.log('✅ Login and account status security tests passed successfully');
}

async function testSessionAndSerializationSecurity() {
  console.log('🧪 Testing Session Tokens and Safe Serialization Security...');

  // 1. Safe User Serialization Check
  const mockUserDoc = {
    _id: new mongoose.Types.ObjectId('650000000000000000000001'),
    name: 'Sita Sharma',
    email: 'sita@example.com',
    phone: '+977-9841234567',
    role: USER_ROLES.CUSTOMER,
    isActive: true,
    isEmailVerified: false,
    password: '$2a$12$SuperSecretHashedPasswordThatMustNeverBeExposed',
    passwordHash: '$2a$12$AnotherSecretHash',
    __v: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safeUser = toSafeUser(mockUserDoc);
  assert.equal(safeUser.id, '650000000000000000000001');
  assert.equal(safeUser.name, 'Sita Sharma');
  assert.equal(safeUser.email, 'sita@example.com');
  assert.equal(safeUser.role, USER_ROLES.CUSTOMER);
  assert.equal(safeUser.password, undefined);
  assert.equal(safeUser.passwordHash, undefined);
  assert.equal(safeUser.__v, undefined);

  // 2. Token creation and verification
  const token = createAuthToken(safeUser);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = verifyToken(token);
  assert.equal(decoded.userId, '650000000000000000000001');
  assert.equal(decoded.email, 'sita@example.com');
  assert.equal(decoded.role, USER_ROLES.CUSTOMER);

  // 3. Reject tampered token
  assert.throws(
    () => verifyToken(token + 'tampered'),
    (err) => err.name === 'JsonWebTokenError'
  );

  console.log('✅ Session tokens and safe serialization tests passed successfully');
}

async function testOwnershipIntegration() {
  console.log('🧪 Testing Request Ownership & Context Binding...');

  // Mock authenticated req context
  const mockCustomerReq = {
    user: {
      id: '650000000000000000000002',
      name: 'Ramesh Adhikari',
      email: 'ramesh@example.com',
      role: USER_ROLES.CUSTOMER,
    },
  };

  const { getAuthUserId, getAuthUser } = await import('../utils/authContext.js');

  const authUserId = getAuthUserId(mockCustomerReq);
  assert.equal(authUserId, '650000000000000000000002');

  const authUser = getAuthUser(mockCustomerReq);
  assert.equal(authUser.name, 'Ramesh Adhikari');

  // Verify unauthenticated request rejection
  assert.throws(
    () => getAuthUserId({}),
    (err) => err.name === 'UnauthorizedError'
  );

  console.log('✅ Request ownership and context binding tests passed successfully');
}

async function testAtlasIntegration() {
  console.log('🧪 Running MongoDB Atlas Live Authentication Integration Tests...');

  await connectDatabase();

  const testEmail = `live_test_${Date.now()}@sajilomarts.np`;
  const rawPassword = 'SecurePassword123!';

  // Clean up any stale record
  await User.deleteMany({ email: testEmail });

  try {
    // 1. Test live registration
    const { user: registeredUser, token: regToken } = await registerCustomer({
      name: 'Atlas Integration Tester',
      email: testEmail,
      password: rawPassword,
      phone: '+977-9812345678',
    });

    assert.ok(registeredUser.id);
    assert.equal(registeredUser.email, testEmail);
    assert.equal(registeredUser.role, USER_ROLES.CUSTOMER);
    assert.equal(registeredUser.isActive, true);
    assert.equal(registeredUser.isEmailVerified, false);
    assert.equal(registeredUser.password, undefined);
    assert.ok(regToken);

    // Verify hashed password persisted in DB
    const dbUser = await User.findById(registeredUser.id).select('+password');
    assert.ok(dbUser.password && (dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$')));

    // 2. Test duplicate registration rejection
    await assert.rejects(
      async () => {
        await registerCustomer({
          name: 'Duplicate Tester',
          email: testEmail.toUpperCase(), // Test case-insensitive duplicate
          password: 'anotherpassword',
        });
      },
      (err) => err.statusCode === 409
    );

    // 3. Test live customer login
    const { user: loggedInUser, token: loginToken } = await loginCustomer({
      email: testEmail,
      password: rawPassword,
    });

    assert.equal(loggedInUser.id, registeredUser.id);
    assert.ok(loginToken);

    // 4. Test wrong password rejection
    await assert.rejects(
      async () => {
        await loginCustomer({
          email: testEmail,
          password: 'wrongPassword123!',
        });
      },
      (err) => err.statusCode === 401
    );

    // 5. Test inactive account rejection
    await User.findByIdAndUpdate(registeredUser.id, { isActive: false });

    await assert.rejects(
      async () => {
        await loginCustomer({
          email: testEmail,
          password: rawPassword,
        });
      },
      (err) => err.statusCode === 401
    );

    console.log('✅ MongoDB Atlas authentication integration tests passed successfully');
  } finally {
    // Clean up isolated test record
    await User.deleteMany({ email: testEmail });
    await disconnectDatabase();
    console.log('🧹 Cleaned up isolated Atlas auth test record');
  }
}

async function runAll() {
  await testRegistrationSecurity();
  await testLoginAndAccountSecurity();
  await testSessionAndSerializationSecurity();
  await testOwnershipIntegration();
  await testAtlasIntegration();
  console.log('🎉 All SajiloMarts Auth tests PASSED successfully!');
}

runAll().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
