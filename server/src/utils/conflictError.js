import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ConflictError extends ApiError {
  constructor(message = 'Resource Conflict', errors = []) {
    super(HTTP_STATUS.CONFLICT, message, errors);
  }
}
