import { envConfig } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Intercept JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token has expired';
  } else if (err.name === 'DuplicateKeyError' || (err.name === 'MongoServerError' && err.code === 11000)) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'A resource with this identifier already exists';
  } else if (err.name === 'ValidationError' && !err.statusCode) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    errors = Object.keys(err.errors || {}).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  const isInternal = statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const safeMessage = isInternal && envConfig.isProduction
    ? 'An unexpected error occurred. Please try again later.'
    : message;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: safeMessage,
    errors,
    timestamp: new Date().toISOString(),
    ...(envConfig.isDevelopment && { stack: err.stack }),
  });
};
