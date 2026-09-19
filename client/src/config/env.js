const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const ENV = {
  API_BASE_URL: rawApiUrl.replace(/\/+$/, ''),
  APP_NAME: 'SastoMarts',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  IS_TEST: import.meta.env.MODE === 'test',
};
