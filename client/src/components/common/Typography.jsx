import React from 'react';

/**
 * SastoMarts Typography Component
 * Encapsulates standard typographic hierarchy for the application.
 */
export const Typography = ({
  variant = 'body',
  as,
  children,
  className = '',
  style,
  ...props
}) => {
  const defaultElements = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    small: 'p',
    label: 'span',
    caption: 'span',
    button: 'span',
    navigation: 'span',
  };

  const Component = as || defaultElements[variant] || 'p';
  const variantClass = `text-${variant}`;

  return (
    <Component
      className={`${variantClass} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
