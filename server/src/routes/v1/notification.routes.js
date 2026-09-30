import { Router } from 'express';
import { notificationController } from '../../controllers/notification.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(requireAuth, requireActiveAccount);

// List notifications with pagination
router.get('/', notificationController.listNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Mark individual notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

export default router;
