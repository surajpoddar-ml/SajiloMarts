import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config, corsOptions, appConfig } from './config/index.js';
import { connectDatabase, isDatabaseConnected } from './database/index.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler, requestLogger, sanitizeInput } from './middlewares/index.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(requestLogger);

// Serverless DB Connection Handler: ensures Mongoose is connected across Vercel function invocations
app.use(async (req, res, next) => {
  if (!isDatabaseConnected()) {
    try {
      await connectDatabase();
    } catch (err) {
      console.warn('⚠️ Serverless DB connection error:', err.message);
    }
  }
  next();
});

app.use(express.json({ limit: appConfig.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: appConfig.bodyLimit }));
app.use(sanitizeInput);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SajiloMarts Backend API',
    status: 'online',
    docs: `${config.apiPrefix}/health`,
  });
});

app.use(config.apiPrefix, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
