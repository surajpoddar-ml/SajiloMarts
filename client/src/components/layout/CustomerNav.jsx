import React from 'react';

/**
 * SajiloMarts Authenticated Customer Navigation Bar
 */
export const CustomerNav = ({
  currentView = 'account',
  onNavigate = () => {},
  className = '',
}) => {
  const links = [
    { id: 'account', label: 'Overview' },
    { id: 'sourcing-requests', label: 'Sourcing Requests' },
    { id: 'current-orders', label: 'Current Orders' },
    { id: 'order-history', label: 'Order History' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'account-security', label: 'Account Security' },
  ];

  return (
    <nav className={`customer-nav ${className}`.trim()} aria-label="Customer Portal Navigation">
      <ul className="customer-nav__list">
        {links.map((link) => {
          const isActive = currentView === link.id ||
            (link.id === 'sourcing-requests' && ['sourcing-new', 'sourcing-detail'].includes(currentView)) ||
            (link.id === 'account' && currentView === 'account-profile');
          return (
            <li key={link.id}>
              <button
                type="button"
                className={`customer-nav__link ${isActive ? 'customer-nav__link--active' : ''}`}
                onClick={() => onNavigate(link.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CustomerNav;
