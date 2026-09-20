import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { ProductRequest, REQUEST_STATUSES } from '../models/productRequest.model.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { quoteService } from './quote.service.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/index.js';

/**
 * Product Request Service
 * Handles sourcing requests, ownership isolation, and administrative lifecycle management.
 */
export class ProductRequestService extends BaseService {
  /**
   * Helper: Validates Mongoose ObjectId.
   */
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Helper: Asserts that a user holds the administrative role.
   * @param {string} adminUserId
   */
  async assertAdmin(adminUserId) {
    this.validateObjectId(adminUserId, 'Admin User ID');
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Administrative privileges required');
    }
    return adminUser;
  }

  /**
   * Creates a new sourcing request for a customer.
   * Calculates initial quote snapshot.
   * @param {string} userId - Authenticated user ID
   * @param {object} requestData - Input fields
   * @returns {Promise<import('mongoose').Document>}
   */
  async createRequest(userId, requestData) {
    this.validateObjectId(userId, 'User ID');

    // Mass assignment protection
    const {
      user: _ignoreUser,
      _id: _ignoreId,
      status: _ignoreStatus,
      internalNotes: _ignoreInternalNotes,
      quote: _ignoreQuote,
      paymentSubmission: _ignorePayment,
      createdAt: _c,
      updatedAt: _u,
      ...cleanData
    } = requestData;

    const initialQuote = quoteService.calculateQuote(
      cleanData.productPriceInr,
      cleanData.quantity || 1,
      cleanData.paymentMode || 'online_100'
    );

    const productRequest = new ProductRequest({
      ...cleanData,
      user: userId,
      status: REQUEST_STATUSES.SUBMITTED,
      quote: initialQuote,
    });

    return productRequest.save();
  }

  /**
   * Retrieves a single sourcing request ensuring customer ownership.
   * @param {string} userId - User ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async getRequestForUser(userId, requestId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId);
    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    if (request.user.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to view this request');
    }

    return request;
  }

  /**
   * Lists sourcing requests for an authenticated user.
   * @param {string} userId - User ID
   * @returns {Promise<Array<import('mongoose').Document>>}
   */
  async getUserRequests(userId) {
    this.validateObjectId(userId, 'User ID');
    return ProductRequest.find({ user: userId }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves complete administrative details for a sourcing request.
   * Exposes internal notes, customer contact, and payment proof references.
   * @param {string} adminUserId - Admin User ID
   * @param {string} requestId - ProductRequest ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async getAdminRequestDetails(adminUserId, requestId) {
    await this.assertAdmin(adminUserId);
    this.validateObjectId(requestId, 'Request ID');

    const request = await ProductRequest.findById(requestId)
      .select('+internalNotes')
      .populate('user', 'name email phone role')
      .populate('paymentSubmission');

    if (!request) {
      throw new NotFoundError('Product request not found');
    }

    return request;
  }
}

export const productRequestService = new ProductRequestService();
export default productRequestService;
