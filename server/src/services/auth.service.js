import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { USER_ROLES } from '../constants/roles.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  normalizeEmail,
  toSafeUser,
  createAuthToken,
} from '../utils/index.js';

export { normalizeEmail };

const DUMMY_HASH = '$2a$12$e8Uk5a96a.k5088K.40G2.x4Jq0Ikn0qC/2mB8eG0oO0M4uGgL6pG';

/**
 * Service to register a new customer in SajiloMarts.
 * Enforces role isolation (always CUSTOMER), email normalization, and issues fresh authentication state.
 *
 * @param {Object} customerData
 * @param {string} customerData.name
 * @param {string} customerData.email
 * @param {string} customerData.password
 * @param {string} [customerData.phone]
 * @returns {Promise<{user: Object, token: string}>} Safe customer object and fresh auth token
 */
export const registerCustomer = async (customerData) => {
  // Mass assignment protection: whitelist permitted customer registration fields only
  const { name, email, password, phone } = customerData || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new BadRequestError('Full name is required');
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new BadRequestError('Email address is required');
  }
  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Password is required');
  }

  const normalizedEmail = normalizeEmail(email);

  // Check if an account with this email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists');
  }

  // Create new customer with strict role protection
  const newUser = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone ? phone.trim() : null,
    role: USER_ROLES.CUSTOMER,
    isActive: true,
    isEmailVerified: false,
  });

  try {
    await newUser.save();
  } catch (error) {
    if (error.name === 'DuplicateKeyError' || (error.name === 'MongoServerError' && error.code === 11000)) {
      throw new ConflictError('An account with this email address already exists');
    }
    throw error;
  }

  const safeUser = toSafeUser(newUser);
  const token = createAuthToken(safeUser);

  return {
    user: safeUser,
    token,
  };
};

/**
 * Service to authenticate customer credentials and issue fresh authentication state.
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{user: Object, token: string}>} Safe user object and fresh auth token
 */
export const loginCustomer = async ({ email, password }) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new BadRequestError('Email address is required');
  }
  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Password is required');
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    // Timing-safe dummy comparison to mitigate account enumeration
    await bcrypt.compare(password, DUMMY_HASH);
    throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  // Enforce account activation status
  if (!user.isActive) {
    throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const safeUser = toSafeUser(user);
  const token = createAuthToken(safeUser);

  return {
    user: safeUser,
    token,
  };
};

export default {
  normalizeEmail,
  registerCustomer,
  loginCustomer,
};
