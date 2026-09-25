import { useState, useEffect } from 'react';
import { productRequestService } from '../../services';

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
      setFeedback('Quote confirmed successfully! Sourcing order is queued for payment.');
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
      <div style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center', color: '#64748b' }}>
        Loading sourcing request details...
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ maxWidth: '720px', margin: '2rem auto', textAlign: 'center' }}>
        <p style={{ color: '#991b1b' }}>{error || 'Sourcing request not found.'}</p>
        <button type="button" onClick={onBack} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          &larr; Back to Requests
        </button>
      </div>
    );
  }

  const quote = request.quote;
  const isConfirmable = request.status === 'quote_ready' || request.status === 'quoted';
  const isCancellable = ['draft', 'submitted', 'under_review', 'quote_ready', 'quoted'].includes(request.status);

  return (
    <div style={{ maxWidth: '720px', margin: '1.5rem auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
      >
        &larr; Back to My Requests
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>{request.productName}</h2>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Request ID: {request._id}</span>
        </div>
        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
          Status: {request.status.replace('_', ' ')}
        </span>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {feedback && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          &check; {feedback}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <div>
          <strong>Product URL:</strong>{' '}
          <a href={request.productUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
            {request.productUrl}
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div><strong>Marketplace:</strong> <span style={{ textTransform: 'capitalize' }}>{request.marketplace}</span></div>
          <div><strong>Quantity:</strong> {request.quantity}</div>
          <div><strong>Price in India:</strong> ₹{request.productPriceInr} INR</div>
          <div><strong>Variant:</strong> {request.variant || 'Standard'}</div>
        </div>
        {request.notes && (
          <div><strong>Customer Notes:</strong> {request.notes}</div>
        )}
      </div>

      {quote ? (
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', background: '#ffffff' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0f172a', fontSize: '1.1rem' }}>Authoritative Quotation Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
            <div>INR Subtotal: <strong>₹{quote.subtotalInr || quote.sourceSubtotalInr}</strong></div>
            <div>Exchange Rate: <strong>1 INR = {quote.conversionMultiplier || quote.exchangeRate} NPR</strong></div>
            <div>Converted NPR: <strong>NPR {quote.convertedAmountNpr}</strong></div>
            <div>Surcharge Rate: <strong>{((quote.feeRate || quote.appliedRate) * 100).toFixed(0)}%</strong></div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Final Total Amount:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                  NPR {quote.finalAmountNpr}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Amount Payable Now:</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16a34a' }}>
                  NPR {quote.amountPayableNow || quote.payNowAmountNpr}
                </div>
              </div>
              {Number(quote.remainingCodAmount || quote.remainingCodAmountNpr) > 0 && (
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Pay on Delivery (50% COD):</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ea580c' }}>
                    NPR {quote.remainingCodAmount || quote.remainingCodAmountNpr}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          Quote is currently being verified by sourcing staff.
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {isConfirmable && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleConfirmQuote}
            style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
          >
            {actionLoading ? 'Processing...' : 'Confirm Quote &amp; Proceed to Checkout'}
          </button>
        )}

        {request.status === 'customer_confirmed' && onProceedToCheckout && (
          <button
            type="button"
            onClick={() => onProceedToCheckout(requestId)}
            style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            Proceed to Payment &amp; Checkout &rarr;
          </button>
        )}

        {isCancellable && (
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCancelRequest}
            style={{ padding: '0.75rem 1.25rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
          >
            Cancel Sourcing Request
          </button>
        )}
      </div>
    </div>
  );
}
