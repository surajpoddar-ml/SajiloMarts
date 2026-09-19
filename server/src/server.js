import app from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 SastoMarts Backend Running!`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
  console.log(`=================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...', err);
  process.exit(1);
});
