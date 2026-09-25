import React, { useState, useEffect } from 'react';
import { productRequestService } from '../../services';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Customer Sourcing Request Detail View
 * Displays customer-safe request specifications, verified quote breakdown, and lifecycle actions.
 * Enforces ownership protection and isolates internal notes.
 */
export function SourcingRequestDetail({ requestId, onBack, onStatusUpdated, onProceedToCheckout }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productRequestService.getRequestById(requestId);
      setRequest(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to load sourcing request detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchDetail();
    }
  }, [requestId]);

  const handleConfirmQuote = async () => {
    setActionLoading(true);
    setError(null);
    setFeedback('');
    try {
      const res = await productRequestService.confirmQuote(requestId);
      setFeedback('Quote confirmed successfully! Proceeding to payment and checkout.');
      setRequest((prev) => ({ ...prev, ...(res.data || res) }));
      if (onStatusUpdated) onStatusUpdated();
      if (onProceedToCheckout) {
        onProceedToCheckout(requestId);
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm quote');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this sourcing request?')) return;

    setActionLoading(true);
    setError(null);
    try {
      const res = await productRequestService.cancelRequest(requestId);
      setFeedback('Sourcing request cancelled.');
      setRequest((prev) => ({ ...prev, ...(res.data || res) }));
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
          Loading sourcing request details...
        </Typography>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <Typography variant="h3" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
            Request Not Found
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            {error || 'The requested sourcing record could not be found or does not belong to your account.'}
          </Typography>
          <Button variant="primary" onClick={onBack}>
            &larr; Back to Sourcing Requests
          </Button>
        </Card>
      </div>
    );
  }

  const quote = request.quote;
  const isConfirmable = request.status === 'quote_ready' || request.status === 'quoted';
  const isCancellable = ['draft', 'submitted', 'under_review', 'quote_ready', 'quoted'].includes(request.status);

  return (
    <div className="sourcing-request-detail-view" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back to Sourcing Requests
        </Button>
      </div>

      <Card>
        <CardHeader
          title={request.productName}
          description={`Request Ref: ${request._id || request.id}`}
          action={<StatusBadge status={request.status} />}
        />
        <CardBody>
          {error && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: 'var(--color-error)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {feedback && (
            <div
              role="status"
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: 'var(--color-success)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)',
              }}
            >
              &check; {feedback}
            </div>
          )}

          {/* Product Specifications Summary */}
          <div
            style={{
              display: 'grid',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-6)',
              fontSize: '0.9rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Indian Product URL
              </span>
              <div style={{ marginTop: '2px', wordBreak: 'break-all' }}>
                <a
                  href={request.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}
                >
                  {request.productUrl} &#8599;
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Marketplace
                </span>
                <div style={{ fontWeight: 600, textTransform: 'capitalize', marginTop: '2px' }}>
                  {request.marketplace}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Quantity
                </span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  {request.quantity} {request.quantity === 1 ? 'Unit' : 'Units'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Store Price (INR)
                </span>
                <div style={{ fontWeight: 600, marginTop: '2px' }}>
                  ₹{Number(request.productPriceInr).toLocaleString()}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Variant / Specs
                </span>
                <div style={{ marginTop: '2px' }}>
                  {request.variant || 'Standard'}
                </div>
              </div>
            </div>

            {request.notes && (
              <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Customer Notes
                </span>
                <div style={{ marginTop: '2px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  &ldquo;{request.notes}&rdquo;
                </div>
              </div>
            )}

            {request.deliveryAddress && (
              <div style={{ marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Destination Delivery Address
                </span>
                <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                  {request.deliveryAddress.fullName} ({request.deliveryAddress.phone}) &bull; {request.deliveryAddress.tole}, {request.deliveryAddress.municipality}, {request.deliveryAddress.district}, {request.deliveryAddress.province}
                </div>
              </div>
            )}
          </div>

          {/* Authoritative Quote Card */}
          {quote ? (
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <Typography variant="h3" style={{ fontSize: '1.05rem', margin: 0 }}>
                  Authoritative Quote Breakdown
                </Typography>
                <StatusBadge status="quote_ready" label="Verified Server Calculation" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Store Subtotal:</span>
                  <div style={{ fontWeight: 600 }}>₹{Number(quote.subtotalInr || quote.sourceSubtotalInr).toLocaleString()} INR</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Exchange Multiplier:</span>
                  <div style={{ fontWeight: 600 }}>1 INR = {Number(quote.conversionMultiplier || quote.exchangeRate || 1.65).toFixed(2)} NPR</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Converted Value:</span>
                  <div style={{ fontWeight: 600 }}>NPR {Number(quote.convertedAmountNpr).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Fee Surcharge:</span>
                  <div style={{ fontWeight: 600 }}>{((quote.feeRate || quote.appliedRate || 0.18) * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Landed Cost:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                    NPR {Number(quote.finalAmountNpr).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Advance Payable Now:</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-success)' }}>
                    NPR {Number(quote.amountPayableNow || quote.payNowAmountNpr).toLocaleString()}
                  </div>
                </div>

                {Number(quote.remainingCodAmount || quote.remainingCodAmountNpr) > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>COD at Nepal Delivery:</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                      NPR {Number(quote.remainingCodAmount || quote.remainingCodAmountNpr).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}
            >
              India store availability is currently being reviewed by our Kathmandu sourcing desk. An official quote will be published here once verified.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {isConfirmable && (
              <Button
                variant="primary"
                disabled={actionLoading}
                onClick={handleConfirmQuote}
                aria-busy={actionLoading}
              >
                {actionLoading ? 'Confirming...' : 'Confirm Quote &amp; Proceed to Checkout &rarr;'}
              </Button>
            )}

            {request.status === 'customer_confirmed' && onProceedToCheckout && (
              <Button
                variant="primary"
                onClick={() => onProceedToCheckout(requestId)}
              >
                Proceed to Payment &amp; Proof Submission &rarr;
              </Button>
            )}

            {isCancellable && (
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={handleCancelRequest}
                style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
              >
                Cancel Sourcing Request
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SourcingRequestDetail;
