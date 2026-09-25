import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Spinner } from '../components/feedback/Spinner.jsx';

/**
 * SastoMarts Admin Route Guard
 * Enforces authenticated administrator access.
 */
export const AdminRoute = ({
  children,
  fallback,
  onRedirectToLogin,
  onRedirectToHome,
}) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--text-secondary)' }}>
        <Spinner size="md" label="Verifying administrator credentials..." />
        <p style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem' }}>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return fallback;
    return (
      <div style={{ maxWidth: '480px', margin: 'var(--space-8) auto', padding: '0 var(--space-4)' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            Administrator Access Required
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
            This section requires administrative privileges. Please log in with an administrator account.
          </p>
          {onRedirectToLogin && (
            <Button
              variant="primary"
              onClick={onRedirectToLogin}
            >
              Sign In as Administrator
            </Button>
          )}
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) return fallback;
    return (
      <div style={{ maxWidth: '480px', margin: 'var(--space-8) auto', padding: '0 var(--space-4)' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)', borderColor: 'var(--color-error-border)' }}>
          <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-error)', fontSize: '1.25rem' }}>
            Access Denied (403 Forbidden)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
            Your account (<strong>{user?.email}</strong>) does not hold administrator permissions.
          </p>
          {onRedirectToHome && (
            <Button
              variant="secondary"
              onClick={onRedirectToHome}
            >
              Return to Customer Dashboard
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
