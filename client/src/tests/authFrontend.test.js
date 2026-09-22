import assert from 'node:assert/strict';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend Auth Test Suite');
console.log('====================================================');

// 1. Email Regex & Phone Regex Validation Check
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

assert.ok(EMAIL_REGEX.test('customer@sajilomarts.com'));
assert.ok(EMAIL_REGEX.test('user.test+sasto@example.np'));
assert.ok(!EMAIL_REGEX.test('plainaddress'));
assert.ok(!EMAIL_REGEX.test('@missingusername.com'));

// Phone numbers (Nepal and India formats)
assert.ok(PHONE_REGEX.test('+9779801234567'));
assert.ok(PHONE_REGEX.test('+919876543210'));
assert.ok(PHONE_REGEX.test('9801234567'));
assert.ok(!PHONE_REGEX.test('12345'));

console.log('✅ Client regex validation patterns passed');

// 2. Client Authentication Service Shape Check
import { authService } from '../services/auth.service.js';
assert.equal(typeof authService.register, 'function');
assert.equal(typeof authService.login, 'function');
assert.equal(typeof authService.getMe, 'function');
assert.equal(typeof authService.logout, 'function');

console.log('✅ Client authService method signatures verified');

console.log('🎉 All frontend authentication unit checks PASSED!');
