import React from 'react';

/**
 * SajiloMarts Accessible Skeleton Component
 */
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  className = '',
  style,
  ...props
}) => {
  const variantClass = variant ? `skeleton-${variant}` : '';

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
};

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`.trim()} aria-hidden="true">
    <Skeleton height="1.5rem" width="50%" variant="title" />
    <Skeleton height="1rem" width="90%" />
    <Skeleton height="1rem" width="75%" />
    <Skeleton height="2.25rem" width="30%" style={{ marginTop: '0.75rem' }} />
  </div>
);

export default Skeleton;
