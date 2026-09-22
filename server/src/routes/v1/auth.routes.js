import { Router } from 'express';
import { getMe } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Current authenticated user
router.get('/me', requireAuth, getMe);

export default router;
