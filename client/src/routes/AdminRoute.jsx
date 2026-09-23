import { useAuth } from '../hooks/useAuth.js';

/**
 * Admin Route Guard
 * Enforces authenticated administrator access.
 * Displays safe unauthorized state for authenticated non-admin users and prompts unauthenticated users to sign in.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.fallback]
 * @param {() => void} [props.onRedirectToLogin]
 * @param {() => void} [props.onRedirectToHome]
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
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <div className="status-indicator loading" style={{ margin: '0 auto 1rem' }}></div>
        <p>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return fallback;
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          maxWidth: '480px',
          margin: '2rem auto',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>🛡️</span>
        <h3 style={{ margin: '1rem 0 0.5rem', color: '#0f172a' }}>Admin Authentication Required</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          This section requires administrative privileges. Please log in with an administrator account.
        </p>
        {onRedirectToLogin && (
          <button
            type="button"
            className="refresh-btn"
            onClick={onRedirectToLogin}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              borderColor: '#2563eb',
              padding: '0.65rem 1.25rem',
            }}
          >
            Sign in as Administrator
          </button>
        )}
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) return fallback;
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: '#fef2f2',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          maxWidth: '480px',
          margin: '2rem auto',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>🚫</span>
        <h3 style={{ margin: '1rem 0 0.5rem', color: '#991b1b' }}>Access Denied (403 Forbidden)</h3>
        <p style={{ color: '#7f1d1d', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Your account (<strong>{user?.email}</strong>) holds role <code>{user?.role}</code> which does not have permission to access administrative areas.
        </p>
        {onRedirectToHome && (
          <button
            type="button"
            className="refresh-btn"
            onClick={onRedirectToHome}
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              borderColor: '#b91c1c',
              padding: '0.65rem 1.25rem',
            }}
          >
            Return to Customer Dashboard
          </button>
        )}
      </div>
    );
  }

  return children;
};

export default AdminRoute;
