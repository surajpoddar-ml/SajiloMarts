import { ApiResponse, asyncHandler } from '../utils/index.js';
import { getSystemHealth } from '../services/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getHealthStatus = asyncHandler(async (req, res) => {
  const healthData = getSystemHealth();
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, healthData, 'Server is healthy and running')
  );
});
