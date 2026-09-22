import { envConfig } from '../config/environment.js';
import { AUTH_COOKIE_NAME } from '../constants/auth.constants.js';

/**
 * Returns standard cookie configuration for secure HTTP-only sessions.
 *
 * @param {number} [maxAgeMs] - Cookie lifetime in milliseconds (defaults to 7 days)
 * @returns {import('express').CookieOptions}
 */
export const getAuthCookieOptions = (maxAgeMs = 7 * 24 * 60 * 60 * 1000) => {
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
