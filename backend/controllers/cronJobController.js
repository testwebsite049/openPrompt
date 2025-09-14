import { CronJob } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/index.js';
import { body, validationResult } from 'express-validator';

// @desc    Get all cron jobs
// @route   GET /api/cron-jobs
// @access  Private (Admin only)
export const getCronJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query object
  const query = {};

  if (type) query.type = type;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [cronJobs, total] = await Promise.all([
    CronJob.find(query)
      .populate('createdBy', 'email profile.firstName profile.lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CronJob.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: {
      cronJobs,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single cron job by ID
// @route   GET /api/cron-jobs/:id
// @access  Private (Admin only)
export const getCronJob = asyncHandler(async (req, res) => {
  const cronJob = await CronJob.findById(req.params.id)
    .populate('createdBy', 'email profile.firstName profile.lastName');

  if (!cronJob) {
    throw new AppError('Cron job not found', 404);
  }

  res.status(200).json({
    success: true,
    data: cronJob
  });
});

// @desc    Create new cron job
// @route   POST /api/cron-jobs
// @access  Private (Admin only)
export const createCronJob = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    schedule,
    type,
    taskFunction,
    config,
    timeout,
    maxRetries,
    retryDelay,
    notifyOnSuccess,
    notifyOnFailure,
    notificationEmails,
    priority,
    tags
  } = req.body;

  // Check if cron job name already exists
  const existingJob = await CronJob.findOne({ name });
  if (existingJob) {
    throw new AppError('Cron job with this name already exists', 400);
  }

  // Calculate next execution time (basic implementation)
  const nextExecutionAt = calculateNextExecution(schedule);

  const cronJob = await CronJob.create({
    name,
    description,
    schedule,
    type: type || 'other',
    taskFunction,
    config: config || {},
    timeout: timeout || 300000,
    maxRetries: maxRetries || 3,
    retryDelay: retryDelay || 5000,
    notifyOnSuccess: notifyOnSuccess || false,
    notifyOnFailure: notifyOnFailure !== false,
    notificationEmails: notificationEmails || [],
    priority: priority || 5,
    tags: tags || [],
    nextExecutionAt,
    createdBy: req.user._id
  });

  await cronJob.populate('createdBy', 'email profile.firstName profile.lastName');

  res.status(201).json({
    success: true,
    data: cronJob,
    message: 'Cron job created successfully'
  });
});

// @desc    Update cron job
// @route   PUT /api/cron-jobs/:id
// @access  Private (Admin only)
export const updateCronJob = asyncHandler(async (req, res) => {
  let cronJob = await CronJob.findById(req.params.id);

  if (!cronJob) {
    throw new AppError('Cron job not found', 404);
  }

  // Don't allow updating running jobs
  if (cronJob.isRunning) {
    throw new AppError('Cannot update a running cron job', 400);
  }

  const {
    name,
    description,
    schedule,
    type,
    taskFunction,
    config,
    isActive,
    timeout,
    maxRetries,
    retryDelay,
    notifyOnSuccess,
    notifyOnFailure,
    notificationEmails,
    priority,
    tags
  } = req.body;

  // Check if new name conflicts with existing job
  if (name && name !== cronJob.name) {
    const existingJob = await CronJob.findOne({ 
      name,
      _id: { $ne: req.params.id }
    });
    if (existingJob) {
      throw new AppError('Cron job with this name already exists', 400);
    }
  }

  // Update fields
  if (name) cronJob.name = name;
  if (description !== undefined) cronJob.description = description;
  if (schedule) {
    cronJob.schedule = schedule;
    cronJob.nextExecutionAt = calculateNextExecution(schedule);
  }
  if (type) cronJob.type = type;
  if (taskFunction) cronJob.taskFunction = taskFunction;
  if (config !== undefined) cronJob.config = config;
  if (isActive !== undefined) cronJob.isActive = isActive;
  if (timeout !== undefined) cronJob.timeout = timeout;
  if (maxRetries !== undefined) cronJob.maxRetries = maxRetries;
  if (retryDelay !== undefined) cronJob.retryDelay = retryDelay;
  if (notifyOnSuccess !== undefined) cronJob.notifyOnSuccess = notifyOnSuccess;
  if (notifyOnFailure !== undefined) cronJob.notifyOnFailure = notifyOnFailure;
  if (notificationEmails !== undefined) cronJob.notificationEmails = notificationEmails;
  if (priority !== undefined) cronJob.priority = priority;
  if (tags !== undefined) cronJob.tags = tags;

  await cronJob.save();
  await cronJob.populate('createdBy', 'email profile.firstName profile.lastName');

  res.status(200).json({
    success: true,
    data: cronJob,
    message: 'Cron job updated successfully'
  });
});

