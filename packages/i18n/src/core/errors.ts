/**
 * I18n 错误处理系统
 *
 * 提供统一的错误类型和处理机制
 */

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 错误分类
 */
export enum ErrorCategory {
  LOADING = 'loading',
  TRANSLATION = 'translation',
  INTERPOLATION = 'interpolation',
  CONFIGURATION = 'configuration',
  CACHE = 'cache',
  NETWORK = 'network',
  VALIDATION = 'validation',
}

/**
 * 增强的错误上下文
 */
export interface ErrorContext {
  /** 错误发生的时间戳 */
  timestamp: number
  /** 用户代理信息 */
  userAgent?: string
  /** 当前语言 */
  locale?: string
  /** 错误发生的URL */
  url?: string
  /** 堆栈跟踪 */
  stackTrace?: string
  /** 用户操作序列 */
  userActions?: string[]
  /** 性能指标 */
  performance?: {
    memory?: number
    timing?: number
  }
  /** 自定义数据 */
  custom?: Record<string, unknown>
  /** 数量（用于复数规则错误） */
  count?: number
  /** 配置选项（用于配置错误） */
  option?: string
  /** 值（用于配置错误） */
  value?: unknown
  /** 原因（用于初始化错误） */
  reason?: string
  /** 操作（用于缓存错误） */
  operation?: string
  /** 键（用于缓存错误） */
  key?: string
  /** 原始错误 */
  originalError?: Error
}

/**
 * 错误恢复策略接口
 */
export interface RecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 是否可以恢复该错误 */
  canRecover: (error: I18nError) => boolean
  /** 执行恢复 */
  recover: (error: I18nError) => Promise<boolean>
  /** 优先级（数字越大优先级越高） */
  priority: number
}

/**
 * 错误分析结果
 */
export interface ErrorAnalysis {
  /** 错误趋势 */
  trend: 'increasing' | 'decreasing' | 'stable'
  /** 最常见的错误 */
  topErrors: Array<{ code: string, count: number, percentage: number }>
  /** 错误分布 */
  distribution: Record<ErrorCategory, number>
  /** 建议 */
  suggestions: string[]
  /** 风险评估 */
  riskLevel: ErrorSeverity
}

/**
 * I18n 错误基类
 */
export class I18nError extends Error {
  public readonly code: string
  public readonly severity: ErrorSeverity
  public readonly category: ErrorCategory
  public readonly context: ErrorContext
  public readonly recoverable: boolean

  constructor(
    message: string,
    code: string,
    options: {
      severity?: ErrorSeverity
      category?: ErrorCategory
      context?: Partial<ErrorContext>
      recoverable?: boolean
    } = {},
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.severity = options.severity || ErrorSeverity.MEDIUM
    this.category = options.category || ErrorCategory.TRANSLATION
    this.recoverable = options.recoverable ?? true

    // 增强的错误上下文
    this.context = {
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stackTrace: this.stack,
      ...options.context,
    }

    // 确保错误堆栈正确显示
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 获取错误的详细信息
   */
  getDetails(): string {
    const details = [
      `错误代码: ${this.code}`,
      `错误信息: ${this.message}`,
      `严重级别: ${this.severity}`,
      `错误分类: ${this.category}`,
      `可恢复: ${this.recoverable ? '是' : '否'}`,
      `发生时间: ${new Date(this.context.timestamp).toISOString()}`,
    ]

    if (this.context.locale) {
      details.push(`当前语言: ${this.context.locale}`)
    }

    if (this.context.url) {
      details.push(`页面URL: ${this.context.url}`)
    }

    if (this.context.custom && Object.keys(this.context.custom).length > 0) {
      details.push(`自定义数据: ${JSON.stringify(this.context.custom, null, 2)}`)
    }

    return details.join('\n')
  }

  /**
   * 获取开发者友好的错误信息
   */
  getDeveloperMessage(): string {
    const suggestions = this.getSuggestions()
    let message = `🚨 ${this.name}: ${this.message}\n\n`

    message += `📋 错误详情:\n`
    message += `   代码: ${this.code}\n`
    message += `   级别: ${this.severity}\n`
    message += `   分类: ${this.category}\n\n`

    if (suggestions.length > 0) {
      message += `💡 解决建议:\n`
      suggestions.forEach((suggestion, index) => {
        message += `   ${index + 1}. ${suggestion}\n`
      })
    }

    return message
  }

  /**
   * 获取解决建议
   */
  getSuggestions(): string[] {
    const suggestions: string[] = []

    switch (this.category) {
      case ErrorCategory.LOADING:
        suggestions.push('检查网络连接是否正常')
        suggestions.push('验证语言包文件是否存在')
        suggestions.push('检查加载器配置是否正确')
        break
      case ErrorCategory.TRANSLATION:
        suggestions.push('检查翻译键是否存在')
        suggestions.push('验证语言包格式是否正确')
        suggestions.push('考虑添加回退翻译')
        break
      case ErrorCategory.INTERPOLATION:
        suggestions.push('检查插值参数是否完整')
        suggestions.push('验证参数类型是否正确')
        suggestions.push('检查插值语法是否正确')
        break
      case ErrorCategory.CONFIGURATION:
        suggestions.push('检查配置选项是否有效')
        suggestions.push('参考文档确认配置格式')
        suggestions.push('使用默认配置进行测试')
        break
    }

    return suggestions
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      recoverable: this.recoverable,
      context: this.context,
      stack: this.stack,
      suggestions: this.getSuggestions(),
    }
  }
}

