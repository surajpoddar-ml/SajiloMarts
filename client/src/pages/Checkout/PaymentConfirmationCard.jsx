import React from 'react';
import { Card, CardHeader, CardBody, Typography, Button, PaymentStatusBadge } from '../../components/common';
import { PAYMENT_METHOD_CONFIGS } from '../../utils/paymentCalculations.js';

/**
 * PaymentConfirmationCard
 * Displays post-submission confirmation details strictly using real backend data.
 * Does not fabricate confirmation numbers or claim automatic payment verification.
 */
export const PaymentConfirmationCard = ({
  submission,
  request,
  onViewRequests,
  onGoHome,
}) => {
  if (!submission) return null;

  const paymentId = submission._id || submission.id || 'Submitted';
  const paymentStatus = submission.paymentStatus || 'proof_submitted';
  const methodConfig = submission.paymentMethod ? PAYMENT_METHOD_CONFIGS[submission.paymentMethod] : null;
  const isCod = submission.paymentMode === 'cod_50_50';

  const amountPaid = submission.amountPaidNpr !== undefined
    ? `NPR ${submission.amountPaidNpr.toLocaleString('en-IN')}`
    : 'Recorded';

  const remainingBalance = submission.remainingAmountNpr !== undefined
    ? `NPR ${submission.remainingAmountNpr.toLocaleString('en-IN')}`
    : 'NPR 0';

  return (
    <Card className="payment-confirmation-card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">
        🎉
      </div>

      <Typography variant="h2" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
        Payment Proof Submitted
      </Typography>

      <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto var(--space-4)', lineHeight: 1.5 }}>
        Thank you! Your payment details and receipt have been received by the SajiloMarts fulfillment team. We will manually audit and verify your transaction shortly.
      </Typography>

      <div style={{ display: 'inline-block', marginBottom: 'var(--space-6)' }}>
        <PaymentStatusBadge status={paymentStatus} />
      </div>

      {/* Real Record Summary Table */}
      <div
        style={{
          maxWidth: '540px',
          margin: '0 auto var(--space-6)',
          textAlign: 'left',
          backgroundColor: 'var(--bg-surface-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          border: '1px solid var(--border-subtle)',
          display: 'grid',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Payment Reference ID:</span>
          <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{paymentId}</span>
        </div>

        {submission.transactionCode && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Submitted Txn Code:</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{submission.transactionCode}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
          <span style={{ fontWeight: 600 }}>{methodConfig ? methodConfig.name : submission.paymentMethod || 'Wallet'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Submitted Amount:</span>
          <span style={{ fontWeight: 700, color: 'var(--color-brand)' }}>{amountPaid}</span>
        </div>

        {isCod && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Remaining Cash on Delivery:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-warning, #d97706)' }}>{remainingBalance}</span>
          </div>
        )}

        {request && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingTop: 'var(--space-2)', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Product:</span>
            <span style={{ fontWeight: 500, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {request.productName || 'Indian Marketplace Item'}
            </span>
          </div>
        )}
      </div>

      {/* Next Steps Notification */}
      <div
        style={{
          maxWidth: '540px',
          margin: '0 auto var(--space-6)',
          textAlign: 'left',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid var(--color-brand-border, #bfdbfe)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}
      >
        <strong style={{ color: 'var(--color-brand)', display: 'block', marginBottom: '2px' }}>Next Steps:</strong>
        1. Our team verifies your transaction against the digital wallet statement.<br />
        2. Once verified, procurement begins from the Indian marketplace.<br />
        3. You will receive updates via your account and notifications.
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={onViewRequests}>
          View My Sourcing Requests
        </Button>
        <Button variant="outline" onClick={onGoHome}>
          Return to Homepage
        </Button>
      </div>
    </Card>
  );
};

export default PaymentConfirmationCard;
