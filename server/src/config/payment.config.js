import { PAYMENT_METHODS } from '../constants/payment.constants.js';

/**
 * Server-side payment configuration foundation for supported digital wallets.
 */
export const paymentConfig = {
  providers: {
    [PAYMENT_METHODS.ESEWA]: {
      id: PAYMENT_METHODS.ESEWA,
      displayName: 'eSewa Mobile Wallet',
      enabled: true,
      qrImageReference: 'esewa_merchant_qr.webp',
      accountName: 'SajiloMarts Pvt. Ltd.',
      instructions: 'Scan the eSewa QR code or transfer to the SajiloMarts ID and submit your transaction code.',
    },
  },
};

export default paymentConfig;
