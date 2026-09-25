import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../../components/common';

/**
 * EsewaPaymentInterface
 * Presentation and instructions for paying via eSewa digital wallet.
 */
export const EsewaPaymentInterface = ({ amountPayableNpr, qrConfig = null }) => {
  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#86EFAC' }}>
      <CardHeader
        title="🟢 eSewa Digital Wallet Prepayment"
        description="Scan the official SajiloMarts eSewa QR or transfer to our verified merchant ID"
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
            border: '1px dashed #86EFAC',
            minHeight: '220px',
            textAlign: 'center',
          }}>
            {qrConfig?.esewaQrUrl ? (
              <div>
                <img
                  src={qrConfig.esewaQrUrl}
                  alt="SajiloMarts eSewa QR"
                  style={{ maxWidth: '180px', maxHeight: '180px', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Scan with eSewa App
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }} aria-hidden="true">📱</div>
                <Typography variant="body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Payment QR is currently unavailable.
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  Please use verified eSewa Merchant ID: <strong>9800000000</strong> (SajiloMarts Logistics)
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
              backgroundColor: '#DCFCE7',
              color: '#166534',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '14px',
            }}>
              Amount to Transfer: NPR {Number(amountPayableNpr || 0).toLocaleString()}
            </div>

            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Open your <strong>eSewa Mobile App</strong>.</li>
              <li>Scan the SajiloMarts payment QR or enter Merchant ID.</li>
              <li>Enter exact amount: <strong>NPR {Number(amountPayableNpr || 0).toLocaleString()}</strong>.</li>
              <li>In the remarks field, enter your <strong>Sourcing Request Reference</strong>.</li>
              <li>Complete payment and copy the <strong>Transaction Code / Reference ID</strong>.</li>
              <li>Attach the payment receipt screenshot below and submit.</li>
            </ol>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EsewaPaymentInterface;
