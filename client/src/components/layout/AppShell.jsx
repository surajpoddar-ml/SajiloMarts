import React from 'react';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

/**
 * SastoMarts Global Application Shell
 * Provides consistent layout across public, customer, and admin screens.
 */
export const AppShell = ({
  headerProps = {},
  footerProps = {},
  children,
  className = '',
}) => {
  return (
    <div className={`app-shell ${className}`.trim()}>
      <a href="#main-content" className="app-shell__skip-link">
        Skip to main content
      </a>
      <Header {...headerProps} />
      <main id="main-content" className="app-shell__main">
        {children}
      </main>
      <Footer {...footerProps} />
    </div>
  );
};

export default AppShell;
