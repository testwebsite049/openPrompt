import { Prompt, Category, UserActivity } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/index.js';
import { deleteCloudinaryImage, extractPublicIdFromUrl } from '../middleware/upload.js';
import { generateImageVariants } from '../config/cloudinary.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

// Helper function to generate session ID from IP and User Agent
const generateSessionId = (ip, userAgent) => {
  return crypto.createHash('sha256')
    .update(`${ip}_${userAgent}_${Date.now()}`)
    .digest('hex')
    .substring(0, 32);
};

// Helper function to get or create user activity
const getUserActivity = async (req) => {
  const sessionId = req.headers['x-session-id'] || 
                   req.session?.id || 
                   generateSessionId(req.ip, req.get('User-Agent') || 'unknown');
  
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';
  const userId = req.user?._id || null;
  
  return await UserActivity.findOrCreateBySession(
    sessionId, 
    ipAddress, 
    userAgent, 
    userId
  );
};


// @desc    Get all prompts with filtering, sorting, and pagination
// @route   GET /api/prompts
// @access  Public
export const getPrompts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = 'published',
    featured,
    difficulty,
    aiModel
  } = req.query;

  // Build query object
  const query = {};

  // Filter by status (public users only see published)
  if (req.user?.role === 'admin' || req.user?.role === 'moderator') {
    if (status === 'all') {
      // Admin can see all statuses
    } else if (status) {
      query.status = status;
    }
  } else {
    query.status = 'published';
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by featured
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  // Filter by difficulty
  if (difficulty) {
    query.difficultyLevel = difficulty;
  }

  // Filter by AI model
  if (aiModel) {
    query.aiModelCompatibility = { $in: [aiModel] };
  }

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
      { keywords: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Admin panel might need higher limits
  const maxLimit = req.user?.role === 'admin' || req.user?.role === 'moderator' ? 1000 : 50;
  const actualLimit = Math.min(Number(limit), maxLimit);

  // Execute query with pagination
  const skip = (page - 1) * actualLimit;
  
  const [prompts, total] = await Promise.all([
    Prompt.find(query)
      .populate('category', 'name slug color')
      .sort(sortOptions)
      .skip(skip)
      .limit(actualLimit)
      .lean(),
    Prompt.countDocuments(query)
  ]);

  // Add full image URLs with variants
  const promptsWithUrls = prompts.map(prompt => {
    let imageData = null;
    
    if (prompt.imageUrl) {
      // If it's a Cloudinary URL, generate variants
      if (prompt.cloudinaryPublicId) {
        imageData = {
          ...generateImageVariants(prompt.cloudinaryPublicId),
          publicId: prompt.cloudinaryPublicId
        };
      } else {
        // Fallback for legacy URLs
        imageData = {
          original: prompt.imageUrl,
          large: prompt.imageUrl,
          medium: prompt.imageUrl,
          small: prompt.imageUrl,
          thumbnail: prompt.imageUrl
        };
      }
    }
    
    return {
      ...prompt,
      imageUrl: prompt.imageUrl,
      imageVariants: imageData
    };
  });

  res.status(200).json({
    success: true,
    data: {
      prompts: promptsWithUrls,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / actualLimit),
        total,
        hasNext: page * actualLimit < total,
        hasPrev: page > 1,
        limit: actualLimit
      }
    }
  });
});

// @desc    Get single prompt by ID
// @route   GET /api/prompts/:id
// @access  Public
export const getPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id)
    .populate('category', 'name slug color description');

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  // Check if user can view this prompt
  if (prompt.status !== 'published' && 
      (!req.user || !['admin', 'moderator'].includes(req.user.role))) {
    throw new AppError('Prompt not found', 404);
  }

  // Note: View count increment moved to separate endpoint for better tracking control
  // This allows frontend to control when views are counted (e.g., modal open vs page visit)

  // Add full image URL with variants
  const promptData = prompt.toObject();
  
  if (prompt.imageUrl) {
    if (prompt.cloudinaryPublicId) {
      promptData.imageVariants = {
        ...generateImageVariants(prompt.cloudinaryPublicId),
        publicId: prompt.cloudinaryPublicId
      };
    } else {
      // Fallback for legacy URLs
      promptData.imageVariants = {
        original: prompt.imageUrl,
        large: prompt.imageUrl,
        medium: prompt.imageUrl,
        small: prompt.imageUrl,
        thumbnail: prompt.imageUrl
      };
    }
  }

  res.status(200).json({
    success: true,
    data: promptData
  });
});

