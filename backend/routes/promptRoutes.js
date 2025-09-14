import express from 'express';
import {
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  toggleLike,
  getLikeStatus,
  sharePrompt,
  incrementDownload,
  incrementView,
  getFeaturedPrompts,
  getAdminPrompts,
  promptValidationRules,
  validate
} from '../controllers/promptController.js';
import {
  authenticate,
  requireAdmin,
  requireModerator,
  optionalAuth
} from '../middleware/auth.js';
import {
  uploadSingle,
  handleUploadError
} from '../middleware/upload.js';
import { apiLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, optionalAuth, getPrompts);
router.get('/featured', apiLimiter, getFeaturedPrompts);
router.get('/:id', apiLimiter, optionalAuth, getPrompt);
router.get('/:id/like-status', apiLimiter, getLikeStatus);
router.post('/:id/like', apiLimiter, toggleLike);
router.post('/:id/share', apiLimiter, sharePrompt);
router.post('/:id/download', apiLimiter, incrementDownload);
router.post('/:id/view', apiLimiter, incrementView);

// Admin routes
router.get('/admin/all', authenticate, requireModerator, getAdminPrompts);

// Protected routes (Admin/Moderator only)
router.post(
  '/',
  uploadLimiter,
  authenticate,
  requireModerator,
  uploadSingle,
  handleUploadError,
  promptValidationRules(),
  validate,
  createPrompt
);

router.put(
  '/:id',
  uploadLimiter,
  authenticate,
  requireModerator,
  uploadSingle,
  handleUploadError,
  promptValidationRules(),
  validate,
  updatePrompt
);

router.delete(
  '/:id',
  authenticate,
  requireModerator,
  deletePrompt
);

export default router;