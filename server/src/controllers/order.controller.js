import { BaseController } from './base.controller.js';
import { orderService } from '../services/order.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class OrderController extends BaseController {
  /**
   * GET /api/v1/orders/current
   * Retrieves active in-flight customer orders.
   */
  getCurrentOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const result = await orderService.getCurrentOrders(userId, req.query);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(
        result.orders,
        result.pagination,
        'Current orders retrieved successfully'
      )
    );
  });

  /**
   * GET /api/v1/orders/history
   * Retrieves completed / delivered / cancelled order history.
   */
  getOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const result = await orderService.getOrderHistory(userId, req.query);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(
        result.orders,
        result.pagination,
        'Order history retrieved successfully'
      )
    );
  });

  /**
   * GET /api/v1/orders/:orderId
   * Retrieves customer order detail with ownership protection.
   */
  getOrderDetail = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const orderId = req.params.orderId || req.params.id;

    const order = await orderService.getOrderDetailForCustomer(userId, orderId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(order, 'Order detail retrieved successfully')
    );
  });
}

export const orderController = new OrderController();
export default orderController;
