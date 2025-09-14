# OpenPrompt Backend

A comprehensive Node.js backend for the OpenPrompt admin panel with Express, MongoDB, and advanced features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Prompt Management**: Full CRUD operations for AI prompts with image uploads
- **Category Management**: Hierarchical category system with color coding
- **Cron Jobs System**: Automated task scheduling and management
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **File Upload**: Secure image upload with validation and storage
- **Email Notifications**: Automated email system for alerts and notifications
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Helmet, CORS, input validation, and more

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/openprompt
   JWT_SECRET=your_super_secret_jwt_key_here
   ADMIN_PASSWORD=admin123
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
```
POST /api/auth/login          - User login
POST /api/auth/register       - User registration  
POST /api/auth/admin-login    - Admin login with password
GET  /api/auth/me             - Get current user
PUT  /api/auth/profile        - Update user profile
PUT  /api/auth/change-password - Change password
POST /api/auth/logout         - Logout user
```

### Prompt Endpoints
```
GET    /api/prompts           - Get all prompts (with filtering)
GET    /api/prompts/featured  - Get featured prompts
GET    /api/prompts/:id       - Get single prompt
POST   /api/prompts           - Create prompt (Admin/Moderator)
PUT    /api/prompts/:id       - Update prompt (Admin/Moderator)
DELETE /api/prompts/:id       - Delete prompt (Admin/Moderator)
POST   /api/prompts/:id/like  - Like a prompt
POST   /api/prompts/:id/download - Increment download count
```

### Category Endpoints
```
GET    /api/categories        - Get all categories
GET    /api/categories/:id    - Get single category
POST   /api/categories        - Create category (Admin/Moderator)
PUT    /api/categories/:id    - Update category (Admin/Moderator)
DELETE /api/categories/:id    - Delete category (Admin/Moderator)
GET    /api/categories/:id/stats - Get category statistics
PUT    /api/categories/reorder - Reorder categories
```

### Cron Jobs Endpoints
```
GET    /api/cron-jobs         - Get all cron jobs (Admin)
GET    /api/cron-jobs/stats   - Get cron job statistics (Admin)
GET    /api/cron-jobs/:id     - Get single cron job (Admin)
POST   /api/cron-jobs         - Create cron job (Admin)
PUT    /api/cron-jobs/:id     - Update cron job (Admin)
DELETE /api/cron-jobs/:id     - Delete cron job (Admin)
POST   /api/cron-jobs/:id/execute - Execute cron job manually (Admin)
GET    /api/cron-jobs/:id/history - Get execution history (Admin)
```

### Dashboard Endpoints
```
GET /api/dashboard/overview      - Dashboard overview stats (Admin/Moderator)
GET /api/dashboard/recent-activity - Recent activity feed (Admin/Moderator)
GET /api/dashboard/analytics     - Analytics data (Admin/Moderator)
GET /api/dashboard/top-content   - Top performing content (Admin/Moderator)
GET /api/dashboard/system-health - System health metrics (Admin)
POST /api/dashboard/generate-analytics - Generate daily analytics (Admin)
```

## 🗂️ Project Structure

```
backend/
├── src/
│   └── server.js              # Main server file
├── config/
│   └── database.js            # MongoDB connection
├── models/
│   ├── Prompt.js              # Prompt schema
│   ├── Category.js            # Category schema
│   ├── User.js                # User schema
│   ├── CronJob.js             # Cron job schema
│   ├── Analytics.js           # Analytics schema
│   └── index.js               # Model exports
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── promptController.js    # Prompt operations
│   ├── categoryController.js  # Category operations
│   ├── cronJobController.js   # Cron job management
│   └── dashboardController.js # Dashboard analytics
├── routes/
│   ├── authRoutes.js          # Auth routes
│   ├── promptRoutes.js        # Prompt routes
│   ├── categoryRoutes.js      # Category routes
│   ├── cronJobRoutes.js       # Cron job routes
│   └── dashboardRoutes.js     # Dashboard routes
├── middleware/
│   ├── auth.js                # Authentication middleware
│   ├── upload.js              # File upload middleware
│   ├── rateLimiter.js         # Rate limiting
│   ├── errorHandler.js        # Error handling
│   └── index.js               # Middleware exports
├── utils/
│   ├── helpers.js             # Utility functions
│   ├── emailService.js        # Email notifications
│   ├── cronJobService.js      # Cron job service
│   └── seedDatabase.js        # Database seeding
├── uploads/                   # File uploads directory
├── package.json
├── .env                       # Environment variables
└── README.md
```

## 🔧 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run seed           # Seed database with initial data
npm test               # Run tests (if configured)
npm run build          # Build process (if needed)
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** with email/password or admin password
2. **Receive JWT token** in response
3. **Include token** in requests: `Authorization: Bearer <token>`

### Admin Access
- Use admin password to get admin token
- Admin routes require `requireAdmin` middleware
- Moderator routes require `requireModerator` middleware

## 📤 File Uploads

The API supports image uploads for prompts:

- **Endpoint**: POST `/api/prompts` (with multipart/form-data)
- **Field name**: `image`
- **Allowed types**: jpg, jpeg, png, webp, gif
- **Max size**: 5MB (configurable)
- **Storage**: Local filesystem (uploads/images/)

## 🕐 Cron Jobs

Built-in automated tasks:

- **Daily Analytics**: Generate daily statistics
- **File Cleanup**: Remove orphaned files
- **Token Cleanup**: Remove expired tokens
- **Statistics Update**: Update category counts

## 📊 Analytics

The system tracks:

- Prompt statistics (views, downloads, likes)
- Category performance
- User activity
- System health metrics
- Cron job execution history

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse protection  
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt encryption
- **JWT**: Secure token authentication
- **File Upload Security**: Type and size validation

## 🚀 Deployment

### Production Environment

1. **Set environment variables**:
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   JWT_SECRET=your_production_jwt_secret
   ```

2. **Install production dependencies**:
   ```bash
   npm ci --only=production
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start src/server.js --name "openprompt-backend"
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure allowed file types are correct

3. **JWT Token Issues**
   - Verify JWT_SECRET in environment
   - Check token expiration
   - Ensure proper Authorization header format

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/openprompt |
| `JWT_SECRET` | JWT signing secret | required |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `ADMIN_PASSWORD` | Admin panel password | admin123 |
| `FRONTEND_URL` | Frontend application URL | http://localhost:5173 |
| `MAX_FILE_SIZE` | Maximum upload file size | 5242880 (5MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | jpg,jpeg,png,webp,gif |

## 🤝 API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message",
  "pagination": {
    // Pagination info (for list endpoints)
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## 📈 Monitoring

The API provides several monitoring endpoints:

- **Health Check**: `GET /health`
- **System Status**: `GET /api/dashboard/system-health`
- **Cron Job Status**: `GET /api/cron-jobs/stats`

## 🔄 Updates

To update the backend:

1. Pull latest changes
2. Install new dependencies: `npm install`
3. Run migrations (if any)
4. Restart the server

## 📞 Support

For support and questions:

- Check the API documentation
- Review error logs in the console
- Ensure all environment variables are set correctly
- Verify MongoDB connection and permissions