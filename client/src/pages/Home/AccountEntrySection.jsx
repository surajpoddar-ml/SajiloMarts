import React, { useState, useEffect } from 'react';
import { Container, Section } from '../../components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from '../../components/common';
import { productRequestService } from '../../services/productRequest.service.js';

/**
 * AccountEntrySection
 * Renders authenticated customer entry point displaying real recent requests or a clean empty state.
 * For guests, renders clean sign-in and register CTAs.
 */
export const AccountEntrySection = ({
  user,
  isAuthenticated = false,
  onNavigate = () => {},
}) => {
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      let isMounted = true;
      setIsLoading(true);
      productRequestService.getUserRequests({ limit: 3 })
        .then((res) => {
          if (isMounted) {
            const list = res.data?.requests || res.requests || res.data || [];
            setRecentRequests(Array.isArray(list) ? list : []);
          }
        })
        .catch(() => {
          if (isMounted) setRecentRequests([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isAuthenticated]);

  return (
    <Section id="customer-account-entry" size="md" style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <Container size="standard">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)', fontWeight: 600 }}>
            Account Management
          </Typography>
          <Typography variant="h2" style={{ marginTop: 'var(--space-2)' }}>
            Customer Account & Sourcing History
          </Typography>
        </div>

        {isAuthenticated ? (
          <Card style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--bg-surface-secondary)' }}>
            <CardHeader
              title={`Welcome back, ${user?.name || 'Customer'}`}
              description={`Account ID: ${user?.email || 'Verified Customer'}`}
            />
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Sourcing Requests</span>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('sourcing-requests')}>
                    View All &rarr;
                  </Button>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Loading your requests...
                  </div>
                ) : recentRequests.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentRequests.map((req) => (
                      <div
                        key={req._id || req.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{req.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {req.quantity || 1}</div>
                        </div>
                        <StatusBadge status={req.status || 'draft'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    border: '1px dashed var(--border-subtle)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    No sourcing requests yet. Paste an Indian product link above to create your first request.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('account')}>
                    Account Settings
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('sourcing-new')}>
                    + New Request
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', backgroundColor: 'var(--bg-surface-secondary)', padding: '24px' }}>
            <Typography variant="h3" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
              Create an Account or Sign In
            </Typography>
            <Typography variant="body" style={{ color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '440px', margin: '0 auto 16px' }}>
              Manage multiple India sourcing requests, track live Nepal consignments, and securely communicate with fulfillment managers.
            </Typography>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => onNavigate('login')}>
                Sign In to SajiloMarts
              </Button>
              <Button variant="outline" onClick={() => onNavigate('register')}>
                Register Account
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </Section>
  );
};

export default AccountEntrySection;
