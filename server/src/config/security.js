import { envConfig } from './environment.js';

const DEFAULT_JWT_SECRET = 'sastomarts_dev_jwt_secret_key_minimum_32_characters_long!';

export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '7d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    cookieMaxAgeMs: parseInt(process.env.AUTH_COOKIE_MAX_AGE_MS, 10) || 7 * 24 * 60 * 60 * 1000,
  },
  tokens: {
    verificationExpiryHours: parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS, 10) || 24,
    verificationExpiryMs: (parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS, 10) || 24) * 60 * 60 * 1000,
    passwordResetExpiryMinutes: parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES, 10) || 60,
    passwordResetExpiryMs: (parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES, 10) || 60) * 60 * 1000,
  },
  bcryptRounds: 12,
  rateLimitEnabled: true,
  isSecureJwtConfigured: () => {
    const activeSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
    return Boolean(activeSecret) && activeSecret.length >= 32;
  },
};

export default securityConfig;
