import express from 'express';
import {
  getDashboardOverview,
  getTopContent
} from '../controllers/dashboardController.js';
import {
  authenticate,
  requireModerator
} from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard overview and top content (Admin/Moderator)
router.get('/overview', apiLimiter, requireModerator, getDashboardOverview);
router.get('/top-content', apiLimiter, requireModerator, getTopContent);

export default router;