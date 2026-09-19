import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/index.js';

export class BaseService {
  async execute(action, ...args) {
    return action(...args);
  }

  throwBadRequest(message) {
    throw new BadRequestError(message);
  }

  throwNotFound(message) {
    throw new NotFoundError(message);
  }

  throwUnauthorized(message) {
    throw new UnauthorizedError(message);
  }

  throwForbidden(message) {
    throw new ForbiddenError(message);
  }
}
