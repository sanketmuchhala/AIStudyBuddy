// Environment configuration for AI Study Buddy

export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  enableLogging: boolean;
  requestTimeout: number;
  retryAttempts: number;
  isGitHubPages: boolean;
}

// Detect environment
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
const isGitHubPages = window.location.hostname === 'sanketmuchhala.github.io' || 
                     window.location.hostname.includes('github.io');

// API Base URLs for different environments
const API_URLS = {
  development: 'https://ai-study-buddy-backend-production.up.railway.app',
  production: 'https://ai-study-buddy-backend-production.up.railway.app',
  githubPages: 'https://ai-study-buddy-backend-production.up.railway.app'
};

// Export configuration
export const config: EnvironmentConfig = {
  apiBaseUrl: isGitHubPages ? API_URLS.githubPages : 
              isDevelopment ? API_URLS.development : API_URLS.production,
  isDevelopment,
  isProduction,
  enableLogging: isDevelopment,
  requestTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  isGitHubPages
};

// Debug logging
if (config.enableLogging) {
  console.log('🔧 Environment Configuration:', {
    isDevelopment,
    isProduction,
    isGitHubPages,
    apiBaseUrl: config.apiBaseUrl,
    location: window.location.origin,
    hostname: window.location.hostname
  });
}

export default config;