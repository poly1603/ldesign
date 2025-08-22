/**
 * 错误处理服务
 * 
 * 提供统一的错误处理机制，包括：
 * - 错误类型定义
 * - 错误处理器
 * - 错误恢复策略
 * - 错误日志记录
 */

/**
 * 模板错误类型枚举
 */
export enum TemplateErrorType {
  /** 模板加载错误 */
  TEMPLATE_LOAD_ERROR = 'TEMPLATE_LOAD_ERROR',
  /** 模板渲染错误 */
  TEMPLATE_RENDER_ERROR = 'TEMPLATE_RENDER_ERROR',
  /** 模板扫描错误 */
  TEMPLATE_SCAN_ERROR = 'TEMPLATE_SCAN_ERROR',
  /** 设备检测错误 */
  DEVICE_DETECTION_ERROR = 'DEVICE_DETECTION_ERROR',
  /** 缓存操作错误 */
  CACHE_ERROR = 'CACHE_ERROR',
  /** 存储操作错误 */
  STORAGE_ERROR = 'STORAGE_ERROR',
  /** 配置错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 模板错误类
 */
export class TemplateError extends Error {
  public readonly type: TemplateErrorType
  public readonly code: string
  public readonly context?: Record<string, unknown>
  public readonly timestamp: number
  public readonly recoverable: boolean

  constructor(
    type: TemplateErrorType,
    message: string,
    options: {
      code?: string
      context?: Record<string, unknown>
      cause?: Error
      recoverable?: boolean
    } = {},
  ) {
    super(message)
    this.name = 'TemplateError'
    this.type = type
    this.code = options.code || type
    this.context = options.context
    this.timestamp = Date.now()
    this.recoverable = options.recoverable ?? true

    // 保持错误堆栈
    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`
    }
  }

  /**
   * 转换为可序列化的对象
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      stack: this.stack,
    }
  }

  /**
   * 创建模板加载错误
   */
  static templateLoadError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.TEMPLATE_LOAD_ERROR, message, { context })
  }

  /**
   * 创建模板渲染错误
   */
  static templateRenderError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.TEMPLATE_RENDER_ERROR, message, { context })
  }

  /**
   * 创建模板扫描错误
   */
  static templateScanError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.TEMPLATE_SCAN_ERROR, message, { context })
  }

  /**
   * 创建设备检测错误
   */
  static deviceDetectionError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.DEVICE_DETECTION_ERROR, message, { context })
  }

  /**
   * 创建缓存错误
   */
  static cacheError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.CACHE_ERROR, message, { context })
  }

  /**
   * 创建存储错误
   */
  static storageError(message: string, context?: Record<string, unknown>): TemplateError {
    return new TemplateError(TemplateErrorType.STORAGE_ERROR, message, { context })
  }
}

/**
 * 错误恢复策略接口
 */
export interface ErrorRecoveryStrategy {
  /** 策略名称 */
  name: string
  /** 是否可以处理该错误 */
  canHandle: (error: TemplateError) => boolean
  /** 执行恢复操作 */
  recover: (error: TemplateError) => Promise<unknown> | unknown
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否记录错误日志 */
  logErrors?: boolean
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 自定义错误恢复策略 */
  recoveryStrategies?: ErrorRecoveryStrategy[]
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private config: Required<ErrorHandlerConfig>
  private recoveryStrategies: ErrorRecoveryStrategy[] = []
  private errorCounts = new Map<string, number>()

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      debug: false,
      logErrors: true,
      maxRetries: 3,
      retryDelay: 1000,
      recoveryStrategies: [],
      ...config,
    }

    // 注册默认恢复策略
    this.registerDefaultStrategies()

    // 注册自定义恢复策略
    if (config.recoveryStrategies) {
      config.recoveryStrategies.forEach(strategy => this.addRecoveryStrategy(strategy))
    }
  }

  /**
   * 处理错误
   */
  async handleError(error: Error | TemplateError, context?: Record<string, unknown>): Promise<unknown> {
    // 转换为 TemplateError
    const templateError = error instanceof TemplateError
      ? error
      : new TemplateError(TemplateErrorType.UNKNOWN_ERROR, error.message, {
          context,
          cause: error,
        })

    // 记录错误
    if (this.config.logErrors) {
      this.logError(templateError)
    }

    // 尝试恢复
    if (templateError.recoverable) {
      return await this.attemptRecovery(templateError)
    }

    // 不可恢复的错误直接抛出
    throw templateError
  }

  /**
   * 添加错误恢复策略
   */
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy)
  }

  /**
   * 移除错误恢复策略
   */
  removeRecoveryStrategy(name: string): void {
    this.recoveryStrategies = this.recoveryStrategies.filter(s => s.name !== name)
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(error: TemplateError): Promise<unknown> {
    const errorKey = `${error.type}:${error.code}`
    const retryCount = this.errorCounts.get(errorKey) || 0

    // 检查重试次数
    if (retryCount >= this.config.maxRetries) {
      this.errorCounts.delete(errorKey)
      throw error
    }

    // 查找合适的恢复策略
    const strategy = this.recoveryStrategies.find(s => s.canHandle(error))
    if (!strategy) {
      throw error
    }

    try {
      // 增加重试计数
      this.errorCounts.set(errorKey, retryCount + 1)

      // 延迟重试
      if (retryCount > 0) {
        await this.delay(this.config.retryDelay * retryCount)
      }

      // 执行恢复策略
      const result = await strategy.recover(error)

      // 恢复成功，清除错误计数
      this.errorCounts.delete(errorKey)

      if (this.config.debug) {
        console.log(`✅ 错误恢复成功: ${error.type} (策略: ${strategy.name})`)
      }

      return result
    }
    catch (recoveryError) {
      if (this.config.debug) {
        console.warn(`⚠️ 错误恢复失败: ${error.type} (策略: ${strategy.name})`, recoveryError)
      }

      // 如果是最后一次重试，抛出原始错误
      if (retryCount >= this.config.maxRetries - 1) {
        this.errorCounts.delete(errorKey)
        throw error
      }

      // 否则递归重试
      return await this.attemptRecovery(error)
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: TemplateError): void {
    const logData = {
      timestamp: new Date().toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      context: error.context,
      recoverable: error.recoverable,
    }

    if (this.config.debug) {
      console.error('❌ TemplateError:', logData)
      if (error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 注册默认恢复策略
   */
  private registerDefaultStrategies(): void {
    // 缓存错误恢复策略
    this.addRecoveryStrategy({
      name: 'cache-fallback',
      canHandle: (error) => error.type === TemplateErrorType.CACHE_ERROR,
      recover: async () => {
        // 清除缓存并重试
        if (this.config.debug) {
          console.log('🔄 清除缓存并重试...')
        }
        return null
      },
    })

    // 网络错误恢复策略
    this.addRecoveryStrategy({
      name: 'network-retry',
      canHandle: (error) => error.type === TemplateErrorType.NETWORK_ERROR,
      recover: async () => {
        // 简单重试
        if (this.config.debug) {
          console.log('🔄 网络错误，正在重试...')
        }
        return null
      },
    })
  }

  /**
   * 获取错误统计信息
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts)
  }

  /**
   * 清除错误统计
   */
  clearErrorStats(): void {
    this.errorCounts.clear()
  }
}
