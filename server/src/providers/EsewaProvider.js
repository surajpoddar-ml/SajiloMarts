import crypto from 'crypto';
import { BasePaymentProvider } from './BasePaymentProvider.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';

/**
 * eSewa Payment Provider (ePay Integration)
 *
 * Official eSewa ePay flow:
 * 1. Backend generates HMAC-SHA256 signed form data
 * 2. Frontend submits form POST to eSewa gateway
 * 3. User pays on eSewa platform
 * 4. eSewa redirects user back to success/failure URL with encoded data
 * 5. Backend performs server-to-server verification via status check API
 *
 * References: https://developer.esewa.com.np/pages/Epay
 */
export class EsewaProvider extends BasePaymentProvider {
  constructor(config = {}) {
    super('esewa', config);

    this.merchantCode = config.merchantCode || process.env.ESEWA_MERCHANT_CODE || '';
    this.secretKey = config.secretKey || process.env.ESEWA_SECRET_KEY || '';

    const isProduction = process.env.NODE_ENV === 'production';
    this.gatewayUrl = isProduction
      ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
      : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    this.verificationUrl = isProduction
      ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
      : 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
  }

  /**
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.merchantCode && this.secretKey);
  }

  getDisplayName() {
    return 'eSewa Digital Wallet';
  }

  /**
   * Generates HMAC-SHA256 signature per eSewa ePay specification.
   * @param {string} message - Comma-separated signed field values
   * @returns {string} Base64-encoded HMAC-SHA256 signature
   */
  generateSignature(message) {
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Initiates an eSewa payment by generating signed form data.
   * The frontend must submit this as a form POST to the gateway URL.
   *
   * @param {object} paymentData
   * @param {string} paymentData.paymentId - Internal payment submission ID
   * @param {number} paymentData.amount - Total amount in NPR
   * @param {string} paymentData.returnUrl - Success callback URL
   * @param {string} paymentData.failureUrl - Failure callback URL
   * @returns {Promise<object>}
   */
  async initiatePayment(paymentData) {
    const { paymentId, amount, returnUrl, failureUrl } = paymentData;

    if (!this.isConfigured()) {
      throw new Error('eSewa provider is not configured. Set ESEWA_MERCHANT_CODE and ESEWA_SECRET_KEY.');
    }

    const transactionUuid = `SM-${paymentId}-${Date.now()}`;
    const totalAmount = Number(amount);
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;

    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;
    const signature = this.generateSignature(signatureMessage);

    const formData = {
      amount: totalAmount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionUuid,
      product_code: this.merchantCode,
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      success_url: returnUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    };

    return {
      providerPaymentId: transactionUuid,
      paymentUrl: this.gatewayUrl,
      method: 'POST',
      formData,
      provider: 'esewa',
    };
  }

  /**
   * Verifies a payment via eSewa's server-to-server status check API.
   *
   * @param {object} verificationData
   * @param {string} verificationData.transactionUuid - The transaction_uuid used during initiation
   * @param {number} verificationData.expectedAmount - Server-authoritative expected amount
   * @returns {Promise<object>}
   */
  async verifyPayment(verificationData) {
    const { transactionUuid, expectedAmount } = verificationData;

    if (!this.isConfigured()) {
      return { verified: false, status: 'not_configured', providerRefId: null, amount: 0, rawResponse: null };
    }

    try {
      const url = `${this.verificationUrl}?product_code=${this.merchantCode}&total_amount=${expectedAmount}&transaction_uuid=${transactionUuid}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return {
          verified: false,
          status: 'verification_failed',
          providerRefId: transactionUuid,
          amount: 0,
          rawResponse: { httpStatus: response.status },
        };
      }

      const data = await response.json();

      const providerStatus = String(data.status || '').toUpperCase();
      const providerAmount = Number(data.total_amount) || 0;
      const providerRefId = data.ref_id || data.transaction_uuid || transactionUuid;

      // Verify the amount matches our server-authoritative expectation
      const amountMatches = Math.abs(providerAmount - expectedAmount) < 0.01;
      const isComplete = providerStatus === 'COMPLETE';

      return {
        verified: isComplete && amountMatches,
        status: this.mapProviderStatus(providerStatus),
        providerRefId: String(providerRefId),
        amount: providerAmount,
        amountMatches,
        rawResponse: {
          status: data.status,
          ref_id: data.ref_id,
          total_amount: data.total_amount,
          transaction_uuid: data.transaction_uuid,
        },
      };
    } catch (err) {
      return {
        verified: false,
        status: 'verification_error',
        providerRefId: transactionUuid,
        amount: 0,
        error: err.message,
        rawResponse: null,
      };
    }
  }

  /**
   * Parses the eSewa callback/redirect data.
   * eSewa redirects with base64 encoded data in query parameter.
   *
   * @param {object} callbackData - { data } from query string
   * @returns {object}
   */
  parseCallback(callbackData) {
    try {
      const encodedData = callbackData.data;
      if (!encodedData) {
        return { valid: false, error: 'Missing callback data parameter' };
      }

      const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));

      return {
        valid: true,
        transactionUuid: decoded.transaction_uuid,
        providerRefId: decoded.transaction_code || decoded.ref_id,
        status: decoded.status,
        amount: Number(decoded.total_amount) || 0,
        productCode: decoded.product_code,
        signedFieldNames: decoded.signed_field_names,
        signature: decoded.signature,
        raw: decoded,
      };
    } catch (err) {
      return { valid: false, error: `Failed to parse eSewa callback: ${err.message}` };
    }
  }

  /**
   * Validates the callback signature from eSewa.
   * @param {object} callbackData - Parsed callback data
   * @returns {boolean}
   */
  validateCallbackSignature(callbackData) {
    try {
      if (!callbackData.raw || !callbackData.signature || !callbackData.signedFieldNames) {
        return false;
      }

      const fieldNames = callbackData.signedFieldNames.split(',');
      const messageParts = fieldNames.map((field) => `${field}=${callbackData.raw[field]}`);
      const message = messageParts.join(',');
      const expectedSignature = this.generateSignature(message);

      // Timing-safe comparison
      const sig1 = Buffer.from(callbackData.signature, 'base64');
      const sig2 = Buffer.from(expectedSignature, 'base64');
      if (sig1.length !== sig2.length) return false;
      return crypto.timingSafeEqual(sig1, sig2);
    } catch {
      return false;
    }
  }

  /**
   * Maps eSewa status to SajiloMarts payment status.
   * @param {string} providerStatus
   * @returns {string}
   */
  mapProviderStatus(providerStatus) {
    const statusMap = {
      COMPLETE: PAYMENT_STATUSES.VERIFIED,
      PENDING: PAYMENT_STATUSES.PROVIDER_PENDING,
      FULL_REFUND: PAYMENT_STATUSES.CANCELLED,
      PARTIAL_REFUND: PAYMENT_STATUSES.CANCELLED,
      AMBIGUOUS: PAYMENT_STATUSES.UNDER_REVIEW,
      NOT_FOUND: PAYMENT_STATUSES.FAILED,
      CANCELLED: PAYMENT_STATUSES.CANCELLED,
      EXPIRED: PAYMENT_STATUSES.EXPIRED,
    };
    return statusMap[String(providerStatus).toUpperCase()] || PAYMENT_STATUSES.UNDER_REVIEW;
  }
}

export default EsewaProvider;
