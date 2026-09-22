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

export const AUTH_EVENTS = {
  REGISTER_SUCCESS: 'auth:register_success',
  LOGIN_SUCCESS: 'auth:login_success',
  LOGOUT_SUCCESS: 'auth:logout_success',
  TOKEN_REFRESH: 'auth:token_refresh',
};

export default {
  AUTH_COOKIE_NAME,
  AUTH_HEADER_PREFIX,
  AUTH_TOKEN_TYPES,
  AUTH_ERRORS,
  AUTH_EVENTS,
};
