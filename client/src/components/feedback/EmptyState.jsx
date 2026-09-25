import React from 'react';
import { Button } from '../common/Button.jsx';

/**
 * SajiloMarts Accessible Empty State Component
 */
export const EmptyState = ({
  title = 'No items found',
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
  children,
}) => {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {children}
      {actionLabel && onAction && (
        <div className="empty-state__action">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