/**
 * 语言包加载错误
 */
export class LanguageLoadError extends I18nError {
  constructor(locale: string, originalError?: Error) {
    super(
      `无法加载语言包: ${locale}`,
      'LANGUAGE_LOAD_ERROR',
      {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.LOADING,
        context: {
          locale,
          custom: {
            originalError: originalError?.message,
            originalStack: originalError?.stack,
          },
        },
        recoverable: true,
      },
    )
  }
}

/**
 * 翻译键不存在错误
 */
export class TranslationKeyError extends I18nError {
  constructor(key: string, locale: string) {
    super(
      `翻译键不存在: ${key} (语言: ${locale})`,
      'TRANSLATION_KEY_ERROR',
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.TRANSLATION,
        context: {
          locale,
          custom: { key },
        },
        recoverable: true,
      },
    )
  }
}

/**
 * 插值参数错误
 */
export class InterpolationError extends I18nError {
  constructor(key: string, missingParams: string[]) {
    super(
      `插值参数缺失: ${missingParams.join(', ')} (翻译键: ${key})`,
      'INTERPOLATION_ERROR',
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.INTERPOLATION,
        context: {
          custom: {
            key,
            missingParams,
          },
        },
        recoverable: true,
      },
    )
  }
}

/**
 * 复数规则错误
 */
export class PluralRuleError extends I18nError {
  constructor(locale: string, count: number) {
    super(
      `复数规则处理失败: 语言 ${locale}, 数量 ${count}`,
      'PLURAL_RULE_ERROR',
      {
        context: {
          locale,
          count,
        },
      },
    )
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends I18nError {
  constructor(option: string, value: unknown) {
    super(`配置选项无效: ${option} = ${value}`, 'CONFIGURATION_ERROR', {
      context: {
        option,
        value,
      },
    })
  }
}

/**
 * 初始化错误
 */
export class InitializationError extends I18nError {
  constructor(reason: string) {
    super(`I18n 初始化失败: ${reason}`, 'INITIALIZATION_ERROR', {
      context: {
        reason,
      },
    })
  }
}

/**
 * 缓存错误
 */
export class CacheError extends I18nError {
  constructor(operation: string, key: string, originalError?: Error) {
    super(`缓存操作失败: ${operation} (键: ${key})`, 'CACHE_ERROR', {
      context: {
        operation,
        key,
        originalError,
      },
    })
  }
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  /** 处理错误 */
  handle: (_error: I18nError) => void
  /** 是否可以处理该错误 */
  canHandle: (_error: I18nError) => boolean
}

/**
 * 默认错误处理器
 */
export class DefaultErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true // 可以处理所有错误
  }

  handle(error: I18nError): void {
    console.error(`[I18n Error] ${error.getDetails()}`)
  }
}

/**
 * 静默错误处理器
 */
export class SilentErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true
  }

  handle(_error: I18nError): void {
    // 静默处理，不输出任何信息
  }
}

/**
 * 开发环境错误处理器
 */
export class DevelopmentErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true
  }

  handle(error: I18nError): void {
    // 使用 warn 而不是 group，因为 group 不在允许的 console 方法中
    console.warn(`🚨 I18n Error: ${error.code}`)
    console.error(error.message)
    if (error.context) {
      // 使用 error 而不是 table
      console.error('Context:', error.context)
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
  }
}

/**
 * 错误管理器
 */
export class ErrorManager {
  private handlers: ErrorHandler[] = []
  private errorCounts = new Map<string, number>()
  private errorHistory: I18nError[] = []
  private recoveryStrategies = new Map<string, RecoveryStrategy>()
  private maxHistorySize = 100

  constructor() {
    // 默认添加一个错误处理器
    this.addHandler(
      this.isDevelopment()
        ? new DevelopmentErrorHandler()
        : new DefaultErrorHandler(),
    )

    // 注册默认恢复策略
    this.registerDefaultRecoveryStrategies()
  }

