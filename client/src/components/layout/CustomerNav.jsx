import React from 'react';

const OverviewIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SourcingIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CurrentOrdersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const OrderHistoryIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AddressesIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SecurityIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/**
 * SajiloMarts Authenticated Customer Navigation Bar
 */
export const CustomerNav = ({
  currentView = 'account',
  onNavigate = () => {},
  className = '',
}) => {
  const links = [
    { id: 'account', label: 'Overview', icon: OverviewIcon },
    { id: 'sourcing-requests', label: 'Sourcing Requests', icon: SourcingIcon },
    { id: 'current-orders', label: 'Current Orders', icon: CurrentOrdersIcon },
    { id: 'order-history', label: 'Order History', icon: OrderHistoryIcon },
    { id: 'addresses', label: 'Addresses', icon: AddressesIcon },
    { id: 'account-security', label: 'Account Security', icon: SecurityIcon },
  ];

  return (
    <nav className={`customer-nav ${className}`.trim()} aria-label="Customer Portal Navigation">
      <ul className="customer-nav__list">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentView === link.id ||
            (link.id === 'sourcing-requests' && ['sourcing-new', 'sourcing-detail'].includes(currentView)) ||
            (link.id === 'account' && (currentView === 'account-profile' || currentView === 'account'));
          return (
            <li key={link.id} className="customer-nav__item">
              <button
                type="button"
                className={`customer-nav__link ${isActive ? 'customer-nav__link--active' : ''}`}
                onClick={() => onNavigate(link.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="customer-nav__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="customer-nav__label">{link.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CustomerNav;

