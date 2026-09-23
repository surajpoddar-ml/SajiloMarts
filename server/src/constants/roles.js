/**
 * Centralized Account Roles Definition
 * Authoritative role constants for SajiloMarts backend and authorization layers.
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const DEFAULT_ROLE = USER_ROLES.CUSTOMER;

export const ALL_ROLES = Object.freeze(Object.values(USER_ROLES));

/**
 * Validates whether a provided role string is a valid supported account role.
 * @param {string} role - Role candidate
 * @returns {boolean} True if supported, false otherwise
 */
export const isValidRole = (role) => typeof role === 'string' && ALL_ROLES.includes(role.trim().toLowerCase());

/**
 * Checks if a role represents an administrator.
 * @param {string} role
 * @returns {boolean}
 */
export const isAdminRole = (role) => role === USER_ROLES.ADMIN;

/**
 * Checks if a role represents a customer.
 * @param {string} role
 * @returns {boolean}
 */
export const isCustomerRole = (role) => role === USER_ROLES.CUSTOMER;

export default {
  USER_ROLES,
  DEFAULT_ROLE,
  ALL_ROLES,
  isValidRole,
  isAdminRole,
  isCustomerRole,
};
