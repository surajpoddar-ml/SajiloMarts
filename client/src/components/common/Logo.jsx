import React from 'react';
import logoImage from '../../assets/logo.jpg';

/**
 * Official SajiloMarts Logo Component
 * Incorporates the official brand logo asset with high-fidelity rendering.
 */
export const Logo = ({
  size = 'md',
  className = '',
  showTagline = false,
  showText = true,
  style = {},
  onClick,
}) => {
  const sizeMap = {
    sm: { height: '32px', maxHeight: '32px', fontSize: '0.88rem', taglineSize: '0.52rem' },
    md: { height: '42px', maxHeight: '42px', fontSize: '1.02rem', taglineSize: '0.58rem' },
    lg: { height: '54px', maxHeight: '54px', fontSize: '1.22rem', taglineSize: '0.62rem' },
    xl: { height: '68px', maxHeight: '68px', fontSize: '1.44rem', taglineSize: '0.68rem' },
    footer: { height: '46px', maxHeight: '46px', fontSize: '1.05rem', taglineSize: '0.58rem' },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div
      className={`sajilomarts-logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src={logoImage}
        alt="SajiloMarts - Shop from India. We Deliver to Nepal."
        className="sajilomarts-logo-img"
        style={{
          height: selectedSize.height,
          maxHeight: selectedSize.maxHeight,
          width: 'auto',
          objectFit: 'contain',
          borderRadius: '6px',
          display: 'block',
        }}
        loading="eager"
      />
      {showText && (
        <div
          className="sajilomarts-logo-text-col"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'left',
          }}
        >
          <span
            className="sajilomarts-logo-brand-text"
            style={{
              fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
              fontWeight: 700,
              fontSize: selectedSize.fontSize,
              letterSpacing: '0.015em',
              lineHeight: 1.05,
              color: '#C58A38',
              display: 'inline-block',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 1px rgba(0,0,0,0.05)',
            }}
          >
            SajiloMarts
          </span>
          {showTagline && (
            <span
              className="sajilomarts-logo-tagline"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: selectedSize.taglineSize,
                color: '#8B6528',
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                marginTop: '2px',
                fontStyle: 'italic',
                whiteSpace: 'nowrap',
              }}
            >
              Shop Easy Live Better
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="sajilomarts-logo-button"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
        }}
        aria-label="SajiloMarts Home"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default Logo;
