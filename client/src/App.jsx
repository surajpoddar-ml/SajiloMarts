import React, { useState, useEffect } from 'react';
import { healthService } from './services';
import { ENV, PUBLIC_CONFIG } from './config';
import { Header, Footer, Container, Section, CustomerNav, AdminNav, MobileNav, AppShell } from './components/layout';
import { Card, CardHeader, CardBody, Button, Typography, StatusBadge, Logo } from './components/common';
import { ErrorBoundary, Spinner } from './components/feedback';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useDocumentTitle } from './hooks/useDocumentTitle.js';
import { LoginPage } from './pages/Auth/LoginPage.jsx';
import { RegisterPage } from './pages/Auth/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/Auth/VerifyEmailPage.jsx';
import { ResendVerificationPage } from './pages/Auth/ResendVerificationPage.jsx';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage.jsx';
import { AccountPage, ChangePasswordSection } from './pages/Account';
import { SourcingRequestForm, SourcingRequestList, SourcingRequestDetail } from './pages/Quotes';
import { CheckoutPage } from './pages/Checkout';
import { HomePage } from './pages/Home';
import { TermsPage, PrivacyPage } from './pages/Legal';
import { NotFoundPage } from './pages/NotFound/NotFoundPage.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminRoute } from './routes/AdminRoute.jsx';
import './App.css';

function AppContent() {
  const { user, isAuthenticated, role, isAdmin, isLoading: isAuthLoading, logout } = useAuth();
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
      if (path.includes('register')) {
        return 'register';
      }
      if (path.includes('forgot-password')) {
        return 'forgot-password';
      }
    }
    return 'login';
  });

  // Dynamic SEO Page Title
  useDocumentTitle(null, currentView);

  // When user is authenticated, if currentView is on auth gate, redirect to home
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && ['login', 'register', 'forgot-password', 'reset-password'].includes(currentView)) {
      setCurrentView(isAdmin ? 'admin-console' : 'home');
    }
  }, [isAuthenticated, isAuthLoading, isAdmin]);

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

  // Mandatory Auth Gate: Unauthenticated users must log in or sign up before accessing the main website
  if (!isAuthenticated) {
    const authViews = ['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'resend-verification'];
    const activeAuthView = authViews.includes(currentView) ? currentView : 'login';

    return (
      <div className="app-shell auth-gate-shell">
        <header className="site-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 0' }}>
          <Container size="wide">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo size="md" onClick={() => handleNavigate('login')} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant={activeAuthView === 'login' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant={activeAuthView === 'register' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleNavigate('register')}
                >
                  Create Account
                </Button>
              </div>
            </div>
          </Container>
        </header>

        <main className="app-shell__main" style={{ padding: 'var(--space-8) 0' }}>
          {activeAuthView === 'login' && (
            <LoginPage
              onNavigateToRegister={() => handleNavigate('register')}
              onNavigateToForgot={() => handleNavigate('forgot-password')}
              onNavigateToResend={() => handleNavigate('resend-verification')}
              onLoginSuccess={() => handleNavigate('home')}
            />
          )}

          {activeAuthView === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => handleNavigate('login')}
              onRegisterSuccess={() => handleNavigate('home')}
            />
          )}

          {activeAuthView === 'forgot-password' && (
            <ForgotPasswordPage
              onNavigateToLogin={() => handleNavigate('login')}
            />
          )}

          {activeAuthView === 'reset-password' && (
            <ResetPasswordPage
              onNavigateToLogin={() => handleNavigate('login')}
              onNavigateToForgot={() => handleNavigate('forgot-password')}
            />
          )}

          {activeAuthView === 'verify-email' && (
            <VerifyEmailPage
              onNavigateToLogin={() => handleNavigate('login')}
              onNavigateToResend={() => handleNavigate('resend-verification')}
            />
          )}

          {activeAuthView === 'resend-verification' && (
            <ResendVerificationPage
              onNavigateToLogin={() => handleNavigate('login')}
            />
          )}
        </main>

        <Footer
          brandName={PUBLIC_CONFIG.BRAND_NAME}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  // Authenticated Main Website
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
          handleNavigate('login');
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
          handleNavigate('login');
        }}
      />

      {/* Role-Aware Sub-Navigation for Authenticated Users */}
      {isAdmin ? (
        <Container size="wide">
          <AdminNav currentView={currentView} onNavigate={handleNavigate} />
        </Container>
      ) : (
        <Container size="wide">
          <CustomerNav currentView={currentView} onNavigate={handleNavigate} />
        </Container>
      )}

      <main id="main-content" className="app-shell__main">
        {/* My Orders / Sourcing Portal Views */}
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
              onProceedToCheckout={(id) => {
                setSelectedRequestId(id || selectedRequestId);
                handleNavigate('checkout');
              }}
              onStatusUpdated={() => { }}
            />
          </ProtectedRoute>
        )}

        {currentView === 'checkout' && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <CheckoutPage
              requestId={selectedRequestId}
              user={user}
              onNavigate={handleNavigate}
              onBack={() => handleNavigate('sourcing-detail')}
              onPaymentSubmitted={(result) => {
                handleNavigate('sourcing-detail');
              }}
            />
          </ProtectedRoute>
        )}

        {/* Customer Account Portal */}
        {['account', 'account-security', 'account-profile'].includes(currentView) && (
          <ProtectedRoute
            onRedirectToLogin={() => handleNavigate('login')}
            onRedirectToHome={() => handleNavigate('home')}
          >
            <AccountPage
              initialTab={currentView === 'account-security' ? 'security' : currentView === 'account-profile' ? 'profile' : 'overview'}
              onNavigate={handleNavigate}
              onLogout={async () => {
                await logout();
                handleNavigate('login');
              }}
            />
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

        {/* Legal Pages */}
        {currentView === 'terms' && <TermsPage onNavigate={handleNavigate} />}
        {currentView === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}

        {/* Placeholder Nav views for remaining future routes */}
        {['current-orders', 'order-history', 'admin-requests', 'admin-users', 'admin-audit'].includes(currentView) && (
          <Container size="narrow" style={{ marginTop: 'var(--space-8)' }}>
            <Card style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-6)' }}>
              <Typography variant="h2" style={{ textTransform: 'capitalize', marginBottom: 'var(--space-2)' }}>
                {currentView.replace('-', ' ')}
              </Typography>
              <Typography variant="body" style={{ marginBottom: 'var(--space-6)' }}>
                This section is wired into the SajiloMarts layout and navigation system. Full functionality is scheduled for upcoming feature prompts.
              </Typography>
              <Button variant="primary" onClick={() => handleNavigate('home')}>
                Back to Homepage
              </Button>
            </Card>
          </Container>
        )}

        {/* Real SajiloMarts Homepage */}
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            user={user}
            isAuthenticated={isAuthenticated}
            onRequestCreated={(req) => {
              setSelectedRequestId(req._id || req.id);
              handleNavigate('sourcing-detail');
            }}
            onTrackOrder={(orderCode) => {
              handleNavigate('track-order');
            }}
          />
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
