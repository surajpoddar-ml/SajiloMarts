import { SecurityToken } from '../models/securityToken.model.js';
import { User } from '../models/user.model.js';
import { securityConfig } from '../config/security.js';
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
  const expiryMs = securityConfig?.tokens?.verificationExpiryMs || SECURITY_TOKEN_EXPIRY.EMAIL_VERIFICATION_MS;
  const expiresAt = new Date(Date.now() + expiryMs);

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

/**
 * Validates a submitted raw verification token, checks purpose, usage state, and expiration.
 *
 * @param {string} rawToken
 * @returns {Promise<{user: Object, tokenDoc: Object}>} Verified user and token record
 */
export const verifyEmailToken = async (rawToken) => {
  if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
    throw new BadRequestError('Verification token is required');
  }

  const tokenHash = hashSecurityToken(rawToken.trim());
  const tokenDoc = await SecurityToken.findOne({ tokenHash });

  if (!tokenDoc) {
    throw new BadRequestError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN);
  }

  // Enforce purpose separation
  if (tokenDoc.purpose !== SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION) {
    throw new BadRequestError(AUTH_ERRORS.TOKEN_PURPOSE_MISMATCH);
  }

  // Enforce single-use
  if (tokenDoc.isUsed) {
    throw new BadRequestError(AUTH_ERRORS.TOKEN_ALREADY_USED);
  }

  // Enforce expiration
  if (tokenDoc.expiresAt < new Date()) {
    throw new BadRequestError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN);
  }

  // Retrieve associated user
  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new NotFoundError('Associated customer account not found');
  }

  return { user, tokenDoc };
};

/**
 * Safely marks customer account email verified and invalidates the consumed credential.
 *
 * @param {string} rawToken
 * @returns {Promise<{user: Object, alreadyVerified: boolean}>}
 */
export const verifyCustomerEmail = async (rawToken) => {
  const { user, tokenDoc } = await verifyEmailToken(rawToken);

  // Invalidate token atomically to prevent replay
  tokenDoc.isUsed = true;
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  const alreadyVerified = Boolean(user.isEmailVerified);
  if (!alreadyVerified) {
    user.isEmailVerified = true;
    await user.save();
  }

  return { user, tokenDoc, alreadyVerified };
};

/**
 * Resends a verification token to the specified user or email address.
 *
 * @param {Object} params
 * @param {string} [params.email]
 * @param {string} [params.userId]
 * @param {Object} [params.metadata]
 * @returns {Promise<{dispatched: boolean, user: Object|null, rawToken: string|null, expiresAt: Date|null}>}
 */
export const resendVerificationToken = async ({ email, userId, metadata = {} }) => {
  let user = null;

  if (userId) {
    user = await User.findById(userId);
  } else if (email && typeof email === 'string') {
    const normalized = email.trim().toLowerCase();
    user = await User.findOne({ email: normalized });
  }

  // If user does not exist or is already verified, return safely
  if (!user) {
    return { dispatched: false, user: null, rawToken: null, expiresAt: null };
  }

  if (user.isEmailVerified) {
    return { dispatched: false, user, rawToken: null, expiresAt: null, alreadyVerified: true };
  }

  // 1. Cooldown protection: Check if an active token was issued recently (< 60s)
  const recentToken = await SecurityToken.findOne({
    userId: user._id,
    purpose: SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
  });

  if (recentToken) {
    // Return gracefully within cooldown window without generating redundant credentials
    return { dispatched: false, user, rawToken: null, expiresAt: recentToken.expiresAt, inCooldown: true };
  }

  const { rawToken, expiresAt } = await issueVerificationToken(user._id, metadata);
  return { dispatched: true, user, rawToken, expiresAt, alreadyVerified: false };
};

/**
 * Initiates password recovery flow for a customer account.
 * Mitigates account enumeration by ensuring safe, consistent return values.
 *
 * @param {string} email
 * @param {Object} [metadata={}]
 * @returns {Promise<{initiated: boolean, user: Object|null, rawToken: string|null, expiresAt: Date|null}>}
 */
export const requestPasswordReset = async (email, metadata = {}) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new BadRequestError('Email address is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.isActive) {
    return { initiated: false, user: null, rawToken: null, expiresAt: null };
  }

  // Next steps will generate and persist the secure token pair
  return { initiated: true, user, rawToken: null, expiresAt: null };
};

export default {
  issueVerificationToken,
  verifyEmailToken,
  verifyCustomerEmail,
  resendVerificationToken,
  requestPasswordReset,
};
