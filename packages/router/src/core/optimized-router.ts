/**
 * 优化的路由器实现 - 减少内存占用和提升性能
 */

import type {
  NavigationGuard,
  NavigationGuardReturn,
  NavigationHookAfter,
  RouteLocationNormalized,
  RouterOptions,
} from '../types'
import { ObjectPool, StringPool } from './matcher/optimized-trie'

/**
 * 事件总线 - 优化事件监听器内存占用
 * 使用 EventTarget 替代数组存储，减少内存占用
 */
class RouterEventBus extends EventTarget {
  private listenerCounts = new Map<string, number>()
  private readonly MAX_LISTENERS = 100
  
  // 监听器池，复用事件对象
  private eventPool = new ObjectPool<CustomEvent>(
    () => new CustomEvent('router', { detail: {} }),
    (event) => {
      // 重置事件对象
      Object.keys(event.detail).forEach(key => delete event.detail[key])
    },
    10
  )
  
  override addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    const count = this.listenerCounts.get(type) || 0
    
    // 限制监听器数量，防止内存泄漏
    if (count >= this.MAX_LISTENERS) {
      console.warn(`Maximum listeners (${this.MAX_LISTENERS}) for event "${type}" reached`)
      return
    }
    
    this.listenerCounts.set(type, count + 1)
    super.addEventListener(type, callback, options)
  }
  
  override removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void {
    const count = this.listenerCounts.get(type) || 0
    if (count > 0) {
      this.listenerCounts.set(type, count - 1)
    }
    super.removeEventListener(type, callback, options)
  }
  
  emit(type: string, detail: any): void {
    const event = this.eventPool.acquire()
    Object.assign(event.detail, detail)
    
    this.dispatchEvent(new CustomEvent(type, { detail }))
    
    // 延迟释放事件对象，确保所有监听器处理完成
    setTimeout(() => {
      this.eventPool.release(event)
    }, 0)
  }
  
  clear(): void {
    this.listenerCounts.clear()
    this.eventPool.clear()
  }
}

/**
 * 导航状态管理器 - 优化状态存储
 */
class NavigationStateManager {
  // 使用 WeakMap 存储临时状态，自动垃圾回收
  private pendingNavigations = new WeakMap<RouteLocationNormalized, {
    timestamp: number
    from: RouteLocationNormalized
    resolve: (value: any) => void
    reject: (error: any) => void
  }>()
  
  // 导航历史环形缓冲区，限制大小
  private history: Array<{
    to: string // 只存储路径字符串，减少内存
    from: string
    timestamp: number
  }> = []
  private readonly MAX_HISTORY = 50
  private historyIndex = 0
  
  addNavigation(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
    // 使用环形缓冲区，避免数组无限增长
    this.history[this.historyIndex % this.MAX_HISTORY] = {
      to: to.path,
      from: from.path,
      timestamp: Date.now()
    }
    this.historyIndex++
  }
  
  setPending(
    location: RouteLocationNormalized,
    from: RouteLocationNormalized,
    resolve: (value: any) => void,
    reject: (error: any) => void
  ): void {
    this.pendingNavigations.set(location, {
      timestamp: Date.now(),
      from,
      resolve,
      reject
    })
    
    // 自动清理超时的 pending 导航
    setTimeout(() => {
      const pending = this.pendingNavigations.get(location)
      if (pending && Date.now() - pending.timestamp > 5000) {
        pending.reject(new Error('Navigation timeout'))
        this.pendingNavigations.delete(location)
      }
    }, 5000)
  }
  
  getPending(location: RouteLocationNormalized) {
    return this.pendingNavigations.get(location)
  }
  
  clearPending(location: RouteLocationNormalized): void {
    this.pendingNavigations.delete(location)
  }
  
  getRecentHistory(count = 10): Array<{ to: string; from: string; timestamp: number }> {
    const start = Math.max(0, this.historyIndex - count)
    const end = this.historyIndex
    const result = []
    
    for (let i = start; i < end; i++) {
      const item = this.history[i % this.MAX_HISTORY]
      if (item) {
        result.push(item)
      }
    }
    
    return result
  }
  
  clear(): void {
    this.history.length = 0
    this.historyIndex = 0
  }
}

/**
 * 守卫执行器 - 优化守卫执行和缓存
 */
class GuardExecutor {
  // 守卫结果缓存
  private cache = new Map<string, {
    result: NavigationGuardReturn
    timestamp: number
  }>()
  private readonly CACHE_TTL = 1000 // 1秒缓存
  private readonly MAX_CACHE_SIZE = 100
  
  // 字符串池，减少缓存键的内存占用
  private stringPool = new StringPool()
  
  async execute(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    // 生成缓存键
    const cacheKey = this.stringPool.intern(
      `${guard.name || 'anonymous'}_${to.path}_${from.path}`
    )
    
    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result
    }
    
    // 执行守卫
    const result = await this.executeGuard(guard, to, from)
    
    // 缓存结果
    this.setCacheResult(cacheKey, result)
    
