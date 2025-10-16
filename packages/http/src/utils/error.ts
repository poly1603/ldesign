import type {
  HttpError,
  RequestConfig,
  ResponseData,
  RetryConfig,
} from '../types'
import { createHttpError, delay } from './index'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  CANCEL = 'CANCEL_ERROR',
  HTTP = 'HTTP_ERROR',
  PARSE = 'PARSE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 是否可以处理该错误 */
  canHandle: (error: HttpError) => boolean
  /** 执行恢复策略 */
  recover: (error: HttpError) => Promise<boolean>
  /** 策略优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 错误统计信息
 */
export interface ErrorStats {
  /** 总错误数 */
  total: number
  /** 按类型分组的错误数 */
  byType: Record<ErrorType, number>
  /** 按状态码分组的错误数 */
  byStatus: Record<number, number>
  /** 最近的错误 */
  recent: HttpError[]
  /** 错误率（最近1小时） */
  errorRate: number
  /** 最常见的错误 */
  mostCommon: { type: ErrorType, count: number } | null
}

/**
 * 错误处理器类（增强版）
 */
export class ErrorHandler {
  // 缓存常见错误消息模板
  private static readonly ERROR_TEMPLATES = {
    [ErrorType.NETWORK]: 'Network Error: Unable to connect to the server',
    [ErrorType.TIMEOUT]: (timeout: number) =>
      `Timeout Error: Request timed out after ${timeout}ms`,
    [ErrorType.CANCEL]: 'Cancel Error: Request was cancelled',
    [ErrorType.HTTP]: (status: number, statusText: string) =>
      `HTTP Error ${status}: ${statusText}`,
    [ErrorType.PARSE]: 'Parse Error: Failed to parse response data',
    [ErrorType.UNKNOWN]: 'Unknown Error: An unexpected error occurred',
  } as const

  // 错误统计
  private static errorStats: ErrorStats = {
    total: 0,
    byType: {
      [ErrorType.NETWORK]: 0,
      [ErrorType.TIMEOUT]: 0,
      [ErrorType.CANCEL]: 0,
      [ErrorType.HTTP]: 0,
      [ErrorType.PARSE]: 0,
      [ErrorType.UNKNOWN]: 0,
    },
    byStatus: {},
    recent: [],
    errorRate: 0,
    mostCommon: null,
  }

  // 恢复策略（按优先级排序）
  private static recoveryStrategies: ErrorRecoveryStrategy[] = []

  // 错误历史（最近100个错误）
  private static errorHistory: Array<{
    error: HttpError
    timestamp: number
    recovered: boolean
  }> = []

  /**
   * 创建网络错误（优化版）
   */
  static createNetworkError(
    config: RequestConfig,
    originalError?: any,
  ): HttpError {
    const error = createHttpError(
      this.ERROR_TEMPLATES[ErrorType.NETWORK],
      config,
      ErrorType.NETWORK,
    )
    error.isNetworkError = true
    error.cause = originalError
    return error
  }

  /**
   * 创建超时错误（优化版）
   */
  static createTimeoutError(config: RequestConfig, timeout: number): HttpError {
    const message
      = typeof this.ERROR_TEMPLATES[ErrorType.TIMEOUT] === 'function'
        ? this.ERROR_TEMPLATES[ErrorType.TIMEOUT](timeout)
        : `Timeout Error: Request timed out after ${timeout}ms`

    const error = createHttpError(message, config, ErrorType.TIMEOUT)
    error.isTimeoutError = true
    return error
  }

  /**
   * 创建取消错误（优化版）
   */
  static createCancelError(config: RequestConfig): HttpError {
    const error = createHttpError(
      this.ERROR_TEMPLATES[ErrorType.CANCEL],
      config,
      ErrorType.CANCEL,
    )
    error.isCancelError = true
    return error
  }

  /**
   * 创建 HTTP 错误
   */
  static createHttpError(
    status: number,
    statusText: string,
    config: RequestConfig,
    response?: ResponseData,
  ): HttpError {
    const error = createHttpError(
      `HTTP Error: ${status} ${statusText}`,
      config,
      ErrorType.HTTP,
      response,
    )
    return error
  }

  /**
   * 创建解析错误
   */
  static createParseError(
    config: RequestConfig,
    originalError?: any,
  ): HttpError {
    const error = createHttpError(
      'Parse Error: Failed to parse response data',
      config,
      ErrorType.PARSE,
    )
    error.cause = originalError
    return error
  }

