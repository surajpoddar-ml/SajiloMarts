import React, { useState, useEffect } from 'react';
import { productRequestService } from '../../services';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Spinner } from '../../components/feedback/Spinner.jsx';

/**
 * SajiloMarts Customer Sourcing Request List
 * Shows real requests belonging exclusively to the authenticated customer.
 * Server-side pagination, sorting, status badges, and authentic empty state.
 */
export function SourcingRequestList({ onSelectRequest, onCreateNew }) {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productRequestService.getUserRequests({ page, limit: 10 });
      const data = res.data || res;
      setRequests(data.requests || data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch sourcing requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  return (
    <div className="sourcing-requests-view" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <Card>
        <CardHeader
          title="My Sourcing Requests"
          description="View submitted Indian product requests, inspect server-authoritative quotes, and proceed to checkout"
          action={
            onCreateNew && (
              <Button variant="primary" size="sm" onClick={onCreateNew}>
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
              <Button size="sm" variant="outline" onClick={() => fetchRequests(pagination.page)}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Spinner size="md" />
              <Typography variant="body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                Loading your sourcing requests...
              </Typography>
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3.5rem 1.5rem',
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
              <Typography variant="h3" style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                No sourcing requests yet.
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
                Paste a product link from Amazon India, Flipkart, Myntra, or any Indian store to receive an official landed quote in Nepal.
              </Typography>
              {onCreateNew && (
                <Button variant="primary" onClick={onCreateNew}>
                  Start Sourcing a Product
                </Button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {requests.map((item) => (
                <div
                  key={item._id || item.id}
                  onClick={() => onSelectRequest && onSelectRequest(item._id || item.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-surface)',
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
                      if (onSelectRequest) onSelectRequest(item._id || item.id);
                    }
                  }}
                  aria-label={`View details for request: ${item.productName}`}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {item.productName}
                      </strong>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Marketplace: <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{item.marketplace}</span> &bull; Qty: {item.quantity}
                      {item.variant && ` • Variant: ${item.variant}`}
                      {item.createdAt && ` • ${new Date(item.createdAt).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '160px' }}>
                    {item.quote ? (
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          NPR {Number(item.quote.finalAmountNpr).toLocaleString()}
                        </div>
                        <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', fontWeight: 600 }}>
                          Advance: NPR {Number(item.quote.amountPayableNow || item.quote.payNowAmountNpr).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Quote Pending</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Server-side Pagination Controls */}
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
                    onClick={() => fetchRequests(pagination.page - 1)}
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
                    onClick={() => fetchRequests(pagination.page + 1)}
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
}

export default SourcingRequestList;
