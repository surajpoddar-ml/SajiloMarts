import { ForbiddenError, UnauthorizedError } from '../utils/index.js';
import { USER_ROLES, isValidRole } from '../constants/roles.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';
import { hasPermission } from '../constants/permissions.js';

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
 * Customer-only authorization guard.
 * Rejects unauthenticated, inactive, or non-customer callers.
 */
export const requireCustomer = requireRole(USER_ROLES.CUSTOMER);

/**
 * Reusable alias for requiring any of a set of roles.
 */
export const requireAnyRole = (...roles) => requireRole(...roles);

/**
 * Enforces deny-by-default permission check.
 * If user lacks the specified permission, denies access with ForbiddenError.
 *
 * @param {string} permission - System permission key
 * @returns {import('express').RequestHandler}
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
    }

    if (req.user.isActive === false) {
      throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
    }

    const userRole = req.user.role || req.userRole;
    if (!userRole || !hasPermission(userRole, permission)) {
      throw new ForbiddenError('You do not have permission to perform this operation');
    }

    next();
  };
};

/**
 * Middleware ensuring authenticated user has an active account status.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireActiveAccount = (req, res, next) => {
  if (!req.user || !req.user.id) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }

  if (req.user.isActive === false) {
    throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
  }

  next();
};

export default {
  requireRole,
  requireAdmin,
  requireCustomer,
  requireAnyRole,
  requirePermission,
  requireActiveAccount,
};
