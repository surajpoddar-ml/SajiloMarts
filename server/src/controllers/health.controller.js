import { ApiResponse } from '../utils/apiResponse.js';

export const getHealthStatus = (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'development',
    service: 'SastoMarts Backend API',
  };

  res.status(200).json(new ApiResponse(200, healthData, 'Server is healthy and running'));
};
