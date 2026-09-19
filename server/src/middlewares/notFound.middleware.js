import { ApiError } from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};
