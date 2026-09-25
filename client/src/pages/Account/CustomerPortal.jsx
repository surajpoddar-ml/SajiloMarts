import React from 'react';
import { Container } from '../../components/layout/Container.jsx';
import './CustomerPortal.css';

/**
 * SajiloMarts Customer Portal Shell
 * Houses the authenticated customer account views with responsive sidebar navigation and accessibility.
 */
export const CustomerPortal = ({
  activeTab = 'overview',
  onTabChange = () => {},
  onLogout,
  children,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'profile', label: 'Profile Settings', icon: '📝' },
    { id: 'requests', label: 'Sourcing Requests', icon: '📦' },
    { id: 'orders', label: 'Current Orders', icon: '🚚' },
    { id: 'history', label: 'Order History', icon: '📜' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'security', label: 'Account Security', icon: '🔒' },
  ];

  return (
    <div className="customer-portal">
      <Container size="wide">
        <div className="customer-portal__layout">
          <aside className="customer-portal__sidebar" aria-label="Account Menu">
            <div className="customer-portal__menu-card">
              <h2 className="customer-portal__menu-heading">Customer Portal</h2>
              <nav className="customer-portal__nav" role="tablist">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`panel-${tab.id}`}
                      id={`tab-${tab.id}`}
                      className={`customer-portal__nav-btn ${isActive ? 'customer-portal__nav-btn--active' : ''}`}
                      onClick={() => onTabChange(tab.id)}
                    >
                      <span className="customer-portal__nav-icon" aria-hidden="true">{tab.icon}</span>
                      <span className="customer-portal__nav-text">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {onLogout && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="customer-portal__nav-btn"
                    onClick={onLogout}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <span className="customer-portal__nav-icon" aria-hidden="true">🚪</span>
                    <span className="customer-portal__nav-text">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </aside>

          <main className="customer-portal__content" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default CustomerPortal;
