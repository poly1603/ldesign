/**
 * 增强型错误处理系统
 * 🛡️ 提供结构化错误、自动恢复和智能重试功能
 */

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  /** 信息 - 不影响功能 */
  INFO = 'info',
  /** 警告 - 可能影响功能 */
  WARNING = 'warning',
  /** 错误 - 影响部分功能 */
  ERROR = 'error',
  /** 致命 - 导致系统无法运行 */
  FATAL = 'fatal',
}

/**
 * 错误类别
 */
export enum ErrorCategory {
  /** 网络错误 */
  NETWORK = 'network',
  /** 验证错误 */
  VALIDATION = 'validation',
  /** 授权错误 */
  AUTHORIZATION = 'authorization',
  /** 数据错误 */
  DATA = 'data',
  /** 配置错误 */
  CONFIGURATION = 'configuration',
  /** 系统错误 */
  SYSTEM = 'system',
  /** 业务逻辑错误 */
  BUSINESS = 'business',
  /** 未知错误 */
  UNKNOWN = 'unknown',
}

/**
 * 结构化错误类
 * 🎯 提供更丰富的错误信息，便于调试和追踪
 */
export class EngineError extends Error {
  /** 错误代码 */
  readonly code: string

  /** 错误类别 */
  readonly category: ErrorCategory

  /** 严重级别 */
  readonly severity: ErrorSeverity

  /** 上下文信息 */
  readonly context: Record<string, any>

  /** 是否可恢复 */
  readonly recoverable: boolean

  /** 原始错误 */
  readonly cause?: Error

  /** 时间戳 */
  readonly timestamp: number

  /** 堆栈追踪 */
  readonly stackTrace: string

  constructor(
    message: string,
    options: {
      code?: string
      category?: ErrorCategory
      severity?: ErrorSeverity
      context?: Record<string, any>
      recoverable?: boolean
      cause?: Error
    } = {}
  ) {
    super(message)

    this.name = 'EngineError'
    this.code = options.code || 'UNKNOWN_ERROR'
    this.category = options.category || ErrorCategory.UNKNOWN
    this.severity = options.severity || ErrorSeverity.ERROR
    this.context = options.context || {}
    this.recoverable = options.recoverable ?? false
    this.cause = options.cause
    this.timestamp = Date.now()
    this.stackTrace = this.stack || ''

    // 保持正确的原型链
    Object.setPrototypeOf(this, EngineError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp,
      stack: this.stackTrace,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    }
  }

  /**
   * 转换为友好的用户消息
   */
  toUserMessage(): string {
    const categoryMessages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: '网络连接失败，请检查网络设置',
      [ErrorCategory.VALIDATION]: '输入数据格式不正确',
      [ErrorCategory.AUTHORIZATION]: '您没有权限执行此操作',
      [ErrorCategory.DATA]: '数据处理失败',
      [ErrorCategory.CONFIGURATION]: '配置错误',
      [ErrorCategory.SYSTEM]: '系统错误',
      [ErrorCategory.BUSINESS]: this.message,
      [ErrorCategory.UNKNOWN]: '发生未知错误',
    }

    return categoryMessages[this.category] || this.message
  }
}

/**
 * 错误恢复策略接口
 */
export interface RecoveryStrategy {
  /** 策略名称 */
  name: string

  /** 判断是否可以恢复 */
  canRecover(error: EngineError): boolean

  /** 执行恢复 */
  recover(error: EngineError): Promise<boolean>

  /** 优先级（数字越大优先级越高） */
  priority?: number
}

/**
 * 网络错误恢复策略
 * 🌐 处理网络相关的错误
 */
export class NetworkErrorRecoveryStrategy implements RecoveryStrategy {
  name = 'NetworkErrorRecovery'
  priority = 100

  private retryCount = 0
  private maxRetries = 3
  private retryDelay = 1000

