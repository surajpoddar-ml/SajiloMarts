import { Router } from 'express';
import { paymentController } from '../../controllers/payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';
import { uploadProof } from '../../middlewares/upload.middleware.js';
import { paymentRateLimiter, paymentProofRateLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = Router();

// All payment routes require authentication and active account status
router.use(authenticate, requireActiveAccount);

// Initialize a payment submission with rate protection
router.post('/initialize', paymentRateLimiter, paymentController.createPaymentSubmission);

// Submit payment proof (transaction code and/or uploaded proof receipt image) with rate protection
router.post('/:paymentId/proof', paymentProofRateLimiter, uploadProof.single('paymentProof'), paymentController.submitPaymentProof);

// Retrieve payment submission details
router.get('/:paymentId', paymentController.getPaymentDetails);

// Retrieve payment proof securely (protected: owner customer or admin only)
router.get('/:paymentId/proof', paymentController.getPaymentProof);

export default router;
