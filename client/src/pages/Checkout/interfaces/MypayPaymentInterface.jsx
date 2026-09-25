import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../../components/common';

/**
 * MypayPaymentInterface
 * Presentation and instructions for paying via MyPay digital wallet.
 */
export const MypayPaymentInterface = ({ amountPayableNpr, qrConfig = null }) => {
  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#FCA5A5' }}>
      <CardHeader
        title="🔴 MyPay Digital Wallet Prepayment"
        description="Scan the official SajiloMarts MyPay QR or transfer to our verified wallet ID"
      />
      <CardBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* QR Display or Unavailable State */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'var(--bg-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed #FCA5A5',
            minHeight: '220px',
            textAlign: 'center',
          }}>
            {qrConfig?.mypayQrUrl ? (
              <div>
                <img
                  src={qrConfig.mypayQrUrl}
                  alt="SajiloMarts MyPay QR"
                  style={{ maxWidth: '180px', maxHeight: '180px', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Scan with MyPay App
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }} aria-hidden="true">📲</div>
                <Typography variant="body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Payment QR is currently unavailable.
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  Please transfer to MyPay Account: <strong>9800000000</strong> (SajiloMarts Nepal)
                </Typography>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '14px',
            }}>
              Amount to Transfer: NPR {Number(amountPayableNpr || 0).toLocaleString()}
            </div>

            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Open your <strong>MyPay Wallet App</strong>.</li>
              <li>Select <strong>Wallet Transfer</strong> or <strong>QR Pay</strong>.</li>
              <li>Input payable amount: <strong>NPR {Number(amountPayableNpr || 0).toLocaleString()}</strong>.</li>
              <li>Include your <strong>Sourcing Request Reference</strong> in remarks.</li>
              <li>Save payment proof and copy the <strong>MyPay Reference Code</strong>.</li>
              <li>Enter the reference code and upload screenshot below.</li>
            </ol>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MypayPaymentInterface;
