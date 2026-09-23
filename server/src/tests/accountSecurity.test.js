import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { SecurityToken } from '../models/securityToken.model.js';
import { SECURITY_TOKEN_PURPOSES } from '../constants/auth.constants.js';
import { USER_ROLES } from '../constants/roles.js';
import {
  generateRawToken,
  hashSecurityToken,
  generateSecurityTokenPair,
} from '../utils/securityToken.js';
import {
  validateVerifyEmailInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
  sanitizeSecurityPayload,
} from '../validations/auth.validation.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Account Security Test Suite');
console.log('====================================================');

export async function testEmailVerificationSecurity() {
  console.log('🧪 Testing Email Verification Security...');

  // 1. Validation tests for verify email input
  assert.throws(
    () => validateVerifyEmailInput({}),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'token'),
    'Should require token'
  );

  assert.throws(
    () => validateVerifyEmailInput({ token: 'short' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'token'),
    'Should reject short token format'
  );

  assert.throws(
    () => validateVerifyEmailInput({ token: 'a'.repeat(64), unexpectedField: 'bad' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'extraFields'),
    'Should reject extra fields'
  );

  // Prototype pollution and injection key protection
  assert.throws(
    () => sanitizeSecurityPayload(JSON.parse('{"__proto__": {"admin": true}}')),
    (err) => err.name === 'ValidationError',
    'Should reject __proto__'
  );

  assert.throws(
    () => sanitizeSecurityPayload({ constructor: { prototype: {} } }),
    (err) => err.name === 'ValidationError',
    'Should reject constructor override'
  );

  assert.throws(
    () => sanitizeSecurityPayload({ '$where': 'sleep(1000)' }),
    (err) => err.name === 'ValidationError',
    'Should reject MongoDB operator keys'
  );

  // 2. Resend verification input validation
  assert.throws(
    () => validateResendVerificationInput({ email: 'invalid-email-format' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email'),
    'Should reject malformed email'
  );

  const cleanResend = validateResendVerificationInput({ email: '  CUSTOMER@EXAMPLE.COM ' });
  assert.equal(cleanResend.email, 'customer@example.com', 'Should normalize email in resend payload');

  // 3. Token Generation and Cryptographic Properties
  const { rawToken, tokenHash } = generateSecurityTokenPair(32);
  assert.equal(rawToken.length, 64, 'Raw token should be 64 hex characters (32 bytes entropy)');
  assert.equal(tokenHash.length, 64, 'Token hash should be 64 hex characters (SHA-256 digest)');
  assert.notEqual(rawToken, tokenHash, 'Raw token and token hash must never be identical');

  const rehashed = hashSecurityToken(rawToken);
  assert.equal(rehashed, tokenHash, 'Re-hashing the raw token must deterministically match tokenHash');

  // 4. Token Purpose Isolation Constants
  assert.equal(SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION, 'email_verification');
  assert.equal(SECURITY_TOKEN_PURPOSES.PASSWORD_RESET, 'password_reset');
  assert.notEqual(SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION, SECURITY_TOKEN_PURPOSES.PASSWORD_RESET);

  console.log('✅ Email verification security tests passed successfully');
}

export async function testPasswordRecoverySecurity() {
  console.log('🧪 Testing Password Recovery Security...');

  // 1. Forgot password input validation
  assert.throws(
    () => validateForgotPasswordInput({}),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email'),
    'Should require email for forgot password'
  );

  assert.throws(
    () => validateForgotPasswordInput({ email: 'invalid-email' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'email'),
    'Should reject invalid email format'
  );

  assert.throws(
    () => validateForgotPasswordInput({ email: 'valid@example.com', role: 'admin' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'extraFields'),
    'Should reject extra fields on forgot password payload'
  );

  const cleanForgot = validateForgotPasswordInput({ email: ' USER@EXAMple.COM  ' });
  assert.equal(cleanForgot.email, 'user@example.com', 'Should normalize email to trimmed lowercase');

  // 2. Reset password input validation
  assert.throws(
    () => validateResetPasswordInput({ token: 'short', password: 'newpassword123' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'token'),
    'Should reject invalid token format'
  );

  assert.throws(
    () => validateResetPasswordInput({ token: 'a'.repeat(64), password: 'short' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'password'),
    'Should reject short password'
  );

  assert.throws(
    () =>
      validateResetPasswordInput({
        token: 'a'.repeat(64),
        password: 'ValidPassword123!',
        confirmPassword: 'MismatchPassword123!',
      }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'confirmPassword'),
    'Should reject mismatched confirm password'
  );

  const cleanReset = validateResetPasswordInput({
    token: '  ' + 'f'.repeat(64) + '  ',
    password: 'SecureNewPassword123',
    confirmPassword: 'SecureNewPassword123',
  });
  assert.equal(cleanReset.token, 'f'.repeat(64));
  assert.equal(cleanReset.password, 'SecureNewPassword123');

  console.log('✅ Password recovery security tests passed successfully');
}

async function run() {
  await testEmailVerificationSecurity();
  await testPasswordRecoverySecurity();
}

if (process.argv[1] && process.argv[1].endsWith('accountSecurity.test.js')) {
  run().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
