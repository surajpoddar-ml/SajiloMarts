import React, { useState, useEffect } from 'react';
import { healthService } from './services';
import { ENV, PUBLIC_CONFIG } from './config';
import { Header, Footer, Container, Section, CustomerNav, AdminNav, MobileNav, AppShell } from './components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge } from './components/common';
import { ErrorBoundary } from './components/feedback';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { RegisterPage } from './pages/Auth/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/Auth/VerifyEmailPage.jsx';
import { ResendVerificationPage } from './pages/Auth/ResendVerificationPage.jsx';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage.jsx';
import { ChangePasswordSection } from './pages/Account/ChangePasswordSection.jsx';
import { SourcingRequestForm, SourcingRequestList, SourcingRequestDetail } from './pages/Quotes';
import { DesignSystemShowcase } from './pages/Showcase/DesignSystemShowcase.jsx';
import { NotFoundPage } from './pages/NotFound/NotFoundPage.jsx';
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
  const { user, isAuthenticated, role, isAdmin, logout } = useAuth();
  const { showInfo } = useToast();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <Header
        brandName={PUBLIC_CONFIG.BRAND_NAME}
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        isAdmin={isAdmin}
        onLogin={() => handleNavigate('login')}
        onRegister={() => handleNavigate('register')}
        onLogout={async () => {
          await logout();
          handleNavigate('home');
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
        onNavigate={handleNavigate}
        user={user}
        isAdmin={isAdmin}
        onLogin={() => handleNavigate('login')}
        onRegister={() => handleNavigate('register')}
        onLogout={async () => {
          await logout();
          handleNavigate('home');
        }}
      />

      {/* Role-Aware Sub-Navigation for Authenticated Users */}
      {isAuthenticated && isAdmin && (
        <Container size="wide">
          <AdminNav currentView={currentView} onNavigate={handleNavigate} />
        </Container>
      )}

      {isAuthenticated && !isAdmin && (
        <Container size="wide">
          <CustomerNav currentView={currentView} onNavigate={handleNavigate} />
        </Container>
      )}

      {/* Global Quick-Nav Strip for Foundation Switching */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '6px 0' }}>
        <Container size="wide">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', padding: '2px 0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: '4px' }}>
              Quick View:
            </span>
            <button
              type="button"
              className={`customer-nav__link ${currentView === 'home' ? 'customer-nav__link--active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              System Health
            </button>
            <button
              type="button"
              className={`customer-nav__link ${currentView === 'showcase' ? 'customer-nav__link--active' : ''}`}
              onClick={() => handleNavigate('showcase')}
            >
              🎨 Design System Showcase
            </button>
            <button
              type="button"
              className={`customer-nav__link ${['sourcing-requests', 'sourcing-new', 'sourcing-detail'].includes(currentView) ? 'customer-nav__link--active' : ''}`}
              onClick={() => handleNavigate('sourcing-requests')}
            >
              📦 Sourcing Portal
            </button>
            <button
              type="button"
              className={`customer-nav__link ${currentView === 'account' ? 'customer-nav__link--active' : ''}`}
              onClick={() => handleNavigate('account')}
            >
              👤 Customer Account
            </button>
            {isAdmin && (
              <button
                type="button"
                className={`customer-nav__link ${currentView === 'admin-console' ? 'customer-nav__link--active' : ''}`}
                onClick={() => handleNavigate('admin-console')}
                style={{ color: '#B91C1C' }}
              >
                🛡️ Admin Console
              </button>
            )}
          </div>
        </Container>
      </div>

      <main id="main-content" className="app-shell__main">
        {/* Design System Showcase View */}
        {currentView === 'showcase' && <DesignSystemShowcase />}

        {/* Sourcing Portal Views */}
        {currentView === 'sourcing-requests' && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <SourcingRequestList
              onCreateNew={() => handleNavigate('sourcing-new')}
              onSelectRequest={(id) => {
                setSelectedRequestId(id);
                handleNavigate('sourcing-detail');
              }}
            />
          </ProtectedRoute>
        )}

        {currentView === 'sourcing-new' && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <SourcingRequestForm
              onRequestCreated={(req) => {
                setSelectedRequestId(req._id || req.id);
                handleNavigate('sourcing-detail');
              }}
              onCancel={() => handleNavigate('sourcing-requests')}
            />
          </ProtectedRoute>
        )}

        {currentView === 'sourcing-detail' && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <SourcingRequestDetail
              requestId={selectedRequestId}
              onBack={() => handleNavigate('sourcing-requests')}
              onStatusUpdated={() => {}}
            />
          </ProtectedRoute>
        )}

        {/* Authentication Pages */}
        {currentView === 'login' && (
          <LoginPage
            onNavigateToRegister={() => handleNavigate('register')}
            onNavigateToForgot={() => handleNavigate('forgot-password')}
            onNavigateToResend={() => handleNavigate('resend-verification')}
            onLoginSuccess={() => handleNavigate(isAdmin ? 'admin-console' : 'account')}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onNavigateToLogin={() => handleNavigate('login')}
            onRegisterSuccess={() => handleNavigate('account')}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigateToLogin={() => handleNavigate('login')}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordPage
            onNavigateToLogin={() => handleNavigate('login')}
            onNavigateToForgot={() => handleNavigate('forgot-password')}
          />
        )}

        {currentView === 'verify-email' && (
          <VerifyEmailPage
            onNavigateToLogin={() => handleNavigate('login')}
            onNavigateToResend={() => handleNavigate('resend-verification')}
          />
        )}

        {currentView === 'resend-verification' && (
          <ResendVerificationPage
            onNavigateToLogin={() => handleNavigate('login')}
          />
        )}

        {/* Customer Account Page */}
        {currentView === 'account' && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <Container size="narrow" style={{ marginTop: 'var(--space-8)' }}>
              <Card>
                <CardHeader
                  title="Customer Account Profile"
                  description="Verified cross-border identity and security controls"
                />
                <CardBody>
                  <div style={{ display: 'grid', gap: 'var(--space-3)', background: 'var(--bg-surface-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    <div><strong>Name:</strong> {user?.name}</div>
                    <div><strong>Email:</strong> {user?.email}</div>
                    <div><strong>Phone:</strong> {user?.phone || 'Not provided'}</div>
                    <div><strong>Role:</strong> <span className="badge" style={{ marginLeft: '4px' }}>{role}</span></div>
                    <div>
                      <strong>Email Verification:</strong>{' '}
                      {user?.isEmailVerified ? (
                        <StatusBadge status="customer_confirmed" label="Verified" />
                      ) : (
                        <span>
                          <StatusBadge status="draft" label="Unverified" />
                          <button
                            type="button"
                            onClick={() => handleNavigate('resend-verification')}
                            style={{ background: 'none', border: 'none', marginLeft: '8px', color: 'var(--color-brand)', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Resend Email
                          </button>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'var(--space-6)' }}>
                    <ChangePasswordSection />
                  </div>
                </CardBody>
              </Card>
            </Container>
          </ProtectedRoute>
        )}

        {/* Admin Console Boundary */}
        {currentView === 'admin-console' && (
          <AdminRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('account')}
          >
            <Container size="narrow" style={{ marginTop: 'var(--space-8)' }}>
              <Card style={{ borderColor: '#FECACA' }}>
                <CardHeader
                  title="🛡️ Administrative Access Boundary"
                  description="Privilege verified server-side with RBAC guards"
                />
                <CardBody>
                  <div style={{ background: '#FEF2F2', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ color: '#7F1D1D', fontWeight: 600, marginBottom: '6px' }}>
                      &check; Administrator Privilege Verified
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <div><strong>Admin:</strong> {user?.name} ({user?.email})</div>
                      <div><strong>Role:</strong> <code>{role}</code></div>
                    </div>
                  </div>
                  <Typography variant="caption">
                    Note: Complete administrative dashboard operations will be established in Prompt 21.
                  </Typography>
                </CardBody>
              </Card>
            </Container>
          </AdminRoute>
        )}

        {/* Placeholder Nav views for real routing */}
        {['how-it-works', 'track-order', 'support', 'terms', 'privacy', 'current-orders', 'order-history', 'admin-requests', 'admin-users', 'admin-audit'].includes(currentView) && (
          <Container size="narrow" style={{ marginTop: 'var(--space-8)' }}>
            <Card style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
              <Typography variant="h2" style={{ textTransform: 'capitalize', marginBottom: 'var(--space-2)' }}>
                {currentView.replace('-', ' ')}
              </Typography>
              <Typography variant="body" style={{ marginBottom: 'var(--space-6)' }}>
                This section is wired into the SajiloMarts layout and navigation system. Full functionality is scheduled for upcoming feature prompts.
              </Typography>
              <Button variant="primary" onClick={() => handleNavigate('showcase')}>
                Explore Design System Showcase
              </Button>
            </Card>
          </Container>
        )}

        {/* Home & System Health View */}
        {currentView === 'home' && (
          <div>
            <Section size="sm" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <Container size="wide" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
                <Typography variant="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-brand)' }}>
                  {PUBLIC_CONFIG.BRAND_NAME} &bull; Cross-Border Logistics
                </Typography>
                <Typography variant="display" style={{ marginTop: 'var(--space-2)' }}>
                  {PUBLIC_CONFIG.TAGLINE}
                </Typography>
                <Typography variant="body" style={{ maxWidth: '640px', margin: 'var(--space-3) auto 0' }}>
                  Professional frontend design system and global layout foundation connecting Indian marketplaces to verified delivery across Nepal.
                </Typography>
                <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="primary" onClick={() => handleNavigate('showcase')}>
                    Explore Design System Showcase
                  </Button>
                  <Button variant="secondary" onClick={() => handleNavigate('sourcing-requests')}>
                    Sourcing Portal
                  </Button>
                </div>
              </Container>
            </Section>

            <Container size="wide" style={{ marginTop: 'var(--space-8)' }}>
              <div className="layout-grid-2">
                <Card>
                  <CardHeader title="Frontend System State" description={`React 19 &bull; ${ENV.NODE_ENV}`} />
                  <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                      <div><strong>Session State:</strong> {isAuthenticated ? `Authenticated (${user?.name} - ${role})` : 'Guest / Unauthenticated'}</div>
                      <div><strong>Design Tokens:</strong> Warm Neutral Theme, Restrained Himalayan Crimson</div>
                      <div><strong>Font System:</strong> High-Legibility System Stack (No Inter/Geist)</div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Backend API &amp; Database Health" description="Express API &bull; MongoDB Atlas" />
                  <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                      <div>
                        <strong>Connection:</strong>{' '}
                        {backendStatus.connected ? (
                          <StatusBadge status="customer_confirmed" label="Online & Connected" />
                        ) : backendStatus.loading ? (
                          <StatusBadge status="under_review" label="Checking Health..." />
                        ) : (
                          <StatusBadge status="cancelled" label="Offline" />
                        )}
                      </div>
                      {backendStatus.data?.uptime && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          Uptime: {backendStatus.data.uptime} | Env: {backendStatus.data.environment}
                        </div>
                      )}
                      <div>
                        <Button variant="outline" size="sm" onClick={checkHealth}>
                          Recheck Backend Health
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Section size="sm" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
                <Card>
                  <CardHeader title="SajiloMarts Sourcing &amp; Security Principles" description="Authoritative pricing and verified cross-border fulfillment" />
                  <CardBody>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                      {ARCHITECTURE_RULES.map((rule) => (
                        <div key={rule.label} style={{ background: 'var(--bg-surface-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                          <Typography variant="label" style={{ display: 'block', marginBottom: '4px' }}>
                            {rule.label}
                          </Typography>
                          <Typography variant="small">
                            {rule.description}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </Section>
            </Container>
          </div>
        )}
      </main>

      <Footer
        brandName={PUBLIC_CONFIG.BRAND_NAME}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
