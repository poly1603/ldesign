/**
 * Rate Limiter
 * 
 * 用于限制加密操作的频率，防止滥用和资源耗尽
 * 
 * 特性：
 * - 令牌桶算法实现
 * - 滑动窗口限流
 * - 支持多种限流策略
 * - 内存高效
 * 
 * @example
 * ```ts
 * const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 })
 * if (limiter.tryAcquire('user-id')) {
 *   // 执行加密操作
 * } else {
 *   throw new Error('Rate limit exceeded')
 * }
 * ```
 */

/**
 * 限流策略类型
 */
export type RateLimitStrategy = 'token-bucket' | 'sliding-window' | 'fixed-window'

/**
 * 限流配置
 */
export interface RateLimiterOptions {
  /** 时间窗口内最大请求数 */
  maxRequests: number
  /** 时间窗口（毫秒） */
  windowMs: number
  /** 限流策略 */
  strategy?: RateLimitStrategy
  /** 令牌填充速率（每秒） */
  refillRate?: number
  /** 最大令牌数 */
  maxTokens?: number
}

/**
 * 限流状态
 */
export interface RateLimitStatus {
  /** 是否被限流 */
  limited: boolean
  /** 剩余请求数 */
  remaining: number
  /** 重置时间戳 */
  resetTime: number
  /** 重试等待时间（毫秒） */
  retryAfter?: number
}

/**
 * 令牌桶实现
 */
class TokenBucket {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.refillRate = refillRate
    this.lastRefill = Date.now()
  }

  /**
   * 尝试获取令牌
   */
  tryConsume(count: number = 1): boolean {
    this.refill()

    if (this.tokens >= count) {
      this.tokens -= count
      return true
    }

    return false
  }

  /**
   * 获取状态
   */
  getStatus(): { tokens: number, nextRefillTime: number } {
    this.refill()
    const nextRefillTime = this.lastRefill + 1000 // 下一秒
    return { tokens: this.tokens, nextRefillTime }
  }

  /**
   * 重置
   */
  reset(): void {
    this.tokens = this.maxTokens
    this.lastRefill = Date.now()
  }

  /**
   * 填充令牌
   */
  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000 // 转换为秒
    const tokensToAdd = elapsed * this.refillRate

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
      this.lastRefill = now
    }
  }
}

/**
 * 滑动窗口实现
 */
class SlidingWindow {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * 尝试记录请求
   */
  tryRecord(): boolean {
    const now = Date.now()
    this.cleanup(now)

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }

    return false
  }

  /**
   * 获取状态
   */
  getStatus(): { count: number, oldestRequest: number } {
    const now = Date.now()
    this.cleanup(now)
    const oldestRequest = this.requests[0] || now
    return { count: this.requests.length, oldestRequest }
  }

  /**
   * 重置
   */
  reset(): void {
    this.requests = []
  }

  /**
   * 清理过期请求
   */
  private cleanup(now: number): void {
    const cutoff = now - this.windowMs
    this.requests = this.requests.filter(time => time > cutoff)
  }
}

/**
 * 固定窗口实现
 */
class FixedWindow {
  private count: number = 0
  private windowStart: number
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.windowStart = Date.now()
  }

  /**
   * 尝试记录请求
   */
  tryRecord(): boolean {
    const now = Date.now()

    // 检查是否需要重置窗口
    if (now - this.windowStart >= this.windowMs) {
      this.count = 0
      this.windowStart = now
    }

    if (this.count < this.maxRequests) {
      this.count++
      return true
    }

    return false
  }

  /**
   * 获取状态
   */
  getStatus(): { count: number, windowStart: number } {
    const now = Date.now()

    // 检查是否需要重置窗口
    if (now - this.windowStart >= this.windowMs) {
      this.count = 0
      this.windowStart = now
    }

    return { count: this.count, windowStart: this.windowStart }
  }

  /**
   * 重置
   */
  reset(): void {
    this.count = 0
    this.windowStart = Date.now()
  }
}

/**
 * 限流器主类
 */
export class RateLimiter {
  private readonly strategy: RateLimitStrategy
  private readonly windowMs: number
  private readonly maxRequests: number
  private limiters: Map<string, TokenBucket | SlidingWindow | FixedWindow>

  constructor(options: RateLimiterOptions) {
    const {
      maxRequests,
      windowMs,
      strategy = 'sliding-window',
      refillRate = maxRequests / (windowMs / 1000),
      maxTokens = maxRequests,
    } = options

    this.strategy = strategy
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.limiters = new Map()

    // 根据策略初始化限流器
    if (strategy === 'token-bucket') {
      this.refillRate = refillRate
      this.maxTokens = maxTokens
    }
  }

