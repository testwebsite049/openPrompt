import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Configure multer to use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    // Check allowed extensions
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1 // Only allow 1 file per request
  },
  fileFilter: fileFilter
});

// Single file upload middleware with Cloudinary integration
export const uploadSingle = (req, res, next) => {
  const multerUpload = upload.single('image');
  
  multerUpload(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    // If no file uploaded, continue
    if (!req.file) {
      return next();
    }
    
    try {
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${Date.now()}`;
      
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
        public_id: uniqueName,
        folder: process.env.CLOUDINARY_FOLDER || 'openprompt/images'
      });
      
      // Add Cloudinary data to request object
      req.cloudinaryResult = {
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        originalFilename: req.file.originalname,
        format: cloudinaryResult.format,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        bytes: cloudinaryResult.bytes,
        resourceType: cloudinaryResult.resource_type
      };
      
      next();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      next(new Error('Failed to upload image to cloud storage'));
    }
  });
};

// Multiple files upload middleware (for future use)
export const uploadMultiple = (req, res, next) => {
  const multerUpload = upload.array('images', 5);
  
  multerUpload(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    
    // If no files uploaded, continue
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    try {
      const cloudinaryResults = [];
      
      // Upload each file to Cloudinary
      for (const file of req.files) {
        const uniqueName = `${uuidv4()}-${Date.now()}`;
        
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          public_id: uniqueName,
          folder: process.env.CLOUDINARY_FOLDER || 'openprompt/images'
        });
        
        cloudinaryResults.push({
          publicId: cloudinaryResult.public_id,
          secureUrl: cloudinaryResult.secure_url,
          originalFilename: file.originalname,
          format: cloudinaryResult.format,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          bytes: cloudinaryResult.bytes,
          resourceType: cloudinaryResult.resource_type
        });
      }
      
      req.cloudinaryResults = cloudinaryResults;
      next();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      next(new Error('Failed to upload images to cloud storage'));
    }
  });
};

// Custom upload error handler
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${(parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024}MB`
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Utility function to delete image from Cloudinary
export const deleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId) return false;
    
    const result = await deleteFromCloudinary(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    
    // Extract public ID from Cloudinary URL
    const regex = /\/v\d+\/(.+?)\./;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Get optimized image URL helper
export const getOptimizedImageUrl = (publicId, options = {}) => {
  try {
    if (!publicId) return null;
    
    const { getOptimizedImageUrl: getUrl } = require('../config/cloudinary.js');
    return getUrl(publicId, options);
  } catch (error) {
    console.error('Error getting optimized image URL:', error);
    return null;
  }
};