import type {
  Logger,
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
  MiddlewareNext,
} from '../types'

export class MiddlewareManagerImpl implements MiddlewareManager {
  private middleware: Middleware[] = []

  // 内存优化：限制中间件数量
  private readonly MAX_MIDDLEWARE = 50
  private logger?: Logger
  
  // 性能优化：缓存中间件映射
  private middlewareMap = new Map<string, Middleware>()
  private needsSort = false

  constructor(logger?: Logger) {
    this.logger = logger
  }

  use(middleware: Middleware): void {
    // 使用 Map 快速查找
    const existing = this.middlewareMap.get(middleware.name)
    
    if (existing) {
      // 替换现有中间件
      const index = this.middleware.indexOf(existing)
      if (index > -1) {
        this.middleware[index] = middleware
        this.middlewareMap.set(middleware.name, middleware)
      }
    } else {
      // 检查中间件数量限制
      if (this.middleware.length >= this.MAX_MIDDLEWARE) {
        this.logger?.warn(`Maximum middleware limit (${this.MAX_MIDDLEWARE}) reached, removing lowest priority`)
        // 移除优先级最低的中间件
        let lowestPriority = -Infinity
        let lowestMiddleware: Middleware | null = null
        
        for (const m of this.middleware) {
          const priority = m.priority ?? 100
          if (priority > lowestPriority) {
            lowestPriority = priority
            lowestMiddleware = m
          }
        }
        
        if (lowestMiddleware) {
          this.remove(lowestMiddleware.name)
        }
      }

      // 添加新中间件
      this.middleware.push(middleware)
      this.middlewareMap.set(middleware.name, middleware)
    }

    // 标记需要排序，延迟到执行时进行
    this.needsSort = true
  }

  remove(name: string): void {
    const middleware = this.middlewareMap.get(name)
    if (middleware) {
      const index = this.middleware.indexOf(middleware)
      if (index > -1) {
        this.middleware.splice(index, 1)
      }
      this.middlewareMap.delete(name)
    }
  }
  
  /**
   * 确保中间件已排序 - 懒排序优化
   */
  private ensureSorted(): void {
    if (this.needsSort) {
      this.middleware.sort((a, b) => {
        const priorityA = a.priority ?? 100
        const priorityB = b.priority ?? 100
        return priorityA - priorityB
      })
      this.needsSort = false
    }
  }

  async execute(context: MiddlewareContext): Promise<void>
  async execute(name: string, context: MiddlewareContext): Promise<unknown>
  async execute(contextOrName: MiddlewareContext | string, context?: MiddlewareContext): Promise<void | unknown> {
    // 重载处理
    if (typeof contextOrName === 'string') {
      // 执行特定名称的中间件 - 使用 Map 优化查找
      const name = contextOrName
      if (!context) {
        throw new Error('Context is required when executing middleware by name')
      }
      const ctx = context
      const middleware = this.middlewareMap.get(name)

      if (!middleware) {
        throw new Error(`Middleware "${name}" not found`)
      }

      const result = { processed: false }
      const next: MiddlewareNext = async () => {
        result.processed = true
      }

      await middleware.handler(ctx, next)
      return result
    } else {
      // 执行所有中间件
      this.ensureSorted() // 确保已排序
      
      const ctx = contextOrName
      let index = 0
      const middlewareList = this.middleware

      const next: MiddlewareNext = async () => {
        if (index >= middlewareList.length) {
          return
        }

        const middleware = middlewareList[index++]
        try {
          await middleware.handler(ctx, next)
        } catch (error) {
          // 将错误添加到上下文中
          ctx.error = error as Error
          throw error
        }
      }

      await next()
    }
  }

  // 获取所有中间件
  getAll(): Middleware[] {
    return [...this.middleware]
  }

  // 获取指定名称的中间件 - 使用 Map 优化
  get(name: string): Middleware | undefined {
    return this.middlewareMap.get(name)
  }

  // 检查中间件是否存在 - 使用 Map 优化
  has(name: string): boolean {
    return this.middlewareMap.has(name)
  }

  // 清空所有中间件
  clear(): void {
    this.middleware.length = 0
    this.middlewareMap.clear()
    this.needsSort = false
  }

  // 获取中间件数量
  size(): number {
    return this.middleware.length
  }

  // 获取中间件执行顺序
  getExecutionOrder(): string[] {
    return this.middleware.map(m => m.name)
  }

  // 销毁方法
  destroy(): void {
    this.clear()
    this.logger = undefined
  }
  
  // 获取性能统计
  getStats(): {
    total: number
    byPriority: Record<number, number>
  } {
    const stats: Record<number, number> = {}
    
    for (const middleware of this.middleware) {
      const priority = middleware.priority ?? 100
      stats[priority] = (stats[priority] || 0) + 1
    }
    
    return {
      total: this.middleware.length,
      byPriority: stats
    }
  }
}

export function createMiddlewareManager(logger?: Logger): MiddlewareManager {
  return new MiddlewareManagerImpl(logger)
}

// 预定义的中间件创建器
export function createRequestMiddleware(
  name: string,
  handler: (
    context: MiddlewareContext,
    next: MiddlewareNext
  ) => Promise<void> | void,
  priority = 50
): Middleware {
  return {
    name,
    handler,
    priority,
  }
}

export function createResponseMiddleware(
  name: string,
  handler: (
    context: MiddlewareContext,
    next: MiddlewareNext
  ) => Promise<void> | void,
  priority = 50
): Middleware {
  return {
    name,
    handler,
    priority,
  }
}

export function createErrorMiddleware(
  name: string,
  handler: (
    context: MiddlewareContext,
    next: MiddlewareNext
  ) => Promise<void> | void,
  priority = 90
): Middleware {
  return {
    name,
    handler,
    priority,
  }
}

// 常用中间件示例
export const commonMiddleware = {
  // 日志中间件
  logger: (logger: { info: (msg: string, data?: unknown) => void; warn: (msg: string, data?: unknown) => void; debug: (msg: string, data?: unknown) => void }) =>
    createRequestMiddleware(
      'logger',
      async (context, next) => {
        const start = Date.now()
        logger.info('Middleware execution started', { context })

        await next()

        const duration = Date.now() - start
        logger.info('Middleware execution completed', { duration, context })
      },
      10
    ),

  // 错误处理中间件
  errorHandler: (errorManager: { captureError: (error: Error) => void }) =>
    createErrorMiddleware(
      'errorHandler',
      async (context, next) => {
        try {
          await next()
        } catch (error) {
          errorManager.captureError(error as Error)
          context.error = error as Error
          // 不重新抛出错误，让后续中间件处理
        }
      },
      100
    ),

  // 性能监控中间件
  performance: (logger: { warn: (msg: string, data?: unknown) => void }) =>
    createRequestMiddleware(
      'performance',
      async (context, next) => {
        const start = performance.now()

        await next()

        const duration = performance.now() - start
        if (duration > 100) {
          // 超过100ms记录警告
          logger.warn('Slow middleware execution detected', {
            duration,
            context,
          })
        }
      },
      20
    ),

  // 安全中间件
  security: (logger: { debug: (msg: string, data?: unknown) => void }) =>
    createRequestMiddleware(
      'security',
      async (context, next) => {
        logger.debug('Security middleware executed', { context })
        await next()
      },
      30
    ),
}
