/**
 * Claude (Anthropic) 提供商
 * 支持 Claude 3 系列模型
 */

import type { AIProvider, AIRequest, AIResponse, AIModelConfig } from '../types'

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  private apiKey: string
  private baseURL: string
  private model: string
  private defaultConfig: AIModelConfig
  
  constructor(apiKey: string, config: Partial<AIModelConfig> = {}) {
    this.apiKey = apiKey
    this.baseURL = config.baseURL || 'https://api.anthropic.com/v1'
    this.model = config.model || 'claude-3-sonnet-20240229'
    this.defaultConfig = {
      model: this.model,
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1,
      ...config
    }
  }
  
  async chat(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model || this.model,
          messages: [
            { role: 'user', content: request.prompt }
          ],
          system: request.systemPrompt || 'You are a helpful writing assistant.',
          temperature: request.temperature || this.defaultConfig.temperature,
          max_tokens: request.maxTokens || this.defaultConfig.maxTokens,
          top_p: request.topP || this.defaultConfig.topP,
          stream: request.stream || false
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Claude API request failed')
      }
      
      const data = await response.json()
      
      return {
        content: data.content[0]?.text || '',
        model: data.model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      }
    } catch (error) {
      console.error('Claude request failed:', error)
      throw error
    }
  }
  
  async stream(request: AIRequest, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model || this.model,
          messages: [
            { role: 'user', content: request.prompt }
          ],
          system: request.systemPrompt || 'You are a helpful writing assistant.',
          temperature: request.temperature || this.defaultConfig.temperature,
          max_tokens: request.maxTokens || this.defaultConfig.maxTokens,
          stream: true
        })
      })
      
      if (!response.ok) {
        throw new Error('Claude streaming request failed')
      }
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('No reader available')
      }
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            try {
              const json = JSON.parse(data)
              
              if (json.type === 'content_block_delta') {
                const content = json.delta?.text
                if (content) {
                  onChunk(content)
                }
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Claude streaming failed:', error)
      throw error
    }
  }
  
  getSupportedModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0'
    ]
  }
}





