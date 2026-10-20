import { envConfig } from './environment.js';

export const databaseConfig = {
  uri: envConfig.mongodbUri,
  options: {
    autoIndex: !envConfig.isProduction,
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  },
};
