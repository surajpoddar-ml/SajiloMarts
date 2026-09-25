import React from 'react';
import { Container } from './Container.jsx';

/**
 * SastoMarts Reusable Page Header
 */
export const PageHeader = ({
  title,
  description,
  badge,
  actions,
  backLabel,
  onBack,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`page-header ${className}`.trim()}>
      <Container size="wide">
        <div className="page-header__inner">
          <div className="page-header__meta">
            {onBack && backLabel && (
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="page-header__back-btn"
                  onClick={onBack}
                >
                  &larr; {backLabel}
                </button>
              </div>
            )}
            {breadcrumbs && (
              <div className="page-header__breadcrumbs" aria-label="Breadcrumb">
                {breadcrumbs}
              </div>
            )}
            <div className="page-header__title-row">
              <h1 className="page-header__title">{title}</h1>
              {badge && <div>{badge}</div>}
            </div>
            {description && (
              <p className="page-header__description">{description}</p>
            )}
          </div>
          {actions && <div className="page-header__actions">{actions}</div>}
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;