// @desc    Get all prompts for admin management
// @route   GET /api/admin/prompts
// @access  Private (Admin/Moderator)
export const getAdminPrompts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    limit = 1000
  } = req.query;

  // Build query object
  const query = {};

  // Admin can filter by any status
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by category
  if (category && category !== 'all') {
    query.category = category;
  }

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get prompts with basic population for admin efficiency
  const prompts = await Prompt.find(query)
    .populate('category', 'name slug color')
    .sort(sortOptions)
    .limit(Number(limit))
    .select('-__v -keywords') // Exclude unnecessary fields for admin
    .lean();

  // Add image URLs for admin interface (simplified)
  const promptsWithUrls = prompts.map(prompt => ({
    ...prompt,
    imageUrl: prompt.imageUrl || null
  }));

  res.status(200).json({
    success: true,
    data: {
      prompts: promptsWithUrls,
      total: promptsWithUrls.length
    }
  });
});

// @desc    Create new prompt
// @route   POST /api/prompts
// @access  Private (Admin/Moderator)
export const createPrompt = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    tags,
    author,
    aiModelCompatibility,
    difficultyLevel,
    estimatedTime,
    usageInstructions,
    outputFormat,
    licenseType,
    keywords,
    featured,
    status
  } = req.body;

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Category not found', 400);
  }

  // Handle file upload
  let imageData = {};
  if (req.cloudinaryResult) {
    imageData = {
      imageUrl: req.cloudinaryResult.secureUrl,
      cloudinaryPublicId: req.cloudinaryResult.publicId,
      originalFileName: req.cloudinaryResult.originalFilename,
      fileSize: req.cloudinaryResult.bytes,
      mimeType: `image/${req.cloudinaryResult.format}`,
      imageWidth: req.cloudinaryResult.width,
      imageHeight: req.cloudinaryResult.height
    };
  }

  const prompt = await Prompt.create({
    title,
    description,
    category,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    author,
    aiModelCompatibility: aiModelCompatibility ? aiModelCompatibility.split(',') : ['GPT-4'],
    difficultyLevel: difficultyLevel || 'Beginner',
    estimatedTime,
    usageInstructions,
    outputFormat: outputFormat || 'Text',
    licenseType: licenseType || 'MIT',
    keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
    featured: featured === 'true',
    status: status || 'published',
    ...imageData
  });

  await prompt.populate('category', 'name slug color');

  // Add full image URL with variants
  const promptData = prompt.toObject();

  if (prompt.imageUrl) {
    if (prompt.cloudinaryPublicId) {
      promptData.imageVariants = {
        ...generateImageVariants(prompt.cloudinaryPublicId),
        publicId: prompt.cloudinaryPublicId
      };
    } else {
      // Fallback for legacy URLs
      promptData.imageVariants = {
        original: prompt.imageUrl,
        large: prompt.imageUrl,
        medium: prompt.imageUrl,
        small: prompt.imageUrl,
        thumbnail: prompt.imageUrl
      };
    }
  }

  res.status(201).json({
    success: true,
    data: promptData,
    message: 'Prompt created successfully'
  });
});

