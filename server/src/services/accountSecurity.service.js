import { SecurityToken } from '../models/securityToken.model.js';
import { User } from '../models/user.model.js';
import {
  SECURITY_TOKEN_PURPOSES,
  SECURITY_TOKEN_EXPIRY,
  AUTH_ERRORS,
} from '../constants/auth.constants.js';
import {
  generateSecurityTokenPair,
  hashSecurityToken,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/index.js';

/**
 * Creates and persists a cryptographically secure verification token for a customer.
 * Automatically invalidates any existing active verification tokens for this user.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {Object} [metadata={}]
 * @returns {Promise<{rawToken: string, expiresAt: Date}>}
 */
export const issueVerificationToken = async (userId, metadata = {}) => {
  if (!userId) {
    throw new BadRequestError('User ID is required to issue verification token');
  }

  // 1. Invalidate any existing active verification tokens for this customer
  await SecurityToken.updateMany(
    {
      userId,
      purpose: SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION,
      isUsed: false,
    },
    {
      $set: {
        isUsed: true,
        usedAt: new Date(),
      },
    }
  );

  // 2. Generate secure token pair
  const { rawToken, tokenHash } = generateSecurityTokenPair(32);
  const expiresAt = new Date(Date.now() + SECURITY_TOKEN_EXPIRY.EMAIL_VERIFICATION_MS);

  // 3. Persist hashed token record
  await SecurityToken.create({
    userId,
    tokenHash,
    purpose: SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION,
    expiresAt,
    isUsed: false,
    metadata: {
      ip: metadata.ip || null,
      userAgent: metadata.userAgent || null,
    },
  });

  return { rawToken, expiresAt };
};

export default {
  issueVerificationToken,
};
