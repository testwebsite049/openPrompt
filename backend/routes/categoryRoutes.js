import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  reorderCategories,
  categoryValidationRules,
  validate
} from '../controllers/categoryController.js';
import {
  authenticate,
  requireAdmin,
  requireModerator,
  optionalAuth
} from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, optionalAuth, getCategories);
router.get('/:id', apiLimiter, optionalAuth, getCategory);

// Protected routes (Admin/Moderator only)
router.post(
  '/',
  apiLimiter,
  authenticate,
  requireModerator,
  categoryValidationRules(),
  validate,
  createCategory
);

router.put(
  '/:id',
  apiLimiter,
  authenticate,
  requireModerator,
  categoryValidationRules(),
  validate,
  updateCategory
);

router.delete(
  '/:id',
  apiLimiter,
  authenticate,
  requireModerator,
  deleteCategory
);

router.get(
  '/:id/stats',
  apiLimiter,
  authenticate,
  requireModerator,
  getCategoryStats
);

router.put(
  '/reorder',
  apiLimiter,
  authenticate,
  requireModerator,
  reorderCategories
);

export default router;