import { BaseService } from './base.service.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { PaymentReconciliation } from '../models/paymentReconciliation.model.js';
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
      return { verified: true, payment, verificationResult: { status: 'already_verified' }, replayed: false };
    }

    // Replay protection: check if this callback was already processed
    const idempotencyKey = this.buildIdempotencyKey(payment.paymentMethod, providerData);
    if (idempotencyKey && payment.callbackIdempotencyKey === idempotencyKey) {
      recordSecurityEvent('PAYMENT_CALLBACK_REPLAY_BLOCKED', {
        userId: String(payment.user),
        success: false,
        reason: `Duplicate callback blocked: ${idempotencyKey}`,
      });
      return {
        verified: payment.paymentStatus === PAYMENT_STATUSES.VERIFIED,
        payment,
        verificationResult: { status: 'duplicate_callback' },
        replayed: true,
      };
    }

    // Timestamp-based replay window: reject callbacks for payments already processed within 5 mins
    if (payment.callbackProcessedAt) {
      const timeSinceLastCallback = Date.now() - new Date(payment.callbackProcessedAt).getTime();
      const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
      if (timeSinceLastCallback < REPLAY_WINDOW_MS && [PAYMENT_STATUSES.VERIFIED, PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED].includes(payment.paymentStatus)) {
        recordSecurityEvent('PAYMENT_CALLBACK_REPLAY_WINDOW', {
          userId: String(payment.user),
          success: false,
          reason: `Callback replay within ${REPLAY_WINDOW_MS}ms window, status: ${payment.paymentStatus}`,
        });
        return {
          verified: payment.paymentStatus === PAYMENT_STATUSES.VERIFIED,
          payment,
          verificationResult: { status: 'replay_window_blocked' },
          replayed: true,
        };
      }
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

    // Store callback processing data for replay protection
    if (idempotencyKey) {
      payment.callbackIdempotencyKey = idempotencyKey;
    }
    payment.callbackProcessedAt = new Date();

    await payment.save();

    // Create reconciliation record
    try {
      await PaymentReconciliation.create({
        paymentSubmission: payment._id,
        order: payment.order || null,
        user: payment.user,
        provider: payment.paymentMethod,
        providerRefId: result.providerRefId || null,
        providerPaymentId: payment.providerPaymentId || null,
        expectedAmountNpr: expectedAmount,
        receivedAmountNpr: result.amount || 0,
        amountMatches: result.amountMatches !== false,
        currency: 'NPR',
        reconciliationStatus: result.verified ? 'matched' : (result.amountMatches === false ? 'mismatched' : 'failed'),
        verificationSource: VERIFICATION_SOURCES.PROVIDER_API,
        verifiedAt: result.verified ? new Date() : null,
        providerStatus: result.rawResponse?.status || result.status || null,
        providerResponse: result.rawResponse || null,
      });
    } catch (reconErr) {
      // Reconciliation record creation is non-fatal
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[PaymentVerification] Reconciliation record creation failed: ${reconErr.message}`);
      }
    }

    return { verified: result.verified, payment, verificationResult: result, replayed: false };
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

  /**
   * Builds a deterministic idempotency key from provider callback data.
   * @param {string} method - Payment method
   * @param {object} providerData - Provider-specific callback data
   * @returns {string|null}
   */
  buildIdempotencyKey(method, providerData = {}) {
    switch (method) {
      case 'esewa':
        return providerData.transactionUuid ? `esewa:${providerData.transactionUuid}` : null;
      case 'khalti':
        return providerData.pidx ? `khalti:${providerData.pidx}` : null;
      case 'mypay':
        return providerData.mypayOrderId ? `mypay:${providerData.mypayOrderId}` : null;
      default:
        return null;
    }
  }
}

export const paymentVerificationService = new PaymentVerificationService();
export default paymentVerificationService;
