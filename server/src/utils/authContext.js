import { UnauthorizedError } from './unauthorizedError.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';

/**
 * Safely extracts the authenticated user ID from the request context.
 * Never trusts client body, query, or parameter user IDs for authentication identity.
 *
 * @param {import('express').Request} req
 * @returns {string} Authenticated user ID
 * @throws {UnauthorizedError}
 */
export const getAuthUserId = (req) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }
  return req.user.id;
};

/**
 * Safely extracts the authenticated user context object.
 *
 * @param {import('express').Request} req
 * @returns {Object} Safe authenticated user profile
 * @throws {UnauthorizedError}
 */
export const getAuthUser = (req) => {
  if (!req.user) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }
  return req.user;
};

export default {
  getAuthUserId,
  getAuthUser,
};
