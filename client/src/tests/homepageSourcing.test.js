import assert from 'node:assert/strict';
import { PUBLIC_CONFIG } from '../config/public.js';

console.log('====================================================');
console.log('🚀 Executing SastoMarts Homepage & Sourcing Test Suite');
console.log('====================================================');

// Test 1: Baseline SastoMarts brand identity
assert.strictEqual(PUBLIC_CONFIG.BRAND_NAME, 'SastoMarts');
assert.strictEqual(PUBLIC_CONFIG.TAGLINE, 'Shop from India. We Deliver to Nepal.');
assert.ok(PUBLIC_CONFIG.SUPPORT_EMAIL.includes('@sastomarts.com'));
console.log('✅ SastoMarts homepage brand configuration verified');

console.log('🎉 Homepage & Sourcing test baseline verified!');
