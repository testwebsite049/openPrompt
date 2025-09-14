// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error Stack:', err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      success: false
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const message = `Duplicate field value for ${field}. Please use another value.`;
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      success: false
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      success: false
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler for undefined routes
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async handler wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const validationErrorHandler = (req, res, next) => {
  const errors = [];
  
  // Handle express-validator errors
  if (req.validationErrors && req.validationErrors().length > 0) {
    req.validationErrors().forEach(error => {
      errors.push({
        field: error.param,
        message: error.msg,
        value: error.value
      });
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};