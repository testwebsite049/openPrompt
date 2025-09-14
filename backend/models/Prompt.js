import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 10000
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    trim: true
  },
  imageAlt: {
    type: String,
    trim: true,
    maxLength: 200
  },
  imageWidth: {
    type: Number
  },
  imageHeight: {
    type: Number
  },
  // Enhanced fields from your admin panel
  author: {
    type: String,
    trim: true,
    maxLength: 100
  },
  aiModelCompatibility: [{
    type: String,
    enum: ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini', 'PaLM', 'Other'],
    default: 'GPT-4'
  }],
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  estimatedTime: {
    type: String,
    trim: true,
    maxLength: 50
  },
  usageInstructions: {
    type: String,
    trim: true,
    maxLength: 2000
  },
  outputFormat: {
    type: String,
    enum: ['Text', 'JSON', 'Markdown', 'HTML', 'Code', 'List', 'Other'],
    default: 'Text'
  },
  licenseType: {
    type: String,
    enum: ['MIT', 'Apache 2.0', 'GPL', 'Creative Commons', 'Proprietary', 'Public Domain'],
    default: 'MIT'
  },
  // Analytics and metadata
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  // User engagement tracking (arrays to store user IDs)
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  // SEO and search
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  keywords: [{
    type: String,
    trim: true,
    maxLength: 30
  }],
  // File information
  originalFileName: String,
  fileSize: Number,
  mimeType: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
promptSchema.index({ title: 'text', description: 'text', tags: 'text' });
promptSchema.index({ category: 1, status: 1 });
promptSchema.index({ featured: 1, createdAt: -1 });
promptSchema.index({ slug: 1 }, { unique: true });

// Virtual for URL-friendly ID
promptSchema.virtual('urlId').get(function() {
  return this._id.toHexString();
});

// Pre-save middleware to generate slug
promptSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
  next();
});

export default mongoose.model('Prompt', promptSchema);