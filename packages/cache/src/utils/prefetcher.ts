/**
 * 预取策略类型
 */
export type PrefetchStrategy = 'eager' | 'lazy' | 'predictive' | 'manual'

/**
 * 预取规则
 */
export interface PrefetchRule {
  /** 规则 ID */
  id: string
  /** 触发条件 */
  trigger: (context: PrefetchContext) => boolean
  /** 要预取的键或键生成函数 */
  keys: string[] | ((context: PrefetchContext) => string[])
  /** 数据获取函数 */
  fetcher: (key: string) => Promise<any>
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 策略 */
  strategy?: PrefetchStrategy
  /** 延迟时间（毫秒） */
  delay?: number
}

/**
 * 预取上下文
 */
export interface PrefetchContext {
  /** 当前访问的键 */
  currentKey?: string
  /** 最近访问的键 */
  recentKeys: string[]
  /** 访问时间 */
  timestamp: number
  /** 用户自定义数据 */
  userData?: any
}

/**
 * 预取配置
 */
export interface PrefetcherOptions {
  /** 最大并发预取数 */
  maxConcurrent?: number
  /** 预取超时时间（毫秒） */
  timeout?: number
  /** 是否启用预测性预取 */
  enablePredictive?: boolean
  /** 预测窗口大小 */
  predictionWindow?: number
  /** 最小置信度阈值 */
  minConfidence?: number
  /** 是否在空闲时预取 */
  prefetchOnIdle?: boolean
  /** 空闲时间阈值（毫秒） */
  idleThreshold?: number
}

/**
 * 访问模式
 */
interface AccessPattern {
  /** 键序列 */
  sequence: string[]
  /** 出现次数 */
  count: number
  /** 最后访问时间 */
  lastAccess: number
}

/**
 * 预取任务
 */
interface PrefetchTask {
  /** 任务 ID */
  id: string
  /** 要预取的键 */
  keys: string[]
  /** 数据获取函数 */
  fetcher: (key: string) => Promise<any>
  /** 优先级 */
  priority: number
  /** 策略 */
  strategy: PrefetchStrategy
  /** 状态 */
  status: 'pending' | 'running' | 'completed' | 'failed'
  /** 进度 */
  progress: number
  /** 结果 */
  results?: Map<string, any>
  /** 错误 */
  errors?: Map<string, Error>
}

/**
 * 智能预取器
 * 
 * 实现缓存预热、预测性预取和智能缓存策略
 */
export class Prefetcher {
  private readonly options: Required<PrefetcherOptions>
  private readonly rules: Map<string, PrefetchRule> = new Map()
  private readonly accessHistory: string[] = []
  private readonly patterns: Map<string, AccessPattern> = new Map()
  private readonly tasks: Map<string, PrefetchTask> = new Map()
  private readonly cache: Map<string, any>
  private runningTasks = 0
  private idleTimer?: number
  private lastAccessTime = Date.now()

  constructor(
    cache: Map<string, any>,
    options: PrefetcherOptions = {},
  ) {
    this.cache = cache
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      timeout: options.timeout ?? 5000,
      enablePredictive: options.enablePredictive ?? true,
      predictionWindow: options.predictionWindow ?? 5,
      minConfidence: options.minConfidence ?? 0.6,
      prefetchOnIdle: options.prefetchOnIdle ?? true,
      idleThreshold: options.idleThreshold ?? 2000,
    }

