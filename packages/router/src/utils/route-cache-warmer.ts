/**
 * 路由缓存预热工具
 * 
 * 在应用启动时预加载关键路由，提升用户体验
 * 优化首次访问性能
 */

import type { Router, RouteRecordRaw } from '../types'

/**
 * 预热配置
 */
export interface WarmupConfig {
  /** 要预热的路由路径 */
  routes?: string[]
  /** 预热策略 */
  strategy?: 'immediate' | 'idle' | 'delayed'
  /** 延迟时间（毫秒），仅在 delayed 策略下有效 */
  delay?: number
  /** 并发数 */
  concurrency?: number
  /** 预热完成回调 */
  onComplete?: (results: WarmupResult[]) => void
  /** 预热错误回调 */
  onError?: (error: Error, route: string) => void
}

/**
 * 预热结果
 */
export interface WarmupResult {
  /** 路由路径 */
  route: string
  /** 是否成功 */
  success: boolean
  /** 耗时（毫秒） */
  duration: number
  /** 错误信息 */
  error?: string
}

/**
 * 路由缓存预热器
 */
export class RouteCacheWarmer {
  private router: Router
  private config: Required<WarmupConfig>
  private results: WarmupResult[] = []
  private isWarming = false

  constructor(router: Router, config: WarmupConfig = {}) {
    this.router = router
    this.config = {
      routes: config.routes ?? [],
      strategy: config.strategy ?? 'idle',
      delay: config.delay ?? 1000,
      concurrency: config.concurrency ?? 3,
      onComplete: config.onComplete ?? (() => {}),
      onError: config.onError ?? (() => {}),
    }
  }

  /**
   * 开始预热
   */
  async warmup(): Promise<WarmupResult[]> {
    if (this.isWarming) {
      return this.results
    }

    this.isWarming = true
    this.results = []

    const routes = this.config.routes.length > 0
      ? this.config.routes
      : this.getImportantRoutes()

    switch (this.config.strategy) {
      case 'immediate':
        await this.warmupImmediate(routes)
        break
      case 'idle':
        await this.warmupOnIdle(routes)
        break
      case 'delayed':
        await this.warmupDelayed(routes)
        break
    }

    this.isWarming = false
    this.config.onComplete(this.results)
    return this.results
  }

  /**
   * 立即预热
   */
  private async warmupImmediate(routes: string[]): Promise<void> {
    await this.warmupRoutes(routes)
  }

  /**
   * 空闲时预热
   */
  private async warmupOnIdle(routes: string[]): Promise<void> {
    if ('requestIdleCallback' in window) {
      return new Promise((resolve) => {
        requestIdleCallback(async () => {
          await this.warmupRoutes(routes)
          resolve()
        })
      })
    } else {
      // 降级到延迟预热
      await this.warmupDelayed(routes)
    }
  }

  /**
   * 延迟预热
   */
  private async warmupDelayed(routes: string[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.warmupRoutes(routes)
        resolve()
      }, this.config.delay)
    })
  }

  /**
   * 预热路由列表
   */
  private async warmupRoutes(routes: string[]): Promise<void> {
    const chunks = this.chunkArray(routes, this.config.concurrency)

    for (const chunk of chunks) {
      await Promise.all(chunk.map(route => this.warmupRoute(route)))
    }
  }

  /**
   * 预热单个路由
   */
  private async warmupRoute(route: string): Promise<void> {
    const startTime = performance.now()

    try {
      // 解析路由
      const resolved = this.router.resolve(route)

      // 如果路由有组件，尝试预加载
      if (resolved.matched.length > 0) {
        const record = resolved.matched[0]
        if (record && typeof record.component === 'function') {
          await (record.component as () => Promise<any>)()
        }
      }

      const duration = performance.now() - startTime
      this.results.push({
        route,
        success: true,
        duration,
      })
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.results.push({
        route,
        success: false,
        duration,
        error: errorMessage,
      })

      this.config.onError(
        error instanceof Error ? error : new Error(errorMessage),
        route
      )
    }
  }

  /**
   * 获取重要路由
   * 自动识别需要预热的路由
   */
  private getImportantRoutes(): string[] {
    const routes: string[] = []
    const allRoutes = this.router.getRoutes()

    for (const route of allRoutes) {
      // 预热标记为重要的路由
      if (route.meta?.preload === true || route.meta?.important === true) {
        routes.push(route.path)
      }
    }

    // 如果没有标记的路由，预热前3个路由
    if (routes.length === 0 && allRoutes.length > 0) {
      return allRoutes.slice(0, 3).map(r => r.path)
    }

    return routes
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 获取预热结果
   */
  getResults(): WarmupResult[] {
    return [...this.results]
  }

  /**
   * 获取成功的预热
   */
  getSuccessful(): WarmupResult[] {
    return this.results.filter(r => r.success)
  }

  /**
   * 获取失败的预热
   */
  getFailed(): WarmupResult[] {
    return this.results.filter(r => !r.success)
  }

  /**
   * 获取预热统计
   */
  getStats(): {
    total: number
    successful: number
    failed: number
    averageDuration: number
  } {
    const successful = this.getSuccessful()
    const failed = this.getFailed()
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    return {
      total: this.results.length,
      successful: successful.length,
      failed: failed.length,
      averageDuration: this.results.length > 0 ? totalDuration / this.results.length : 0,
    }
  }
}

/**
 * 创建路由缓存预热器
 */
export function createRouteCacheWarmer(
  router: Router,
  config?: WarmupConfig
): RouteCacheWarmer {
  return new RouteCacheWarmer(router, config)
}

/**
 * 快速预热路由
 */
export async function warmupRoutes(
  router: Router,
  routes: string[],
  strategy: 'immediate' | 'idle' | 'delayed' = 'idle'
): Promise<WarmupResult[]> {
  const warmer = createRouteCacheWarmer(router, { routes, strategy })
  return warmer.warmup()
}

