/**
 * @ldesign/router 状态管理集成
 *
 * 与 LDesign Engine 状态管理器的深度集成
 */

import type { RouteLocationNormalized, Router } from '../types'

// ==================== 状态管理接口 ====================

/**
 * 路由状态接口
 */
export interface RouterState {
  /** 当前路由 */
  currentRoute: RouteLocationNormalized
  /** 路由历史 */
  history: RouteLocationNormalized[]
  /** 前进历史 */
  forwardHistory: RouteLocationNormalized[]
  /** 导航状态 */
  isNavigating: boolean
  /** 错误状态 */
  error: Error | null
  /** 加载状态 */
  isLoading: boolean
}

/**
 * 路由状态管理器配置
 */
export interface RouterStateConfig {
  /** 是否启用历史记录 */
  enableHistory?: boolean
  /** 历史记录最大长度 */
  maxHistoryLength?: number
  /** 是否持久化状态 */
  persistent?: boolean
  /** 持久化键名 */
  persistentKey?: string
  /** 是否启用状态同步 */
  enableSync?: boolean
}

// ==================== 状态管理器 ====================

/**
 * 路由状态管理器
 */
export class RouterStateManager {
  private stateManager: any // Engine 状态管理器
  private router: Router
  private config: RouterStateConfig
  private unsubscribers: Array<() => void> = []

  constructor(
    stateManager: any,
    router: Router,
    config: RouterStateConfig = {},
  ) {
    this.stateManager = stateManager
    this.router = router
    this.config = {
      enableHistory: true,
      maxHistoryLength: 50,
      persistent: false,
      persistentKey: 'router-state',
      enableSync: true,
      ...config,
    }

    this.initializeState()
    this.setupRouterListeners()
    this.setupStateSync()
  }

  /**
   * 初始化状态
   */
  private initializeState(): void {
    const initialState: RouterState = {
      currentRoute: this.router.currentRoute.value,
      history: [],
      forwardHistory: [],
      isNavigating: false,
      error: null,
      isLoading: false,
    }

    // 设置初始状态
    this.stateManager.set('router', initialState)

    // 如果启用持久化，尝试恢复状态
    if (this.config?.persistent) {
      this.restorePersistedState()
    }
  }

  /**
   * 设置路由监听器
   */
  private setupRouterListeners(): void {
    // 监听路由变化
    const unsubscribeRoute = this.router.afterEach((to, from) => {
      this.updateCurrentRoute(to)

      if (this.config?.enableHistory) {
        this.addToHistory(from)
      }

      this.setNavigating(false)
      this.clearError()
    })

    // 监听导航开始
    const unsubscribeBeforeEach = this.router.beforeEach((_to, _from, next) => {
      this.setNavigating(true)
      next()
    })

    // 监听错误
    const unsubscribeError = this.router.onError((error) => {
      this.setError(error)
      this.setNavigating(false)
    })

    this.unsubscribers.push(
      unsubscribeRoute,
      unsubscribeBeforeEach,
      unsubscribeError,
    )
  }

  /**
   * 设置状态同步
   */
  private setupStateSync(): void {
    if (!this.config?.enableSync)
      return

    // 监听状态变化并持久化
    if (this.config?.persistent) {
      const unsubscribe = this.stateManager.subscribe(
        'router',
        (newState: RouterState) => {
          this.persistState(newState)
        },
      )
      this.unsubscribers.push(unsubscribe)
    }
  }

