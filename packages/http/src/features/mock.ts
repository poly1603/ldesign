import type { HttpClient, RequestConfig, ResponseData } from '../types'

/**
 * Mock 响应配置
 */
export interface MockResponse<T = any> {
  /** 响应数据 */
  data?: T
  /** 状态码 */
  status?: number
  /** 状态文本 */
  statusText?: string
  /** 响应头 */
  headers?: Record<string, string>
  /** 延迟时间（毫秒） */
  delay?: number
  /** 错误信息（如果要返回错误） */
  error?: string | Error
}

/**
 * Mock 规则匹配函数
 */
export type MockMatcher = (config: RequestConfig) => boolean

/**
 * Mock 规则配置
 */
export interface MockRule<T = any> {
  /** 匹配规则 */
  matcher: string | RegExp | MockMatcher
  /** Mock 响应 */
  response: MockResponse<T> | ((config: RequestConfig) => MockResponse<T> | Promise<MockResponse<T>>)
  /** 是否只匹配一次 */
  once?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 规则名称 */
  name?: string
  /** 优先级（越大越优先） */
  priority?: number
}

/**
 * Mock 统计信息
 */
export interface MockStats {
  /** 总匹配次数 */
  totalMatches: number
  /** 各规则匹配次数 */
  ruleMatches: Map<string, number>
  /** 最后匹配时间 */
  lastMatchTime: number | null
}

/**
 * Mock 适配器
 *
 * 拦截 HTTP 请求并返回模拟数据，用于开发和测试
 *
 * @example
 * ```typescript
 * const mockAdapter = new MockAdapter()
 *
 * // 添加 Mock 规则
 * mockAdapter.onGet('/api/users').reply(200, [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' }
 * ])
 *
 * // 使用正则匹配
 * mockAdapter.onGet(/\/api\/users\/\d+/).reply((config) => {
 *   const id = config.url?.split('/').pop()
 *   return {
 *     status: 200,
 *     data: { id: Number(id), name: 'User ' + id }
 *   }
 * })
 *
 * // 应用到 HTTP 客户端
 * mockAdapter.apply(httpClient)
 * ```
 */
export class MockAdapter {
  private rules: MockRule[] = []
  private stats: MockStats = {
    totalMatches: 0,
    ruleMatches: new Map(),
    lastMatchTime: null,
  }

  private originalRequest?: HttpClient['request']
  private isApplied = false

  /**
   * 添加 GET 请求 Mock 规则
   */
  onGet(matcher: string | RegExp): MockRuleBuilder {
    return this.on('GET', matcher)
  }

  /**
   * 添加 POST 请求 Mock 规则
   */
  onPost(matcher: string | RegExp): MockRuleBuilder {
    return this.on('POST', matcher)
  }

  /**
   * 添加 PUT 请求 Mock 规则
   */
  onPut(matcher: string | RegExp): MockRuleBuilder {
    return this.on('PUT', matcher)
  }

  /**
   * 添加 DELETE 请求 Mock 规则
   */
  onDelete(matcher: string | RegExp): MockRuleBuilder {
    return this.on('DELETE', matcher)
  }

  /**
   * 添加 PATCH 请求 Mock 规则
   */
  onPatch(matcher: string | RegExp): MockRuleBuilder {
    return this.on('PATCH', matcher)
  }

  /**
   * 添加任意方法的 Mock 规则
   */
  on(method: string, matcher: string | RegExp): MockRuleBuilder {
    const combinedMatcher: MockMatcher = (config) => {
      if (config.method?.toUpperCase() !== method.toUpperCase()) {
        return false
      }
      return this.matchURL(config.url || '', matcher)
    }

    return new MockRuleBuilder(this, combinedMatcher)
  }

  /**
   * 添加自定义匹配规则
   */
  onAny(matcher: MockMatcher): MockRuleBuilder {
    return new MockRuleBuilder(this, matcher)
  }

