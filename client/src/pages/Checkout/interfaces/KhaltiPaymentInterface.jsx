import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../../components/common';

/**
 * KhaltiPaymentInterface
 * Presentation and instructions for paying via Khalti digital wallet.
 */
export const KhaltiPaymentInterface = ({ amountPayableNpr, qrConfig = null }) => {
  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#C4B5FD' }}>
      <CardHeader
        title="🟣 Khalti Digital Wallet Prepayment"
        description="Scan the official SajiloMarts Khalti QR or transfer to our verified merchant wallet"
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
            border: '1px dashed #C4B5FD',
            minHeight: '220px',
            textAlign: 'center',
          }}>
            {qrConfig?.khaltiQrUrl ? (
              <div>
                <img
                  src={qrConfig.khaltiQrUrl}
                  alt="SajiloMarts Khalti QR"
                  style={{ maxWidth: '180px', maxHeight: '180px', borderRadius: '8px' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Scan with Khalti App
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }} aria-hidden="true">💳</div>
                <Typography variant="body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Payment QR is currently unavailable.
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  Please transfer to Khalti ID: <strong>9800000000</strong> (SajiloMarts Sourcing)
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
              backgroundColor: '#EDE9FE',
              color: '#5B21B6',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '14px',
            }}>
              Amount to Transfer: NPR {Number(amountPayableNpr || 0).toLocaleString()}
            </div>

            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Open your <strong>Khalti Mobile App</strong>.</li>
              <li>Tap <strong>Send Money</strong> or <strong>Scan QR</strong>.</li>
              <li>Transfer <strong>NPR {Number(amountPayableNpr || 0).toLocaleString()}</strong> to SajiloMarts.</li>
              <li>Include your <strong>Sourcing Request Reference</strong> in remarks.</li>
              <li>Save payment proof and copy your <strong>Khalti Transaction ID</strong>.</li>
              <li>Enter transaction ID and upload screenshot below.</li>
            </ol>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default KhaltiPaymentInterface;
