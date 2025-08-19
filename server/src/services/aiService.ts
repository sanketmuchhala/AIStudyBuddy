import { logger } from '../index';

export interface AIProvider {
  generateText(prompt: string): Promise<string>;
  generateStream(prompt: string): AsyncGenerator<string, void, unknown>;
}

class MockAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    logger.info('Using mock AI provider for text generation');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    return `Mock AI Response: I understand you asked about "${prompt.substring(0, 50)}...". Here's a helpful response that demonstrates the AI functionality is working. In a real deployment, this would be replaced with actual AI responses from your preferred provider.`;
  }

  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    logger.info('Using mock AI provider for streaming');
    const response = await this.generateText(prompt);
    const words = response.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
    }
  }
}

class OpenAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string): Promise<string> {
    logger.info('Using OpenAI provider for text generation');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || 'No response generated';
  }

  async *generateStream(prompt: string): AsyncGenerator<string, void, unknown> {
    logger.info('Using OpenAI provider for streaming');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(dataStr) as any;
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// Factory function to create appropriate provider
export function createAIProvider(): AIProvider {
  const provider = process.env.PROVIDER || 'mock';
  
  switch (provider) {
    case 'openai':
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        logger.warn('OPENAI_API_KEY not found, falling back to mock provider');
        return new MockAIProvider();
      }
      return new OpenAIProvider(apiKey);
    
    case 'mock':
    default:
      return new MockAIProvider();
  }
}