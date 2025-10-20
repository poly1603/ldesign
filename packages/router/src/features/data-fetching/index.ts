/**
 * @ldesign/router 数据预取机制
 * 
 * 提供路由级数据加载、并行数据获取、数据缓存策略
 */

import type { NavigationGuard, RouteLocationNormalized, Router } from '../../types'
import { markRaw, ref, type Ref, shallowRef } from 'vue'
import { logger } from '../../utils/logger'

// ==================== 类型定义 ====================

export type DataLoader<T = any> = (
  route: RouteLocationNormalized
) => T | Promise<T>

export type DataResolver = (
  route: RouteLocationNormalized
) => Record<string, DataLoader> | Promise<Record<string, DataLoader>>

export interface DataFetchingOptions {
  /**
   * 数据加载器
   */
  loaders?: Record<string, DataLoader>
  
  /**
   * 动态数据解析器
   */
  resolver?: DataResolver
  
  /**
   * 并行加载
   */
  parallel?: boolean
  
  /**
   * 缓存配置
   */
  cache?: {
    enabled: boolean
    strategy: 'memory' | 'session' | 'local'
    ttl: number // 毫秒
    maxSize?: number
  }
  
  /**
   * 重试配置
   */
  retry?: {
    count: number
    delay: number // 毫秒
    backoff?: 'linear' | 'exponential'
  }
  
  /**
   * 超时配置
   */
  timeout?: number // 毫秒
  
  /**
   * 数据转换器
   */
  transform?: (data: any) => any
  
  /**
   * 错误处理器
   */
  onError?: (error: Error, route: RouteLocationNormalized) => void
  
  /**
   * 加载状态变更回调
   */
  onLoadingChange?: (loading: boolean) => void
  
  /**
   * 预取策略
   */
  prefetch?: {
    enabled: boolean
    routes?: string[] // 需要预取的路由名称
    delay?: number // 延迟预取
  }
}

export interface DataFetchingState {
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<Record<string, any>>
  refresh: () => Promise<void>
}

// ==================== 缓存管理 ====================

class DataCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private strategy: 'memory' | 'session' | 'local'
  private ttl: number
  private maxSize?: number
  
  constructor(options: DataFetchingOptions['cache']) {
    this.strategy = options?.strategy || 'memory'
    this.ttl = options?.ttl || 5 * 60 * 1000 // 默认5分钟
    this.maxSize = options?.maxSize
    
    // 从存储中恢复缓存
    if (this.strategy !== 'memory') {
      this.restore()
    }
  }
  
  set(key: string, data: any): void {
    // 检查缓存大小限制
    if (this.maxSize && this.cache.size >= this.maxSize) {
      // 删除最旧的缓存
      const entries = Array.from(this.cache.entries())
      const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const oldest = sorted[0]
      if (!oldest) return
      const oldestKey = oldest[0]
      this.cache.delete(oldestKey)
    }
    
    const cacheData = { data, timestamp: Date.now() }
    this.cache.set(key, cacheData)
    
    // 持久化到存储
    if (this.strategy !== 'memory') {
      this.persist()
    }
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key)
    
    if (!cached) return null
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      if (this.strategy !== 'memory') {
        this.persist()
      }
      return null
    }
    
    return cached.data
  }
  
  clear(): void {
    this.cache.clear()
    if (this.strategy !== 'memory') {
      this.persist()
    }
  }
  
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null
    return this.strategy === 'session' ? sessionStorage : localStorage
  }
  
  private persist(): void {
    const storage = this.getStorage()
    if (!storage) return
    
    const data = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      ...value,
    }))
    
    try {
      storage.setItem('router-data-cache', JSON.stringify(data))
    } catch (e) {
      logger.warn('Failed to persist data cache', e)
    }
  }
  
  private restore(): void {
    const storage = this.getStorage()
    if (!storage) return
    
    try {
      const data = storage.getItem('router-data-cache')
      if (data) {
        const parsed = JSON.parse(data)
        parsed.forEach((item: any) => {
          this.cache.set(item.key, { data: item.data, timestamp: item.timestamp })
        })
      }
    } catch (e) {
      logger.warn('Failed to restore data cache', e)
    }
  }
}

// ==================== 数据获取管理器 ====================

export class DataFetchingManager {
  private router: Router
  private options: DataFetchingOptions
  private cache: DataCache | null = null
  private loadingCount = 0
  private currentState: DataFetchingState
  private abortController: AbortController | null = null
  
