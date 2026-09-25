import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';

/**
 * AuthContinuationPrompt
 * Provides an inline authentication continuation banner so guest users can sign in or register
 * to finalize and save their sourcing request without losing draft progress.
 */
export const AuthContinuationPrompt = ({
  onLogin,
  onRegister,
  pendingRequestSummary,
}) => {
  return (
    <Card style={{
      borderColor: 'var(--color-brand-border, #E2D9CE)',
      backgroundColor: 'var(--bg-surface-secondary)',
      marginTop: 'var(--space-6)',
    }}>
      <CardHeader
        title="Sign in to Complete Sourcing Request"
        description="Your product request details are preserved. Sign in or register to submit to our logistics team."
      />
      <CardBody>
        {pendingRequestSummary && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 'var(--space-4)',
            fontSize: '0.875rem',
          }}>
            <div><strong>Product:</strong> {pendingRequestSummary.productName || 'Pending verification'}</div>
            <div><strong>Quantity:</strong> {pendingRequestSummary.quantity || 1}</div>
            {pendingRequestSummary.variant && <div><strong>Variant:</strong> {pendingRequestSummary.variant}</div>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={onLogin}
          >
            Sign In &amp; Continue Request
          </Button>
          <Button
            variant="outline"
            onClick={onRegister}
          >
            Create New Account
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AuthContinuationPrompt;
