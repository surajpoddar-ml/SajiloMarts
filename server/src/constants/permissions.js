import { USER_ROLES } from './roles.js';

/**
 * SajiloMarts Centralized Application Permissions
 */
export const PERMISSIONS = {
  // Customer Self-Service Permissions
  CUSTOMER_PROFILE_READ: 'customer.profile.read',
  CUSTOMER_PROFILE_UPDATE: 'customer.profile.update',
  CUSTOMER_ADDRESS_READ: 'customer.address.read',
  CUSTOMER_ADDRESS_CREATE: 'customer.address.create',
  CUSTOMER_ADDRESS_UPDATE: 'customer.address.update',
  CUSTOMER_ADDRESS_DELETE: 'customer.address.delete',
  CUSTOMER_REQUEST_READ_OWN: 'customer.request.read.own',
  CUSTOMER_REQUEST_CREATE: 'customer.request.create',
  CUSTOMER_REQUEST_UPDATE_OWN: 'customer.request.update.own',

  // Administrative Operational Permissions
  ADMIN_CUSTOMER_READ: 'admin.customer.read',
  ADMIN_CUSTOMER_UPDATE: 'admin.customer.update',
  ADMIN_REQUEST_READ: 'admin.request.read',
  ADMIN_REQUEST_UPDATE: 'admin.request.update',
  ADMIN_PAYMENT_REVIEW: 'admin.payment.review',
};

/**
 * Authoritative mapping of roles to granted permissions.
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.CUSTOMER]: [
    PERMISSIONS.CUSTOMER_PROFILE_READ,
    PERMISSIONS.CUSTOMER_PROFILE_UPDATE,
    PERMISSIONS.CUSTOMER_ADDRESS_READ,
    PERMISSIONS.CUSTOMER_ADDRESS_CREATE,
    PERMISSIONS.CUSTOMER_ADDRESS_UPDATE,
    PERMISSIONS.CUSTOMER_ADDRESS_DELETE,
    PERMISSIONS.CUSTOMER_REQUEST_READ_OWN,
    PERMISSIONS.CUSTOMER_REQUEST_CREATE,
    PERMISSIONS.CUSTOMER_REQUEST_UPDATE_OWN,
  ],
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
};

/**
 * Checks if a specific role possesses a granted permission.
 * @param {string} role - User role
 * @param {string} permission - Target permission
 * @returns {boolean} True if granted
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const granted = ROLE_PERMISSIONS[role.toLowerCase()];
  if (!granted) return false;
  return granted.includes(permission);
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
};
