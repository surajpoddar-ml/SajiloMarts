import assert from 'node:assert/strict';
import { PUBLIC_CONFIG } from '../config/public.js';

console.log('====================================================');
console.log('🚀 Executing SastoMarts Frontend Design System Tests');
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
// Test 16: Role-Aware Administrator Navigation Verification
const adminNavJsxPath = path.resolve('src/components/layout/AdminNav.jsx');
assert.ok(fs.existsSync(adminNavJsxPath), 'AdminNav.jsx must exist');
const adminNavContent = fs.readFileSync(adminNavJsxPath, 'utf8');
assert.ok(adminNavContent.includes('export const AdminNav'), 'AdminNav must be exported');
assert.ok(adminNavContent.includes('Admin Console'), 'AdminNav must include Admin Console');
// Test 17: Accessible Mobile Navigation Verification
const mobileNavJsxPath = path.resolve('src/components/layout/MobileNav.jsx');
assert.ok(fs.existsSync(mobileNavJsxPath), 'MobileNav.jsx must exist');
const mobileNavContent = fs.readFileSync(mobileNavJsxPath, 'utf8');
assert.ok(mobileNavContent.includes('export const MobileNav'), 'MobileNav must be exported');
assert.ok(mobileNavContent.includes('aria-modal="true"'), 'MobileNav must provide accessible dialog attributes');
// Test 18: Frontend API Error Handling Verification
import { ApiClientError, normalizeApiError } from '../utils/apiError.js';
const testErr = new ApiClientError('Invalid URL', 400);
assert.strictEqual(testErr.status, 400);
assert.strictEqual(testErr.isAuthError, false);
const authErr = new ApiClientError('Unauthorized', 401);
assert.strictEqual(authErr.isAuthError, true);
// Test 19: Global Notification Foundation Verification
const toastContextJsxPath = path.resolve('src/context/ToastContext.jsx');
assert.ok(fs.existsSync(toastContextJsxPath), 'ToastContext.jsx must exist');
const toastContent = fs.readFileSync(toastContextJsxPath, 'utf8');
assert.ok(toastContent.includes('export const ToastProvider'), 'ToastProvider must be exported');
assert.ok(toastContent.includes('export const useToast'), 'useToast must be exported');
// Test 20: Protected Frontend Route Guards Verification
const protectedRouteJsxPath = path.resolve('src/routes/ProtectedRoute.jsx');
const adminRouteJsxPath = path.resolve('src/routes/AdminRoute.jsx');
assert.ok(fs.existsSync(protectedRouteJsxPath), 'ProtectedRoute.jsx must exist');
assert.ok(fs.existsSync(adminRouteJsxPath), 'AdminRoute.jsx must exist');
const protectedContent = fs.readFileSync(protectedRouteJsxPath, 'utf8');
const adminContent = fs.readFileSync(adminRouteJsxPath, 'utf8');
assert.ok(protectedContent.includes('export const ProtectedRoute'), 'ProtectedRoute must be exported');
// Test 21: Responsive Page Layout Foundation Verification
const pageHeaderJsxPath = path.resolve('src/components/layout/PageHeader.jsx');
assert.ok(fs.existsSync(pageHeaderJsxPath), 'PageHeader.jsx must exist');
const pageHeaderContent = fs.readFileSync(pageHeaderJsxPath, 'utf8');
assert.ok(pageHeaderContent.includes('export const PageHeader'), 'PageHeader must be exported');
// Test 22: Reusable Responsive Table Foundation Verification
const tableJsxPath = path.resolve('src/components/common/Table.jsx');
assert.ok(fs.existsSync(tableJsxPath), 'Table.jsx must exist');
const tableContent = fs.readFileSync(tableJsxPath, 'utf8');
assert.ok(tableContent.includes('export const Table'), 'Table must be exported');
assert.ok(tableContent.includes('export const TableHeaderCell'), 'TableHeaderCell must be exported');
// Test 23: Global Frontend Error Boundary Verification
const errorBoundaryJsxPath = path.resolve('src/components/feedback/ErrorBoundary.jsx');
assert.ok(fs.existsSync(errorBoundaryJsxPath), 'ErrorBoundary.jsx must exist');
const errorBoundaryContent = fs.readFileSync(errorBoundaryJsxPath, 'utf8');
assert.ok(errorBoundaryContent.includes('export class ErrorBoundary'), 'ErrorBoundary must be exported');
// Test 24: Reusable Not-Found (404) Page Verification
const notFoundJsxPath = path.resolve('src/pages/NotFound/NotFoundPage.jsx');
assert.ok(fs.existsSync(notFoundJsxPath), 'NotFoundPage.jsx must exist');
const notFoundContent = fs.readFileSync(notFoundJsxPath, 'utf8');
assert.ok(notFoundContent.includes('export const NotFoundPage'), 'NotFoundPage must be exported');
// Test 25: Footer & Legal Navigation Verification
const footerJsxPath = path.resolve('src/components/layout/Footer.jsx');
assert.ok(fs.existsSync(footerJsxPath), 'Footer.jsx must exist');
const footerContent = fs.readFileSync(footerJsxPath, 'utf8');
assert.ok(footerContent.includes('export const Footer'), 'Footer must be exported');
assert.ok(footerContent.includes('Terms of Service'), 'Footer must include Terms of Service');
assert.ok(footerContent.includes('Privacy Policy'), 'Footer must include Privacy Policy');
// Test 26: Reduced-Motion and Accessible Interaction Verification
const accessibilityCssPath = path.resolve('src/styles/accessibility.css');
assert.ok(fs.existsSync(accessibilityCssPath), 'accessibility.css must exist');
const accessibilityContent = fs.readFileSync(accessibilityCssPath, 'utf8');
assert.ok(accessibilityContent.includes('prefers-reduced-motion'), 'Must support prefers-reduced-motion');
// Test 27: Brand Logo Component Verification
const logoJsxPath = path.resolve('src/components/common/Logo.jsx');
assert.ok(fs.existsSync(logoJsxPath), 'Logo.jsx must exist');
const logoContent = fs.readFileSync(logoJsxPath, 'utf8');
assert.ok(logoContent.includes('export const Logo'), 'Logo must be exported');
assert.ok(logoContent.includes('SajiloMarts'), 'Logo must have SajiloMarts brand text');

// Test 28: Complete Design System Foundation Verification
const appJsxPath = path.resolve('src/App.jsx');
assert.ok(fs.existsSync(appJsxPath), 'App.jsx must exist');
const appContent = fs.readFileSync(appJsxPath, 'utf8');
assert.ok(appContent.includes('ErrorBoundary'), 'App must be wrapped in ErrorBoundary');
assert.ok(appContent.includes('ToastProvider'), 'App must provide Toast notifications');
assert.ok(appContent.includes('AppShell') || appContent.includes('app-shell'), 'App must render standard app shell');
console.log('✅ Complete SajiloMarts frontend design system foundation verified');

console.log('🎉 Design System initial foundation verified!');
