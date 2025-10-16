/**
 * 请求节流器 - 使用令牌桶算法
 * 提供精确的请求速率控制
 */

export interface ThrottlerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 每秒允许的请求数 */
  requestsPerSecond?: number
  /** 最大突发请求数 */
  maxBurst?: number
  /** 令牌补充速率（毫秒） */
  refillRate?: number
}

export interface ThrottlerStats {
  /** 当前令牌数 */
  currentTokens: number
  /** 最大令牌数 */
  maxTokens: number
  /** 总请求数 */
  totalRequests: number
  /** 被限流的请求数 */
  throttledRequests: number
  /** 等待中的请求数 */
  pendingRequests: number
}

/**
 * 令牌桶实现的请求节流器
 */
export class RequestThrottler {
  private tokens: number
  private lastRefillTime: number
  private readonly config: Required<ThrottlerConfig>
  private pendingQueue: Array<{
    resolve: (value: void) => void
    reject: (reason: unknown) => void
    timestamp: number
  }> = []

  private stats = {
    totalRequests: 0,
    throttledRequests: 0,
  }

  private refillTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: ThrottlerConfig = {}) {
    this.config = {
      enabled: true,
      requestsPerSecond: 10,
      maxBurst: 20,
      refillRate: 100,
      ...config,
    }

    // 初始化令牌桶
    this.tokens = this.config?.maxBurst
    this.lastRefillTime = Date.now()

    // 启动令牌补充定时器
    this.startRefillTimer()
  }

  /**
   * 获取执行权限（消耗一个令牌）
   */
  async acquire(): Promise<void> {
    if (!this.config?.enabled) {
      return Promise.resolve()
    }

    this.stats.totalRequests++

    // 尝试立即获取令牌
    if (this.tokens >= 1) {
      this.tokens--
      return Promise.resolve()
    }

    // 没有令牌，加入等待队列
    this.stats.throttledRequests++

    return new Promise<void>((resolve, reject) => {
      this.pendingQueue.push({
        resolve,
        reject,
        timestamp: Date.now(),
      })
    })
  }

  /**
   * 执行带节流的函数
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    return fn()
  }

  /**
   * 补充令牌
   */
  private refill(): void {
    const now = Date.now()
    const timePassed = now - this.lastRefillTime

    // 计算应补充的令牌数
    const tokensToAdd = (timePassed / 1000) * this.config?.requestsPerSecond
    this.tokens = Math.min(this.config?.maxBurst, this.tokens + tokensToAdd)
    this.lastRefillTime = now

    // 处理等待队列
    this.processPendingQueue()
  }

  /**
   * 处理等待队列
   */
  private processPendingQueue(): void {
    while (this.pendingQueue.length > 0 && this.tokens >= 1) {
      const item = this.pendingQueue.shift()
      if (item) {
        this.tokens--
        item.resolve()
      }
    }
  }

  /**
   * 启动令牌补充定时器
   */
  private startRefillTimer(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer)
    }

    this.refillTimer = setInterval(() => {
      this.refill()
    }, this.config?.refillRate)
  }

  /**
   * 获取当前统计信息
   */
  getStats(): ThrottlerStats {
    return {
      currentTokens: Math.floor(this.tokens),
      maxTokens: this.config?.maxBurst,
      totalRequests: this.stats.totalRequests,
      throttledRequests: this.stats.throttledRequests,
      pendingRequests: this.pendingQueue.length,
    }
  }

  /**
   * 重置节流器
   */
  reset(): void {
    this.tokens = this.config?.maxBurst
    this.lastRefillTime = Date.now()
    this.stats.totalRequests = 0
    this.stats.throttledRequests = 0

    // 拒绝所有等待中的请求
    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue.shift()
      if (item) {
        item.reject(new Error('Throttler reset'))
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ThrottlerConfig>): void {
    Object.assign(this.config, config)

    if (config.requestsPerSecond !== undefined || config.refillRate !== undefined) {
      this.startRefillTimer()
    }

    // 如果maxBurst变小了，调整当前令牌数
    if (config.maxBurst !== undefined && this.tokens > config.maxBurst) {
      this.tokens = config.maxBurst
    }
  }

  /**
   * 清理等待队列中超时的请求
   */
  clearStaleRequests(timeout: number = 30000): void {
    const now = Date.now()
    const validRequests = this.pendingQueue.filter((item) => {
      if (now - item.timestamp > timeout) {
        item.reject(new Error('Request timeout in throttle queue'))
        return false
      }
      return true
    })
    this.pendingQueue = validRequests
  }

  /**
   * 销毁节流器
   */
  destroy(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer)
      this.refillTimer = null
    }

    // 拒绝所有等待中的请求
    while (this.pendingQueue.length > 0) {
      const item = this.pendingQueue.shift()
      if (item) {
        item.reject(new Error('Throttler destroyed'))
      }
    }
  }
}

/**
 * 创建请求节流器
 */
export function createRequestThrottler(config?: ThrottlerConfig): RequestThrottler {
  return new RequestThrottler(config)
}
