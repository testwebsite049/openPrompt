import mongoose from 'mongoose';

const cronJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  // Cron schedule expression (e.g., '0 0 * * *' for daily at midnight)
  schedule: {
    type: String,
    required: true,
    trim: true
  },
  // Job type/category
  type: {
    type: String,
    enum: ['cleanup', 'backup', 'analytics', 'maintenance', 'notification', 'sync', 'other'],
    default: 'other'
  },
  // Function to execute
  taskFunction: {
    type: String,
    required: true,
    trim: true
  },
  // Job configuration/parameters
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  // Execution tracking
  lastExecutedAt: {
    type: Date
  },
  nextExecutionAt: {
    type: Date
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  // Last execution details
  lastExecutionStatus: {
    type: String,
    enum: ['success', 'failure', 'timeout', 'cancelled'],
    default: null
  },
  lastExecutionDuration: {
    type: Number, // in milliseconds
    default: 0
  },
  lastExecutionResult: {
    type: mongoose.Schema.Types.Mixed
  },
  lastError: {
    message: String,
    stack: String,
    timestamp: Date
  },
  // Timeout and retry settings
  timeout: {
    type: Number,
    default: 300000 // 5 minutes in milliseconds
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  retryDelay: {
    type: Number,
    default: 5000 // 5 seconds in milliseconds
  },
  // Notifications
  notifyOnSuccess: {
    type: Boolean,
    default: false
  },
  notifyOnFailure: {
    type: Boolean,
    default: true
  },
  notificationEmails: [{
    type: String,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }],
  // Priority (higher number = higher priority)
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 30
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cronJobSchema.index({ name: 1 }, { unique: true });
cronJobSchema.index({ isActive: 1, nextExecutionAt: 1 });
cronJobSchema.index({ type: 1, isActive: 1 });

// Virtual for success rate
cronJobSchema.virtual('successRate').get(function() {
  if (this.executionCount === 0) return 0;
  return ((this.successCount / this.executionCount) * 100).toFixed(2);
});

// Virtual for failure rate
cronJobSchema.virtual('failureRate').get(function() {
  if (this.executionCount === 0) return 0;
  return ((this.failureCount / this.executionCount) * 100).toFixed(2);
});

// Virtual for average execution time
cronJobSchema.virtual('averageExecutionTime').get(function() {
  return this.lastExecutionDuration || 0;
});

// Method to update execution stats
cronJobSchema.methods.updateExecutionStats = function(status, duration, result, error) {
  this.lastExecutedAt = new Date();
  this.lastExecutionStatus = status;
  this.lastExecutionDuration = duration;
  this.lastExecutionResult = result;
  this.executionCount += 1;
  
  if (status === 'success') {
    this.successCount += 1;
    this.lastError = undefined;
  } else {
    this.failureCount += 1;
    if (error) {
      this.lastError = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      };
    }
  }
  
  this.isRunning = false;
  return this.save();
};

// Method to mark job as running
cronJobSchema.methods.markAsRunning = function() {
  this.isRunning = true;
  return this.save();
};

export default mongoose.model('CronJob', cronJobSchema);