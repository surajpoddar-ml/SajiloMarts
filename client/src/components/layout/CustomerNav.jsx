import React from 'react';

/**
 * SastoMarts Authenticated Customer Navigation Bar
 */
export const CustomerNav = ({
  currentView = 'account',
  onNavigate = () => {},
  className = '',
}) => {
  const links = [
    { id: 'sourcing-requests', label: 'My Orders' },
    { id: 'sourcing-new', label: 'New Request' },
    { id: 'current-orders', label: 'Current Orders' },
    { id: 'order-history', label: 'Order History' },
    { id: 'account', label: 'Account Profile' },
  ];

  return (
    <nav className={`customer-nav ${className}`.trim()} aria-label="Customer Portal Navigation">
      <ul className="customer-nav__list">
        {links.map((link) => {
          const isActive = currentView === link.id;
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
