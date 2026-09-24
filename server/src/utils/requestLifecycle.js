import { REQUEST_STATUSES } from '../models/productRequest.model.js';
import { BadRequestError, ForbiddenError } from './index.js';

/**
 * Valid state transitions mapped by current status.
 */
export const ALLOWED_TRANSITIONS = Object.freeze({
  [REQUEST_STATUSES.DRAFT]: [
    REQUEST_STATUSES.SUBMITTED,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.SUBMITTED]: [
    REQUEST_STATUSES.UNDER_REVIEW,
    REQUEST_STATUSES.QUOTE_READY,
    REQUEST_STATUSES.QUOTED,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.UNDER_REVIEW]: [
    REQUEST_STATUSES.QUOTE_READY,
    REQUEST_STATUSES.QUOTED,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.QUOTE_READY]: [
    REQUEST_STATUSES.CUSTOMER_CONFIRMED,
    REQUEST_STATUSES.PAYMENT_PENDING,
    REQUEST_STATUSES.CANCELLED,
    REQUEST_STATUSES.EXPIRED,
  ],
  [REQUEST_STATUSES.QUOTED]: [
    REQUEST_STATUSES.CUSTOMER_CONFIRMED,
    REQUEST_STATUSES.PAYMENT_PENDING,
    REQUEST_STATUSES.CANCELLED,
    REQUEST_STATUSES.EXPIRED,
  ],
  [REQUEST_STATUSES.CUSTOMER_CONFIRMED]: [
    REQUEST_STATUSES.PAYMENT_PENDING,
    REQUEST_STATUSES.PAYMENT_SUBMITTED,
    REQUEST_STATUSES.CONVERTED,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.PAYMENT_PENDING]: [
    REQUEST_STATUSES.PAYMENT_SUBMITTED,
    REQUEST_STATUSES.CANCELLED,
    REQUEST_STATUSES.EXPIRED,
  ],
  [REQUEST_STATUSES.PAYMENT_SUBMITTED]: [
    REQUEST_STATUSES.PAYMENT_UNDER_REVIEW,
    REQUEST_STATUSES.PAYMENT_VERIFIED,
    REQUEST_STATUSES.PROCESSING,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.PAYMENT_UNDER_REVIEW]: [
    REQUEST_STATUSES.PAYMENT_VERIFIED,
    REQUEST_STATUSES.PAYMENT_PENDING,
    REQUEST_STATUSES.CANCELLED,
  ],
  [REQUEST_STATUSES.PAYMENT_VERIFIED]: [
    REQUEST_STATUSES.PROCESSING,
    REQUEST_STATUSES.COMPLETED,
    REQUEST_STATUSES.CONVERTED,
  ],
  [REQUEST_STATUSES.PROCESSING]: [
    REQUEST_STATUSES.COMPLETED,
    REQUEST_STATUSES.CONVERTED,
  ],
  [REQUEST_STATUSES.COMPLETED]: [],
  [REQUEST_STATUSES.CANCELLED]: [],
  [REQUEST_STATUSES.EXPIRED]: [],
  [REQUEST_STATUSES.CONVERTED]: [],
});

/**
 * Transitions that a regular customer is authorized to trigger directly.
 */
export const CUSTOMER_PERMITTED_ACTIONS = Object.freeze({
  SUBMIT_DRAFT: {
    from: [REQUEST_STATUSES.DRAFT],
    to: REQUEST_STATUSES.SUBMITTED,
  },
  CONFIRM_QUOTE: {
    from: [REQUEST_STATUSES.QUOTE_READY, REQUEST_STATUSES.QUOTED],
    to: REQUEST_STATUSES.CUSTOMER_CONFIRMED,
  },
  CANCEL_REQUEST: {
    from: [
      REQUEST_STATUSES.DRAFT,
      REQUEST_STATUSES.SUBMITTED,
      REQUEST_STATUSES.UNDER_REVIEW,
      REQUEST_STATUSES.QUOTE_READY,
      REQUEST_STATUSES.QUOTED,
    ],
    to: REQUEST_STATUSES.CANCELLED,
  },
});

/**
 * Validates whether a state transition from currentStatus to nextStatus is allowed.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @param {boolean} [isAdmin=false]
 * @returns {boolean}
 */
export const validateStatusTransition = (currentStatus, nextStatus, isAdmin = false) => {
  if (!currentStatus || !nextStatus) {
    throw new BadRequestError('Both current status and target status are required');
  }

  if (currentStatus === nextStatus) {
    return true; // No-op transition
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new BadRequestError(
      `Cannot transition sourcing request from '${currentStatus}' to '${nextStatus}'`
    );
  }

  // If customer is performing transition, verify customer-permitted action
  if (!isAdmin) {
    const isCustomerPermitted = Object.values(CUSTOMER_PERMITTED_ACTIONS).some(
      (action) => action.from.includes(currentStatus) && action.to === nextStatus
    );
    if (!isCustomerPermitted) {
      throw new ForbiddenError(
        `Customers are not authorized to transition status directly to '${nextStatus}'`
      );
    }
  }

  return true;
};

export default {
  ALLOWED_TRANSITIONS,
  CUSTOMER_PERMITTED_ACTIONS,
  validateStatusTransition,
};
