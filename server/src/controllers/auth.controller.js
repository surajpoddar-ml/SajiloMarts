import { asyncHandler, ApiResponse } from '../utils/index.js';
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

export default {
  getMe,
};
