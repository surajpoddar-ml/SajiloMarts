import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/rbac.middleware.js';
import { ApiResponse } from '../../utils/apiResponse.js';

const router = Router();

// Protect all admin endpoints with authentication and administrative role guard
router.use(requireAuth, requireAdmin);

/**
 * Admin health / verification probe endpoint.
 */
router.get('/status', (req, res) => {
  return ApiResponse.success({
    authorized: true,
    role: req.user.role,
    user: req.user,
  }, 'Administrative access authorized').send(res);
});

export default router;
