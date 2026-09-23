import mongoose from 'mongoose';
import { ForbiddenError, NotFoundError, UnauthorizedError, BadRequestError } from './index.js';
import { isAdmin } from './authContext.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';

/**
 * Validates that an ID is a valid MongoDB ObjectId.
 * @param {string} id
 * @param {string} label
 */
export const validateObjectId = (id, label = 'Resource ID') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ${label} format`);
  }
};

/**
 * Resolves the owner ID string from a document or object.
 * Handles both `userId`, `user`, populated user objects, and direct string IDs.
 *
 * @param {object} resource
 * @param {string} ownerField
 * @returns {string|null}
 */
export const extractOwnerId = (resource, ownerField = 'userId') => {
  if (!resource) return null;

  let ownerVal = resource[ownerField];
  if (ownerVal === undefined && ownerField === 'userId' && resource.user !== undefined) {
    ownerVal = resource.user;
  }

  if (!ownerVal) return null;

  if (typeof ownerVal === 'object') {
    if (ownerVal._id) return ownerVal._id.toString();
    if (ownerVal.id) return ownerVal.id.toString();
    if (typeof ownerVal.toString === 'function') return ownerVal.toString();
  }

  return String(ownerVal);
};

/**
 * Checks whether the authenticated user ID owns the resource.
 *
 * @param {object} resource
 * @param {string} authenticatedUserId
 * @param {string} [ownerField='userId']
 * @returns {boolean}
 */
export const isResourceOwner = (resource, authenticatedUserId, ownerField = 'userId') => {
  if (!resource || !authenticatedUserId) return false;
  const resourceOwnerId = extractOwnerId(resource, ownerField);
  if (!resourceOwnerId) return false;
  return resourceOwnerId.toString() === authenticatedUserId.toString();
};

/**
 * Asserts that the resource exists and belongs to the authenticated customer.
 *
 * @param {object} resource
 * @param {string} authenticatedUserId
 * @param {string} [resourceName='Resource']
 * @param {string} [ownerField='userId']
 * @throws {NotFoundError|UnauthorizedError|ForbiddenError}
 */
export const assertResourceOwnership = (
  resource,
  authenticatedUserId,
  resourceName = 'Resource',
  ownerField = 'userId'
) => {
  if (!resource) {
    throw new NotFoundError(`${resourceName} not found`);
  }

  if (!authenticatedUserId) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }

  if (!isResourceOwner(resource, authenticatedUserId, ownerField)) {
    throw new ForbiddenError(`You do not have permission to access this ${resourceName.toLowerCase()}`);
  }
};

/**
 * Asserts that the caller is either the owner of the resource or an administrator.
 *
 * @param {object} resource
 * @param {import('express').Request} req
 * @param {string} [resourceName='Resource']
 * @param {string} [ownerField='userId']
 * @throws {NotFoundError|UnauthorizedError|ForbiddenError}
 */
export const assertOwnerOrAdmin = (
  resource,
  req,
  resourceName = 'Resource',
  ownerField = 'userId'
) => {
  if (!resource) {
    throw new NotFoundError(`${resourceName} not found`);
  }

  if (!req || !req.user || !req.user.id) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }

  if (isAdmin(req)) {
    return;
  }

  assertResourceOwnership(resource, req.user.id, resourceName, ownerField);
};

export default {
  validateObjectId,
  extractOwnerId,
  isResourceOwner,
  assertResourceOwnership,
  assertOwnerOrAdmin,
};