    return result
  }
  
  private async executeGuard(
    guard: NavigationGuard,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): Promise<NavigationGuardReturn> {
    return new Promise((resolve, reject) => {
      let isResolved = false
      
      const next = (result?: NavigationGuardReturn) => {
        if (isResolved) {
          console.warn('Guard next() called multiple times')
          return
        }
        isResolved = true
        
        if (result === false) {
          reject(new Error('Navigation cancelled'))
        } else if (result instanceof Error) {
          reject(result)
        } else {
          resolve(result)
        }
      }
      
      // 设置超时
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          reject(new Error('Guard timeout'))
        }
      }, 3000)
      
      try {
        const guardResult = guard(to, from, next)
        
        // 处理异步守卫
        if (guardResult && typeof guardResult === 'object' && 'then' in guardResult) {
          (guardResult as Promise<NavigationGuardReturn>).then(
            (result) => {
              clearTimeout(timeout)
              if (!isResolved) {
                isResolved = true
                resolve(result)
              }
            },
            (error) => {
              clearTimeout(timeout)
              if (!isResolved) {
                isResolved = true
                reject(error)
              }
            }
          )
        } else {
          clearTimeout(timeout)
        }
      } catch (error) {
        clearTimeout(timeout)
        if (!isResolved) {
          isResolved = true
          reject(error)
        }
      }
    })
  }
  
  private setCacheResult(key: string, result: NavigationGuardReturn): void {
    // 限制缓存大小
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // 清理最旧的 25% 缓存项
      const keysToDelete = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.25))
        .map(([key]) => key)
      
      keysToDelete.forEach(key => this.cache.delete(key))
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    })
  }
  
  clearCache(): void {
    this.cache.clear()
    this.stringPool.clear()
  }
}

/**
 * 优化的路由器实现
 */
export class OptimizedRouter {
  // 使用事件总线替代数组存储监听器
  private eventBus = new RouterEventBus()
  
  // 导航状态管理
  private navigationState = new NavigationStateManager()
  
  // 守卫执行器
  private guardExecutor = new GuardExecutor()
  
  // 路由位置对象池
  private locationPool = new ObjectPool<RouteLocationNormalized>(
    () => ({
      path: '',
      name: undefined,
      params: {},
      query: {},
      hash: '',
      fullPath: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined
    } as RouteLocationNormalized),
    (location) => {
      location.path = ''
      location.name = undefined
      location.params = {}
      location.query = {}
      location.hash = ''
      location.fullPath = ''
      location.matched = []
      location.meta = {}
      location.redirectedFrom = undefined
    },
    20
  )
  
  // 内存监控
  private memoryCheckInterval?: number
  private readonly MEMORY_CHECK_INTERVAL = 30000 // 30秒
  
  constructor(_options: RouterOptions) {
    this.startMemoryMonitoring()
  }
  
  /**
   * 添加导航守卫（优化版）
   */
  beforeEach(guard: NavigationGuard): () => void {
    const wrappedGuard = (event: Event) => {
      const { to, from, next } = (event as CustomEvent).detail
      return guard(to, from, next)
    }
    
    this.eventBus.addEventListener('beforeEach', wrappedGuard)
    
    return () => {
      this.eventBus.removeEventListener('beforeEach', wrappedGuard)
    }
  }
  
  beforeResolve(guard: NavigationGuard): () => void {
    const wrappedGuard = (event: Event) => {
      const { to, from, next } = (event as CustomEvent).detail
      return guard(to, from, next)
    }
    
    this.eventBus.addEventListener('beforeResolve', wrappedGuard)
    
    return () => {
      this.eventBus.removeEventListener('beforeResolve', wrappedGuard)
    }
  }
  
  afterEach(hook: NavigationHookAfter): () => void {
    const wrappedHook = (event: Event) => {
      const { to, from, failure } = (event as CustomEvent).detail
      return hook(to, from, failure)
    }
    
    this.eventBus.addEventListener('afterEach', wrappedHook)
    
    return () => {
      this.eventBus.removeEventListener('afterEach', wrappedHook)
    }
  }
  
  // 守卫执行方法已移除

  
  /**
   * 内存监控
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return
    
    this.memoryCheckInterval = window.setInterval(() => {
      this.checkMemory()
    }, this.MEMORY_CHECK_INTERVAL)
  }
  
  private checkMemory(): void {
    if (typeof performance === 'undefined' || !('memory' in performance)) return
    
    const memory = (performance as any).memory
    const usedMemory = memory.usedJSHeapSize
    const totalMemory = memory.totalJSHeapSize
    
    const usage = usedMemory / totalMemory
    
    // 内存使用超过 80% 时触发清理
    if (usage > 0.8) {
      console.warn(`High memory usage detected: ${(usage * 100).toFixed(2)}%`)
      this.performCleanup()
    }
  }
  
  private performCleanup(): void {
    // 清理缓存
    this.guardExecutor.clearCache()
    
    // 清理导航历史
    if (this.navigationState.getRecentHistory(1).length > 0) {
      // 保留最近的导航记录
      const recent = this.navigationState.getRecentHistory(10)
      this.navigationState.clear()
      recent.forEach(item => {
        // 重新添加最近的记录
        const to = this.locationPool.acquire()
        const from = this.locationPool.acquire()
        to.path = item.to
        from.path = item.from
        this.navigationState.addNavigation(to, from)
        this.locationPool.release(to)
        this.locationPool.release(from)
      })
    }
    
    // 触发垃圾回收（如果可用）
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc()
    }
  }
  
  /**
   * 销毁路由器
   */
  destroy(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
    }
    
    this.eventBus.clear()
    this.navigationState.clear()
    this.guardExecutor.clearCache()
    this.locationPool.clear()
  }
  
  /**
   * 获取内存统计
   */
  getMemoryStats(): {
    eventListeners: number
    navigationHistory: number
    guardCache: number
    locationPool: number
  } {
    return {
      eventListeners: (Array.from(((this.eventBus as any).listenerCounts?.values?.() ?? []) as Iterable<number>) as number[]).reduce((a, b) => a + b, 0),
      navigationHistory: this.navigationState.getRecentHistory().length,
      guardCache: (this.guardExecutor as any).cache?.size ?? 0,
      locationPool: this.locationPool.getPoolSize()
    }
  }
}