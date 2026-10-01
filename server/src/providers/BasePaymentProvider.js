/**
 * BasePaymentProvider
 * Abstract base class for all SajiloMarts payment provider integrations.
 * Each provider (eSewa, Khalti, MyPay) extends this class and implements
 * the standard payment lifecycle methods.
 *
 * Provider-specific logic is isolated here — order lifecycle, customer accounts,
 * quote calculations, and frontend presentation remain separate.
 */
export class BasePaymentProvider {
  /**
   * @param {string} providerId - Provider identifier (e.g. 'esewa', 'khalti', 'mypay')
   * @param {object} config - Provider-specific configuration from environment
   */
  constructor(providerId, config = {}) {
    if (new.target === BasePaymentProvider) {
      throw new Error('BasePaymentProvider is abstract and cannot be instantiated directly');
    }
    this.providerId = providerId;
    this.config = config;
  }

  /**
   * Returns the provider identifier.
   * @returns {string}
   */
  getId() {
    return this.providerId;
  }

  /**
   * Returns whether this provider is properly configured and enabled.
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Initiates a payment with the provider.
   * @param {object} paymentData - { paymentId, orderId, amount, currency, returnUrl, ... }
   * @returns {Promise<object>} - { providerPaymentId, paymentUrl, formData, ... }
   */
  async initiatePayment(paymentData) {
    throw new Error(`initiatePayment() not implemented for provider: ${this.providerId}`);
  }

  /**
   * Verifies a payment with the provider's server-side API.
   * @param {object} verificationData - Provider-specific verification parameters
   * @returns {Promise<object>} - { verified, status, providerRefId, amount, rawResponse }
   */
  async verifyPayment(verificationData) {
    throw new Error(`verifyPayment() not implemented for provider: ${this.providerId}`);
  }

  /**
   * Parses and validates an incoming provider callback/redirect payload.
   * @param {object} callbackData - Raw callback/redirect data from the provider
   * @returns {object} - { valid, paymentId, providerRefId, status, amount, signature }
   */
  parseCallback(callbackData) {
    throw new Error(`parseCallback() not implemented for provider: ${this.providerId}`);
  }

  /**
   * Validates the authenticity of a provider callback (signature, merchant identity).
   * @param {object} callbackData - Raw callback data
   * @returns {boolean}
   */
  validateCallbackSignature(callbackData) {
    return false;
  }

  /**
   * Maps a provider-specific status string to a SajiloMarts PAYMENT_STATUS.
   * @param {string} providerStatus - Provider's status string
   * @returns {string} - SajiloMarts payment status constant
   */
  mapProviderStatus(providerStatus) {
    throw new Error(`mapProviderStatus() not implemented for provider: ${this.providerId}`);
  }

  /**
   * Returns the display name for this provider.
   * @returns {string}
   */
  getDisplayName() {
    return this.providerId;
  }
}

export default BasePaymentProvider;
