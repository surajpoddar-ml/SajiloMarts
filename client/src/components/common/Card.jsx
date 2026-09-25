import React from 'react';

/**
 * SastoMarts Reusable Card & Surface Component
 */
export const Card = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  onClick,
  style,
  ...props
}) => {
  const cardClasses = [
    'card',
    variant !== 'default' ? `card--${variant}` : '',
    interactive ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={style}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, description, action, className = '' }) => (
  <div className={`card-header ${className}`.trim()}>
    <div>
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`.trim()}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`.trim()}>{children}</div>
);

export default Card;
