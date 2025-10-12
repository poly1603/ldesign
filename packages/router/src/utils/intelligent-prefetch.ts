/**
 * @ldesign/router 智能预取系统
 * 
 * 基于用户行为和网络条件智能预取路由资源
 */

import type { Router, RouteLocationNormalized, RouteRecordNormalized } from '../types'

/**
 * 预取优先级
 */
export enum PrefetchPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  IDLE = 'idle',
}

/**
 * 网络条件
 */
export enum NetworkQuality {
  FAST = 'fast',
  NORMAL = 'normal',
  SLOW = 'slow',
  OFFLINE = 'offline',
}

/**
 * 预取配置
 */
export interface IntelligentPrefetchConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大并发数 */
  maxConcurrency?: number
  /** 网络质量阈值 */
  networkThreshold?: NetworkQuality
  /** 自动预取相关路由 */
  autoRelated?: boolean
  /** 预取超时时间（毫秒） */
  timeout?: number
  /** 错误重试次数 */
  retryCount?: number
  /** 排除路径模式 */
  exclude?: (RegExp | string)[]
  /** 预取回调 */
  onPrefetch?: (route: string, success: boolean) => void
}

/**
 * 路由访问历史记录
 */
interface RouteHistory {
  path: string
  count: number
  lastVisited: number
  transitions: Map<string, number> // 转移概率
}

/**
 * 智能预取管理器
 * 优化：减少内存占用，提高预测准确性
 */
export class IntelligentPrefetchManager {
  private router: Router
  private config: Required<IntelligentPrefetchConfig>
  private prefetching = new Set<string>()
  private prefetched = new Set<string>()
  private history = new Map<string, RouteHistory>()
  private networkQuality: NetworkQuality = NetworkQuality.NORMAL
  private observer: IntersectionObserver | null = null
  private idleHandle: number | null = null
  
  constructor(router: Router, config: IntelligentPrefetchConfig = {}) {
    this.router = router
    this.config = {
      enabled: config.enabled ?? true,
      maxConcurrency: config.maxConcurrency ?? 2,
      networkThreshold: config.networkThreshold ?? NetworkQuality.SLOW,
      autoRelated: config.autoRelated ?? true,
      timeout: config.timeout ?? 5000,
      retryCount: config.retryCount ?? 2,
      exclude: config.exclude ?? [],
      onPrefetch: config.onPrefetch ?? (() => {}),
    }
    
    if (this.config.enabled) {
      this.initialize()
    }
  }
  
  /**
   * 初始化预取系统
   */
  private initialize(): void {
    // 监测网络质量
    this.detectNetworkQuality()
    
    // 监听路由变化，记录访问历史
    this.router.afterEach((to) => {
      this.recordHistory(to)
      
      if (this.config.autoRelated) {
        this.prefetchRelatedRoutes(to)
      }
    })
    
    // 设置 Intersection Observer 监听链接可见性
    if (typeof IntersectionObserver !== 'undefined') {
      this.setupIntersectionObserver()
    }
    
    // 设置空闲时预取
    if (typeof requestIdleCallback !== 'undefined') {
      this.setupIdlePrefetch()
    }
  }
  
