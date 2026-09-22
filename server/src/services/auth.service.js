import { User } from '../models/user.model.js';
import { USER_ROLES } from '../constants/roles.js';
import { BadRequestError, ConflictError } from '../utils/index.js';

/**
 * Normalizes email address to lower case and trimmed string.
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

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

  await newUser.save();

  return newUser;
};

export default {
  normalizeEmail,
  registerCustomer,
};
