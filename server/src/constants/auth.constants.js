export const AUTH_COOKIE_NAME = 'sajilomarts_auth_token';
export const AUTH_HEADER_PREFIX = 'Bearer ';

export const AUTH_TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  SESSION: 'session',
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact customer support.',
  UNAUTHENTICATED: 'Authentication required to access this resource',
  INVALID_TOKEN: 'Invalid or expired authentication session',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  EMAIL_ALREADY_EXISTS: 'An account with this email address already exists',
};
