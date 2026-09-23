import { useState, useEffect } from 'react';
import { healthService } from './services';
import { ENV, FEATURE_FLAGS, PUBLIC_CONFIG } from './config';
import { Header, Footer } from './components/layout';
import { StatusCard, FoundationHighlights } from './components/common';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { RegisterPage } from './pages/Auth/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/Auth/VerifyEmailPage.jsx';
import { ResendVerificationPage } from './pages/Auth/ResendVerificationPage.jsx';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage.jsx';
import { ChangePasswordSection } from './pages/Account/ChangePasswordSection.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import './App.css';

const ARCHITECTURE_RULES = [
  {
    label: 'JavaScript Only',
    description: 'Strict pure JavaScript (ES2022+ / JSX) across frontend and backend layers.',
  },
  {
    label: 'Architectural Boundaries',
    description: 'Separation of concerns across UI Presentation, Layered Server API, and MongoDB persistence.',
  },
  {
    label: 'Secure Authentication',
    description: 'HTTP-only cookies, password hashing with bcrypt, timing protection, and active account enforcement.',
  },
  {
    label: 'Server Authoritative',
    description: 'Critical business rules, quote calculations, and INR-to-NPR peg conversions enforced server-side.',
  },
  {
    label: 'Documentation & Workflow',
    description: 'Institutionalized Git standards, security guidelines, and 36-step future implementation roadmap.',
  },
];

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      if (path.includes('verify-email') || params.get('token') && window.location.hash.includes('verify')) {
        return 'verify-email';
      }
      if (path.includes('reset-password') || params.get('token')) {
        return 'reset-password';
      }
    }
    return 'home';
  });

  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
  });

  const checkHealth = async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const json = await healthService.checkHealth();
      setBackendStatus({
        loading: false,
        connected: true,
        data: json.data || json,
        error: null,
      });
    } catch (err) {
      setBackendStatus({
        loading: false,
        connected: false,
        data: null,
        error: err.message || 'Failed to connect to backend',
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const backendIndicator = backendStatus.connected
    ? 'active'
    : backendStatus.loading
    ? 'loading'
    : 'offline';

  return (
    <div className="container">
      <Header
        brandName={PUBLIC_CONFIG.BRAND_NAME}
        stepLabel="Prompt 13 &bull; Account Security &amp; Password Recovery"
        user={user}
        onLogin={() => setCurrentView('login')}
        onRegister={() => setCurrentView('register')}
        onLogout={async () => {
          await logout();
          setCurrentView('home');
        }}
      />

      <nav style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', margin: '1rem 0', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className="refresh-btn"
          style={{
            background: currentView === 'home' ? '#2563eb' : '#ffffff',
            color: currentView === 'home' ? '#ffffff' : '#334155',
            borderColor: currentView === 'home' ? '#2563eb' : '#cbd5e1',
          }}
        >
          Home &amp; System Health
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('account')}
          className="refresh-btn"
          style={{
            background: currentView === 'account' ? '#2563eb' : '#ffffff',
            color: currentView === 'account' ? '#ffffff' : '#334155',
            borderColor: currentView === 'account' ? '#2563eb' : '#cbd5e1',
          }}
        >
          Customer Portal (Protected)
        </button>
      </nav>

      {currentView === 'login' && (
        <LoginPage
          onNavigateToRegister={() => setCurrentView('register')}
          onNavigateToForgot={() => setCurrentView('forgot-password')}
          onNavigateToResend={() => setCurrentView('resend-verification')}
          onLoginSuccess={() => setCurrentView('account')}
        />
      )}

      {currentView === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => setCurrentView('login')}
          onRegisterSuccess={() => setCurrentView('account')}
        />
      )}

      {currentView === 'forgot-password' && (
        <ForgotPasswordPage
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'reset-password' && (
        <ResetPasswordPage
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToForgot={() => setCurrentView('forgot-password')}
        />
      )}

      {currentView === 'verify-email' && (
        <VerifyEmailPage
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToResend={() => setCurrentView('resend-verification')}
        />
      )}

      {currentView === 'resend-verification' && (
        <ResendVerificationPage
          onNavigateToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'account' && (
        <ProtectedRoute onRedirectToLogin={() => setCurrentView('login')}>
          <div style={{ maxWidth: '640px', margin: '2rem auto', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Customer Profile &amp; Security</h2>
            <div style={{ display: 'grid', gap: '0.75rem', textAlign: 'left', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px' }}>
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Phone:</strong> {user?.phone || 'Not provided'}</div>
              <div><strong>Role:</strong> <span className="badge" style={{ marginLeft: '0.25rem' }}>{user?.role}</span></div>
              <div>
                <strong>Email Verification:</strong>{' '}
                {user?.isEmailVerified ? (
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>&check; Verified</span>
                ) : (
                  <span>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>&bull; Unverified</span>
                    <button
                      type="button"
                      onClick={() => setCurrentView('resend-verification')}
                      className="auth-link"
                      style={{ background: 'none', border: 'none', marginLeft: '0.75rem', fontSize: '0.85rem' }}
                    >
                      Resend Verification Email
                    </button>
                  </span>
                )}
              </div>
              <div><strong>Account Status:</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span></div>
            </div>

            <ChangePasswordSection />
          </div>
        </ProtectedRoute>
      )}

      {currentView === 'home' && (
        <main className="hero-section">
          <h1 className="title">{PUBLIC_CONFIG.TAGLINE}</h1>
          <p className="subtitle">
            Secure session foundation with HTTP-only cookies, password hashing with bcrypt, timing protection, and active account enforcement.
          </p>

          <div className="status-card-grid">
            <StatusCard
              statusIndicator="active"
              tag={`React Frontend (${ENV.NODE_ENV})`}
              title="Auth Context &amp; Protected Routes"
              detail={`Session State: ${isAuthenticated ? `Authenticated (${user?.name})` : 'Guest / Unauthenticated'}`}
            >
              <div className="badge-list">
                <span className="badge">Pure JavaScript / JSX</span>
                <span className="badge">Active Flags: {Object.keys(FEATURE_FLAGS).length}</span>
              </div>
            </StatusCard>

            <StatusCard
              statusIndicator={backendIndicator}
              tag="Express Backend"
              title="Layered Architecture API"
              detail="Target: /api/v1/health &amp; /api/v1/auth"
            >
              <div className="connection-info">
                {backendStatus.loading ? (
                  <span className="status-text loading-text">Connecting &amp; checking health...</span>
                ) : backendStatus.connected ? (
                  <div className="backend-meta">
                    <span className="status-text success-text">&check; Server Online &amp; Healthy</span>
                    {backendStatus.data?.uptime && (
                      <small className="uptime-info">
                        Uptime: {backendStatus.data.uptime} | Env: {backendStatus.data.environment}
                      </small>
                    )}
                  </div>
                ) : (
                  <div className="backend-meta">
                    <span className="status-text error-text">&cross; Backend Offline</span>
                    <small className="uptime-info">Run <code>npm run dev</code> in <code>server/</code></small>
                  </div>
                )}
              </div>
              <button className="refresh-btn" onClick={checkHealth} type="button">
                Recheck Health
              </button>
            </StatusCard>
          </div>

          <FoundationHighlights
            title="Code Quality &amp; Development Standards"
            items={ARCHITECTURE_RULES}
          />
        </main>
      )}

      <Footer brandName={PUBLIC_CONFIG.BRAND_NAME} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
