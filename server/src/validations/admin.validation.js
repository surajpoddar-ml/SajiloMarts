import { ValidationError } from '../utils/index.js';
import { USER_ROLES, isValidRole } from '../constants/roles.js';
import { sanitizeSecurityPayload } from './auth.validation.js';

const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

/**
 * Validates administrative customer account update payload.
 * Allows only authorized administrative modifications: isActive, isEmailVerified, role, name, phone.
 *
 * @param {object} data
 * @returns {object} Cleaned administrative payload
 * @throws {ValidationError}
 */
export const validateAdminUpdateUser = (data) => {
  sanitizeSecurityPayload(data, 'Admin update user payload');

  const errors = [];
  const { isActive, isEmailVerified, role, name, phone, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unauthorized administrative fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  if (role !== undefined && !isValidRole(role)) {
    errors.push({
      field: 'role',
      message: `Invalid role '${role}'. Supported roles are: ${Object.values(USER_ROLES).join(', ')}`,
    });
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'isActive must be a boolean' });
  }

  if (isEmailVerified !== undefined && typeof isEmailVerified !== 'boolean') {
    errors.push({ field: 'isEmailVerified', message: 'isEmailVerified must be a boolean' });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string') {
      errors.push({ field: 'phone', message: 'Phone must be a string' });
    } else {
      const cleaned = phone.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleaned)) {
        errors.push({ field: 'phone', message: 'Invalid phone number format' });
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for administrative user update', errors);
  }

  return {
    isActive,
    isEmailVerified,
    role: role !== undefined ? role.toLowerCase() : undefined,
    name: name !== undefined ? name.trim() : undefined,
    phone: phone !== undefined ? (phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null) : undefined,
  };
};

export default {
  validateAdminUpdateUser,
};
