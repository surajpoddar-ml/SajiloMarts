import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/order.service.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Customer Order Detail View
 * Displays authoritative fulfillment details, delivery address, and payment information.
 * Isolates supplier/procurement notes and enforces ownership.
 */
export const OrderDetail = ({
  orderId,
  onBack,
}) => {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('No order specified');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    orderService.getOrderDetail(orderId)
      .then((res) => {
        setOrder(res.data || res);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve order details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
        <Spinner size="lg" />
        <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
          Loading order details...
        </Typography>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <Typography variant="h3" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>
            Order Not Found
          </Typography>
          <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            {error || 'This order does not exist or does not belong to your account.'}
          </Typography>
          <Button variant="primary" onClick={onBack}>
            &larr; Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const quote = order.quote || {};
  const payment = order.paymentSubmission;
  const address = order.deliveryAddress;
  const finalAmount = quote.finalAmountNpr || quote.finalNprTotal || order.productPriceInr;
  const amountPaid = payment?.amountPaidNpr || quote.amountPayableNow || quote.payNowAmountNpr || 0;
  const remainingCod = payment?.remainingAmountNpr || quote.remainingCodAmount || quote.remainingCodAmountNpr || 0;

  return (
    <div className="order-detail-view" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader
          title={`Order #${String(order._id || order.id).slice(-8).toUpperCase()}`}
          description={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          action={<StatusBadge status={order.status} />}
        />
        <CardBody>
          {/* Product & Store Details */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-6)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 360px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand)', textTransform: 'uppercase' }}>
                {order.marketplace || 'Indian Store Item'}
              </span>
              <Typography variant="h3" style={{ fontSize: '1.1rem', margin: '4px 0 8px', color: 'var(--text-primary)' }}>
                {order.productName}
              </Typography>
              {order.productUrl && (
                <a
                  href={order.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: 'var(--color-brand)', textDecoration: 'underline', wordBreak: 'break-all' }}
                >
                  View Original Listing &#8599;
                </a>
              )}
            </div>

            <div style={{ textAlign: 'right', minWidth: '140px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantity Ordered</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{order.quantity} unit(s)</div>
              {order.variant && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Variant: {order.variant}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Financial Snapshot */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: 'var(--space-3)' }}>
              Payment Information
            </Typography>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Landed Price</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  NPR {Number(finalAmount).toLocaleString()}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Amount Paid (Advance)</span>
                <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                  NPR {Number(amountPaid).toLocaleString()}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Remaining COD (At Delivery)</span>
                <div style={{ fontWeight: 600, color: Number(remainingCod) > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
                  NPR {Number(remainingCod).toLocaleString()}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Payment Method</span>
                <div style={{ fontWeight: 600, textTransform: 'uppercase' }}>
                  {payment?.paymentMethod || 'Manual Proof / Verification'}
                </div>
              </div>

              {payment?.transactionCode && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Transaction / Reference</span>
                  <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {payment.transactionCode}
                  </div>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Payment Status</span>
                <div style={{ marginTop: '2px' }}>
                  <StatusBadge status={payment?.paymentStatus || 'pending'} />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Destination Address */}
          {address && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: 'var(--space-2)' }}>
                Delivery Destination (Nepal)
              </Typography>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <div><strong>{address.fullName}</strong> &bull; {address.phone}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {address.tole}, Ward {address.wardNumber || ''}, {address.municipality}, {address.district}, {address.province} ({address.country || 'Nepal'})
                </div>
                {address.landmark && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Landmark: {address.landmark}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chronological Order Status History */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
            }}
          >
            <Typography variant="h3" style={{ fontSize: '1rem', marginBottom: 'var(--space-3)' }}>
              Order Status History &amp; Tracking Timeline
            </Typography>

            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {order.statusHistory
                  .slice()
                  .sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt))
                  .map((historyItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        position: 'relative',
                        paddingLeft: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: idx === order.statusHistory.length - 1 ? 'var(--color-brand)' : 'var(--border-hover)',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <StatusBadge status={historyItem.status} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(historyItem.changedAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {historyItem.note && (
                          <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.825rem' }}>
                            {historyItem.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge status={order.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.825rem' }}>
                  Order record initialized.
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderDetail;