  /**
   * 检查是否为开发环境
   */
  private isDevelopment(): boolean {
    // 浏览器环境检查
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost'
        || window.location.hostname === '127.0.0.1'
        || window.location.hostname.includes('dev')
    }

    // Node.js环境检查
    // eslint-disable-next-line node/prefer-global/process
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env.NODE_ENV === 'development';
    }

    return false
  }

  /**
   * 注册默认恢复策略
   */
  private registerDefaultRecoveryStrategies(): void {
    // 语言加载失败恢复策略
    this.addRecoveryStrategy({
      name: 'fallback-language',
      canRecover: error => error instanceof LanguageLoadError,
      recover: async (error) => {
        // 尝试加载回退语言
        console.warn(`尝试恢复语言加载错误: ${error.message}`)
        return true // 简化实现，实际应该尝试加载回退语言
      },
      priority: 10,
    })

    // 翻译键缺失恢复策略
    this.addRecoveryStrategy({
      name: 'fallback-translation',
      canRecover: error => error instanceof TranslationKeyError,
      recover: async (error) => {
        console.warn(`使用键名作为回退翻译: ${error.message}`)
        return true
      },
      priority: 5,
    })

    // 插值错误恢复策略
    this.addRecoveryStrategy({
      name: 'skip-interpolation',
      canRecover: error => error instanceof InterpolationError,
      recover: async (error) => {
        console.warn(`跳过插值处理: ${error.message}`)
        return true
      },
      priority: 8,
    })
  }

  /**
   * 添加错误处理器
   * @param handler 错误处理器
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  /**
   * 添加恢复策略
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy)
  }

  /**
   * 移除恢复策略
   */
  removeRecoveryStrategy(name: string): void {
    this.recoveryStrategies.delete(name)
  }

  /**
   * 获取所有恢复策略
   */
  getRecoveryStrategies(): RecoveryStrategy[] {
    return Array.from(this.recoveryStrategies.values())
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * 移除错误处理器
   * @param handler 错误处理器
   */
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  /**
   * 处理错误（增强版，支持自动恢复）
   * @param error 错误实例
   */
  async handle(error: I18nError): Promise<boolean> {
    // 记录错误到历史
    this.addToHistory(error)

    // 记录错误次数
    this.errorCounts.set(
      error.code,
      (this.errorCounts.get(error.code) || 0) + 1,
    )

    // 尝试自动恢复
    if (error.recoverable) {
      const recovered = await this.tryRecover(error)
      if (recovered) {
        console.warn(`错误已自动恢复: ${error.code}`)
        return true
      }
    }

    // 使用第一个能处理该错误的处理器
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        handler.handle(error)
        break
      }
    }

    return false
  }

  /**
   * 尝试恢复错误
   */
  private async tryRecover(error: I18nError): Promise<boolean> {
    const strategies = this.getRecoveryStrategies()

    for (const strategy of strategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error)
          if (recovered) {
            return true
          }
        }
        catch (recoveryError) {
          console.warn(`恢复策略 ${strategy.name} 执行失败:`, recoveryError)
        }
      }
    }

    return false
  }

  /**
   * 添加错误到历史记录
   */
  private addToHistory(error: I18nError): void {
    this.errorHistory.push(error)

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts)
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): I18nError[] {
    return [...this.errorHistory]
  }

  /**
   * 分析错误趋势
   */
  analyzeErrors(): ErrorAnalysis {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const recentErrors = this.errorHistory.filter(
      error => error.context.timestamp > oneHourAgo,
    )

    // 计算错误趋势
    const trend = this.calculateTrend(recentErrors)

    // 统计最常见的错误
    const errorCounts = new Map<string, number>()
    recentErrors.forEach((error) => {
      errorCounts.set(error.code, (errorCounts.get(error.code) || 0) + 1)
    })

    const totalErrors = recentErrors.length
    const topErrors = Array.from(errorCounts.entries())
      .map(([code, count]) => ({
        code,
        count,
        percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 统计错误分布
    const distribution: Record<ErrorCategory, number> = {
      [ErrorCategory.LOADING]: 0,
      [ErrorCategory.TRANSLATION]: 0,
      [ErrorCategory.INTERPOLATION]: 0,
      [ErrorCategory.CONFIGURATION]: 0,
      [ErrorCategory.CACHE]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.VALIDATION]: 0,
    }

    recentErrors.forEach((error) => {
      distribution[error.category]++
    })

    // 生成建议
    const suggestions = this.generateSuggestions(topErrors, distribution)

    // 评估风险级别
    const riskLevel = this.assessRiskLevel(recentErrors, topErrors)

    return {
      trend,
      topErrors,
      distribution,
      suggestions,
      riskLevel,
    }
  }

  /**
   * 重置错误统计
   */
  resetStats(): void {
    this.errorCounts.clear()
  }

  /**
   * 清除错误历史
   */
  clearHistory(): void {
    this.errorHistory = []
    this.errorCounts.clear()
  }

  /**
   * 创建并处理错误
   * @param ErrorClass 错误类
   * @param args 错误构造参数
   */
  createAndHandle<T extends I18nError>(
    ErrorClass: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    const error = new ErrorClass(...args)
    this.handle(error)
    return error
  }

  /**
   * 计算错误趋势
   */
  private calculateTrend(errors: I18nError[]): 'increasing' | 'decreasing' | 'stable' {
    if (errors.length < 10) {
      return 'stable'
    }

    const now = Date.now()
    const halfHourAgo = now - 30 * 60 * 1000
    const oneHourAgo = now - 60 * 60 * 1000

    const recentErrors = errors.filter(error => error.context.timestamp > halfHourAgo).length
    const olderErrors = errors.filter(
      error => error.context.timestamp <= halfHourAgo && error.context.timestamp > oneHourAgo,
    ).length

    if (recentErrors > olderErrors * 1.2) {
      return 'increasing'
    }
    else if (recentErrors < olderErrors * 0.8) {
      return 'decreasing'
    }
    else {
      return 'stable'
    }
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    topErrors: Array<{ code: string, count: number, percentage: number }>,
    distribution: Record<ErrorCategory, number>,
  ): string[] {
    const suggestions: string[] = []

    // 基于最常见错误的建议
    if (topErrors.length > 0) {
      const topError = topErrors[0]
      if (topError.percentage > 50) {
        suggestions.push(`主要错误是 ${topError.code}，建议优先解决此问题`)
      }
    }

    // 基于错误分布的建议
    const maxCategory = Object.entries(distribution)
      .reduce((max, [category, count]) => count > max.count ? { category, count } : max, { category: '', count: 0 })

    if (maxCategory.count > 0) {
      switch (maxCategory.category) {
        case ErrorCategory.LOADING:
          suggestions.push('加载错误较多，建议检查网络连接和资源可用性')
          break
        case ErrorCategory.TRANSLATION:
          suggestions.push('翻译错误较多，建议检查语言包完整性')
          break
        case ErrorCategory.INTERPOLATION:
          suggestions.push('插值错误较多，建议检查参数传递')
          break
      }
    }

    return suggestions
  }

  /**
   * 评估风险级别
   */
  private assessRiskLevel(
    errors: I18nError[],
    topErrors: Array<{ code: string, count: number, percentage: number }>,
  ): ErrorSeverity {
    const criticalErrors = errors.filter(error => error.severity === ErrorSeverity.CRITICAL).length
    const highErrors = errors.filter(error => error.severity === ErrorSeverity.HIGH).length

    if (criticalErrors > 0 || (topErrors.length > 0 && topErrors[0].percentage > 80)) {
      return ErrorSeverity.CRITICAL
    }
    else if (highErrors > 5 || (topErrors.length > 0 && topErrors[0].percentage > 50)) {
      return ErrorSeverity.HIGH
    }
    else if (errors.length > 20) {
      return ErrorSeverity.MEDIUM
    }
    else {
      return ErrorSeverity.LOW
    }
  }
}

/**
 * 全局错误管理器实例
 */
export const globalErrorManager = new ErrorManager()

/**
 * 错误处理装饰器
 */
export function handleErrors(errorManager: ErrorManager = globalErrorManager) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args)

        // 如果返回 Promise，处理异步错误
        if (result instanceof Promise) {
          return result.catch((error) => {
            if (error instanceof I18nError) {
              errorManager.handle(error)
            }
            else {
              // 将普通错误转换为 I18nError
              const i18nError = new I18nError(
                error.message || '未知错误',
                'UNKNOWN_ERROR',
                {
                  context: {
                    originalError: error,
                  },
                },
              )
              errorManager.handle(i18nError)
            }
            throw error
          })
        }

        return result
      }
      catch (error) {
        if (error instanceof I18nError) {
          errorManager.handle(error)
        }
        else {
          // 将普通错误转换为 I18nError
          const i18nError = new I18nError(
            (error as Error).message || '未知错误',
            'UNKNOWN_ERROR',
            {
              context: {
                originalError: error instanceof Error ? error : new Error(String(error)),
              },
            },
          )
          errorManager.handle(i18nError)
        }
        throw error
      }
    }

    return descriptor
  }
}
