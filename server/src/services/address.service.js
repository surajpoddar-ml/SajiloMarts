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
}

export const addressService = new AddressService();
export default addressService;
