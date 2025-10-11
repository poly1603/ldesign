/**
 * Web Worker 管理器
 * 提供简单的 API 来使用 Worker 进行颜色计算
 */

import type { WorkerMessage, WorkerResponse } from '../workers/color.worker'

/**
 * Worker 池配置
 */
export interface WorkerPoolOptions {
  /** 最大 Worker 数量 */
  maxWorkers?: number
  /** Worker 脚本路径 */
  workerPath?: string
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否自动终止空闲 Worker */
  autoTerminate?: boolean
  /** 空闲终止延迟（毫秒） */
  terminateDelay?: number
}

/**
 * Worker 任务
 */
interface WorkerTask {
  id: string
  resolve: (result: any) => void
  reject: (error: Error) => void
  timeoutId?: NodeJS.Timeout
}

/**
 * Worker 实例封装
 */
class WorkerInstance {
  private worker: Worker | null = null
  private tasks: Map<string, WorkerTask> = new Map()
  private isIdle = true
  private lastUsedTime = Date.now()

  constructor(private workerPath: string) {}

  /**
   * 初始化 Worker
   */
  private initWorker(): void {
    if (this.worker)
      return

    try {
      // 尝试创建 Worker
      this.worker = new Worker(new URL(this.workerPath, import.meta.url), { type: 'module' })

      // 监听消息
      this.worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
        const { id, result, error } = event.data
        const task = this.tasks.get(id)

        if (task) {
          if (task.timeoutId) {
            clearTimeout(task.timeoutId)
          }

          if (error) {
            task.reject(new Error(error))
          }
          else {
            task.resolve(result)
          }

          this.tasks.delete(id)
          this.updateIdleState()
        }
      })

      // 监听错误
      this.worker.addEventListener('error', (error) => {
        console.error('Worker error:', error)
        // 拒绝所有待处理任务
        this.tasks.forEach((task) => {
          task.reject(new Error('Worker crashed'))
        })
        this.tasks.clear()
        this.terminate()
      })
    }
    catch (error) {
      console.error('Failed to create worker:', error)
      throw error
    }
  }

  /**
   * 发送任务到 Worker
   */
  async execute<T>(message: Omit<WorkerMessage, 'id'>, timeout?: number): Promise<T> {
    this.initWorker()

    const id = `${Date.now()}-${Math.random()}`
    const messageWithId: WorkerMessage = { ...message, id }

    return new Promise<T>((resolve, reject) => {
      const task: WorkerTask = {
        id,
        resolve,
        reject,
      }

      // 设置超时
      if (timeout) {
        task.timeoutId = setTimeout(() => {
          this.tasks.delete(id)
          reject(new Error('Worker task timeout'))
        }, timeout)
      }

      this.tasks.set(id, task)
      this.isIdle = false
      this.lastUsedTime = Date.now()

      // 发送消息到 Worker
      this.worker!.postMessage(messageWithId)
    })
  }

  /**
   * 更新空闲状态
   */
  private updateIdleState(): void {
    this.isIdle = this.tasks.size === 0
    if (this.isIdle) {
      this.lastUsedTime = Date.now()
    }
  }

  /**
   * 检查是否空闲
   */
  getIsIdle(): boolean {
    return this.isIdle
  }

  /**
   * 获取最后使用时间
   */
  getLastUsedTime(): number {
    return this.lastUsedTime
  }

  /**
   * 获取待处理任务数
   */
  getPendingTaskCount(): number {
    return this.tasks.size
  }

  /**
   * 终止 Worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.tasks.clear()
    this.isIdle = true
  }
}

/**
 * 优先级任务队列（最小堆实现）
 * 
 * 特性：
 * - O(log n) 插入和删除
 * - O(1) 获取最高优先级任务
 * - 支持自定义优先级
 * 
 * @example
 * ```ts
 * const queue = new PriorityQueue<string>()
 * queue.enqueue('low priority task', 10)
 * queue.enqueue('high priority task', 1)
 * console.log(queue.dequeue()) // 'high priority task'
 * ```
 */
export class PriorityQueue<T> {
  private heap: Array<{ priority: number, item: T, insertOrder: number }> = []
  private insertCounter = 0
  
  /**
   * 入队（数字越小优先级越高）
   */
  enqueue(item: T, priority: number = 0): void {
    this.heap.push({ 
      priority, 
      item, 
      insertOrder: this.insertCounter++ // 保证相同优先级按 FIFO
    })
    this.bubbleUp(this.heap.length - 1)
  }
  
