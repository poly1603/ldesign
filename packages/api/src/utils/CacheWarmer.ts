/**
 * 缓存预热工具
 * 在应用启动时预加载关键数据到缓存
 */

/**
 * 预热任务配置
 */
export interface WarmupTask {
  /** 任务名称 */
  name: string
  /** API方法名 */
  methodName: string
  /** 调用参数 */
  params?: any
  /** 优先级（数字越大越优先） */
  priority?: number
  /** 是否必需（失败时是否中断预热流程） */
  required?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 重试次数 */
  retries?: number
}

/**
 * 预热配置
 */
export interface CacheWarmerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 并发数 */
  concurrency?: number
  /** 是否在启动时自动预热 */
  autoWarmup?: boolean
  /** 预热失败时是否抛出错误 */
  throwOnError?: boolean
  /** 预热超时时间（毫秒） */
  timeout?: number
  /** 预热进度回调 */
  onProgress?: (completed: number, total: number, task: WarmupTask) => void
  /** 预热完成回调 */
  onComplete?: (results: WarmupResult[]) => void
  /** 预热错误回调 */
  onError?: (error: any, task: WarmupTask) => void
}

/**
 * 预热结果
 */
export interface WarmupResult {
  /** 任务名称 */
  name: string
  /** 是否成功 */
  success: boolean
  /** 耗时（毫秒） */
  duration: number
  /** 错误信息 */
  error?: any
  /** 响应数据 */
  data?: any
}

/**
 * 预热统计
 */
export interface WarmupStats {
  /** 总任务数 */
  total: number
  /** 成功数 */
  succeeded: number
  /** 失败数 */
  failed: number
  /** 总耗时（毫秒） */
  totalDuration: number
  /** 平均耗时（毫秒） */
  averageDuration: number
}

/**
 * 缓存预热器
 */
export class CacheWarmer {
  private config: Required<CacheWarmerConfig>
  private tasks: WarmupTask[] = []
  private results: WarmupResult[] = []
  private isWarming: boolean = false

  constructor(config: CacheWarmerConfig = {}) {
    this.config = {
      enabled: true,
      concurrency: 5,
      autoWarmup: false,
      throwOnError: false,
      timeout: 30000,
      onProgress: () => {},
      onComplete: () => {},
      onError: () => {},
      ...config,
    }
  }

  /**
   * 添加预热任务
   */
  addTask(task: WarmupTask): void {
    this.tasks.push({
      priority: 0,
      required: false,
      timeout: this.config?.timeout,
      retries: 0,
      ...task,
    })
  }

  /**
   * 批量添加任务
   */
  addTasks(tasks: WarmupTask[]): void {
    tasks.forEach(task => this.addTask(task))
  }

  /**
   * 清空任务
   */
  clearTasks(): void {
    this.tasks = []
  }

  /**
   * 执行预热
   */
  async warmup(engine: any): Promise<WarmupResult[]> {
    if (!this.config?.enabled) {
      return []
    }

    if (this.isWarming) {
      throw new Error('Warmup is already in progress')
    }

    this.isWarming = true
    this.results = []

    try {
      // 按优先级排序
      const sortedTasks = [...this.tasks].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0),
      )

      // 并发执行任务
      await this.executeTasksWithConcurrency(engine, sortedTasks)

      // 检查是否有必需任务失败
      const requiredFailed = this.results.some(
        (r, i) => !r.success && sortedTasks[i]?.required,
      )

      if (requiredFailed && this.config?.throwOnError) {
        throw new Error('Required warmup tasks failed')
      }

      this.config?.onComplete(this.results)

      return this.results
    }
    finally {
      this.isWarming = false
    }
  }

  /**
   * 并发执行任务
   */
  private async executeTasksWithConcurrency(
    engine: any,
    tasks: WarmupTask[],
  ): Promise<void> {
    const queue = [...tasks]
    const executing: Promise<void>[] = []

    while (queue.length > 0 || executing.length > 0) {
      // 填充执行队列
      while (executing.length < this.config?.concurrency && queue.length > 0) {
        const task = queue.shift()!
        const promise = this.executeTask(engine, task).then(() => {
          const index = executing.indexOf(promise)
          if (index > -1) {
            executing.splice(index, 1)
          }
        })
        executing.push(promise)
      }

      // 等待至少一个任务完成
      if (executing.length > 0) {
        await Promise.race(executing)
      }
    }
  }

  /**
   * 执行单个任务
   */
  private async executeTask(engine: any, task: WarmupTask): Promise<void> {
    const startTime = Date.now()
    let attempt = 0
    let lastError: any

    while (attempt <= (task.retries || 0)) {
      try {
        // 设置超时
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Warmup task timeout')), task.timeout)
        })

        const callPromise = engine.call(task.methodName, task.params, {
          skipCache: false, // 确保写入缓存
        })

        const data = await Promise.race([callPromise, timeoutPromise])
        const duration = Date.now() - startTime

        const result: WarmupResult = {
          name: task.name,
          success: true,
          duration,
          data,
        }

        this.results.push(result)
        this.config?.onProgress(this.results.length, this.tasks.length, task)

        return
      }
      catch (error) {
        lastError = error
        attempt++

        if (attempt <= (task.retries || 0)) {
          // 重试前等待
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    // 所有重试都失败
    const duration = Date.now() - startTime
    const result: WarmupResult = {
      name: task.name,
      success: false,
      duration,
      error: lastError,
    }

    this.results.push(result)
    this.config?.onError(lastError, task)
    this.config?.onProgress(this.results.length, this.tasks.length, task)
  }

  /**
   * 获取预热统计
   */
  getStats(): WarmupStats {
    const succeeded = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    return {
      total: this.results.length,
      succeeded,
      failed,
      totalDuration,
      averageDuration: this.results.length > 0 ? totalDuration / this.results.length : 0,
    }
  }

  /**
   * 获取预热结果
   */
  getResults(): WarmupResult[] {
    return [...this.results]
  }

  /**
   * 重置
   */
  reset(): void {
    this.results = []
    this.isWarming = false
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheWarmerConfig>): void {
    Object.assign(this.config, config)
  }
}

/**
 * 创建缓存预热器
 */
export function createCacheWarmer(config?: CacheWarmerConfig): CacheWarmer {
  return new CacheWarmer(config)
}

/**
 * 便捷函数：快速预热
 */
export async function quickWarmup(
  engine: any,
  tasks: WarmupTask[],
): Promise<WarmupResult[]> {
  const warmer = new CacheWarmer({ concurrency: 5 })
  warmer.addTasks(tasks)
  return await warmer.warmup(engine)
}
