import jwt from 'jsonwebtoken';
import { securityConfig } from '../config/security.js';

/**
 * Generates a signed JSON Web Token for an authenticated customer or admin.
 *
 * @param {Object} payload - User identity data { userId, role, email }
 * @param {string} [expiresIn] - Token expiration duration (defaults to securityConfig.jwt.accessExpiry)
 * @returns {string} Signed JWT token string
 */
export const signToken = (payload, expiresIn = securityConfig.jwt.accessExpiry) => {
  return jwt.sign(payload, securityConfig.jwt.secret, {
    expiresIn,
  });
};

/**
 * Verifies a signed JWT token.
 *
 * @param {string} token - Signed JWT token string
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, securityConfig.jwt.secret);
};

export default {
  signToken,
  verifyToken,
};
