import React from 'react';
import { EsewaPaymentInterface } from './interfaces/EsewaPaymentInterface.jsx';
import { KhaltiPaymentInterface } from './interfaces/KhaltiPaymentInterface.jsx';
import { MypayPaymentInterface } from './interfaces/MypayPaymentInterface.jsx';
import { CodModeInfoCard } from './CodModeInfoCard.jsx';

/**
 * PaymentQrPresenter
 * Dynamically switches and presents the active payment method's QR code and instructions.
 * Each provider renders ONLY its own QR — never another provider's QR.
 *
 * @param {string} selectedMethod - 'esewa' | 'khalti' | 'mypay' | 'cod_50_50'
 * @param {object} breakdown - Authoritative payment breakdown
 * @param {object} providerConfigs - Map of provider -> { qrImageData, accountName, accountNumber, ... }
 */
export const PaymentQrPresenter = ({
  selectedMethod = 'esewa',
  breakdown,
  providerConfigs = {},
}) => {
  if (!breakdown) return null;

  const amountPayable = breakdown.payNowAmountNpr ?? breakdown.amountPayableNow ?? breakdown.amountPayableNowNpr ?? breakdown.finalAmountNpr ?? 0;

  // STRICT QR ISOLATION RULE:
  // - eSewa QR is shown ONLY when selectedMethod === 'esewa'
  // - Khalti QR is shown ONLY when selectedMethod === 'khalti'
  // - MyPay QR is shown ONLY when selectedMethod === 'mypay'
  // - cod_50_50 uses eSewa QR for the 50% advance payment only
  // - NEVER display one provider's QR for another provider

  const getProviderQrConfig = (method) => {
    // Strict provider-to-QR mapping — never cross-reference
    const config = providerConfigs[method] || null;
    return config;
  };

  return (
    <div className="payment-qr-presenter" style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {selectedMethod === 'cod_50_50' && (
        <>
          <CodModeInfoCard breakdown={breakdown} />
          <EsewaPaymentInterface
            amountPayableNpr={amountPayable}
            providerConfig={getProviderQrConfig('esewa')}
          />
        </>
      )}

      {selectedMethod === 'esewa' && (
        <EsewaPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={getProviderQrConfig('esewa')}
        />
      )}

      {selectedMethod === 'khalti' && (
        <KhaltiPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={getProviderQrConfig('khalti')}
        />
      )}

      {selectedMethod === 'mypay' && (
        <MypayPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={getProviderQrConfig('mypay')}
        />
      )}
    </div>
  );
};

export default PaymentQrPresenter;
