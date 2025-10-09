/**
 * 智能预加载模块
 * 基于用户行为模式和优先级智能预加载数据
 * 
 * @module SmartPreloader
 */

/**
 * 预加载优先级
 */
export enum PreloadPriority {
  /** 高优先级 - 立即加载 */
  HIGH = 'high',
  /** 中优先级 - 空闲时加载 */
  MEDIUM = 'medium',
  /** 低优先级 - 延迟加载 */
  LOW = 'low'
}

/**
 * 预加载策略
 */
export enum PreloadStrategy {
  /** 预测性预加载 - 基于用户行为模式 */
  PREDICTIVE = 'predictive',
  /** 路由预加载 - 基于路由变化 */
  ROUTE_BASED = 'route-based',
  /** 时间预加载 - 基于时间触发 */
  TIME_BASED = 'time-based',
  /** 可见性预加载 - 基于元素可见性 */
  VISIBILITY = 'visibility'
}

/**
 * 预加载任务
 */
export interface PreloadTask<T = any> {
  /** 任务ID */
  id: string
  /** 任务名称 */
  name: string
  /** 加载函数 */
  loader: () => Promise<T>
  /** 优先级 */
  priority: PreloadPriority
  /** 策略 */
  strategy: PreloadStrategy
  /** 依赖任务 */
  dependencies?: string[]
  /** 缓存时间（毫秒） */
  cacheDuration?: number
  /** 重试次数 */
  retries?: number
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 预加载结果
 */
export interface PreloadResult<T = any> {
  /** 任务ID */
  id: string
  /** 数据 */
  data: T | null
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: Error
  /** 加载时间（毫秒） */
  loadTime: number
  /** 缓存时间戳 */
  cachedAt?: number
}

/**
 * 用户行为模式
 */
interface BehaviorPattern {
  /** 路由路径 */
  route: string
  /** 访问次数 */
  count: number
  /** 最后访问时间 */
  lastVisit: number
  /** 平均停留时间 */
  avgDuration: number
  /** 下一步路由概率 */
  nextRoutes: Map<string, number>
}

/**
 * 智能预加载器
 */
export class SmartPreloader {
  private tasks = new Map<string, PreloadTask>()
  private results = new Map<string, PreloadResult>()
  private queue: PreloadTask[] = []
  private loading = new Set<string>()
  private patterns = new Map<string, BehaviorPattern>()
  private currentRoute = ''
  private routeStartTime = 0

  /**
   * 注册预加载任务
   */
  register<T = any>(task: PreloadTask<T>): void {
    this.tasks.set(task.id, task)
  }

  /**
   * 批量注册任务
   */
  registerBatch(tasks: PreloadTask[]): void {
    tasks.forEach(task => this.register(task))
  }

  /**
   * 取消注册任务
   */
  unregister(taskId: string): void {
    this.tasks.delete(taskId)
    this.results.delete(taskId)
  }

  /**
   * 预加载任务
   */
  async preload(taskId: string): Promise<PreloadResult | null> {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.warn(`Task ${taskId} not found`)
      return null
    }

    // 检查缓存
    const cached = this.getCached(taskId)
    if (cached) return cached

    // 检查是否正在加载
    if (this.loading.has(taskId)) {
      return this.waitForLoad(taskId)
    }

    // 检查依赖
    if (task.dependencies && task.dependencies.length > 0) {
      await Promise.all(task.dependencies.map(dep => this.preload(dep)))
    }

    // 执行加载
    return this.executeLoad(task)
  }

  /**
   * 批量预加载
   */
  async preloadBatch(taskIds: string[]): Promise<PreloadResult[]> {
    return Promise.all(taskIds.map(id => this.preload(id))) as Promise<PreloadResult[]>
  }

