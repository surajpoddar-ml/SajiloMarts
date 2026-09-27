import { BadRequestError } from '../utils/badRequestError.js';
import { ORDER_STATUSES, isValidOrderStatus } from '../constants/order.constants.js';

/**
 * Validates request payload for order creation.
 */
export function validateCreateOrderPayload(req, res, next) {
  const { requestId } = req.body || {};
  if (!requestId || typeof requestId !== 'string' || !requestId.trim()) {
    throw new BadRequestError('Product sourcing requestId is required to create an order');
  }
  next();
}

/**
 * Validates request payload for privileged order status update.
 */
export function validateUpdateOrderStatusPayload(req, res, next) {
  const { status } = req.body || {};
  if (!status || typeof status !== 'string' || !isValidOrderStatus(status.trim())) {
    throw new BadRequestError(`Invalid order status. Allowed statuses: ${Object.values(ORDER_STATUSES).join(', ')}`);
  }
  req.body.status = status.trim();
  next();
}

export default {
  validateCreateOrderPayload,
  validateUpdateOrderStatusPayload,
};