    if (this.options.prefetchOnIdle) {
      this.setupIdleDetection()
    }
  }

  /**
   * 添加预取规则
   */
  addRule(rule: PrefetchRule): void {
    this.rules.set(rule.id, {
      ...rule,
      priority: rule.priority ?? 0,
      strategy: rule.strategy ?? 'lazy',
    })
  }

  /**
   * 移除预取规则
   */
  removeRule(id: string): void {
    this.rules.delete(id)
  }

  /**
   * 记录访问
   */
  recordAccess(key: string): void {
    this.lastAccessTime = Date.now()
    this.accessHistory.push(key)
    
    // 限制历史记录大小
    if (this.accessHistory.length > 100) {
      this.accessHistory.shift()
    }

    // 更新访问模式
    if (this.options.enablePredictive) {
      this.updatePatterns(key)
    }

    // 触发预取检查
    this.checkPrefetchRules({
      currentKey: key,
      recentKeys: this.getRecentKeys(),
      timestamp: Date.now(),
    })

    // 进行预测性预取
    if (this.options.enablePredictive) {
      this.predictivePrefetch(key)
    }
  }

  /**
   * 获取最近访问的键
   */
  private getRecentKeys(count = 10): string[] {
    return this.accessHistory.slice(-count)
  }

  /**
   * 更新访问模式
   */
  private updatePatterns(currentKey: string): void {
    const window = this.options.predictionWindow
    const recent = this.accessHistory.slice(-window - 1, -1)
    
    if (recent.length < window) { return }

    const pattern = recent.join('->')
    const existing = this.patterns.get(pattern) || {
      sequence: [...recent, currentKey],
      count: 0,
      lastAccess: 0,
    }

    existing.count++
    existing.lastAccess = Date.now()
    this.patterns.set(pattern, existing)

    // 清理旧模式
    this.cleanupPatterns()
  }

  /**
   * 清理旧的访问模式
   */
  private cleanupPatterns(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    for (const [key, pattern] of this.patterns.entries()) {
      if (now - pattern.lastAccess > maxAge) {
        this.patterns.delete(key)
      }
    }
  }

  /**
   * 预测性预取
   */
  private async predictivePrefetch(currentKey: string): Promise<void> {
    const predictions = this.predictNextKeys(currentKey)
    
    for (const { key, confidence } of predictions) {
      if (confidence >= this.options.minConfidence && !this.cache.has(key)) {
        // 创建预测性预取任务
        this.createTask({
          id: `predictive-${key}-${Date.now()}`,
          keys: [key],
          fetcher: async () => null, // 需要外部提供
          priority: Math.floor(confidence * 10),
          strategy: 'predictive',
        })
      }
    }
  }

  /**
   * 预测下一个可能访问的键
   */
  private predictNextKeys(_currentKey: string): Array<{ key: string, confidence: number }> {
    const predictions = new Map<string, number>()
    const window = this.options.predictionWindow
    const recent = this.accessHistory.slice(-window)
    
    if (recent.length < window) { return [] }

    const currentPattern = recent.join('->')
    let totalMatches = 0

    // 查找匹配的模式
    for (const [pattern, data] of this.patterns.entries()) {
      if (pattern === currentPattern) {
        const nextKey = data.sequence[data.sequence.length - 1]
        predictions.set(nextKey, (predictions.get(nextKey) || 0) + data.count)
        totalMatches += data.count
      }
    }

    // 计算置信度
    const results: Array<{ key: string, confidence: number }> = []
    for (const [key, count] of predictions.entries()) {
      results.push({
        key,
        confidence: count / totalMatches,
      })
    }

    // 按置信度排序
    return results.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * 检查预取规则
   */
  private async checkPrefetchRules(context: PrefetchContext): Promise<void> {
    const triggeredRules: PrefetchRule[] = []

    for (const rule of this.rules.values()) {
      if (rule.trigger(context)) {
        triggeredRules.push(rule)
      }
    }

    // 按优先级排序
    triggeredRules.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // 创建预取任务
    for (const rule of triggeredRules) {
      const keys = typeof rule.keys === 'function' ? rule.keys(context) : rule.keys
      
      this.createTask({
        id: `rule-${rule.id}-${Date.now()}`,
        keys,
        fetcher: rule.fetcher,
        priority: rule.priority || 0,
        strategy: rule.strategy || 'lazy',
      })

      // 根据策略处理
      if (rule.strategy === 'eager') {
        await this.executeTasks()
      }
      else if (rule.delay) {
        setTimeout(async () => this.executeTasks(), rule.delay)
      }
    }
  }

  /**
   * 创建预取任务
   */
  private createTask(params: Omit<PrefetchTask, 'status' | 'progress'>): void {
    const task: PrefetchTask = {
      ...params,
      status: 'pending',
      progress: 0,
      results: new Map(),
      errors: new Map(),
    }

    this.tasks.set(task.id, task)
  }

  /**
   * 执行预取任务
   */
  private async executeTasks(): Promise<void> {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => b.priority - a.priority)

    for (const task of pendingTasks) {
      if (this.runningTasks >= this.options.maxConcurrent) {
        break
      }

      this.runTask(task)
    }
  }

  /**
   * 运行单个任务
   */
  private async runTask(task: PrefetchTask): Promise<void> {
    task.status = 'running'
    this.runningTasks++

    try {
      const total = task.keys.length
      let completed = 0

      // 并行预取所有键
      const promises = task.keys.map(async (key) => {
        // 如果已缓存，跳过
        if (this.cache.has(key)) {
          completed++
          task.progress = completed / total
          return
        }

        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
          })

          const value = await Promise.race([
            task.fetcher(key),
            timeoutPromise,
          ])

          this.cache.set(key, value)
          task.results?.set(key, value)
        }
        catch (error) {
          task.errors?.set(key, error as Error)
        }
        finally {
          completed++
          task.progress = completed / total
        }
      })

      await Promise.all(promises)
      task.status = 'completed'
    }
    catch {
      task.status = 'failed'
    }
    finally {
      this.runningTasks--
      
      // 清理完成的任务
      if (task.status === 'completed') {
        setTimeout(() => this.tasks.delete(task.id), 60000) // 1分钟后清理
      }
    }
  }

  /**
   * 设置空闲检测
   */
  private setupIdleDetection(): void {
    const checkIdle = () => {
      const now = Date.now()
      if (now - this.lastAccessTime > this.options.idleThreshold) {
        this.onIdle()
      }
      
      this.idleTimer = window.setTimeout(checkIdle, 1000) as unknown as number
    }

    checkIdle()
  }

  /**
   * 空闲时触发
   */
  private onIdle(): void {
    // 执行低优先级的预取任务
    this.executeTasks()

    // 预热常用数据
    this.warmupFrequentKeys()
  }

  /**
   * 预热常用键
   */
  private warmupFrequentKeys(): void {
    // 统计访问频率
    const frequency = new Map<string, number>()
    for (const key of this.accessHistory) {
      frequency.set(key, (frequency.get(key) || 0) + 1)
    }

    // 获取高频键
    const frequentKeys = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key]) => key)

    // 创建预热任务
    if (frequentKeys.length > 0) {
      this.createTask({
        id: `warmup-${Date.now()}`,
        keys: frequentKeys,
        fetcher: async () => null, // 需要外部提供
        priority: -1, // 低优先级
        strategy: 'lazy',
      })
    }
  }

  /**
   * 手动预取
   */
  async prefetch(
    keys: string[],
    fetcher: (key: string) => Promise<any>,
    options?: { priority?: number, strategy?: PrefetchStrategy },
  ): Promise<void> {
    const task: PrefetchTask = {
      id: `manual-${Date.now()}`,
      keys,
      fetcher,
      priority: options?.priority ?? 5,
      strategy: options?.strategy ?? 'manual',
      status: 'pending',
      progress: 0,
      results: new Map(),
      errors: new Map(),
    }

    this.tasks.set(task.id, task)
    
    if (task.strategy === 'eager') {
      await this.runTask(task)
    }
    else {
      this.executeTasks()
    }
  }

  /**
   * 获取预取统计
   */
  getStats(): {
    totalTasks: number
    pendingTasks: number
    runningTasks: number
    completedTasks: number
    failedTasks: number
    patterns: number
    predictions: Array<{ key: string, confidence: number }>
  } {
    const tasks = Array.from(this.tasks.values())
    const currentKey = this.accessHistory[this.accessHistory.length - 1]

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      runningTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      patterns: this.patterns.size,
      predictions: currentKey ? this.predictNextKeys(currentKey) : [],
    }
  }

  /**
   * 清理
   */
  dispose(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }
    this.tasks.clear()
    this.patterns.clear()
    this.accessHistory.length = 0
  }
}

/**
 * 创建预取装饰器
 */
export function withPrefetching<T extends { get: any, set: any, has: any }>(
  cache: T,
  options?: PrefetcherOptions,
): T & { prefetcher: Prefetcher } {
  const cacheMap = new Map<string, any>()
  const prefetcher = new Prefetcher(cacheMap, options)

  return {
    ...cache,
    prefetcher,
    
    async get(key: string) {
      // 记录访问
      prefetcher.recordAccess(key)
      
      // 先从预取缓存获取
      if (cacheMap.has(key)) {
        return cacheMap.get(key)
      }
      
      // 从原始缓存获取
      const value = await cache.get(key)
      if (value !== null && value !== undefined) {
        cacheMap.set(key, value)
      }
      
      return value
    },
    
    async set(key: string, value: any, setOptions?: any) {
      // 更新预取缓存
      cacheMap.set(key, value)
      
      // 更新原始缓存
      return cache.set(key, value, setOptions)
    },
    
    async has(key: string) {
      return cacheMap.has(key) || (await cache.has(key))
    },
  }
}
