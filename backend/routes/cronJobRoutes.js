import express from 'express';
import {
  getCronJobs,
  getCronJob,
  createCronJob,
  updateCronJob,
  deleteCronJob,
  executeCronJob,
  getCronJobHistory,
  getCronJobsStats,
  cronJobValidationRules,
  validate
} from '../controllers/cronJobController.js';
import {
  authenticate,
  requireAdmin
} from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes require admin access
router.use(authenticate);
router.use(requireAdmin);

// CRUD routes
router.get('/', apiLimiter, getCronJobs);
router.get('/stats', apiLimiter, getCronJobsStats);
router.get('/:id', apiLimiter, getCronJob);
router.get('/:id/history', apiLimiter, getCronJobHistory);

router.post(
  '/',
  apiLimiter,
  cronJobValidationRules(),
  validate,
  createCronJob
);

router.put(
  '/:id',
  apiLimiter,
  cronJobValidationRules(),
  validate,
  updateCronJob
);

router.delete('/:id', apiLimiter, deleteCronJob);

// Execution routes
router.post('/:id/execute', apiLimiter, executeCronJob);

export default router;