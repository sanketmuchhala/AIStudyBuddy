const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    timestamp: string;
    path: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Health check
  async getHealth() {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
      services: Record<string, string>;
    }>('/health');
  }

  // Chat endpoints
  async sendMessage(message: string, conversationId?: string) {
    return this.request<ApiResponse<{
      message: string;
      conversationId: string;
      timestamp: string;
    }>>('/chat', {
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
    }>>('/quick/summarize', {
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
    }>>('/quick/study-plan', {
      method: 'POST',
      body: JSON.stringify({ topic, duration, level }),
    });
  }

  async generateFlashcards(content: string, count: number = 10) {
    return this.request<ApiResponse<{
      flashcards: string;
      count: number;
      timestamp: string;
    }>>('/quick/flashcards', {
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
    }>>('/quick/explain', {
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
    }>>('/quick/quiz', {
      method: 'POST',
      body: JSON.stringify({ topic, questionCount, difficulty }),
    });
  }

  // Streaming chat
  createChatStream(message: string, conversationId?: string): EventSource {
    const params = new URLSearchParams();
    if (conversationId) params.set('conversationId', conversationId);
    
    const url = `${this.baseUrl}/chat/stream?${params}`;
    
    const eventSource = new EventSource(url, {
      withCredentials: true,
    });

    // Send the message via POST after creating the connection
    fetch(`${this.baseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversationId }),
    }).catch(error => {
      console.error('Failed to send streaming message:', error);
      eventSource.close();
    });

    return eventSource;
  }
}

export const apiClient = new ApiClient();