import React from 'react';

/**
 * Reusable Section Component
 * Sizes: sm, md (default), lg
 */
export const Section = ({
  size = 'md',
  children,
  className = '',
  as: Component = 'section',
  style,
  ...props
}) => {
  const sizeClass = size === 'md' ? 'layout-section' : `layout-section layout-section--${size}`;

  return (
    <Component
      className={`${sizeClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Section;
