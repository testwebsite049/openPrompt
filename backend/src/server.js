import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations and middleware
import connectDB from '../config/database.js';
import { errorHandler, notFound } from '../middleware/index.js';

// Import routes
import authRoutes from '../routes/authRoutes.js';
import promptRoutes from '../routes/promptRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import cronJobRoutes from '../routes/cronJobRoutes.js';
import dashboardRoutes from '../routes/dashboardRoutes.js';

// Import services
import cronJobService from '../utils/cronJobService.js';

// Environment configuration
import dotenv from 'dotenv';
dotenv.config();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize cron job service after database connection
setTimeout(async () => {
  try {
    await cronJobService.initialize();
  } catch (error) {
    console.error('Failed to initialize cron job service:', error);
  }
}, 2000); // Wait 2 seconds for database connection

// Security and performance middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000', // React default
    'http://127.0.0.1:5173', // Alternative localhost
    'http://127.0.0.1:3000',  // Alternative localhost
    /\.onrender\.com$/, // Allow all Render domains
    /\.netlify\.app$/, // Allow Netlify domains
    /\.vercel\.app$/ // Allow Vercel domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Session-ID',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  
  // CORS debugging middleware
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    if (req.method === 'OPTIONS') {
      console.log('🔄 CORS Preflight request');
    }
    next();
  });
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    cors: {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      method: req.method
    }
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cron-jobs', cronJobRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API root route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OpenPrompt API v1.0.0',
    endpoints: {
      auth: '/api/auth',
      prompts: '/api/prompts',
      categories: '/api/categories',
      cronJobs: '/api/cron-jobs',
      dashboard: '/api/dashboard'
    },
    documentation: '/api/docs',
    serverTime: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint (basic)
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OpenPrompt API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        adminLogin: 'POST /api/auth/admin-login',
        profile: 'GET /api/auth/me'
      },
      prompts: {
        list: 'GET /api/prompts',
        create: 'POST /api/prompts',
        get: 'GET /api/prompts/:id',
        update: 'PUT /api/prompts/:id',
        delete: 'DELETE /api/prompts/:id',
        featured: 'GET /api/prompts/featured'
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        get: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      dashboard: {
        overview: 'GET /api/dashboard/overview',
        analytics: 'GET /api/dashboard/analytics',
        activity: 'GET /api/dashboard/recent-activity'
      },
      cronJobs: {
        list: 'GET /api/cron-jobs',
        create: 'POST /api/cron-jobs',
        execute: 'POST /api/cron-jobs/:id/execute'
      }
    }
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 OpenPrompt Backend Server Started!

   Environment: ${NODE_ENV}
   Port: ${PORT}
   API Base URL: http://localhost:${PORT}/api
   Health Check: http://localhost:${PORT}/health
   
   Available Endpoints:
   📝 Authentication: /api/auth
   🎯 Prompts: /api/prompts
   📂 Categories: /api/categories
   ⏰ Cron Jobs: /api/cron-jobs
   📊 Dashboard: /api/dashboard
   
   Time: ${new Date().toLocaleString()}
  `);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Close database connection
    process.exit(0);
  });
  
  // Force close server after 30secs
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Signal handlers
process.on('SIGTERM', gracefulShutdown.bind(null, 'SIGTERM'));
process.on('SIGINT', gracefulShutdown.bind(null, 'SIGINT'));

// Unhandled promise rejection handling
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Uncaught exception handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

export default app;