import { ApiResponse } from '../utils/apiResponse.js';
import { getSystemHealth } from '../services/health.service.js';

export const getHealthStatus = (req, res, next) => {
  try {
    const healthData = getSystemHealth();
    return res.status(200).json(new ApiResponse(200, healthData, 'Server is healthy and running'));
  } catch (error) {
    next(error);
  }
};
