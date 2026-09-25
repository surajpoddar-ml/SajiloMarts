/**
 * SastoMarts Visual Design System Tokens
 * Defines foundational values for color, typography, spacing, radius, and shadows.
 */
export const DESIGN_TOKENS = {
  colors: {
    // Warm neutral backgrounds
    background: {
      page: '#FAF8F5',
      surface: '#FFFFFF',
      surfaceSecondary: '#F4F1EA',
      surfaceTertiary: '#ECE8DE',
      surfaceSubtle: '#F7F5F0',
    },
    // Typography contrast levels
    text: {
      primary: '#1C1917',
      secondary: '#57534E',
      muted: '#78716C',
      subtle: '#A8A29E',
      inverse: '#FFFFFF',
    },
    // Restrained borders
    border: {
      subtle: '#E7E3DC',
      default: '#DCD6CC',
      strong: '#BCB4A6',
      focus: '#B83A20',
    },
    // Brand Accent (Himalayan Warm Brick / Carmine)
    brand: {
      primary: '#B83A20',
      hover: '#A03119',
      active: '#8B2A15',
      subtle: '#FDF4F2',
      border: '#F3D2CB',
    },
    // Status feedback tokens
    status: {
      success: '#15803D',
      successBg: '#F0FDF4',
      successBorder: '#BBF7D0',
      warning: '#B45309',
      warningBg: '#FFFBEB',
      warningBorder: '#FDE68A',
      error: '#B91C1C',
      errorBg: '#FEF2F2',
      errorBorder: '#FECACA',
      info: '#1D4ED8',
      infoBg: '#EFF6FF',
      infoBorder: '#BFDBFE',
    },
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    subtle: '0 1px 2px rgba(0, 0, 0, 0.04)',
    card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    dropdown: '0 4px 12px rgba(0, 0, 0, 0.08)',
    modal: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
};
