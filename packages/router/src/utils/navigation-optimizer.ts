/**
 * @ldesign/router 导航优化器
 *
 * 提供导航节流、防抖和性能监控功能
 */

// ==================== 导航节流器 ====================

/**
 * 导航节流器配置
 */
export interface NavigationThrottlerOptions {
  /** 最小导航间隔（毫秒） */
  minInterval?: number
  /** 是否记录被节流的导航 */
  logThrottled?: boolean
}

/**
 * 导航节流器
 * 防止过快的连续导航，提高性能和用户体验
 */
export class NavigationThrottler {
  private lastNavigation: number = 0
  private minInterval: number
  private logThrottled: boolean
  private throttledCount: number = 0

  constructor(options: NavigationThrottlerOptions = {}) {
    this.minInterval = options.minInterval ?? 50 // 默认50ms
    this.logThrottled = options.logThrottled ?? false
  }

  /**
   * 检查是否应该执行导航
   */
  shouldNavigate(path?: string): boolean {
    const now = Date.now()
    const timeSinceLastNav = now - this.lastNavigation

    if (timeSinceLastNav < this.minInterval) {
      this.throttledCount++
      if (this.logThrottled) {
        console.debug(
          `导航被节流: ${path ?? 'unknown'}, ` +
          `距离上次导航 ${timeSinceLastNav}ms (最小间隔: ${this.minInterval}ms)`
        )
      }
      return false
    }

    this.lastNavigation = now
    return true
  }

  /**
   * 重置节流状态
   */
  reset(): void {
    this.lastNavigation = 0
    this.throttledCount = 0
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      throttledCount: this.throttledCount,
      minInterval: this.minInterval,
      lastNavigation: this.lastNavigation,
    }
  }

  /**
   * 更新最小间隔
   */
  setMinInterval(interval: number): void {
    this.minInterval = Math.max(0, interval)
  }
}

// ==================== 导航防抖器 ====================

/**
 * 导航防抖器
 * 在用户停止操作后才执行导航
 */
export class NavigationDebouncer {
  private timeoutId: number | null = null
  private delay: number

  constructor(delay: number = 300) {
    this.delay = delay
  }

  /**
   * 防抖导航
   */
  debounce(callback: () => void): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = window.setTimeout(() => {
      callback()
      this.timeoutId = null
    }, this.delay)
  }

  /**
   * 取消待执行的导航
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * 立即执行待执行的导航
   */
  flush(callback?: () => void): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
      callback?.()
    }
  }
}

// ==================== 导航性能监控 ====================

/**
 * 导航性能指标
 */
export interface NavigationMetrics {
  /** 路径 */
  path: string
  /** 导航开始时间 */
  startTime: number
  /** 导航结束时间 */
  endTime: number
  /** 总耗时（毫秒） */
  duration: number
  /** 守卫执行时间 */
  guardTime: number
  /** 组件加载时间 */
  componentTime: number
  /** 是否成功 */
  success: boolean
  /** 错误信息（如果失败） */
  error?: string
}

/**
 * 导航性能监控器
 */
export class NavigationPerformanceMonitor {
  private metrics: NavigationMetrics[] = []
  private maxMetrics: number = 100 // 最多保留100条记录
  private slowNavigationThreshold: number = 500 // 慢导航阈值（毫秒）
  private onSlowNavigation?: (metrics: NavigationMetrics) => void

  constructor(options?: {
    maxMetrics?: number
    slowNavigationThreshold?: number
    onSlowNavigation?: (metrics: NavigationMetrics) => void
  }) {
    if (options?.maxMetrics) this.maxMetrics = options.maxMetrics
    if (options?.slowNavigationThreshold) this.slowNavigationThreshold = options.slowNavigationThreshold
    this.onSlowNavigation = options?.onSlowNavigation
  }

  /**
   * 记录导航指标
   */
  recordNavigation(metrics: NavigationMetrics): void {
    this.metrics.push(metrics)

    // 限制记录数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // 检查是否为慢导航
    if (metrics.duration > this.slowNavigationThreshold && metrics.success) {
      this.onSlowNavigation?.(metrics)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `慢导航检测: ${metrics.path} 耗时 ${metrics.duration}ms ` +
          `(阈值: ${this.slowNavigationThreshold}ms)`
        )
      }
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): NavigationMetrics[] {
    return [...this.metrics]
  }

  /**
   * 获取统计信息
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        slowNavigations: 0,
        successRate: 0,
      }
    }

    const durations = this.metrics.map(m => m.duration)
    const successCount = this.metrics.filter(m => m.success).length

    return {
      count: this.metrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      slowNavigations: this.metrics.filter(m => m.duration > this.slowNavigationThreshold).length,
      successRate: successCount / this.metrics.length,
    }
  }

  /**
   * 获取最慢的N次导航
   */
  getSlowestNavigations(count: number = 10): NavigationMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count)
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = []
  }
}

