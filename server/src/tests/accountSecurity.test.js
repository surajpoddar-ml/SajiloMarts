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

async function run() {
  await testEmailVerificationSecurity();
}

if (process.argv[1] && process.argv[1].endsWith('accountSecurity.test.js')) {
  run().catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}
