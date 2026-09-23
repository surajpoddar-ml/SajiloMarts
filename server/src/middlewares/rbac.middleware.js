import { ForbiddenError, UnauthorizedError } from '../utils/index.js';
import { USER_ROLES, isValidRole } from '../constants/roles.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';

/**
 * Middleware factory that enforces specific role access.
 * Rejects unauthenticated requests, inactive accounts, and unpermitted roles.
 *
 * @param  {...string} allowedRoles - List of permitted roles
 * @returns {import('express').RequestHandler}
 */
export const requireRole = (...allowedRoles) => {
  const flattenedRoles = allowedRoles.flat().map((r) => String(r).toLowerCase());

  // Validate that guards configure valid system roles
  flattenedRoles.forEach((role) => {
    if (!isValidRole(role)) {
      throw new Error(`Invalid role '${role}' configured in authorization guard`);
    }
  });

  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
    }

    if (req.user.isActive === false) {
      throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
    }

    const userRole = req.user.role || req.userRole;
    if (!userRole || !flattenedRoles.includes(userRole.toLowerCase())) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Admin-only authorization guard.
 * Rejects unauthenticated, inactive, or non-admin callers.
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Reusable alias for requiring any of a set of roles.
 */
export const requireAnyRole = (...roles) => requireRole(...roles);

export default {
  requireRole,
  requireAdmin,
  requireAnyRole,
};
