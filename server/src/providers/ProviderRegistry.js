import { PAYMENT_METHODS } from '../constants/payment.constants.js';
import { BadRequestError } from '../utils/index.js';

/**
 * ProviderRegistry
 * Central registry for payment provider instances.
 * Provides lookup by provider ID and prevents duplicate registration.
 */
class ProviderRegistry {
  constructor() {
    /** @type {Map<string, import('./BasePaymentProvider.js').BasePaymentProvider>} */
    this.providers = new Map();
  }

  /**
   * Registers a payment provider instance.
   * @param {import('./BasePaymentProvider.js').BasePaymentProvider} provider
   */
  register(provider) {
    if (!provider || !provider.getId) {
      throw new Error('Invalid provider: must extend BasePaymentProvider');
    }
    const id = provider.getId();
    if (this.providers.has(id)) {
      throw new Error(`Provider '${id}' is already registered`);
    }
    this.providers.set(id, provider);
  }

  /**
   * Retrieves a registered provider by ID.
   * @param {string} providerId
   * @returns {import('./BasePaymentProvider.js').BasePaymentProvider}
   */
  getProvider(providerId) {
    const cleanId = String(providerId || '').toLowerCase().trim();
    const provider = this.providers.get(cleanId);
    if (!provider) {
      throw new BadRequestError(`Payment provider '${cleanId}' is not available`);
    }
    return provider;
  }

  /**
   * Checks if a provider is registered.
   * @param {string} providerId
   * @returns {boolean}
   */
  hasProvider(providerId) {
    return this.providers.has(String(providerId || '').toLowerCase().trim());
  }

  /**
   * Returns all registered provider IDs.
   * @returns {string[]}
   */
  getRegisteredProviderIds() {
    return [...this.providers.keys()];
  }

  /**
   * Returns all configured (ready-to-use) providers.
   * @returns {import('./BasePaymentProvider.js').BasePaymentProvider[]}
   */
  getConfiguredProviders() {
    return [...this.providers.values()].filter((p) => p.isConfigured());
  }

  /**
   * Returns a summary of provider availability (safe for logging, no secrets).
   * @returns {object}
   */
  getAvailabilitySummary() {
    const summary = {};
    for (const [id, provider] of this.providers.entries()) {
      summary[id] = {
        registered: true,
        configured: provider.isConfigured(),
        displayName: provider.getDisplayName(),
      };
    }
    // Add unconfigured providers
    for (const method of Object.values(PAYMENT_METHODS)) {
      if (!summary[method]) {
        summary[method] = { registered: false, configured: false };
      }
    }
    return summary;
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
export default providerRegistry;
