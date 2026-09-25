import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/order.service.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Current Orders View
 * Displays active in-flight sourcing and courier orders for the authenticated customer.
 * Uses authoritative server data and server-side pagination.
 */
export const CurrentOrders = ({
  onSelectOrder,
  onStartSourcing,
}) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await orderService.getCurrentOrders({ page, limit: 10 });
      const data = res.data || res;
      setOrders(data.orders || data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load current orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  return (
    <div className="current-orders-view" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="Current Active Orders"
          description="Track cross-border procurement and doorstep delivery status for in-flight orders"
          action={
            onStartSourcing && (
              <Button size="sm" variant="primary" onClick={onStartSourcing}>
                + New Sourcing Request
              </Button>
            )
          }
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
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span><strong>Error:</strong> {error}</span>
              <Button size="sm" variant="outline" onClick={() => fetchOrders(pagination.page)}>
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Spinner size="md" />
              <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                Loading your active orders...
              </Typography>
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🚚</div>
              <Typography variant="h3" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                You have no current orders.
              </Typography>
              <Typography
                variant="body"
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '460px',
                  margin: '0 auto var(--space-6)',
                  fontSize: '0.9rem',
                }}
              >
                When you confirm an Indian sourcing quote and submit payment verification, your in-flight orders will appear here with real-time tracking.
              </Typography>
              {onStartSourcing && (
                <Button variant="primary" onClick={onStartSourcing}>
                  Start Sourcing a Product
                </Button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {orders.map((order) => {
                const quote = order.quote || {};
                const payment = order.paymentSubmission;
                const finalAmount = quote.finalAmountNpr || quote.finalNprTotal || order.productPriceInr;
                const amountPaid = payment?.amountPaidNpr || quote.amountPayableNow || quote.payNowAmountNpr || 0;
                const remainingCod = payment?.remainingAmountNpr || quote.remainingCodAmount || quote.remainingCodAmountNpr || 0;

                return (
                  <div
                    key={order._id || order.id}
                    onClick={() => onSelectOrder && onSelectOrder(order._id || order.id)}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (onSelectOrder) onSelectOrder(order._id || order.id);
                      }
                    }}
                    aria-label={`View order ${order._id || order.id}`}
                  >
                    <div style={{ flex: '1 1 320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          #{String(order._id || order.id).slice(-8).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                        {order.productName}
                      </strong>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        Marketplace: <span style={{ textTransform: 'capitalize' }}>{order.marketplace}</span> &bull; Qty: {order.quantity}
                        {order.variant && ` • ${order.variant}`}
                        {order.createdAt && ` • ${new Date(order.createdAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '160px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        NPR {Number(finalAmount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
                        Paid: NPR {Number(amountPaid).toLocaleString()}
                      </div>
                      {Number(remainingCod) > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', marginTop: '2px' }}>
                          Remaining COD: NPR {Number(remainingCod).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Server-side Pagination */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchOrders(pagination.page - 1)}
                  >
                    &larr; Previous
                  </Button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchOrders(pagination.page + 1)}
                  >
                    Next &rarr;
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CurrentOrders;
