# Quick Deployment Guide - Render

## 🚀 Quick Start (10 minutes)

### 1. Prerequisites
- GitHub account with your code pushed
- Render account (free signup at render.com)
- MongoDB Atlas account (free tier)

### 2. Database Setup (3 minutes)
1. **MongoDB Atlas**: 
   - Create free cluster at mongodb.com/atlas
   - Create database user
   - Whitelist all IPs (0.0.0.0/0)
   - Copy connection string

### 3. Deploy Backend (3 minutes)
1. **Render Dashboard** → "New" → "Web Service"
2. **Connect GitHub repo**
3. **Settings**:
   ```
   Name: openprompt-backend
   Environment: Node
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_32_character_secret_key
   ADMIN_PASSWORD=your_secure_password
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

### 4. Deploy Frontend (2 minutes)
1. **Render Dashboard** → "New" → "Static Site"
2. **Connect same GitHub repo**
3. **Settings**:
   ```
   Name: openprompt-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

### 5. Update Backend URL (1 minute)
- Update backend's `FRONTEND_URL` environment variable
- Both services will auto-redeploy

### 6. Test Your App (1 minute)
- Visit your frontend URL
- Login to admin panel
- Upload a test prompt

## 🔧 Environment Variables Reference

**Backend (.env)**:
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/openprompt
JWT_SECRET=your_32_character_secret_key_here
ADMIN_PASSWORD=your_secure_admin_password
FRONTEND_URL=https://your-frontend.onrender.com
CLOUDINARY_CLOUD_NAME=optional_cloudinary_name
CLOUDINARY_API_KEY=optional_cloudinary_key
CLOUDINARY_API_SECRET=optional_cloudinary_secret
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

## 🛠️ Troubleshooting

**Backend won't start**: Check MongoDB connection string
**Frontend can't connect**: Verify VITE_API_URL matches backend URL
**CORS errors**: Update FRONTEND_URL in backend environment

## 💡 Pro Tips

- **Free tier sleeps**: Backend sleeps after 15 min inactivity
- **Logs**: Check deployment logs in Render dashboard
- **Updates**: Push to GitHub triggers auto-deployment
- **Custom domains**: Available in Render settings

Your app will be live at:
- **Frontend**: `https://your-frontend.onrender.com`
- **Admin Panel**: `https://your-frontend.onrender.com/admin`