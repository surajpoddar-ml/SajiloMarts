import mongoose from 'mongoose';
import { Address } from '../models/address.model.js';
import { BaseService } from './base.service.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/index.js';

/**
 * Address Service
 * Manages customer address persistence, ownership verification, and default address logic.
 */
export class AddressService extends BaseService {
  /**
   * Helper: Validates that an ID is a valid Mongoose ObjectId.
   * @param {string} id
   * @param {string} entityName
   */
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Helper: Verifies address existence and user ownership.
   * @param {string} userId - Trusted authenticated User ID
   * @param {string} addressId - Target Address ID
   * @returns {Promise<import('mongoose').Document>}
   */
  async verifyOwnership(userId, addressId) {
    this.validateObjectId(userId, 'User ID');
    this.validateObjectId(addressId, 'Address ID');

    const address = await Address.findById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (address.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to access this address');
    }

    return address;
  }

  /**
   * Creates a new address for a user.
   * Clears existing default shipping/billing addresses if requested on new address.
   * @param {string} userId - User ObjectId
   * @param {object} addressData - New address payload
   * @returns {Promise<import('mongoose').Document>}
   */
  async createAddress(userId, addressData) {
    this.validateObjectId(userId, 'User ID');

    // Mass assignment protection: ensure userId is bound to authenticated user
    const { userId: _ignoreUserId, _id: _ignoreId, createdAt: _c, updatedAt: _u, ...cleanData } = addressData;

    // Handle default shipping unset on existing addresses if new is default
    if (cleanData.isDefaultShipping) {
      await Address.updateMany(
        { userId, isDefaultShipping: true },
        { $set: { isDefaultShipping: false } }
      );
    }

    // Handle default billing unset on existing addresses if new is default
    if (cleanData.isDefaultBilling) {
      await Address.updateMany(
        { userId, isDefaultBilling: true },
        { $set: { isDefaultBilling: false } }
      );
    }

    const newAddress = new Address({
      ...cleanData,
      userId,
    });

    return newAddress.save();
  }
}

export const addressService = new AddressService();
export default addressService;
