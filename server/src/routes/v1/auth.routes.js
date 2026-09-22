import { Router } from 'express';
import { getMe, logout } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Current authenticated user
router.get('/me', requireAuth, getMe);

// Secure logout
router.post('/logout', logout);

export default router;
