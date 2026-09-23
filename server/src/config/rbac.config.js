/**
 * SajiloMarts RBAC & Authorization Configuration
 * Defines core security boundaries, role enforcement rules, and administrative policy.
 */
export const RBAC_CONFIG = {
  STRICT_ROLE_CHECK: true,
  ALLOW_ROLE_OVERRIDE_VIA_CLIENT: false,
  DEFAULT_CUSTOMER_ROLE: 'customer',
  ADMIN_ROLE: 'admin',
  OWNERSHIP_KEY: 'userId',
  AUDIT_AUTHORIZATION_FAILURES: true,
};

export default RBAC_CONFIG;
