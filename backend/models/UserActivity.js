import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  // For anonymous users, we'll use IP or session ID
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: {
    type: String
  },
  // User ID if authenticated (optional)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  // Activity tracking
  likedPrompts: [{
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharedPrompts: [{
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true
    },
    shareType: {
      type: String,
      enum: ['copy', 'twitter', 'facebook', 'linkedin', 'email', 'whatsapp', 'telegram', 'native'],
      required: true
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewedPrompts: [{
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
userActivitySchema.index({ sessionId: 1, 'likedPrompts.promptId': 1 });
userActivitySchema.index({ sessionId: 1, 'sharedPrompts.promptId': 1 });
userActivitySchema.index({ ipAddress: 1, createdAt: -1 });

// TTL index to automatically clean up old anonymous sessions after 30 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Method to check if user has liked a prompt
userActivitySchema.methods.hasLikedPrompt = function(promptId) {
  return this.likedPrompts.some(like => 
    like.promptId.toString() === promptId.toString()
  );
};

// Method to check if user has shared a prompt
userActivitySchema.methods.hasSharedPrompt = function(promptId) {
  return this.sharedPrompts.some(share => 
    share.promptId.toString() === promptId.toString()
  );
};

// Static method to find or create user activity
userActivitySchema.statics.findOrCreateBySession = async function(sessionId, ipAddress, userAgent, userId = null) {
  let activity = await this.findOne({ sessionId });
  
  if (!activity) {
    activity = await this.create({
      sessionId,
      ipAddress,
      userAgent,
      userId,
      likedPrompts: [],
      sharedPrompts: [],
      viewedPrompts: []
    });
  } else if (userId && !activity.userId) {
    // Update with user ID if user logs in
    activity.userId = userId;
    await activity.save();
  }
  
  return activity;
};

export default mongoose.model('UserActivity', userActivitySchema);