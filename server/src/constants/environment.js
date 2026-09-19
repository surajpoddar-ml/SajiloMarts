export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
};

export const isProduction = (env) => env === ENVIRONMENTS.PRODUCTION;
export const isDevelopment = (env) => env === ENVIRONMENTS.DEVELOPMENT;
export const isTest = (env) => env === ENVIRONMENTS.TEST;
