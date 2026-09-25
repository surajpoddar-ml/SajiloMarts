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
// Test 9: Card and Surface Component Verification
const cardJsxPath = path.resolve('src/components/common/Card.jsx');
assert.ok(fs.existsSync(cardJsxPath), 'Card.jsx must exist');
const cardContent = fs.readFileSync(cardJsxPath, 'utf8');
assert.ok(cardContent.includes('export const Card'), 'Card must be exported');
// Test 10: Status System Verification
const statusBadgeJsxPath = path.resolve('src/components/common/StatusBadge.jsx');
assert.ok(fs.existsSync(statusBadgeJsxPath), 'StatusBadge.jsx must exist');
const statusBadgeContent = fs.readFileSync(statusBadgeJsxPath, 'utf8');
assert.ok(statusBadgeContent.includes('export const StatusBadge'), 'StatusBadge must be exported');
assert.ok(statusBadgeContent.includes('quote_ready'), 'StatusBadge must support quote_ready');
// Test 11: Loading and Skeleton States Verification
const spinnerJsxPath = path.resolve('src/components/feedback/Spinner.jsx');
const skeletonJsxPath = path.resolve('src/components/feedback/Skeleton.jsx');
assert.ok(fs.existsSync(spinnerJsxPath), 'Spinner.jsx must exist');
assert.ok(fs.existsSync(skeletonJsxPath), 'Skeleton.jsx must exist');
const spinnerContent = fs.readFileSync(spinnerJsxPath, 'utf8');
const skeletonContent = fs.readFileSync(skeletonJsxPath, 'utf8');
assert.ok(spinnerContent.includes('export const Spinner'), 'Spinner must be exported');
// Test 12: Error and Empty States Verification
const errorAlertJsxPath = path.resolve('src/components/feedback/ErrorAlert.jsx');
const emptyStateJsxPath = path.resolve('src/components/feedback/EmptyState.jsx');
assert.ok(fs.existsSync(errorAlertJsxPath), 'ErrorAlert.jsx must exist');
assert.ok(fs.existsSync(emptyStateJsxPath), 'EmptyState.jsx must exist');
const errorAlertContent = fs.readFileSync(errorAlertJsxPath, 'utf8');
const emptyStateContent = fs.readFileSync(emptyStateJsxPath, 'utf8');
assert.ok(errorAlertContent.includes('export const ErrorAlert'), 'ErrorAlert must be exported');
// Test 13: Global Application Shell Verification
const appShellJsxPath = path.resolve('src/components/layout/AppShell.jsx');
assert.ok(fs.existsSync(appShellJsxPath), 'AppShell.jsx must exist');
const appShellContent = fs.readFileSync(appShellJsxPath, 'utf8');
assert.ok(appShellContent.includes('export const AppShell'), 'AppShell must be exported');
// Test 14: Responsive Public Navigation Verification
const headerJsxPath = path.resolve('src/components/layout/Header.jsx');
assert.ok(fs.existsSync(headerJsxPath), 'Header.jsx must exist');
const headerContent = fs.readFileSync(headerJsxPath, 'utf8');
assert.ok(headerContent.includes('export const Header'), 'Header must be exported');
assert.ok(headerContent.includes('public-nav-list'), 'Header must render public navigation list');
// Test 15: Authenticated Customer Navigation Verification
const customerNavJsxPath = path.resolve('src/components/layout/CustomerNav.jsx');
assert.ok(fs.existsSync(customerNavJsxPath), 'CustomerNav.jsx must exist');
const customerNavContent = fs.readFileSync(customerNavJsxPath, 'utf8');
assert.ok(customerNavContent.includes('export const CustomerNav'), 'CustomerNav must be exported');
assert.ok(customerNavContent.includes('Sourcing Requests'), 'CustomerNav must include Sourcing Requests');
assert.ok(customerNavContent.includes('Current Orders'), 'CustomerNav must include Orders placeholder');
console.log('✅ Authenticated customer navigation verified');

console.log('🎉 Design System initial foundation verified!');
