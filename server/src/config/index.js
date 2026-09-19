export * from './environment.js';
export * from './cors.js';
export * from './database.js';
export * from './app.js';
export * from './security.js';
export * from './logger.js';
export * from './payment.js';
export * from './email.js';
export * from './validator.js';
export { envConfig as config } from './environment.js';

export const isConfigValid = () => {
  try {
    return true;
  } catch {
    return false;
  }
};
