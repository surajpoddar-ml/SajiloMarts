import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import quoteRoutes from './quote.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import shippingRoutes from './shipping.routes.js';
import reviewRoutes from './review.routes.js';
import couponRoutes from './coupon.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import productRequestRoutes from './productRequest.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/requests', productRequestRoutes);
router.use('/product-requests', productRequestRoutes);
router.use('/categories', categoryRoutes);
router.use('/quotes', quoteRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/shipping', shippingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export const getV1RoutesList = () => [
  '/health',
  '/auth',
  '/users',
  '/products',
  '/requests',
  '/categories',
  '/quotes',
  '/orders',
  '/payments',
  '/shipping',
  '/reviews',
  '/coupons',
  '/notifications',
  '/admin',
];

export default router;
