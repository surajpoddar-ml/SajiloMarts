import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', validationErrors = []) {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, validationErrors);
  }
}
