import morgan from 'morgan';
import { envConfig, loggerConfig } from '../config/index.js';

export const requestLogger = (req, res, next) => {
  if (loggerConfig.silent) {
    return next();
  }

  const format = envConfig.isDevelopment ? 'dev' : 'combined';
  return morgan(format)(req, res, next);
};