  canRecover(error: EngineError): boolean {
    return (
      error.category === ErrorCategory.NETWORK &&
      this.retryCount < this.maxRetries
    )
  }

  async recover(error: EngineError): Promise<boolean> {
    this.retryCount++

    console.log(`[Recovery] Attempting network recovery (${this.retryCount}/${this.maxRetries})`)

    // 等待网络恢复
    if (!navigator.onLine) {
      await this.waitForNetwork()
    }

    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, this.retryDelay * this.retryCount))

    // 检查网络是否恢复
    if (navigator.onLine) {
      this.retryCount = 0 // 重置重试计数
      return true
    }

    return false
  }

  private waitForNetwork(): Promise<void> {
    return new Promise(resolve => {
      const handler = () => {
        window.removeEventListener('online', handler)
        resolve()
      }
      window.addEventListener('online', handler)

      // 设置最大等待时间
      setTimeout(() => {
        window.removeEventListener('online', handler)
        resolve()
      }, 30000) // 30秒超时
    })
  }
}

/**
 * 数据恢复策略
 * 💾 尝试从缓存或备份恢复数据
 */
export class DataRecoveryStrategy implements RecoveryStrategy {
  name = 'DataRecovery'
  priority = 80

  constructor(private cacheManager?: any) {}

  canRecover(error: EngineError): boolean {
    return (
      error.category === ErrorCategory.DATA &&
      error.context?.cacheKey !== undefined
    )
  }

  async recover(error: EngineError): Promise<boolean> {
    console.log('[Recovery] Attempting data recovery from cache')

    if (!this.cacheManager || !error.context?.cacheKey) {
      return false
    }

    // 尝试从缓存获取数据
    const cachedData = this.cacheManager.get(error.context.cacheKey)
    if (cachedData !== undefined) {
      console.log('[Recovery] Data recovered from cache')
      // 将缓存数据注入到error.context中
      error.context.recoveredData = cachedData
      return true
    }

    return false
  }
}

/**
 * 配置重置策略
 * ⚙️ 重置配置为默认值
 */
export class ConfigResetStrategy implements RecoveryStrategy {
  name = 'ConfigReset'
  priority = 60

  canRecover(error: EngineError): boolean {
    return error.category === ErrorCategory.CONFIGURATION
  }

  async recover(error: EngineError): Promise<boolean> {
    console.log('[Recovery] Resetting configuration to defaults')

    // 这里应该实现配置重置逻辑
    // 通常需要访问配置管理器
    if (error.context?.configManager) {
      try {
        await error.context.configManager.resetToDefaults()
        return true
      } catch {
        return false
      }
    }

    return false
  }
}

/**
 * 增强型错误管理器
 * 🛡️ 提供自动恢复和智能错误处理
 */
export class EnhancedErrorManager {
  private strategies: RecoveryStrategy[] = []
  private errorHistory: EngineError[] = []
  private maxHistorySize = 100

  private errorHandlers = new Map<ErrorCategory, Array<(error: EngineError) => void>>()
  private globalHandlers: Array<(error: EngineError) => void> = []

  constructor() {
    // 注册默认恢复策略
    this.registerStrategy(new NetworkErrorRecoveryStrategy())
  }

