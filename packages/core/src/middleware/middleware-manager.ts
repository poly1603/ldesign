/**
 * 中间件管理器实现
 * 负责中间件的注册、执行等
 */

import type {
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
  MiddlewareNext,
} from '../types'

/**
 * 预编译的中间件管道
 */
type CompiledPipeline = (context: MiddlewareContext) => Promise<void>

/**
 * 管道缓存项
 */
interface PipelineCacheEntry {
  /** 中间件列表的哈希值 */
  hash: string
  /** 预编译的管道函数 */
  pipeline: CompiledPipeline
  /** 缓存时间戳 */
  timestamp: number
  /** 命中次数 */
  hitCount: number
}

export class CoreMiddlewareManager implements MiddlewareManager {
  private middlewares = new Map<string, Middleware>()

  // 管道预编译缓存
  private pipelineCache: PipelineCacheEntry | null = null
  private cacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
  }

  /**
   * 注册中间件
   */
  use(middleware: Middleware): void {
    if (this.middlewares.has(middleware.name)) {
      throw new Error(`Middleware "${middleware.name}" is already registered`)
    }
    this.middlewares.set(middleware.name, middleware)
    // 使缓存失效
    this.invalidateCache()
  }

  /**
   * 移除中间件
   */
  remove(name: string): void {
    this.middlewares.delete(name)
    // 使缓存失效
    this.invalidateCache()
  }

  /**
   * 获取中间件
   */
  get(name: string): Middleware | undefined {
    return this.middlewares.get(name)
  }

  /**
   * 获取所有中间件
   */
  getAll(): Middleware[] {
    return Array.from(this.middlewares.values()).sort((a, b) => {
      const priorityA = a.priority ?? 0
      const priorityB = b.priority ?? 0
      return priorityB - priorityA // 降序排列
    })
  }

  /**
   * 执行中间件管道或特定中间件
   */
  async execute(
    contextOrName: MiddlewareContext | string,
    maybeContext?: MiddlewareContext
  ): Promise<void | unknown> {
    // 重载：execute(context: MiddlewareContext)
    if (typeof contextOrName !== 'string') {
      const context = contextOrName
      // 使用预编译的管道
      const pipeline = this.getCompiledPipeline()
      await pipeline(context)
      return
    }

    // 重载：execute(name: string, context: MiddlewareContext)
    const name = contextOrName
    const context = maybeContext!
    const middleware = this.middlewares.get(name)

    if (!middleware) {
      throw new Error(`Middleware "${name}" not found`)
    }

    try {
      await middleware.handler(context, async () => { })
    } catch (error) {
      context.error = error as Error
      throw error
    }
  }

  /**
   * 计算中间件列表的哈希值
   */
  private computeMiddlewareHash(): string {
    const middlewares = this.getAll()
    return middlewares.map(m => `${m.name}:${m.priority ?? 0}`).join('|')
  }

  /**
   * 编译中间件管道
   */
  private compilePipeline(middlewares: Middleware[]): CompiledPipeline {
    // 预编译：创建一个闭包,避免每次执行时重新排序和创建 next 函数
    return async (context: MiddlewareContext) => {
      let index = 0
      const next: MiddlewareNext = async () => {
        if (index >= middlewares.length) return

        const middleware = middlewares[index++]
        try {
          await middleware.handler(context, next)
        } catch (error) {
          context.error = error as Error
          throw error
        }
      }

      await next()
    }
  }

  /**
   * 获取预编译的管道
   */
  private getCompiledPipeline(): CompiledPipeline {
    const currentHash = this.computeMiddlewareHash()

    // 检查缓存是否有效
    if (this.pipelineCache && this.pipelineCache.hash === currentHash) {
      this.cacheStats.hits++
      this.pipelineCache.hitCount++
      return this.pipelineCache.pipeline
    }

    // 缓存未命中,编译新管道
    this.cacheStats.misses++
    const middlewares = this.getAll()
    const pipeline = this.compilePipeline(middlewares)

    // 更新缓存
    this.pipelineCache = {
      hash: currentHash,
      pipeline,
      timestamp: Date.now(),
      hitCount: 0,
    }

    return pipeline
  }

  /**
   * 使缓存失效
   */
  private invalidateCache(): void {
    if (this.pipelineCache) {
      this.cacheStats.invalidations++
      this.pipelineCache = null
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    hits: number
    misses: number
    invalidations: number
    hitRate: number
    currentCache: {
      exists: boolean
      timestamp?: number
      hitCount?: number
      middlewareCount?: number
    }
  } {
    const totalAccess = this.cacheStats.hits + this.cacheStats.misses
    return {
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      invalidations: this.cacheStats.invalidations,
      hitRate: totalAccess > 0 ? this.cacheStats.hits / totalAccess : 0,
      currentCache: {
        exists: this.pipelineCache !== null,
        timestamp: this.pipelineCache?.timestamp,
        hitCount: this.pipelineCache?.hitCount,
        middlewareCount: this.middlewares.size,
      },
    }
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.middlewares.clear()
  }
}

/**
 * 创建中间件管理器
 */
export function createMiddlewareManager(): MiddlewareManager {
  return new CoreMiddlewareManager()
}

