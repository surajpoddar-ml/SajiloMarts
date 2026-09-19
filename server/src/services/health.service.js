import { envConfig } from '../config/index.js';
import { getDatabaseState } from '../database/index.js';

export const getSystemHealth = () => {
  const dbState = getDatabaseState();
  const isDbConnected = Boolean(dbState && dbState.isConnected);

  return {
    status: isDbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: envConfig.nodeEnv,
    service: 'SastoMarts Backend API',
    database: {
      status: dbState.status,
      code: dbState.code,
      connected: isDbConnected,
      ready: isDbConnected,
    },
    version: '1.0.0',
  };
};
