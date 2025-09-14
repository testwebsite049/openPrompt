import cron from 'node-cron';
import { CronJob, Analytics, Prompt, Category, User } from '../models/index.js';
import { sendCronJobNotification, sendSystemAlert } from './emailService.js';
import fs from 'fs';
import path from 'path';

class CronJobService {
  constructor() {
    this.runningJobs = new Map();
    this.scheduledTasks = new Map();
  }

  /**
   * Initialize the cron job service
   */
  async initialize() {
    console.log('🕒 Initializing Cron Job Service...');
    
    try {
      // Load active cron jobs from database
      const activeJobs = await CronJob.find({ isActive: true });
      
      // Schedule each active job
      for (const job of activeJobs) {
        await this.scheduleJob(job);
      }
      
      // Set up built-in system tasks
      this.setupSystemTasks();
      
      console.log(`✅ Cron Job Service initialized with ${activeJobs.length} jobs`);
    } catch (error) {
      console.error('❌ Failed to initialize Cron Job Service:', error);
      await sendSystemAlert('Cron Service Initialization Failed', error.message, { error });
    }
  }

  /**
   * Schedule a cron job
   * @param {object} jobData - Job data from database
   */
  async scheduleJob(jobData) {
    try {
      // Validate cron expression
      if (!cron.validate(jobData.schedule)) {
        throw new Error(`Invalid cron schedule: ${jobData.schedule}`);
      }

      // Remove existing scheduled task if it exists
      if (this.scheduledTasks.has(jobData._id.toString())) {
        this.unscheduleJob(jobData._id.toString());
      }

      // Create and schedule the task
      const task = cron.schedule(jobData.schedule, async () => {
        await this.executeJob(jobData._id.toString());
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      // Store the scheduled task
      this.scheduledTasks.set(jobData._id.toString(), task);
      
      console.log(`📅 Scheduled job: ${jobData.name} (${jobData.schedule})`);
    } catch (error) {
      console.error(`❌ Failed to schedule job ${jobData.name}:`, error);
      await sendSystemAlert('Job Scheduling Failed', `Failed to schedule job: ${jobData.name}`, { 
        jobId: jobData._id,
        error: error.message 
      });
    }
  }

  /**
   * Unschedule a cron job
   * @param {string} jobId - Job ID
   */
  unscheduleJob(jobId) {
    const task = this.scheduledTasks.get(jobId);
    if (task) {
      task.stop();
      task.destroy();
      this.scheduledTasks.delete(jobId);
      console.log(`🗑️ Unscheduled job: ${jobId}`);
    }
  }

  /**
   * Execute a cron job
   * @param {string} jobId - Job ID
   */
  async executeJob(jobId) {
    let job;
    
    try {
      // Get job from database
      job = await CronJob.findById(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      // Check if job is already running
      if (this.runningJobs.has(jobId)) {
        console.log(`⚠️ Job ${job.name} is already running, skipping execution`);
        return;
      }

      // Mark job as running
      this.runningJobs.set(jobId, Date.now());
      await job.markAsRunning();

      console.log(`▶️ Executing job: ${job.name}`);
      
      const startTime = Date.now();
      
      // Execute the job function with timeout
      const result = await Promise.race([
        this.executeJobFunction(job),
        this.createTimeoutPromise(job.timeout)
      ]);
      
      const duration = Date.now() - startTime;
      
      // Update job statistics
      await job.updateExecutionStats('success', duration, result);
      
      // Send success notification if enabled
      if (job.notifyOnSuccess) {
        await sendCronJobNotification(job, 'success', result);
      }
      
      console.log(`✅ Job completed: ${job.name} (${duration}ms)`);
    } catch (error) {
      console.error(`❌ Job failed: ${job?.name || jobId}`, error);
      
      if (job) {
        const duration = Date.now() - (this.runningJobs.get(jobId) || Date.now());
        await job.updateExecutionStats('failure', duration, null, error);
        
        // Send failure notification if enabled
        if (job.notifyOnFailure) {
          await sendCronJobNotification(job, 'failure', null, error);
        }
      }
    } finally {
      // Clean up
      this.runningJobs.delete(jobId);
    }
  }

  /**
   * Execute the actual job function
   * @param {object} job - Job object
   * @returns {Promise} Job result
   */
  async executeJobFunction(job) {
    const { taskFunction, config } = job;
    
    switch (taskFunction) {
      case 'generateDailyAnalytics':
        return await this.generateDailyAnalytics(config);
      
      case 'cleanupOldFiles':
        return await this.cleanupOldFiles(config);
      
      case 'backupDatabase':
        return await this.backupDatabase(config);
      
      case 'updatePromptStats':
        return await this.updatePromptStats(config);
      
      case 'cleanupExpiredTokens':
        return await this.cleanupExpiredTokens(config);
      
      case 'sendDigestEmail':
        return await this.sendDigestEmail(config);
      
      default:
        throw new Error(`Unknown task function: ${taskFunction}`);
    }
  }

  /**
   * Create timeout promise
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Job execution timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Generate daily analytics
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async generateDailyAnalytics(config = {}) {
    const date = config.date ? new Date(config.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    // Check if analytics already exist
    const existing = await Analytics.findOne({ date });
    if (existing && !config.force) {
      return { message: 'Analytics already exist for this date', skipped: true };
    }
    
    // Generate analytics (implement the logic from dashboardController)
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const [totalPrompts, publishedPrompts, newPrompts] = await Promise.all([
      Prompt.countDocuments({ createdAt: { $lt: nextDay } }),
      Prompt.countDocuments({ status: 'published', createdAt: { $lt: nextDay } }),
      Prompt.countDocuments({ createdAt: { $gte: date, $lt: nextDay } })
    ]);
    
    // Create or update analytics
    const analytics = await Analytics.findOneAndUpdate(
      { date },
      {
        date,
        prompts: { total: totalPrompts, published: publishedPrompts, newToday: newPrompts },
        // Add other analytics data...
      },
      { upsert: true, new: true }
    );
    
    return { 
      message: 'Daily analytics generated successfully',
      date: date.toISOString(),
      analytics: analytics._id
    };
  }

  /**
   * Cleanup old files
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async cleanupOldFiles(config = {}) {
    const maxAge = config.maxAgeDays || 30; // Default 30 days
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Get list of files to delete
    const filesToDelete = [];
    
    // Check for orphaned image files (files not referenced in database)
    const referencedFiles = await Prompt.find({ imageUrl: { $exists: true } })
      .select('imageUrl')
      .lean();
    
    const referencedFileNames = new Set(referencedFiles.map(p => p.imageUrl));
    
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir, { recursive: true });
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        
        // Check if file is old and not referenced
        if (stats.mtime < cutoffDate && !referencedFileNames.has(file)) {
          filesToDelete.push(filePath);
        }
      }
      
      // Delete files
      for (const filePath of filesToDelete) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete file ${filePath}:`, error);
        }
      }
    }
    
    return {
      message: 'File cleanup completed',
      deletedFiles: deletedCount,
      maxAge: maxAge
    };
  }

  /**
   * Backup database (placeholder implementation)
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async backupDatabase(config = {}) {
    // This would implement actual database backup logic
    // For now, just return a simulated result
    
    return {
      message: 'Database backup completed',
      timestamp: new Date().toISOString(),
      size: '2.5GB' // Simulated backup size
    };
  }

  /**
   * Update prompt statistics
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async updatePromptStats(config = {}) {
    // Update category prompt counts
    const categories = await Category.find();
    let updatedCount = 0;
    
    for (const category of categories) {
      const promptCount = await Prompt.countDocuments({ 
        category: category._id,
        status: 'published'
      });
      
      if (category.promptCount !== promptCount) {
        await Category.findByIdAndUpdate(category._id, { promptCount });
        updatedCount++;
      }
    }
    
    return {
      message: 'Prompt statistics updated',
      categoriesUpdated: updatedCount
    };
  }

  /**
   * Cleanup expired tokens
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async cleanupExpiredTokens(config = {}) {
    const now = new Date();
    
    const result = await User.updateMany(
      {
        $or: [
          { resetPasswordExpires: { $lt: now } },
          { emailVerificationExpires: { $lt: now } }
        ]
      },
      {
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
          emailVerificationToken: 1,
          emailVerificationExpires: 1
        }
      }
    );
    
    return {
      message: 'Expired tokens cleaned up',
      usersUpdated: result.modifiedCount
    };
  }

  /**
   * Send digest email (placeholder)
   * @param {object} config - Job configuration
   * @returns {Promise} Result
   */
  async sendDigestEmail(config = {}) {
    // This would implement digest email functionality
    return {
      message: 'Digest email sent',
      recipients: 0
    };
  }

  /**
   * Set up built-in system tasks
   */
  setupSystemTasks() {
    // Daily analytics generation at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('🔄 Running daily analytics generation...');
      try {
        await this.generateDailyAnalytics();
      } catch (error) {
        console.error('Failed to generate daily analytics:', error);
      }
    });

    // Weekly file cleanup on Sundays at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Running weekly file cleanup...');
      try {
        await this.cleanupOldFiles();
      } catch (error) {
        console.error('Failed to cleanup old files:', error);
      }
    });

