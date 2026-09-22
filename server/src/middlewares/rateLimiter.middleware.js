import { ApiError } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { appConfig } from '../config/index.js';

const requestCounts = new Map();
const authRequestCounts = new Map();

export const apiRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const currentTime = Date.now();
  const windowMs = appConfig.rateLimit.windowMs;
  const maxRequests = appConfig.rateLimit.maxRequests;

  const record = requestCounts.get(ip) || { count: 0, resetTime: currentTime + windowMs };

  if (currentTime > record.resetTime) {
    record.count = 1;
    record.resetTime = currentTime + windowMs;
  } else {
    record.count += 1;
  }

  requestCounts.set(ip, record);

  if (record.count > maxRequests) {
    throw new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many requests. Please try again later.');
  }

  next();
};

export const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const currentTime = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes window
  const maxRequests = 20; // 20 authentication attempts per window

  const record = authRequestCounts.get(ip) || { count: 0, resetTime: currentTime + windowMs };

  if (currentTime > record.resetTime) {
    record.count = 1;
    record.resetTime = currentTime + windowMs;
  } else {
    record.count += 1;
  }

  authRequestCounts.set(ip, record);

  if (record.count > maxRequests) {
    throw new ApiError(
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'Too many authentication attempts. Please try again in 15 minutes.'
    );
  }

  next();
};

export default {
  apiRateLimiter,
  authRateLimiter,
};
