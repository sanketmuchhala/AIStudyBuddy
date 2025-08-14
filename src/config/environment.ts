// Environment configuration for AI Study Buddy

export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  enableLogging: boolean;
  requestTimeout: number;
  retryAttempts: number;
}

// Detect environment
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// API Base URLs for different environments
const API_URLS = {
  development: 'https://ai-study-buddy-backend-production.up.railway.app', // Always use Railway in dev
  production: 'https://ai-study-buddy-backend-production.up.railway.app'
};

// Export configuration
export const config: EnvironmentConfig = {
  apiBaseUrl: isDevelopment ? API_URLS.development : API_URLS.production,
  isDevelopment,
  isProduction,
  enableLogging: isDevelopment,
  requestTimeout: 30000, // 30 seconds
  retryAttempts: 3
};

// Debug logging
if (config.enableLogging) {
  console.log('🔧 Environment Configuration:', {
    isDevelopment,
    isProduction,
    apiBaseUrl: config.apiBaseUrl,
    location: window.location.origin
  });
}

export default config;