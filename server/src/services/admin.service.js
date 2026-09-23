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

  /**
   * Updates customer or admin account status, role, verification, or profile details (admin only).
   * Enforces self-protection safeguards: prevents self-deactivation and preserves last administrator.
   *
   * @param {string} actorAdminId - Authenticated administrator ID making the request
   * @param {string} targetUserId - Target User ID to update
   * @param {object} updateData - Validated administrative update fields
   * @returns {Promise<object>} Updated safe user object
   */
  async updateCustomerAccount(actorAdminId, targetUserId, updateData) {
    if (!targetUserId) {
      throw new BadRequestError('Target User ID is required');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const isSelf = actorAdminId && actorAdminId.toString() === targetUserId.toString();

    // 1. Safeguard: Prevent self-deactivation
    if (isSelf && updateData.isActive === false) {
      throw new BadRequestError('Administrators cannot deactivate their own account');
    }

    // 2. Safeguard: Prevent removing or demoting admin if it would leave zero active admins
    const isTargetAdmin = user.role === 'admin';
    const isDemotingAdmin = isTargetAdmin && updateData.role !== undefined && updateData.role !== 'admin';
    const isDeactivatingAdmin = isTargetAdmin && updateData.isActive === false;

    if (isDemotingAdmin || isDeactivatingAdmin) {
      const remainingAdminsCount = await User.countDocuments({
        _id: { $ne: targetUserId },
        role: 'admin',
        isActive: true,
      });

      if (remainingAdminsCount === 0) {
        throw new BadRequestError('Operation rejected: Cannot demote or deactivate the last active administrator');
      }
    }

    // 3. Safeguard: Prevent self-demotion
    if (isSelf && isDemotingAdmin) {
      throw new BadRequestError('Administrators cannot remove their own administrative privileges');
    }

    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
    }
    if (updateData.isEmailVerified !== undefined) {
      user.isEmailVerified = updateData.isEmailVerified;
    }
    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }

    await user.save();
    return toSafeUser(user);
  }
}

export const adminService = new AdminService();
export default adminService;
