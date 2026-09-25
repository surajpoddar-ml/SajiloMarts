import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';

/**
 * RequestReviewCard
 * Displays the verified customer-entered request data prior to server submission.
 * Zero dummy data: every value is bound directly to user state.
 */
export const RequestReviewCard = ({
  requestData,
  onEdit,
  onSubmit,
  isSubmitting = false,
  error = null,
  isAuthenticated = false,
  onLogin,
  onRegister,
}) => {
  if (!requestData) return null;

  const {
    productUrl,
    marketplace,
    productName,
    quantity,
    variant,
    notes,
    productPriceInr,
  } = requestData;

  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Step 2: Review Sourcing Request"
        description="Verify your Indian product details before submitting to SajiloMarts"
      />
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Summary Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Indian Marketplace
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>
                {marketplace || 'Indian Store'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quantity
              </span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>
                {quantity} {quantity === 1 ? 'Unit' : 'Units'}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Product Name / Title
              </span>
              <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '2px' }}>
                {productName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                (Subject to India seller verification by Kathmandu logistics desk)
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Original Product URL
              </span>
              <div style={{
                marginTop: '2px',
                wordBreak: 'break-all',
                fontSize: '0.85rem',
                color: 'var(--color-brand)',
                fontFamily: 'monospace',
                backgroundColor: 'var(--bg-surface)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                {productUrl}
              </div>
            </div>

            {variant && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Variant / Specifications
                </span>
                <div style={{ marginTop: '2px' }}>{variant}</div>
              </div>
            )}

            {productPriceInr && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Estimated Store Price (INR)
                </span>
                <div style={{ marginTop: '2px', fontWeight: 600 }}>₹{Number(productPriceInr).toLocaleString()}</div>
              </div>
            )}

            {notes && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Customer Instructions &amp; Notes
                </span>
                <div style={{ marginTop: '2px', fontSize: '0.875rem', fontStyle: 'italic' }}>&ldquo;{notes}&rdquo;</div>
              </div>
            )}
          </div>

          {/* Submission Error Banner */}
          {error && (
            <div
              role="alert"
              style={{
                color: 'var(--color-error)',
                backgroundColor: '#FEF2F2',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderLeft: '3px solid var(--color-error)',
              }}
            >
              {error}
            </div>
          )}

          {/* Unauthenticated Guest Note or Action Buttons */}
          {!isAuthenticated ? (
            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
              marginTop: 'var(--space-2)',
            }}>
              <Typography variant="body" style={{ fontWeight: 600, marginBottom: '6px' }}>
                Ready to submit your request?
              </Typography>
              <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Sign in to link this request to your verified customer account and receive an official quote with live tracking.
              </Typography>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="primary" size="sm" onClick={onLogin}>
                  Sign In &amp; Submit
                </Button>
                <Button variant="outline" size="sm" onClick={onRegister}>
                  Create Free Account
                </Button>
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit Details
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <Button
                type="button"
                variant="outline"
                onClick={onEdit}
                disabled={isSubmitting}
              >
                &larr; Edit Details
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={onSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Creating Sourcing Request...' : 'Submit Sourcing Request &rarr;'}
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default RequestReviewCard;