// @desc    Delete cron job
// @route   DELETE /api/cron-jobs/:id
// @access  Private (Admin only)
export const deleteCronJob = asyncHandler(async (req, res) => {
  const cronJob = await CronJob.findById(req.params.id);

  if (!cronJob) {
    throw new AppError('Cron job not found', 404);
  }

  // Don't allow deleting running jobs
  if (cronJob.isRunning) {
    throw new AppError('Cannot delete a running cron job', 400);
  }

  await CronJob.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Cron job deleted successfully'
  });
});

// @desc    Execute cron job manually
// @route   POST /api/cron-jobs/:id/execute
// @access  Private (Admin only)
export const executeCronJob = asyncHandler(async (req, res) => {
  const cronJob = await CronJob.findById(req.params.id);

  if (!cronJob) {
    throw new AppError('Cron job not found', 404);
  }

  if (!cronJob.isActive) {
    throw new AppError('Cannot execute inactive cron job', 400);
  }

  if (cronJob.isRunning) {
    throw new AppError('Cron job is already running', 400);
  }

  // Mark as running
  await cronJob.markAsRunning();

  // Execute job (this would be implemented based on your job types)
  try {
    const startTime = Date.now();
    
    // Here you would implement the actual job execution logic
    // For now, we'll simulate a job execution
    const result = await executeJobFunction(cronJob.taskFunction, cronJob.config);
    
    const duration = Date.now() - startTime;
    
    // Update execution stats
    await cronJob.updateExecutionStats('success', duration, result);

    res.status(200).json({
      success: true,
      data: {
        executionTime: duration,
        result
      },
      message: 'Cron job executed successfully'
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    await cronJob.updateExecutionStats('failure', duration, null, error);

    throw new AppError(`Job execution failed: ${error.message}`, 500);
  }
});

// @desc    Get cron job execution history
// @route   GET /api/cron-jobs/:id/history
// @access  Private (Admin only)
export const getCronJobHistory = asyncHandler(async (req, res) => {
  const cronJob = await CronJob.findById(req.params.id);

  if (!cronJob) {
    throw new AppError('Cron job not found', 404);
  }

  // In a real implementation, you'd have a separate ExecutionHistory model
  // For now, we'll return the job's execution stats
  const history = {
    job: cronJob,
    stats: {
      totalExecutions: cronJob.executionCount,
      successfulExecutions: cronJob.successCount,
      failedExecutions: cronJob.failureCount,
      successRate: cronJob.successRate,
      lastExecution: {
        status: cronJob.lastExecutionStatus,
        duration: cronJob.lastExecutionDuration,
        timestamp: cronJob.lastExecutedAt,
        result: cronJob.lastExecutionResult,
        error: cronJob.lastError
      }
    }
  };

  res.status(200).json({
    success: true,
    data: history
  });
});

// @desc    Get cron jobs statistics
// @route   GET /api/cron-jobs/stats
// @access  Private (Admin only)
export const getCronJobsStats = asyncHandler(async (req, res) => {
  const [
    totalJobs,
    activeJobs,
    runningJobs,
    successfulJobs,
    failedJobs,
    jobsByType
  ] = await Promise.all([
    CronJob.countDocuments(),
    CronJob.countDocuments({ isActive: true }),
    CronJob.countDocuments({ isRunning: true }),
    CronJob.countDocuments({ lastExecutionStatus: 'success' }),
    CronJob.countDocuments({ lastExecutionStatus: 'failure' }),
    CronJob.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  const stats = {
    overview: {
      total: totalJobs,
      active: activeJobs,
      running: runningJobs,
      successful: successfulJobs,
      failed: failedJobs
    },
    byType: jobsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {})
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Helper function to calculate next execution time
function calculateNextExecution(schedule) {
  // This is a simplified implementation
  // In production, you'd use a proper cron parser like 'cron-parser'
  return new Date(Date.now() + 60000); // Next minute for demo
}

// Helper function to execute job function
async function executeJobFunction(taskFunction, config) {
  // This would contain the actual job execution logic
  // based on the taskFunction name and config
  switch (taskFunction) {
    case 'cleanupOldFiles':
      return { message: 'Old files cleaned up', filesDeleted: 5 };
    case 'generateAnalytics':
      return { message: 'Analytics generated', recordsProcessed: 100 };
    case 'backupDatabase':
      return { message: 'Database backed up', size: '2.5GB' };
    default:
      return { message: 'Task completed' };
  }
}

// Validation rules for cron job creation/update
export const cronJobValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Job name must be between 3 and 100 characters'),
    body('schedule')
      .matches(/^[\d\*\-\,\/\s]+$/)
      .withMessage('Invalid cron schedule format'),
    body('taskFunction')
      .isLength({ min: 1 })
      .withMessage('Task function is required'),
    body('type')
      .optional()
      .isIn(['cleanup', 'backup', 'analytics', 'maintenance', 'notification', 'sync', 'other'])
      .withMessage('Invalid job type'),
    body('priority')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Priority must be between 1 and 10')
  ];
};

// Handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
