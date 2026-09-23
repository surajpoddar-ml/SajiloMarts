import { envConfig } from '../config/environment.js';
import { securityConfig } from '../config/security.js';
import { AUTH_COOKIE_NAME } from '../constants/auth.constants.js';

/**
 * Returns standard cookie configuration for secure HTTP-only sessions.
 *
 * Security configurations applied:
 * - httpOnly: true (prevents client-side XSS script access to session tokens)
 * - secure: true in production (enforces HTTPS transport)
 * - sameSite: 'none' in production (for cross-origin frontend-backend deployments over HTTPS)
 *   or 'lax' in local development (provides CSRF protection for same-site requests)
 * - path: '/' (ensures uniform authorization scope)
 * - maxAge: configured lifetime in milliseconds
 *
 * @param {number} [maxAgeMs] - Cookie lifetime in milliseconds (defaults to securityConfig)
 * @returns {import('express').CookieOptions}
 */
export const getAuthCookieOptions = (maxAgeMs = securityConfig.jwt.cookieMaxAgeMs) => {
  return {
    httpOnly: true,
    secure: envConfig.isProduction,
    sameSite: envConfig.isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
};

/**
 * Sets secure HTTP-only authentication cookie on the response.
 *
 * @param {import('express').Response} res
 * @param {string} token - Signed authentication token
 * @param {number} [maxAgeMs]
 */
export const setAuthCookie = (res, token, maxAgeMs) => {
  const options = getAuthCookieOptions(maxAgeMs);
  res.cookie(AUTH_COOKIE_NAME, token, options);
};

/**
 * Clears the secure authentication cookie from the response.
 *
 * @param {import('express').Response} res
 */
export const clearAuthCookie = (res) => {
  const options = {
    httpOnly: true,
    secure: envConfig.isProduction,
    sameSite: envConfig.isProduction ? 'none' : 'lax',
    path: '/',
  };
  res.clearCookie(AUTH_COOKIE_NAME, options);
};

export default {
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
