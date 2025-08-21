const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Get API base URL from environment variable, with fallbacks
const getApiBaseUrl = () => {
  // In development, use the environment variable or default to local proxy
  if (isDevelopment) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  }
  
  // In production (Railway full-stack), use same-origin (no CORS needed)
  return '';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment,
  isProduction,
  environment: import.meta.env.MODE,
  enableLogging: isDevelopment,
  requestTimeout: 30000,
  retryAttempts: 3,
  isGitHubPages: isProduction && window.location.hostname.endsWith('.github.io'),
} as const;
