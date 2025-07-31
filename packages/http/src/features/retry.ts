/**
 * HTTP请求重试功能
 * 提供智能重试机制，支持指数退避、条件重试等
 */

export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 初始延迟时间(ms) */
  initialDelay: number
  /** 最大延迟时间(ms) */
  maxDelay: number
  /** 退避倍数 */
  backoffMultiplier: number
  /** 是否启用抖动 */
  enableJitter: boolean
  /** 重试条件函数 */
  shouldRetry?: (error: any, attempt: number) => boolean
  /** 延迟计算函数 */
  delayCalculator?: (attempt: number, config: RetryConfig) => number
}

export interface RetryState {
  attempt: number
  totalDelay: number
  errors: any[]
  startTime: number
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: any
  retryState: RetryState
}

/**
 * 默认重试配置
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  enableJitter: true,
  shouldRetry: (error: any, attempt: number) => {
    // 默认重试条件：网络错误、超时、5xx错误
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return true
    }
    if (error.response && error.response.status >= 500) {
      return true
    }
    return false
  }
}

/**
 * 计算重试延迟时间
 */
export function calculateDelay(attempt: number, config: RetryConfig): number {
  if (config.delayCalculator) {
    return config.delayCalculator(attempt, config)
  }

  // 指数退避算法
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  
  // 限制最大延迟
  delay = Math.min(delay, config.maxDelay)
  
  // 添加抖动
  if (config.enableJitter) {
    delay = delay * (0.5 + Math.random() * 0.5)
  }
  
  return Math.floor(delay)
}

/**
 * 等待指定时间
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试执行器
 */
export class RetryExecutor {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * 执行带重试的异步操作
   */
  async execute<T>(operation: () => Promise<T>): Promise<RetryResult<T>> {
    const state: RetryState = {
      attempt: 0,
      totalDelay: 0,
      errors: [],
      startTime: Date.now()
    }

    while (state.attempt <= this.config.maxRetries) {
      state.attempt++

      try {
        const result = await operation()
        return {
          success: true,
          data: result,
          retryState: state
        }
      } catch (error) {
        state.errors.push(error)

        // 检查是否应该重试
        const shouldRetry = this.config.shouldRetry?.(error, state.attempt) ?? true
        
        if (state.attempt > this.config.maxRetries || !shouldRetry) {
          return {
            success: false,
            error,
            retryState: state
          }
        }

        // 计算延迟时间并等待
        const delayTime = calculateDelay(state.attempt, this.config)
        state.totalDelay += delayTime
        await delay(delayTime)
      }
    }

    return {
      success: false,
      error: state.errors[state.errors.length - 1],
      retryState: state
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): RetryConfig {
    return { ...this.config }
  }
}

/**
 * 创建重试执行器
 */
export function createRetryExecutor(config?: Partial<RetryConfig>): RetryExecutor {
  return new RetryExecutor(config)
}

/**
 * 重试装饰器
 */
export function retry(config?: Partial<RetryConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const executor = createRetryExecutor(config)

    descriptor.value = async function (...args: any[]) {
      const result = await executor.execute(() => originalMethod.apply(this, args))
      if (result.success) {
        return result.data
      } else {
        throw result.error
      }
    }

    return descriptor
  }
}

/**
 * 全局重试执行器实例
 */
export const globalRetryExecutor = createRetryExecutor()

/**
 * 便捷的重试函数
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const executor = config ? createRetryExecutor(config) : globalRetryExecutor
  const result = await executor.execute(operation)
  
  if (result.success) {
    return result.data!
  } else {
    throw result.error
  }
}