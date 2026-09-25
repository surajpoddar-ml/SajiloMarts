import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Typography } from '../../components/common/Typography.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { ChangePasswordSection } from './ChangePasswordSection.jsx';
import { authService } from '../../services/auth.service.js';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * SajiloMarts Account Security Section
 * Combines authenticated password change, email verification controls, and identity status.
 */
export const SecuritySection = ({
  user,
  onNavigate = () => {},
}) => {
  const { showSuccess, showError } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification(user?.email);
      showSuccess('Verification email sent. Please check your inbox.');
    } catch (err) {
      showError(err.message || 'Failed to send verification link.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="security-section" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '860px', margin: '0 auto' }}>
      {/* Security Credentials Summary Card */}
      <Card>
        <CardHeader
          title="Account Security &amp; Verified Identity"
          description="Manage your verified authentication credentials and access protection"
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
                Email Verification
              </span>
              <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {user?.isEmailVerified ? (
                  <StatusBadge status="customer_confirmed" label="Email Verified" />
                ) : (
                  <>
                    <StatusBadge status="draft" label="Verification Required" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      {isResending ? 'Sending...' : 'Resend Link'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Session Authentication
              </span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-success)', marginTop: '4px' }}>
                &check; HTTP-Only Cookie Active
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Account Security Status
              </span>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                Standard Protection
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Change Password Component Card */}
      <Card>
        <CardBody>
          <ChangePasswordSection />
        </CardBody>
      </Card>
    </div>
  );
};

export default SecuritySection;
