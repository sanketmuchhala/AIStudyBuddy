// Enhanced error handling utilities for AI Study Buddy

export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: Date;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class APITimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'APITimeoutError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const errorHandler = {
  // Handle network and API errors
  handleAPIError(error: any): APIError {
    const timestamp = new Date();

    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: error,
        timestamp
      };
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out. The server is taking too long to respond.',
        details: error,
        timestamp
      };
    }

    // HTTP status code errors
    if (error.statusCode || error.status) {
      const statusCode = error.statusCode || error.status;
      
      switch (statusCode) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: 'Invalid request. Please check your input.',
            statusCode,
            details: error,
            timestamp
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please check your credentials.',
            statusCode,
            details: error,
            timestamp
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'Access denied. You do not have permission to perform this action.',
            statusCode,
            details: error,
            timestamp
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found.',
            statusCode,
            details: error,
            timestamp
          };
        case 429:
          return {
            code: 'RATE_LIMIT',
            message: 'Too many requests. Please wait a moment before trying again.',
            statusCode,
            details: error,
            timestamp
          };
        case 500:
          return {
            code: 'SERVER_ERROR',
            message: 'Internal server error. Please try again later.',
            statusCode,
            details: error,
            timestamp
          };
        case 502:
          return {
            code: 'BAD_GATEWAY',
            message: 'Server is temporarily unavailable. Please try again.',
            statusCode,
            details: error,
            timestamp
          };
        case 503:
          return {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service is currently unavailable. Please try again later.',
            statusCode,
            details: error,
            timestamp
          };
        default:
          return {
            code: 'HTTP_ERROR',
            message: `HTTP ${statusCode}: ${error.message || 'Unknown error'}`,
            statusCode,
            details: error,
            timestamp
          };
      }
    }

    // CORS errors
    if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      return {
        code: 'CORS_ERROR',
        message: 'Cross-origin request blocked. Please contact support if this persists.',
        details: error,
        timestamp
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred.',
      details: error,
      timestamp
    };
  },

  // Get user-friendly error message
  getUserMessage(error: APIError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Connection problem. Please check your internet and try again.';
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.';
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait a moment.';
      case 'SERVER_ERROR':
        return 'Server error. Please try again in a few minutes.';
      case 'CORS_ERROR':
        return 'Configuration error. Please contact support.';
      default:
        return error.message;
    }
  },

  // Log error for debugging
  logError(error: APIError, context?: string): void {
    if (import.meta.env.DEV) {
      console.group(`🚨 API Error ${context ? `(${context})` : ''}`);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Status:', error.statusCode);
      console.error('Timestamp:', error.timestamp);
      console.error('Details:', error.details);
      console.groupEnd();
    }
  }
};

export default errorHandler;