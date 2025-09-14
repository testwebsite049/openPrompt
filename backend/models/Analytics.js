import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  // Date for daily analytics aggregation
  date: {
    type: Date,
    required: true
  },
  // Prompt statistics
  prompts: {
    total: {
      type: Number,
      default: 0
    },
    published: {
      type: Number,
      default: 0
    },
    draft: {
      type: Number,
      default: 0
    },
    archived: {
      type: Number,
      default: 0
    },
    featured: {
      type: Number,
      default: 0
    },
    newToday: {
      type: Number,
      default: 0
    }
  },
  // Category statistics
  categories: {
    total: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    },
    newToday: {
      type: Number,
      default: 0
    }
  },
  // User statistics
  users: {
    total: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    },
    newToday: {
      type: Number,
      default: 0
    },
    admins: {
      type: Number,
      default: 0
    }
  },
  // Engagement statistics
  engagement: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    viewsToday: {
      type: Number,
      default: 0
    },
    downloadsToday: {
      type: Number,
      default: 0
    },
    likesToday: {
      type: Number,
      default: 0
    }
  },
  // Storage statistics
  storage: {
    totalImages: {
      type: Number,
      default: 0
    },
    totalStorageSize: {
      type: Number,
      default: 0 // in bytes
    },
    averageImageSize: {
      type: Number,
      default: 0 // in bytes
    },
    newImagesToday: {
      type: Number,
      default: 0
    }
  },
  // Cron job statistics
  cronJobs: {
    total: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    },
    executionsToday: {
      type: Number,
      default: 0
    },
    successfulToday: {
      type: Number,
      default: 0
    },
    failedToday: {
      type: Number,
      default: 0
    }
  },
  // Top performing content
  topPrompts: [{
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt'
    },
    title: String,
    views: Number,
    downloads: Number,
    likes: Number
  }],
  topCategories: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    name: String,
    promptCount: Number,
    totalViews: Number
  }],
  // System health
  system: {
    apiResponseTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    databaseResponseTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    errorRate: {
      type: Number,
      default: 0 // percentage
    },
    uptime: {
      type: Number,
      default: 100 // percentage
    }
  }
}, {
  timestamps: true
});

// Indexes
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ date: 1 }, { unique: true });

// Static method to get analytics for date range
analyticsSchema.statics.getAnalyticsForRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get latest analytics
analyticsSchema.statics.getLatest = function() {
  return this.findOne().sort({ date: -1 });
};

// Static method to aggregate analytics for dashboard
analyticsSchema.statics.getDashboardStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  const [todayStats, yesterdayStats, weekStats, monthStats] = await Promise.all([
    this.findOne({ date: today }),
    this.findOne({ date: yesterday }),
    this.getAnalyticsForRange(weekAgo, today),
    this.getAnalyticsForRange(monthAgo, today)
  ]);
  
  return {
    today: todayStats,
    yesterday: yesterdayStats,
    week: weekStats,
    month: monthStats
  };
};

export default mongoose.model('Analytics', analyticsSchema);