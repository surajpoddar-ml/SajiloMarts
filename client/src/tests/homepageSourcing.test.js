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

// Test 2: Marketplace detection and URL validation
import { validateProductUrl, detectMarketplace } from '../utils/formValidation.js';
assert.strictEqual(validateProductUrl('https://www.amazon.in/dp/B0BDK62PDX'), null);
assert.strictEqual(detectMarketplace('https://www.amazon.in/dp/B0BDK62PDX').name, 'Amazon India');
assert.strictEqual(detectMarketplace('https://www.flipkart.com/item/123').name, 'Flipkart');
assert.strictEqual(detectMarketplace('https://www.1mg.com/otc/test').name, 'Tata 1mg');
assert.ok(validateProductUrl('https://www.fakestore.xyz/item'));
console.log('✅ Marketplace validation & domain resolution verified');

console.log('🎉 Homepage & Sourcing test baseline verified!');
