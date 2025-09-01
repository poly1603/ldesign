import type {
  Logger,
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
  MiddlewareNext,
} from '../types'

export class MiddlewareManagerImpl implements MiddlewareManager {
  private middleware: Middleware[] = []

  constructor(_logger?: Logger) {
    // logger参数保留用于未来扩展
  }

  use(middleware: Middleware): void {
    // 检查是否已存在同名中间件
    const existingIndex = this.middleware.findIndex(
      m => m.name === middleware.name
    )
    if (existingIndex > -1) {
      // 替换现有中间件
      this.middleware[existingIndex] = middleware
    } else {
      // 添加新中间件
      this.middleware.push(middleware)
    }

    // 按优先级排序（数字越小优先级越高）
    this.middleware.sort((a, b) => {
      const priorityA = a.priority ?? 100
      const priorityB = b.priority ?? 100
      return priorityA - priorityB
    })
  }

  remove(name: string): void {
    const index = this.middleware.findIndex(m => m.name === name)
    if (index > -1) {
      this.middleware.splice(index, 1)
    }
  }

  async execute(
    contextOrName: MiddlewareContext | string,
    context?: MiddlewareContext
  ): Promise<any> {
    // 重载处理
    if (typeof contextOrName === 'string') {
      // 执行特定名称的中间件
      const name = contextOrName
      const ctx = context!
      const middleware = this.middleware.find(m => m.name === name)

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
      const ctx = contextOrName
      let index = 0

      const next: MiddlewareNext = async () => {
        if (index >= this.middleware.length) {
          return
        }

        const middleware = this.middleware[index++]
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

  // 获取指定名称的中间件
  get(name: string): Middleware | undefined {
    return this.middleware.find(m => m.name === name)
  }

  // 检查中间件是否存在
  has(name: string): boolean {
    return this.middleware.some(m => m.name === name)
  }

  // 清空所有中间件
  clear(): void {
    this.middleware = []
  }

  // 获取中间件数量
  size(): number {
    return this.middleware.length
  }

  // 获取中间件执行顺序
  getExecutionOrder(): string[] {
    return this.middleware.map(m => m.name)
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
  logger: (logger: any) =>
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
  errorHandler: (errorManager: any) =>
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
  performance: (logger: any) =>
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
  security: (logger: any) =>
    createRequestMiddleware(
      'security',
      async (context, next) => {
        logger.debug('Security middleware executed', { context })
        await next()
      },
      30
    ),
}
