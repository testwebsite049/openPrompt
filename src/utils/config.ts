// Configuration utilities for production deployment

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'OpenPrompt',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.MODE === 'production',
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableSharing: import.meta.env.VITE_ENABLE_SHARING === 'true',
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxSize: parseInt(import.meta.env.VITE_MAX_IMAGE_SIZE || '5242880'), // 5MB
  allowedTypes: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp,gif').split(','),
  apiEndpoint: `${API_CONFIG.baseURL}/prompts`,
};

// API Helper function
export const getApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Environment check
export const isProduction = () => APP_CONFIG.isProduction;
export const isDevelopment = () => !APP_CONFIG.isProduction;

// Debug logging (only in development)
export const debugLog = (...args: any[]) => {
  if (isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

// Error logging
export const errorLog = (...args: any[]) => {
  console.error('[ERROR]', ...args);
  
  // In production, you might want to send errors to a logging service
  if (isProduction() && FEATURE_FLAGS.enableAnalytics) {
    // TODO: Implement error reporting to analytics service
  }
};