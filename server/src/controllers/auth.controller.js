import { asyncHandler, ApiResponse, clearAuthCookie } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

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
  getMe,
  logout,
};
