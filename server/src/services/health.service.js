import { envConfig } from '../config/index.js';
import { getDatabaseState } from '../database/index.js';

export const getSystemHealth = () => {
  const dbState = getDatabaseState();

  return {
    status: dbState.isConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: envConfig.nodeEnv,
    service: 'SastoMarts Backend API',
    database: {
      status: dbState.status,
      code: dbState.code,
      connected: dbState.isConnected,
      ready: dbState.isConnected,
    },
  };
};