  /**
   * 注册恢复策略
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy)
    // 按优先级排序
    this.strategies.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 移除恢复策略
   */
  unregisterStrategy(name: string): boolean {
    const index = this.strategies.findIndex(s => s.name === name)
    if (index !== -1) {
      this.strategies.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 注册错误处理器
   */
  onError(
    categoryOrHandler: ErrorCategory | ((error: EngineError) => void),
    handler?: (error: EngineError) => void
  ): () => void {
    if (typeof categoryOrHandler === 'function') {
      // 全局处理器
      this.globalHandlers.push(categoryOrHandler)
      return () => {
        const index = this.globalHandlers.indexOf(categoryOrHandler)
        if (index !== -1) {
          this.globalHandlers.splice(index, 1)
        }
      }
    } else {
      // 分类处理器
      if (!handler) {
        throw new Error('Handler function is required for category-specific error handling')
      }

      if (!this.errorHandlers.has(categoryOrHandler)) {
        this.errorHandlers.set(categoryOrHandler, [])
      }
      this.errorHandlers.get(categoryOrHandler)!.push(handler)

      return () => {
        const handlers = this.errorHandlers.get(categoryOrHandler)
        if (handlers) {
          const index = handlers.indexOf(handler)
          if (index !== -1) {
            handlers.splice(index, 1)
          }
        }
      }
    }
  }

  /**
   * 处理错误
   */
  async handleError(error: Error | EngineError): Promise<boolean> {
    // 转换为EngineError
    const engineError = error instanceof EngineError
      ? error
      : new EngineError(error.message, {
          cause: error,
          category: this.categorizeError(error),
        })

    // 添加到历史记录
    this.addToHistory(engineError)

    // 触发错误处理器
    this.notifyHandlers(engineError)

    // 尝试恢复
    if (engineError.recoverable) {
      const recovered = await this.attemptRecovery(engineError)
      if (recovered) {
        console.log(`[ErrorManager] Successfully recovered from error: ${engineError.code}`)
        return true
      }
    }

    // 如果是致命错误，记录到控制台
    if (engineError.severity === ErrorSeverity.FATAL) {
      console.error('[ErrorManager] Fatal error occurred:', engineError.toJSON())
    }

    return false
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(error: EngineError): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          const recovered = await strategy.recover(error)
          if (recovered) {
            console.log(`[ErrorManager] Recovered using strategy: ${strategy.name}`)
            return true
          }
        } catch (recoveryError) {
          console.error(`[ErrorManager] Recovery strategy ${strategy.name} failed:`, recoveryError)
        }
      }
    }
    return false
  }

  /**
   * 分类错误
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION
    }
    if (message.includes('config')) {
      return ErrorCategory.CONFIGURATION
    }

    return ErrorCategory.UNKNOWN
  }

  /**
   * 通知处理器
   */
  private notifyHandlers(error: EngineError): void {
    // 触发全局处理器
    this.globalHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('[ErrorManager] Error in global handler:', handlerError)
      }
    })

    // 触发分类处理器
    const categoryHandlers = this.errorHandlers.get(error.category)
    if (categoryHandlers) {
      categoryHandlers.forEach(handler => {
        try {
          handler(error)
        } catch (handlerError) {
          console.error('[ErrorManager] Error in category handler:', handlerError)
        }
      })
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(error: EngineError): void {
    this.errorHistory.push(error)

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * 获取错误历史
   */
  getHistory(options?: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    limit?: number
  }): EngineError[] {
    let history = [...this.errorHistory]

    if (options?.category) {
      history = history.filter(e => e.category === options.category)
    }

    if (options?.severity) {
      history = history.filter(e => e.severity === options.severity)
    }

    if (options?.limit) {
      history = history.slice(-options.limit)
    }

    return history
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * 获取错误统计
   */
  getStatistics(): {
    total: number
    byCategory: Record<ErrorCategory, number>
    bySeverity: Record<ErrorSeverity, number>
    recentErrors: EngineError[]
  } {
    const byCategory: Record<ErrorCategory, number> = {} as any
    const bySeverity: Record<ErrorSeverity, number> = {} as any

    this.errorHistory.forEach(error => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      recentErrors: this.errorHistory.slice(-10),
    }
  }
}

/**
 * 创建增强型错误管理器
 */
export function createEnhancedErrorManager(options?: {
  strategies?: RecoveryStrategy[]
  maxHistorySize?: number
}): EnhancedErrorManager {
  const manager = new EnhancedErrorManager()

  if (options?.strategies) {
    options.strategies.forEach(strategy => manager.registerStrategy(strategy))
  }

  return manager
}
