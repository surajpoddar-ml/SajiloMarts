import { envConfig } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isInternal = statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message = isInternal && envConfig.isProduction
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    timestamp: new Date().toISOString(),
    ...(envConfig.isDevelopment && { stack: err.stack }),
  });
};
