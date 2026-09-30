import { BaseController } from './base.controller.js';
import { paymentConfigService } from '../services/paymentConfig.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * PaymentConfig Controller
 * Exposes QR configuration endpoints for checkout and admin management.
 */
export class PaymentConfigController extends BaseController {
  /**
   * GET /api/v1/payments/config/:provider
   * Retrieves the QR configuration for a specific payment provider.
   * Available to authenticated customers during checkout.
   */
  getProviderConfig = asyncHandler(async (req, res) => {
    const { provider } = req.params;

    const config = await paymentConfigService.getProviderConfig(provider);

    if (!config) {
      return res.status(HTTP_STATUS.OK).json(
        ApiResponse.success(null, `No active QR configuration for ${provider}`)
      );
    }

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(config, `${provider} payment configuration retrieved`)
    );
  });

  /**
   * GET /api/v1/payments/config
   * Retrieves all payment provider configurations.
   */
  getAllConfigs = asyncHandler(async (req, res) => {
    const configs = await paymentConfigService.getAllProviderConfigs();

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(configs, 'Payment configurations retrieved')
    );
  });

  /**
   * PUT /api/v1/payments/config/:provider
   * Sets or updates QR configuration for a payment provider (Admin only).
   */
  setProviderConfig = asyncHandler(async (req, res) => {
    const adminUserId = req.user.id || req.user._id;
    const { provider } = req.params;
    const { qrImageData, instructions, accountName, accountNumber, isActive } = req.body;

    const config = await paymentConfigService.setProviderConfig(adminUserId, provider, {
      qrImageData,
      instructions,
      accountName,
      accountNumber,
      isActive,
    });

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(config, `${provider} payment configuration updated`)
    );
  });
}

export const paymentConfigController = new PaymentConfigController();
export default paymentConfigController;
