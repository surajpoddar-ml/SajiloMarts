export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_do_not_use_in_production',
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },
  bcryptRounds: 10,
  rateLimitEnabled: process.env.NODE_ENV === 'production',
};
