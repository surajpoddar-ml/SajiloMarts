import React from 'react';

/**
 * SastoMarts Role-Aware Administrator Navigation Bar
 * Only rendered when authenticated account holds administrative role.
 */
export const AdminNav = ({
  currentView = 'admin-console',
  onNavigate = () => {},
  className = '',
}) => {
  const adminLinks = [
    { id: 'admin-console', label: '🛡️ Admin Console' },
    { id: 'admin-requests', label: 'All Sourcing Requests' },
    { id: 'admin-users', label: 'User & Role Management' },
    { id: 'admin-audit', label: 'Security Audit Logs' },
  ];

  return (
    <nav className={`admin-nav ${className}`.trim()} aria-label="Administrator Management Navigation">
      <div className="admin-nav__badge">ADMINISTRATOR</div>
      <ul className="admin-nav__list">
        {adminLinks.map((link) => {
          const isActive = currentView === link.id;
          return (
            <li key={link.id}>
              <button
                type="button"
                className={`admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`}
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

export default AdminNav;
