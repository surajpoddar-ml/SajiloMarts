const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const defaultApiUrl = isBrowser && !isLocalhost
  ? 'https://sajilo-marts-rvfu.vercel.app/api/v1'
  : 'http://localhost:5000/api/v1';

const rawApiUrl = metaEnv.VITE_API_BASE_URL || (typeof process !== 'undefined' && process.env ? process.env.VITE_API_BASE_URL : '') || defaultApiUrl;

export const ENV = {
  API_BASE_URL: rawApiUrl.replace(/\/+$/, ''),
  APP_NAME: 'SajiloMarts',
  NODE_ENV: metaEnv.MODE || (typeof process !== 'undefined' && process.env ? process.env.NODE_ENV : 'development'),
  IS_DEV: Boolean(metaEnv.DEV),
  IS_PROD: Boolean(metaEnv.PROD),
  IS_TEST: metaEnv.MODE === 'test',
};
