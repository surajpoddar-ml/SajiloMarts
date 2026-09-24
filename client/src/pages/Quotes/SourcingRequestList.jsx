import { useState, useEffect } from 'react';
import { productRequestService } from '../../services';

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
      setError(err.message || 'Failed to fetch sourcing requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { bg: '#e0f2fe', color: '#0369a1', label: 'Submitted' },
      under_review: { bg: '#fef3c7', color: '#92400e', label: 'Under Review' },
      quote_ready: { bg: '#dcfce7', color: '#15803d', label: 'Quote Ready' },
      quoted: { bg: '#dcfce7', color: '#15803d', label: 'Quoted' },
      customer_confirmed: { bg: '#e0e7ff', color: '#4338ca', label: 'Confirmed' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
      expired: { bg: '#f3f4f6', color: '#4b5563', label: 'Expired' },
      converted: { bg: '#f0fdf4', color: '#166534', label: 'Order Converted' },
    };
    const s = statusMap[status] || { bg: '#f1f5f9', color: '#475569', label: status };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '860px', margin: '1.5rem auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.25rem', color: '#0f172a' }}>My Sourcing Requests</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Track, view quotes, and confirm your Indian marketplace sourcing orders.
          </p>
        </div>
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            style={{ padding: '0.625rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
          >
            + New Sourcing Request
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#64748b' }}>
          Loading your sourcing requests...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.95rem' }}>
            You haven't submitted any sourcing requests yet.
          </p>
          {onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              style={{ padding: '0.625rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Submit Your First Request
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {requests.map((item) => (
            <div
              key={item._id || item.id}
              onClick={() => onSelectRequest && onSelectRequest(item._id || item.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                background: '#ffffff',
                transition: 'all 0.15s ease-in-out',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{item.productName}</strong>
                  {getStatusBadge(item.status)}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Marketplace: <span style={{ textTransform: 'capitalize' }}>{item.marketplace}</span> &bull; Qty: {item.quantity}
                  {item.createdAt && ` • ${new Date(item.createdAt).toLocaleDateString()}`}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '140px' }}>
                {item.quote ? (
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                      NPR {item.quote.finalAmountNpr}
                    </div>
                    <small style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                      Pay Now: NPR {item.quote.amountPayableNow || item.quote.payNowAmountNpr}
                    </small>
                  </div>
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Quote Pending</span>
                )}
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchRequests(pagination.page - 1)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRequests(pagination.page + 1)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
