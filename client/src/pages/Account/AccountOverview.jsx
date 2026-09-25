import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';

/**
 * SajiloMarts Authenticated Customer Account Overview
 * Displays verified customer profile information, security status, and account actions.
 * Zero dummy statistics or hardcoded mock data.
 */
export const AccountOverview = ({
  user,
  onNavigate = () => {},
}) => {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="account-overview" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Welcome Banner Card */}
      <Card>
        <CardHeader
          title={`Welcome back, ${user?.name || 'Customer'}`}
          description="Manage your cross-border sourcing requests, delivery addresses, and account security"
        />
        <CardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Full Name
              </span>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                {user?.name || '—'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Email Address
              </span>
              <div style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: '2px' }}>
                {user?.email || '—'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Phone Number
              </span>
              <div style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: '2px' }}>
                {user?.phone || 'Not provided'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Email Verification
              </span>
              <div style={{ marginTop: '4px' }}>
                {user?.isEmailVerified ? (
                  <StatusBadge status="customer_confirmed" label="Verified" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status="draft" label="Unverified" />
                    <button
                      type="button"
                      onClick={() => onNavigate('resend-verification')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-brand)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Resend Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {memberSince && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Member Since
                </span>
                <div style={{ fontWeight: 500, fontSize: '0.95rem', marginTop: '2px' }}>
                  {memberSince}
                </div>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Account Role
              </span>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', textTransform: 'capitalize' }}>
                {user?.role || 'Customer'}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <Card style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📦</div>
          <Typography variant="h3" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
            Sourcing Requests
          </Typography>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
            View submitted product links, receive official quotes, and track India sourcing status.
          </Typography>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="primary" onClick={() => onNavigate('sourcing-requests')}>
              View Requests
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate('sourcing-new')}>
              + New Request
            </Button>
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🚚</div>
          <Typography variant="h3" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
            Current Orders
          </Typography>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
            Track in-flight cross-border shipments from India procurement to Kathmandu delivery.
          </Typography>
          <Button size="sm" variant="outline" onClick={() => onNavigate('current-orders')}>
            Track Current Orders
          </Button>
        </Card>

        <Card style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📍</div>
          <Typography variant="h3" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
            Delivery Addresses
          </Typography>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
            Manage your verified Nepal delivery destinations, wards, and default shipping addresses.
          </Typography>
          <Button size="sm" variant="outline" onClick={() => onNavigate('addresses')}>
            Manage Addresses
          </Button>
        </Card>

        <Card style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔒</div>
          <Typography variant="h3" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
            Account Security
          </Typography>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
            Update your account password and review verified account credentials.
          </Typography>
          <Button size="sm" variant="outline" onClick={() => onNavigate('account-security')}>
            Security Settings
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AccountOverview;