  private refillRate?: number
  private maxTokens?: number

  /**
   * 尝试获取许可（主方法）
   */
  tryAcquire(identifier: string, count: number = 1): boolean {
    const limiter = this.getLimiter(identifier)

    if (this.strategy === 'token-bucket') {
      return (limiter as TokenBucket).tryConsume(count)
    } else if (this.strategy === 'sliding-window') {
      return (limiter as SlidingWindow).tryRecord()
    } else {
      return (limiter as FixedWindow).tryRecord()
    }
  }

  /**
   * 获取限流状态
   */
  getStatus(identifier: string): RateLimitStatus {
    const limiter = this.getLimiter(identifier)
    const now = Date.now()

    if (this.strategy === 'token-bucket') {
      const bucket = limiter as TokenBucket
      const status = bucket.getStatus()
      return {
        limited: status.tokens <= 0,
        remaining: Math.floor(status.tokens),
        resetTime: status.nextRefillTime,
      }
    } else if (this.strategy === 'sliding-window') {
      const window = limiter as SlidingWindow
      const status = window.getStatus()
      const remaining = this.maxRequests - status.count
      const resetTime = status.oldestRequest + this.windowMs
      return {
        limited: remaining <= 0,
        remaining,
        resetTime,
        retryAfter: remaining <= 0 ? resetTime - now : undefined,
      }
    } else {
      const window = limiter as FixedWindow
      const status = window.getStatus()
      const remaining = this.maxRequests - status.count
      const resetTime = status.windowStart + this.windowMs
      return {
        limited: remaining <= 0,
        remaining,
        resetTime,
        retryAfter: remaining <= 0 ? resetTime - now : undefined,
      }
    }
  }

  /**
   * 重置指定标识符的限流器
   */
  reset(identifier: string): void {
    const limiter = this.limiters.get(identifier)
    if (limiter) {
      if ('reset' in limiter) {
        limiter.reset()
      }
    }
  }

  /**
   * 重置所有限流器
   */
  resetAll(): void {
    this.limiters.clear()
  }

  /**
   * 获取或创建限流器
   */
  private getLimiter(identifier: string): TokenBucket | SlidingWindow | FixedWindow {
    let limiter = this.limiters.get(identifier)

    if (!limiter) {
      if (this.strategy === 'token-bucket') {
        if (this.maxTokens === undefined || this.refillRate === undefined) {
          throw new Error('Token bucket requires maxTokens and refillRate')
        }
        limiter = new TokenBucket(this.maxTokens, this.refillRate)
      } else if (this.strategy === 'sliding-window') {
        limiter = new SlidingWindow(this.maxRequests, this.windowMs)
      } else {
        limiter = new FixedWindow(this.maxRequests, this.windowMs)
      }

      this.limiters.set(identifier, limiter)
    }

    return limiter
  }

  /**
   * 清理内存（移除长期未使用的限流器）
   */
  cleanup(): number {
    let cleaned = 0
    const identifiersToDelete: string[] = []

    // 标记需要清理的限流器
    for (const [identifier, limiter] of this.limiters.entries()) {
      if (this.strategy === 'sliding-window') {
        const window = limiter as SlidingWindow
        const status = window.getStatus()
        if (status.count === 0) {
          identifiersToDelete.push(identifier)
        }
      }
    }

    // 删除标记的限流器
    for (const identifier of identifiersToDelete) {
      this.limiters.delete(identifier)
      cleaned++
    }

    return cleaned
  }
}

/**
 * 便捷函数：创建令牌桶限流器
 */
export function createTokenBucketLimiter(maxTokens: number, refillRate: number): RateLimiter {
  return new RateLimiter({
    maxRequests: maxTokens,
    windowMs: 1000,
    strategy: 'token-bucket',
    maxTokens,
    refillRate,
  })
}

/**
 * 便捷函数：创建滑动窗口限流器
 */
export function createSlidingWindowLimiter(maxRequests: number, windowMs: number): RateLimiter {
  return new RateLimiter({
    maxRequests,
    windowMs,
    strategy: 'sliding-window',
  })
}

/**
 * 便捷函数：创建固定窗口限流器
 */
export function createFixedWindowLimiter(maxRequests: number, windowMs: number): RateLimiter {
  return new RateLimiter({
    maxRequests,
    windowMs,
    strategy: 'fixed-window',
  })
}
