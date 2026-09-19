import { envConfig } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(envConfig.isDevelopment && { stack: err.stack }),
  });
};
