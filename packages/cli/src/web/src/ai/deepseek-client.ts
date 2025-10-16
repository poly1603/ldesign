/**
 * DeepSeek API 客户端
 */

import type { 
  AIConfig, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  ChatMessage 
} from './types'
import { getAIConfig } from './config'

/**
 * DeepSeek 客户端类
 */
export class DeepSeekClient {
  private config: AIConfig

  constructor(config?: AIConfig) {
    // 如果没有传入配置，尝试从存储中获取
    this.config = config || getAIConfig() || {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      timeout: 60000,
      maxRetries: 3
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AIConfig>): void {
    this.config = {
      ...this.config,
      ...config
    }
  }

  /**
   * 检查配置是否有效
   */
  isConfigured(): boolean {
    return !!(this.config?.apiKey && this.config?.apiKey.trim().length > 0)
  }

  /**
   * 发送聊天完成请求
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>
  ): Promise<ChatCompletionResponse> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API 密钥未配置，请先在设置中配置密钥')
    }

    const request: ChatCompletionRequest = {
      model: options?.model || this.config?.model || 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 1,
      max_tokens: options?.max_tokens,
      stream: false,
      ...options
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config?.timeout || 60000
      )

      const response = await fetch(`${this.config?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config?.apiKey}`
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `DeepSeek API 请求失败: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        )
      }

      const data = await response.json()
      return data as ChatCompletionResponse
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试')
      }
      throw error
    }
  }

  /**
   * 流式聊天完成
   */
  async *streamChatCompletion(
    messages: ChatMessage[],
    options?: Partial<ChatCompletionRequest>
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API 密钥未配置，请先在设置中配置密钥')
    }

    const request: ChatCompletionRequest = {
      model: options?.model || this.config?.model || 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 1,
      max_tokens: options?.max_tokens,
      stream: true,
      ...options
    }

    try {
      const response = await fetch(`${this.config?.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config?.apiKey}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `DeepSeek API 请求失败: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(trimmedLine.slice(6))
              const content = jsonData.choices?.[0]?.delta?.content
              if (content) {
                yield content
              }
            } catch (e) {
              console.error('解析流式数据失败:', e)
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`流式请求失败: ${error.message}`)
    }
  }

  /**
   * 简单的对话接口
   */
  async chat(userMessage: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = []
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      })
    }
    
    messages.push({
      role: 'user',
      content: userMessage
    })

    const response = await this.chatCompletion(messages)
    return response.choices[0]?.message?.content || ''
  }
}

/**
 * 创建 DeepSeek 客户端实例
 */
export function createDeepSeekClient(config?: AIConfig): DeepSeekClient {
  return new DeepSeekClient(config)
}
