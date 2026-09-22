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

async function runAll() {
  await testRegistrationSecurity();
  console.log('🎉 Auth Registration Security tests completed!');
}

runAll().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
