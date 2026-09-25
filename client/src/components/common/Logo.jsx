import React from 'react';
import logoImage from '../../assets/logo.jpg';

/**
 * Official SastoMarts Logo Component
 * Incorporates the official brand logo asset with high-fidelity rendering.
 */
export const Logo = ({
  size = 'md',
  className = '',
  showTagline = false,
  style = {},
  onClick,
}) => {
  const sizeMap = {
    sm: { height: '32px', maxHeight: '32px' },
    md: { height: '44px', maxHeight: '44px' },
    lg: { height: '56px', maxHeight: '56px' },
    xl: { height: '72px', maxHeight: '72px' },
    footer: { height: '52px', maxHeight: '52px' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`sastomarts-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src={logoImage}
        alt="SastoMarts - Shop from India. We Deliver to Nepal."
        className="sastomarts-logo-img"
        style={{
          height: selectedSize.height,
          maxHeight: selectedSize.maxHeight,
          width: 'auto',
          objectFit: 'contain',
          borderRadius: '4px',
          display: 'block',
        }}
        loading="eager"
      />
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="sastomarts-logo-button"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
        }}
        aria-label="SastoMarts Home"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default Logo;
