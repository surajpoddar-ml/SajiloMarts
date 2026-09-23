import assert from 'node:assert/strict';
import { authService } from '../services/auth.service.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend Account Security Test Suite');
console.log('====================================================');

// 1. Email Regex & Phone Regex Validation Check
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;
const HEX_TOKEN_REGEX = /^[a-fA-F0-9]{64}$/;

assert.ok(EMAIL_REGEX.test('customer@sajilomarts.com'));
assert.ok(EMAIL_REGEX.test('user.test+sasto@example.np'));
assert.ok(!EMAIL_REGEX.test('plainaddress'));
assert.ok(!EMAIL_REGEX.test('@missingusername.com'));

// Phone numbers (Nepal and India formats)
assert.ok(PHONE_REGEX.test('+9779801234567'));
assert.ok(PHONE_REGEX.test('+919876543210'));
assert.ok(PHONE_REGEX.test('9801234567'));
assert.ok(!PHONE_REGEX.test('12345'));

// Token regex check
assert.ok(HEX_TOKEN_REGEX.test('a'.repeat(64)));
assert.ok(HEX_TOKEN_REGEX.test('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'));
assert.ok(!HEX_TOKEN_REGEX.test('invalid-token-short'));
assert.ok(!HEX_TOKEN_REGEX.test('g'.repeat(64))); // Non-hex character

console.log('✅ Client validation patterns passed');

// 2. Client Authentication & Account Security Service Shape Check
assert.equal(typeof authService.register, 'function');
assert.equal(typeof authService.login, 'function');
assert.equal(typeof authService.getMe, 'function');
assert.equal(typeof authService.logout, 'function');
assert.equal(typeof authService.verifyEmail, 'function');
assert.equal(typeof authService.resendVerification, 'function');
assert.equal(typeof authService.forgotPassword, 'function');
assert.equal(typeof authService.resetPassword, 'function');
assert.equal(typeof authService.changePassword, 'function');

console.log('✅ Client authService account security method signatures verified');

console.log('🎉 All frontend authentication & account security unit checks PASSED!');
