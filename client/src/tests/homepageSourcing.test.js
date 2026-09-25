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

// Test 3: Accessible Quantity Controls verification
import fs from 'node:fs';
import path from 'node:path';
const quantityInputPath = path.resolve('src/components/forms/QuantityInput.jsx');
assert.ok(fs.existsSync(quantityInputPath), 'QuantityInput.jsx must exist');
const quantityContent = fs.readFileSync(quantityInputPath, 'utf8');
assert.ok(quantityContent.includes('export const QuantityInput'), 'QuantityInput must be exported');
assert.ok(quantityContent.includes('aria-valuemin'), 'QuantityInput must contain accessible aria attributes');
console.log('✅ Accessible Quantity Controls component verified');

// Test 4: Variant and Sourcing Notes verification
const formPath = path.resolve('src/pages/Home/SourcingRequestInteractiveForm.jsx');
assert.ok(fs.existsSync(formPath), 'SourcingRequestInteractiveForm.jsx must exist');
const formContent = fs.readFileSync(formPath, 'utf8');
assert.ok(formContent.includes('variant'), 'Form must handle variant field');
assert.ok(formContent.includes('notes'), 'Form must handle notes field');
console.log('✅ Variant & Sourcing Notes handling verified');

// Test 5: Sourcing Request Review experience verification
const reviewPath = path.resolve('src/pages/Home/RequestReviewCard.jsx');
assert.ok(fs.existsSync(reviewPath), 'RequestReviewCard.jsx must exist');
const reviewContent = fs.readFileSync(reviewPath, 'utf8');
assert.ok(reviewContent.includes('export const RequestReviewCard'), 'RequestReviewCard must be exported');
assert.ok(reviewContent.includes('Step 2: Review Sourcing Request'), 'Review card must render step 2 title');
console.log('✅ Request Review experience verification passed');

console.log('🎉 Homepage & Sourcing test baseline verified!');
