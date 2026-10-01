import { Router } from 'express';
import { paymentController } from '../../controllers/payment.controller.js';
import { paymentConfigController } from '../../controllers/paymentConfig.controller.js';
import { paymentCallbackController } from '../../controllers/paymentCallback.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount, requireAdmin } from '../../middlewares/rbac.middleware.js';
import { uploadProof } from '../../middlewares/upload.middleware.js';
import { paymentRateLimiter, paymentProofRateLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = Router();

// Provider callback routes — MUST be before auth middleware
// These are called by payment providers (eSewa, Khalti, MyPay) during redirect-back
router.get('/callback/esewa', paymentCallbackController.handleEsewaCallback);
router.get('/callback/khalti', paymentCallbackController.handleKhaltiCallback);
router.get('/callback/mypay', paymentCallbackController.handleMypayCallback);
router.post('/callback/mypay', paymentCallbackController.handleMypayCallback);

// All remaining payment routes require authentication and active account status
router.use(authenticate, requireActiveAccount);

// Payment QR Configuration (customer-facing read)
router.get('/config', paymentConfigController.getAllConfigs);
router.get('/config/:provider', paymentConfigController.getProviderConfig);

// Admin-only QR configuration management
router.put('/config/:provider', requireAdmin, paymentConfigController.setProviderConfig);

// Initialize a payment submission with rate protection
router.post('/initialize', paymentRateLimiter, paymentController.createPaymentSubmission);

// Submit payment proof (transaction code and/or uploaded proof receipt image) with rate protection
router.post('/:paymentId/proof', paymentProofRateLimiter, uploadProof.single('paymentProof'), paymentController.submitPaymentProof);

// Retrieve payment submission details
router.get('/:paymentId', paymentController.getPaymentDetails);

// Retrieve payment proof securely (protected: owner customer or admin only)
router.get('/:paymentId/proof', paymentController.getPaymentProof);

export default router;


