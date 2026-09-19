import { envConfig } from './environment.js';
import { ENVIRONMENTS } from '../constants/environment.js';

export const validateEnvironment = () => {
  const errors = [];

  if (isNaN(envConfig.port) || envConfig.port <= 0 || envConfig.port > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }

  const validEnvs = Object.values(ENVIRONMENTS);
  if (!validEnvs.includes(envConfig.nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
  }

  if (!envConfig.clientUrl || !envConfig.clientUrl.startsWith('http')) {
    errors.push('CLIENT_URL must be a valid HTTP/HTTPS URL');
  }

  if (errors.length > 0) {
    throw new Error(`Environment Configuration Error:\n- ${errors.join('\n- ')}`);
  }

  return true;
};
