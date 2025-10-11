/**
 * 预加载队列管理系统
 * 支持优先级队列、并发控制、进度追踪
 */

export type Priority = 'high' | 'normal' | 'low'

export interface PreloadTask {
  id: string
  url: string
  priority: Priority
  cacheKey?: string
  retries?: number
}

export interface PreloadResult {
  id: string
  url: string
  data: any
  success: boolean
  error?: Error
  duration: number
}

export interface PreloadProgress {
  total: number
  loaded: number
  failed: number
  percentage: number
  currentTask?: PreloadTask
}

type ProgressCallback = (progress: PreloadProgress) => void
type TaskCallback = (result: PreloadResult) => void

/**
 * 预加载队列管理器
 */
export class PreloadQueue {
  private queue: PreloadTask[] = []
  private activeRequests = new Set<string>()
  private results = new Map<string, PreloadResult>()
  private progressCallbacks = new Set<ProgressCallback>()
  private taskCallbacks = new Map<string, TaskCallback[]>()
  
  private maxConcurrent: number
  private retryCount: number
  private retryDelay: number
  
  private totalTasks = 0
  private loadedTasks = 0
  private failedTasks = 0
  private isRunning = false

  constructor(options?: {
    maxConcurrent?: number
    retryCount?: number
    retryDelay?: number
  }) {
    this.maxConcurrent = options?.maxConcurrent ?? 3
    this.retryCount = options?.retryCount ?? 2
    this.retryDelay = options?.retryDelay ?? 1000
  }

  /**
   * 添加预加载任务
   */
  add(task: PreloadTask, callback?: TaskCallback): void {
    // 检查是否已存在
    if (this.queue.some(t => t.url === task.url)) {
      console.warn(`[PreloadQueue] Task already exists: ${task.url}`)
      return
    }

    // 添加到队列
    this.queue.push({
      ...task,
      retries: task.retries ?? this.retryCount
    })

    // 根据优先级排序
    this.sortQueue()

    // 注册回调
    if (callback) {
      if (!this.taskCallbacks.has(task.id)) {
        this.taskCallbacks.set(task.id, [])
      }
      this.taskCallbacks.get(task.id)!.push(callback)
    }

    this.totalTasks++
    this.notifyProgress()

    // 如果队列正在运行，尝试处理新任务
    if (this.isRunning) {
      this.processQueue()
    }
  }

  /**
   * 批量添加任务
   */
  addBatch(tasks: PreloadTask[], callback?: TaskCallback): void {
    tasks.forEach(task => this.add(task, callback))
  }

  /**
   * 开始处理队列
   */
  async start(): Promise<PreloadResult[]> {
    if (this.isRunning) {
      console.warn('[PreloadQueue] Queue is already running')
      return []
    }

    this.isRunning = true
    this.loadedTasks = 0
    this.failedTasks = 0

    await this.processQueue()

    this.isRunning = false
    return Array.from(this.results.values())
  }

  /**
   * 暂停队列
   */
  pause(): void {
    this.isRunning = false
  }

  /**
   * 恢复队列
   */
  resume(): void {
    if (!this.isRunning && this.queue.length > 0) {
      this.isRunning = true
      this.processQueue()
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
    this.activeRequests.clear()
    this.results.clear()
    this.taskCallbacks.clear()
    this.totalTasks = 0
    this.loadedTasks = 0
    this.failedTasks = 0
    this.isRunning = false
    this.notifyProgress()
  }

  /**
   * 取消特定任务
   */
  cancel(taskId: string): boolean {
    const index = this.queue.findIndex(t => t.id === taskId)
    if (index !== -1) {
      this.queue.splice(index, 1)
      this.totalTasks--
      this.notifyProgress()
      return true
    }
    return false
  }

  /**
   * 获取队列状态
   */
  getStatus(): PreloadProgress {
    return {
      total: this.totalTasks,
      loaded: this.loadedTasks,
      failed: this.failedTasks,
      percentage: this.totalTasks > 0 
        ? Math.round((this.loadedTasks / this.totalTasks) * 100)
        : 0,
      currentTask: this.queue[0]
    }
  }

  /**
   * 监听进度
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback)
    // 返回取消监听函数
    return () => {
      this.progressCallbacks.delete(callback)
    }
  }

  /**
   * 获取结果
   */
  getResult(taskId: string): PreloadResult | undefined {
    return this.results.get(taskId)
  }

  /**
   * 获取所有结果
   */
  getAllResults(): PreloadResult[] {
    return Array.from(this.results.values())
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    while (this.isRunning && (this.queue.length > 0 || this.activeRequests.size > 0)) {
      // 控制并发数量
      while (
        this.activeRequests.size < this.maxConcurrent && 
        this.queue.length > 0 &&
        this.isRunning
      ) {
        const task = this.queue.shift()!
        this.processTask(task)
      }

      // 等待一个任务完成
      if (this.activeRequests.size >= this.maxConcurrent || this.queue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: PreloadTask): Promise<void> {
    this.activeRequests.add(task.id)
    this.notifyProgress()

    const startTime = Date.now()
    
    try {
      const data = await this.fetchAnimation(task.url)
      const duration = Date.now() - startTime

      const result: PreloadResult = {
        id: task.id,
        url: task.url,
        data,
        success: true,
        duration
      }

      this.results.set(task.id, result)
      this.loadedTasks++
      this.activeRequests.delete(task.id)
      this.notifyProgress()
      this.notifyTaskComplete(task.id, result)

    } catch (error) {
      // 重试逻辑
      if (task.retries && task.retries > 0) {
        console.log(`[PreloadQueue] Retrying task: ${task.url} (${task.retries} retries left)`)
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        
        this.queue.unshift({
          ...task,
          retries: task.retries - 1
        })
        this.sortQueue()
        this.activeRequests.delete(task.id)
      } else {
        // 重试次数用完，标记为失败
        const duration = Date.now() - startTime
        const result: PreloadResult = {
          id: task.id,
          url: task.url,
          data: null,
          success: false,
          error: error as Error,
          duration
        }

        this.results.set(task.id, result)
        this.failedTasks++
        this.activeRequests.delete(task.id)
        this.notifyProgress()
        this.notifyTaskComplete(task.id, result)
      }
    }
  }

  /**
   * 获取动画数据
   */
  private async fetchAnimation(url: string): Promise<any> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }
    return await response.json()
  }

  /**
   * 队列排序（按优先级）
   */
  private sortQueue(): void {
    const priorityOrder: Record<Priority, number> = {
      high: 0,
      normal: 1,
      low: 2
    }

    this.queue.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * 通知进度更新
   */
  private notifyProgress(): void {
    const progress = this.getStatus()
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress)
      } catch (error) {
        console.error('[PreloadQueue] Progress callback error:', error)
      }
    })
  }

  /**
   * 通知任务完成
   */
  private notifyTaskComplete(taskId: string, result: PreloadResult): void {
    const callbacks = this.taskCallbacks.get(taskId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(result)
        } catch (error) {
          console.error('[PreloadQueue] Task callback error:', error)
        }
      })
      this.taskCallbacks.delete(taskId)
    }
  }
}

/**
 * 全局预加载队列实例
 */
export const globalPreloadQueue = new PreloadQueue({
  maxConcurrent: 5,
  retryCount: 3,
  retryDelay: 1000
})
