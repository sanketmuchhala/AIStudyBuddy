interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekChatRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface DeepSeekChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: DeepSeekMessage
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class DeepSeekClient {
  private baseURL = 'https://api.deepseek.com'
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required')
    }
  }

  async chatCompletion(
    messages: DeepSeekMessage[],
    options: Partial<DeepSeekChatRequest> = {}
  ): Promise<DeepSeekChatResponse> {
    const requestBody: DeepSeekChatRequest = {
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      ...options
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async *chatCompletionStream(
    messages: DeepSeekMessage[],
    options: Partial<DeepSeekChatRequest> = {}
  ): AsyncGenerator<string, void, unknown> {
    const requestBody: DeepSeekChatRequest = {
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
      ...options
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`)
    }

    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// Export singleton instance
export const deepseek = new DeepSeekClient()

// Export types
export type { DeepSeekMessage, DeepSeekChatRequest, DeepSeekChatResponse }