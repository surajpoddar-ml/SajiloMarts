import { envConfig } from './environment.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    const explicitOrigins = [
      envConfig.clientUrl,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    if (envConfig.clientUrl && envConfig.clientUrl.includes(',')) {
      explicitOrigins.push(...envConfig.clientUrl.split(',').map((u) => u.trim()));
    }

    const isAllowed =
      explicitOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      envConfig.isDevelopment;

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};
