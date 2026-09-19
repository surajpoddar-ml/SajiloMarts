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

export const getSafeConfigSummary = () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  };
};
