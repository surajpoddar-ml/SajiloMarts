import React from 'react';
import { Button } from '../common/Button.jsx';
import { Logo } from '../common/Logo.jsx';
import { Container } from './Container.jsx';

/**
 * SajiloMarts Global Site Header with Responsive Public & Auth Navigation
 */
export const Header = ({
  brandName = 'SajiloMarts',
  currentView = 'home',
  onNavigate = () => {},
  user,
  isAdmin = false,
  onLogin,
  onRegister,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const handleSectionClick = (sectionId, viewName) => {
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (onNavigate) {
        onNavigate(viewName || 'home');
      }
    }
  };

  return (
    <header className="site-header">
      <Container size="wide">
        <div className="nav-container">
          {/* SajiloMarts Official Logo */}
          <div className="header-brand">
            <Logo
              size="md"
              onClick={() => onNavigate('home')}
            />
          </div>

          {/* Public Desktop Navigation Links */}
          <nav aria-label="Main Navigation">
            <ul className="public-nav-list">
              <li>
                <button
                  type="button"
                  className={`nav-link ${currentView === 'home' ? 'nav-link--active' : ''}`}
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => handleSectionClick('how-it-works', 'home')}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => handleSectionClick('track-order-section', 'home')}
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`nav-link ${['sourcing-requests', 'sourcing-new', 'sourcing-detail', 'checkout'].includes(currentView) ? 'nav-link--active' : ''}`}
                  onClick={() => onNavigate('sourcing-requests')}
                >
                  My Orders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => handleSectionClick('support-section', 'home')}
                >
                  Support
                </button>
              </li>
            </ul>
          </nav>

          {/* Desktop Right Actions: Auth or Guest buttons */}
          <div className="header-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('account')}
                >
                  Account
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('admin-console')}
                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogin || (() => onNavigate('login'))}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRegister || (() => onNavigate('register'))}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            {onToggleMobileMenu && (
              <button
                type="button"
                className="mobile-nav-toggle"
                onClick={onToggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="mobile-nav-toggle__bar" />
                <span className="mobile-nav-toggle__bar" />
                <span className="mobile-nav-toggle__bar" />
              </button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
