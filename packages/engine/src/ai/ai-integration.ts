/**
 * AI 集成模块
 * 支持多种 AI 提供商，提供智能分析、代码优化、错误诊断等功能
 */

import type { Engine, Logger } from '../types'

// ==================== 类型定义 ====================

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  endpoint?: string
  model?: string
  maxTokens?: number
  temperature?: number
  features?: AIFeatures
  cache?: boolean
  timeout?: number
}

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'azure' | 'local' | 'custom'

export interface AIFeatures {
  codeGeneration?: boolean
  codeOptimization?: boolean
  errorAnalysis?: boolean
  performanceOptimization?: boolean
  securityAnalysis?: boolean
  documentation?: boolean
  testing?: boolean
  translation?: boolean
}

export interface AIAnalysisResult {
  suggestions: AISuggestion[]
  confidence: number
  reasoning?: string
  metadata?: Record<string, unknown>
}

export interface AISuggestion {
  type: 'error' | 'warning' | 'optimization' | 'security' | 'style'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  code?: string
  diff?: string
  fix?: () => Promise<void>
  learnMore?: string
}

export interface CodeAnalysisRequest {
  code: string
  language?: string
  context?: string
  intent?: string
  rules?: string[]
}

export interface ErrorAnalysisRequest {
  error: Error
  context?: Record<string, unknown>
  stackTrace?: string
  previousFixes?: string[]
}

export interface PerformanceAnalysisRequest {
  metrics: Record<string, number>
  code?: string
  threshold?: Record<string, number>
}

// AI 提供商接口
interface AIProviderAdapter {
  name: string
  analyze: (prompt: string, options?: Record<string, unknown>) => Promise<string>
  stream?: (prompt: string, onChunk: (chunk: string) => void) => Promise<void>
  embeddings?: (text: string) => Promise<number[]>
}

// ==================== 实现 ====================

export class AIIntegration {
  private config: AIConfig
  private provider?: AIProviderAdapter
  private cache = new Map<string, AIAnalysisResult>()
  private engine?: Engine
  private logger?: Logger
  private requestQueue: Array<() => Promise<void>> = []
  private isProcessing = false
  private rateLimiter = {
    tokens: 10,
    maxTokens: 10,
    refillRate: 1000, // ms
    lastRefill: Date.now()
  }

  constructor(config: AIConfig, engine?: Engine) {
    this.config = config
    this.engine = engine
    this.logger = engine?.logger
    this.initializeProvider()
  }

  // ==================== 初始化 ====================

