import { BaseController } from './base.controller.js';
import { notificationService } from '../services/notification.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

/**
 * Notification Controller
 * Customer notification management endpoints.
 */
export class NotificationController extends BaseController {
  /**
   * GET /api/v1/notifications
   */
  listNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { page, limit, unreadOnly } = req.query;

    const result = await notificationService.listNotifications(userId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(result, 'Notifications retrieved')
    );
  });

  /**
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const count = await notificationService.getUnreadCount(userId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success({ unreadCount: count }, 'Unread count retrieved')
    );
  });

  /**
   * PATCH /api/v1/notifications/:notificationId/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(userId, notificationId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(notification, 'Notification marked as read')
    );
  });

  /**
   * PATCH /api/v1/notifications/mark-all-read
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const result = await notificationService.markAllAsRead(userId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(result, 'All notifications marked as read')
    );
  });
}

export const notificationController = new NotificationController();
export default notificationController;
