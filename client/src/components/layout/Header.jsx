export const Header = ({ brandName, stepLabel, user, onLogin, onRegister, onLogout }) => {
  return (
    <header className="header">
      <div className="logo-badge">
        <span className="logo-dot"></span>
        <span className="logo-text">{brandName}</span>
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {stepLabel && <span className="step-pill">{stepLabel}</span>}
        {user ? (
          <div className="user-nav-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
              👤 {user.name} <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>({user.role})</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="refresh-btn"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="auth-nav-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
            {onLogin && (
              <button
                type="button"
                onClick={onLogin}
                className="refresh-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Sign In
              </button>
            )}
            {onRegister && (
              <button
                type="button"
                onClick={onRegister}
                className="refresh-btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
              >
                Register
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
