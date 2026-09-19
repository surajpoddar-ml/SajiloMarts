import { envConfig } from '../config/index.js';

export const getSystemHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: envConfig.nodeEnv,
    service: 'SastoMarts Backend API',
  };
};
