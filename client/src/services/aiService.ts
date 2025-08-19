import config from '../config/environment';
import errorHandler, { APIError, NetworkError } from '../utils/errorHandler';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIRequest {
  prompt: string;
  model?: 'gemini-1.5-flash' | 'gemini-1.5-pro';
  temperature?: number;
  system?: string;
}

export interface AIResponse {
  text: string;
  error?: string;
}

class AIService {
  private apiBase: string;
  private authToken: string | null = null;
  private retryCount: number = 0;
  private isOnline: boolean = true;

  constructor() {
    // Use environment configuration
    this.apiBase = config.apiBaseUrl;
    
    // Check online status
    this.checkOnlineStatus();
    
    if (config.enableLogging) {
      console.log('🤖 AIService initialized with:', {
        apiBase: this.apiBase,
        timeout: config.requestTimeout,
        retries: config.retryAttempts,
        isGitHubPages: config.isGitHubPages
      });
    }
  }

  private checkOnlineStatus() {
    // Check if we're online
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (config.enableLogging) console.log('🌐 Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (config.enableLogging) console.log('📴 Gone offline');
    });
  }

  setApiBase(url: string) {
    this.apiBase = url;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add CORS headers for GitHub Pages
    if (config.isGitHubPages) {
      headers['Origin'] = window.location.origin;
    }

    return headers;
  }

  private getCurrentUserId(): string {
    // In a real app, this would come from authentication
    return 'demo-user-' + Math.random().toString(36).substr(2, 9);
  }

  // Helper method for making API requests with retry logic
  private async makeRequest(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<Response> {
    try {
      // Check if we're online
      if (!this.isOnline) {
        throw new NetworkError('No internet connection', 0);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit' // Don't send cookies for cross-origin requests
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (retryCount < config.retryAttempts && this.shouldRetry(error)) {
        if (config.enableLogging) {
          console.warn(`🔄 Retrying request (${retryCount + 1}/${config.retryAttempts}):`, url);
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.makeRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  // Determine if error should trigger a retry
  private shouldRetry(error: any): boolean {
    // Retry network errors, timeouts, and certain HTTP status codes
    return (
      error.name === 'TypeError' || // Network errors
      error.name === 'AbortError' || // Timeout errors
      error.name === 'NetworkError' || // Our custom network error
      (error.statusCode >= 500 && error.statusCode < 600) || // Server errors
      error.statusCode === 429 // Rate limit
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/health`, {
        method: 'GET'
      });
      
      if (config.enableLogging) {
        console.log('❤️ Health check:', response.ok ? 'OK' : 'FAILED');
      }
      
      return response.ok;
    } catch (error) {
      const apiError = errorHandler.handleAPIError(error);
      errorHandler.logError(apiError, 'Health Check');
      return false;
    }
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      if (config.enableLogging) {
        console.log('💬 Sending message:', {
          model: request.model || 'gemini-1.5-flash',
          promptLength: request.prompt.length,
          temperature: request.temperature || 0.7
        });
      }

      const response = await this.makeRequest(`${this.apiBase}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'gemini-1.5-flash',
          temperature: request.temperature || 0.7,
          system: request.system,
          userId: this.getCurrentUserId()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}` 
        }));
        
        const networkError = new NetworkError(
          errorData.message || 'Request failed',
          response.status,
          errorData
        );
        throw networkError;
      }

      const result = await response.json();
      
      if (config.enableLogging) {
        console.log('✅ Message response received:', {
          length: result.text?.length || 0
        });
      }
      
      return { text: result.text || '' };
      
    } catch (error) {
      const apiError = errorHandler.handleAPIError(error);
      errorHandler.logError(apiError, 'Send Message');
      
      // Provide fallback response for common errors
      if (apiError.code === 'NETWORK_ERROR' || apiError.code === 'CORS_ERROR') {
        return {
          text: 'I\'m having trouble connecting to my AI service right now. This might be due to network issues or the service being temporarily unavailable. Please try again in a moment, or check your internet connection.',
          error: 'Connection issue - please try again'
        };
      }
      
      return { 
        text: '', 
        error: errorHandler.getUserMessage(apiError)
      };
    }
  }

  async streamMessage(
    request: AIRequest, 
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.apiBase}/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: request.prompt,
          model: request.model || 'gemini-1.5-flash',
          temperature: request.temperature || 0.7,
          system: request.system
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.error) {
                throw new Error(data.message || 'Stream error');
              }
              
              if (data.delta) {
                fullText += data.delta;
                onChunk(data.delta);
              }
              
              if (data.done) {
                onComplete(fullText);
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream request failed:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Study-specific AI methods
  async getStudyRecommendations(subject: string, currentProgress: number): Promise<string> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/study/recommendations`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          subject,
          progress: currentProgress,
          prompt: '', // Required by validateRequest middleware
          userId: this.getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.recommendations;
    } catch (error) {
      console.error('Study recommendations failed:', error);
      // Fallback to basic chat
      const prompt = `I'm studying ${subject} and I'm currently at ${currentProgress}% completion. 
      Please provide personalized study recommendations, including:
      1. What topics I should focus on next
      2. Study techniques that work well for this subject
      3. Practice exercises or resources I should use
      4. How to overcome common challenges in this subject
      
      Keep the response concise and actionable.`;
      
      const response = await this.sendMessage({ prompt });
      return response.text;
    }
  }

  async explainConcept(concept: string, subject: string): Promise<string> {
    const prompt = `Please explain the concept "${concept}" in the context of ${subject}. 
    Make it easy to understand with:
    1. A clear definition
    2. Simple examples
    3. How it relates to other concepts in ${subject}
    4. Common misconceptions to avoid
    
    Keep it concise but comprehensive.`;
    
    const response = await this.sendMessage({ prompt });
    return response.text;
  }

  async generatePracticeQuestions(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string> {
    const prompt = `Generate 3 ${difficulty} practice questions about "${topic}". 
    For each question, provide:
    1. The question
    2. Multiple choice options (A, B, C, D)
    3. The correct answer
    4. A brief explanation of why it's correct
    
    Format it clearly and make sure the questions are relevant and educational.`;
    
    const response = await this.sendMessage({ prompt });
    return response.text;
  }

  async analyzeStudySession(duration: number, topics: string[], performance: number): Promise<string> {
    const prompt = `I just completed a ${duration}-minute study session covering: ${topics.join(', ')}. 
    My self-assessed performance was ${performance}/10.
    
    Please analyze this study session and provide:
    1. What went well
    2. Areas for improvement
    3. Suggestions for next session
    4. Time management tips
    5. Whether the duration was appropriate for the topics covered
    
    Be encouraging but honest.`;
    
    const response = await this.sendMessage({ prompt });
    return response.text;
  }

  async createStudyPlan(subjects: string[], availableHours: number, days: number): Promise<string> {
    const prompt = `I need to create a study plan for the following subjects: ${subjects.join(', ')}.
    I have ${availableHours} hours available over ${days} days.
    
    Please create a detailed study plan that includes:
    1. Daily breakdown of study time
    2. Which subjects to focus on each day
    3. Recommended study techniques for each subject
    4. Breaks and rest periods
    5. How to track progress
    6. Tips for staying motivated
    
    Make it realistic and sustainable.`;
    
    const response = await this.sendMessage({ prompt });
    return response.text;
  }

  // Interview-specific methods
  async uploadResume(formData: FormData): Promise<any> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/interview/upload-resume`, {
        method: 'POST',
        body: formData // Don't set Content-Type for FormData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resume upload failed:', error);
      throw error;
    }
  }

  async submitInterviewAnswer(data: {
    sessionId: string;
    answer: string;
    questionNumber: number;
    userId: string;
  }): Promise<any> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/interview/answer`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Answer submission failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Answer submission failed:', error);
      throw error;
    }
  }

  async getInterviewHistory(userId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/interview/history/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to get history' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get interview history failed:', error);
      throw error;
    }
  }

  async recordStudySession(data: {
    userId: string;
    subject: string;
    duration: number;
    topics?: string[];
    performanceScore?: number;
  }): Promise<any> {
    try {
      const response = await this.makeRequest(`${this.apiBase}/study/session`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to record session' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Record study session failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