  /**
   * 判断错误是否可重试
   */
  static isRetryableError(error: HttpError): boolean {
    // 网络错误和超时错误通常可以重试
    if (error.isNetworkError || error.isTimeoutError) {
      return true
    }

    // 某些 HTTP 状态码可以重试
    if (error.response?.status) {
      const status = error.response.status
      // 5xx 服务器错误和 429 限流错误可以重试
      return status >= 500 || status === 429 || status === 408
    }

    return false
  }

  /**
   * 获取错误的用户友好消息
   */
  static getUserFriendlyMessage(error: HttpError): string {
    if (error.isNetworkError) {
      return '网络连接失败，请检查网络设置'
    }

    if (error.isTimeoutError) {
      return '请求超时，请稍后重试'
    }

    if (error.isCancelError) {
      return '请求已取消'
    }

    if (error.response?.status) {
      const status = error.response.status
      switch (status) {
        case 400:
          return '请求参数错误'
        case 401:
          return '未授权，请重新登录'
        case 403:
          return '权限不足'
        case 404:
          return '请求的资源不存在'
        case 429:
          return '请求过于频繁，请稍后重试'
        case 500:
          return '服务器内部错误'
        case 502:
          return '网关错误'
        case 503:
          return '服务暂时不可用'
        default:
          return `请求失败 (${status})`
      }
    }

    return error.message || '未知错误'
  }

  /**
   * 记录错误统计
   */
  static recordError(error: HttpError): void {
    const now = Date.now()

    // 更新总数
    this.errorStats.total++

    // 更新按类型统计
    const errorType = this.getErrorType(error)
    this.errorStats.byType[errorType]++

    // 更新按状态码统计
    if (error.response?.status) {
      const status = error.response.status
      this.errorStats.byStatus[status] = (this.errorStats.byStatus[status] || 0) + 1
    }

    // 添加到最近错误列表
    this.errorStats.recent.unshift(error)
    if (this.errorStats.recent.length > 10) {
      this.errorStats.recent = this.errorStats.recent.slice(0, 10)
    }

    // 添加到错误历史
    this.errorHistory.unshift({
      error,
      timestamp: now,
      recovered: false,
    })
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(0, 100)
    }

    // 更新错误率（最近1小时）
    this.updateErrorRate()

