import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Spinner } from '../components/feedback/Spinner.jsx';

/**
 * SastoMarts Protected Route Guard
 * Enforces authenticated customer session and active account status.
 */
export const ProtectedRoute = ({
  children,
  fallback,
  requiredRole,
  onRedirectToLogin,
  onRedirectToHome,
}) => {
  const { isAuthenticated, isLoading, user, role } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)', color: 'var(--text-secondary)' }}>
        <Spinner size="md" label="Verifying secure session..." />
        <p style={{ marginTop: 'var(--space-3)', fontSize: '0.875rem' }}>Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    return (
      <div style={{ maxWidth: '480px', margin: 'var(--space-8) auto', padding: '0 var(--space-4)' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            Authentication Required
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
            Please sign in to access your customer dashboard, sourcing requests, and saved addresses.
          </p>
          {onRedirectToLogin && (
            <Button
              variant="primary"
              onClick={onRedirectToLogin}
            >
              Sign In to Continue
            </Button>
          )}
        </Card>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole.toLowerCase()) {
    if (fallback) {
      return fallback;
    }
    return (
      <div style={{ maxWidth: '480px', margin: 'var(--space-8) auto', padding: '0 var(--space-4)' }}>
        <Card style={{ textAlign: 'center', padding: 'var(--space-8)', borderColor: 'var(--color-error-border)' }}>
          <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-error)', fontSize: '1.25rem' }}>
            Unauthorized Role
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-6)' }}>
            This page requires <strong>{requiredRole}</strong> role. You are signed in as <strong>{user?.role}</strong>.
          </p>
          {onRedirectToHome && (
            <Button
              variant="secondary"
              onClick={onRedirectToHome}
            >
              Return to Home
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
