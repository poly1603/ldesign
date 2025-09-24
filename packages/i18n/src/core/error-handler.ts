/**
 * 错误处理工具类
 * 
 * 提供统一的错误处理接口和策略
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { I18nError, LanguageLoadError, TranslationKeyError } from './errors'

/**
 * 错误处理策略
 */
export enum ErrorHandlingStrategy {
  /** 静默处理 - 记录日志但不抛出错误 */
  SILENT = 'silent',
  /** 警告处理 - 显示警告但继续执行 */
  WARN = 'warn',
  /** 严格处理 - 抛出错误 */
  STRICT = 'strict',
  /** 降级处理 - 尝试降级方案 */
  FALLBACK = 'fallback'
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 操作类型 */
  operation: string
  /** 相关的语言代码 */
  locale?: string
  /** 相关的翻译键 */
  key?: string
  /** 额外的上下文数据 */
  metadata?: Record<string, unknown>
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  /** 默认处理策略 */
  defaultStrategy: ErrorHandlingStrategy
  /** 特定错误类型的处理策略 */
  strategies: Map<string, ErrorHandlingStrategy>
  /** 是否启用错误恢复 */
  enableRecovery: boolean
  /** 最大重试次数 */
  maxRetries: number
  /** 错误回调函数 */
  onError?: (error: I18nError, context: ErrorContext) => void
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult {
  /** 是否成功处理 */
  handled: boolean
  /** 是否需要重试 */
  shouldRetry: boolean
  /** 降级值（如果有） */
  fallbackValue?: unknown
  /** 处理后的错误（如果需要重新抛出） */
  error?: Error
}

/**
 * 统一错误处理器
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig
  private retryCount = new Map<string, number>()

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      defaultStrategy: ErrorHandlingStrategy.WARN,
      strategies: new Map(),
      enableRecovery: true,
      maxRetries: 3,
      ...config
    }
  }

  /**
   * 处理错误
   * @param error 错误实例
   * @param context 错误上下文
   * @returns 处理结果
   */
  handle(error: Error, context: ErrorContext): ErrorHandlingResult {
    const i18nError = this.normalizeError(error, context)
    const strategy = this.getStrategy(i18nError)
    
    // 调用错误回调
    if (this.config.onError) {
      try {
        this.config.onError(i18nError, context)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    }

    return this.applyStrategy(i18nError, strategy, context)
  }

  /**
   * 处理翻译缺失错误
   * @param key 翻译键
   * @param locale 语言代码
   * @param fallbackValue 降级值
   * @returns 处理结果
   */
  handleTranslationMissing(
    key: string,
    locale: string,
    fallbackValue?: string
  ): ErrorHandlingResult {
    const error = new TranslationKeyError(key, locale)
    const context: ErrorContext = {
      operation: 'translation',
      locale,
      key,
      metadata: { fallbackValue }
    }

    return this.handle(error, context)
  }

  /**
   * 处理语言加载错误
   * @param locale 语言代码
   * @param originalError 原始错误
   * @returns 处理结果
   */
  handleLanguageLoadError(
    locale: string,
    originalError: Error
  ): ErrorHandlingResult {
    const error = new LanguageLoadError(locale, originalError)
    const context: ErrorContext = {
      operation: 'language_load',
      locale,
      metadata: { originalError }
    }

    return this.handle(error, context)
  }

  /**
   * 设置特定错误类型的处理策略
   * @param errorCode 错误代码
   * @param strategy 处理策略
   */
  setStrategy(errorCode: string, strategy: ErrorHandlingStrategy): void {
    this.config.strategies.set(errorCode, strategy)
  }

  /**
   * 重置重试计数
   * @param key 重试键（可选，不提供则重置所有）
   */
  resetRetryCount(key?: string): void {
    if (key) {
      this.retryCount.delete(key)
    } else {
      this.retryCount.clear()
    }
  }

  /**
   * 标准化错误对象
   * @param error 原始错误
   * @param context 错误上下文
   * @returns I18n错误实例
   */
  private normalizeError(error: Error, context: ErrorContext): I18nError {
    if (error instanceof I18nError) {
      return error
    }

    return new I18nError(
      error.message || 'Unknown error',
      'UNKNOWN_ERROR',
      {
        context: {
          operation: context.operation,
          locale: context.locale,
          key: context.key,
          originalError: error,
          ...context.metadata
        }
      }
    )
  }

  /**
   * 获取错误处理策略
   * @param error I18n错误实例
   * @returns 处理策略
   */
  private getStrategy(error: I18nError): ErrorHandlingStrategy {
    return this.config.strategies.get(error.code) || this.config.defaultStrategy
  }

  /**
   * 应用处理策略
   * @param error I18n错误实例
   * @param strategy 处理策略
   * @param context 错误上下文
   * @returns 处理结果
   */
  private applyStrategy(
    error: I18nError,
    strategy: ErrorHandlingStrategy,
    context: ErrorContext
  ): ErrorHandlingResult {
    const retryKey = `${context.operation}:${context.locale}:${context.key}`
    const currentRetries = this.retryCount.get(retryKey) || 0

    switch (strategy) {
      case ErrorHandlingStrategy.SILENT:
        return { handled: true, shouldRetry: false }

      case ErrorHandlingStrategy.WARN:
        console.warn(`[I18n Warning] ${error.message}`, {
          code: error.code,
          context: context
        })
        return { handled: true, shouldRetry: false }

      case ErrorHandlingStrategy.STRICT:
        return { handled: false, shouldRetry: false, error }

      case ErrorHandlingStrategy.FALLBACK:
        const fallbackResult = this.tryFallback(error, context)
        if (fallbackResult.fallbackValue !== undefined) {
          return fallbackResult
        }
        
        // 如果降级失败且启用重试
        if (this.config.enableRecovery && currentRetries < this.config.maxRetries) {
          this.retryCount.set(retryKey, currentRetries + 1)
          return { handled: false, shouldRetry: true }
        }
        
        // 降级失败，使用警告策略
        return this.applyStrategy(error, ErrorHandlingStrategy.WARN, context)

      default:
        return { handled: false, shouldRetry: false, error }
    }
  }

  /**
   * 尝试降级处理
   * @param error I18n错误实例
   * @param context 错误上下文
   * @returns 处理结果
   */
  private tryFallback(error: I18nError, context: ErrorContext): ErrorHandlingResult {
    // 翻译缺失的降级处理
    if (error instanceof TranslationKeyError && context.key) {
      // 返回键名作为降级值
      return {
        handled: true,
        shouldRetry: false,
        fallbackValue: context.metadata?.fallbackValue || context.key
      }
    }

    // 语言加载失败的降级处理
    if (error instanceof LanguageLoadError) {
      // 可以尝试加载降级语言
      return {
        handled: false,
        shouldRetry: true
      }
    }

    return { handled: false, shouldRetry: false }
  }
}