  private initializeProvider(): void {
    switch (this.config.provider) {
      case 'openai':
        this.provider = this.createOpenAIProvider()
        break
      case 'anthropic':
        this.provider = this.createAnthropicProvider()
        break
      case 'gemini':
        this.provider = this.createGeminiProvider()
        break
      case 'local':
        this.provider = this.createLocalProvider()
        break
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`)
    }

    this.logger?.info(`AI provider initialized: ${this.config.provider}`)
  }

  // ==================== 核心功能 ====================

  /**
   * 分析代码并提供优化建议
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<AIAnalysisResult> {
    const cacheKey = this.getCacheKey('code', request)
    
    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const prompt = this.buildCodeAnalysisPrompt(request)
    const response = await this.executeWithRateLimit(() => 
      this.provider!.analyze(prompt, {
        maxTokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.3
      })
    )

    const result = this.parseAnalysisResponse(response)
    
    if (this.config.cache) {
      this.cache.set(cacheKey, result)
    }

    return result
  }

  /**
   * 分析错误并提供修复建议
   */
  async analyzeError(request: ErrorAnalysisRequest): Promise<AIAnalysisResult> {
    const cacheKey = this.getCacheKey('error', request)
    
    if (this.config.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const prompt = this.buildErrorAnalysisPrompt(request)
    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: this.config.maxTokens || 1500,
        temperature: 0.2 // 低温度以获得更确定的答案
      })
    )

    const result = this.parseAnalysisResponse(response)
    
    // 增强错误分析结果
    result.suggestions = result.suggestions.map(suggestion => ({
      ...suggestion,
      fix: this.createErrorFix(request.error, suggestion)
    }))

    if (this.config.cache) {
      this.cache.set(cacheKey, result)
    }

    // 记录到错误系统
    this.engine?.errors?.onError((errorInfo) => {
      this.logger?.info('AI Error Analysis:', { errorInfo, result })
    })

    return result
  }

  /**
   * 优化性能
   */
  async optimizePerformance(request: PerformanceAnalysisRequest): Promise<AIAnalysisResult> {
    const prompt = this.buildPerformancePrompt(request)
    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 2000,
        temperature: 0.4
      })
    )

    const result = this.parseAnalysisResponse(response)
    
    // 自动应用性能优化
    if (result.confidence > 0.8) {
      for (const suggestion of result.suggestions) {
        if (suggestion.severity === 'critical' && suggestion.fix) {
          await suggestion.fix()
          this.logger?.info(`Applied performance optimization: ${suggestion.title}`)
        }
      }
    }

    return result
  }

  /**
   * 生成代码
   */
  async generateCode(
    description: string, 
    language = 'typescript',
    context?: string
  ): Promise<string> {
    const prompt = `Generate ${language} code for: ${description}
    ${context ? `Context: ${context}` : ''}
    Requirements:
    - Follow best practices
    - Include error handling
    - Add comments for complex logic
    - Use TypeScript if applicable`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 3000,
        temperature: 0.7
      })
    )

    return this.extractCodeFromResponse(response)
  }

  /**
   * 生成文档
   */
  async generateDocumentation(code: string, format = 'markdown'): Promise<string> {
    const prompt = `Generate ${format} documentation for the following code:
    \`\`\`
    ${code}
    \`\`\`
    Include: API reference, usage examples, parameters description`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 2000,
        temperature: 0.3
      })
    )

    return response
  }

  /**
   * 生成测试
   */
  async generateTests(code: string, framework = 'vitest'): Promise<string> {
    const prompt = `Generate comprehensive ${framework} tests for:
    \`\`\`
    ${code}
    \`\`\`
    Include: unit tests, edge cases, error scenarios`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 2500,
        temperature: 0.4
      })
    )

    return this.extractCodeFromResponse(response)
  }

  /**
   * 安全分析
   */
  async analyzeSecuirty(code: string): Promise<AIAnalysisResult> {
    const prompt = `Analyze the following code for security vulnerabilities:
    \`\`\`
    ${code}
    \`\`\`
    Check for: XSS, SQL injection, CSRF, sensitive data exposure, etc.`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 2000,
        temperature: 0.2
      })
    )

    const result = this.parseAnalysisResponse(response)
    
    // 将安全问题报告给安全管理器
    if (result.suggestions.some(s => s.severity === 'critical')) {
      // TODO: Implement security validation when security manager is available
      this.logger?.error('Critical security issue detected:', result)
    }

    return result
  }

  /**
   * 智能代码补全
   */
  async autocomplete(
    code: string, 
    cursorPosition: number,
    maxSuggestions = 5
  ): Promise<string[]> {
    const context = code.substring(Math.max(0, cursorPosition - 500), cursorPosition)
    const prompt = `Complete the following code:
    \`\`\`
    ${context}
    [CURSOR]
    \`\`\`
    Provide ${maxSuggestions} completions.`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 500,
        temperature: 0.8
      })
    )

    return this.parseCompletions(response)
  }

  /**
   * 代码重构建议
   */
  async suggestRefactoring(code: string): Promise<AIAnalysisResult> {
    const prompt = `Suggest refactoring for the following code:
    \`\`\`
    ${code}
    \`\`\`
    Focus on: readability, maintainability, performance, DRY principle`

    const response = await this.executeWithRateLimit(() =>
      this.provider!.analyze(prompt, {
        maxTokens: 2000,
        temperature: 0.5
      })
    )

    return this.parseAnalysisResponse(response)
  }

  // ==================== 工具方法 ====================

  private buildCodeAnalysisPrompt(request: CodeAnalysisRequest): string {
    return `Analyze the following ${request.language || 'code'}:
    \`\`\`
    ${request.code}
    \`\`\`
    
    ${request.context ? `Context: ${request.context}` : ''}
    ${request.intent ? `Intent: ${request.intent}` : ''}
    ${request.rules ? `Rules to check: ${request.rules.join(', ')}` : ''}
    
    Provide:
    1. Code quality issues
    2. Performance optimizations
    3. Security concerns
    4. Best practice violations
    5. Suggested improvements
    
    Format response as JSON with suggestions array.`
  }

  private buildErrorAnalysisPrompt(request: ErrorAnalysisRequest): string {
    return `Analyze this error:
    Error: ${request.error.message}
    ${request.stackTrace ? `Stack: ${request.stackTrace}` : ''}
    ${request.context ? `Context: ${JSON.stringify(request.context)}` : ''}
    ${request.previousFixes ? `Previous attempts: ${request.previousFixes.join(', ')}` : ''}
    
    Provide:
    1. Root cause analysis
    2. Step-by-step fix
    3. Prevention strategies
    4. Related issues
    
    Format as JSON with suggestions.`
  }

  private buildPerformancePrompt(request: PerformanceAnalysisRequest): string {
    return `Analyze performance metrics:
    ${JSON.stringify(request.metrics, null, 2)}
    
    ${request.code ? `Related code:\n\`\`\`\n${request.code}\n\`\`\`` : ''}
    ${request.threshold ? `Thresholds: ${JSON.stringify(request.threshold)}` : ''}
    
    Identify:
    1. Performance bottlenecks
    2. Optimization opportunities
    3. Resource usage issues
    4. Scalability concerns
    
    Provide actionable suggestions.`
  }

  private parseAnalysisResponse(response: string): AIAnalysisResult {
    try {
      // 尝试解析 JSON 响应
      const parsed = JSON.parse(response)
      return {
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning,
        metadata: parsed.metadata
      }
    } catch {
      // 降级处理：从文本响应提取信息
      return this.parseTextResponse(response)
    }
  }

  private parseTextResponse(response: string): AIAnalysisResult {
    const suggestions: AISuggestion[] = []
    const lines = response.split('\n')
    
    let currentSuggestion: Partial<AISuggestion> = {}
    
    for (const line of lines) {
      if (line.includes('Error:') || line.includes('Warning:') || line.includes('Suggestion:')) {
        if (currentSuggestion.title) {
          suggestions.push(currentSuggestion as AISuggestion)
        }
        
        currentSuggestion = {
          type: line.includes('Error') ? 'error' : 'optimization',
          severity: line.includes('Critical') ? 'critical' : 'medium',
          title: line.replace(/^(Error|Warning|Suggestion):\s*/, ''),
          description: ''
        }
      } else if (currentSuggestion.title) {
        currentSuggestion.description += `${line  }\n`
      }
    }
    
    if (currentSuggestion.title) {
      suggestions.push(currentSuggestion as AISuggestion)
    }
    
    return {
      suggestions,
      confidence: 0.7,
      reasoning: response
    }
  }

  private extractCodeFromResponse(response: string): string {
    const codeMatch = response.match(/```\w*\n([\s\S]*?)```/)
    return codeMatch ? codeMatch[1] : response
  }

  private parseCompletions(response: string): string[] {
    const completions: string[] = []
    for (const raw of response.split('\n')) {
      const line = raw.trim()
      const dot = line.indexOf('.')
      if (dot > 0) {
        const leading = line.slice(0, dot)
        if (/^\d+$/.test(leading)) {
          const text = line.slice(dot + 1).trim()
          if (text) completions.push(text)
        }
      }
    }
    return completions.slice(0, 5)
  }

  private createErrorFix(error: Error, suggestion: AISuggestion): () => Promise<void> {
    return async () => {
      this.logger?.info(`Applying AI fix for: ${error.message}`)
      
      // 实际的修复逻辑应根据建议类型实现
      if (suggestion.code) {
        // 应用代码修复
        this.engine?.events?.emit('ai:fix-applied', {
          error,
          suggestion,
          code: suggestion.code
        })
      }
    }
  }

  private getCacheKey(type: string, request: any): string {
    const str = JSON.stringify(request)
    return `${type}:${this.hashString(str)}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  // ==================== 速率限制 ====================

  private async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return
    }

    this.isProcessing = true
    
    while (this.requestQueue.length > 0) {
      await this.waitForToken()
      
      const request = this.requestQueue.shift()
      if (request) {
        await request()
      }
    }
    
    this.isProcessing = false
  }

  private async waitForToken(): Promise<void> {
    this.refillTokens()
    
    if (this.rateLimiter.tokens <= 0) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimiter.refillRate)
      )
      return this.waitForToken()
    }
    
    this.rateLimiter.tokens--
  }

  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.rateLimiter.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.rateLimiter.refillRate)
    
    if (tokensToAdd > 0) {
      this.rateLimiter.tokens = Math.min(
        this.rateLimiter.maxTokens,
        this.rateLimiter.tokens + tokensToAdd
      )
      this.rateLimiter.lastRefill = now
    }
  }

  // ==================== Provider 实现 ====================

  private createOpenAIProvider(): AIProviderAdapter {
    return {
      name: 'OpenAI',
      analyze: async (prompt, options) => {
        if (!this.config.apiKey) {
          throw new Error('OpenAI API key is required')
        }

        const response = await fetch(this.config.endpoint || 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model || 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options?.maxTokens,
            temperature: options?.temperature
          })
        })

        const data = await response.json()
        return data.choices[0].message.content
      },
      
      stream: async (prompt, onChunk) => {
        // Stream implementation for OpenAI
        const response = await fetch(this.config.endpoint || 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model || 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            stream: true
          })
        })

        const reader = response.body?.getReader()
        if (!reader) return

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const text = new TextDecoder().decode(value)
          onChunk(text)
        }
      }
    }
  }

  private createAnthropicProvider(): AIProviderAdapter {
    return {
      name: 'Anthropic',
      analyze: async (prompt, options) => {
        if (!this.config.apiKey) {
          throw new Error('Anthropic API key is required')
        }

        const response = await fetch(this.config.endpoint || 'https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': this.config.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.config.model || 'claude-3-opus-20240229',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options?.maxTokens || 1000
          })
        })

        const data = await response.json()
        return data.content[0].text
      }
    }
  }

  private createGeminiProvider(): AIProviderAdapter {
    return {
      name: 'Gemini',
      analyze: async (prompt, options) => {
        if (!this.config.apiKey) {
          throw new Error('Gemini API key is required')
        }

        const url = `${this.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta'}/models/${this.config.model || 'gemini-pro'}:generateContent?key=${this.config.apiKey}`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: options?.maxTokens,
              temperature: options?.temperature
            }
          })
        })

        const data = await response.json()
        return data.candidates[0].content.parts[0].text
      }
    }
  }

  private createLocalProvider(): AIProviderAdapter {
    // 本地模型提供商（如 Ollama）
    return {
      name: 'Local',
      analyze: async (prompt, options) => {
        const response = await fetch(this.config.endpoint || 'http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model || 'codellama',
            prompt,
            options: {
              num_predict: options?.maxTokens,
              temperature: options?.temperature
            }
          })
        })

        const data = await response.json()
        return data.response
      }
    }
  }

  // ==================== 公共 API ====================

  /**
   * 配置 AI 提供商
   */
  configure(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config }
    this.initializeProvider()
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取使用统计
   */
  getStats(): {
    provider: string
    cacheSize: number
    queueLength: number
    rateLimitStatus: {
      tokens: number
      maxTokens: number
    }
  } {
    return {
      provider: this.config.provider,
      cacheSize: this.cache.size,
      queueLength: this.requestQueue.length,
      rateLimitStatus: {
        tokens: this.rateLimiter.tokens,
        maxTokens: this.rateLimiter.maxTokens
      }
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cache.clear()
    this.requestQueue = []
    this.isProcessing = false
  }
}

// 导出工厂函数
export function createAIIntegration(config: AIConfig, engine?: Engine): AIIntegration {
  return new AIIntegration(config, engine)
}