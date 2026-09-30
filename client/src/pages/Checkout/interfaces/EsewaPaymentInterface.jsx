import React from 'react';
import { Card, CardHeader, CardBody, Typography } from '../../../components/common';

/**
 * EsewaPaymentInterface
 * Displays the configured eSewa QR code, account details, and payment instructions.
 * Shows proper unavailable state when QR is not configured.
 */
export const EsewaPaymentInterface = ({ amountPayableNpr, providerConfig = null }) => {
  const hasQr = providerConfig && providerConfig.qrImageData;
  const accountName = providerConfig?.accountName || null;
  const accountNumber = providerConfig?.accountNumber || null;

  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#86EFAC' }}>
      <CardHeader
        title="🟢 eSewa Digital Wallet Prepayment"
        description="Scan the official SajiloMarts eSewa QR to complete your payment"
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
            border: hasQr ? '2px solid #86EFAC' : '1px dashed #86EFAC',
            minHeight: '260px',
            textAlign: 'center',
          }}>
            {hasQr ? (
              <div>
                <img
                  src={providerConfig.qrImageData}
                  alt="SajiloMarts eSewa Payment QR Code"
                  style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', objectFit: 'contain' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: 500 }}>
                  Scan with eSewa App
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
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} aria-hidden="true">📱</div>
                <Typography variant="body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  eSewa QR Not Configured
                </Typography>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>
                  The eSewa payment QR is currently being set up. Please contact support or try another payment method.
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

            <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Open your <strong>eSewa Mobile App</strong>.</li>
              <li>Scan the SajiloMarts eSewa QR code shown here{accountNumber ? ` or send to ${accountNumber}` : ''}.</li>
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