  /**
   * 根据优先级预加载
   */
  async preloadByPriority(priority: PreloadPriority): Promise<void> {
    const tasks = Array.from(this.tasks.values())
      .filter(task => task.priority === priority)
      .sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority))

    for (const task of tasks) {
      await this.preload(task.id)
    }
  }

  /**
   * 智能预加载 - 基于用户行为模式
   */
  async smartPreload(currentRoute: string): Promise<void> {
    // 更新行为模式
    this.updatePattern(currentRoute)

    // 获取预测的下一步路由
    const predictedRoutes = this.predictNextRoutes(currentRoute)

    // 预加载相关任务
    const tasks = Array.from(this.tasks.values())
      .filter(task => {
        if (task.strategy === PreloadStrategy.PREDICTIVE) {
          return predictedRoutes.some(route => task.name.includes(route))
        }
        return false
      })

    // 根据优先级排序
    tasks.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority))

    // 高优先级立即加载
    const highPriority = tasks.filter(t => t.priority === PreloadPriority.HIGH)
    await Promise.all(highPriority.map(t => this.preload(t.id)))

    // 中优先级空闲时加载
    const mediumPriority = tasks.filter(t => t.priority === PreloadPriority.MEDIUM)
    this.scheduleIdleLoad(mediumPriority)

    // 低优先级延迟加载
    const lowPriority = tasks.filter(t => t.priority === PreloadPriority.LOW)
    this.scheduleDelayedLoad(lowPriority)
  }

  /**
   * 获取预加载结果
   */
  getResult<T = any>(taskId: string): PreloadResult<T> | null {
    return this.results.get(taskId) as PreloadResult<T> || null
  }

  /**
   * 清除缓存
   */
  clearCache(taskId?: string): void {
    if (taskId) {
      this.results.delete(taskId)
    } else {
      this.results.clear()
    }
  }

  /**
   * 执行加载
   */
  private async executeLoad<T = any>(task: PreloadTask<T>): Promise<PreloadResult<T>> {
    this.loading.add(task.id)
    const startTime = Date.now()

    try {
      // 设置超时
      const timeout = task.timeout || 30000
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout)
      })

      // 执行加载
      const data = await Promise.race([task.loader(), timeoutPromise])
      const loadTime = Date.now() - startTime

      const result: PreloadResult<T> = {
        id: task.id,
        data,
        success: true,
        loadTime,
        cachedAt: Date.now()
      }

      this.results.set(task.id, result)
      this.loading.delete(task.id)

      return result
    } catch (error) {
      const loadTime = Date.now() - startTime
      const result: PreloadResult<T> = {
        id: task.id,
        data: null,
        success: false,
        error: error as Error,
        loadTime
      }

      // 重试
      if (task.retries && task.retries > 0) {
        task.retries--
        return this.executeLoad(task)
      }

      this.results.set(task.id, result)
      this.loading.delete(task.id)

      return result
    }
  }

  /**
   * 等待加载完成
   */
  private async waitForLoad(taskId: string): Promise<PreloadResult | null> {
    return new Promise(resolve => {
      const check = () => {
        if (!this.loading.has(taskId)) {
          resolve(this.results.get(taskId) || null)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  /**
   * 获取缓存结果
   */
  private getCached(taskId: string): PreloadResult | null {
    const result = this.results.get(taskId)
    if (!result || !result.success) return null

    const task = this.tasks.get(taskId)
    if (!task || !task.cacheDuration) return result

    const now = Date.now()
    if (result.cachedAt && now - result.cachedAt < task.cacheDuration) {
      return result
    }

    return null
  }

  /**
   * 更新行为模式
   */
  private updatePattern(route: string): void {
    const now = Date.now()

    // 更新上一个路由的停留时间
    if (this.currentRoute) {
      const pattern = this.patterns.get(this.currentRoute)
      if (pattern) {
        const duration = now - this.routeStartTime
        pattern.avgDuration = (pattern.avgDuration * pattern.count + duration) / (pattern.count + 1)
        pattern.count++
        pattern.lastVisit = now

        // 更新下一步路由概率
        const nextCount = pattern.nextRoutes.get(route) || 0
        pattern.nextRoutes.set(route, nextCount + 1)
      }
    }

    // 初始化新路由模式
    if (!this.patterns.has(route)) {
      this.patterns.set(route, {
        route,
        count: 0,
        lastVisit: now,
        avgDuration: 0,
        nextRoutes: new Map()
      })
    }

    this.currentRoute = route
    this.routeStartTime = now
  }

  /**
   * 预测下一步路由
   */
  private predictNextRoutes(currentRoute: string): string[] {
    const pattern = this.patterns.get(currentRoute)
    if (!pattern || pattern.nextRoutes.size === 0) return []

    // 按概率排序
    const sorted = Array.from(pattern.nextRoutes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // 取前3个最可能的路由

    return sorted.map(([route]) => route)
  }

  /**
   * 空闲时加载
   */
  private scheduleIdleLoad(tasks: PreloadTask[]): void {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        tasks.forEach(task => this.preload(task.id))
      })
    } else {
      setTimeout(() => {
        tasks.forEach(task => this.preload(task.id))
      }, 100)
    }
  }

  /**
   * 延迟加载
   */
  private scheduleDelayedLoad(tasks: PreloadTask[]): void {
    setTimeout(() => {
      tasks.forEach(task => this.preload(task.id))
    }, 2000)
  }

  /**
   * 获取优先级值
   */
  private getPriorityValue(priority: PreloadPriority): number {
    switch (priority) {
      case PreloadPriority.HIGH: return 1
      case PreloadPriority.MEDIUM: return 2
      case PreloadPriority.LOW: return 3
      default: return 999
    }
  }
}

/**
 * 创建智能预加载器
 */
export function createSmartPreloader(): SmartPreloader {
  return new SmartPreloader()
}

