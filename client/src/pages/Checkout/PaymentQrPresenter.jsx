import React from 'react';
import { EsewaPaymentInterface } from './interfaces/EsewaPaymentInterface.jsx';
import { KhaltiPaymentInterface } from './interfaces/KhaltiPaymentInterface.jsx';
import { MypayPaymentInterface } from './interfaces/MypayPaymentInterface.jsx';
import { CodModeInfoCard } from './CodModeInfoCard.jsx';

/**
 * PaymentQrPresenter
 * Dynamically switches and presents the active payment method's instructions and QR configuration.
 */
export const PaymentQrPresenter = ({
  selectedMethod = 'esewa',
  breakdown,
  qrConfig = null,
}) => {
  if (!breakdown) return null;

  const amountPayable = breakdown.amountPayableNowNpr;

  return (
    <div className="payment-qr-presenter" style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {selectedMethod === 'cod_50_50' && (
        <>
          <CodModeInfoCard breakdown={breakdown} />
          <EsewaPaymentInterface
            amountPayableNpr={amountPayable}
            qrConfig={qrConfig}
          />
        </>
      )}

      {selectedMethod === 'esewa' && (
        <EsewaPaymentInterface
          amountPayableNpr={amountPayable}
          qrConfig={qrConfig}
        />
      )}

      {selectedMethod === 'khalti' && (
        <KhaltiPaymentInterface
          amountPayableNpr={amountPayable}
          qrConfig={qrConfig}
        />
      )}

      {selectedMethod === 'mypay' && (
        <MypayPaymentInterface
          amountPayableNpr={amountPayable}
          qrConfig={qrConfig}
        />
      )}
    </div>
  );
};

export default PaymentQrPresenter;
