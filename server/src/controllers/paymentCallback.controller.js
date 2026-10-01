import { asyncHandler } from '../utils/index.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { providerRegistry } from '../providers/index.js';
import { paymentVerificationService } from '../services/paymentVerification.service.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';
import { recordSecurityEvent } from '../utils/securityAudit.js';
import { envConfig } from '../config/environment.js';

/**
 * PaymentCallbackController
 * Handles incoming payment provider callbacks/redirects for eSewa, Khalti, and MyPay.
 * Each callback is parsed, validated, and then verified server-to-server.
 */
export const paymentCallbackController = {
  /**
   * Handles eSewa payment callback (redirect back from eSewa gateway).
   * eSewa sends base64-encoded data in the query string.
   */
  handleEsewaCallback: asyncHandler(async (req, res) => {
    const provider = providerRegistry.getProvider('esewa');
    const parsed = provider.parseCallback(req.query);

    if (!parsed.valid) {
      recordSecurityEvent('PAYMENT_CALLBACK_REJECTED', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
        reason: `Invalid eSewa callback: ${parsed.error}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=invalid_callback`);
    }

    // Validate callback signature
    if (!provider.validateCallbackSignature(parsed)) {
      recordSecurityEvent('PAYMENT_CALLBACK_SIGNATURE_INVALID', {
        ip: req.ip,
        success: false,
        reason: 'eSewa callback signature validation failed',
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=signature_invalid`);
    }

    // Find payment by provider payment ID
    const payment = await PaymentSubmission.findOne({
      providerPaymentId: parsed.transactionUuid,
    });

    if (!payment) {
      recordSecurityEvent('PAYMENT_CALLBACK_ORPHAN', {
        ip: req.ip,
        success: false,
        reason: `No payment found for eSewa transaction: ${parsed.transactionUuid}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=payment_not_found`);
    }

    // Server-side verification
    const { verified } = await paymentVerificationService.verifyPaymentWithProvider(
      String(payment._id),
      { transactionUuid: parsed.transactionUuid }
    );

    const redirectStatus = verified ? 'success' : 'pending';
    return res.redirect(`${envConfig.clientUrl}/checkout?status=${redirectStatus}&paymentId=${payment._id}`);
  }),

  /**
   * Handles Khalti payment callback (redirect back from Khalti checkout).
   * Khalti sends pidx, transaction_id, status, etc. as query parameters.
   */
  handleKhaltiCallback: asyncHandler(async (req, res) => {
    const provider = providerRegistry.getProvider('khalti');
    const parsed = provider.parseCallback(req.query);

    if (!parsed.valid) {
      recordSecurityEvent('PAYMENT_CALLBACK_REJECTED', {
        ip: req.ip,
        success: false,
        reason: `Invalid Khalti callback: ${parsed.error}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=invalid_callback`);
    }

    // Find payment by provider payment ID (pidx) or by our payment ID
    const payment = await PaymentSubmission.findOne({
      $or: [
        { providerPaymentId: parsed.pidx },
        { _id: parsed.paymentId },
      ],
    });

    if (!payment) {
      recordSecurityEvent('PAYMENT_CALLBACK_ORPHAN', {
        ip: req.ip,
        success: false,
        reason: `No payment found for Khalti pidx: ${parsed.pidx}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=payment_not_found`);
    }

    // Server-side verification via Lookup API
    const { verified } = await paymentVerificationService.verifyPaymentWithProvider(
      String(payment._id),
      { pidx: parsed.pidx }
    );

    const redirectStatus = verified ? 'success' : 'pending';
    return res.redirect(`${envConfig.clientUrl}/checkout?status=${redirectStatus}&paymentId=${payment._id}`);
  }),

  /**
   * Handles MyPay payment callback.
   */
  handleMypayCallback: asyncHandler(async (req, res) => {
    const provider = providerRegistry.getProvider('mypay');
    const callbackData = { ...req.query, ...req.body };
    const parsed = provider.parseCallback(callbackData);

    if (!parsed.valid) {
      recordSecurityEvent('PAYMENT_CALLBACK_REJECTED', {
        ip: req.ip,
        success: false,
        reason: `Invalid MyPay callback: ${parsed.error}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=invalid_callback`);
    }

    const payment = await PaymentSubmission.findOne({
      $or: [
        { providerPaymentId: parsed.mypayOrderId },
        { _id: parsed.paymentId },
      ],
    });

    if (!payment) {
      recordSecurityEvent('PAYMENT_CALLBACK_ORPHAN', {
        ip: req.ip,
        success: false,
        reason: `No payment found for MyPay order: ${parsed.mypayOrderId}`,
      });
      return res.redirect(`${envConfig.clientUrl}/checkout?status=failed&reason=payment_not_found`);
    }

    const { verified } = await paymentVerificationService.verifyPaymentWithProvider(
      String(payment._id),
      { mypayOrderId: parsed.mypayOrderId }
    );

    const redirectStatus = verified ? 'success' : 'pending';
    return res.redirect(`${envConfig.clientUrl}/checkout?status=${redirectStatus}&paymentId=${payment._id}`);
  }),
};

export default paymentCallbackController;