// @desc    Update prompt
// @route   PUT /api/prompts/:id
// @access  Private (Admin/Moderator)
export const updatePrompt = asyncHandler(async (req, res) => {
  let prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  const {
    title,
    description,
    category,
    tags,
    author,
    aiModelCompatibility,
    difficultyLevel,
    estimatedTime,
    usageInstructions,
    outputFormat,
    licenseType,
    keywords,
    featured,
    status
  } = req.body;

  // Validate category if provided
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new AppError('Category not found', 400);
    }
  }

  // Handle file upload (replace existing)
  if (req.cloudinaryResult) {
    // Delete old image if exists
    if (prompt.cloudinaryPublicId) {
      await deleteCloudinaryImage(prompt.cloudinaryPublicId);
    } else if (prompt.imageUrl) {
      // Try to extract public ID from old URL and delete
      const oldPublicId = extractPublicIdFromUrl(prompt.imageUrl);
      if (oldPublicId) {
        await deleteCloudinaryImage(oldPublicId);
      }
    }

    prompt.imageUrl = req.cloudinaryResult.secureUrl;
    prompt.cloudinaryPublicId = req.cloudinaryResult.publicId;
    prompt.originalFileName = req.cloudinaryResult.originalFilename;
    prompt.fileSize = req.cloudinaryResult.bytes;
    prompt.mimeType = `image/${req.cloudinaryResult.format}`;
    prompt.imageWidth = req.cloudinaryResult.width;
    prompt.imageHeight = req.cloudinaryResult.height;
  }

  // Update fields
  if (title) prompt.title = title;
  if (description) prompt.description = description;
  if (category) prompt.category = category;
  if (tags) prompt.tags = tags.split(',').map(tag => tag.trim());
  if (author) prompt.author = author;
  if (aiModelCompatibility) prompt.aiModelCompatibility = aiModelCompatibility.split(',');
  if (difficultyLevel) prompt.difficultyLevel = difficultyLevel;
  if (estimatedTime) prompt.estimatedTime = estimatedTime;
  if (usageInstructions) prompt.usageInstructions = usageInstructions;
  if (outputFormat) prompt.outputFormat = outputFormat;
  if (licenseType) prompt.licenseType = licenseType;
  if (keywords) prompt.keywords = keywords.split(',').map(keyword => keyword.trim());
  if (featured !== undefined) prompt.featured = featured === 'true';
  if (status) prompt.status = status;

  await prompt.save();
  await prompt.populate('category', 'name slug color');

  // Add full image URL with variants
  const promptData = prompt.toObject();
  
  if (prompt.imageUrl) {
    if (prompt.cloudinaryPublicId) {
      promptData.imageVariants = {
        ...generateImageVariants(prompt.cloudinaryPublicId),
        publicId: prompt.cloudinaryPublicId
      };
    } else {
      // Fallback for legacy URLs
      promptData.imageVariants = {
        original: prompt.imageUrl,
        large: prompt.imageUrl,
        medium: prompt.imageUrl,
        small: prompt.imageUrl,
        thumbnail: prompt.imageUrl
      };
    }
  }

  res.status(200).json({
    success: true,
    data: promptData,
    message: 'Prompt updated successfully'
  });
});

// @desc    Delete prompt
// @route   DELETE /api/prompts/:id
// @access  Private (Admin/Moderator)
export const deletePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  // Delete associated image file
  if (prompt.cloudinaryPublicId) {
    await deleteCloudinaryImage(prompt.cloudinaryPublicId);
  } else if (prompt.imageUrl) {
    // Try to extract public ID from URL and delete
    const publicId = extractPublicIdFromUrl(prompt.imageUrl);
    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }
  }

  await Prompt.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
    message: 'Prompt deleted successfully'
  });
});

// @desc    Toggle prompt like
// @route   POST /api/prompts/:id/like
// @access  Public
export const toggleLike = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  if (prompt.status !== 'published') {
    throw new AppError('Cannot like unpublished prompt', 400);
  }

  // Get or create user activity
  const userActivity = await getUserActivity(req);
  
  // Check if user has already liked this prompt
  const hasLiked = userActivity.hasLikedPrompt(req.params.id);
  
  let action = '';
  
  if (hasLiked) {
    // Unlike: Remove from user's liked prompts and decrement count
    userActivity.likedPrompts = userActivity.likedPrompts.filter(
      like => like.promptId.toString() !== req.params.id
    );
    
    await Prompt.findByIdAndUpdate(req.params.id, { 
      $inc: { likes: -1 },
      $pull: { likedBy: userActivity.userId || userActivity._id }
    });
    
    action = 'unliked';
  } else {
    // Like: Add to user's liked prompts and increment count
    userActivity.likedPrompts.push({
      promptId: req.params.id,
      likedAt: new Date()
    });
    
    await Prompt.findByIdAndUpdate(req.params.id, { 
      $inc: { likes: 1 },
      $addToSet: { likedBy: userActivity.userId || userActivity._id }
    });
    
    action = 'liked';
  }
  
  await userActivity.save();
  
  // Get updated prompt data
  const updatedPrompt = await Prompt.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: {
      action,
      isLiked: !hasLiked,
      likesCount: updatedPrompt.likes
    },
    message: `Prompt ${action} successfully`
  });
});

// @desc    Check if user has liked a prompt
// @route   GET /api/prompts/:id/like-status
// @access  Public
export const getLikeStatus = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  // Get user activity
  const userActivity = await getUserActivity(req);
  const isLiked = userActivity.hasLikedPrompt(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {
      isLiked,
      likesCount: prompt.likes
    }
  });
});

