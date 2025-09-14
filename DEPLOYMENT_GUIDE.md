# OpenPrompt Deployment Guide - Render

This guide will walk you through deploying both the frontend and backend of your OpenPrompt application on Render.

## 📋 Prerequisites

Before you begin, make sure you have:

1. **GitHub Account**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up for free at [render.com](https://render.com)
3. **MongoDB Database**: Either MongoDB Atlas (recommended) or another MongoDB hosting service
4. **Cloudinary Account**: For image storage (optional but recommended)

## 🗂️ Project Structure Overview

Your project has two main parts:
- **Frontend**: React + Vite application (root directory)
- **Backend**: Node.js + Express API (backend/ directory)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify Project Structure**:
   ```
   your-repo/
   ├── backend/          # Backend API
   ├── src/             # Frontend source
   ├── package.json     # Frontend dependencies
   ├── vite.config.ts   # Frontend build config
   └── render.yaml      # Render configuration
   ```

### Step 2: Set Up Database (MongoDB Atlas)

1. **Create MongoDB Atlas Account**:
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for free tier

2. **Create Cluster**:
   - Create a new cluster (free tier: M0)
   - Choose a region close to your users
   - Wait for cluster to be ready

3. **Set Up Database Access**:
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
   - Set permissions to "Read and write to any database"

4. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow access from anywhere" (0.0.0.0/0)
   - This is needed for Render to connect

5. **Get Connection String**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/openprompt?retryWrites=true&w=majority
   ```

### Step 3: Set Up Cloudinary (Optional)

1. **Create Cloudinary Account**:
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials**:
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

### Step 4: Deploy Backend on Render

1. **Create Web Service**:
   - Log in to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**:
   ```
   Name: openprompt-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main (or your default branch)
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**:
   In the Environment tab, add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/openprompt?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
   ADMIN_PASSWORD=your_secure_admin_password
   FRONTEND_URL=https://your-frontend-url.onrender.com
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=openprompt/images
   ```

4. **Deploy Backend**:
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-backend.onrender.com`

### Step 5: Deploy Frontend on Render

1. **Create Static Site**:
   - In Render Dashboard, click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**:
   ```
   Name: openprompt-frontend
   Branch: main
   Root Directory: . (leave empty for root)
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**:
   In the Environment tab, add:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy Frontend**:
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Note your frontend URL: `https://your-frontend.onrender.com`

### Step 6: Update Backend Environment

1. **Update Frontend URL**:
   - Go to your backend service on Render
   - Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

2. **Redeploy Backend**:
   - The backend will automatically redeploy with new environment variables

### Step 7: Initialize Database

1. **Create Admin User**:
   - SSH into your backend service or use the web console
   - Run: `npm run create-admin`
   - Or manually access: `https://your-backend.onrender.com/api/auth/admin-login`

2. **Test API**:
   - Visit: `https://your-backend.onrender.com/health`
   - Should return server status

## 🔧 Configuration Files

### Backend Package.json Scripts
Make sure your `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "echo 'No build process required'"
  }
}
```

### Frontend Vite Config
Update `vite.config.ts` for production:
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend Won't Start**:
   - Check environment variables are set correctly
   - Verify MongoDB connection string
   - Check logs in Render dashboard

2. **Frontend Can't Connect to Backend**:
   - Verify `VITE_API_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend is running

3. **Database Connection Failed**:
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check username/password in connection string
   - Ensure cluster is running

4. **File Uploads Not Working**:
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure upload middleware is configured

### Useful Commands

**Check Backend Status**:
```bash
curl https://your-backend.onrender.com/health
```

**Test API Endpoint**:
```bash
curl https://your-backend.onrender.com/api/prompts
```

**Check Frontend Build**:
```bash
npm run build
```

## 🚀 Post-Deployment Steps

1. **Test Full Application**:
   - Visit your frontend URL
   - Test login/registration
   - Upload a prompt
   - Verify all features work

2. **Set Up Monitoring**:
   - Enable health checks in Render
   - Set up uptime monitoring
   - Configure error alerts

3. **Custom Domain (Optional)**:
   - In Render dashboard, go to Settings
   - Add your custom domain
   - Update DNS records

## 🔒 Security Considerations

1. **Environment Variables**:
   - Never commit secrets to Git
   - Use strong JWT secret (32+ characters)
   - Use secure admin password

2. **Database Security**:
   - Regularly backup your database
   - Monitor access logs
   - Use strong database passwords

3. **SSL/HTTPS**:
   - Render provides free SSL certificates
   - Ensure all API calls use HTTPS
   - Set secure cookie flags

## 💰 Cost Considerations

**Render Free Tier Limits**:
- Backend: Sleeps after 15 minutes of inactivity
- Frontend: Always available
- Bandwidth: 100GB/month
- Build time: 500 minutes/month

**Upgrade to Paid Plan** if you need:
- Always-on backend services
- Custom domains
- More resources
- Professional support

## 📊 Monitoring & Maintenance

1. **Health Checks**:
   - Monitor `/health` endpoint
   - Check response times
   - Monitor error rates

2. **Database Maintenance**:
   - Regular backups
   - Monitor storage usage
   - Optimize queries

3. **Updates**:
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging

## 🎉 Success!

Your OpenPrompt application is now deployed and accessible at:
- **Frontend**: `https://your-frontend.onrender.com`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Admin Panel**: `https://your-frontend.onrender.com/admin`

## 📞 Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

Happy deploying! 🚀