  /**
   * 添加规则
   */
  addRule(rule: MockRule): void {
    this.rules.push({
      enabled: true,
      priority: 0,
      ...rule,
    })

    // 按优先级排序
    this.rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 移除规则
   */
  removeRule(name: string): boolean {
    const index = this.rules.findIndex(rule => rule.name === name)
    if (index !== -1) {
      this.rules.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 清空所有规则
   */
  clearRules(): void {
    this.rules = []
  }

  /**
   * 启用规则
   */
  enableRule(name: string): boolean {
    const rule = this.rules.find(r => r.name === name)
    if (rule) {
      rule.enabled = true
      return true
    }
    return false
  }

  /**
   * 禁用规则
   */
  disableRule(name: string): boolean {
    const rule = this.rules.find(r => r.name === name)
    if (rule) {
      rule.enabled = false
      return true
    }
    return false
  }

  /**
   * 获取所有规则
   */
  getRules(): MockRule[] {
    return [...this.rules]
  }

  /**
   * 获取统计信息
   */
  getStats(): MockStats {
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalMatches: 0,
      ruleMatches: new Map(),
      lastMatchTime: null,
    }
  }

  /**
   * 应用到 HTTP 客户端
   */
  apply(client: HttpClient): void {
    if (this.isApplied) {
      throw new Error('MockAdapter is already applied')
    }

    // 保存原始 request 方法
    this.originalRequest = client.request.bind(client)

    // 替换 request 方法
    client.request = this.createMockRequest(this.originalRequest)

    this.isApplied = true
  }

  /**
   * 从 HTTP 客户端移除
   */
  restore(client: HttpClient): void {
    if (!this.isApplied || !this.originalRequest) {
      return
    }

    // 恢复原始 request 方法
    client.request = this.originalRequest

    this.isApplied = false
    this.originalRequest = undefined
  }

  /**
   * 创建 Mock 请求函数
   */
  private createMockRequest(originalRequest: HttpClient['request']) {
    return async <T = any>(config: RequestConfig): Promise<ResponseData<T>> => {
      // 查找匹配的规则
      const rule = this.findMatchingRule(config)

      if (rule) {
        // 更新统计
        this.updateStats(rule)

        // 如果是 once 规则，使用后移除
        if (rule.once) {
          const index = this.rules.indexOf(rule)
          if (index !== -1) {
            this.rules.splice(index, 1)
          }
        }

        // 获取 Mock 响应
        let mockResponse: MockResponse<T>
        if (typeof rule.response === 'function') {
          mockResponse = await rule.response(config)
        }
        else {
          mockResponse = rule.response
        }

        // 模拟延迟
        if (mockResponse.delay && mockResponse.delay > 0) {
          await this.delay(mockResponse.delay)
        }

        // 如果有错误，抛出错误
        if (mockResponse.error) {
          const error = typeof mockResponse.error === 'string'
            ? new Error(mockResponse.error)
            : mockResponse.error
          throw error
        }

        // 返回模拟响应
        return {
          data: mockResponse.data as T,
          status: mockResponse.status || 200,
          statusText: mockResponse.statusText || 'OK',
          headers: mockResponse.headers || {},
          config,
        }
      }

      // 没有匹配的规则，使用原始请求
      return originalRequest<T>(config)
    }
  }

  /**
   * 查找匹配的规则
   */
  private findMatchingRule(config: RequestConfig): MockRule | null {
    for (const rule of this.rules) {
      if (!rule.enabled) {
        continue
      }

      let matched = false
      if (typeof rule.matcher === 'function') {
        matched = rule.matcher(config)
      }
      else if (typeof rule.matcher === 'string') {
        matched = this.matchURL(config.url || '', rule.matcher)
      }
      else if (rule.matcher instanceof RegExp) {
        matched = this.matchURL(config.url || '', rule.matcher)
      }

      if (matched) {
        return rule
      }
    }

    return null
  }

  /**
   * 匹配 URL
   */
  private matchURL(url: string, matcher: string | RegExp): boolean {
    if (typeof matcher === 'string') {
      return url === matcher || url.includes(matcher)
    }
    return matcher.test(url)
  }

  /**
   * 更新统计
   */
  private updateStats(rule: MockRule): void {
    this.stats.totalMatches++
    this.stats.lastMatchTime = Date.now()

    if (rule.name) {
      const count = this.stats.ruleMatches.get(rule.name) || 0
      this.stats.ruleMatches.set(rule.name, count + 1)
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Mock 规则构建器
 */
export class MockRuleBuilder<T = any> {
  private adapter: MockAdapter
  private matcher: MockMatcher
  private ruleName?: string
  private rulePriority?: number
  private ruleOnce = false

  constructor(adapter: MockAdapter, matcher: MockMatcher) {
    this.adapter = adapter
    this.matcher = matcher
  }

  /**
   * 设置规则名称
   */
  name(name: string): this {
    this.ruleName = name
    return this
  }

  /**
   * 设置优先级
   */
  priority(priority: number): this {
    this.rulePriority = priority
    return this
  }

  /**
   * 只匹配一次
   */
  once(): this {
    this.ruleOnce = true
    return this
  }

  /**
   * 返回指定响应
   */
  reply(statusOrResponse: number | MockResponse<T> | ((config: RequestConfig) => MockResponse<T> | Promise<MockResponse<T>>), data?: T, headers?: Record<string, string>): void {
    let response: MockResponse<T> | ((config: RequestConfig) => MockResponse<T> | Promise<MockResponse<T>>)

    if (typeof statusOrResponse === 'function') {
      response = statusOrResponse
    }
    else if (typeof statusOrResponse === 'number') {
      response = {
        status: statusOrResponse,
        data,
        headers,
      }
    }
    else {
      response = statusOrResponse
    }

    this.adapter.addRule({
      matcher: this.matcher,
      response,
      name: this.ruleName,
      priority: this.rulePriority,
      once: this.ruleOnce,
    })
  }

  /**
   * 返回错误
   */
  replyWithError(error: string | Error): void {
    this.reply({
      error,
    })
  }

  /**
   * 延迟响应
   */
  delay(ms: number): DelayedMockRuleBuilder<T> {
    return new DelayedMockRuleBuilder(this, ms)
  }
}

/**
 * 延迟 Mock 规则构建器
 */
export class DelayedMockRuleBuilder<T = any> {
  private builder: MockRuleBuilder<T>
  private delayMs: number

  constructor(builder: MockRuleBuilder<T>, delayMs: number) {
    this.builder = builder
    this.delayMs = delayMs
  }

  /**
   * 返回指定响应
   */
  reply(status: number, data?: T, headers?: Record<string, string>): void {
    const response: MockResponse<T> = {
      status,
      data,
      headers,
      delay: this.delayMs,
    }
    this.builder.reply(response)
  }

  /**
   * 返回错误
   */
  replyWithError(error: string | Error): void {
    this.builder.reply({
      error,
      delay: this.delayMs,
    })
  }
}

/**
 * 创建 Mock 适配器
 */
export function createMockAdapter(): MockAdapter {
  return new MockAdapter()
}

/**
 * 创建 Mock 拦截器
 *
 * 用于在拦截器链中使用
 */
export function createMockInterceptor() {
  return async (config: RequestConfig): Promise<RequestConfig> => {
    // Mock 适配器会在实际请求时生效
    return config
  }
}
