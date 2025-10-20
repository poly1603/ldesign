/**
 * 数据预取管理器
 * @module DataFetchingManager
 */

import type { App} from 'vue';
import type { NavigationGuardNext, RouteLocationNormalized, Router } from '../types'

/**
 * 数据获取函数类型
 */
export type DataFetchFunction<T = any> = (
  route: RouteLocationNormalized,
  params?: Record<string, any>
) => Promise<T>

/**
 * 数据获取配置
 */
export interface DataFetchConfig {
  /** 获取函数 */
  fetcher: DataFetchFunction
  /** 缓存键生成器 */
  cacheKey?: (route: RouteLocationNormalized) => string
  /** 缓存时间（毫秒） */
  cacheDuration?: number
  /** 是否在客户端获取 */
  fetchOnClient?: boolean
  /** 是否在服务端获取 */
  fetchOnServer?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否并行获取 */
  parallel?: boolean
  /** 依赖的数据键 */
  dependencies?: string[]
  /** 错误处理器 */
  onError?: (error: Error, route: RouteLocationNormalized) => void
  /** 成功回调 */
  onSuccess?: (data: any, route: RouteLocationNormalized) => void
}

/**
 * 数据获取状态
 */
export interface DataFetchState {
  /** 是否加载中 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 数据 */
  data: any
  /** 时间戳 */
  timestamp: number
  /** 是否从缓存加载 */
  fromCache: boolean
}

/**
 * 缓存条目
 */
interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

/**
 * 数据获取选项
 */
export interface DataFetchOptions {
  /** 是否启用全局缓存 */
  globalCache?: boolean
  /** 默认缓存时间 */
  defaultCacheDuration?: number
  /** 是否启用预加载 */
  enablePrefetch?: boolean
  /** 预加载延迟 */
  prefetchDelay?: number
  /** 是否启用并行获取 */
  parallelFetch?: boolean
  /** 最大并行数 */
  maxParallel?: number
  /** 是否启用重试 */
  enableRetry?: boolean
  /** 默认重试次数 */
  defaultRetryCount?: number
  /** 是否启用超时 */
  enableTimeout?: boolean
  /** 默认超时时间 */
  defaultTimeout?: number
  /** 是否启用错误边界 */
  enableErrorBoundary?: boolean
  /** 全局错误处理器 */
  globalErrorHandler?: (error: Error, route: RouteLocationNormalized) => void
}

/**
 * 数据预取管理器类
 */
export class DataFetchingManager {
  private router: Router | null = null
  private cache = new Map<string, CacheEntry>()
  private fetchConfigs = new Map<string, DataFetchConfig>()
  private fetchStates = new Map<string, DataFetchState>()
  private pendingFetches = new Map<string, Promise<any>>()
  private options: DataFetchOptions
  private prefetchQueue: Set<string> = new Set()
  private fetchHistory: Map<string, number[]> = new Map()

  constructor(options: DataFetchOptions = {}) {
    this.options = {
      globalCache: true,
      defaultCacheDuration: 5 * 60 * 1000, // 5分钟
      enablePrefetch: true,
      prefetchDelay: 100,
      parallelFetch: true,
      maxParallel: 5,
      enableRetry: true,
      defaultRetryCount: 3,
      enableTimeout: true,
      defaultTimeout: 30000, // 30秒
      enableErrorBoundary: true,
      ...options
    }

    // 定期清理过期缓存
    this.startCacheCleaner()
  }

  /**
   * 初始化管理器
   */
  public init(router: Router) {
    this.router = router

    // 注册全局导航守卫
    router.beforeEach(async (to, from, next) => {
      await this.handleRouteChange(to, from, next)
    })

    // 注册路由后置守卫
    router.afterEach((to, from) => {
      this.handleAfterRoute(to, from)
    })
  }

  /**
   * 注册数据获取配置
   */
  public register(key: string, config: DataFetchConfig) {
    this.fetchConfigs.set(key, {
      fetchOnClient: true,
      fetchOnServer: false,
      parallel: this.options.parallelFetch,
      retryCount: this.options.defaultRetryCount,
      retryDelay: 1000,
      timeout: this.options.defaultTimeout,
      cacheDuration: this.options.defaultCacheDuration,
      ...config
    })
  }

