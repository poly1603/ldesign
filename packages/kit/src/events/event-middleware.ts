/**
 * 事件中间件
 * 提供事件处理的中间件机制
 */

import type { EventListener } from '../types'

/**
 * 中间件函数类型
 */
export type MiddlewareFunction = (
  event: string,
  args: unknown[],
  next: () => void | Promise<void>
) => void | Promise<void>

/**
 * 中间件选项
 */
export interface MiddlewareOptions {
  priority?: number
  name?: string
  enabled?: boolean
  tags?: string[]
}

/**
 * 中间件信息
 */
interface MiddlewareInfo {
  middleware: MiddlewareFunction
  options: Required<MiddlewareOptions>
  createdAt: Date
  callCount: number
  lastCalledAt?: Date
  totalExecutionTime: number
}

/**
 * 事件中间件管理器
 */
export class EventMiddleware {
  private middleware: MiddlewareInfo[] = []
  private enableStats = true

  constructor(options: { enableStats?: boolean } = {}) {
    this.enableStats = options.enableStats !== false
  }

  /**
   * 添加中间件
   */
  use(middleware: MiddlewareFunction, options: MiddlewareOptions = {}): this {
    const middlewareInfo: MiddlewareInfo = {
      middleware,
      options: {
        priority: options.priority || 0,
        name: options.name || `middleware_${this.middleware.length}`,
        enabled: options.enabled !== false,
        tags: options.tags || [],
      },
      createdAt: new Date(),
      callCount: 0,
      totalExecutionTime: 0,
    }

    this.middleware.push(middlewareInfo)

    // 按优先级排序（高优先级先执行）
    this.middleware.sort((a, b) => b.options.priority - a.options.priority)

    return this
  }

