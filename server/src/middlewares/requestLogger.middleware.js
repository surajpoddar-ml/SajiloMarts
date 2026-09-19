import morgan from 'morgan';
import { envConfig } from '../config/index.js';

export const requestLogger = envConfig.isDevelopment
  ? morgan('dev')
  : morgan('combined');
