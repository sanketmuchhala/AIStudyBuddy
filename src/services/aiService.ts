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

  constructor() {
    // Railway backend URL
    this.apiBase = 'https://ai-study-buddy-backend-production.up.railway.app';
  }

  setApiBase(url: string) {
    this.apiBase = url;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.apiBase}/chat`, {
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

      const result = await response.json();
      return { text: result.text };
    } catch (error) {
      console.error('AI request failed:', error);
      return { 
        text: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
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
}

export const aiService = new AIService();
