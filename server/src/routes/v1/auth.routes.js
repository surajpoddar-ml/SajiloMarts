import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  logout,
  updateProfile,
} from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import {
  authRateLimiter,
  verificationRateLimiter,
  passwordRecoveryRateLimiter,
  passwordChangeRateLimiter,
} from '../../middlewares/rateLimiter.middleware.js';
import {
  validateRegistrationInput,
  validateLoginInput,
  validateVerifyEmailInput,
  validateResendVerificationInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
  validateUpdateProfileInput,
} from '../../validations/auth.validation.js';

const router = Router();

// Public registration, login & Google OAuth with rate limiting
router.post('/register', authRateLimiter, validateBody(validateRegistrationInput), register);
router.post('/login', authRateLimiter, validateBody(validateLoginInput), login);
router.post('/google', authRateLimiter, googleAuth);

// Email verification & resend
router.post('/verify-email', verificationRateLimiter, validateBody(validateVerifyEmailInput), verifyEmail);
router.post('/resend-verification', verificationRateLimiter, validateBody(validateResendVerificationInput), resendVerification);

// Password recovery & reset
router.post('/forgot-password', passwordRecoveryRateLimiter, validateBody(validateForgotPasswordInput), forgotPassword);
router.post('/reset-password', passwordRecoveryRateLimiter, validateBody(validateResetPasswordInput), resetPassword);

// Authenticated password change
router.post('/change-password', requireAuth, passwordChangeRateLimiter, validateBody(validateChangePasswordInput), changePassword);

// Current authenticated user
router.get('/me', requireAuth, getMe);

// Update customer profile (whitelisted fields: name, phone)
router.patch('/profile', requireAuth, validateBody(validateUpdateProfileInput), updateProfile);

// Secure logout
router.post('/logout', logout);

export default router;
