import { ApiError } from './apiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors = []) {
    super(HTTP_STATUS.BAD_REQUEST, message, errors);
  }
}
