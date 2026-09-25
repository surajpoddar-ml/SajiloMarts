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

// Test 6: Server quote presentation and breakdown verification
const quoteDisplayPath = path.resolve('src/pages/Home/ServerQuoteDisplay.jsx');
assert.ok(fs.existsSync(quoteDisplayPath), 'ServerQuoteDisplay.jsx must exist');
const quoteContent = fs.readFileSync(quoteDisplayPath, 'utf8');
assert.ok(quoteContent.includes('export const ServerQuoteDisplay'), 'ServerQuoteDisplay must be exported');
assert.ok(quoteContent.includes('Authoritative Price Snapshot'), 'Must render authoritative quote breakdown');
assert.ok(quoteContent.includes('Quote not available yet'), 'Must support quote not available state');
console.log('✅ Server quote flow, presentation, breakdown and states verified');

// Test 7: Quote success and error states verification
assert.ok(quoteContent.includes('Quote Confirmed Successfully!'), 'Must support quote confirmed success state');
assert.ok(quoteContent.includes('Retry Quote Request'), 'Must support retry on error state');
console.log('✅ Quote success and error states verified');

// Test 8: Supported Marketplaces section verification
const mpPath = path.resolve('src/pages/Home/SupportedMarketplacesSection.jsx');
assert.ok(fs.existsSync(mpPath), 'SupportedMarketplacesSection.jsx must exist');
const mpContent = fs.readFileSync(mpPath, 'utf8');
assert.ok(mpContent.includes('export const SupportedMarketplacesSection'), 'SupportedMarketplacesSection must be exported');
assert.ok(mpContent.includes('Amazon India'), 'Must include Amazon India');
assert.ok(mpContent.includes('Flipkart'), 'Must include Flipkart');
assert.ok(mpContent.includes('Tata 1mg'), 'Must include Tata 1mg');
console.log('✅ Supported Marketplaces section verified');

// Test 9: How It Works workflow verification
const howPath = path.resolve('src/pages/Home/HowItWorksSection.jsx');
assert.ok(fs.existsSync(howPath), 'HowItWorksSection.jsx must exist');
const howContent = fs.readFileSync(howPath, 'utf8');
assert.ok(howContent.includes('export const HowItWorksSection'), 'HowItWorksSection must be exported');
assert.ok(howContent.includes('Find Product in India'), 'Must include step 1');
assert.ok(howContent.includes('Procurement & Nepal Delivery'), 'Must include step 5');
console.log('✅ How SastoMarts Works workflow explanation verified');

// Test 10: Service Benefits section verification
const benPath = path.resolve('src/pages/Home/ServiceBenefitsSection.jsx');
assert.ok(fs.existsSync(benPath), 'ServiceBenefitsSection.jsx must exist');
const benContent = fs.readFileSync(benPath, 'utf8');
assert.ok(benContent.includes('export const ServiceBenefitsSection'), 'ServiceBenefitsSection must be exported');
assert.ok(benContent.includes('India Product Sourcing'), 'Must describe India sourcing capability');
assert.ok(benContent.includes('Transparent Server Pricing'), 'Must describe transparent server pricing');
assert.ok(benContent.includes('Nepal Countrywide Delivery'), 'Must describe Nepal countrywide delivery');
console.log('✅ Service Benefits section verified');

// Test 11: Track Order section verification
const trackPath = path.resolve('src/pages/Home/TrackOrderSection.jsx');
assert.ok(fs.existsSync(trackPath), 'TrackOrderSection.jsx must exist');
const trackContent = fs.readFileSync(trackPath, 'utf8');
assert.ok(trackContent.includes('export const TrackOrderSection'), 'TrackOrderSection must be exported');
assert.ok(trackContent.includes('No order was found for that tracking code'), 'Must support real not found state');
console.log('✅ Track Order entry experience verified');

// Test 12: Customer Account Entry section verification
const accPath = path.resolve('src/pages/Home/AccountEntrySection.jsx');
assert.ok(fs.existsSync(accPath), 'AccountEntrySection.jsx must exist');
const accContent = fs.readFileSync(accPath, 'utf8');
assert.ok(accContent.includes('export const AccountEntrySection'), 'AccountEntrySection must be exported');
assert.ok(accContent.includes('Customer Account & Sourcing History'), 'Must render customer account heading');
console.log('✅ Customer account entry points verified');

// Test 13: Customer Support Entry section verification
const suppPath = path.resolve('src/pages/Home/SupportEntrySection.jsx');
assert.ok(fs.existsSync(suppPath), 'SupportEntrySection.jsx must exist');
const suppContent = fs.readFileSync(suppPath, 'utf8');
assert.ok(suppContent.includes('export const SupportEntrySection'), 'SupportEntrySection must be exported');
assert.ok(suppContent.includes('Direct Email Helpdesk'), 'Must render direct email helpdesk channel');
console.log('✅ Customer support entry experience verified');

// Test 14: SastoMarts Footer & Legal navigation verification
const footerPath = path.resolve('src/components/layout/Footer.jsx');
assert.ok(fs.existsSync(footerPath), 'Footer.jsx must exist');
const footerContent = fs.readFileSync(footerPath, 'utf8');
assert.ok(footerContent.includes('Terms of Service'), 'Footer must contain Terms of Service link');
assert.ok(footerContent.includes('Privacy Policy'), 'Footer must contain Privacy Policy link');
assert.ok(footerContent.includes('Logo'), 'Footer must include SastoMarts Logo component');

const termsPath = path.resolve('src/pages/Legal/TermsPage.jsx');
const privacyPath = path.resolve('src/pages/Legal/PrivacyPage.jsx');
assert.ok(fs.existsSync(termsPath), 'TermsPage.jsx must exist');
assert.ok(fs.existsSync(privacyPath), 'PrivacyPage.jsx must exist');
console.log('✅ Footer and Legal navigation verified');

// Test 15: SEO Metadata & Dynamic Document Title verification
const titleHookPath = path.resolve('src/hooks/useDocumentTitle.js');
assert.ok(fs.existsSync(titleHookPath), 'useDocumentTitle.js must exist');
const titleHookContent = fs.readFileSync(titleHookPath, 'utf8');
assert.ok(titleHookContent.includes('export const useDocumentTitle'), 'useDocumentTitle must be exported');
assert.ok(titleHookContent.includes('Shop from India. We Deliver to Nepal.'), 'Must set default brand tagline');

const indexHtmlPath = path.resolve('index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
assert.ok(indexHtmlContent.includes('SastoMarts — Shop from India. We Deliver to Nepal.'), 'index.html must contain SastoMarts title');
assert.ok(!indexHtmlContent.includes('Vite'), 'index.html must not contain Vite title or default starter text');
console.log('✅ SastoMarts SEO metadata and dynamic titles verified');

console.log('🎉 Homepage & Sourcing test baseline verified!');
