import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(requireAuth, requireActiveAccount);

router.get('/current', orderController.getCurrentOrders);
router.get('/my/current', orderController.getCurrentOrders);
router.get('/history', orderController.getOrderHistory);
router.get('/my/history', orderController.getOrderHistory);
router.post('/create', orderController.createOrder);
router.get('/:orderId', orderController.getOrderDetail);

export default router;

