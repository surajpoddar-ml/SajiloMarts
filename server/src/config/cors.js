import { envConfig } from './environment.js';

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [envConfig.clientUrl];
    if (!origin || allowedOrigins.includes(origin) || envConfig.isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Access Denied'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