// @desc    Share prompt
// @route   POST /api/prompts/:id/share
// @access  Public
export const sharePrompt = asyncHandler(async (req, res) => {
  const { shareType = 'copy' } = req.body;
  
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  if (prompt.status !== 'published') {
    throw new AppError('Cannot share unpublished prompt', 400);
  }

  // Validate share type
  const validShareTypes = ['copy', 'twitter', 'facebook', 'linkedin', 'email', 'whatsapp', 'telegram', 'native'];
  if (!validShareTypes.includes(shareType)) {
    throw new AppError('Invalid share type', 400);
  }

  // Get or create user activity
  const userActivity = await getUserActivity(req);
  
  // Add to user's shared prompts (allow multiple shares)
  userActivity.sharedPrompts.push({
    promptId: req.params.id,
    shareType,
    sharedAt: new Date()
  });
  
  // Increment share count
  await Prompt.findByIdAndUpdate(req.params.id, { 
    $inc: { shares: 1 },
    $addToSet: { sharedBy: userActivity.userId || userActivity._id }
  });
  
  await userActivity.save();
  
  // Get updated prompt data
  const updatedPrompt = await Prompt.findById(req.params.id);
  
  // Generate share data based on type
  const shareData = {
    title: prompt.title,
    description: prompt.description.substring(0, 150) + '...',
    url: `${req.protocol}://${req.get('host')}/explore?prompt=${prompt._id}`,
    imageUrl: prompt.imageUrl,
    hashtags: prompt.tags.map(tag => `#${tag}`).join(' ')
  };
  
  // Generate platform-specific URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}&hashtags=${prompt.tags.join(',')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} - ${shareData.url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`Check out this amazing AI prompt: ${shareData.title}

${shareData.description}

${shareData.url}`)}`
  };

  res.status(200).json({
    success: true,
    data: {
      shareType,
      sharesCount: updatedPrompt.shares,
      shareData,
      shareUrls
    },
    message: 'Prompt shared successfully'
  });
});
// @route   POST /api/prompts/:id/download
// @access  Public
export const incrementDownload = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  if (prompt.status !== 'published') {
    throw new AppError('Cannot download unpublished prompt', 400);
  }

  await Prompt.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

  res.status(200).json({
    success: true,
    message: 'Download counted successfully'
  });
});

// @desc    Increment view count
// @route   POST /api/prompts/:id/view
// @access  Public
export const incrementView = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    throw new AppError('Prompt not found', 404);
  }

  if (prompt.status !== 'published') {
    throw new AppError('Cannot view unpublished prompt', 400);
  }

  await Prompt.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json({
    success: true,
    message: 'View counted successfully'
  });
});

// @desc    Get featured prompts
// @route   GET /api/prompts/featured
// @access  Public
export const getFeaturedPrompts = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const prompts = await Prompt.find({ 
    status: 'published', 
    featured: true 
  })
    .populate('category', 'name slug color')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Add full image URLs with variants
  const promptsWithUrls = prompts.map(prompt => {
    let imageData = null;
    
    if (prompt.imageUrl) {
      // If it's a Cloudinary URL, generate variants
      if (prompt.cloudinaryPublicId) {
        imageData = {
          ...generateImageVariants(prompt.cloudinaryPublicId),
          publicId: prompt.cloudinaryPublicId
        };
      } else {
        // Fallback for legacy URLs
        imageData = {
          original: prompt.imageUrl,
          large: prompt.imageUrl,
          medium: prompt.imageUrl,
          small: prompt.imageUrl,
          thumbnail: prompt.imageUrl
        };
      }
    }
    
    return {
      ...prompt,
      imageUrl: prompt.imageUrl,
      imageVariants: imageData
    };
  });

  res.status(200).json({
    success: true,
    data: promptsWithUrls
  });
});

// Validation rules for prompt creation/update
export const promptValidationRules = () => {
  return [
    body('title')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('description')
      .isLength({ min: 10, max: 10000 })
      .withMessage('Description must be between 10 and 10000 characters'),
    body('category')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('difficultyLevel')
      .optional()
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Invalid difficulty level'),
    body('outputFormat')
      .optional()
      .isIn(['Text', 'JSON', 'Markdown', 'HTML', 'Code', 'List', 'Other'])
      .withMessage('Invalid output format'),
    body('licenseType')
      .optional()
      .isIn(['MIT', 'Apache 2.0', 'GPL', 'Creative Commons', 'Proprietary', 'Public Domain'])
      .withMessage('Invalid license type'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status')
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