  /**
   * 批量注册数据获取配置
   */
  public registerBatch(configs: Record<string, DataFetchConfig>) {
    Object.entries(configs).forEach(([key, config]) => {
      this.register(key, config)
    })
  }

  /**
   * 获取数据
   */
  public async fetch<T = any>(
    key: string,
    route: RouteLocationNormalized,
    params?: Record<string, any>
  ): Promise<T> {
    const config = this.fetchConfigs.get(key)
    if (!config) {
      throw new Error(`Data fetch config not found: ${key}`)
    }

    // 生成缓存键
    const cacheKey = this.generateCacheKey(key, route, config)

    // 检查是否有进行中的请求
    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey)!
    }

    // 检查缓存
    if (this.options.globalCache && config.cacheDuration) {
      const cached = this.getFromCache(cacheKey)
      if (cached !== null) {
        this.updateState(key, {
          loading: false,
          error: null,
          data: cached,
          timestamp: Date.now(),
          fromCache: true
        })
        return cached
      }
    }

    // 更新状态为加载中
    this.updateState(key, {
      loading: true,
      error: null,
      data: null,
      timestamp: Date.now(),
      fromCache: false
    })

    // 创建获取promise
    const fetchPromise = this.performFetch(key, config, route, params, cacheKey)
    this.pendingFetches.set(cacheKey, fetchPromise)

    try {
      const data = await fetchPromise
      return data
    } finally {
      this.pendingFetches.delete(cacheKey)
    }
  }

  /**
   * 执行数据获取
   */
  private async performFetch(
    key: string,
    config: DataFetchConfig,
    route: RouteLocationNormalized,
    params: Record<string, any> | undefined,
    cacheKey: string
  ): Promise<any> {
    let lastError: Error | null = null
    const retryCount = config.retryCount || 0

    for (let i = 0; i <= retryCount; i++) {
      try {
        // 添加超时控制
        const data = await this.fetchWithTimeout(
          config.fetcher(route, params),
          config.timeout || this.options.defaultTimeout!
        )

        // 更新缓存
        if (this.options.globalCache && config.cacheDuration) {
          this.setCache(cacheKey, data, config.cacheDuration)
        }

        // 更新状态
        this.updateState(key, {
          loading: false,
          error: null,
          data,
          timestamp: Date.now(),
          fromCache: false
        })

        // 调用成功回调
        if (config.onSuccess) {
          config.onSuccess(data, route)
        }

        // 记录获取历史
        this.recordFetchHistory(key)

        return data
      } catch (error) {
        lastError = error as Error

        if (i < retryCount) {
          // 等待重试延迟
          await new Promise(resolve => 
            setTimeout(resolve, config.retryDelay || 1000)
          )
        }
      }
    }

    // 更新错误状态
    this.updateState(key, {
      loading: false,
      error: lastError,
      data: null,
      timestamp: Date.now(),
      fromCache: false
    })

    // 调用错误处理器
    if (config.onError) {
      config.onError(lastError!, route)
    } else if (this.options.globalErrorHandler) {
      this.options.globalErrorHandler(lastError!, route)
    }

    throw lastError
  }

  /**
   * 带超时的数据获取
   */
  private async fetchWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    if (!this.options.enableTimeout) {
      return promise
    }

    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Fetch timeout')), timeout)
      )
    ])
  }

  /**
   * 预获取数据
   */
  public async prefetch(
    key: string,
    route: RouteLocationNormalized,
    params?: Record<string, any>
  ): Promise<void> {
    if (!this.options.enablePrefetch) {
      return
    }

    const config = this.fetchConfigs.get(key)
    if (!config) {
      return
    }

    const cacheKey = this.generateCacheKey(key, route, config)

    // 检查是否已在队列中
    if (this.prefetchQueue.has(cacheKey)) {
      return
    }

    // 添加到预获取队列
    this.prefetchQueue.add(cacheKey)

    // 延迟执行预获取
    setTimeout(async () => {
      try {
        await this.fetch(key, route, params)
      } catch (error) {
        // 预获取失败不抛出错误
        console.warn(`Prefetch failed for ${key}:`, error)
      } finally {
        this.prefetchQueue.delete(cacheKey)
      }
    }, this.options.prefetchDelay || 100)
  }

  /**
   * 批量预获取
   */
  public async prefetchBatch(
    keys: string[],
    route: RouteLocationNormalized,
    params?: Record<string, any>
  ): Promise<void> {
    const promises = keys.map(key => this.prefetch(key, route, params))
    await Promise.allSettled(promises)
  }

  /**
   * 处理路由变化
   */
  private async handleRouteChange(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const routeFetchers = this.getRouteFetchers(to)

    if (routeFetchers.length === 0) {
      next()
      return
    }

    try {
      // 检查是否需要等待数据获取
      const blockingFetchers = routeFetchers.filter(key => {
        const config = this.fetchConfigs.get(key)
        return config && !config.parallel
      })

      if (blockingFetchers.length > 0) {
        // 串行获取阻塞数据
        for (const key of blockingFetchers) {
          await this.fetch(key, to)
        }
      }

      // 并行获取非阻塞数据
      const parallelFetchers = routeFetchers.filter(key => {
        const config = this.fetchConfigs.get(key)
        return config && config.parallel
      })

      if (parallelFetchers.length > 0) {
        // 使用Promise.allSettled避免一个失败导致全部失败
        const promises = parallelFetchers.map(key => this.fetch(key, to))
        await Promise.allSettled(promises)
      }

      next()
    } catch (error) {
      // 处理错误
      if (this.options.enableErrorBoundary) {
        console.error('Route data fetch failed:', error)
        next(false)
      } else {
        next()
      }
    }
  }

  /**
   * 处理路由后置操作
   */
  private handleAfterRoute(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) {
    // 清理旧路由的状态
    this.cleanupRouteStates(from)

    // 预获取可能的下一页数据
    this.prefetchNextRoutes(to)
  }

  /**
   * 获取路由相关的数据获取器
   */
  private getRouteFetchers(route: RouteLocationNormalized): string[] {
    const fetchers: string[] = []

    // 从路由元信息获取
    if (route.meta.fetchers) {
      fetchers.push(...(route.meta.fetchers as string[]))
    }

    // 从路由名称匹配
    if (route.name) {
      this.fetchConfigs.forEach((config, key) => {
        if (key.startsWith(route.name as string)) {
          fetchers.push(key)
        }
      })
    }

    return [...new Set(fetchers)]
  }

  /**
   * 预获取可能的下一页数据
   */
  private prefetchNextRoutes(route: RouteLocationNormalized) {
    // 基于用户访问模式预测下一页
    const predictions = this.predictNextRoutes(route)

    predictions.forEach(nextRoute => {
      const fetchers = this.getRouteFetchers(nextRoute)
      fetchers.forEach(key => {
        this.prefetch(key, nextRoute).catch(() => {
          // 忽略预获取错误
        })
      })
    })
  }

  /**
   * 预测下一个可能的路由
   */
  private predictNextRoutes(
    currentRoute: RouteLocationNormalized
  ): RouteLocationNormalized[] {
    // 简单的预测逻辑，可以根据实际需求扩展
    const predictions: RouteLocationNormalized[] = []

    // 基于历史记录预测
    // 这里可以实现更复杂的预测算法

    return predictions
  }

  /**
   * 清理路由状态
   */
  private cleanupRouteStates(route: RouteLocationNormalized) {
    // 清理与路由相关的状态
    const fetchers = this.getRouteFetchers(route)
    fetchers.forEach(key => {
      // 保留缓存，只清理状态
      this.fetchStates.delete(key)
    })
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    key: string,
    route: RouteLocationNormalized,
    config: DataFetchConfig
  ): string {
    if (config.cacheKey) {
      return config.cacheKey(route)
    }

    // 默认缓存键生成
    const routeKey = `${route.path}_${JSON.stringify(route.params)}_${JSON.stringify(route.query)}`
    return `${key}_${routeKey}`
  }

  /**
   * 从缓存获取数据
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: any, duration: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    })
  }

  /**
   * 更新状态
   */
  private updateState(key: string, state: DataFetchState) {
    this.fetchStates.set(key, state)
  }

  /**
   * 获取状态
   */
  public getState(key: string): DataFetchState | undefined {
    return this.fetchStates.get(key)
  }

  /**
   * 获取所有状态
   */
  public getAllStates(): Map<string, DataFetchState> {
    return new Map(this.fetchStates)
  }

  /**
   * 清除缓存
   */
  public clearCache(key?: string) {
    if (key) {
      // 清除特定键的缓存
      const cacheKeys = Array.from(this.cache.keys()).filter(k => k.startsWith(key))
      cacheKeys.forEach(k => this.cache.delete(k))
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }

  /**
   * 刷新数据
   */
  public async refresh(
    key: string,
    route: RouteLocationNormalized,
    params?: Record<string, any>
  ): Promise<any> {
    // 清除缓存
    this.clearCache(key)

    // 重新获取
    return this.fetch(key, route, params)
  }

  /**
   * 记录获取历史
   */
  private recordFetchHistory(key: string) {
    const history = this.fetchHistory.get(key) || []
    history.push(Date.now())

    // 只保留最近100条记录
    if (history.length > 100) {
      history.shift()
    }

    this.fetchHistory.set(key, history)
  }

  /**
   * 获取获取统计
   */
  public getStatistics(key?: string): Record<string, any> {
    if (key) {
      const history = this.fetchHistory.get(key) || []
      const state = this.fetchStates.get(key)

      return {
        key,
        totalFetches: history.length,
        lastFetch: history[history.length - 1] || null,
        averageInterval: this.calculateAverageInterval(history),
        currentState: state,
        cacheHitRate: this.calculateCacheHitRate(key)
      }
    }

    // 返回所有统计
    const stats: Record<string, any> = {}
    this.fetchConfigs.forEach((_, k) => {
      stats[k] = this.getStatistics(k)
    })

    return stats
  }

  /**
   * 计算平均获取间隔
   */
  private calculateAverageInterval(history: number[]): number {
    if (history.length < 2) {
      return 0
    }

    let totalInterval = 0
    for (let i = 1; i < history.length; i++) {
      totalInterval += history[i] - history[i - 1]
    }

    return totalInterval / (history.length - 1)
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(key: string): number {
    // 简化的缓存命中率计算
    const state = this.fetchStates.get(key)
    if (!state) {
      return 0
    }

    // 这里可以实现更复杂的统计逻辑
    return state.fromCache ? 1 : 0
  }

  /**
   * 启动缓存清理器
   */
  private startCacheCleaner() {
    setInterval(() => {
      const now = Date.now()
      this.cache.forEach((entry, key) => {
        if (now > entry.expiry) {
          this.cache.delete(key)
        }
      })
    }, 60000) // 每分钟清理一次
  }

  /**
   * 销毁管理器
   */
  public destroy() {
    this.cache.clear()
    this.fetchConfigs.clear()
    this.fetchStates.clear()
    this.pendingFetches.clear()
    this.prefetchQueue.clear()
    this.fetchHistory.clear()
  }
}

/**
 * 数据获取注入键
 */
export const DATA_FETCHING_KEY = Symbol('DataFetching')

/**
 * Vue插件
 */
export const DataFetchingPlugin = {
  install(app: App, options?: DataFetchOptions) {
    const manager = new DataFetchingManager(options)
    
    app.provide(DATA_FETCHING_KEY, manager)

    // 添加全局属性
    app.config.globalProperties.$dataFetching = manager
  }
}

/**
 * 创建数据预取管理器
 */
export function createDataFetchingManager(options?: DataFetchOptions): DataFetchingManager {
  return new DataFetchingManager(options)
}