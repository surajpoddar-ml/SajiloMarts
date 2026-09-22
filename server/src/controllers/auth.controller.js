import { asyncHandler, ApiResponse, setAuthCookie, clearAuthCookie } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { registerCustomer, loginCustomer } from '../services/auth.service.js';
import { validateRegistrationInput, validateLoginInput } from '../validations/auth.validation.js';

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
  getMe,
  logout,
};
