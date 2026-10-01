import { BaseService } from './base.service.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { providerRegistry } from '../providers/index.js';
import { PAYMENT_STATUSES, VERIFICATION_SOURCES } from '../constants/payment.constants.js';
import { BadRequestError, NotFoundError } from '../utils/index.js';
import { recordSecurityEvent } from '../utils/securityAudit.js';

/**
 * PaymentVerificationService
 * Handles server-authoritative verification of payments through provider APIs.
 * Never trusts frontend-reported payment status — always calls provider's verify endpoint.
 */
export class PaymentVerificationService extends BaseService {
  /**
   * Verifies a payment through its provider's server-to-server API.
   * Compares the provider-reported amount against the server-authoritative expected amount.
   *
   * @param {string} paymentId - PaymentSubmission ID
   * @param {object} [providerData] - Optional provider-specific data (e.g. pidx, transactionUuid)
   * @returns {Promise<object>} - { verified, payment, verificationResult }
   */
  async verifyPaymentWithProvider(paymentId, providerData = {}) {
    const payment = await PaymentSubmission.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment submission not found');
    }

    // Prevent re-verification of already terminal states
    if (payment.paymentStatus === PAYMENT_STATUSES.VERIFIED) {
      return { verified: true, payment, verificationResult: { status: 'already_verified' } };
    }

    const provider = providerRegistry.getProvider(payment.paymentMethod);
    if (!provider.isConfigured()) {
      throw new BadRequestError(`Provider '${payment.paymentMethod}' is not configured for verification`);
    }

    // Build verification data from payment record + any callback data
    const verificationPayload = this.buildVerificationPayload(payment, providerData);
    const expectedAmount = payment.amountPaidNpr;

    // Call provider verification API
    const result = await provider.verifyPayment({
      ...verificationPayload,
      expectedAmount,
    });

    // Record audit event
    recordSecurityEvent('PAYMENT_VERIFICATION_ATTEMPT', {
      userId: String(payment.user),
      success: result.verified,
      reason: result.verified
        ? `Provider confirmed ${result.amount} NPR`
        : `Verification failed: status=${result.status}, amountMatch=${result.amountMatches}`,
    });

    // Handle amount mismatch specifically
    if (result.status !== 'verification_error' && result.amount > 0 && !result.amountMatches) {
      recordSecurityEvent('PAYMENT_AMOUNT_MISMATCH', {
        userId: String(payment.user),
        success: false,
        reason: `Expected ${expectedAmount} NPR, provider reported ${result.amount} NPR`,
      });

      payment.paymentStatus = PAYMENT_STATUSES.UNDER_REVIEW;
      payment.providerMetadata = {
        ...payment.providerMetadata,
        amountMismatch: true,
        expectedAmount,
        reportedAmount: result.amount,
        verificationAttemptAt: new Date().toISOString(),
      };
      await payment.save();

      return { verified: false, payment, verificationResult: result, reason: 'amount_mismatch' };
    }

    // Update payment status based on verification result
    if (result.verified) {
      payment.paymentStatus = PAYMENT_STATUSES.VERIFIED;
      payment.verifiedAt = new Date();
      payment.verificationSource = VERIFICATION_SOURCES.PROVIDER_API;
      payment.providerRefId = result.providerRefId || payment.providerRefId;
      payment.providerMetadata = {
        ...payment.providerMetadata,
        verifiedAt: new Date().toISOString(),
        verificationResponse: result.rawResponse,
      };
    } else {
      // Map provider status to internal status
      const mappedStatus = result.status || PAYMENT_STATUSES.UNDER_REVIEW;
      if (Object.values(PAYMENT_STATUSES).includes(mappedStatus)) {
        payment.paymentStatus = mappedStatus;
      } else {
        payment.paymentStatus = PAYMENT_STATUSES.UNDER_REVIEW;
      }

      payment.providerMetadata = {
        ...payment.providerMetadata,
        lastVerificationAttempt: new Date().toISOString(),
        lastVerificationStatus: result.status,
        verificationError: result.error || null,
      };
    }

    await payment.save();
    return { verified: result.verified, payment, verificationResult: result };
  }

  /**
   * Builds the provider-specific verification payload from the payment record.
   * @param {object} payment
   * @param {object} providerData - Additional data from callback/redirect
   * @returns {object}
   */
  buildVerificationPayload(payment, providerData = {}) {
    const method = payment.paymentMethod;

    switch (method) {
      case 'esewa':
        return {
          transactionUuid: providerData.transactionUuid || payment.providerPaymentId,
        };
      case 'khalti':
        return {
          pidx: providerData.pidx || payment.providerPaymentId,
        };
      case 'mypay':
        return {
          mypayOrderId: providerData.mypayOrderId || payment.providerPaymentId,
        };
      default:
        return providerData;
    }
  }
}

export const paymentVerificationService = new PaymentVerificationService();
export default paymentVerificationService;