  /**
   * 更新当前路由
   */
  private updateCurrentRoute(route: RouteLocationNormalized): void {
    this.stateManager.set('router.currentRoute', route)
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(route: RouteLocationNormalized): void {
    const currentHistory = this.stateManager.get('router.history') || []
    const newHistory = [route, ...currentHistory]

    // 限制历史记录长度
    const maxLength = this.config?.maxHistoryLength
    if (maxLength && newHistory.length > maxLength) {
      newHistory.splice(maxLength)
    }

    this.stateManager.set('router.history', newHistory)

    // 清空前进历史
    this.stateManager.set('router.forwardHistory', [])
  }

  /**
   * 设置导航状态
   */
  private setNavigating(isNavigating: boolean): void {
    this.stateManager.set('router.isNavigating', isNavigating)
  }

  /**
   * 设置错误状态
   */
  private setError(error: Error | null): void {
    this.stateManager.set('router.error', error)
  }

  /**
   * 清除错误状态
   */
  private clearError(): void {
    this.setError(null)
  }

  /**
   * 设置加载状态
   */
  setLoading(isLoading: boolean): void {
    this.stateManager.set('router.isLoading', isLoading)
  }

  /**
   * 持久化状态
   */
  private persistState(state: RouterState): void {
    try {
      const persistentData = {
        currentRoute: state.currentRoute,
        history: state.history.slice(0, 10), // 只保存最近10条历史
        timestamp: Date.now(),
      }

      const persistentKey = this.config?.persistentKey
      if (persistentKey) {
        localStorage.setItem(persistentKey, JSON.stringify(persistentData))
      }
    }
    catch (error) {
      console.warn('Failed to persist router state:', error)
    }
  }

  /**
   * 恢复持久化状态
   */
  private restorePersistedState(): void {
    try {
      const persistentKey = this.config?.persistentKey
      if (!persistentKey) return
      const persistentData = localStorage.getItem(persistentKey)
      if (!persistentData)
        return

      const data = JSON.parse(persistentData)
      const now = Date.now()

      // 检查数据是否过期（24小时）
      if (now - data.timestamp > 24 * 60 * 60 * 1000) {
        if (persistentKey) {
          localStorage.removeItem(persistentKey)
        }
        return
      }

      // 恢复历史记录
      if (data.history && Array.isArray(data.history)) {
        this.stateManager.set('router.history', data.history)
      }
    }
    catch (error) {
      console.warn('Failed to restore router state:', error)
      const persistentKey = this.config?.persistentKey
      if (persistentKey) {
        localStorage.removeItem(persistentKey)
      }
    }
  }

  /**
   * 获取路由状态
   */
  getState(): RouterState {
    return this.stateManager.get('router') || {}
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute(): RouteLocationNormalized | undefined {
    return this.stateManager.get('router.currentRoute')
  }

  /**
   * 获取历史记录
   */
  getHistory(): RouteLocationNormalized[] {
    return this.stateManager.get('router.history') || []
  }

  /**
   * 获取前进历史
   */
  getForwardHistory(): RouteLocationNormalized[] {
    return this.stateManager.get('router.forwardHistory') || []
  }

  /**
   * 是否可以后退
   */
  canGoBack(): boolean {
    return this.getHistory().length > 0
  }

  /**
   * 是否可以前进
   */
  canGoForward(): boolean {
    return this.getForwardHistory().length > 0
  }

  /**
   * 后退
   */
  goBack(): void {
    const history = this.getHistory()
    if (history.length === 0)
      return

    const previousRoute = history[0]
    const currentRoute = this.getCurrentRoute()

    if (!currentRoute || !previousRoute) {
      console.warn('No current route or previous route available for navigation')
      return
    }

    // 更新历史记录
    this.stateManager.set('router.history', history.slice(1))

    // 添加到前进历史
    const forwardHistory = this.getForwardHistory()
    this.stateManager.set('router.forwardHistory', [
      currentRoute,
      ...forwardHistory,
    ])

    // 导航到上一个路由
    this.router.push(previousRoute)
  }

  /**
   * 前进
   */
  goForward(): void {
    const forwardHistory = this.getForwardHistory()
    if (forwardHistory.length === 0)
      return

    const nextRoute = forwardHistory[0]
    const currentRoute = this.getCurrentRoute()

    if (!currentRoute || !nextRoute) {
      console.warn('No current route or next route available for navigation')
      return
    }

    // 更新前进历史
    this.stateManager.set('router.forwardHistory', forwardHistory.slice(1))

    // 添加到历史记录
    const history = this.getHistory()
    this.stateManager.set('router.history', [currentRoute, ...history])

    // 导航到下一个路由
    this.router.push(nextRoute)
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.stateManager.set('router.history', [])
    this.stateManager.set('router.forwardHistory', [])
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    // 取消所有订阅
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
    this.unsubscribers = []

    // 清除状态
    this.stateManager.remove('router')
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建路由状态管理器
 */
export function createRouterStateManager(
  stateManager: any,
  router: Router,
  config?: RouterStateConfig,
): RouterStateManager {
  return new RouterStateManager(stateManager, router, config)
}

// ==================== 默认导出 ====================

export default {
  RouterStateManager,
  createRouterStateManager,
}
