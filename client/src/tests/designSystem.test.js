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

// Test 3: Design Tokens structure & Warm Neutral Color System
import { DESIGN_TOKENS } from '../styles/tokens.js';
assert.strictEqual(DESIGN_TOKENS.colors.background.page, '#FAF8F5');
assert.strictEqual(DESIGN_TOKENS.colors.text.primary, '#1C1917');
assert.strictEqual(DESIGN_TOKENS.colors.brand.primary, '#B83A20');
assert.ok(DESIGN_TOKENS.colors.background.surface);
assert.ok(DESIGN_TOKENS.colors.border.subtle);
// Test 4: Typography Hierarchy Verification
assert.ok(DESIGN_TOKENS.typography.fontFamily.sans);
assert.ok(!DESIGN_TOKENS.typography.fontFamily.sans.includes('Inter'), 'Must not use Inter font');
assert.ok(!DESIGN_TOKENS.typography.fontFamily.sans.includes('Geist'), 'Must not use Geist font');
assert.ok(!DESIGN_TOKENS.typography.fontFamily.sans.includes('Space Grotesk'), 'Must not use Space Grotesk font');
// Test 5: Responsive Spacing & Container Verification
assert.ok(DESIGN_TOKENS.spacing['md']);
assert.ok(DESIGN_TOKENS.spacing['lg']);
assert.ok(DESIGN_TOKENS.spacing['2xl']);
// Test 6: Button Component & Design System Verification
import fs from 'node:fs';
import path from 'node:path';
const buttonJsxPath = path.resolve('src/components/common/Button.jsx');
assert.ok(fs.existsSync(buttonJsxPath), 'Button.jsx must exist');
const buttonContent = fs.readFileSync(buttonJsxPath, 'utf8');
// Test 7: Form Field Components Verification
const formFieldJsxPath = path.resolve('src/components/forms/FormField.jsx');
const inputJsxPath = path.resolve('src/components/forms/Input.jsx');
assert.ok(fs.existsSync(formFieldJsxPath), 'FormField.jsx must exist');
assert.ok(fs.existsSync(inputJsxPath), 'Input.jsx must exist');
// Test 8: Input Validation States Verification
import { validateProductUrl, validateRequired, validateEmail } from '../utils/formValidation.js';
assert.strictEqual(validateRequired(''), 'This field is required');
assert.strictEqual(validateRequired('Valid'), null);
assert.ok(validateProductUrl('invalid-url'));
assert.strictEqual(validateProductUrl('https://www.amazon.in/dp/B08N5WRWNW'), null);
assert.strictEqual(validateEmail('test@sajilomarts.com'), null);
console.log('✅ Input validation states and helper functions verified');

console.log('🎉 Design System initial foundation verified!');
