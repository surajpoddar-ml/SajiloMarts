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
import { SourcingRequestForm, SourcingRequestList, SourcingRequestDetail } from './pages/Quotes';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminRoute } from './routes/AdminRoute.jsx';
import './App.css';

const ARCHITECTURE_RULES = [
  {
    label: 'Authoritative Pricing Engine',
    description: '1 INR = 1.65 NPR conversion rate, 18% online surcharge, and 22% COD fee calculated strictly server-side.',
  },
  {
    label: 'Marketplace URL Security',
    description: 'Automatic Indian marketplace domain validation, SSRF protection, and tracking parameter normalization.',
  },
  {
    label: 'Ownership & IDOR Protection',
    description: 'Customer sourcing requests, address assignments, and quote calculations are strictly bound to the authenticated user.',
  },
  {
    label: 'Historical Quote Snapshots',
    description: 'Quotes are immutably snapshotted with breakdown math preserving long-term auditability.',
  },
  {
    label: 'Controlled Sourcing Lifecycle',
    description: 'Deterministic state transitions (draft → submitted → quote_ready → customer_confirmed) without client tampering.',
  },
];

function AppContent() {
  const { user, isAuthenticated, role, isAdmin, isCustomer, logout } = useAuth();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      if (path.includes('verify-email') || (params.get('token') && window.location.hash.includes('verify'))) {
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
        stepLabel="Prompt 15 &bull; Sourcing &amp; Quote APIs"
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
          onClick={() => setCurrentView('sourcing-requests')}
          className="refresh-btn"
          style={{
            background: ['sourcing-requests', 'sourcing-new', 'sourcing-detail'].includes(currentView) ? '#2563eb' : '#ffffff',
            color: ['sourcing-requests', 'sourcing-new', 'sourcing-detail'].includes(currentView) ? '#ffffff' : '#334155',
            borderColor: ['sourcing-requests', 'sourcing-new', 'sourcing-detail'].includes(currentView) ? '#2563eb' : '#cbd5e1',
          }}
        >
          📦 Sourcing Portal (Quotes &amp; Requests)
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
          Customer Profile
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('admin-console')}
          className="refresh-btn"
          style={{
            background: currentView === 'admin-console' ? '#b91c1c' : '#ffffff',
            color: currentView === 'admin-console' ? '#ffffff' : '#991b1b',
            borderColor: currentView === 'admin-console' ? '#b91c1c' : '#fca5a5',
          }}
        >
          🛡️ Admin Console
        </button>
      </nav>

      {/* Sourcing Portal Views */}
      {currentView === 'sourcing-requests' && (
        <ProtectedRoute
          onRedirectToLogin={() => setCurrentView('login')}
          onRedirectToHome={() => setCurrentView('home')}
        >
          <SourcingRequestList
            onCreateNew={() => setCurrentView('sourcing-new')}
            onSelectRequest={(id) => {
              setSelectedRequestId(id);
              setCurrentView('sourcing-detail');
            }}
          />
        </ProtectedRoute>
      )}

      {currentView === 'sourcing-new' && (
        <ProtectedRoute
          onRedirectToLogin={() => setCurrentView('login')}
          onRedirectToHome={() => setCurrentView('home')}
        >
          <SourcingRequestForm
            onRequestCreated={(req) => {
              setSelectedRequestId(req._id || req.id);
              setCurrentView('sourcing-detail');
            }}
            onCancel={() => setCurrentView('sourcing-requests')}
          />
        </ProtectedRoute>
      )}

      {currentView === 'sourcing-detail' && (
        <ProtectedRoute
          onRedirectToLogin={() => setCurrentView('login')}
          onRedirectToHome={() => setCurrentView('home')}
        >
          <SourcingRequestDetail
            requestId={selectedRequestId}
            onBack={() => setCurrentView('sourcing-requests')}
            onStatusUpdated={() => {}}
          />
        </ProtectedRoute>
      )}

      {currentView === 'login' && (
        <LoginPage
          onNavigateToRegister={() => setCurrentView('register')}
          onNavigateToForgot={() => setCurrentView('forgot-password')}
          onNavigateToResend={() => setCurrentView('resend-verification')}
          onLoginSuccess={() => setCurrentView(isAdmin ? 'admin-console' : 'account')}
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
        <ProtectedRoute
          onRedirectToLogin={() => setCurrentView('login')}
          onRedirectToHome={() => setCurrentView('home')}
        >
          <div style={{ maxWidth: '640px', margin: '2rem auto', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Customer Profile &amp; Access Controls</h2>
            <div style={{ display: 'grid', gap: '0.75rem', textAlign: 'left', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px' }}>
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Phone:</strong> {user?.phone || 'Not provided'}</div>
              <div><strong>Authoritative Role:</strong> <span className="badge" style={{ marginLeft: '0.25rem' }}>{role}</span></div>
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

      {currentView === 'admin-console' && (
        <AdminRoute
          onRedirectToLogin={() => setCurrentView('login')}
          onRedirectToHome={() => setCurrentView('account')}
        >
          <div style={{ maxWidth: '640px', margin: '2rem auto', background: '#ffffff', border: '1px solid #fecaca', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#991b1b' }}>🛡️ Administrative Access Boundary</h2>
            <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem', color: '#7f1d1d', fontWeight: 600 }}>
                &check; Administrator Privilege Verified Server-Side
              </p>
              <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                <div><strong>Admin Identity:</strong> {user?.name} ({user?.email})</div>
                <div><strong>Role Guard:</strong> <code>{role}</code></div>
                <div><strong>Authorization Status:</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>Authorized for Administrative Endpoints</span></div>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Note: Full administrative control panel views will be implemented in Prompt 21.
            </p>
          </div>
        </AdminRoute>
      )}

      {currentView === 'home' && (
        <main className="hero-section">
          <h1 className="title">{PUBLIC_CONFIG.TAGLINE}</h1>
          <p className="subtitle">
            Role-Based Access Control &amp; Authorization foundation with customer/admin isolation, ownership validation, and deny-by-default policy.
          </p>

          <div className="status-card-grid">
            <StatusCard
              statusIndicator="active"
              tag={`React Frontend (${ENV.NODE_ENV})`}
              title="Auth Context &amp; Role Guards"
              detail={`Session State: ${isAuthenticated ? `Authenticated (${user?.name} - ${role})` : 'Guest / Unauthenticated'}`}
            >
              <div className="badge-list">
                <span className="badge">Pure JavaScript / JSX</span>
                <span className="badge">Active Role: {role || 'none'}</span>
              </div>
            </StatusCard>

            <StatusCard
              statusIndicator={backendIndicator}
              tag="Express Backend"
              title="RBAC &amp; Authorization API"
              detail="Target: /api/v1/admin &amp; /api/v1/auth"
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
            title="RBAC &amp; Security Principles"
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
