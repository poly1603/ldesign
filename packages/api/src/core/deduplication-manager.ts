import type { DeduplicationConfig } from '../types'

/**
 * 去重任务
 */
interface DeduplicationTask<T = unknown> {
  /** 任务 Promise */
  promise: Promise<T>
  /** 创建时间 */
  createdAt: number
  /** 引用计数 */
  refCount: number
}

/**
 * 请求去重管理器
 */
export class DeduplicationManager {
  /** 配置 */
  private readonly config: Required<DeduplicationConfig>

  /** 正在执行的任务映射 */
  private readonly runningTasks = new Map<string, DeduplicationTask>()

  /** 统计信息 */
  private readonly stats = {
    executions: 0,
    duplications: 0,
    totalSaved: 0,
  }

  constructor(config: DeduplicationConfig) {
    this.config = {
      enabled: true,
      keyGenerator: config => JSON.stringify(config),
      ...config,
    }
  }

  /**
   * 执行去重任务
   */
  async execute<T = unknown>(key: string, task: () => Promise<T>): Promise<T> {
    if (!this.config.enabled) {
      return await task()
    }

    // 检查是否有相同的任务正在执行
    const existingTask = this.runningTasks.get(key)
    if (existingTask) {
      // 增加引用计数
      existingTask.refCount++
      this.stats.duplications++
      this.stats.totalSaved++

      // 返回现有任务的结果
      return (await existingTask.promise) as T
    }

    // 创建新任务
    const promise = this.createTask(key, task)
    const newTask: DeduplicationTask<T> = {
      promise,
      createdAt: Date.now(),
      refCount: 1,
    }

    this.runningTasks.set(key, newTask)
    this.stats.executions++

    try {
      const result = await promise
      return result
    } finally {
      // 任务完成后清理
      this.runningTasks.delete(key)
    }
  }

  /**
   * 创建任务
   */
  private async createTask<T>(key: string, task: () => Promise<T>): Promise<T> {
    try {
      const result = await task()
      return result
    } catch (error) {
      // 任务失败时也要清理
      this.runningTasks.delete(key)
      throw error
    }
  }

  /**
   * 取消指定任务
   */
  cancel(key: string): boolean {
    const task = this.runningTasks.get(key)
    if (!task) {
      return false
    }

    this.runningTasks.delete(key)
    return true
  }

  /**
   * 取消所有任务
   */
  cancelAll(): void {
    this.runningTasks.clear()
  }

  /**
   * 检查任务是否正在执行
   */
  isRunning(key: string): boolean {
    return this.runningTasks.has(key)
  }

  /**
   * 获取正在执行的任务数量
   */
  getRunningTaskCount(): number {
    return this.runningTasks.size
  }

  /**
   * 获取所有正在执行任务的键
   */
  getRunningTaskKeys(): string[] {
    return Array.from(this.runningTasks.keys())
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      runningTasks: this.runningTasks.size,
      deduplicationRate:
        this.stats.executions > 0
          ? this.stats.duplications /
            (this.stats.executions + this.stats.duplications)
          : 0,
      savedRequests: this.stats.totalSaved,
    }
  }

  /**
   * 清空所有任务和统计
   */
  clear(): void {
    this.cancelAll()
    this.stats.executions = 0
    this.stats.duplications = 0
    this.stats.totalSaved = 0
  }

  /**
   * 获取任务信息
   */
  getTaskInfo(key: string) {
    const task = this.runningTasks.get(key)
    if (!task) {
      return null
    }

    return {
      key,
      createdAt: task.createdAt,
      refCount: task.refCount,
      duration: Date.now() - task.createdAt,
    }
  }

  /**
   * 获取所有任务信息
   */
  getAllTaskInfo() {
    return Array.from(this.runningTasks.keys()).map(
      key => this.getTaskInfo(key)!
    )
  }

  /**
   * 等待指定任务完成
   */
  async waitFor<T = unknown>(key: string): Promise<T | null> {
    const task = this.runningTasks.get(key)
    if (!task) {
      return null
    }

    try {
      return (await task.promise) as T | null
    } catch {
      return null
    }
  }

  /**
   * 等待所有任务完成
   */
  async waitForAll(): Promise<void> {
    const promises = Array.from(this.runningTasks.values()).map(
      task => task.promise.catch(() => {}) // 忽略错误，只等待完成
    )

    await Promise.all(promises)
  }

  /**
   * 获取任务的引用计数
   */
  getRefCount(key: string): number {
    const task = this.runningTasks.get(key)
    return task?.refCount || 0
  }

  /**
   * 获取最高引用计数的任务
   */
  getMostReferencedTask() {
    let maxRefCount = 0
    let mostReferencedKey = ''

    this.runningTasks.forEach((task, key) => {
      if (task.refCount > maxRefCount) {
        maxRefCount = task.refCount
        mostReferencedKey = key
      }
    })

    return mostReferencedKey
      ? {
          key: mostReferencedKey,
          refCount: maxRefCount,
          info: this.getTaskInfo(mostReferencedKey),
        }
      : null
  }

  /**
   * 获取运行时间最长的任务
   */
  getLongestRunningTask() {
    let maxDuration = 0
    let longestKey = ''
    const now = Date.now()

    this.runningTasks.forEach((task, key) => {
      const duration = now - task.createdAt
      if (duration > maxDuration) {
        maxDuration = duration
        longestKey = key
      }
    })

    return longestKey
      ? {
          key: longestKey,
          duration: maxDuration,
          info: this.getTaskInfo(longestKey),
        }
      : null
  }
}
