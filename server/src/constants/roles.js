export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  VENDOR: 'vendor',
  SOURCING_AGENT: 'sourcing_agent',
};

export const ALL_ROLES = Object.values(USER_ROLES);

export const isValidRole = (role) => ALL_ROLES.includes(role);
