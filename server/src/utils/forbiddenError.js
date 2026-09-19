import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ForbiddenError extends ApiError {
  constructor(message = 'Access forbidden: Insufficient permissions') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}
