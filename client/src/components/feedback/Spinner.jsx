import React from 'react';

/**
 * SastoMarts Accessible Spinner Component
 */
export const Spinner = ({
  size = 'md',
  label = 'Loading...',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`spinner spinner--${size} ${className}`.trim()}
      role="status"
      aria-label={label}
      {...props}
    >
      <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {label}
      </span>
    </div>
  );
};

export const PageLoader = ({ message = 'Loading SastoMarts...' }) => (
  <div className="page-loader" role="status" aria-live="polite">
    <Spinner size="lg" label={message} />
    <span>{message}</span>
  </div>
);

export default Spinner;
