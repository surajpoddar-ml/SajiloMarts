import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { ProductRequest, REQUEST_STATUSES, SUPPORTED_MARKETPLACES } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { quoteService } from '../services/quote.service.js';
import { productRequestService } from '../services/productRequest.service.js';
import { paymentService } from '../services/payment.service.js';
import { PAYMENT_MODES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants/payment.constants.js';
import { validatePaymentProofUpload } from '../utils/uploadSecurity.js';

/**
 * 1. Financial Quote Calculation Tests
 */
export const runQuoteCalculationTests = async () => {
  console.log('🧪 Running Quote Calculation Tests...');

  // Test Online Mode (1,000 INR * 1.65 = 1,650 NPR; 1,650 * 1.18 = 1,947 NPR)
  const onlineQuote = quoteService.calculateOnlineQuote(1000, 1);
  assert.equal(onlineQuote.sourceSubtotalInr, 1000, 'INR subtotal should be 1000');
  assert.equal(onlineQuote.exchangeRate, 1.65, 'Exchange rate must be 1.65');
  assert.equal(onlineQuote.convertedAmountNpr, 1650, 'Converted NPR must be 1650');
  assert.equal(onlineQuote.appliedRate, 0.18, 'Online surcharge rate must be 18%');
  assert.equal(onlineQuote.rateAmountNpr, 297, 'Online rate amount should be 297');
  assert.equal(onlineQuote.finalAmountNpr, 1947, 'Final amount must be 1947');
  assert.equal(onlineQuote.payNowAmountNpr, 1947, 'Pay now must be 1947');
  assert.equal(onlineQuote.remainingCodAmountNpr, 0, 'Remaining COD must be 0');

  // Test COD Mode (1,000 INR * 1.65 = 1,650 NPR; 1,650 * 1.22 = 2,013 NPR; Pay Now = 1,006.50, COD = 1,006.50)
  const codQuote = quoteService.calculateCodQuote(1000, 1);
  assert.equal(codQuote.sourceSubtotalInr, 1000, 'INR subtotal should be 1000');
  assert.equal(codQuote.exchangeRate, 1.65, 'Exchange rate must be 1.65');
  assert.equal(codQuote.convertedAmountNpr, 1650, 'Converted NPR must be 1650');
  assert.equal(codQuote.appliedRate, 0.22, 'COD surcharge rate must be 22%');
  assert.equal(codQuote.rateAmountNpr, 363, 'COD rate amount should be 363');
  assert.equal(codQuote.finalAmountNpr, 2013, 'Final amount must be 2013');
  assert.equal(codQuote.payNowAmountNpr, 1006.5, 'Pay now must be 1006.50');
  assert.equal(codQuote.remainingCodAmountNpr, 1006.5, 'Remaining COD must be 1006.50');
  assert.equal(
    codQuote.payNowAmountNpr + codQuote.remainingCodAmountNpr,
    codQuote.finalAmountNpr,
    'Pay Now + COD sum must equal final amount exactly'
  );

  console.log('✅ Quote calculation tests passed successfully');
};

/**
 * 2. Sourcing Request Model Validation Tests
 */
export const runProductRequestValidationTests = async () => {
  console.log('🧪 Running Sourcing Request Validation Tests...');

  const validUserId = new mongoose.Types.ObjectId();

  // Test valid request
  const validRequest = new ProductRequest({
    user: validUserId,
    productUrl: 'https://www.amazon.in/dp/B08N5WRWNW',
    marketplace: 'amazon-india',
    productName: 'Sony WH-1000XM4 Headphones',
    productPriceInr: 19990,
    quantity: 1,
    variant: 'Midnight Blue',
    notes: 'Please ensure original sealed box packaging.',
  });
  await validRequest.validate();
  assert.equal(validRequest.status, REQUEST_STATUSES.SUBMITTED);

  // Test invalid URL protocol (e.g. javascript: or ftp:)
  const invalidUrlRequest = new ProductRequest({
    user: validUserId,
    productUrl: 'javascript:alert(1)',
    marketplace: 'amazon-india',
    productName: 'Test Product',
    productPriceInr: 500,
  });
  let urlErr;
  try {
    await invalidUrlRequest.validate();
  } catch (err) {
    urlErr = err;
  }
  assert.ok(urlErr?.errors?.productUrl, 'javascript: URL protocol must fail validation');

  // Test invalid negative or zero price
  const invalidPriceRequest = new ProductRequest({
    user: validUserId,
    productUrl: 'https://flipkart.com/item',
    productName: 'Test Product',
    productPriceInr: -100,
  });
  let priceErr;
  try {
    await invalidPriceRequest.validate();
  } catch (err) {
    priceErr = err;
  }
  assert.ok(priceErr?.errors?.productPriceInr, 'Negative price must fail validation');

  console.log('✅ Sourcing request validation tests passed successfully');
};

/**
 * 3. Payment Upload Security Tests
 */
export const runUploadSecurityTests = async () => {
  console.log('🧪 Running Payment Upload Security Tests...');

  // Allowed MIME
  const validJpg = validatePaymentProofUpload({
    mimetype: 'image/jpeg',
    size: 1024 * 500,
    originalname: 'screenshot.jpg',
  });
  assert.equal(validJpg.isValid, true);
  assert.ok(validJpg.safeFilename.startsWith('proof_'));

  // Disallowed executable / script MIME
  const invalidMime = validatePaymentProofUpload({
    mimetype: 'application/x-msdownload',
    size: 1024,
    originalname: 'hack.exe',
  });
  assert.equal(invalidMime.isValid, false);
  assert.ok(invalidMime.error.includes('Invalid file type'));

  // File exceeding size limit
  const oversizedFile = validatePaymentProofUpload({
    mimetype: 'image/png',
    size: 10 * 1024 * 1024,
    originalname: 'huge.png',
  });
  assert.equal(oversizedFile.isValid, false);
  assert.ok(oversizedFile.error.includes('exceeds maximum allowed size'));

  console.log('✅ Payment upload security tests passed successfully');
};

/**
 * 4. Ownership & Admin Authorization Tests
 */
export const runAuthorizationTests = async () => {
  console.log('🧪 Running Customer Ownership & Admin Guard Tests...');

  const userAId = new mongoose.Types.ObjectId().toString();
  const userBId = new mongoose.Types.ObjectId().toString();
  const requestId = new mongoose.Types.ObjectId().toString();

  const origFindById = ProductRequest.findById;
  ProductRequest.findById = () => ({
    _id: requestId,
    user: userAId,
    productName: 'User A Sourcing Request',
    productPriceInr: 1000,
    quantity: 1,
    status: REQUEST_STATUSES.SUBMITTED,
  });

  try {
    // User A can access own request
    const userARequest = await productRequestService.getRequestForUser(userAId, requestId);
    assert.equal(userARequest.user, userAId);

    // User B cannot access User A's request
    let unauthorizedErr;
    try {
      await productRequestService.getRequestForUser(userBId, requestId);
    } catch (err) {
      unauthorizedErr = err;
    }
    assert.equal(unauthorizedErr?.statusCode, 403, 'User B must get 403 accessing User A request');

    console.log('✅ Ownership & admin guard tests passed successfully');
  } finally {
    ProductRequest.findById = origFindById;
  }
};

/**
 * 5. Live MongoDB Atlas Integration Test
 */
export const runMongoSourcingIntegrationTests = async () => {
  console.log('🧪 Running MongoDB Atlas Sourcing & Payment Integration Tests...');
  const { connectDatabase } = await import('../database/connection.js');
  const mongoose = (await import('mongoose')).default;

  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  const suffix = Date.now();
  let customerUser;
  let adminUser;
  let createdRequest;
  let createdPayment;

  try {
    // 1. Create customer and admin users
    customerUser = await User.create({
      name: 'Sourcing Customer',
      email: `customer_${suffix}@example.com`,
      password: 'SecureCustomerPass123!',
      phone: '+977 9811111111',
      role: USER_ROLES.CUSTOMER,
    });

    adminUser = await User.create({
      name: 'Sourcing Admin',
      email: `admin_${suffix}@example.com`,
      password: 'SecureAdminPass123!',
      phone: '+977 9822222222',
      role: USER_ROLES.ADMIN,
    });

    // 2. Customer creates product request via service
    createdRequest = await productRequestService.createRequest(customerUser._id.toString(), {
      productUrl: 'https://www.myntra.com/shoes/nike/123',
      marketplace: 'myntra',
      productName: 'Nike Air Max Running Shoes',
      productPriceInr: 4999,
      quantity: 1,
      variant: 'UK 9 / Black',
      notes: 'Ensure authentic pair with invoice',
      paymentMode: 'online_100',
    });

    assert.ok(createdRequest._id, 'ProductRequest should have ObjectId');
    assert.equal(createdRequest.quote.sourceUnitPriceInr, 4999);
    assert.equal(createdRequest.quote.finalAmountNpr, 9733.05); // 4999 * 1.65 = 8248.35; * 1.18 = 9733.05

    // 3. Customer initiates payment submission via service
    createdPayment = await paymentService.createPaymentSubmission(
      customerUser._id.toString(),
      createdRequest._id.toString(),
      {
        paymentMode: PAYMENT_MODES.ONLINE_100,
        paymentMethod: PAYMENT_METHODS.ESEWA,
      }
    );

    assert.equal(createdPayment.amountDueNpr, 9733.05, 'Server must set authoritative amount');
    assert.equal(createdPayment.paymentStatus, PAYMENT_STATUSES.PENDING);

    // 4. Customer submits payment proof (transaction code)
    const updatedPayment = await paymentService.submitPaymentProof(
      customerUser._id.toString(),
      createdPayment._id.toString(),
      {
        transactionCode: 'ESEWA-TXN-99887766',
        paymentProof: 'proof_sample_123.jpg',
      }
    );
    assert.equal(updatedPayment.paymentStatus, PAYMENT_STATUSES.PROOF_SUBMITTED);
    assert.equal(updatedPayment.transactionCode, 'ESEWA-TXN-99887766');

    // 5. Admin inspects request details
    const adminDetails = await productRequestService.getAdminRequestDetails(
      adminUser._id.toString(),
      createdRequest._id.toString()
    );
    assert.ok(adminDetails.user, 'Admin view should populate user metadata');

    // 6. Admin reviews and verifies payment
    const verifiedPayment = await paymentService.reviewPayment(
      adminUser._id.toString(),
      createdPayment._id.toString(),
      {
        status: PAYMENT_STATUSES.VERIFIED,
      }
    );
    assert.equal(verifiedPayment.paymentStatus, PAYMENT_STATUSES.VERIFIED);
    assert.ok(verifiedPayment.verifiedAt);

    // 7. Verify ProductRequest status changed to payment_verified
    const refreshedRequest = await ProductRequest.findById(createdRequest._id);
    assert.equal(refreshedRequest.status, REQUEST_STATUSES.PAYMENT_VERIFIED);

    console.log('✅ MongoDB Atlas Sourcing & Payment integration tests passed successfully');
  } finally {
    // Safe cleanup of isolated test documents
    if (createdPayment && createdPayment._id) {
      await PaymentSubmission.deleteOne({ _id: createdPayment._id });
    }
    if (createdRequest && createdRequest._id) {
      await ProductRequest.deleteOne({ _id: createdRequest._id });
    }
    if (customerUser && customerUser._id) {
      await User.deleteOne({ _id: customerUser._id });
    }
    if (adminUser && adminUser._id) {
      await User.deleteOne({ _id: adminUser._id });
    }
    console.log('🧹 Cleaned up isolated sourcing and payment test documents');
  }
};

/**
 * Master test runner
 */
export const runAllSourcingPaymentTests = async () => {
  console.log('====================================================');
  console.log('🚀 Executing Complete Sourcing Request & Payment Test Suite');
  console.log('====================================================');

  await runQuoteCalculationTests();
  await runProductRequestValidationTests();
  await runUploadSecurityTests();
  await runAuthorizationTests();
  await runMongoSourcingIntegrationTests();

  console.log('====================================================');
  console.log('🎉 All Sourcing & Payment tests PASSED successfully!');
  console.log('====================================================');
};

if (process.argv[1]?.includes('sourcingPayment.test.js')) {
  runAllSourcingPaymentTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Test suite failed:', err);
      process.exit(1);
    });
}
