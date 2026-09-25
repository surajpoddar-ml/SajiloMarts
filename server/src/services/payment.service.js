import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { quoteService } from './quote.service.js';
import {
  PAYMENT_MODES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '../constants/payment.constants.js';
import { BadRequestError, NotFoundError, ForbiddenError, assertResourceOwnership } from '../utils/index.js';

/**
 * Payment Service
 * Enforces server-authoritative payment calculations, ownership isolation, and verification workflows.
 */
export class PaymentService extends BaseService {
  /**
   * Helper: Validates Mongoose ObjectId format.
   */
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Creates an authoritative payment submission for a product request.
   * Client-supplied amounts are ignored; amounts are strictly computed by server.
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - ProductRequest ID
   * @param {object} paymentData - { paymentMode, paymentMethod }
   * @returns {Promise<import('mongoose').Document>}
   */
  async createPaymentSubmission(userId, requestId, paymentData) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(requestId, 'ProductRequest ID');

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    assertResourceOwnership(request, userId, 'Product request', 'user');

    if ([REQUEST_STATUSES.CANCELLED, REQUEST_STATUSES.FULFILLED].includes(request.status)) {
      throw new BadRequestError(`Cannot initiate payment for a request with status: ${request.status}`);
    }

    const { paymentMode, paymentMethod } = paymentData;

    if (!Object.values(PAYMENT_MODES).includes(paymentMode)) {
      throw new BadRequestError(`Invalid payment mode: ${paymentMode}`);
    }

    if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      throw new BadRequestError(`Invalid payment method: ${paymentMethod}`);
    }

    // Always calculate authoritative quote on the server
    const quote = quoteService.calculateQuote(
      request.productPriceInr,
      request.quantity,
      paymentMode
    );

    // Update quote snapshot on product request
    request.quote = quote;
    request.status = REQUEST_STATUSES.PAYMENT_PENDING;

    // Server authoritative payment amount binding
    const amountDueNpr = quote.finalAmountNpr;
    const amountPaidNpr = quote.payNowAmountNpr;
    const remainingAmountNpr = quote.remainingCodAmountNpr;

    // Check for existing payment submission to prevent duplicate records
    let paymentSubmission = await PaymentSubmission.findOne({
      productRequest: request._id,
      user: userId,
    });

    if (paymentSubmission) {
      if ([PAYMENT_STATUSES.PROOF_SUBMITTED, PAYMENT_STATUSES.UNDER_REVIEW, PAYMENT_STATUSES.VERIFIED].includes(paymentSubmission.paymentStatus)) {
        throw new BadRequestError(`A payment submission is already ${paymentSubmission.paymentStatus.replace('_', ' ')} for this request`);
      }
      // Update pending submission
      paymentSubmission.paymentMode = paymentMode;
      paymentSubmission.paymentMethod = paymentMethod;
      paymentSubmission.amountDueNpr = amountDueNpr;
      paymentSubmission.amountPaidNpr = amountPaidNpr;
      paymentSubmission.remainingAmountNpr = remainingAmountNpr;
      paymentSubmission.paymentStatus = PAYMENT_STATUSES.PENDING;
    } else {
      paymentSubmission = new PaymentSubmission({
        productRequest: request._id,
        user: userId,
        paymentMode,
        paymentMethod,
        amountDueNpr,
        amountPaidNpr,
        remainingAmountNpr,
        paymentStatus: PAYMENT_STATUSES.PENDING,
      });
    }

    const savedPayment = await paymentSubmission.save();
    request.paymentSubmission = savedPayment._id;
    await request.save();

    return savedPayment;
  }

  /**
   * Submits proof of payment (transaction code and/or screenshot reference).
   * Transitions status to 'proof_submitted' / 'under_review'.
   * @param {string} userId - User ID
   * @param {string} paymentId - PaymentSubmission ID
   * @param {object} proofData - { transactionCode, paymentProof }
   * @returns {Promise<import('mongoose').Document>}
   */
  async submitPaymentProof(userId, paymentId, proofData = {}) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(paymentId, 'Payment ID');

    const payment = await PaymentSubmission.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    assertResourceOwnership(payment, userId, 'Payment submission', 'user');

    if (payment.paymentStatus === PAYMENT_STATUSES.VERIFIED) {
      throw new BadRequestError('Payment is already verified and confirmed');
    }

    const { transactionCode, paymentProof } = proofData;
    if (!transactionCode && !paymentProof) {
      throw new BadRequestError('Either transaction code or payment proof image must be provided');
    }

    // Duplicate check: if same transaction code already recorded and in review
    if (transactionCode && payment.transactionCode === String(transactionCode).trim() && payment.paymentStatus === PAYMENT_STATUSES.PROOF_SUBMITTED) {
      return payment; // Idempotent return without duplicate overhead
    }

    if (transactionCode) {
      payment.transactionCode = String(transactionCode).trim();
    }
    if (paymentProof) {
      payment.paymentProof = String(paymentProof).trim();
    }

    payment.paymentStatus = PAYMENT_STATUSES.PROOF_SUBMITTED;
    payment.submittedAt = new Date();

    const savedPayment = await payment.save();

    // Also update associated product request status to payment_submitted
    await ProductRequest.findByIdAndUpdate(payment.productRequest, {
      status: REQUEST_STATUSES.PAYMENT_SUBMITTED,
    });

    return savedPayment;
  }

  /**
   * Helper: Asserts that a user holds the administrative role.
   * @param {string} adminUserId
   */
  async assertAdmin(adminUserId) {
    this.validateObjectId(adminUserId, 'Admin User ID');
    const { User, USER_ROLES } = await import('../models/user.model.js');
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Administrative privileges required');
    }
    return adminUser;
  }

  /**
   * Retrieves payment submission details including proof for administrative inspection.
   * @param {string} adminUserId - Admin User ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async getPaymentForAdmin(adminUserId, paymentId) {
    await this.assertAdmin(adminUserId);
    this.validateObjectId(paymentId, 'Payment ID');

    const payment = await PaymentSubmission.findById(paymentId)
      .populate('user', 'name email phone role')
      .populate('productRequest');

    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    return payment;
  }

  /**
   * Reviews and verifies or rejects a customer payment submission.
   * Updates associated ProductRequest status accordingly.
   * @param {string} adminUserId - Admin User ID
   * @param {string} paymentId - Payment ID
   * @param {object} reviewData - { status: 'verified' | 'rejected', rejectionReason?: string }
   * @returns {Promise<import('mongoose').Document>}
   */
  async reviewPayment(adminUserId, paymentId, reviewData = {}) {
    await this.assertAdmin(adminUserId);
    this.validateObjectId(paymentId, 'Payment ID');

    const payment = await PaymentSubmission.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    const { status, rejectionReason } = reviewData;
    if (![PAYMENT_STATUSES.VERIFIED, PAYMENT_STATUSES.REJECTED].includes(status)) {
      throw new BadRequestError('Review status must be either "verified" or "rejected"');
    }

    payment.paymentStatus = status;
    payment.verifiedAt = new Date();
    payment.verifiedBy = adminUserId;
    if (status === PAYMENT_STATUSES.REJECTED) {
      payment.rejectionReason = rejectionReason ? String(rejectionReason).trim() : 'Payment proof rejected by admin';
    }

    const savedPayment = await payment.save();

    // Update product request status based on verification result
    const newRequestStatus = status === PAYMENT_STATUSES.VERIFIED
      ? REQUEST_STATUSES.PAYMENT_VERIFIED
      : REQUEST_STATUSES.PAYMENT_PENDING;

    await ProductRequest.findByIdAndUpdate(payment.productRequest, {
      status: newRequestStatus,
    });

    return savedPayment;
  }

  /**
   * Retrieves payment proof securely for the customer who owns it or an administrator.
   * Prevents public static unauthorized access to financial receipts.
   * @param {string} requesterUserId - User ID of the requester
   * @param {string} paymentId - PaymentSubmission ID
   * @param {boolean} isAdmin - Whether requester holds admin privilege
   */
  async getPaymentProofAccess(requesterUserId, paymentId, isAdmin = false) {
    this.validateObjectId(requesterUserId, 'User ID');
    this.validateObjectId(paymentId, 'Payment ID');

    const payment = await PaymentSubmission.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    if (!isAdmin) {
      assertResourceOwnership(payment, requesterUserId, 'Payment submission', 'user');
    }

    if (!payment.paymentProof) {
      throw new NotFoundError('No payment proof file attached to this submission');
    }

    return {
      paymentId: payment._id,
      paymentProof: payment.paymentProof,
      paymentStatus: payment.paymentStatus,
      transactionCode: payment.transactionCode,
      submittedAt: payment.submittedAt,
    };
  }

  /**
   * Retrieves payment details for the customer or admin with ownership verification.
   * @param {string} userId - Requesting user ID
   * @param {string} paymentId - PaymentSubmission ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async getPaymentDetailsForCustomer(userId, paymentId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(paymentId, 'Payment ID');

    const payment = await PaymentSubmission.findById(paymentId)
      .populate('productRequest', 'productName productUrl marketplace quantity variant status quote')
      .lean();
    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    assertResourceOwnership(payment, userId, 'Payment submission', 'user');

    const { internalNotes, __v, verifiedBy, ...customerSafePayment } = payment;
    return customerSafePayment;
  }
}

export const paymentService = new PaymentService();
export default paymentService;

