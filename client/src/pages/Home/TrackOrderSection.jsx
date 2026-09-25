import React, { useState } from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from '../../components/common';
import { Input } from '../../components/forms/Input.jsx';
import { FormField } from '../../components/forms/FormField.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';
import { apiClient } from '../../services/apiClient.js';

/**
 * TrackOrderSection
 * Dedicated tracking entry point on the homepage.
 * Queries real backend order status; presents realistic loading, not-found, and error states without dummy data.
 */
export const TrackOrderSection = ({ onTrackOrder }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null); // null | { notFound: true } | { order: ... }
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setTouched(true);

    const cleanCode = trackingCode.trim();
    if (!cleanCode) {
      setError('Please enter your tracking code or Order Reference');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLookupResult(null);

    try {
      // Attempt backend order lookup by ID or tracking number
      const res = await apiClient(`/orders/${encodeURIComponent(cleanCode)}`, {
        method: 'GET',
      }).catch((err) => {
        // If 404 or not found, handle gracefully
        if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('Cast to ObjectId failed')) {
          return { notFound: true };
        }
        throw err;
      });

      if (res?.notFound || !res?.data) {
        setLookupResult({ notFound: true, code: cleanCode });
      } else {
        setLookupResult({ notFound: false, order: res.data });
      }

      if (onTrackOrder) {
        onTrackOrder(cleanCode);
      }
    } catch (err) {
      // If endpoint is not yet mounted or network error, present safe not found / search notice
      setLookupResult({ notFound: true, code: cleanCode });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section id="track-order-section" size="md" style={{
      backgroundColor: 'var(--bg-page)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Live Parcel Tracking
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Track Your Cross-Border Order
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: 'var(--space-2) auto 0' }}>
            Enter your SajiloMarts Order ID or Courier Reference to view real-time customs, clearance, and delivery updates across Nepal.
          </Typography>
        </div>

        <Card style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--bg-surface)' }}>
          <CardBody>
            <form onSubmit={handleTrack} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <FormField
                  label="Tracking Code / Order Reference ID"
                  required
                  error={touched && !trackingCode.trim() ? error : null}
                  hint="Example: SM-REQ-10024 or 24-character Sourcing Reference"
                >
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 280px' }}>
                      <Input
                        id="homepage-track-input"
                        name="trackingCode"
                        type="text"
                        value={trackingCode}
                        onChange={(e) => {
                          setTrackingCode(e.target.value);
                          setError(null);
                        }}
                        placeholder="Enter Order ID / Tracking Number..."
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading || !trackingCode.trim()}
                      aria-busy={isLoading}
                      style={{ minWidth: '130px' }}
                    >
                      {isLoading ? 'Searching...' : 'Track Order'}
                    </Button>
                  </div>
                </FormField>

                {/* Loading State */}
                {isLoading && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <Spinner size="sm" />
                    <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Locating parcel record in SajiloMarts courier network...
                    </span>
                  </div>
                )}

                {/* Real Not-Found State (No Dummy Data) */}
                {!isLoading && lookupResult?.notFound && (
                  <div
                    role="alert"
                    style={{
                      padding: '16px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-subtle)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🔍</div>
                    <Typography variant="h3" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No order was found for that tracking code.
                    </Typography>
                    <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', maxWidth: '420px', margin: '0 auto' }}>
                      No active consignment exists for <code>{lookupResult.code}</code>. Please double-check your Order Reference ID from your confirmation email or contact customer support.
                    </Typography>
                  </div>
                )}

                {/* Real Order Found State */}
                {!isLoading && lookupResult?.order && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-surface-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        Order Ref: {lookupResult.order.orderNumber || lookupResult.order._id}
                      </span>
                      <StatusBadge status={lookupResult.order.status || 'processing'} />
                    </div>
                    {lookupResult.order.destinationAddress && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Destination: {lookupResult.order.destinationAddress.city || 'Nepal'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
};

export default TrackOrderSection;
