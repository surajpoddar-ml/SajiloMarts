import { Router } from 'express';
import { trackingController } from '../../controllers/tracking.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Public tracking by order number — no auth required
router.get('/public/:orderNumber', trackingController.getPublicTracking);

export default router;
