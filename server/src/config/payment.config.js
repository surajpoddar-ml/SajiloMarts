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
    [PAYMENT_METHODS.KHALTI]: {
      id: PAYMENT_METHODS.KHALTI,
      displayName: 'Khalti Digital Wallet',
      enabled: true,
      qrImageReference: 'khalti_merchant_qr.webp',
      accountName: 'SajiloMarts Pvt. Ltd.',
      instructions: 'Pay via Khalti QR code or wallet transfer and submit the transaction code.',
    },
    [PAYMENT_METHODS.MYPAY]: {
      id: PAYMENT_METHODS.MYPAY,
      displayName: 'MyPay Digital Wallet',
      enabled: true,
      qrImageReference: 'mypay_merchant_qr.webp',
      accountName: 'SajiloMarts Pvt. Ltd.',
      instructions: 'Pay via MyPay QR code or merchant payment and upload/submit your payment reference.',
    },
    cod: {
      id: 'cod',
      displayName: 'Cash on Delivery (Remaining 50%)',
      enabled: true,
      instructions: 'Pay the remaining balance in cash to the courier upon delivery in Nepal.',
    },
  },
};

export default paymentConfig;
