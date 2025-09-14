// Utility functions for common operations

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format file size to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalizeWords(text) {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Clean and validate hex color
 * @param {string} color - Color to validate
 * @returns {string} Valid hex color or default
 */
export function validateHexColor(color, defaultColor = '#6B7280') {
  const hexRegex = /^#[0-9A-F]{6}$/i;
  return hexRegex.test(color) ? color : defaultColor;
}

/**
 * Parse and validate cron expression (basic validation)
 * @param {string} expression - Cron expression
 * @returns {boolean} True if valid cron expression
 */
export function isValidCronExpression(expression) {
  // Basic cron validation - 5 fields (minute hour day month dayOfWeek)
  const parts = expression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    return false;
  }
  
  // Basic validation for each field
  const patterns = [
    /^(\*|[0-5]?\d)(\/\d+)?$/,      // minute (0-59)
    /^(\*|[01]?\d|2[0-3])(\/\d+)?$/, // hour (0-23)
    /^(\*|[012]?\d|3[01])(\/\d+)?$/, // day (1-31)
    /^(\*|[01]?\d)(\/\d+)?$/,        // month (1-12)
    /^(\*|[0-6])(\/\d+)?$/           // day of week (0-6)
  ];
  
  return parts.every((part, index) => patterns[index].test(part));
}

/**
 * Remove sensitive information from user object
 * @param {object} user - User object
 * @returns {object} Sanitized user object
 */
export function sanitizeUser(user) {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.resetPasswordToken;
  delete sanitized.resetPasswordExpires;
  delete sanitized.emailVerificationToken;
  delete sanitized.emailVerificationExpires;
  return sanitized;
}

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
export function generatePagination(page, limit, total) {
  const pages = Math.ceil(total / limit);
  
  return {
    current: Number(page),
    pages,
    total,
    hasNext: page < pages,
    hasPrev: page > 1,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
}

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      const delayTime = baseDelay * Math.pow(2, i);
      await delay(delayTime);
    }
  }
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Deep cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
}