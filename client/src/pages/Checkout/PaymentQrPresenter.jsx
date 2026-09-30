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

  // Get the correct provider config for the selected method
  // For cod_50_50, the customer still needs to pay 50% via a digital wallet — default to esewa
  const getCodPaymentProvider = () => {
    // For COD mode, show eSewa as the default payment interface for the 50% advance
    return providerConfigs.esewa || null;
  };

  return (
    <div className="payment-qr-presenter" style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {selectedMethod === 'cod_50_50' && (
        <>
          <CodModeInfoCard breakdown={breakdown} />
          <EsewaPaymentInterface
            amountPayableNpr={amountPayable}
            providerConfig={getCodPaymentProvider()}
          />
        </>
      )}

      {selectedMethod === 'esewa' && (
        <EsewaPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={providerConfigs.esewa || null}
        />
      )}

      {selectedMethod === 'khalti' && (
        <KhaltiPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={providerConfigs.khalti || null}
        />
      )}

      {selectedMethod === 'mypay' && (
        <MypayPaymentInterface
          amountPayableNpr={amountPayable}
          providerConfig={providerConfigs.mypay || null}
        />
      )}
    </div>
  );
};

export default PaymentQrPresenter;
