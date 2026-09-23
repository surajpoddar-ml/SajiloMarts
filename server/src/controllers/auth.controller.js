import { asyncHandler, ApiResponse, setAuthCookie, clearAuthCookie, toSafeUser } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { registerCustomer, loginCustomer } from '../services/auth.service.js';
import { verifyCustomerEmail, resendVerificationToken } from '../services/accountSecurity.service.js';
import {
  validateRegistrationInput,
  validateLoginInput,
  validateVerifyEmailInput,
  validateResendVerificationInput,
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
  const { user, alreadyVerified } = await verifyCustomerEmail(validatedInput.token);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { user: toSafeUser(user), verified: true, alreadyVerified },
      alreadyVerified
        ? 'Account email is already verified'
        : 'Email address verified successfully'
    )
  );
});

/**
 * Controller to handle verification email resend requests.
 *
 * @route POST /api/v1/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const validatedInput = validateResendVerificationInput(req.body);
  const email = validatedInput.email || req.user?.email;

  await resendVerificationToken({
    email,
    userId: req.user?.id,
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  // Always return generic success message to prevent account enumeration
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      null,
      'If an unverified account with that email exists, a new verification link has been sent.'
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
  resendVerification,
  getMe,
  logout,
};
