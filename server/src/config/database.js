import { envConfig } from './environment.js';

export const databaseConfig = {
  uri: envConfig.mongodbUri,
  options: {
    autoIndex: !envConfig.isProduction,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  },
};
