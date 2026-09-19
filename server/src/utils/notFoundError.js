import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}
