import { config } from '../config';

const API_BASE_URL = config.apiBaseUrl;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    timestamp: string;
    path: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  type: 'network' | 'http' | 'cors' | 'timeout' | 'parse' | 'unknown';
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout?: number
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeoutMs = timeout || this.defaultTimeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Handle different response types
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorType: ApiError['type'] = 'http';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          // Response is not JSON, use status text
        }
        
        // Determine error type based on status
        if (response.status === 0) {
          errorType = 'cors';
          errorMessage = 'CORS error: Unable to connect to server. Check your network connection.';
        } else if (response.status >= 500) {
          errorType = 'http';
          errorMessage = `Server error: ${errorMessage}`;
        } else if (response.status >= 400) {
          errorType = 'http';
          errorMessage = `Client error: ${errorMessage}`;
        }
        
        throw new ApiError(errorMessage, response.status, errorType);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'timeout');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new ApiError(
            'Network error: Please check your internet connection and try again.',
            0,
            'network'
          );
        }
        
        if (error.message.includes('JSON')) {
          throw new ApiError('Failed to parse server response', 500, 'parse');
        }
        
        throw new ApiError(error.message, 500, 'unknown');
      }
      
      throw new ApiError('An unexpected error occurred', 500, 'unknown');
    }
  }

  // Retry logic for GET requests
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    timeout?: number
  ): Promise<T> {
    let lastError: ApiError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.request<T>(endpoint, options, timeout);
      } catch (error) {
        lastError = error instanceof ApiError ? error : new ApiError('Unknown error', 500, 'unknown');
        
        // Don't retry on client errors (4xx) or CORS errors
        if (lastError.type === 'cors' || (lastError.status && lastError.status >= 400 && lastError.status < 500)) {
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  // Health check
  async getHealth() {
    return this.requestWithRetry<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
      services: Record<string, string>;
    }>('/healthz', { method: 'GET' });
  }

  // Chat endpoints
  async sendMessage(message: string, conversationId?: string) {
    return this.request<ApiResponse<{
      message: string;
      conversationId: string;
      timestamp: string;
    }>>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  // Quick Actions endpoints
  async summarizeContent(content: string, type: 'url' | 'text' | 'pdf' = 'text') {
    return this.request<ApiResponse<{
      summary: string;
      originalLength: number;
      type: string;
      timestamp: string;
    }>>('/api/quick/summarize', {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async generateStudyPlan(
    topic: string,
    duration: number,
    level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ) {
    return this.request<ApiResponse<{
      studyPlan: string;
      topic: string;
      duration: number;
      level: string;
      timestamp: string;
    }>>('/api/quick/study-plan', {
      method: 'POST',
      body: JSON.stringify({ topic, duration, level }),
    });
  }

  async generateFlashcards(content: string, count: number = 10) {
    return this.request<ApiResponse<{
      flashcards: string;
      count: number;
      timestamp: string;
    }>>('/api/quick/flashcards', {
      method: 'POST',
      body: JSON.stringify({ content, count }),
    });
  }

  async explainTopic(
    topic: string,
    level: 'simple' | 'detailed' | 'expert' = 'detailed'
  ) {
    return this.request<ApiResponse<{
      explanation: string;
      topic: string;
      level: string;
      timestamp: string;
    }>>('/api/quick/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, level }),
    });
  }

  async generateQuiz(
    topic: string,
    questionCount: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) {
    return this.request<ApiResponse<{
      quiz: string;
      topic: string;
      questionCount: number;
      difficulty: string;
      timestamp: string;
    }>>('/api/quick/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, questionCount, difficulty }),
    });
  }

  // Create a streaming chat connection
  createChatStream(
    message: string, 
    conversationId?: string,
    onMessage?: (data: string) => void,
    onError?: (error: ApiError) => void,
    onComplete?: () => void
  ): { abort: () => void } {
    const controller = new AbortController();
    
    const startStream = async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, conversationId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, 'http');
        }

        if (!response.body) {
          throw new ApiError('No response body', 500, 'parse');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete?.();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'start') {
                  // Initial connection - store conversation ID if needed
                  continue;
                } else if (parsed.type === 'chunk' && parsed.content) {
                  onMessage?.(parsed.content);
                } else if (parsed.type === 'end') {
                  onComplete?.();
                  return;
                } else if (parsed.type === 'error') {
                  throw new ApiError(parsed.message || 'Stream error', 500, 'http');
                }
              } catch (parseError) {
                // If it's not JSON, treat as plain text content
                if (data.trim()) {
                  onMessage?.(data);
                }
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof ApiError) {
          onError?.(error);
        } else if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return; // Expected when aborting
          }
          onError?.(new ApiError(error.message, 500, 'unknown'));
        } else {
          onError?.(new ApiError('Unknown streaming error', 500, 'unknown'));
        }
      }
    };

    startStream();

    return {
      abort: () => controller.abort()
    };
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public type: ApiError['type'] = 'unknown'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();