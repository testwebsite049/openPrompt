import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }
  
  return true;
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    validateCloudinaryConfig();
    
    const defaultOptions = {
      folder: process.env.CLOUDINARY_FOLDER || 'openprompt/images',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      flags: 'progressive',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };
    
    const uploadOptions = { ...defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    validateCloudinaryConfig();
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      console.warn(`Failed to delete image from Cloudinary: ${publicId}`, result);
    }
    
    return result;
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    throw error;
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  try {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      flags: 'progressive'
    };
    
    const transformOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, transformOptions);
  } catch (error) {
    console.error('Failed to generate optimized URL:', error);
    return null;
  }
};

// Generate multiple image sizes
export const generateImageVariants = (publicId) => {
  try {
    return {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'center',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      small: cloudinary.url(publicId, {
        width: 300,
        height: 300,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(publicId, {
        width: 600,
        height: 600,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      large: cloudinary.url(publicId, {
        width: 1200,
        height: 1200,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      original: cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto'
      })
    };
  } catch (error) {
    console.error('Failed to generate image variants:', error);
    return null;
  }
};

// Get image metadata
export const getImageMetadata = async (publicId) => {
  try {
    validateCloudinaryConfig();
    
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      url: result.secure_url,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    throw error;
  }
};

export default cloudinary;