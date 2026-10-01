export { BasePaymentProvider } from './BasePaymentProvider.js';
export { providerRegistry } from './ProviderRegistry.js';
export { EsewaProvider } from './EsewaProvider.js';
export { KhaltiProvider } from './KhaltiProvider.js';
export { MypayProvider } from './MypayProvider.js';

import { providerRegistry } from './ProviderRegistry.js';
import { EsewaProvider } from './EsewaProvider.js';
import { KhaltiProvider } from './KhaltiProvider.js';
import { MypayProvider } from './MypayProvider.js';

/**
 * Initializes and registers all payment providers.
 * Call this once during server startup.
 */
export function initializeProviders() {
  try {
    providerRegistry.register(new EsewaProvider());
    providerRegistry.register(new KhaltiProvider());
    providerRegistry.register(new MypayProvider());

    const summary = providerRegistry.getAvailabilitySummary();
    const configured = Object.entries(summary)
      .filter(([, v]) => v.configured)
      .map(([k]) => k);

    if (process.env.NODE_ENV !== 'test') {
      console.info(`[PaymentProviders] Initialized: ${Object.keys(summary).join(', ')}`);
      console.info(`[PaymentProviders] Configured: ${configured.length > 0 ? configured.join(', ') : 'NONE (credentials missing)'}`);
    }

    return summary;
  } catch (err) {
    console.error(`[PaymentProviders] Initialization error: ${err.message}`);
    throw err;
  }
}
