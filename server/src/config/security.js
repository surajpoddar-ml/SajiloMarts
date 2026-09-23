import { envConfig } from './environment.js';

const INSECURE_DEFAULT_SECRET = 'dev_jwt_secret_do_not_use_in_production';

export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || INSECURE_DEFAULT_SECRET,
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
    if (envConfig.isProduction) {
      return (
        Boolean(process.env.JWT_SECRET) &&
        process.env.JWT_SECRET !== INSECURE_DEFAULT_SECRET &&
        process.env.JWT_SECRET.length >= 32
      );
    }
    return true;
  },
};

export default securityConfig;
