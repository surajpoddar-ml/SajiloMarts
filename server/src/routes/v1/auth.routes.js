import { Router } from 'express';
import { register, login, getMe, logout } from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { validateRegistrationInput, validateLoginInput } from '../../validations/auth.validation.js';

const router = Router();

// Public registration & login with input validation and rate limiting
router.post('/register', authRateLimiter, validateBody(validateRegistrationInput), register);
router.post('/login', authRateLimiter, validateBody(validateLoginInput), login);

// Current authenticated user
router.get('/me', requireAuth, getMe);

// Secure logout
router.post('/logout', logout);

export default router;
