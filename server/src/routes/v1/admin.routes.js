import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/rbac.middleware.js';
import {
  getAdminStatus,
  getCustomers,
  getCustomerById,
  updateCustomer,
  getSourcingRequests,
  getPaymentSubmissions,
} from '../../controllers/admin.controller.js';

const router = Router();

// Protect all administrative routes with authentication and admin role guard
router.use(requireAuth, requireAdmin);

router.get('/status', getAdminStatus);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.patch('/customers/:id', updateCustomer);
router.get('/sourcing-requests', getSourcingRequests);
router.get('/payments', getPaymentSubmissions);

export default router;
