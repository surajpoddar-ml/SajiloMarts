import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { trackingController } from '../../controllers/tracking.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount, requireAdmin } from '../../middlewares/rbac.middleware.js';
import { validateCreateOrderPayload, validateUpdateOrderStatusPayload } from '../../validations/order.validation.js';

const router = Router();

router.use(requireAuth, requireActiveAccount);

router.get('/current', orderController.getCurrentOrders);
router.get('/my/current', orderController.getCurrentOrders);
router.get('/history', orderController.getOrderHistory);
router.get('/my/history', orderController.getOrderHistory);
router.post('/create', validateCreateOrderPayload, orderController.createOrder);
router.get('/:orderId', orderController.getOrderDetail);

// Authenticated customer order tracking with ownership verification
router.get('/:orderId/tracking', trackingController.getOrderTracking);

// Privileged Order Status Update (Admin only with transition validation)
router.patch('/:orderId/status', requireAdmin, validateUpdateOrderStatusPayload, orderController.updateOrderStatus);

export default router;