    // 更新最常见错误
    this.updateMostCommonError()
  }

  /**
   * 尝试错误恢复
   */
  static async tryRecover(error: HttpError): Promise<boolean> {
    // 策略已经按优先级排序，直接使用
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canHandle(error)) {
        try {
          const recovered = await strategy.recover(error)
          if (recovered) {
            // 标记为已恢复
            const historyItem = this.errorHistory.find(
              item => item.error === error,
            )
            if (historyItem) {
              historyItem.recovered = true
            }
            return true
          }
        }
        catch (recoveryError) {
          console.warn(`Recovery strategy "${strategy.name}" failed:`, recoveryError)
        }
      }
    }

    return false
  }

  /**
   * 添加恢复策略（保持优先级排序）
   */
  static addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy)
    // 保持按优先级排序（高优先级在前）
    this.recoveryStrategies.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 移除恢复策略
   */
  static removeRecoveryStrategy(strategyName: string): boolean {
    const index = this.recoveryStrategies.findIndex(s => s.name === strategyName)
    if (index > -1) {
      this.recoveryStrategies.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 获取所有恢复策略
   */
  static getRecoveryStrategies(): ErrorRecoveryStrategy[] {
    return [...this.recoveryStrategies]
  }

  /**
   * 获取错误类型
   */
  private static getErrorType(error: HttpError): ErrorType {
    if (error.isNetworkError)
      return ErrorType.NETWORK
    if (error.isTimeoutError)
      return ErrorType.TIMEOUT
    if (error.isCancelError)
      return ErrorType.CANCEL
    if (error.response)
      return ErrorType.HTTP
    if (error.code === ErrorType.PARSE)
      return ErrorType.PARSE
    return ErrorType.UNKNOWN
  }

  /**
   * 更新错误率
   */
  private static updateErrorRate(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    const recentErrors = this.errorHistory.filter(
      item => item.timestamp > oneHourAgo,
    )

    // 简单的错误率计算（错误数/时间）
    this.errorStats.errorRate = recentErrors.length
  }

  /**
   * 更新最常见错误
   */
  private static updateMostCommonError(): void {
    let maxCount = 0
    let mostCommonType: ErrorType | null = null

    for (const [type, count] of Object.entries(this.errorStats.byType)) {
      if (count > maxCount) {
        maxCount = count
        mostCommonType = type as ErrorType
      }
    }

    this.errorStats.mostCommon = mostCommonType
      ? { type: mostCommonType, count: maxCount }
      : null
  }

  /**
   * 获取错误统计信息
   */
  static getStats(): ErrorStats {
    return { ...this.errorStats }
  }

  /**
   * 获取错误历史
   */
  static getErrorHistory(): Array<{
    error: HttpError
    timestamp: number
    recovered: boolean
  }> {
    return [...this.errorHistory]
  }

  /**
   * 重置错误统计
   */
  static resetStats(): void {
    this.errorStats = {
      total: 0,
      byType: {
        [ErrorType.NETWORK]: 0,
        [ErrorType.TIMEOUT]: 0,
        [ErrorType.CANCEL]: 0,
        [ErrorType.HTTP]: 0,
        [ErrorType.PARSE]: 0,
        [ErrorType.UNKNOWN]: 0,
      },
      byStatus: {},
      recent: [],
      errorRate: 0,
      mostCommon: null,
    }
    this.errorHistory = []
  }

  /**
   * 清理过期的错误历史
   */
  static cleanupOldErrors(maxAge: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAge
    const originalLength = this.errorHistory.length

    this.errorHistory = this.errorHistory.filter(
      item => item.timestamp > cutoff,
    )

    return originalLength - this.errorHistory.length
  }
}

/**
 * 重试管理器
 */
export class RetryManager {
  private config: Required<RetryConfig>

  constructor(config: RetryConfig = {}) {
    this.config = {
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      retryCondition: config.retryCondition ?? ErrorHandler.isRetryableError,
      retryDelayFunction:
        config.retryDelayFunction ?? this.defaultRetryDelayFunction,
    }
  }

  /**
   * 执行带重试的请求
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    _requestConfig?: RequestConfig,
  ): Promise<T> {
    let lastError: HttpError | undefined
    let retryCount = 0

    while (retryCount <= this.config?.retries) {
      try {
        return await requestFn()
      }
      catch (error) {
        lastError = error as HttpError

        // 检查是否应该重试
        if (
          retryCount >= this.config?.retries
          || !this.config?.retryCondition(lastError)
        ) {
          throw lastError
        }

        // 计算延迟时间
        const delayTime = this.config?.retryDelayFunction(retryCount, lastError)

        // 等待重试
        await delay(delayTime)

        retryCount++
      }
    }

    throw lastError || createHttpError('Retry failed', { url: '' })
  }

  /**
   * 默认重试延迟函数（指数退避）
   */
  private defaultRetryDelayFunction(
    retryCount: number,
    _error: HttpError,
  ): number {
    const baseDelay = this.config?.retryDelay
    const exponentialDelay = baseDelay * 2 ** retryCount

    // 添加随机抖动，避免雷群效应
    const jitter = Math.random() * 0.1 * exponentialDelay

    return Math.min(exponentialDelay + jitter, 30000) // 最大延迟 30 秒
  }

  /**
   * 更新重试配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<RetryConfig> {
    return { ...this.config }
  }
}

/**
 * 超时管理器
 */
export class TimeoutManager {
  private timeouts = new Map<string, NodeJS.Timeout>()

  /**
   * 创建超时控制器
   */
  createTimeoutController(
    timeout: number,
    requestId?: string,
  ): {
      signal: AbortSignal
      cleanup: () => void
    } {
    const controller = new AbortController()
    const id = requestId || this.generateId()

    const timeoutId = setTimeout(() => {
      controller.abort()
      this.timeouts.delete(id)
    }, timeout)

    this.timeouts.set(id, timeoutId)

    return {
      signal: controller.signal,
      cleanup: () => {
        const existingTimeout = this.timeouts.get(id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          this.timeouts.delete(id)
        }
      },
    }
  }

  /**
   * 清理所有超时
   */
  clearAll(): void {
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    this.timeouts.clear()
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}

/**
 * 内置错误恢复策略
 */
export const builtinRecoveryStrategies = {
  /**
   * 网络重连策略
   */
  networkReconnect: {
    name: 'network-reconnect',
    priority: 10,
    canHandle: (error: HttpError) => error.isNetworkError,
    recover: async (_error: HttpError): Promise<boolean> => {
      // 简单的网络连通性检查
      try {
        // 尝试请求一个简单的端点
        const response = await fetch('/ping', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000),
        })
        return response.ok
      }
      catch {
        return false
      }
    },
  } as ErrorRecoveryStrategy,

  /**
   * 认证刷新策略
   */
  authRefresh: {
    name: 'auth-refresh',
    priority: 20,
    canHandle: (error: HttpError) => error.response?.status === 401,
    recover: async (_error: HttpError): Promise<boolean> => {
      try {
        // 尝试刷新认证令牌
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          return false
        }

        const response = await fetch('/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          return true
        }
      }
      catch {
        // 刷新失败，清除所有令牌
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }

      return false
    },
  } as ErrorRecoveryStrategy,

  /**
   * 服务降级策略
   */
  serviceFallback: {
    name: 'service-fallback',
    priority: 5,
    canHandle: (error: HttpError) => {
      const status = error.response?.status
      return status === 503 || status === 502 || status === 504
    },
    recover: async (error: HttpError): Promise<boolean> => {
      // 检查是否有备用服务端点
      const fallbackUrl = error.config?.url?.replace('/api/', '/api-fallback/')
      if (fallbackUrl && fallbackUrl !== error.config?.url) {
        try {
          const response = await fetch(fallbackUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(3000),
          })
          return response.ok
        }
        catch {
          return false
        }
      }
      return false
    },
  } as ErrorRecoveryStrategy,

  /**
   * 缓存回退策略
   */
  cacheFailback: {
    name: 'cache-fallback',
    priority: 1,
    canHandle: (error: HttpError) => {
      // 只对GET请求使用缓存回退
      return error.config?.method?.toUpperCase() === 'GET'
    },
    recover: async (error: HttpError): Promise<boolean> => {
      try {
        // 尝试从缓存中获取数据
        const cacheKey = `http_cache_${error.config?.url}`
        const cachedData = localStorage.getItem(cacheKey)

        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const now = Date.now()

          // 检查缓存是否过期（24小时）
          if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
            // 可以使用缓存数据
            return true
          }
        }
      }
      catch {
        // 缓存解析失败
      }

      return false
    },
  } as ErrorRecoveryStrategy,
}

