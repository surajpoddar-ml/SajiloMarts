import { Router } from 'express';
import { quoteController } from '../../controllers/quote.controller.js';
import { quoteRateLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = Router();

// Public / Authenticated dynamic quote preview calculation
router.post('/calculate', quoteRateLimiter, quoteController.calculateQuote);
router.post('/preview', quoteRateLimiter, quoteController.calculateQuote);

export default router;
