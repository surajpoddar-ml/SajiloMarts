import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, corsOptions, appConfig } from './config/index.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler, requestLogger, sanitizeInput } from './middlewares/index.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(requestLogger);

app.use(express.json({ limit: appConfig.bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: appConfig.bodyLimit }));
app.use(sanitizeInput);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SastoMarts Backend API',
    status: 'online',
    docs: `${config.apiPrefix}/health`,
  });
});

app.use(config.apiPrefix, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