/**
 * 错误分析器
 */
export class ErrorAnalyzer {
  /**
   * 分析错误模式
   */
  static analyzeErrorPatterns(errors: HttpError[]): {
    patterns: Array<{
      type: string
      count: number
      percentage: number
      description: string
    }>
    recommendations: string[]
  } {
    const patterns: Record<string, number> = {}
    const total = errors.length

    // 分析错误模式
    errors.forEach((error) => {
      // 网络错误模式
      if (error.isNetworkError) {
        patterns.network_errors = (patterns.network_errors || 0) + 1
      }

      // 超时错误模式
      if (error.isTimeoutError) {
        patterns.timeout_errors = (patterns.timeout_errors || 0) + 1
      }

      // 认证错误模式
      if (error.response?.status === 401) {
        patterns.auth_errors = (patterns.auth_errors || 0) + 1
      }

      // 服务器错误模式
      if (error.response?.status && error.response.status >= 500) {
        patterns.server_errors = (patterns.server_errors || 0) + 1
      }

      // 客户端错误模式
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        patterns.client_errors = (patterns.client_errors || 0) + 1
      }
    })

    // 转换为分析结果
    const analysisResults = Object.entries(patterns).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      description: this.getPatternDescription(type),
    }))

    // 生成建议
    const recommendations = this.generateRecommendations(patterns, total)

    return {
      patterns: analysisResults,
      recommendations,
    }
  }

  /**
   * 获取模式描述
   */
  private static getPatternDescription(type: string): string {
    const descriptions: Record<string, string> = {
      network_errors: '网络连接问题，可能是网络不稳定或服务器不可达',
      timeout_errors: '请求超时，可能是网络延迟高或服务器响应慢',
      auth_errors: '认证失败，可能是令牌过期或权限不足',
      server_errors: '服务器内部错误，可能是服务器故障或过载',
      client_errors: '客户端请求错误，可能是参数错误或请求格式不正确',
    }

    return descriptions[type] || '未知错误模式'
  }

  /**
   * 生成建议
   */
  private static generateRecommendations(patterns: Record<string, number>, total: number): string[] {
    const recommendations: string[] = []

    // 网络错误建议
    if (patterns.network_errors && patterns.network_errors / total > 0.3) {
      recommendations.push('考虑添加网络重连机制和离线模式支持')
    }

    // 超时错误建议
    if (patterns.timeout_errors && patterns.timeout_errors / total > 0.2) {
      recommendations.push('考虑增加请求超时时间或优化服务器响应速度')
    }

    // 认证错误建议
    if (patterns.auth_errors && patterns.auth_errors / total > 0.1) {
      recommendations.push('考虑实现自动令牌刷新机制')
    }

    // 服务器错误建议
    if (patterns.server_errors && patterns.server_errors / total > 0.15) {
      recommendations.push('考虑添加服务降级和熔断机制')
    }

    // 客户端错误建议
    if (patterns.client_errors && patterns.client_errors / total > 0.25) {
      recommendations.push('考虑加强客户端参数验证和错误提示')
    }

    return recommendations
  }
}
