import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../../components/common';

/**
 * KhaltiPaymentInterface
 * Displays the configured Khalti QR code, account details, and payment instructions.
 * Shows proper unavailable state when QR is not configured.
 */
export const KhaltiPaymentInterface = ({ amountPayableNpr, providerConfig = null }) => {
  const hasQr = providerConfig && providerConfig.qrImageData;
  const accountName = providerConfig?.accountName || null;
  const accountNumber = providerConfig?.accountNumber || null;

  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#C4B5FD' }}>
      <CardHeader
        title="🟣 Khalti Digital Wallet Prepayment"
        description="Scan the official SajiloMarts Khalti QR to complete your payment"
      />
      <CardBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'start' }}>
          {/* QR Display or Unavailable State */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: 'var(--radius-md)',
            border: hasQr ? '2px solid #C4B5FD' : '1px dashed #C4B5FD',
            minHeight: '260px',
            textAlign: 'center',
          }}>
            {hasQr ? (
              <div>
                <img
                  src={providerConfig.qrImageData}
                  alt="SajiloMarts Khalti Payment QR Code"
                  style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', objectFit: 'contain' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 500 }}>
                  Scan with Khalti App
                </div>
                {accountName && (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                    {accountName}
                  </div>
                )}
                {accountNumber && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {accountNumber}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} aria-hidden="true">💳</div>
                <Typography variant="body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Khalti QR Not Configured
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  The Khalti payment QR is currently being set up. Please contact support or try another payment method.
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

            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Open your <strong>Khalti Mobile App</strong>.</li>
              <li>Tap <strong>Send Money</strong> or <strong>Scan QR</strong>{accountNumber ? ` — or send to ${accountNumber}` : ''}.</li>
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