  /**
   * 出队（获取最高优先级任务）
   */
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    if (this.heap.length === 1) return this.heap.pop()!.item
    
    const root = this.heap[0].item
    this.heap[0] = this.heap.pop()!
    this.bubbleDown(0)
    return root
  }
  
  /**
   * 查看队首
   */
  peek(): T | undefined {
    return this.heap[0]?.item
  }
  
  /**
   * 队列长度
   */
  get size(): number {
    return this.heap.length
  }
  
  /**
   * 是否为空
   */
  get isEmpty(): boolean {
    return this.heap.length === 0
  }
  
  /**
   * 上浮
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      const shouldSwap = 
        this.heap[index].priority < this.heap[parentIndex].priority ||
        (this.heap[index].priority === this.heap[parentIndex].priority && 
         this.heap[index].insertOrder < this.heap[parentIndex].insertOrder)
      
      if (!shouldSwap) break
      
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]]
      index = parentIndex
    }
  }
  
  /**
   * 下沉
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length
    while (true) {
      let smallest = index
      const left = 2 * index + 1
      const right = 2 * index + 2
      
      if (left < length) {
        const shouldSwap = 
          this.heap[left].priority < this.heap[smallest].priority ||
          (this.heap[left].priority === this.heap[smallest].priority && 
           this.heap[left].insertOrder < this.heap[smallest].insertOrder)
        if (shouldSwap) smallest = left
      }
      
      if (right < length) {
        const shouldSwap = 
          this.heap[right].priority < this.heap[smallest].priority ||
          (this.heap[right].priority === this.heap[smallest].priority && 
           this.heap[right].insertOrder < this.heap[smallest].insertOrder)
        if (shouldSwap) smallest = right
      }
      
      if (smallest === index) break
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]]
      index = smallest
    }
  }
  
  /**
   * 清空队列
   */
  clear(): void {
    this.heap = []
    this.insertCounter = 0
  }
}

/**
 * Worker 池管理器
 */
export class WorkerPool {
  private workers: WorkerInstance[] = []
  private options: Required<WorkerPoolOptions>
  private cleanupIntervalId?: NodeJS.Timeout

  constructor(options: WorkerPoolOptions = {}) {
    this.options = {
      maxWorkers: options.maxWorkers ?? (navigator.hardwareConcurrency || 4),
      workerPath: options.workerPath ?? '../workers/color.worker.ts',
      timeout: options.timeout ?? 30000,
      autoTerminate: options.autoTerminate ?? true,
      terminateDelay: options.terminateDelay ?? 60000,
    }

    // 启动自动清理
    if (this.options.autoTerminate) {
      this.startAutoCleanup()
    }
  }

  /**
   * 执行任务
   */
  async execute<T>(message: Omit<WorkerMessage, 'id'>): Promise<T> {
    // 获取或创建一个空闲的 Worker
    const worker = this.getOrCreateWorker()

    // 执行任务
    return worker.execute<T>(message, this.options.timeout)
  }
  
  /**
   * 带优先级和重试的任务执行
   * 
   * @param message 任务消息
   * @param options 执行选项
   * @returns 任务结果
   * 
   * @example
   * ```ts
   * const result = await pool.executeWithRetry({
   *   type: 'generate',
   *   payload: { primaryColor: '#165DFF' }
   * }, {
   *   priority: 'high',  // 高优先级
   *   maxRetries: 3,     // 最多重试3次
   *   retryDelay: 1000,  // 重试间隔
   *   timeout: 30000     // 超时时间
   * })
   * ```
   */
  async executeWithRetry<T>(
    message: Omit<WorkerMessage, 'id'>,
    options: {
      maxRetries?: number
      retryDelay?: number
      timeout?: number
      priority?: 'high' | 'normal' | 'low'
      onRetry?: (attempt: number, error: Error) => void
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3
    const retryDelay = options.retryDelay ?? 1000
    const timeout = options.timeout ?? this.options.timeout
    
    let lastError: Error | undefined
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const worker = this.getOrCreateWorker()
        return await worker.execute<T>(message, timeout)
      } catch (error) {
        lastError = error as Error
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxRetries) {
          throw new Error(`Worker task failed after ${maxRetries + 1} attempts: ${lastError.message}`)
        }
        
        // 回调通知
        if (options.onRetry) {
          options.onRetry(attempt + 1, lastError)
        }
        
        // 指数退避：第1次重试等待 1x delay，第2次等待 2x delay，以此类推
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }

