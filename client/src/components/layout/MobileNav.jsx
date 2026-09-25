import React, { useEffect } from 'react';
import { Button } from '../common/Button.jsx';
import { Logo } from '../common/Logo.jsx';

/**
 * SajiloMarts Accessible Mobile Drawer Navigation
 */
export const MobileNav = ({
  isOpen = false,
  onClose = () => {},
  currentView = 'home',
  onNavigate = () => {},
  user,
  isAdmin = false,
  onLogin,
  onRegister,
  onLogout,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavClick = (view) => {
    onNavigate(view);
    onClose();
  };

  const handleSectionClick = (sectionId) => {
    onClose();
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mobile-nav-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-nav-header">
          <div className="brand-logo">
            <Logo size="sm" onClick={() => handleNavClick('home')} />
          </div>
          <button
            type="button"
            className="mobile-nav-close"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            &times;
          </button>
        </div>

        <nav className="mobile-nav-body">
          <ul className="mobile-nav-list">
            <li>
              <button
                type="button"
                className={`mobile-nav-item ${currentView === 'home' ? 'mobile-nav-item--active' : ''}`}
                onClick={() => {
                  handleNavClick('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`mobile-nav-item ${['sourcing-requests', 'sourcing-new', 'sourcing-detail', 'checkout'].includes(currentView) ? 'mobile-nav-item--active' : ''}`}
                onClick={() => handleNavClick('sourcing-requests')}
              >
                📦 Sourcing Portal
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleSectionClick('how-it-works')}
              >
                How It Works
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleSectionClick('track-order-section')}
              >
                Track Order
              </button>
            </li>
            <li>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleSectionClick('support-section')}
              >
                Customer Support
              </button>
            </li>
          </ul>

          {user && (
            <div className="mobile-nav-section">
              <div className="mobile-nav-section-title">Account &amp; Orders</div>
              <ul className="mobile-nav-list">
                <li>
                  <button
                    type="button"
                    className={`mobile-nav-item ${currentView === 'account' ? 'mobile-nav-item--active' : ''}`}
                    onClick={() => handleNavClick('account')}
                  >
                    👤 Account Profile ({user.name})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`mobile-nav-item ${currentView === 'sourcing-new' ? 'mobile-nav-item--active' : ''}`}
                    onClick={() => handleNavClick('sourcing-new')}
                  >
                    + Create Sourcing Request
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      className={`mobile-nav-item ${currentView === 'admin-console' ? 'mobile-nav-item--active' : ''}`}
                      onClick={() => handleNavClick('admin-console')}
                      style={{ color: '#B91C1C' }}
                    >
                      🛡️ Administrator Console
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mobile-nav-footer">
            {user ? (
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
              >
                Sign Out
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    if (onLogin) onLogin();
                    else handleNavClick('login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    if (onRegister) onRegister();
                    else handleNavClick('register');
                  }}
                >
                  Create Free Account
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
