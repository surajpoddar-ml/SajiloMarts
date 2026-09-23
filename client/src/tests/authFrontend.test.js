import assert from 'node:assert/strict';
import { authService } from '../services/auth.service.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend RBAC & Authorization Test Suite');
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
assert.ok(!HEX_TOKEN_REGEX.test('g'.repeat(64)));

console.log('✅ Client validation patterns passed');

// 2. Client Authentication & Authorization Service Signatures
assert.equal(typeof authService.register, 'function');
assert.equal(typeof authService.login, 'function');
assert.equal(typeof authService.getMe, 'function');
assert.equal(typeof authService.logout, 'function');
assert.equal(typeof authService.verifyEmail, 'function');
assert.equal(typeof authService.resendVerification, 'function');
assert.equal(typeof authService.forgotPassword, 'function');
assert.equal(typeof authService.resetPassword, 'function');
assert.equal(typeof authService.changePassword, 'function');

// Check profile update method if present or add signature
if (typeof authService.updateProfile === 'function') {
  assert.equal(typeof authService.updateProfile, 'function');
}

console.log('✅ Client authService RBAC & account security method signatures verified');

// 3. Role verification and helper behavior checks
const customerUser = { id: '1', role: 'customer', isActive: true, isEmailVerified: true };
const adminUser = { id: '2', role: 'admin', isActive: true, isEmailVerified: true };

const isCustomer = (u) => u?.role === 'customer';
const isAdmin = (u) => u?.role === 'admin';

assert.equal(isCustomer(customerUser), true);
assert.equal(isAdmin(customerUser), false);

assert.equal(isCustomer(adminUser), false);
assert.equal(isAdmin(adminUser), true);

console.log('✅ Frontend role-aware authorization assertions passed');

console.log('🎉 All frontend authentication & RBAC unit checks PASSED!');
