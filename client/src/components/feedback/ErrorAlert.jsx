import React from 'react';

/**
 * SastoMarts Accessible Error Alert Component
 */
export const ErrorAlert = ({
  title,
  message,
  children,
  onDismiss,
  className = '',
}) => {
  const displayMessage = message || children;

  if (!displayMessage && !title) return null;

  return (
    <div className={`error-alert ${className}`.trim()} role="alert">
      <div className="error-alert__content">
        {title && <div className="error-alert__title">{title}</div>}
        {displayMessage && <div>{displayMessage}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'currentColor' }}
          aria-label="Dismiss error"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
