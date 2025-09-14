import { Category, Prompt } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/index.js';
import { body, validationResult } from 'express-validator';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    search,
    isActive,
    parent,
    sortBy = 'order',
    sortOrder = 'asc'
  } = req.query;

  // Build query object
  const query = {};

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  } else {
    // Default to active categories for public access
    if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
      query.isActive = true;
    }
  }

  // Filter by parent (for hierarchical categories)
  if (parent !== undefined) {
    query.parent = parent === 'null' ? null : parent;
  }

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [categories, total] = await Promise.all([
    Category.find(query)
      .populate('parent', 'name slug')
      .populate('subcategories')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Category.countDocuments(query)
  ]);

  // Get prompt counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const promptCount = await Prompt.countDocuments({ 
        category: category._id,
        status: 'published'
      });
      return {
        ...category,
        promptCount
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      categories: categoriesWithCounts,
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

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug color')
    .populate('subcategories');

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if user can view this category
  if (!category.isActive && 
      (!req.user || !['admin', 'moderator'].includes(req.user.role))) {
    throw new AppError('Category not found', 404);
  }

  // Get prompt count
  const promptCount = await Prompt.countDocuments({ 
    category: category._id,
    status: 'published'
  });

  const categoryData = category.toObject();
  categoryData.promptCount = promptCount;

  res.status(200).json({
    success: true,
    data: categoryData
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Moderator)
export const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    color,
    icon,
    parent,
    order,
    metaTitle,
    metaDescription
  } = req.body;

  // Check if category name already exists
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  
  if (existingCategory) {
    throw new AppError('Category with this name already exists', 400);
  }

  // Validate parent category if provided
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new AppError('Parent category not found', 400);
    }
  }

  const category = await Category.create({
    name,
    description,
    color: color || '#6B7280',
    icon,
    parent: parent || null,
    order: order || 0,
    metaTitle,
    metaDescription
  });

  await category.populate('parent', 'name slug');

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Moderator)
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const {
    name,
    description,
    color,
    icon,
    parent,
    order,
    isActive,
    metaTitle,
    metaDescription
  } = req.body;

  // Check if new name conflicts with existing category
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    
    if (existingCategory) {
      throw new AppError('Category with this name already exists', 400);
    }
  }

  // Validate parent category if provided
  if (parent && parent !== category.parent?.toString()) {
    if (parent === req.params.id) {
      throw new AppError('Category cannot be its own parent', 400);
    }
    
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new AppError('Parent category not found', 400);
    }
  }

  // Update fields
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (color) category.color = color;
  if (icon !== undefined) category.icon = icon;
  if (parent !== undefined) category.parent = parent || null;
  if (order !== undefined) category.order = order;
  if (isActive !== undefined) category.isActive = isActive;
  if (metaTitle !== undefined) category.metaTitle = metaTitle;
  if (metaDescription !== undefined) category.metaDescription = metaDescription;

  await category.save();
  await category.populate('parent', 'name slug');

  res.status(200).json({
    success: true,
    data: category,
    message: 'Category updated successfully'
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin/Moderator)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has prompts
  const promptCount = await Prompt.countDocuments({ category: req.params.id });
  if (promptCount > 0) {
    throw new AppError(`Cannot delete category with ${promptCount} prompts. Please move or delete prompts first.`, 400);
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parent: req.params.id });
  if (subcategoryCount > 0) {
    throw new AppError(`Cannot delete category with ${subcategoryCount} subcategories. Please move or delete subcategories first.`, 400);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Category deleted successfully'
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private (Admin/Moderator)
export const getCategoryStats = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Get detailed statistics
  const [
    totalPrompts,
    publishedPrompts,
    draftPrompts,
    archivedPrompts,
    featuredPrompts,
    totalViews,
    totalDownloads,
    totalLikes,
    subcategories
  ] = await Promise.all([
    Prompt.countDocuments({ category: req.params.id }),
    Prompt.countDocuments({ category: req.params.id, status: 'published' }),
    Prompt.countDocuments({ category: req.params.id, status: 'draft' }),
    Prompt.countDocuments({ category: req.params.id, status: 'archived' }),
    Prompt.countDocuments({ category: req.params.id, featured: true }),
    Prompt.aggregate([
      { $match: { category: category._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Prompt.aggregate([
      { $match: { category: category._id } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]),
    Prompt.aggregate([
      { $match: { category: category._id } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]),
    Category.countDocuments({ parent: req.params.id })
  ]);

  const stats = {
    prompts: {
      total: totalPrompts,
      published: publishedPrompts,
      draft: draftPrompts,
      archived: archivedPrompts,
      featured: featuredPrompts
    },
    engagement: {
      totalViews: totalViews[0]?.total || 0,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0
    },
    subcategories
  };

  res.status(200).json({
    success: true,
    data: {
      category,
      stats
    }
  });
});

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private (Admin/Moderator)
export const reorderCategories = asyncHandler(async (req, res) => {
  const { categories } = req.body; // Array of { id, order }

  if (!Array.isArray(categories)) {
    throw new AppError('Categories array is required', 400);
  }

  // Update order for each category
  const updatePromises = categories.map(({ id, order }) => 
    Category.findByIdAndUpdate(id, { order }, { new: true })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully'
  });
});

// Validation rules for category creation/update
export const categoryValidationRules = () => {
  return [
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Category name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9\s\-&]+$/)
      .withMessage('Category name can only contain letters, numbers, spaces, hyphens, and ampersands'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color code'),
    body('parent')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent category ID'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
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