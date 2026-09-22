import { Router } from 'express';
import { register, login, getMe, logout } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public registration & login
router.post('/register', register);
router.post('/login', login);

// Current authenticated user
router.get('/me', requireAuth, getMe);

// Secure logout
router.post('/logout', logout);

export default router;
