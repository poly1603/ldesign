import type { DebounceConfig } from '../types'

/**
 * 防抖任务
 */
interface DebounceTask<T = unknown> {
  /** 任务函数 */
  task: () => Promise<T>
  /** 延迟时间 */
  delay: number
  /** 定时器ID */
  timerId?: NodeJS.Timeout
  /** Promise resolve */
  resolve: (value: T) => void
  /** Promise reject */
  reject: (error: unknown) => void
  /** 创建时间 */
  createdAt: number
}

/**
 * 防抖管理器
 */
export class DebounceManager {
  /** 配置 */
  private readonly config: Required<DebounceConfig>

  /** 防抖任务映射 */
  private readonly tasks = new Map<string, DebounceTask>()

  /** 统计信息 */
  private readonly stats = {
    executions: 0,
    cancellations: 0,
    totalDelay: 0,
  }

  constructor(config: DebounceConfig) {
    this.config = {
      enabled: true,
      delay: 300,
      ...config,
    }
  }

  /**
   * 执行防抖任务
   */
  async execute<T = unknown>(
    key: string,
    task: () => Promise<T>,
    delay?: number
  ): Promise<T> {
    if (!this.config.enabled) {
      return await task()
    }

    const actualDelay = delay ?? this.config.delay

    return new Promise<T>((resolve, reject) => {
      // 取消之前的任务
      const existingTask = this.tasks.get(key)
      if (existingTask) {
        if (existingTask.timerId) {
          clearTimeout(existingTask.timerId)
        }
        existingTask.reject(new Error('Debounced: replaced by newer request'))
        this.stats.cancellations++
      }

      // 创建新任务
      const newTask: DebounceTask<T> = {
        task,
        delay: actualDelay,
        resolve,
        reject,
        createdAt: Date.now(),
      }

      // 设置定时器
      newTask.timerId = setTimeout(async () => {
        try {
          const result = await task()
          resolve(result)
          this.stats.executions++
          this.stats.totalDelay += actualDelay
        } catch (error) {
          reject(error)
        } finally {
          this.tasks.delete(key)
        }
      }, actualDelay)

      this.tasks.set(key, newTask as DebounceTask<unknown>)
    })
  }

  /**
   * 取消防抖任务
   */
  cancel(key: string): boolean {
    const task = this.tasks.get(key)
    if (!task) {
      return false
    }

    if (task.timerId) {
      clearTimeout(task.timerId)
    }

    task.reject(new Error('Debounced: manually cancelled'))
    this.tasks.delete(key)
    this.stats.cancellations++

    return true
  }

  /**
   * 取消所有防抖任务
   */
  cancelAll(): void {
    this.tasks.forEach((_task, key) => {
      this.cancel(key)
    })
  }

  /**
   * 检查是否有待执行的任务
   */
  hasPendingTask(key: string): boolean {
    return this.tasks.has(key)
  }

  /**
   * 获取待执行任务数量
   */
  getPendingTaskCount(): number {
    return this.tasks.size
  }

  /**
   * 获取所有待执行任务的键
   */
  getPendingTaskKeys(): string[] {
    return Array.from(this.tasks.keys())
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      pendingTasks: this.tasks.size,
      averageDelay:
        this.stats.executions > 0
          ? this.stats.totalDelay / this.stats.executions
          : 0,
    }
  }

  /**
   * 清空所有任务和统计
   */
  clear(): void {
    this.cancelAll()
    this.stats.executions = 0
    this.stats.cancellations = 0
    this.stats.totalDelay = 0
  }

  /**
   * 立即执行指定任务（跳过防抖）
   */
  async flush<T = unknown>(key: string): Promise<T | null> {
    const task = this.tasks.get(key)
    if (!task) {
      return null
    }

    // 清除定时器
    if (task.timerId) {
      clearTimeout(task.timerId)
    }

    // 立即执行任务
    try {
      const result = await task.task()
      task.resolve(result)
      this.stats.executions++
      return result as T | null
    } catch (error) {
      task.reject(error)
      throw error
    } finally {
      this.tasks.delete(key)
    }
  }

  /**
   * 立即执行所有待执行任务
   */
  async flushAll(): Promise<void> {
    const keys = Array.from(this.tasks.keys())
    await Promise.allSettled(keys.map(key => this.flush(key)))
  }

  /**
   * 获取任务信息
   */
  getTaskInfo(key: string) {
    const task = this.tasks.get(key)
    if (!task) {
      return null
    }

    return {
      key,
      delay: task.delay,
      createdAt: task.createdAt,
      remainingTime: Math.max(0, task.createdAt + task.delay - Date.now()),
    }
  }

  /**
   * 获取所有任务信息
   */
  getAllTaskInfo() {
    return Array.from(this.tasks.keys()).map(key => this.getTaskInfo(key)!)
  }
}
