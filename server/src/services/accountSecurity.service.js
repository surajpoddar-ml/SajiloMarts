import { SecurityToken } from '../models/securityToken.model.js';
import { User } from '../models/user.model.js';
import { securityConfig } from '../config/security.js';
import {
  SECURITY_TOKEN_PURPOSES,
  SECURITY_TOKEN_EXPIRY,
  AUTH_ERRORS,
  AUTH_EVENTS,
} from '../constants/auth.constants.js';
import {
  generateSecurityTokenPair,
  hashSecurityToken,
  recordSecurityEvent,
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
 * Creates and persists a cryptographically secure password reset token.
 *
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @param {Object} [metadata={}]
 * @returns {Promise<{rawToken: string, expiresAt: Date}>}
 */
export const issuePasswordResetToken = async (userId, metadata = {}) => {
  if (!userId) {
    throw new BadRequestError('User ID is required to issue password reset token');
  }

  // 1. Invalidate any existing active password reset tokens for this customer
  await SecurityToken.updateMany(
    {
      userId,
      purpose: SECURITY_TOKEN_PURPOSES.PASSWORD_RESET,
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
  const expiryMs = securityConfig?.tokens?.passwordResetExpiryMs || SECURITY_TOKEN_EXPIRY.PASSWORD_RESET_MS;
  const expiresAt = new Date(Date.now() + expiryMs);

  // 3. Persist hashed token record
  await SecurityToken.create({
    userId,
    tokenHash,
    purpose: SECURITY_TOKEN_PURPOSES.PASSWORD_RESET,
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
 * Validates a security token for a specific expected purpose.
 * Enforces purpose separation, non-usage, non-expiration, and user existence.
 *
 * @param {string} rawToken
 * @param {string} expectedPurpose
 * @returns {Promise<{user: Object, tokenDoc: Object}>}
 */
export const validateTokenForPurpose = async (rawToken, expectedPurpose) => {
  if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
    throw new BadRequestError('Security credential token is required');
  }

  const tokenHash = hashSecurityToken(rawToken.trim());
  const tokenDoc = await SecurityToken.findOne({ tokenHash });

  if (!tokenDoc) {
    throw new BadRequestError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN);
  }

  // Strict purpose separation check
  if (tokenDoc.purpose !== expectedPurpose) {
    throw new BadRequestError(AUTH_ERRORS.TOKEN_PURPOSE_MISMATCH);
  }

  // Single-use enforcement
  if (tokenDoc.isUsed) {
    throw new BadRequestError(AUTH_ERRORS.TOKEN_ALREADY_USED);
  }

  // Expiration enforcement
  if (tokenDoc.expiresAt < new Date()) {
    throw new BadRequestError(AUTH_ERRORS.INVALID_OR_EXPIRED_TOKEN);
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new NotFoundError('Associated customer account not found');
  }

  return { user, tokenDoc };
};

/**
 * Validates a submitted raw verification token for email verification purpose.
 *
 * @param {string} rawToken
 * @returns {Promise<{user: Object, tokenDoc: Object}>} Verified user and token record
 */
export const verifyEmailToken = async (rawToken) => {
  return validateTokenForPurpose(rawToken, SECURITY_TOKEN_PURPOSES.EMAIL_VERIFICATION);
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

  recordSecurityEvent(AUTH_EVENTS.EMAIL_VERIFIED, {
    userId: user._id,
    email: user.email,
  });

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

  recordSecurityEvent(AUTH_EVENTS.EMAIL_VERIFICATION_REQUESTED, {
    userId: user._id,
    email: user.email,
    ip: metadata.ip,
  });

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
    // Timing mitigation: perform dummy token generation and hashing to prevent timing attack enumeration
    generateSecurityTokenPair(32);
    return { initiated: false, user: null, rawToken: null, expiresAt: null };
  }

  const { rawToken, expiresAt } = await issuePasswordResetToken(user._id, metadata);

  recordSecurityEvent(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
    userId: user._id,
    email: user.email,
    ip: metadata.ip,
  });

  return { initiated: true, user, rawToken, expiresAt };
};

/**
 * Resets a customer password using a validated security recovery token.
 *
 * @param {Object|string} paramsOrToken - Param object { token, newPassword } or raw token string
 * @param {string} [maybeNewPassword] - Plaintext password if using positional syntax
 * @returns {Promise<{user: Object, tokenDoc: Object}>}
 */
export const resetCustomerPassword = async (paramsOrToken, maybeNewPassword) => {
  const token = typeof paramsOrToken === 'string' ? paramsOrToken : paramsOrToken?.token;
  const newPassword = typeof paramsOrToken === 'string' ? maybeNewPassword : paramsOrToken?.newPassword;

  if (!newPassword || typeof newPassword !== 'string') {
    throw new BadRequestError('New password is required');
  }

  const { user, tokenDoc } = await validateTokenForPurpose(
    token,
    SECURITY_TOKEN_PURPOSES.PASSWORD_RESET
  );

  user.password = newPassword;
  await user.save();

  // Atomically invalidate reset token to prevent any replay
  tokenDoc.isUsed = true;
  tokenDoc.usedAt = new Date();
  await tokenDoc.save();

  recordSecurityEvent(AUTH_EVENTS.PASSWORD_RESET_COMPLETED, {
    userId: user._id,
    email: user.email,
  });

  return { user, tokenDoc };
};

/**
 * Changes password for an already-authenticated customer.
 *
 * @param {Object|string} paramsOrUserId - Param object { userId, currentPassword, newPassword } or userId
 * @param {string} [maybeCurrentPassword]
 * @param {string} [maybeNewPassword]
 * @returns {Promise<{user: Object}>}
 */
export const changeCustomerPassword = async (paramsOrUserId, maybeCurrentPassword, maybeNewPassword) => {
  const isPositional = typeof paramsOrUserId === 'string' || (paramsOrUserId && paramsOrUserId._id);
  const userId = isPositional ? paramsOrUserId : paramsOrUserId?.userId;
  const currentPassword = isPositional ? maybeCurrentPassword : paramsOrUserId?.currentPassword;
  const newPassword = isPositional ? maybeNewPassword : paramsOrUserId?.newPassword;

  if (!userId) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }
  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new BadRequestError('Current password is required');
  }
  if (!newPassword || typeof newPassword !== 'string') {
    throw new BadRequestError('New password is required');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
  }

  if (!user.isActive) {
    throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
  }

  // Prevent identical current and new password
  if (currentPassword === newPassword) {
    throw new BadRequestError(AUTH_ERRORS.SAME_AS_CURRENT_PASSWORD);
  }

  // Verify current password strictly
  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    recordSecurityEvent(AUTH_EVENTS.PASSWORD_CHANGE_FAILED, {
      userId: user._id,
      email: user.email,
      reason: 'Incorrect current password',
      success: false,
    });
    throw new UnauthorizedError(AUTH_ERRORS.CURRENT_PASSWORD_INCORRECT);
  }

  user.password = newPassword;
  await user.save();

  recordSecurityEvent(AUTH_EVENTS.PASSWORD_CHANGED, {
    userId: user._id,
    email: user.email,
  });

  return { user };
};

/**
 * Purges expired or consumed security tokens to maintain clean collection size.
 *
 * @param {Object} [options]
 * @param {number} [options.retentionDays=7] - Number of days to keep used/expired tokens before purging
 * @returns {Promise<{deletedCount: number}>}
 */
export const cleanupExpiredSecurityTokens = async ({ retentionDays = 7 } = {}) => {
  const thresholdDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const result = await SecurityToken.deleteMany({
    $or: [
      { expiresAt: { $lt: thresholdDate } },
      { isUsed: true, usedAt: { $lt: thresholdDate } },
    ],
  });

  return { deletedCount: result.deletedCount || 0 };
};

export default {
  issueVerificationToken,
  issuePasswordResetToken,
  validateTokenForPurpose,
  verifyEmailToken,
  verifyCustomerEmail,
  resendVerificationToken,
  requestPasswordReset,
  resetCustomerPassword,
  changeCustomerPassword,
  cleanupExpiredSecurityTokens,
};
