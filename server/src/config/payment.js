import { PAYMENT_METHODS } from '../constants/payment.constants.js';

/**
 * Server-side payment configuration.
 * Lists only the officially supported SajiloMarts payment providers.
 * Provider credentials are loaded from environment variables — never hardcoded.
 */
export const paymentConfig = {
  currency: 'NPR',
  supportedGateways: Object.values(PAYMENT_METHODS),
  webhookTimeoutMs: 30000,
};
