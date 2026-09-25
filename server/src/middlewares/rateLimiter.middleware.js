import { ApiError } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { appConfig } from '../config/index.js';

const requestCounts = new Map();
const authRequestCounts = new Map();
const verificationCounts = new Map();
const recoveryCounts = new Map();
const passwordChangeCounts = new Map();

/**
 * Creates an in-memory sliding window rate limiter middleware.
 *
 * @param {Map} store
 * @param {number} windowMs
 * @param {number} maxRequests
 * @param {string} message
 * @returns {import('express').RequestHandler}
 */
const createRateLimiter = (store, windowMs, maxRequests, message) => (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const currentTime = Date.now();

  const record = store.get(ip) || { count: 0, resetTime: currentTime + windowMs };

  if (currentTime > record.resetTime) {
    record.count = 1;
    record.resetTime = currentTime + windowMs;
  } else {
    record.count += 1;
  }

  store.set(ip, record);

  if (record.count > maxRequests) {
    throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  next();
};

export const apiRateLimiter = createRateLimiter(
  requestCounts,
  appConfig.rateLimit.windowMs,
  appConfig.rateLimit.maxRequests,
  'Too many requests. Please try again later.'
);

export const authRateLimiter = createRateLimiter(
  authRequestCounts,
  15 * 60 * 1000,
  20,
  'Too many authentication attempts. Please try again in 15 minutes.'
);

export const verificationRateLimiter = createRateLimiter(
  verificationCounts,
  15 * 60 * 1000,
  10,
  'Too many email verification attempts. Please try again in 15 minutes.'
);

export const passwordRecoveryRateLimiter = createRateLimiter(
  recoveryCounts,
  15 * 60 * 1000,
  10,
  'Too many password recovery attempts. Please try again in 15 minutes.'
);

export const passwordChangeRateLimiter = createRateLimiter(
  passwordChangeCounts,
  15 * 60 * 1000,
  10,
  'Too many password change attempts. Please try again in 15 minutes.'
);

const sourcingCounts = new Map();
const quoteCounts = new Map();

export const sourcingRequestRateLimiter = createRateLimiter(
  sourcingCounts,
  15 * 60 * 1000,
  60,
  'Too many sourcing requests created from this address. Please try again in 15 minutes.'
);

export const quoteRateLimiter = createRateLimiter(
  quoteCounts,
  15 * 60 * 1000,
  120,
  'Too many quote calculation requests. Please try again shortly.'
);

const paymentCounts = new Map();
const paymentProofCounts = new Map();

export const paymentRateLimiter = createRateLimiter(
  paymentCounts,
  15 * 60 * 1000,
  30,
  'Too many payment checkout requests. Please try again in 15 minutes.'
);

export const paymentProofRateLimiter = createRateLimiter(
  paymentProofCounts,
  15 * 60 * 1000,
  20,
  'Too many payment proof submission attempts. Please try again in 15 minutes.'
);

export default {
  apiRateLimiter,
  authRateLimiter,
  verificationRateLimiter,
  passwordRecoveryRateLimiter,
  passwordChangeRateLimiter,
  sourcingRequestRateLimiter,
  quoteRateLimiter,
  paymentRateLimiter,
  paymentProofRateLimiter,
};

