import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  color: {
    type: String,
    trim: true,
    match: /^#[0-9A-F]{6}$/i, // Hex color validation
    default: '#6B7280' // Default gray color
  },
  icon: {
    type: String,
    trim: true,
    maxLength: 50 // For icon class names or Unicode
  },
  // Category hierarchy (for subcategories)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Display order
  order: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  // SEO and metadata
  metaTitle: {
    type: String,
    trim: true,
    maxLength: 100
  },
  metaDescription: {
    type: String,
    trim: true,
    maxLength: 300
  },
  // Analytics
  promptCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1, order: 1 });
categorySchema.index({ isActive: 1, order: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export default mongoose.model('Category', categorySchema);