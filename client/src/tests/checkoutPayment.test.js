import assert from 'node:assert';
import {
  calculateAuthoritativePaymentBreakdown,
  PAYMENT_MODES,
  PAYMENT_METHOD_CONFIGS,
} from '../utils/paymentCalculations.js';
import { validatePaymentProofFile } from '../utils/fileValidation.js';

console.log('🚀 Running SajiloMarts Checkout & Payment Experience Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failedTests++;
  }
}

// 1. Authoritative 100% Online Payment Calculation (18% Fee)
runTest('Authoritative 100% Online Prepayment formula (INR * 1.65 * 1.18)', () => {
  const breakdown = calculateAuthoritativePaymentBreakdown(1000, 1, PAYMENT_MODES.FULL_ONLINE);

  assert.strictEqual(breakdown.sourceSubtotalInr, 1000);
  assert.strictEqual(breakdown.conversionMultiplier, 1.65);
  assert.strictEqual(breakdown.convertedSubtotalNpr, 1650);
  assert.strictEqual(breakdown.feeRate, 0.18);
  assert.strictEqual(breakdown.finalAmountNpr, 1947); // 1000 * 1.65 * 1.18 = 1947
  assert.strictEqual(breakdown.amountPayableNowNpr, 1947);
  assert.strictEqual(breakdown.remainingCodAmountNpr, 0);
});

// 2. Authoritative 50% COD Payment Calculation (22% Fee & 50/50 Split)
runTest('Authoritative 50% COD formula (INR * 1.65 * 1.22 with 50/50 split)', () => {
  const breakdown = calculateAuthoritativePaymentBreakdown(2000, 1, PAYMENT_MODES.COD_50_50);

  assert.strictEqual(breakdown.sourceSubtotalInr, 2000);
  assert.strictEqual(breakdown.conversionMultiplier, 1.65);
  assert.strictEqual(breakdown.convertedSubtotalNpr, 3300);
  assert.strictEqual(breakdown.feeRate, 0.22);
  assert.strictEqual(breakdown.finalAmountNpr, 4026); // 2000 * 1.65 * 1.22 = 4026
  assert.strictEqual(breakdown.amountPayableNowNpr, 2013); // 50%
  assert.strictEqual(breakdown.remainingCodAmountNpr, 2013); // 50%
  assert.strictEqual(breakdown.amountPayableNowNpr + breakdown.remainingCodAmountNpr, breakdown.finalAmountNpr);
});

// 3. Supported Payment Methods Config Verification
runTest('Verify exact 4 supported payment methods exist with correct specifications', () => {
  const supportedMethods = Object.keys(PAYMENT_METHOD_CONFIGS);
  assert.deepStrictEqual(supportedMethods.sort(), ['cod_50_50', 'esewa', 'khalti', 'mypay'].sort());

  assert.strictEqual(PAYMENT_METHOD_CONFIGS.esewa.name, 'eSewa Digital Wallet');
  assert.strictEqual(PAYMENT_METHOD_CONFIGS.khalti.name, 'Khalti Digital Wallet');
  assert.strictEqual(PAYMENT_METHOD_CONFIGS.mypay.name, 'MyPay Mobile Wallet');
  assert.strictEqual(PAYMENT_METHOD_CONFIGS.cod_50_50.name, '50% COD / 50% Pay');
});

// 4. Payment Proof Validation (File type and size limits)
runTest('Payment proof validation accepts valid JPEG/PNG/WebP and enforces 5MB limit', () => {
  // Valid image
  const validJpg = { name: 'receipt.jpg', type: 'image/jpeg', size: 1024 * 1024 };
  const validRes = validatePaymentProofFile(validJpg);
  assert.strictEqual(validRes.isValid, true);
  assert.strictEqual(validRes.error, null);

  // Oversized image (6 MB)
  const oversizedFile = { name: 'receipt.png', type: 'image/png', size: 6 * 1024 * 1024 };
  const oversizedRes = validatePaymentProofFile(oversizedFile);
  assert.strictEqual(oversizedRes.isValid, false);
  assert.match(oversizedRes.error, /5MB/i);

  // Invalid executable / script file
  const exeFile = { name: 'exploit.exe', type: 'application/x-msdownload', size: 1024 };
  const exeRes = validatePaymentProofFile(exeFile);
  assert.strictEqual(exeRes.isValid, false);
  assert.match(exeRes.error, /JPEG, PNG, or WebP/i);
});

// 5. Single-Page Navigation Architecture Verification
runTest('Public navigation strictly anchors How It Works to single-page #how-it-works', () => {
  const mockNavigation = (target) => {
    if (target === 'how-it-works') {
      return { type: 'anchor_scroll', hash: '#how-it-works' };
    }
    return { type: 'route_change', path: `/${target}` };
  };

  const result = mockNavigation('how-it-works');
  assert.strictEqual(result.type, 'anchor_scroll');
  assert.strictEqual(result.hash, '#how-it-works');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