  /**
   * 获取或创建 Worker
   */
  private getOrCreateWorker(): WorkerInstance {
    // 查找空闲的 Worker
    const idleWorker = this.workers.find(w => w.getIsIdle())
    if (idleWorker) {
      return idleWorker
    }

    // 如果没有空闲的且未达到最大数量，创建新的
    if (this.workers.length < this.options.maxWorkers) {
      const newWorker = new WorkerInstance(this.options.workerPath)
      this.workers.push(newWorker)
      return newWorker
    }

    // 找到负载最小的 Worker
    return this.workers.reduce((prev, curr) => {
      return prev.getPendingTaskCount() <= curr.getPendingTaskCount() ? prev : curr
    })
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupIntervalId = setInterval(() => {
      const now = Date.now()

      // 清理空闲超时的 Worker
      this.workers = this.workers.filter((worker) => {
        if (worker.getIsIdle() && now - worker.getLastUsedTime() > this.options.terminateDelay) {
          worker.terminate()
          return false
        }
        return true
      })
    }, 10000) // 每10秒检查一次
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalWorkers: number
    idleWorkers: number
    busyWorkers: number
    totalTasks: number
  } {
    const idleWorkers = this.workers.filter(w => w.getIsIdle()).length
    const totalTasks = this.workers.reduce((sum, w) => sum + w.getPendingTaskCount(), 0)

    return {
      totalWorkers: this.workers.length,
      idleWorkers,
      busyWorkers: this.workers.length - idleWorkers,
      totalTasks,
    }
  }

  /**
   * 终止所有 Worker
   */
  terminate(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = undefined
    }

    this.workers.forEach(worker => worker.terminate())
    this.workers = []
  }
}

/**
 * 默认 Worker 池实例
 */
let defaultPool: WorkerPool | null = null

/**
 * 获取默认 Worker 池
 */
export function getDefaultWorkerPool(): WorkerPool {
  if (!defaultPool) {
    defaultPool = new WorkerPool()
  }
  return defaultPool
}

/**
 * 使用 Worker 执行颜色计算
 */
export async function executeInWorker<T>(type: WorkerMessage['type'], payload: any): Promise<T> {
  const pool = getDefaultWorkerPool()
  return pool.execute<T>({ type, payload })
}

/**
 * 检查是否支持 Web Worker
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined'
}

/**
 * Worker 增强的颜色生成器
 */
export class WorkerColorGenerator {
  private pool: WorkerPool

  constructor(options?: WorkerPoolOptions) {
    this.pool = new WorkerPool(options)
  }

  /**
   * 生成颜色配置
   */
  async generate(primaryColor: string, mode: 'light' | 'dark', options?: any): Promise<any> {
    return this.pool.execute({
      type: 'generate',
      payload: { primaryColor, mode, options },
    })
  }

  /**
   * 转换颜色格式
   */
  async convert(
    color: string,
    from: 'hex' | 'rgb' | 'hsl' | 'hsv',
    to: 'hex' | 'rgb' | 'hsl' | 'hsv',
  ): Promise<string | null> {
    return this.pool.execute({
      type: 'convert',
      payload: { color, from, to },
    })
  }

  /**
   * 生成色阶
   */
  async generateScale(
    baseColor: string,
    count?: number,
    mode?: 'light' | 'dark' | 'both',
  ): Promise<string[]> {
    return this.pool.execute({
      type: 'scale',
      payload: { baseColor, count, mode },
    })
  }

  /**
   * 混合颜色
   */
  async blend(color1: string, color2: string, ratio?: number, mode?: string): Promise<string> {
    return this.pool.execute({
      type: 'blend',
      payload: { color1, color2, ratio, mode },
    })
  }

  /**
   * 生成渐变
   */
  async generateGradient(
    colors: string[],
    steps?: number,
    type?: 'linear' | 'radial',
  ): Promise<string[]> {
    return this.pool.execute({
      type: 'gradient',
      payload: { colors, steps, type },
    })
  }

  /**
   * 生成调色板
   */
  async generatePalette(
    baseColor: string,
    type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic',
    count?: number,
  ): Promise<string[]> {
    return this.pool.execute({
      type: 'palette',
      payload: { baseColor, type, count },
    })
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.pool.terminate()
  }
}
