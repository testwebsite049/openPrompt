# Cloudinary Integration Setup Guide

This guide will help you set up Cloudinary for image storage in your OpenPrompt backend.

## 🚀 What is Cloudinary?

Cloudinary is a cloud-based service that provides image and video management solutions including:
- Upload and storage
- Image transformation and optimization
- CDN delivery
- Real-time image manipulation

## 📋 Prerequisites

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloudinary credentials from the dashboard

## 🔧 Setup Instructions

### 1. Get Cloudinary Credentials

After creating your account:

1. Go to your [Cloudinary Dashboard](https://cloudinary.com/console)
2. Find your **Account Details** section
3. Copy the following values:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### 2. Update Environment Variables

Add the following to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_FOLDER=openprompt/images
```

**Replace the placeholder values with your actual Cloudinary credentials.**

### 3. Install Dependencies

The required dependencies are already in your `package.json`. Install them:

```bash
npm install
```

### 4. Test the Setup

Start your server and test image upload:

```bash
npm run dev
```

## 🌟 Features Implemented

### Image Upload
- **Memory Storage**: Images are processed in memory before uploading to Cloudinary
- **Auto Optimization**: Images are automatically optimized for web delivery
- **Format Conversion**: Automatic format selection (WebP, AVIF) for better performance
- **Size Limits**: Configurable file size limits (default: 5MB)

### Image Variants
Multiple image sizes are automatically generated:
- **Thumbnail**: 150x150px (crop, center)
- **Small**: 300x300px (limit)
- **Medium**: 600x600px (limit) 
- **Large**: 1200x1200px (limit)
- **Original**: Full size with optimization

### Image Management
- **Delete**: Automatic cleanup when prompts are deleted
- **Replace**: Old images are deleted when new ones are uploaded
- **Error Handling**: Robust error handling for upload failures

## 📁 How It Works

### Upload Process
1. User uploads image via frontend
2. Multer processes the file in memory
3. Image is uploaded to Cloudinary
4. Cloudinary returns secure URL and metadata
5. Prompt is saved with Cloudinary data

### Data Structure
```javascript
{
  imageUrl: "https://res.cloudinary.com/...",
  cloudinaryPublicId: "openprompt/images/uuid-timestamp",
  imageWidth: 1200,
  imageHeight: 800,
  fileSize: 245760,
  imageVariants: {
    thumbnail: "https://res.cloudinary.com/.../w_150,h_150,c_fill,g_center/...",
    small: "https://res.cloudinary.com/.../w_300,h_300,c_limit/...",
    medium: "https://res.cloudinary.com/.../w_600,h_600,c_limit/...",
    large: "https://res.cloudinary.com/.../w_1200,h_1200,c_limit/...",
    original: "https://res.cloudinary.com/.../q_auto,f_auto/..."
  }
}
```

## 🔒 Security Features

- **Secure URLs**: All images use HTTPS
- **Access Control**: Public read, authenticated write
- **File Type Validation**: Only image files allowed
- **Size Limits**: Configurable upload limits
- **Auto-deletion**: Orphaned images are cleaned up

## 🛠️ API Endpoints

### Upload Image
```javascript
POST /api/prompts
Content-Type: multipart/form-data

// Form data
{
  "image": file,
  "title": "Prompt title",
  "description": "Prompt description",
  // ... other fields
}
```

### Response Format
```javascript
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryPublicId": "openprompt/images/...",
    "imageVariants": {
      "thumbnail": "...",
      "small": "...",
      "medium": "...",
      "large": "...",
      "original": "..."
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Cloudinary configuration is missing"
- Check your `.env` file has all required variables
- Ensure variable names match exactly
- Restart your server after changing `.env`

#### 2. "Upload failed"
- Verify your API credentials are correct
- Check your Cloudinary account quota
- Ensure file is a valid image format

#### 3. "Public ID extraction failed"
- This happens with legacy local file URLs
- New uploads will work correctly
- Old images will show fallback URLs

### Debug Mode
Add this to see detailed Cloudinary logs:

```env
NODE_ENV=development
```

## 💡 Frontend Integration

Update your frontend to handle new image structure:

```javascript
// Old way
<img src={prompt.imageUrl} alt={prompt.title} />

// New way with variants
<img 
  src={prompt.imageVariants?.medium || prompt.imageUrl} 
  alt={prompt.title}
  // Use different sizes for different breakpoints
/>

// Responsive images
<picture>
  <source media="(max-width: 320px)" srcSet={prompt.imageVariants?.thumbnail} />
  <source media="(max-width: 768px)" srcSet={prompt.imageVariants?.small} />
  <source media="(max-width: 1200px)" srcSet={prompt.imageVariants?.medium} />
  <img src={prompt.imageVariants?.large} alt={prompt.title} />
</picture>
```

## 📊 Benefits

### Performance
- **CDN Delivery**: Global content delivery network
- **Auto-optimization**: Automatic format and quality optimization
- **Lazy Loading**: Supports modern lazy loading techniques
- **Responsive Images**: Multiple sizes for different devices

### Storage
- **Unlimited Storage**: No local disk space concerns
- **Backup**: Automatic redundancy and backup
- **Scalability**: Handles high traffic and storage needs

### Management
- **Dashboard**: Web interface for image management
- **Analytics**: Usage statistics and insights
- **Transformations**: Real-time image editing via URL parameters

## 🔄 Migration from Local Storage

If you have existing prompts with local images:

1. **Backup**: Export existing data
2. **Migrate**: Run migration script (create if needed)
3. **Update**: Modify frontend to use new structure
4. **Cleanup**: Remove old local files

## 📞 Support

- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **API Reference**: [cloudinary.com/documentation/image_upload_api_reference](https://cloudinary.com/documentation/image_upload_api_reference)
- **Community**: [community.cloudinary.com](https://community.cloudinary.com)

## 🎯 Next Steps

1. Set up your Cloudinary account
2. Add credentials to `.env`
3. Install dependencies: `npm install`
4. Test image upload in your admin panel
5. Update frontend to use image variants
6. Monitor usage in Cloudinary dashboard

Your OpenPrompt application now has professional-grade image management! 🚀