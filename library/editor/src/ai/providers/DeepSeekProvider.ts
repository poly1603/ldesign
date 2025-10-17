/**
 * DeepSeek AI 提供商实现
 */

import type { 
  AIProviderInterface, 
  AIModelConfig, 
  AIRequest, 
  AIResponse,
  AIRequestType 
} from '../types'

export class DeepSeekProvider implements AIProviderInterface {
  name: 'deepseek' = 'deepseek'
  config: AIModelConfig

  constructor(config?: AIModelConfig) {
    this.config = config || {
      provider: 'deepseek',
      model: 'deepseek-chat',
      apiKey: 'sk-37b7e5f545814da1923cae055b498c9a',
      apiEndpoint: 'https://api.deepseek.com/v1',
      temperature: 0.7,
      maxTokens: 2000,
      stream: false
    }
  }

  async initialize(config: AIModelConfig): Promise<void> {
    this.config = { ...this.config, ...config }
    if (!this.validateConfig()) {
      throw new Error('Invalid DeepSeek configuration')
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiEndpoint && this.config.model)
  }

  async request(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type)
      const userPrompt = this.getUserPrompt(request)

      const response = await fetch(`${this.config.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2000,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message || 'DeepSeek API error')
      }

      const content = data.choices?.[0]?.message?.content || ''
      
      return {
        success: true,
        text: content,
        suggestions: request.type === 'suggest' ? this.parseSuggestions(content) : undefined,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined
      }
    } catch (error) {
      console.error('DeepSeek request error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getSystemPrompt(type: AIRequestType): string {
    const prompts: Record<AIRequestType, string> = {
      correct: '你是一个专业的文本纠错助手。请纠正文本中的拼写、语法和标点错误。保持原意不变，只修正错误。直接返回纠正后的文本，不要解释。',
      complete: '你是一个智能写作助手。根据上下文，为用户补全当前正在输入的内容。返回简洁、相关的补全建议。',
      continue: '你是一个创意写作助手。根据已有内容，自然地续写后续内容。保持语言风格和主题一致。',
      rewrite: '你是一个专业的文本重写助手。请改写文本，使其更加清晰、流畅和专业。保持原意，优化表达。',
      suggest: '你是一个智能建议助手。根据上下文，提供相关的写作建议。返回3-5个简短的建议选项。'
    }
    return prompts[type] || prompts.correct
  }

  private getUserPrompt(request: AIRequest): string {
    let prompt = `文本：${request.text}`
    
    if (request.context) {
      prompt = `上下文：${request.context}\n\n${prompt}`
    }
    
    if (request.language) {
      prompt = `语言：${request.language}\n\n${prompt}`
    }
    
    return prompt
  }

  private parseSuggestions(content: string): string[] {
    // 尝试解析建议列表
    const suggestions: string[] = []
    const lines = content.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      // 移除数字标记、破折号等
      const cleaned = line.replace(/^[\d\.\-\*\s]+/, '').trim()
      if (cleaned) {
        suggestions.push(cleaned)
      }
    }
    
    return suggestions.slice(0, 5) // 最多返回5个建议
  }

  cleanup(): void {
    // 清理资源（如果需要）
  }
}