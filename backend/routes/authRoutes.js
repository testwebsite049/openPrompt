import express from 'express';
import {
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  adminLogin,
  verifyAdmin,
  loginValidationRules,
  changePasswordValidationRules,
  adminLoginValidationRules,
  validate
} from '../controllers/authController.js';
import {
  authenticate,
  requireAdmin
} from '../middleware/auth.js';
import {
  authLimiter,
  apiLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting
router.post(
  '/login',
  authLimiter,
  loginValidationRules(),
  validate,
  login
);

router.post(
  '/admin-login',
  authLimiter,
  adminLoginValidationRules(),
  validate,
  adminLogin
);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', apiLimiter, authenticate, updateProfile);
router.put(
  '/change-password',
  apiLimiter,
  authenticate,
  changePasswordValidationRules(),
  validate,
  changePassword
);
router.post('/logout', authenticate, logout);

// Admin verification route
router.get('/verify-admin', authenticate, requireAdmin, verifyAdmin);

export default router;