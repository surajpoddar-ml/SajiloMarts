import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Sourcing Request routes will be registered here with authentication & validation
router.use(authenticate);
router.use(requireActiveAccount);

export default router;
