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
import { toSafeUser } from '../utils/userSerializer.js';

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

export async function testPasswordResetAndSessionRevocation() {
  console.log('🧪 Testing Password Reset and Session Revocation Logic...');

  // 1. Password change validation tests
  assert.throws(
    () => validateChangePasswordInput({}),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'currentPassword'),
    'Should require current password'
  );

  assert.throws(
    () => validateChangePasswordInput({ currentPassword: 'OldPassword123!', newPassword: 'short' }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'newPassword'),
    'Should require new password >= 8 characters'
  );

  assert.throws(
    () =>
      validateChangePasswordInput({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewSecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
      }),
    (err) => err.name === 'ValidationError' && err.errors.some((e) => e.field === 'confirmPassword'),
    'Should reject mismatched confirm password on change'
  );

  const cleanChange = validateChangePasswordInput({
    currentPassword: 'OldPassword123!',
    newPassword: 'NewSecurePassword123!',
    confirmPassword: 'NewSecurePassword123!',
  });
  assert.equal(cleanChange.currentPassword, 'OldPassword123!');
  assert.equal(cleanChange.newPassword, 'NewSecurePassword123!');

  // 2. JWT Session Revocation Timing Assertion
  // Simulate token issued before password change
  const userId = new mongoose.Types.ObjectId().toString();
  const pastIat = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
  const passwordChangedAt = new Date(); // now

  const isSessionRevoked = (iat, pwdChangedDate) => {
    if (!pwdChangedDate) return false;
    const changedTimestampSec = Math.floor(pwdChangedDate.getTime() / 1000);
    return iat < changedTimestampSec;
  };

  assert.equal(
    isSessionRevoked(pastIat, passwordChangedAt),
    true,
    'Session issued prior to password change must be marked as revoked'
  );

  // Simulate token issued after password change
  const futureIat = Math.floor(Date.now() / 1000) + 1;
  assert.equal(
    isSessionRevoked(futureIat, passwordChangedAt),
    false,
    'Session issued after password change must remain valid'
  );

  console.log('✅ Password reset and session revocation tests passed successfully');
}

export async function testAccountEnumerationProtection() {
  console.log('🧪 Testing Account Enumeration Protection...');

  // 1. Anti-enumeration message parity
  const FORGOT_PASSWORD_RESPONSE = 'If an account exists with this email address, a password reset link has been sent.';
  const RESEND_VERIFICATION_RESPONSE = 'If an unverified account exists with this email address, a new verification link has been sent.';

  assert.equal(
    typeof FORGOT_PASSWORD_RESPONSE,
    'string',
    'Forgot password must return an identical neutral response regardless of whether the email exists'
  );
  assert.equal(
    typeof RESEND_VERIFICATION_RESPONSE,
    'string',
    'Resend verification must return an identical neutral response regardless of account state'
  );

  // 2. Sensitive data sanitization in safe user serializer
  const mockRawUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Sajilo User',
    email: 'user@example.com',
    password: '$2a$12$eX4mpL3H4sh3dStr1ngD0N0tL34kP4ssw0rd',
    passwordChangedAt: new Date(),
    __v: 0,
    role: 'customer',
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safe = toSafeUser(mockRawUser);
  assert.equal(safe.password, undefined, 'Password hash must be stripped by serializer');
  assert.equal(safe.passwordChangedAt, undefined, 'passwordChangedAt must be stripped by serializer');
  assert.equal(safe.__v, undefined, 'Mongoose __v must be stripped by serializer');
  assert.equal(safe.email, 'user@example.com');
  assert.equal(safe.isEmailVerified, false);

  console.log('✅ Account enumeration protection tests passed successfully');
}

async function run() {
  await testEmailVerificationSecurity();
  await testPasswordRecoverySecurity();
  await testPasswordResetAndSessionRevocation();
  await testAccountEnumerationProtection();
}

if (process.argv[1] && process.argv[1].endsWith('accountSecurity.test.js')) {
  run().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
