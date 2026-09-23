/**
 * SajiloMarts Account Security & Authentication Constants
 *
 * Enforces token lifecycle boundaries, security purposes isolation,
 * uniform error responses, and audit event categories across server modules.
 */

export const AUTH_COOKIE_NAME = 'sajilomarts_auth_token';
export const AUTH_HEADER_PREFIX = 'Bearer ';

export const AUTH_TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  SESSION: 'session',
};

export const SECURITY_TOKEN_PURPOSES = {
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

export const SECURITY_TOKEN_EXPIRY = {
  EMAIL_VERIFICATION_HOURS: 24,
  EMAIL_VERIFICATION_MS: 24 * 60 * 60 * 1000,
  PASSWORD_RESET_MINUTES: 60,
  PASSWORD_RESET_MS: 60 * 60 * 1000,
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact customer support.',
  UNAUTHENTICATED: 'Authentication required to access this resource',
  INVALID_TOKEN: 'Invalid or expired authentication session',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  EMAIL_ALREADY_EXISTS: 'An account with this email address already exists',
  INVALID_OR_EXPIRED_TOKEN: 'The security verification or reset link is invalid or has expired',
  TOKEN_ALREADY_USED: 'This security link has already been used',
  TOKEN_PURPOSE_MISMATCH: 'Security credential is not valid for the requested operation',
  CURRENT_PASSWORD_INCORRECT: 'The current password you provided is incorrect',
  SAME_AS_CURRENT_PASSWORD: 'New password cannot be identical to your current password',
};

export const AUTH_EVENTS = {
  REGISTER_SUCCESS: 'auth:register_success',
  LOGIN_SUCCESS: 'auth:login_success',
  LOGOUT_SUCCESS: 'auth:logout_success',
  TOKEN_REFRESH: 'auth:token_refresh',
  EMAIL_VERIFICATION_REQUESTED: 'auth:email_verification_requested',
  EMAIL_VERIFIED: 'auth:email_verified',
  PASSWORD_RESET_REQUESTED: 'auth:password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'auth:password_reset_completed',
  PASSWORD_CHANGED: 'auth:password_changed',
  PASSWORD_CHANGE_FAILED: 'auth:password_change_failed',
};

export default {
  AUTH_COOKIE_NAME,
  AUTH_HEADER_PREFIX,
  AUTH_TOKEN_TYPES,
  SECURITY_TOKEN_PURPOSES,
  SECURITY_TOKEN_EXPIRY,
  AUTH_ERRORS,
  AUTH_EVENTS,
};