  constructor(router: Router, options: DataFetchingOptions = {}) {
    this.router = router
    this.options = {
      parallel: true,
      ...options,
    }
    
    // 初始化缓存
    if (options.cache?.enabled) {
      this.cache = new DataCache(options.cache)
    }
    
    // 初始化状态
    this.currentState = {
      loading: ref(false),
      error: ref(null),
      data: shallowRef({}),
      refresh: async () => {
        const route = this.router.currentRoute.value
        await this.fetchData(route)
      },
    }
    
    // 设置路由守卫
    this.setupNavigationGuards()
    
    // 设置预取
    if (options.prefetch?.enabled) {
      this.setupPrefetch()
    }
  }
  
  /**
   * 设置导航守卫
   */
  private setupNavigationGuards(): void {
    const guard: NavigationGuard = async (to, _from, next) => {
      // 取消之前的请求
      if (this.abortController) {
        this.abortController.abort()
      }
      
      try {
        await this.fetchData(to)
        next()
      } catch (error) {
        logger.error('Data fetching failed', error)
        
        if (this.options.onError) {
          this.options.onError(error as Error, to)
        }
        
        // 决定是否继续导航
        if ((error as any).preventNavigation) {
          next(false)
        } else {
          next()
        }
      }
    }
    
    this.router.beforeResolve(guard)
  }
  
  /**
   * 设置预取
   */
  private setupPrefetch(): void {
    const { routes, delay = 1000 } = this.options.prefetch!
    
    setTimeout(() => {
      if (routes && routes.length > 0) {
        routes.forEach(routeName => {
          const route = this.router.resolve({ name: routeName })
          this.prefetchData(route)
        })
      }
    }, delay)
  }
  