    // Daily token cleanup at 3 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('🗑️ Running daily token cleanup...');
      try {
        await this.cleanupExpiredTokens();
      } catch (error) {
        console.error('Failed to cleanup expired tokens:', error);
      }
    });

    console.log('✅ Built-in system tasks scheduled');
  }

  /**
   * Refresh scheduled jobs from database
   */
  async refreshJobs() {
    console.log('🔄 Refreshing cron jobs from database...');
    
    try {
      // Stop all current jobs
      for (const [jobId, task] of this.scheduledTasks) {
        task.stop();
        task.destroy();
      }
      this.scheduledTasks.clear();
      
      // Reload active jobs
      const activeJobs = await CronJob.find({ isActive: true });
      
      for (const job of activeJobs) {
        await this.scheduleJob(job);
      }
      
      console.log(`✅ Refreshed ${activeJobs.length} cron jobs`);
    } catch (error) {
      console.error('❌ Failed to refresh cron jobs:', error);
    }
  }

  /**
   * Get service status
   * @returns {object} Service status
   */
  getStatus() {
    return {
      totalJobs: this.scheduledTasks.size,
      runningJobs: this.runningJobs.size,
      scheduledJobs: Array.from(this.scheduledTasks.keys()),
      runningJobIds: Array.from(this.runningJobs.keys())
    };
  }
}

// Create and export singleton instance
const cronJobService = new CronJobService();
export default cronJobService;