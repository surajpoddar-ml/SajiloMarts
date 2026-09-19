import { envConfig } from './environment.js';
import { ENVIRONMENTS } from '../constants/environment.js';
import { ConfigError } from '../utils/configError.js';

export const validateEnvironment = () => {
  const errors = [];
  const missingKeys = [];

  if (isNaN(envConfig.port) || envConfig.port <= 0 || envConfig.port > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
    missingKeys.push('PORT');
  }

  const validEnvs = Object.values(ENVIRONMENTS);
  if (!validEnvs.includes(envConfig.nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    missingKeys.push('NODE_ENV');
  }

  if (!envConfig.clientUrl || !envConfig.clientUrl.startsWith('http')) {
    errors.push('CLIENT_URL must be a valid HTTP/HTTPS URL');
    missingKeys.push('CLIENT_URL');
  }

  // Validate MongoDB Connection URI Settings
  if (!envConfig.mongodbUri) {
    errors.push('MONGODB_URI is required for database connectivity (e.g. mongodb+srv://... or mongodb://localhost:27017/...)');
    missingKeys.push('MONGODB_URI');
  } else if (
    !envConfig.mongodbUri.startsWith('mongodb://') &&
    !envConfig.mongodbUri.startsWith('mongodb+srv://')
  ) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
    missingKeys.push('MONGODB_URI');
  }

  if (errors.length > 0) {
    throw new ConfigError(
      `Environment validation failed:\n- ${errors.join('\n- ')}`,
      missingKeys
    );
  }

  return true;
};
