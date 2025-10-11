/**
 * 异步任务队列管理器
 * 📋 提供任务队列管理、优先级调度和并发控制
 */

/**
 * 任务优先级
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * 任务配置
 */
export interface TaskConfig<T = unknown> {
  id?: string
  name?: string
  priority?: TaskPriority
  timeout?: number
  retries?: number
  retryDelay?: number
  onProgress?: (progress: number) => void
  onComplete?: (result: T) => void
  onError?: (error: Error) => void
  onCancel?: () => void
  dependencies?: string[]
}

/**
 * 任务项
 */
export interface Task<T = unknown> {
  id: string
  name: string
  priority: TaskPriority
  status: TaskStatus
  fn: () => Promise<T>
  config: TaskConfig<T>
  result?: T
  error?: Error
  startTime?: number
  endTime?: number
  attempts: number
  progress: number
}

/**
 * 队列统计
 */
export interface QueueStats {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
  cancelled: number
  averageTime: number
}

/**
 * 任务队列���理器
 */
export class TaskQueue {
  private tasks: Map<string, Task> = new Map()
  private queue: Task[] = []
  private runningTasks: Set<string> = new Set()
  private completedTasks: Set<string> = new Set()
  private maxConcurrent: number
  private autoStart: boolean
  private idCounter = 0

  constructor(options: { maxConcurrent?: number; autoStart?: boolean } = {}) {
    this.maxConcurrent = options.maxConcurrent || 3
    this.autoStart = options.autoStart !== false
  }

  /**
   * 添加任务
   */
  add<T = unknown>(
    fn: () => Promise<T>,
    config: TaskConfig<T> = {}
  ): string {
    const id = config.id || this.generateId()
    const name = config.name || `Task-${id}`

    if (this.tasks.has(id)) {
      throw new Error(`Task with id "${id}" already exists`)
    }

    const task: Task<T> = {
      id,
      name,
      priority: config.priority || TaskPriority.NORMAL,
      status: TaskStatus.PENDING,
      fn,
      config,
      attempts: 0,
      progress: 0,
    }

    this.tasks.set(id, task as Task)
    this.queue.push(task as Task)
    this.sortQueue()

    if (this.autoStart) {
      this.processQueue()
    }

    return id
  }

  /**
   * 批量添加任务
   */
  addBatch<T = unknown>(
    tasks: Array<{
      fn: () => Promise<T>
      config?: TaskConfig<T>
    }>
  ): string[] {
    return tasks.map(({ fn, config }) => this.add(fn, config))
  }

  /**
   * 移除任务
   */
  remove(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) {
      return false
    }

    if (task.status === TaskStatus.RUNNING) {
      this.cancel(id)
    }

    this.tasks.delete(id)
    this.queue = this.queue.filter(t => t.id !== id)
    this.runningTasks.delete(id)
    this.completedTasks.delete(id)

