/**
 * 速率限制管理器
 * 
 * 控制在指定时间窗口内的请求数量
 */

/**
 * 速率限制配置
 */
export interface RateLimitConfig {
  /** 最大请求数 */
  maxRequests?: number
  /** 时间窗口（毫秒） */
  timeWindow?: number
  /** 是否启用突发请求 */
  allowBurst?: boolean
  /** 突发请求数量 */
  burstSize?: number
}

/**
 * 速率限制状态
 */
export interface RateLimitStatus {
  /** 当前请求数 */
  currentRequests: number
  /** 最大请求数 */
  maxRequests: number
  /** 时间窗口 */
  timeWindow: number
  /** 下次可用时间 */
  nextAvailableTime: number
  /** 是否已达限制 */
  isLimited: boolean
}

/**
 * 速率限制管理器
 */
export class RateLimitManager {
  private requests: number[] = []
  private config: Required<RateLimitConfig>
  private burstTokens: number

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? 100,
      timeWindow: config.timeWindow ?? 60000,
      allowBurst: config.allowBurst ?? false,
      burstSize: config.burstSize ?? 10,
    }
    this.burstTokens = this.config.burstSize
  }

  /**
   * 检查是否可以发送请求
   */
  canMakeRequest(): boolean {
    const now = Date.now()

    // 清理过期的请求记录
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow,
    )

    // 检查是否在限制内
    if (this.requests.length < this.config.maxRequests) {
      return true
    }

    // 检查突发令牌
    if (this.config.allowBurst && this.burstTokens > 0) {
      return true
    }

    return false
  }

  /**
   * 记录请求
   */
  recordRequest(): void {
    const now = Date.now()
    
    // 清理过期记录
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow,
    )

    // 如果使用突发令牌
    if (this.requests.length >= this.config.maxRequests && this.config.allowBurst && this.burstTokens > 0) {
      this.burstTokens--
    }

    this.requests.push(now)

    // 恢复突发令牌
    this.scheduleBurstTokenRestore()
  }

  /**
   * 恢复突发令牌
   */
  private scheduleBurstTokenRestore(): void {
    if (!this.config.allowBurst) return

    // 每秒恢复一个令牌
    const restoreInterval = 1000
    if (this.burstTokens < this.config.burstSize) {
      setTimeout(() => {
        this.burstTokens = Math.min(this.burstTokens + 1, this.config.burstSize)
      }, restoreInterval)
    }
  }

  /**
   * 获取下次可以请求的时间
   */
  getNextAvailableTime(): number {
    if (this.canMakeRequest()) {
      return 0
    }

    if (this.requests.length === 0) {
      return 0
    }

    const oldestRequest = Math.min(...this.requests)
    return oldestRequest + this.config.timeWindow - Date.now()
  }

  /**
   * 等待直到可以发送请求
   */
  async waitForAvailability(): Promise<void> {
    const waitTime = this.getNextAvailableTime()
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * 使用退避策略等待
   */
  async waitWithBackoff(attempt: number = 0): Promise<void> {
    const baseWaitTime = this.getNextAvailableTime()
    if (baseWaitTime <= 0) return

    // 指数退避
    const backoffTime = Math.min(baseWaitTime * 2**attempt, 30000)
    await new Promise(resolve => setTimeout(resolve, backoffTime))
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.requests = []
    this.burstTokens = this.config.burstSize
  }

  /**
   * 获取当前状态
   */
  getStatus(): RateLimitStatus {
    const now = Date.now()
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow,
    )

    return {
      currentRequests: this.requests.length,
      maxRequests: this.config.maxRequests,
      timeWindow: this.config.timeWindow,
      nextAvailableTime: this.getNextAvailableTime(),
      isLimited: !this.canMakeRequest(),
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RateLimitConfig>): void {
    Object.assign(this.config, config)
    
    // 更新突发令牌
    if (config.burstSize !== undefined) {
      this.burstTokens = Math.min(this.burstTokens, config.burstSize)
    }
  }

  /**
   * 获取请求历史
   */
  getRequestHistory(): number[] {
    const now = Date.now()
    return this.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow,
    )
  }

  /**
   * 计算当前速率
   */
  getCurrentRate(): number {
    const now = Date.now()
    const recentRequests = this.requests.filter(
      timestamp => now - timestamp < 1000, // 最近1秒
    )
    return recentRequests.length
  }

  /**
   * 预测何时可以发送N个请求
   */
  predictAvailabilityForBatch(batchSize: number): number {
    const currentCount = this.requests.length
    const available = this.config.maxRequests - currentCount

    if (available >= batchSize) {
      return 0 // 立即可用
    }

    // 计算需要等待多少请求过期
    const needToExpire = batchSize - available
    if (needToExpire > this.requests.length) {
      // 需要等待所有请求过期还不够
      return this.config.timeWindow
    }

    // 找到第N个请求的时间
    const sortedRequests = [...this.requests].sort()
    const targetRequest = sortedRequests[needToExpire - 1]
    return targetRequest + this.config.timeWindow - Date.now()
  }
}

/**
 * 创建速率限制管理器
 */
export function createRateLimitManager(
  config?: RateLimitConfig,
): RateLimitManager {
  return new RateLimitManager(config)
}

/**
 * 速率限制装饰器
 */
export function rateLimit(config?: RateLimitConfig) {
  const manager = new RateLimitManager(config)

  return function <T extends (...args: any[]) => Promise<any>>(
    target: T,
  ): T {
    return (async (...args: Parameters<T>) => {
      await manager.waitForAvailability()
      manager.recordRequest()
      return target(...args)
    }) as T
  }
}

/**
 * 全局速率限制管理器实例
 */
export const globalRateLimitManager = new RateLimitManager()