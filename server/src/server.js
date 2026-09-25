import app from './app.js';
import { config, validateEnvironment } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './database/index.js';

try {
  validateEnvironment();
} catch (error) {
  console.error('CRITICAL: Environment validation failed!');
  console.error(`- ${error.message}`);
  process.exit(1);
}

const PORT = config.port;

const startServer = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Atlas / Database...');
    await connectDatabase();
    console.log('✅ Database connection verified');

    const server = app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`🚀 SajiloMarts Backend Running!`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
      console.log(`=================================`);
    });

    let isShuttingDown = false;

    const gracefulShutdown = async (signal, exitCode = 0) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      // Force exit after 10s if graceful shutdown hangs
      const forceTimeout = setTimeout(() => {
        console.error('⚠️ Forcefully terminating after timeout!');
        process.exit(1);
      }, 10000);
      forceTimeout.unref();

      server.close(async () => {
        console.log('🔌 HTTP server closed.');
        try {
          await disconnectDatabase();
          console.log('✨ All resources released cleanly. Exiting.');
          clearTimeout(forceTimeout);
          process.exit(exitCode);
        } catch (dbErr) {
          console.error('Error during database disconnect:', dbErr.message);
          clearTimeout(forceTimeout);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));

    process.on('unhandledRejection', async (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...', err);
      await gracefulShutdown('unhandledRejection', 1);
    });

    process.on('uncaughtException', async (err) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...', err);
      await gracefulShutdown('uncaughtException', 1);
    });

    return server;
  } catch (error) {
    if (error.name === 'DatabaseConnectionError' || error.name === 'DatabaseConfigurationError') {
      console.error('CRITICAL DATABASE STARTUP ERROR:');
      console.error(`- ${error.message}`);
    } else {
      console.error('CRITICAL SERVER STARTUP ERROR:', error.message);
    }
    process.exit(1);
  }
};

export const serverInstance = startServer();