    return true
  }

  /**
   * 取消任务
   */
  cancel(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) {
      return false
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
      return false
    }

    task.status = TaskStatus.CANCELLED
    this.runningTasks.delete(id)

    if (task.config.onCancel) {
      task.config.onCancel()
    }

    return true
  }

  /**
   * 取消所有任务
   */
  cancelAll(): void {
    for (const task of this.tasks.values()) {
      if (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.FAILED) {
        this.cancel(task.id)
      }
    }
  }

  /**
   * 开始处理队列
   */
  start(): void {
    this.autoStart = true
    this.processQueue()
  }

  /**
   * 暂停处理队列
   */
  pause(): void {
    this.autoStart = false
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.cancelAll()
    this.tasks.clear()
    this.queue = []
    this.runningTasks.clear()
    this.completedTasks.clear()
  }

  /**
   * 获取任务
   */
  get(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  /**
   * 获取所有任务
   */
  getAll(): Task[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 获取指定状态的任务
   */
  getByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status)
  }

  /**
   * 获取队列统计
   */
  getStats(): QueueStats {
    const tasks = Array.from(this.tasks.values())
    const completedTasks = tasks.filter(
      t => t.status === TaskStatus.COMPLETED && t.startTime && t.endTime
    )

    const totalTime = completedTasks.reduce(
      (sum, t) => sum + (t.endTime! - t.startTime!),
      0
    )

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      running: tasks.filter(t => t.status === TaskStatus.RUNNING).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      failed: tasks.filter(t => t.status === TaskStatus.FAILED).length,
      cancelled: tasks.filter(t => t.status === TaskStatus.CANCELLED).length,
      averageTime: completedTasks.length > 0 ? totalTime / completedTasks.length : 0,
    }
  }

  /**
   * 等待所有任务完成
   */
  async waitAll(): Promise<void> {
    while (this.queue.length > 0 || this.runningTasks.size > 0) {
      await this.sleep(100)
    }
  }

  /**
   * 等待指定任务完成
   */
  async wait(id: string): Promise<Task | undefined> {
    const task = this.tasks.get(id)
    if (!task) {
      return undefined
    }

    while (
      task.status !== TaskStatus.COMPLETED &&
      task.status !== TaskStatus.FAILED &&
      task.status !== TaskStatus.CANCELLED
    ) {
      await this.sleep(50)
    }

    return task
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (!this.autoStart) {
      return
    }

    while (
      this.queue.length > 0 &&
      this.runningTasks.size < this.maxConcurrent
    ) {
      const task = this.queue.shift()
      if (!task || task.status === TaskStatus.CANCELLED) {
        continue
      }

      // 检查依赖
      if (task.config.dependencies) {
        const allDepsCompleted = task.config.dependencies.every(depId => {
          const dep = this.tasks.get(depId)
          return dep && dep.status === TaskStatus.COMPLETED
        })

        if (!allDepsCompleted) {
          // 依赖未完成，重新加入队列
          this.queue.push(task)
          await this.sleep(100)
          continue
        }
      }

      this.executeTask(task)
    }
  }

  /**
   * 执行任务
   */
  private async executeTask(task: Task): Promise<void> {
    task.status = TaskStatus.RUNNING
    task.startTime = performance.now()
    task.attempts++
    this.runningTasks.add(task.id)

    try {
      // 设置超时
      let timeoutId: NodeJS.Timeout | undefined
      const timeoutPromise = task.config.timeout
        ? new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Task timeout after ${task.config.timeout}ms`))
            }, task.config.timeout)
          })
        : null

      // 执行任务
      const resultPromise = task.fn()
      const result = timeoutPromise
        ? await Promise.race([resultPromise, timeoutPromise])
        : await resultPromise

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      task.result = result
      task.status = TaskStatus.COMPLETED
      task.endTime = performance.now()
      task.progress = 100
      this.completedTasks.add(task.id)

      if (task.config.onComplete) {
        task.config.onComplete(result)
      }
    } catch (error) {
      task.error = error as Error

      // 重试逻辑
      const shouldRetry =
        task.config.retries && task.attempts <= task.config.retries

      if (shouldRetry) {
        task.status = TaskStatus.PENDING
        this.queue.push(task)
        this.sortQueue()

        if (task.config.retryDelay) {
          await this.sleep(task.config.retryDelay)
        }
      } else {
        task.status = TaskStatus.FAILED
        task.endTime = performance.now()

        if (task.config.onError) {
          task.config.onError(error as Error)
        }
      }
    } finally {
      this.runningTasks.delete(task.id)
      this.processQueue()
    }
  }

  /**
   * 排序队列（按优先级）
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 生成任务ID
   */
  private generateId(): string {
    return `task_${++this.idCounter}_${Date.now()}`
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 任务调度器（支持cron表达式）
 */
export class TaskScheduler {
  private tasks: Map<string, { fn: () => Promise<void>; interval: number; timer?: NodeJS.Timeout }> = new Map()

  /**
   * 添加定时任务
   */
  schedule(
    id: string,
    fn: () => Promise<void>,
    interval: number
  ): void {
    if (this.tasks.has(id)) {
      throw new Error(`Task with id "${id}" already exists`)
    }

    const timer = setInterval(() => {
      fn().catch(error => {
        // 使用全局错误处理或日志系统
        if (typeof window !== 'undefined' && window.console) {
          window.console.error('[TaskScheduler] Scheduled task error:', error)
        }
      })
    }, interval)

    this.tasks.set(id, { fn, interval, timer })
  }

  /**
   * 移除定时任务
   */
  unschedule(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) {
      return false
    }

    if (task.timer) {
      clearInterval(task.timer)
    }

    this.tasks.delete(id)
    return true
  }

  /**
   * 清空所有定时任务
   */
  clear(): void {
    for (const task of this.tasks.values()) {
      if (task.timer) {
        clearInterval(task.timer)
      }
    }
    this.tasks.clear()
  }

  /**
   * 获取所有任务
   */
  getAll(): string[] {
    return Array.from(this.tasks.keys())
  }
}

/**
 * 全局任务队列实例
 */
let globalTaskQueue: TaskQueue | null = null

/**
 * 获取全局任务队列
 */
export function getGlobalTaskQueue(): TaskQueue {
  if (!globalTaskQueue) {
    globalTaskQueue = new TaskQueue()
  }
  return globalTaskQueue
}

/**
 * 设置全局任务队列
 */
export function setGlobalTaskQueue(queue: TaskQueue): void {
  globalTaskQueue = queue
}

/**
 * 快捷添加任务
 */
export function addTask<T = unknown>(
  fn: () => Promise<T>,
  config?: TaskConfig<T>
): string {
  return getGlobalTaskQueue().add(fn, config)
}

/**
 * 快捷等待任务
 */
export function waitTask(id: string): Promise<Task | undefined> {
  return getGlobalTaskQueue().wait(id)
}

/**
 * 快捷取消任务
 */
export function cancelTask(id: string): boolean {
  return getGlobalTaskQueue().cancel(id)
}
