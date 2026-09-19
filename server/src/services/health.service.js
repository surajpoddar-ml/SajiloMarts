export const getSystemHealth = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    environment: process.env.NODE_ENV || 'development',
    service: 'SastoMarts Backend API',
  };
};
