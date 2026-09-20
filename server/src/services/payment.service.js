import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { quoteService } from './quote.service.js';
import {
  PAYMENT_MODES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from '../constants/payment.constants.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/index.js';

/**
 * Payment Service
 * Enforces server-authoritative payment calculations, ownership isolation, and verification workflows.
 */
export class PaymentService extends BaseService {
  /**
   * Helper: Validates Mongoose ObjectId format.
   */
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Creates an authoritative payment submission for a product request.
   * Client-supplied amounts are ignored; amounts are strictly computed by server.
   * @param {string} userId - Authenticated user ID
   * @param {string} requestId - ProductRequest ID
   * @param {object} paymentData - { paymentMode, paymentMethod }
   * @returns {Promise<import('mongoose').Document>}
   */
  async createPaymentSubmission(userId, requestId, paymentData) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(requestId, 'ProductRequest ID');

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    if (request.user.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to pay for this request');
    }

    const { paymentMode, paymentMethod } = paymentData;

    if (!Object.values(PAYMENT_MODES).includes(paymentMode)) {
      throw new BadRequestError(`Invalid payment mode: ${paymentMode}`);
    }

    if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
      throw new BadRequestError(`Invalid payment method: ${paymentMethod}`);
    }

    // Always calculate authoritative quote on the server
    const quote = quoteService.calculateQuote(
      request.productPriceInr,
      request.quantity,
      paymentMode
    );

    // Update quote snapshot on product request
    request.quote = quote;
    request.status = REQUEST_STATUSES.PAYMENT_PENDING;

    // Server authoritative payment amount binding
    const amountDueNpr = quote.finalAmountNpr;
    const amountPaidNpr = quote.payNowAmountNpr;
    const remainingAmountNpr = quote.remainingCodAmountNpr;

    const paymentSubmission = new PaymentSubmission({
      productRequest: request._id,
      user: userId,
      paymentMode,
      paymentMethod,
      amountDueNpr,
      amountPaidNpr,
      remainingAmountNpr,
      paymentStatus: PAYMENT_STATUSES.PENDING,
    });

    const savedPayment = await paymentSubmission.save();
    request.paymentSubmission = savedPayment._id;
    await request.save();

    return savedPayment;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
