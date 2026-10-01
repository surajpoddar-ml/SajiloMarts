import { BasePaymentProvider } from './BasePaymentProvider.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';

/**
 * MyPay Payment Provider
 *
 * Official MyPay REST API flow:
 * 1. Backend creates an order via MyPay API with API_KEY authentication
 * 2. MyPay returns a payment URL for the customer
 * 3. Customer completes payment on MyPay platform
 * 4. MyPay redirects/notifies with payment status
 * 5. Backend verifies via MyPay status check API
 *
 * References: https://docs.mypay.com.np/
 * Authentication: API_KEY header
 */
export class MypayProvider extends BasePaymentProvider {
  constructor(config = {}) {
    super('mypay', config);

    this.apiKey = config.apiKey || process.env.MYPAY_API_KEY || '';
    this.merchantId = config.merchantId || process.env.MYPAY_MERCHANT_ID || '';

    const isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = isProduction
      ? 'https://smartdigitalnepal.com/api/v2'
      : 'https://uat-smartdigitalnepal.com/api/v2';
  }

  /**
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.apiKey && this.merchantId);
  }

  getDisplayName() {
    return 'MyPay Digital Wallet';
  }

  /**
   * Initiates a MyPay payment by creating an order via REST API.
   *
   * @param {object} paymentData
   * @param {string} paymentData.paymentId - Internal payment submission ID
   * @param {number} paymentData.amount - Total amount in NPR
   * @param {string} paymentData.returnUrl - Success callback URL
   * @param {string} paymentData.failureUrl - Failure callback URL
   * @param {string} paymentData.productName - Product/order description
   * @param {string} paymentData.orderId - Order reference
   * @returns {Promise<object>}
   */
  async initiatePayment(paymentData) {
    const { paymentId, amount, returnUrl, failureUrl, productName, orderId } = paymentData;

    if (!this.isConfigured()) {
      throw new Error('MyPay provider is not configured. Set MYPAY_API_KEY and MYPAY_MERCHANT_ID.');
    }

    const requestBody = {
      amount: Number(amount).toFixed(2),
      merchant_id: this.merchantId,
      order_id: paymentId,
      order_name: productName || `SajiloMarts Order ${orderId || paymentId}`,
      return_url: returnUrl,
      cancel_url: failureUrl,
    };

    try {
      const response = await fetch(`${this.baseUrl}/create-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`MyPay order creation failed (${response.status}): ${errorBody}`);
      }

      const data = await response.json();

      return {
        providerPaymentId: data.order_id || data.id || paymentId,
        paymentUrl: data.payment_url || data.redirect_url,
        method: 'REDIRECT',
        provider: 'mypay',
        mypayOrderId: data.order_id || data.id,
      };
    } catch (err) {
      if (err.message.includes('MyPay order creation failed')) throw err;
      throw new Error(`MyPay payment initiation error: ${err.message}`);
    }
  }

  /**
   * Verifies a payment via MyPay's status check API.
   *
   * @param {object} verificationData
   * @param {string} verificationData.mypayOrderId - MyPay order/transaction ID
   * @param {number} verificationData.expectedAmount - Server-authoritative expected amount in NPR
   * @returns {Promise<object>}
   */
  async verifyPayment(verificationData) {
    const { mypayOrderId, expectedAmount } = verificationData;

    if (!this.isConfigured()) {
      return { verified: false, status: 'not_configured', providerRefId: null, amount: 0, rawResponse: null };
    }

    try {
      const response = await fetch(`${this.baseUrl}/check-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API_KEY': this.apiKey,
        },
        body: JSON.stringify({ order_id: mypayOrderId }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return {
          verified: false,
          status: 'verification_failed',
          providerRefId: mypayOrderId,
          amount: 0,
          rawResponse: { httpStatus: response.status },
        };
      }

      const data = await response.json();

      const providerStatus = String(data.status || data.payment_status || '').toLowerCase();
      const providerAmount = Number(data.amount || data.total_amount || 0);
      const providerRefId = data.transaction_id || data.order_id || mypayOrderId;

      const amountMatches = Math.abs(providerAmount - expectedAmount) < 0.01;
      const isCompleted = providerStatus === 'completed' || providerStatus === 'success';

      return {
        verified: isCompleted && amountMatches,
        status: this.mapProviderStatus(providerStatus),
        providerRefId: String(providerRefId),
        amount: providerAmount,
        amountMatches,
        rawResponse: {
          status: data.status || data.payment_status,
          transaction_id: data.transaction_id,
          order_id: data.order_id,
          amount: data.amount || data.total_amount,
        },
      };
    } catch (err) {
      return {
        verified: false,
        status: 'verification_error',
        providerRefId: mypayOrderId,
        amount: 0,
        error: err.message,
        rawResponse: null,
      };
    }
  }

  /**
   * Parses MyPay callback/redirect data.
   *
   * @param {object} callbackData - Query parameters or POST body from MyPay redirect
   * @returns {object}
   */
  parseCallback(callbackData) {
    try {
      const { order_id, transaction_id, status, amount, total_amount } = callbackData;

      if (!order_id && !transaction_id) {
        return { valid: false, error: 'Missing order_id or transaction_id in MyPay callback' };
      }

      return {
        valid: true,
        mypayOrderId: order_id,
        providerRefId: transaction_id || order_id,
        status: status || 'unknown',
        amount: Number(total_amount || amount || 0),
        paymentId: order_id,
        raw: callbackData,
      };
    } catch (err) {
      return { valid: false, error: `Failed to parse MyPay callback: ${err.message}` };
    }
  }

  /**
   * MyPay callbacks are verified via the status check API, not via signature.
   */
  validateCallbackSignature() {
    return true;
  }

  /**
   * Maps MyPay status to SajiloMarts payment status.
   * @param {string} providerStatus
   * @returns {string}
   */
  mapProviderStatus(providerStatus) {
    const statusMap = {
      completed: PAYMENT_STATUSES.VERIFIED,
      success: PAYMENT_STATUSES.VERIFIED,
      pending: PAYMENT_STATUSES.PROVIDER_PENDING,
      processing: PAYMENT_STATUSES.PROVIDER_PENDING,
      cancelled: PAYMENT_STATUSES.CANCELLED,
      failed: PAYMENT_STATUSES.FAILED,
      refunded: PAYMENT_STATUSES.CANCELLED,
      expired: PAYMENT_STATUSES.EXPIRED,
    };
    return statusMap[String(providerStatus).toLowerCase()] || PAYMENT_STATUSES.UNDER_REVIEW;
  }
}

export default MypayProvider;
