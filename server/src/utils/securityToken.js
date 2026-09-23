import crypto from 'node:crypto';

/**
 * Generates a cryptographically secure random hexadecimal token string.
 * Default 32 bytes (256 bits) gives 64 hex characters of entropy.
 *
 * @param {number} [bytes=32]
 * @returns {string} Raw hex token
 */
export const generateRawToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Computes a SHA-256 hash of the raw token for secure database storage.
 * Ensures the database never stores plaintext usable recovery or verification tokens.
 *
 * @param {string} rawToken
 * @returns {string} Hex SHA-256 digest
 */
export const hashSecurityToken = (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error('Raw security token string is required for hashing');
  }
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
};

/**
 * Generates a token pair: rawToken for transmission to user, and tokenHash for database persistence.
 *
 * @param {number} [bytes=32]
 * @returns {{rawToken: string, tokenHash: string}}
 */
export const generateSecurityTokenPair = (bytes = 32) => {
  const rawToken = generateRawToken(bytes);
  const tokenHash = hashSecurityToken(rawToken);
  return { rawToken, tokenHash };
};

export default {
  generateRawToken,
  hashSecurityToken,
  generateSecurityTokenPair,
};
