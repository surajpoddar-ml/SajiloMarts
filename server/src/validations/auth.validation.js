import { ValidationError } from '../utils/index.js';
import { USER_ROLES } from '../constants/roles.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+?(?:977|91)[\s-]?)?[6789]\d{9}$/;

/**
 * Validates customer registration payload.
 *
 * @param {Object} data - The registration request payload
 * @throws {ValidationError}
 * @returns {Object} Cleaned registration data
 */
export const validateRegistrationInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Registration payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { name, email, password, phone, ...extraFields } = data;

  // Explicit role & privilege injection protection
  if ('role' in data && data.role !== USER_ROLES.CUSTOMER) {
    errors.push({
      field: 'role',
      message: 'Public registration cannot assign privileged roles',
    });
  }

  // Mass assignment protection check
  const forbiddenFields = Object.keys(extraFields).filter(
    (key) => !['role', 'isActive', 'isEmailVerified'].includes(key)
  );
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unauthorized fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Full name is required' });
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    } else if (trimmedName.length > 100) {
      errors.push({ field: 'name', message: 'Name cannot exceed 100 characters' });
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length > 254) {
      errors.push({ field: 'email', message: 'Email address cannot exceed 254 characters' });
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address format' });
    }
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    } else if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
    }
  }

  // Phone validation (optional)
  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string') {
      errors.push({ field: 'phone', message: 'Phone number must be a string' });
    } else {
      const cleanedPhone = phone.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanedPhone)) {
        errors.push({
          field: 'phone',
          message: 'Please provide a valid Nepal (+977) or India (+91) mobile number format',
        });
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for registration input', errors);
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null,
  };
};

/**
 * Validates customer login payload.
 *
 * @param {Object} data - The login request payload
 * @throws {ValidationError}
 * @returns {Object} Cleaned login data
 */
export const validateLoginInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Login payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { email, password, ...extraFields } = data;

  // Mass assignment / unexpected property check
  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else {
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address format' });
    }
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for login input', errors);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};

/**
 * Validates email verification payload.
 *
 * @param {Object} data
 * @throws {ValidationError}
 * @returns {{token: string}}
 */
export const validateVerifyEmailInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { token, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  if (!token || typeof token !== 'string') {
    errors.push({ field: 'token', message: 'Verification token is required' });
  } else if (!/^[a-fA-F0-9]{64,128}$/.test(token.trim())) {
    errors.push({ field: 'token', message: 'Malformed verification token format' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for verification input', errors);
  }

  return {
    token: token.trim(),
  };
};

/**
 * Validates resend verification request payload.
 *
 * @param {Object} data
 * @throws {ValidationError}
 * @returns {{email?: string}}
 */
export const validateResendVerificationInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { email, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !email.trim()) {
      errors.push({ field: 'email', message: 'Email address must be a valid string' });
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address format' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for resend verification input', errors);
  }

  return {
    email: email && typeof email === 'string' ? email.trim().toLowerCase() : undefined,
  };
};

/**
 * Validates forgot password request payload.
 *
 * @param {Object} data
 * @throws {ValidationError}
 * @returns {{email: string}}
 */
export const validateForgotPasswordInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { email, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email address is required' });
  } else {
    const trimmed = email.trim();
    if (!trimmed) {
      errors.push({ field: 'email', message: 'Email address cannot be empty' });
    } else if (trimmed.length > 254) {
      errors.push({ field: 'email', message: 'Email address cannot exceed 254 characters' });
    } else if (!EMAIL_REGEX.test(trimmed)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address format' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for forgot password input', errors);
  }

  return {
    email: email.trim().toLowerCase(),
  };
};

/**
 * Validates password reset request payload.
 *
 * @param {Object} data
 * @throws {ValidationError}
 * @returns {{token: string, password: string}}
 */
export const validateResetPasswordInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { token, password, newPassword, confirmPassword, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  // Token validation
  if (!token || typeof token !== 'string') {
    errors.push({ field: 'token', message: 'Reset token is required' });
  } else if (!/^[a-fA-F0-9]{64,128}$/.test(token.trim())) {
    errors.push({ field: 'token', message: 'Malformed reset token format' });
  }

  // Password validation (accept either `password` or `newPassword` for frontend flexibility)
  const candidatePassword = password !== undefined ? password : newPassword;
  if (!candidatePassword || typeof candidatePassword !== 'string') {
    errors.push({ field: 'password', message: 'New password is required' });
  } else {
    if (candidatePassword.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
    } else if (candidatePassword.length > 128) {
      errors.push({ field: 'password', message: 'Password cannot exceed 128 characters' });
    }
  }

  // Optional confirmPassword validation if provided
  if (confirmPassword !== undefined && candidatePassword !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Password confirmation does not match' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for password reset input', errors);
  }

  return {
    token: token.trim(),
    password: candidatePassword,
  };
};

/**
 * Validates authenticated password change request payload.
 *
 * @param {Object} data
 * @throws {ValidationError}
 * @returns {{currentPassword: string, newPassword: string}}
 */
export const validateChangePasswordInput = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Payload must be an object', [
      { field: 'body', message: 'Invalid payload structure' },
    ]);
  }

  const errors = [];
  const { currentPassword, newPassword, password, confirmPassword, ...extraFields } = data;

  const forbiddenFields = Object.keys(extraFields);
  if (forbiddenFields.length > 0) {
    errors.push({
      field: 'extraFields',
      message: `Unexpected fields provided: ${forbiddenFields.join(', ')}`,
    });
  }

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }

  const candidateNewPassword = newPassword !== undefined ? newPassword : password;
  if (!candidateNewPassword || typeof candidateNewPassword !== 'string') {
    errors.push({ field: 'newPassword', message: 'New password is required' });
  } else {
    if (candidateNewPassword.length < 8) {
      errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters long' });
    } else if (candidateNewPassword.length > 128) {
      errors.push({ field: 'newPassword', message: 'New password cannot exceed 128 characters' });
    }
  }

  if (confirmPassword !== undefined && candidateNewPassword !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Password confirmation does not match' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed for password change input', errors);
  }

  return {
    currentPassword,
    newPassword: candidateNewPassword,
  };
};

export default {
  validateRegistrationInput,
  validateLoginInput,
  validateVerifyEmailInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
};
