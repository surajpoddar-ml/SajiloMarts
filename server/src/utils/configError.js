export class ConfigError extends Error {
  constructor(message, missingKeys = []) {
    super(message);
    this.name = 'ConfigError';
    this.missingKeys = missingKeys;
    Error.captureStackTrace(this, this.constructor);
  }
}
