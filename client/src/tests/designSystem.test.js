import assert from 'node:assert/strict';
import { PUBLIC_CONFIG } from '../config/public.js';

console.log('====================================================');
console.log('🚀 Executing SajiloMarts Frontend Design System Tests');
console.log('====================================================');

// Test 1: Brand identity verification
assert.strictEqual(PUBLIC_CONFIG.BRAND_NAME, 'SajiloMarts');
assert.strictEqual(PUBLIC_CONFIG.TAGLINE, 'Shop from India. We Deliver to Nepal.');
console.log('✅ SajiloMarts brand identity and core messaging verified');

// Test 2: Architecture rules & constants integrity
assert.ok(PUBLIC_CONFIG.SUPPORT_EMAIL.includes('@sajilomarts.com'));
console.log('✅ Frontend configuration baseline verified');

console.log('🎉 Design System initial foundation verified!');
