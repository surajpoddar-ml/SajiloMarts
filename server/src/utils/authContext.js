import { UnauthorizedError } from './unauthorizedError.js';
import { ForbiddenError } from './forbiddenError.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';
import { USER_ROLES, isAdminRole, isCustomerRole } from '../constants/roles.js';

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

/**
 * Safely extracts the authoritative role of the authenticated user.
 *
 * @param {import('express').Request} req
 * @returns {string} User role
 * @throws {UnauthorizedError}
 */
export const getAuthUserRole = (req) => {
  const user = getAuthUser(req);
  return user.role || req.userRole || USER_ROLES.CUSTOMER;
};

/**
 * Checks whether the request is made by an active authenticated administrator.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export const isAdmin = (req) => {
  if (!req.user) return false;
  return isAdminRole(req.user.role || req.userRole);
};

/**
 * Checks whether the request is made by an active authenticated customer.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export const isCustomer = (req) => {
  if (!req.user) return false;
  return isCustomerRole(req.user.role || req.userRole);
};

/**
 * Checks whether the authenticated user has verified their email address.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export const isEmailVerified = (req) => {
  if (!req.user) return false;
  return Boolean(req.user.isEmailVerified);
};

/**
 * Asserts that the request has an active authenticated user.
 *
 * @param {import('express').Request} req
 * @throws {UnauthorizedError}
 */
export const assertAuthenticated = (req) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }
  if (req.user.isActive === false) {
    throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
  }
};

/**
 * Asserts that the authenticated requester holds administrative privileges.
 *
 * @param {import('express').Request} req
 * @throws {UnauthorizedError|ForbiddenError}
 */
export const assertAdmin = (req) => {
  assertAuthenticated(req);
  if (!isAdmin(req)) {
    throw new ForbiddenError('Administrative privileges required');
  }
};

/**
 * Asserts that the authenticated requester holds customer privileges.
 *
 * @param {import('express').Request} req
 * @throws {UnauthorizedError|ForbiddenError}
 */
export const assertCustomer = (req) => {
  assertAuthenticated(req);
  if (!isCustomer(req)) {
    throw new ForbiddenError('Customer privileges required');
  }
};

export default {
  getAuthUserId,
  getAuthUser,
  getAuthUserRole,
  isAdmin,
  isCustomer,
  isEmailVerified,
  assertAuthenticated,
  assertAdmin,
  assertCustomer,
};
