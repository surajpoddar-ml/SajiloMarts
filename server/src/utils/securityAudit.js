import { AUTH_EVENTS } from '../constants/auth.constants.js';

/**
 * Security audit event recorder.
 * Safely logs security lifecycle events while strictly filtering out sensitive payload data.
 */
export const recordSecurityEvent = (eventType, { userId, email, ip, userAgent, success = true, reason } = {}) => {
  const event = {
    eventType,
    timestamp: new Date().toISOString(),
    success: Boolean(success),
    userId: userId ? String(userId) : undefined,
    email: email ? String(email).trim().toLowerCase() : undefined,
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown',
    reason: reason || undefined,
  };

  // In test environment or quiet mode, skip noisy stdout logs
  if (process.env.NODE_ENV !== 'test') {
    const statusTag = event.success ? 'SUCCESS' : 'FAILED';
    console.info(`[SecurityAudit] [${statusTag}] ${event.eventType} - User: ${event.userId || event.email || 'anonymous'}`);
  }

  return event;
};

export default {
  recordSecurityEvent,
};
