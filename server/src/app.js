import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

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
