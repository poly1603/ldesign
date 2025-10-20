/**
 * @ldesign/router 路由状态管理
 *
 * 提供路由状态的集中管理和响应式更新
 */

import type { RouteLocationNormalized, Router } from '../types'
import { computed, reactive, watch } from 'vue'

/**
 * 路由历史记录项
 */
export interface RouteHistoryItem {
  route: RouteLocationNormalized
  timestamp: number
  duration?: number
  source: 'push' | 'replace' | 'go' | 'back' | 'forward'
}

/**
 * 路由状态
 */
export interface RouteState {
  /** 当前路由 */
  current: RouteLocationNormalized
  /** 上一个路由 */
  previous?: RouteLocationNormalized
  /** 导航历史 */
  history: RouteHistoryItem[]
  /** 是否正在导航 */
  isNavigating: boolean
  /** 导航错误 */
  error?: Error
  /** 加载状态 */
  isLoading: boolean
  /** 缓存的路由数据 */
  cache: Map<string, any>
}

/**
 * 路由状态管理器
 */
export class RouteStateManager {
  private router: Router
  private state: RouteState
  private maxHistorySize = 50
  private subscribers: Array<(state: RouteState) => void> = []

  constructor(router: Router) {
    this.router = router
    this.state = reactive({
      current: router.currentRoute.value,
      previous: undefined,
      history: [],
      isNavigating: false,
      error: undefined,
      isLoading: false,
      cache: new Map(),
    })

    this.setupWatchers()
  }

  /**
   * 设置监听器
   */
  private setupWatchers(): void {
    // 监听路由变化
    watch(
      () => this.router.currentRoute.value,
      (to, from) => {
        this.updateState(to, from)
      },
      { immediate: true },
    )

    // 监听导航开始
    this.router.beforeEach((_to, _from, next) => {
      this.state.isNavigating = true
      this.state.isLoading = true
      this.state.error = undefined
      next()
    })

    // 监听导航完成
    this.router.afterEach((_to, _from) => {
      this.state.isNavigating = false
      this.state.isLoading = false
    })

    // 监听导航错误
    this.router.onError((error) => {
      this.state.error = error
      this.state.isNavigating = false
      this.state.isLoading = false
    })
  }

  /**
   * 更新状态
   */
  private updateState(to: RouteLocationNormalized, from?: RouteLocationNormalized): void {
    const previousRoute = this.state.current

    this.state.current = to
    this.state.previous = previousRoute

    // 添加到历史记录
    if (from) {
      this.addToHistory(to, this.getNavigationSource())
    }

    // 通知订阅者
    this.notifySubscribers()
  }

  /**
   * 获取导航来源
   */
  private getNavigationSource(): RouteHistoryItem['source'] {
    // 简化实现，实际可以通过分析导航堆栈来确定
    return 'push'
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(route: RouteLocationNormalized, source: RouteHistoryItem['source']): void {
    const historyItem: RouteHistoryItem = {
      route,
      timestamp: Date.now(),
      source,
    }

    this.state.history.push(historyItem)

    // 限制历史记录大小
    if (this.state.history.length > this.maxHistorySize) {
      this.state.history.shift()
    }
  }

  /**
   * 获取当前状态
   */
  getState(): RouteState {
    return this.state
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute(): RouteLocationNormalized {
    return this.state.current
  }

  /**
   * 获取上一个路由
   */
  getPreviousRoute(): RouteLocationNormalized | undefined {
    return this.state.previous
  }

  /**
   * 获取导航历史
   */
  getHistory(): RouteHistoryItem[] {
    return [...this.state.history]
  }

  /**
   * 获取最近访问的路由
   */
  getRecentRoutes(limit = 10): RouteHistoryItem[] {
    return this.state.history
      .slice(-limit)
      .reverse()
  }

  /**
   * 获取访问频率最高的路由
   */
  getMostVisitedRoutes(limit = 10): Array<{ path: string, count: number, lastVisit: number }> {
    const pathCounts = new Map<string, { count: number, lastVisit: number }>()

    for (const item of this.state.history) {
      const path = item.route.path
      const existing = pathCounts.get(path)

      if (existing) {
        existing.count++
        existing.lastVisit = Math.max(existing.lastVisit, item.timestamp)
      }
      else {
        pathCounts.set(path, { count: 1, lastVisit: item.timestamp })
      }
    }

    return Array.from(pathCounts.entries())
      .map(([path, data]) => ({ path, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * 检查是否可以后退
   */
  canGoBack(): boolean {
    return this.state.history.length > 1
  }

  /**
   * 检查路由是否在历史中
   */
  isInHistory(path: string): boolean {
    return this.state.history.some(item => item.route.path === path)
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.state.history = []
  }

  /**
   * 设置路由缓存
   */
  setCache(key: string, data: any): void {
    this.state.cache.set(key, data)
  }

  /**
   * 获取路由缓存
   */
  getCache(key: string): any {
    return this.state.cache.get(key)
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.state.cache.clear()
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: (state: RouteState) => void): () => void {
    this.subscribers.push(callback)

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  /**
   * 通知订阅者
   */
  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      try {
        callback(this.state)
      }
      catch (error) {
        console.error('路由状态订阅者回调执行失败:', error)
      }
    }
  }

  /**
   * 获取状态统计信息
   */
  getStats() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const recentHistory = this.state.history.filter(item => item.timestamp > oneHourAgo)
    const dailyHistory = this.state.history.filter(item => item.timestamp > oneDayAgo)

    return {
      totalNavigations: this.state.history.length,
      recentNavigations: recentHistory.length,
      dailyNavigations: dailyHistory.length,
      uniqueRoutes: new Set(this.state.history.map(item => item.route.path)).size,
      averageNavigationsPerHour: recentHistory.length,
      cacheSize: this.state.cache.size,
      isNavigating: this.state.isNavigating,
      hasError: !!this.state.error,
    }
  }

  /**
   * 导出状态数据
   */
  exportState() {
    return {
      current: this.state.current,
      previous: this.state.previous,
      history: this.getHistory(),
      stats: this.getStats(),
    }
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.state.previous = undefined
    this.state.history = []
    this.state.isNavigating = false
    this.state.error = undefined
    this.state.isLoading = false
    this.state.cache.clear()
  }
}

/**
 * 创建路由状态管理器
 */
export function createRouteStateManager(router: Router): RouteStateManager {
  return new RouteStateManager(router)
}

/**
 * 路由状态组合式 API
 */
export function useRouteState(stateManager: RouteStateManager) {
  const state = stateManager.getState()

  return {
    // 响应式状态
    current: computed(() => state.current),
    previous: computed(() => state.previous),
    isNavigating: computed(() => state.isNavigating),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),

    // 历史记录
    history: computed(() => state.history),
    recentRoutes: computed(() => stateManager.getRecentRoutes()),
    mostVisitedRoutes: computed(() => stateManager.getMostVisitedRoutes()),

    // 工具方法
    canGoBack: computed(() => stateManager.canGoBack()),
    stats: computed(() => stateManager.getStats()),

    // 方法
    clearHistory: () => stateManager.clearHistory(),
    clearCache: () => stateManager.clearCache(),
    isInHistory: (path: string) => stateManager.isInHistory(path),
    setCache: (key: string, data: any) => stateManager.setCache(key, data),
    getCache: (key: string) => stateManager.getCache(key),
    subscribe: (callback: (state: RouteState) => void) => stateManager.subscribe(callback),
  }
}
