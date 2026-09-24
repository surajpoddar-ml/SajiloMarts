import { Router } from 'express';
import { quoteController } from '../../controllers/quote.controller.js';

const router = Router();

// Public / Authenticated dynamic quote preview calculation
router.post('/calculate', quoteController.calculateQuote);
router.post('/preview', quoteController.calculateQuote);

export default router;
