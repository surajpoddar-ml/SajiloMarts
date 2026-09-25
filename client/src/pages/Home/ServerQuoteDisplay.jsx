import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { productRequestService } from '../../services/productRequest.service.js';

/**
 * ServerQuoteDisplay
 * Authoritative quote presentation fetching calculation directly from SastoMarts backend engine.
 * Strictly avoids client-side price computation.
 */
export const ServerQuoteDisplay = ({
  requestId,
  initialQuote = null,
  onRequestConfirmed,
  onReset,
}) => {
  const [quoteData, setQuoteData] = useState(initialQuote);
  const [paymentMode, setPaymentMode] = useState('online_100');
  const [isLoading, setIsLoading] = useState(!initialQuote && Boolean(requestId));
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fetchQuote = async (mode = paymentMode) => {
    if (!requestId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await productRequestService.generateQuote(requestId, {
        paymentMode: mode,
      });
      const data = res.data || res;
      setQuoteData(data.quote || data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve server quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (requestId && !initialQuote) {
      fetchQuote(paymentMode);
    }
  }, [requestId]);

  const handlePaymentModeChange = (newMode) => {
    setPaymentMode(newMode);
    fetchQuote(newMode);
  };

  const handleConfirmQuote = async () => {
    if (!requestId) return;
    setIsConfirming(true);
    setError(null);
    try {
      const res = await productRequestService.confirmQuote(requestId);
      const data = res.data || res;
      setIsConfirmed(true);
      if (onRequestConfirmed) {
        onRequestConfirmed(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm quote. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Card style={{ backgroundColor: 'var(--bg-surface)' }}>
      <CardHeader
        title="Step 3: Server-Authoritative Quote"
        description="Official cross-border pricing calculated by SastoMarts backend engine"
      />
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <Spinner size="md" />
              <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                Requesting authoritative pricing from backend engine...
              </Typography>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div
              role="alert"
              style={{
                color: 'var(--color-error)',
                backgroundColor: '#FEF2F2',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.875rem',
                borderLeft: '3px solid var(--color-error)',
              }}
            >
              <div><strong>Quote Request Notice:</strong> {error}</div>
              <div style={{ marginTop: '8px' }}>
                <Button size="sm" variant="outline" onClick={() => fetchQuote(paymentMode)}>
                  Retry Quote Request
                </Button>
              </div>
            </div>
          )}

          {/* Confirmed Success State Banner */}
          {isConfirmed && (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>✅</span>
              <Typography variant="h3" style={{ color: '#166534', marginBottom: '4px' }}>
                Quote Confirmed Successfully!
              </Typography>
              <Typography variant="body" style={{ color: '#15803D', fontSize: '0.9rem' }}>
                Your sourcing request has been confirmed. SastoMarts logistics desk will initiate procurement and notify you with tracking updates.
              </Typography>
              {requestId && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#166534', fontFamily: 'monospace' }}>
                  Request Ref: {requestId}
                </div>
              )}
            </div>
          )}

          {/* Real Authoritative Quote Breakdown Interface */}
          {!isLoading && quoteData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Payment Mode Selector */}
              <div>
                <Typography variant="label" style={{ display: 'block', marginBottom: '8px' }}>
                  Select SastoMarts Payment Arrangement
                </Typography>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handlePaymentModeChange('online_100')}
                    disabled={isConfirming || isConfirmed}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMode === 'online_100' ? '2px solid var(--color-brand)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMode === 'online_100' ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
                      cursor: isConfirming || isConfirmed ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>100% Online Payment</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Standard 18% fulfillment &amp; courier fee
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentModeChange('cod_50_50')}
                    disabled={isConfirming || isConfirmed}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: paymentMode === 'cod_50_50' ? '2px solid var(--color-brand)' : '1px solid var(--border-subtle)',
                      backgroundColor: paymentMode === 'cod_50_50' ? 'var(--bg-surface-secondary)' : 'var(--bg-surface)',
                      cursor: isConfirming || isConfirmed ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>50% Advance / 50% COD</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      22% fee (includes cash handling)
                    </div>
                  </button>
                </div>
              </div>

              {/* Authoritative Quote Breakdown Table */}
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface-secondary)',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Authoritative Price Snapshot
                </div>

                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                  {quoteData.productPriceInr !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Store Price (INR):</span>
                      <span style={{ fontWeight: 500 }}>₹{Number(quoteData.productPriceInr).toLocaleString()}</span>
                    </div>
                  )}

                  {quoteData.quantity !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                      <span style={{ fontWeight: 500 }}>{quoteData.quantity}</span>
                    </div>
                  )}

                  {quoteData.subtotalInr !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal (INR):</span>
                      <span style={{ fontWeight: 600 }}>₹{Number(quoteData.subtotalInr).toLocaleString()}</span>
                    </div>
                  )}

                  {quoteData.conversionRate !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Exchange Rate Multiplier:</span>
                      <span>1 INR = {quoteData.conversionRate} NPR</span>
                    </div>
                  )}

                  {quoteData.convertedNpr !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Base Converted (NPR):</span>
                      <span>NPR {Number(quoteData.convertedNpr).toLocaleString()}</span>
                    </div>
                  )}

                  {quoteData.serviceFeeNpr !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Service &amp; Surcharge Fee ({quoteData.feePercentage || (paymentMode === 'online_100' ? '18%' : '22%')}):
                      </span>
                      <span>NPR {Number(quoteData.serviceFeeNpr).toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

                  {quoteData.finalTotalNpr !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brand)' }}>
                      <span>Total Estimated Cost (NPR):</span>
                      <span>NPR {Number(quoteData.finalTotalNpr).toLocaleString()}</span>
                    </div>
                  )}

                  {quoteData.amountPayableNow !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span>Amount Payable Now (Advance):</span>
                      <span>NPR {Number(quoteData.amountPayableNow).toLocaleString()}</span>
                    </div>
                  )}

                  {quoteData.remainingCodBalance !== undefined && Number(quoteData.remainingCodBalance) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Remaining Balance at Delivery (COD):</span>
                      <span>NPR {Number(quoteData.remainingCodBalance).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isConfirmed && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  {onReset && (
                    <Button variant="outline" onClick={onReset} disabled={isConfirming}>
                      New Sourcing Request
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleConfirmQuote}
                    disabled={isConfirming}
                    aria-busy={isConfirming}
                  >
                    {isConfirming ? 'Confirming Quote...' : 'Confirm Sourcing Quote & Continue &rarr;'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No Quote State (When price has not yet been verified) */}
          {!isLoading && !quoteData && !error && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-6)',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-subtle)',
            }}>
              <Typography variant="body" style={{ fontWeight: 600, marginBottom: '4px' }}>
                Quote not available yet
              </Typography>
              <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', maxWidth: '420px', margin: '0 auto var(--space-4)' }}>
                Our Kathmandu fulfillment team verifies seller availability in India before publishing the final authoritative quote snapshot.
              </Typography>
              <Button size="sm" variant="outline" onClick={() => fetchQuote(paymentMode)}>
                Check Server Quote
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ServerQuoteDisplay;
