import { BaseController } from './base.controller.js';
import { trackingService } from '../services/tracking.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Tracking Controller
 * Exposes customer order tracking and public order number lookup endpoints.
 */
export class TrackingController extends BaseController {
  /**
   * GET /api/v1/orders/:orderId/tracking
   * Retrieves full tracking timeline for an authenticated customer's order.
   */
  getOrderTracking = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const orderId = req.params.orderId || req.params.id;

    const tracking = await trackingService.getOrderTracking(userId, orderId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(tracking, 'Order tracking retrieved successfully')
    );
  });

  /**
   * GET /api/v1/tracking/public/:orderNumber
   * Public tracking lookup by order number — returns minimal status data only.
   */
  getPublicTracking = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;

    const tracking = await trackingService.getPublicTrackingByOrderNumber(orderNumber);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(tracking, 'Tracking status retrieved')
    );
  });
}

export const trackingController = new TrackingController();
export default trackingController;
