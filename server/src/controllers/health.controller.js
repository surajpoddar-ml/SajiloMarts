import { ApiResponse, asyncHandler } from '../utils/index.js';
import { getSystemHealth } from '../services/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getHealthStatus = asyncHandler(async (req, res) => {
  const healthData = getSystemHealth();
  const isHealthy = healthData.database.connected;

  const statusCode = isHealthy ? HTTP_STATUS.OK : (HTTP_STATUS.SERVICE_UNAVAILABLE || 503);
  const message = isHealthy
    ? 'Server and database are healthy and running'
    : 'Database service is degraded or unavailable';

  return res.status(statusCode).json(
    new ApiResponse(statusCode, healthData, message)
  );
});
