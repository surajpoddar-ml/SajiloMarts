import mongoose from 'mongoose';
import { BaseService } from './base.service.js';
import { PaymentConfig } from '../models/paymentConfig.model.js';
import { PAYMENT_METHODS } from '../constants/payment.constants.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../utils/index.js';

/**
 * PaymentConfig Service
 * Manages provider-specific QR code configurations for eSewa, Khalti, and MyPay.
 * Admin-only write operations. Authenticated read for customers during checkout.
 */
export class PaymentConfigService extends BaseService {
  validateObjectId(id, entityName = 'ID') {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid ${entityName} format`);
    }
  }

  /**
   * Validates that the provider string is one of the supported payment methods.
   * @param {string} provider
   */
  validateProvider(provider) {
    if (!provider || !Object.values(PAYMENT_METHODS).includes(provider.toLowerCase())) {
      throw new BadRequestError(`Invalid payment provider. Must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`);
    }
    return provider.toLowerCase();
  }

  /**
   * Asserts that a user has admin privileges.
   * @param {string} adminUserId
   */
  async assertAdmin(adminUserId) {
    this.validateObjectId(adminUserId, 'Admin User ID');
    const { User, USER_ROLES } = await import('../models/user.model.js');
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Administrative privileges required to manage payment configurations');
    }
    return adminUser;
  }

  /**
   * Retrieves the QR configuration for a specific payment provider.
   * Available to authenticated customers during checkout.
   * @param {string} provider - 'esewa' | 'khalti' | 'mypay'
   * @returns {Promise<object|null>} Customer-safe config or null if not configured
   */
  async getProviderConfig(provider) {
    const cleanProvider = this.validateProvider(provider);

    const config = await PaymentConfig.findOne({
      provider: cleanProvider,
      isActive: true,
    }).lean();

    if (!config) {
      return null;
    }

    // Return customer-safe config (strip admin references)
    return {
      provider: config.provider,
      qrImageData: config.qrImageData || null,
      instructions: config.instructions || null,
      accountName: config.accountName || null,
      accountNumber: config.accountNumber || null,
      isActive: config.isActive,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Retrieves all payment provider configurations.
   * Returns customer-safe data for each provider, with null for unconfigured providers.
   * @returns {Promise<object>} Map of provider -> config
   */
  async getAllProviderConfigs() {
    const configs = await PaymentConfig.find({ isActive: true }).lean();

    const configMap = {};

    // Initialize all providers with null
    Object.values(PAYMENT_METHODS).forEach((provider) => {
      configMap[provider] = null;
    });

    // Populate with actual configs
    configs.forEach((config) => {
      configMap[config.provider] = {
        provider: config.provider,
        qrImageData: config.qrImageData || null,
        instructions: config.instructions || null,
        accountName: config.accountName || null,
        accountNumber: config.accountNumber || null,
        isActive: config.isActive,
        updatedAt: config.updatedAt,
      };
    });

    return configMap;
  }

  /**
   * Sets or updates the QR configuration for a specific payment provider.
   * Admin-only operation.
   * @param {string} adminUserId - Admin user performing the operation
   * @param {string} provider - Payment provider key
   * @param {object} configData - { qrImageData, instructions, accountName, accountNumber, isActive }
   * @returns {Promise<object>} Updated config
   */
  async setProviderConfig(adminUserId, provider, configData = {}) {
    await this.assertAdmin(adminUserId);
    const cleanProvider = this.validateProvider(provider);

    const { qrImageData, instructions, accountName, accountNumber, isActive } = configData;

    // Validate QR image data if provided
    if (qrImageData) {
      if (typeof qrImageData !== 'string') {
        throw new BadRequestError('QR image data must be a string (base64 data URI or file path)');
      }
      // Basic size limit check — base64 QR shouldn't exceed ~2MB
      if (qrImageData.length > 2 * 1024 * 1024) {
        throw new BadRequestError('QR image data exceeds maximum allowed size (2MB)');
      }
    }

    // Validate instructions length
    if (instructions && typeof instructions === 'string' && instructions.length > 2000) {
      throw new BadRequestError('Instructions cannot exceed 2000 characters');
    }

    const updateData = {
      provider: cleanProvider,
      configuredBy: adminUserId,
    };

    if (qrImageData !== undefined) updateData.qrImageData = qrImageData;
    if (instructions !== undefined) updateData.instructions = String(instructions).trim();
    if (accountName !== undefined) updateData.accountName = accountName ? String(accountName).trim() : null;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber ? String(accountNumber).trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const config = await PaymentConfig.findOneAndUpdate(
      { provider: cleanProvider },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return {
      provider: config.provider,
      qrImageData: config.qrImageData || null,
      instructions: config.instructions || null,
      accountName: config.accountName || null,
      accountNumber: config.accountNumber || null,
      isActive: config.isActive,
      configuredBy: config.configuredBy,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Retrieves admin-level config (includes configuredBy).
   * @param {string} adminUserId
   * @param {string} provider
   * @returns {Promise<object>}
   */
  async getProviderConfigForAdmin(adminUserId, provider) {
    await this.assertAdmin(adminUserId);
    const cleanProvider = this.validateProvider(provider);

    const config = await PaymentConfig.findOne({ provider: cleanProvider })
      .populate('configuredBy', 'name email')
      .lean();

    if (!config) {
      return null;
    }

    return config;
  }
}

export const paymentConfigService = new PaymentConfigService();
export default paymentConfigService;