// ==================== 守卫执行优化器 ====================

/**
 * 守卫执行计时器
 */
export class GuardExecutionTimer {
  private timers = new Map<string, number>()

  start(guardName: string): void {
    this.timers.set(guardName, performance.now())
  }

  end(guardName: string): number {
    const startTime = this.timers.get(guardName)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.timers.delete(guardName)
    return duration
  }

  getAll(): Map<string, number> {
    return new Map(this.timers)
  }

  clear(): void {
    this.timers.clear()
  }
}

/**
 * 并行守卫执行器
 * 将独立的守卫并行执行以提高性能
 */
export class ParallelGuardExecutor {
  /**
   * 并行执行守卫数组
   * @param guards 守卫函数数组
   * @returns 第一个拒绝的结果，或所有通过时返回 true
   */
  async executeInParallel<T>(
    guards: Array<() => Promise<T | false> | T | false>
  ): Promise<T | false | true> {
    if (guards.length === 0) return true

    // 并行执行所有守卫
    const results = await Promise.all(
      guards.map(guard =>
        Promise.resolve(guard()).catch(error => {
          console.error('Guard execution error:', error)
          return false
        })
      )
    )

    // 查找第一个拒绝的结果
    const rejection = results.find(r => r === false || (r !== true && r !== undefined))
    return rejection !== undefined ? rejection : true
  }

  /**
   * 串行执行守卫数组（保持原有顺序）
   */
  async executeInSeries<T>(
    guards: Array<() => Promise<T | false> | T | false>
  ): Promise<T | false | true> {
    for (const guard of guards) {
      try {
        const result = await Promise.resolve(guard())
        if (result === false || (result !== true && result !== undefined)) {
          return result
        }
      }
      catch (error) {
        console.error('Guard execution error:', error)
        return false
      }
    }
    return true
  }
}

// ==================== 导航队列管理器 ====================

/**
 * 导航队列项
 */
interface NavigationQueueItem {
  id: string
  path: string
  timestamp: number
  priority: number
  execute: () => Promise<void>
}

/**
 * 导航队列管理器
 * 管理待执行的导航，支持优先级和取消
 */
export class NavigationQueueManager {
  private queue: NavigationQueueItem[] = []
  private executing: boolean = false
  private currentId: string | null = null

  /**
   * 添加导航到队列
   */
  enqueue(item: Omit<NavigationQueueItem, 'id' | 'timestamp'>): string {
    const id = this.generateId()
    const queueItem: NavigationQueueItem = {
      ...item,
      id,
      timestamp: Date.now(),
    }

    // 按优先级插入
    const insertIndex = this.queue.findIndex(q => q.priority < item.priority)
    if (insertIndex === -1) {
      this.queue.push(queueItem)
    }
    else {
      this.queue.splice(insertIndex, 0, queueItem)
    }

    // 如果没有正在执行的导航，立即开始执行
    if (!this.executing) {
      this.processQueue()
    }

    return id
  }

  /**
   * 取消队列中的导航
   */
  cancel(id: string): boolean {
    // 不能取消正在执行的导航
    if (this.currentId === id) {
      return false
    }

    const index = this.queue.findIndex(item => item.id === id)
    if (index !== -1) {
      this.queue.splice(index, 1)
      return true
    }

    return false
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.executing || this.queue.length === 0) {
      return
    }

    this.executing = true

    while (this.queue.length > 0) {
      const item = this.queue.shift()
      if (!item) break

      this.currentId = item.id

      try {
        await item.execute()
      }
      catch (error) {
        console.error(`Navigation queue execution error for ${item.path}:`, error)
      }
    }

    this.currentId = null
    this.executing = false
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}

// ==================== 导出工具函数 ====================

/**
 * 创建导航优化器实例
 */
export function createNavigationOptimizer(options?: {
  throttle?: NavigationThrottlerOptions
  performanceMonitoring?: boolean
  queueManagement?: boolean
}) {
  return {
    throttler: new NavigationThrottler(options?.throttle),
    debouncer: new NavigationDebouncer(),
    performanceMonitor: options?.performanceMonitoring !== false
      ? new NavigationPerformanceMonitor()
      : undefined,
    queueManager: options?.queueManagement === true
      ? new NavigationQueueManager()
      : undefined,
    guardExecutor: new ParallelGuardExecutor(),
  }
}
