import React, { useState } from 'react';
import { orderService } from '../../services/order.service.js';
import { Card, CardHeader, CardBody, Button, Typography } from '../../components/common';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Public Order Tracking Page
 * Allows anyone to track an order by order number without authentication.
 */
export const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const res = await orderService.getPublicTracking(trimmed);
      const data = res?.data || res;
      if (!data || !data.orderNumber) {
        setError('No order found with that order number. Please check and try again.');
      } else {
        setTrackingData(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve tracking information. Please verify the order number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <Typography variant="h1" style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
          📦 Track Your Order
        </Typography>
        <Typography variant="body" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Enter your SajiloMarts order number to see the latest status
        </Typography>
      </div>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <CardBody>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter Order Number (e.g. SJM-XXXXXXXX)"
              required
              maxLength={50}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '1rem',
                fontFamily: 'monospace',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                letterSpacing: '0.03em',
              }}
            />
            <Button type="submit" variant="primary" disabled={isLoading || !orderNumber.trim()}>
              {isLoading ? 'Tracking...' : 'Track'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error && (
        <Card style={{ borderColor: '#FCA5A5', marginBottom: 'var(--space-4)' }}>
          <CardBody style={{ padding: '16px' }}>
            <div style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          </CardBody>
        </Card>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner size="lg" />
          <Typography variant="body" style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Looking up order...
          </Typography>
        </div>
      )}

      {trackingData && (
        <Card>
          <CardHeader
            title={`Order ${trackingData.orderNumber}`}
            description={`${trackingData.productName || 'Product'}${trackingData.marketplace ? ` • ${trackingData.marketplace}` : ''}`}
          />
          <CardBody>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: 'var(--color-brand)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}>
                Current: {trackingData.currentStatusLabel || trackingData.currentStatus}
              </span>
            </div>

            <OrderStatusTimeline
              currentStatus={trackingData.currentStatus}
              statusHistory={trackingData.timeline || []}
              createdAt={trackingData.createdAt}
            />

            {trackingData.deliveryInfo && (
              <div style={{
                marginTop: 'var(--space-4)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Delivery Information</div>
                {trackingData.deliveryInfo.carrier && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Carrier: <strong>{trackingData.deliveryInfo.carrier}</strong>
                  </div>
                )}
                {trackingData.deliveryInfo.trackingNumber && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Tracking #: <strong style={{ fontFamily: 'monospace' }}>{trackingData.deliveryInfo.trackingNumber}</strong>
                  </div>
                )}
                {trackingData.deliveryInfo.estimatedDeliveryDate && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    ETA: <strong>{new Date(trackingData.deliveryInfo.estimatedDeliveryDate).toLocaleDateString()}</strong>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TrackOrderPage;
