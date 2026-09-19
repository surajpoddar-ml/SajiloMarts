export class BaseService {
  async execute(action, ...args) {
    return action(...args);
  }
}
