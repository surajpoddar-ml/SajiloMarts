import { User } from '../models/user.model.js';
import { ProductRequest } from '../models/productRequest.model.js';
import { PaymentSubmission } from '../models/paymentSubmission.model.js';
import { Address } from '../models/address.model.js';
import { BaseService } from './base.service.js';
import { toSafeUser } from '../utils/userSerializer.js';
import { NotFoundError, BadRequestError } from '../utils/index.js';

/**
 * Admin Service
 * Authoritative administrative operational access foundation.
 */
export class AdminService extends BaseService {
  /**
   * Retrieves paginated customer accounts for administrative review.
   * @param {object} [query={}]
   * @returns {Promise<{users: Array<object>, total: number}>}
   */
  async getCustomers(query = {}) {
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users: users.map(toSafeUser),
      total,
      page,
      limit,
    };
  }

  /**
   * Retrieves single customer account details with administrative metadata.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async getCustomerById(userId) {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Customer account not found');
    }
    return toSafeUser(user);
  }

  /**
   * Retrieves sourcing requests across all customers for administrative operations.
   * @param {object} [query={}]
   * @returns {Promise<{requests: Array<object>, total: number}>}
   */
  async getSourcingRequests(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ProductRequest.find(filter)
        .populate('user', 'name email phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProductRequest.countDocuments(filter),
    ]);

    return {
      requests,
      total,
      page,
      limit,
    };
  }

  /**
   * Retrieves payment submissions for administrative audit and approval.
   * @param {object} [query={}]
   * @returns {Promise<{payments: Array<object>, total: number}>}
   */
  async getPaymentSubmissions(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      PaymentSubmission.find(filter)
        .populate('user', 'name email phone')
        .populate('productRequest')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentSubmission.countDocuments(filter),
    ]);

    return {
      payments,
      total,
      page,
      limit,
    };
  }
}

export const adminService = new AdminService();
export default adminService;