  /**
   * 检测网络质量
   */
  private detectNetworkQuality(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateQuality = () => {
        const effectiveType = connection.effectiveType
        
        switch (effectiveType) {
          case '4g':
            this.networkQuality = NetworkQuality.FAST
            break
          case '3g':
            this.networkQuality = NetworkQuality.NORMAL
            break
          case '2g':
          case 'slow-2g':
            this.networkQuality = NetworkQuality.SLOW
            break
          default:
            this.networkQuality = NetworkQuality.NORMAL
        }
      }
      
      updateQuality()
      connection.addEventListener('change', updateQuality)
    }
  }
  
  /**
   * 记录访问历史
   */
  private recordHistory(route: RouteLocationNormalized): void {
    const path = route.path
    const now = Date.now()
    
    if (!this.history.has(path)) {
      this.history.set(path, {
        path,
        count: 0,
        lastVisited: now,
        transitions: new Map(),
      })
    }
    
    const record = this.history.get(path)!
    record.count++
    record.lastVisited = now
    
    // 限制历史记录大小（优化内存）
    if (this.history.size > 50) {
      // 删除最少访问的记录
      let minCount = Infinity
      let minPath = ''
      
      for (const [p, r] of this.history) {
        if (r.count < minCount && p !== path) {
          minCount = r.count
          minPath = p
        }
      }
      
      if (minPath) {
        this.history.delete(minPath)
      }
    }
  }
  
  /**
   * 预取相关路由
   */
  private async prefetchRelatedRoutes(route: RouteLocationNormalized): Promise<void> {
    // 获取可能的下一个路由
    const candidates = this.predictNextRoutes(route)
    
    // 根据优先级预取
    for (const candidate of candidates.slice(0, this.config.maxConcurrency)) {
      await this.prefetch(candidate.path, candidate.priority)
    }
  }
  
  /**
   * 预测下一个可能访问的路由
   */
  private predictNextRoutes(currentRoute: RouteLocationNormalized): Array<{ path: string; priority: PrefetchPriority }> {
    const predictions: Array<{ path: string; priority: PrefetchPriority; score: number }> = []
    
    // 1. 基于历史转移概率预测
    const currentHistory = this.history.get(currentRoute.path)
    if (currentHistory?.transitions.size > 0) {
      for (const [nextPath, count] of currentHistory.transitions) {
        predictions.push({
          path: nextPath,
          priority: PrefetchPriority.HIGH,
          score: count / currentHistory.count,
        })
      }
    }
    
    // 2. 子路由预测
    const routes = this.router.getRoutes()
    for (const route of routes) {
      if (route.path.startsWith(currentRoute.path + '/')) {
        predictions.push({
          path: route.path,
          priority: PrefetchPriority.NORMAL,
          score: 0.5,
        })
      }
    }
    
    // 3. 兄弟路由预测
    const parentPath = currentRoute.path.substring(0, currentRoute.path.lastIndexOf('/'))
    if (parentPath) {
      for (const route of routes) {
        const routeParent = route.path.substring(0, route.path.lastIndexOf('/'))
        if (routeParent === parentPath && route.path !== currentRoute.path) {
          predictions.push({
            path: route.path,
            priority: PrefetchPriority.LOW,
            score: 0.3,
          })
        }
      }
    }
    
    // 排序并返回前几个
    return predictions
      .sort((a, b) => b.score - a.score)
      .filter(p => !this.prefetched.has(p.path) && !this.isExcluded(p.path))
  }
  
  /**
   * 预取路由
   */
  async prefetch(path: string, priority: PrefetchPriority = PrefetchPriority.NORMAL): Promise<void> {
    // 检查网络条件
    if (!this.shouldPrefetch(priority)) {
      return
    }
    
    // 避免重复预取
    if (this.prefetched.has(path) || this.prefetching.has(path)) {
      return
    }
    
    // 检查是否被排除
    if (this.isExcluded(path)) {
      return
    }
    
    this.prefetching.add(path)
    
    try {
      const route = this.router.resolve(path)
      
      // 预取组件
      await this.prefetchComponent(route)
      
      this.prefetched.add(path)
      this.config.onPrefetch(path, true)
    } catch (error) {
      console.warn(`Failed to prefetch ${path}:`, error)
      this.config.onPrefetch(path, false)
    } finally {
      this.prefetching.delete(path)
    }
  }
  
  /**
   * 预取路由组件
   */
  private async prefetchComponent(route: RouteLocationNormalized): Promise<void> {
    const promises: Promise<any>[] = []
    
    for (const record of route.matched) {
      if (record.components) {
        for (const component of Object.values(record.components)) {
          if (typeof component === 'function' && !(component as any).__prefetched) {
            promises.push(
              Promise.race([
                (component as () => Promise<any>)(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Prefetch timeout')), this.config.timeout)
                ),
              ]).then(() => {
                (component as any).__prefetched = true
              })
            )
          }
        }
      }
    }
    
    await Promise.all(promises)
  }
  
  /**
   * 检查是否应该预取
   */
  private shouldPrefetch(priority: PrefetchPriority): boolean {
    if (!this.config.enabled) {
      return false
    }
    
    // 检查并发限制
    if (this.prefetching.size >= this.config.maxConcurrency) {
      return false
    }
    
    // 根据网络质量和优先级决定
    const qualityOrder = [NetworkQuality.FAST, NetworkQuality.NORMAL, NetworkQuality.SLOW, NetworkQuality.OFFLINE]
    const priorityOrder = [PrefetchPriority.HIGH, PrefetchPriority.NORMAL, PrefetchPriority.LOW, PrefetchPriority.IDLE]
    
    const qualityIndex = qualityOrder.indexOf(this.networkQuality)
    const thresholdIndex = qualityOrder.indexOf(this.config.networkThreshold)
    const priorityIndex = priorityOrder.indexOf(priority)
    
    // 网络质量越好，可以预取的优先级越低
    return qualityIndex <= thresholdIndex || priorityIndex === 0
  }
  
  /**
   * 检查路径是否被排除
   */
  private isExcluded(path: string): boolean {
    return this.config.exclude.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(path)
      }
      return path.includes(pattern)
    })
  }
  
  /**
   * 设置 Intersection Observer
   */
  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement
            const href = link.getAttribute('href')
            
            if (href && href.startsWith('/')) {
              this.prefetch(href, PrefetchPriority.LOW)
            }
          }
        }
      },
      {
        rootMargin: '50px',
      }
    )
    
    // 监听所有路由链接
    this.observeLinks()
  }
  
  /**
   * 监听链接
   */
  observeLinks(): void {
    if (!this.observer) return
    
    const links = document.querySelectorAll('a[href^="/"]')
    links.forEach(link => this.observer!.observe(link))
  }
  
  /**
   * 设置空闲时预取
   */
  private setupIdlePrefetch(): void {
    const idleCallback = () => {
      // 获取热门路由
      const hotRoutes = Array.from(this.history.entries())
        .filter(([path]) => !this.prefetched.has(path))
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 3)
      
      // 空闲时预取热门路由
      for (const [path] of hotRoutes) {
        this.prefetch(path, PrefetchPriority.IDLE)
      }
      
      // 继续下一次空闲预取
      this.idleHandle = requestIdleCallback(idleCallback, { timeout: 2000 })
    }
    
    this.idleHandle = requestIdleCallback(idleCallback, { timeout: 2000 })
  }
  
  /**
   * 手动预取路由列表
   */
  async prefetchRoutes(paths: string[], priority: PrefetchPriority = PrefetchPriority.NORMAL): Promise<void> {
    const promises = paths.map(path => this.prefetch(path, priority))
    await Promise.all(promises)
  }
  
  /**
   * 获取预取统计
   */
  getStats(): {
    prefetched: number
    prefetching: number
    historySize: number
    networkQuality: NetworkQuality
  } {
    return {
      prefetched: this.prefetched.size,
      prefetching: this.prefetching.size,
      historySize: this.history.size,
      networkQuality: this.networkQuality,
    }
  }
  
  /**
   * 清理资源
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    if (this.idleHandle) {
      cancelIdleCallback(this.idleHandle)
      this.idleHandle = null
    }
    
    this.prefetching.clear()
    this.prefetched.clear()
    this.history.clear()
  }
}

/**
 * 创建智能预取管理器
 */
export function createIntelligentPrefetch(
  router: Router,
  config?: IntelligentPrefetchConfig
): IntelligentPrefetchManager {
  return new IntelligentPrefetchManager(router, config)
}