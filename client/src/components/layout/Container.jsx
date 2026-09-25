import React from 'react';

/**
 * Reusable Container Component
 * Sizes: narrow (680px), medium (960px), wide (1200px), full (100%)
 */
export const Container = ({
  size = 'wide',
  children,
  className = '',
  as: Component = 'div',
  style,
  ...props
}) => {
  return (
    <Component
      className={`layout-container layout-container--${size} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
