import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}