  /**
   * 移除中间件
   */
  remove(middleware: MiddlewareFunction | string): boolean {
    const index = this.middleware.findIndex(info =>
      typeof middleware === 'string'
        ? info.options.name === middleware
        : info.middleware === middleware,
    )

    if (index !== -1) {
      this.middleware.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 启用/禁用中间件
   */
  enable(name: string): boolean {
    const info = this.middleware.find(info => info.options.name === name)
    if (info) {
      info.options.enabled = true
      return true
    }
    return false
  }

  /**
   * 禁用中间件
   */
  disable(name: string): boolean {
    const info = this.middleware.find(info => info.options.name === name)
    if (info) {
      info.options.enabled = false
      return true
    }
    return false
  }

  /**
   * 执行中间件链
   */
  async execute(event: string, args: unknown[], finalHandler?: EventListener): Promise<void> {
    const enabledMiddleware = this.middleware.filter(info => info.options.enabled)

    if (enabledMiddleware.length === 0) {
      if (finalHandler) {
        await finalHandler(...args)
      }
      return
    }

    let index = 0

    const next = async (): Promise<void> => {
      if (index < enabledMiddleware.length) {
        const middlewareInfo = enabledMiddleware[index++]
        if (!middlewareInfo) {
          if (finalHandler)
            await finalHandler(...args)
          return
        }
        const startTime = this.enableStats ? Date.now() : 0

        // 更新统计信息
        if (this.enableStats) {
          middlewareInfo.callCount++
          middlewareInfo.lastCalledAt = new Date()
        }

        try {
          await middlewareInfo.middleware(event, args, next)
        }
        finally {
          if (this.enableStats && startTime > 0) {
            middlewareInfo.totalExecutionTime += Date.now() - startTime
          }
        }
      }
      else if (finalHandler) {
        // 所有中间件执行完毕，执行最终处理器
        await finalHandler(...args)
      }
    }

    await next()
  }

  /**
   * 获取中间件列表
   */
  getMiddleware(): MiddlewareInfo[] {
    return [...this.middleware]
  }

  /**
   * 获取中间件统计信息
   */
  getStats(): Record<string, {
    callCount: number
    lastCalledAt?: Date
    totalExecutionTime: number
    averageExecutionTime: number
    enabled: boolean
    priority: number
    tags: string[]
  }> {
    return this.middleware.reduce(
      (stats, info) => {
        stats[info.options.name] = {
          callCount: info.callCount,
          lastCalledAt: info.lastCalledAt,
          totalExecutionTime: info.totalExecutionTime,
          averageExecutionTime: info.callCount > 0 ? info.totalExecutionTime / info.callCount : 0,
          enabled: info.options.enabled,
          priority: info.options.priority,
          tags: info.options.tags,
        }
        return stats
      },
      {} as Record<string, {
        callCount: number
        lastCalledAt?: Date
        totalExecutionTime: number
        averageExecutionTime: number
        enabled: boolean
        priority: number
        tags: string[]
      }>,
    )
  }

  /**
   * 重置统计信息
   */
  resetStats(): this {
    for (const info of this.middleware) {
      info.callCount = 0
      info.lastCalledAt = undefined
      info.totalExecutionTime = 0
    }
    return this
  }

  /**
   * 按标签获取中间件
   */
  getMiddlewareByTag(tag: string): MiddlewareInfo[] {
    return this.middleware.filter(info => info.options.tags.includes(tag))
  }

  /**
   * 按标签启用中间件
   */
  enableByTag(tag: string): number {
    let count = 0
    for (const info of this.middleware) {
      if (info.options.tags.includes(tag)) {
        info.options.enabled = true
        count++
      }
    }
    return count
  }

  /**
   * 按标签禁用中间件
   */
  disableByTag(tag: string): number {
    let count = 0
    for (const info of this.middleware) {
      if (info.options.tags.includes(tag)) {
        info.options.enabled = false
        count++
      }
    }
    return count
  }

  /**
   * 清空所有中间件
   */
  clear(): this {
    this.middleware = []
    return this
  }

  /**
   * 获取中间件数量
   */
  size(): number {
    return this.middleware.length
  }

  /**
   * 检查是否有中间件
   */
  hasMiddleware(): boolean {
    return this.middleware.length > 0
  }

  /**
   * 创建中间件管理器实例
   */
  static create(options?: { enableStats?: boolean }): EventMiddleware {
    return new EventMiddleware(options)
  }
}

/**
 * 预定义中间件
 */
export class BuiltinMiddleware {
  /**
   * 日志中间件
   */
  static logger(
    options: {
      logLevel?: 'debug' | 'info' | 'warn' | 'error'
      includeArgs?: boolean
      prefix?: string
    } = {},
  ): MiddlewareFunction {
    const { logLevel = 'info', includeArgs = false, prefix = '[Event]' } = options

    return (event: string, args: unknown[], next: () => void) => {
      const message = includeArgs
        ? `${prefix} ${event} with args: ${JSON.stringify(args)}`
        : `${prefix} ${event}`

      // Use allowed console methods for warn/error; stdout for info/debug
      if (logLevel === 'error') {
        console.error(message)
      }
      else if (logLevel === 'warn') {
        console.warn(message)
      }
      else {
        process.stdout.write(`${message}\n`)
      }
      next()
    }
  }

  /**
   * 性能监控中间件
   */
  static performance(
    options: {
      threshold?: number
      onSlowEvent?: (event: string, duration: number) => void
    } = {},
  ): MiddlewareFunction {
    const { threshold = 100, onSlowEvent } = options

    return async (event: string, _args: unknown[], next: () => void) => {
      const startTime = Date.now()
      await next()
      const duration = Date.now() - startTime

      if (duration > threshold && onSlowEvent) {
        onSlowEvent(event, duration)
      }
    }
  }

  /**
   * 错误处理中间件
   */
  static errorHandler(
    options: {
      onError?: (error: Error, event: string, args: unknown[]) => void
      rethrow?: boolean
    } = {},
  ): MiddlewareFunction {
    const { onError, rethrow = true } = options

    return async (event: string, args: unknown[], next: () => void) => {
      try {
        await next()
      }
      catch (error) {
        if (onError) {
          onError(error as Error, event, args)
        }

        if (rethrow) {
          throw error
        }
      }
    }
  }

  /**
   * 限流中间件
   */
  static rateLimit(
    options: {
      maxEvents?: number
      windowMs?: number
      onLimitExceeded?: (event: string) => void
    } = {},
  ): MiddlewareFunction {
    const { maxEvents = 100, windowMs = 60000, onLimitExceeded } = options
    const eventCounts = new Map<string, { count: number, resetTime: number }>()

    return (event: string, _args: unknown[], next: () => void) => {
      const now = Date.now()
      const eventData = eventCounts.get(event)

      if (!eventData || now > eventData.resetTime) {
        eventCounts.set(event, { count: 1, resetTime: now + windowMs })
        next()
        return
      }

      if (eventData.count >= maxEvents) {
        if (onLimitExceeded) {
          onLimitExceeded(event)
        }
        return // 不执行next()，阻止事件继续处理
      }

      eventData.count++
      next()
    }
  }

  /**
   * 事件过滤中间件
   */
  static filter(predicate: (event: string, args: unknown[]) => boolean): MiddlewareFunction {
    return (event: string, args: unknown[], next: () => void) => {
      if (predicate(event, args)) {
        next()
      }
      // 如果不满足条件，不调用next()，阻止事件继续处理
    }
  }

  /**
   * 事件转换中间件
   */
  static transform(
    transformer: (event: string, args: unknown[]) => { event: string, args: unknown[] },
  ): MiddlewareFunction {
    return (event: string, args: unknown[], next: () => void) => {
      const transformed = transformer(event, args)
      // 注意：这里需要修改原始参数，因为中间件链是引用传递
      args.splice(0, args.length, ...transformed.args)
      next()
    }
  }

  /**
   * 缓存中间件
   */
  static cache(
    options: {
      ttl?: number
      maxSize?: number
      keyGenerator?: (event: string, args: unknown[]) => string
    } = {},
  ): MiddlewareFunction {
    const {
      ttl = 60000,
      maxSize = 1000,
      keyGenerator = (event, args) => `${event}:${JSON.stringify(args)}`,
    } = options
    const cache = new Map<string, { value: unknown, expiry: number }>()

    return async (event: string, args: unknown[], next: () => void): Promise<void> => {
      const key = keyGenerator(event, args)
      const cached = cache.get(key)

      if (cached && Date.now() < cached.expiry) {
        // 返回缓存的结果，但不返回值，因为中间件应该返回 void
        return
      }

      // 清理过期缓存
      if (cache.size >= maxSize) {
        const now = Date.now()
        for (const [k, v] of cache) {
          if (now >= v.expiry) {
            cache.delete(k)
          }
        }
      }

      const result = await next()

      // 缓存结果
      cache.set(key, { value: result, expiry: Date.now() + ttl })

      return result
    }
  }
}
