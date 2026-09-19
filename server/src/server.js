import app from './app.js';
import { config, validateEnvironment } from './config/index.js';

try {
  validateEnvironment();
} catch (error) {
  console.error('CRITICAL: Environment validation failed!');
  console.error(error.message);
  process.exit(1);
}

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 SastoMarts Backend Running!`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
  console.log(`=================================`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...', err);
  process.exit(1);
});
