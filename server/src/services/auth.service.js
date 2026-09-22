import { User } from '../models/user.model.js';
import { USER_ROLES } from '../constants/roles.js';
import { AUTH_ERRORS } from '../constants/auth.constants.js';
import { BadRequestError, ConflictError, UnauthorizedError, normalizeEmail, toSafeUser } from '../utils/index.js';

/**
 * Service to register a new customer in SajiloMarts.
 * Enforces role isolation (always CUSTOMER), email normalization, and returns safe customer data.
 *
 * @param {Object} customerData
 * @param {string} customerData.name
 * @param {string} customerData.email
 * @param {string} customerData.password
 * @param {string} [customerData.phone]
 * @returns {Promise<Object>} Safe customer object
 */
export const registerCustomer = async ({ name, email, password, phone }) => {
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

  return toSafeUser(newUser);
};

/**
 * Service to authenticate customer credentials.
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<Object>} Safe user object
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
    throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  return toSafeUser(user);
};

export default {
  normalizeEmail,
  registerCustomer,
  loginCustomer,
};
