import { BasePaymentProvider } from './BasePaymentProvider.js';
import { PAYMENT_STATUSES } from '../constants/payment.constants.js';

/**
 * Khalti Payment Provider (Web Checkout / KPG 2)
 *
 * Official Khalti Web Checkout flow:
 * 1. Backend sends POST to Khalti initiate API with amount, return_url, purchase_order_id
 * 2. Khalti returns pidx + payment_url
 * 3. Frontend redirects user to payment_url
 * 4. User pays on Khalti platform
 * 5. Khalti redirects user back to return_url with pidx, status, etc.
 * 6. Backend verifies via Khalti Lookup API using pidx
 *
 * References: https://docs.khalti.com/khalti-epayment/
 * Amount is in PAISA (1 NPR = 100 paisa)
 */
export class KhaltiProvider extends BasePaymentProvider {
  constructor(config = {}) {
    super('khalti', config);

    this.secretKey = config.secretKey || process.env.KHALTI_SECRET_KEY || '';
    this.publicKey = config.publicKey || process.env.KHALTI_PUBLIC_KEY || '';
    this.websiteUrl = config.websiteUrl || process.env.KHALTI_WEBSITE_URL || process.env.CLIENT_URL || '';

    const isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = isProduction
      ? 'https://khalti.com/api/v2'
      : 'https://a.khalti.com/api/v2';
  }

  /**
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.secretKey);
  }

  getDisplayName() {
    return 'Khalti Digital Wallet';
  }

  /**
   * Initiates a Khalti payment via server-to-server API call.
   * Khalti amounts are in PAISA (multiply NPR by 100).
   *
   * @param {object} paymentData
   * @param {string} paymentData.paymentId - Internal payment submission ID
   * @param {number} paymentData.amount - Total amount in NPR
   * @param {string} paymentData.returnUrl - Callback URL after payment
   * @param {string} paymentData.productName - Order/product description
   * @param {string} paymentData.orderId - Order reference
   * @returns {Promise<object>}
   */
  async initiatePayment(paymentData) {
    const { paymentId, amount, returnUrl, productName, orderId } = paymentData;

    if (!this.isConfigured()) {
      throw new Error('Khalti provider is not configured. Set KHALTI_SECRET_KEY.');
    }

    // Khalti requires amount in paisa
    const amountInPaisa = Math.round(Number(amount) * 100);

    const requestBody = {
      return_url: returnUrl,
      website_url: this.websiteUrl,
      amount: amountInPaisa,
      purchase_order_id: paymentId,
      purchase_order_name: productName || `SajiloMarts Order ${orderId || paymentId}`,
    };

    try {
      const response = await fetch(`${this.baseUrl}/epayment/initiate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(`Khalti initiation failed (${response.status}): ${errorBody}`);
      }

      const data = await response.json();

      return {
        providerPaymentId: data.pidx,
        paymentUrl: data.payment_url,
        method: 'REDIRECT',
        provider: 'khalti',
        pidx: data.pidx,
      };
    } catch (err) {
      if (err.message.includes('Khalti initiation failed')) throw err;
      throw new Error(`Khalti payment initiation error: ${err.message}`);
    }
  }

  /**
   * Verifies a payment via Khalti's Lookup API.
   *
   * @param {object} verificationData
   * @param {string} verificationData.pidx - Khalti payment index
   * @param {number} verificationData.expectedAmount - Server-authoritative expected amount in NPR
   * @returns {Promise<object>}
   */
  async verifyPayment(verificationData) {
    const { pidx, expectedAmount } = verificationData;

    if (!this.isConfigured()) {
      return { verified: false, status: 'not_configured', providerRefId: null, amount: 0, rawResponse: null };
    }

    try {
      const response = await fetch(`${this.baseUrl}/epayment/lookup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return {
          verified: false,
          status: 'verification_failed',
          providerRefId: pidx,
          amount: 0,
          rawResponse: { httpStatus: response.status },
        };
      }

      const data = await response.json();

      const providerStatus = String(data.status || '').toLowerCase();
      // Khalti returns amount in paisa — convert to NPR
      const providerAmountNpr = Number(data.total_amount || 0) / 100;
      const providerRefId = data.pidx || pidx;

      const amountMatches = Math.abs(providerAmountNpr - expectedAmount) < 0.01;
      const isCompleted = providerStatus === 'completed';

      return {
        verified: isCompleted && amountMatches,
        status: this.mapProviderStatus(providerStatus),
        providerRefId: String(providerRefId),
        amount: providerAmountNpr,
        amountMatches,
        rawResponse: {
          pidx: data.pidx,
          status: data.status,
          total_amount: data.total_amount,
          transaction_id: data.transaction_id,
          fee: data.fee,
          refunded: data.refunded,
        },
      };
    } catch (err) {
      return {
        verified: false,
        status: 'verification_error',
        providerRefId: pidx,
        amount: 0,
        error: err.message,
        rawResponse: null,
      };
    }
  }

  /**
   * Parses Khalti callback/redirect data.
   * Khalti redirects with query parameters: pidx, transaction_id, tidx, amount, total_amount, status, etc.
   *
   * @param {object} callbackData - Query parameters from the redirect
   * @returns {object}
   */
  parseCallback(callbackData) {
    try {
      const { pidx, transaction_id, tidx, amount, total_amount, status, purchase_order_id, purchase_order_name } = callbackData;

      if (!pidx) {
        return { valid: false, error: 'Missing pidx in Khalti callback' };
      }

      return {
        valid: true,
        pidx,
        providerRefId: transaction_id || tidx || pidx,
        status: status || 'unknown',
        amount: Number(total_amount || amount || 0) / 100, // Convert paisa to NPR
        paymentId: purchase_order_id,
        productName: purchase_order_name,
        raw: callbackData,
      };
    } catch (err) {
      return { valid: false, error: `Failed to parse Khalti callback: ${err.message}` };
    }
  }

  /**
   * Khalti callbacks are verified via the Lookup API, not via signature.
   * Always return true here and require server-side verification.
   */
  validateCallbackSignature() {
    // Khalti doesn't use callback signatures — verification is done via Lookup API
    return true;
  }

  /**
   * Maps Khalti status to SajiloMarts payment status.
   * @param {string} providerStatus
   * @returns {string}
   */
  mapProviderStatus(providerStatus) {
    const statusMap = {
      completed: PAYMENT_STATUSES.VERIFIED,
      pending: PAYMENT_STATUSES.PROVIDER_PENDING,
      initiated: PAYMENT_STATUSES.INITIATED,
      refunded: PAYMENT_STATUSES.CANCELLED,
      partially_refunded: PAYMENT_STATUSES.CANCELLED,
      expired: PAYMENT_STATUSES.EXPIRED,
      'user canceled': PAYMENT_STATUSES.CANCELLED,
      failed: PAYMENT_STATUSES.FAILED,
    };
    return statusMap[String(providerStatus).toLowerCase()] || PAYMENT_STATUSES.UNDER_REVIEW;
  }
}

export default KhaltiProvider;
