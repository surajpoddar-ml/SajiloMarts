import { asyncHandler, ApiResponse, setAuthCookie, clearAuthCookie, toSafeUser } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { registerCustomer, loginCustomer } from '../services/auth.service.js';
import { verifyEmailToken } from '../services/accountSecurity.service.js';
import {
  validateRegistrationInput,
  validateLoginInput,
  validateVerifyEmailInput,
} from '../validations/auth.validation.js';

/**
 * Controller to handle public customer registration.
 * Establishes authenticated state with secure HTTP-only cookie.
 *
 * @route POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const validatedInput = validateRegistrationInput(req.body);
  const { user, token } = await registerCustomer(validatedInput);

  setAuthCookie(res, token);

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      { user, token },
      'Customer account registered successfully'
    )
  );
});

/**
 * Controller to handle customer login.
 * Establishes fresh authenticated state with secure HTTP-only cookie.
 *
 * @route POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const validatedInput = validateLoginInput(req.body);
  const { user, token } = await loginCustomer(validatedInput);

  setAuthCookie(res, token);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user, token },
      'Login successful'
    )
  );
});

/**
 * Controller to handle customer email verification.
 * Validates security token and confirms email address.
 *
 * @route POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const validatedInput = validateVerifyEmailInput(req.body);
  const { user } = await verifyEmailToken(validatedInput.token);

  // Mark verified
  user.isEmailVerified = true;
  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: toSafeUser(user), verified: true },
      'Email address verified successfully'
    )
  );
});

/**
 * Controller to fetch the currently authenticated customer's profile.
 *
 * @route GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, req.user, 'Current user profile retrieved successfully')
  );
});

/**
 * Controller to securely log out an authenticated customer or admin.
 * Clears HTTP-only session cookie.
 *
 * @route POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Logged out successfully')
  );
});

export default {
  register,
  login,
  verifyEmail,
  getMe,
  logout,
};
