import { useAuth } from '../hooks/useAuth.js';

/**
 * Protected Route wrapper for customer-only and authenticated pages.
 * Displays loading state during session resolution and redirects unauthenticated users.
 */
export const ProtectedRoute = ({ children, fallback, onRedirectToLogin }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <div className="status-indicator loading" style={{ margin: '0 auto 1rem' }}></div>
        <p>Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '480px', margin: '2rem auto' }}>
        <span style={{ fontSize: '2rem' }}>🔒</span>
        <h3 style={{ margin: '1rem 0 0.5rem', color: '#0f172a' }}>Authentication Required</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Please sign in to access your customer dashboard, sourcing requests, and saved addresses.
        </p>
        {onRedirectToLogin && (
          <button
            type="button"
            className="refresh-btn"
            onClick={onRedirectToLogin}
            style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', padding: '0.65rem 1.25rem' }}
          >
            Go to Login
          </button>
        )}
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