  /**
   * 获取数据
   */
  async fetchData(route: RouteLocationNormalized): Promise<void> {
    // 获取数据加载器
    const loaders = await this.getLoaders(route)
    
    if (!loaders || Object.keys(loaders).length === 0) {
      return
    }
    
    // 创建新的中断控制器
    this.abortController = new AbortController()
    const { signal } = this.abortController
    
    // 更新加载状态
    this.updateLoadingState(true)
    this.currentState.error.value = null
    
    try {
      const data: Record<string, any> = {}
      
      if (this.options.parallel) {
        // 并行加载
        const entries = Object.entries(loaders)
        const promises = entries.map(async ([key, loader]) => {
          // 检查缓存
          const cacheKey = this.getCacheKey(route, key)
          const cached = this.cache?.get(cacheKey)
          
          if (cached !== null && cached !== undefined) {
            return { key, data: cached }
          }
          
          // 加载数据
          const result = await this.loadWithRetry(loader, route, signal)
          
          // 缓存数据
          if (this.cache) {
            this.cache.set(cacheKey, result)
          }
          
          return { key, data: result }
        })
        
        const results = await Promise.all(promises)
        results.forEach(({ key, data: value }) => {
          data[key] = value
        })
      } else {
        // 串行加载
        for (const [key, loader] of Object.entries(loaders)) {
          if (signal.aborted) break
          
          // 检查缓存
          const cacheKey = this.getCacheKey(route, key)
          const cached = this.cache?.get(cacheKey)
          
          if (cached !== null && cached !== undefined) {
            data[key] = cached
            continue
          }
          
          // 加载数据
          const result = await this.loadWithRetry(loader, route, signal)
          data[key] = result
          
          // 缓存数据
          if (this.cache) {
            this.cache.set(cacheKey, result)
          }
        }
      }
      
      // 转换数据
      const transformedData = this.options.transform 
        ? this.options.transform(data)
        : data
      
      // 更新状态
      this.currentState.data.value = markRaw(transformedData)
      
      // 将数据附加到路由元信息
      route.meta._data = transformedData
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        this.currentState.error.value = error as Error
        throw error
      }
    } finally {
      this.updateLoadingState(false)
      this.abortController = null
    }
  }
  
  /**
   * 预取数据
   */
  async prefetchData(route: RouteLocationNormalized): Promise<void> {
    try {
      const loaders = await this.getLoaders(route)
      
      if (!loaders || Object.keys(loaders).length === 0) {
        return
      }
      
      // 并行预取所有数据
      const promises = Object.entries(loaders).map(async ([key, loader]) => {
        const cacheKey = this.getCacheKey(route, key)
        
        // 如果已缓存，跳过
        if (this.cache?.get(cacheKey) !== null) {
          return
        }
        
        try {
          const result = await loader(route)
          
          // 缓存数据
          if (this.cache) {
            this.cache.set(cacheKey, result)
          }
        } catch (error) {
          logger.warn(`Failed to prefetch data for key "${key}"`, error)
        }
      })
      
      await Promise.all(promises)
    } catch (error) {
      logger.warn('Prefetch failed', error)
    }
  }
  
  /**
   * 获取数据加载器
   */
  private async getLoaders(
    route: RouteLocationNormalized
  ): Promise<Record<string, DataLoader> | null> {
    // 从路由元信息获取
    const metaLoaders = route.meta.loaders as Record<string, DataLoader> | undefined
    if (metaLoaders) {
      return metaLoaders
    }
    
    // 从选项获取
    if (this.options.loaders) {
      return this.options.loaders
    }
    
    // 从解析器获取
    if (this.options.resolver) {
      return await this.options.resolver(route)
    }
    
    return null
  }
  
  /**
   * 带重试的加载
   */
  private async loadWithRetry(
    loader: DataLoader,
    route: RouteLocationNormalized,
    signal: AbortSignal
  ): Promise<any> {
    const { retry, timeout } = this.options
    const maxRetries = retry?.count || 0
    const retryDelay = retry?.delay || 1000
    const backoff = retry?.backoff || 'linear'
    
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (signal.aborted) {
        throw new Error('Aborted')
      }
      
      try {
        // 创建超时Promise
        const timeoutPromise = timeout
          ? new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout')), timeout)
            })
          : null
        
        // 执行加载器
        const loadPromise = loader(route)
        
        // 等待结果或超时
        const result = timeoutPromise
          ? await Promise.race([loadPromise, timeoutPromise])
          : await loadPromise
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const delay = backoff === 'exponential'
            ? retryDelay * 2**attempt
            : retryDelay * (attempt + 1)
          
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }
  
  /**
   * 更新加载状态
   */
  private updateLoadingState(loading: boolean): void {
    if (loading) {
      this.loadingCount++
    } else {
      this.loadingCount = Math.max(0, this.loadingCount - 1)
    }
    
    const isLoading = this.loadingCount > 0
    this.currentState.loading.value = isLoading
    
    if (this.options.onLoadingChange) {
      this.options.onLoadingChange(isLoading)
    }
  }
  
  /**
   * 获取缓存键
   */
  private getCacheKey(route: RouteLocationNormalized, dataKey: string): string {
    return `${route.path}:${dataKey}:${JSON.stringify(route.params)}:${JSON.stringify(route.query)}`
  }
  
  // ==================== 公共 API ====================
  
  /**
   * 获取状态
   */
  getState(): DataFetchingState {
    return this.currentState
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache?.clear()
  }
  
  /**
   * 刷新数据
   */
  async refresh(): Promise<void> {
    await this.currentState.refresh()
  }
  
  /**
   * 获取路由数据
   */
  getData(route?: RouteLocationNormalized): Record<string, any> {
    const targetRoute = route || this.router.currentRoute.value
    return targetRoute.meta._data || this.currentState.data.value
  }
}

// ==================== Vue 组合式 API ====================

let dataManager: DataFetchingManager | null = null

/**
 * 设置数据获取管理器
 */
export function setupDataFetching(
  router: Router,
  options: DataFetchingOptions
): DataFetchingManager {
  dataManager = new DataFetchingManager(router, options)
  return dataManager
}

/**
 * 使用路由数据
 */
export function useRouteData() {
  if (!dataManager) {
    throw new Error('Data fetching not initialized. Call setupDataFetching first.')
  }
  
  const state = dataManager.getState()
  
  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    refresh: state.refresh,
    clearCache: () => dataManager!.clearCache(),
    getData: (route?: RouteLocationNormalized) => dataManager!.getData(route),
  }
}

/**
 * 定义路由数据加载器
 */
export function defineLoader<T = any>(
  loader: DataLoader<T>
): DataLoader<T> {
  return loader
}

/**
 * 定义异步组件与数据加载
 */
export function defineAsyncComponent(
  componentLoader: () => Promise<any>,
  dataLoaders?: Record<string, DataLoader>
) {
  return {
    component: componentLoader,
    meta: {
      loaders: dataLoaders,
    },
  }
}

// ==================== Vue 插件 ====================

export const DataFetchingPlugin = {
  install(app: any, options: { router: Router; config: DataFetchingOptions }) {
    const manager = setupDataFetching(options.router, options.config)
    
    // 全局属性
    app.config.globalProperties.$routeData = manager
    
    // 提供给子组件
    app.provide('routeData', manager)
  },
}