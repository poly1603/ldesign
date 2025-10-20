/**
 * Worker Pool - Worker 线程池管理
 * 支持 Web Worker (浏览器) 和 Worker Threads (Node.js)
 */

import type { DecryptResult, EncryptResult } from '../types'
import type { WorkerMessage, WorkerResponse } from './crypto.worker'

/**
 * Worker 池配置选项
 */
export interface WorkerPoolOptions {
  /**
   * 线程池大小（默认为 CPU 核心数）
   */
  size?: number

  /**
   * 任务超时时间（毫秒，默认 30000）
   */
  timeout?: number

  /**
   * 是否自动启动 Worker（默认 true）
   */
  autoStart?: boolean

  /**
   * Worker 脚本路径（仅 Node.js）
   */
  workerPath?: string
}

/**
 * Worker 任务
 */
interface WorkerTask {
  id: string
  message: WorkerMessage
  resolve: (result: EncryptResult | DecryptResult) => void
  reject: (error: Error) => void
  timeout?: number
}

/**
 * Worker 实例包装
 */
interface WorkerInstance {
  id: number
  worker: Worker
  busy: boolean
  taskCount: number
}

/**
 * Worker 池统计信息
 */
export interface WorkerPoolStats {
  /**
   * 总 Worker 数量
   */
  totalWorkers: number

  /**
   * 空闲 Worker 数量
   */
  idleWorkers: number

  /**
   * 忙碌 Worker 数量
   */
  busyWorkers: number

  /**
   * 等待队列长度
   */
  queueLength: number

  /**
   * 完成任务数
   */
  completedTasks: number

  /**
   * 失败任务数
   */
  failedTasks: number

  /**
   * 平均任务执行时间（毫秒）
   */
  averageTaskTime: number
}

/**
 * Worker 线程池
 */
export class WorkerPool {
  private workers: WorkerInstance[] = []
  private taskQueue: WorkerTask[] = []
  private activeTasks = new Map<string, WorkerTask>()
  private options: Required<WorkerPoolOptions>
  private isInitialized = false
  private isNodeEnv = false
  private taskIdCounter = 0

  // 统计信息
  private stats = {
    completedTasks: 0,
    failedTasks: 0,
    totalTaskTime: 0,
  }

  constructor(options: WorkerPoolOptions = {}) {
    // Web环境
    this.isNodeEnv = false

    // 默认配置
    const defaultSize = navigator.hardwareConcurrency || 4

    this.options = {
      size: options.size || defaultSize,
      timeout: options.timeout || 30000,
      autoStart: options.autoStart !== false,
      workerPath: options.workerPath || '',
    }

    if (this.options.autoStart) {
      this.initialize()
    }
  }

  /**
   * 初始化 Worker 池
   */
  private initialize(): void {
    if (this.isInitialized) {
      return
    }

    try {
      for (let i = 0; i < this.options.size; i++) {
        this.createWorker(i)
      }
      this.isInitialized = true
    }
    catch (error) {
      console.error('Failed to initialize worker pool:', error)
      throw error
    }
  }

  /**
   * 创建 Worker 实例
   */
  private createWorker(id: number): void {
    try {
      // Web Worker
      // 注意：在实际使用中，需要配置打包工具正确处理 Worker 文件
      const workerUrl = new URL('./crypto.worker.ts', import.meta.url)
      const worker = new Worker(workerUrl, { type: 'module' })

      const instance: WorkerInstance = {
        id,
        worker,
        busy: false,
        taskCount: 0,
      }

      // 监听消息
      worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerResponse(instance, event.data)
      })
      worker.addEventListener('error', (event: ErrorEvent) => {
        this.handleWorkerError(instance, new Error(event.message))
      })

      this.workers.push(instance)
    }
    catch (error) {
      console.error(`Failed to create worker ${id}:`, error)
      throw error
    }
  }

  /**
   * 处理 Worker 响应
   */
  private handleWorkerResponse(worker: WorkerInstance, response: WorkerResponse): void {
    const task = this.activeTasks.get(response.id)
    if (!task) {
      return
    }

    // 清除超时
    if (task.timeout) {
      clearTimeout(task.timeout)
    }

    // 标记 Worker 为空闲
    worker.busy = false
    worker.taskCount++

    // 移除活动任务
    this.activeTasks.delete(response.id)

    // 更新统计
    this.stats.completedTasks++

    // 解析结果
    task.resolve(response.result)

    // 处理队列中的下一个任务
    this.processNextTask()
  }

  /**
   * 处理 Worker 错误
   */
  private handleWorkerError(worker: WorkerInstance, error: Error): void {
    // 查找此 Worker 的活动任务
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.timeout) {
        clearTimeout(task.timeout)
      }
      this.activeTasks.delete(taskId)
      this.stats.failedTasks++
      task.reject(error)
    }

    // 标记 Worker 为空闲
    worker.busy = false

    // 处理队列中的任务
    this.processNextTask()
  }

  /**
   * 处理队列中的下一个任务
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) {
      return
    }

    // 查找空闲 Worker
    const idleWorker = this.workers.find(w => !w.busy)
    if (!idleWorker) {
      return
    }

    // 获取下一个任务
    const task = this.taskQueue.shift()
    if (!task) {
      return
    }

    // 执行任务
    this.executeTask(idleWorker, task)
  }

  /**
   * 执行任务
   */
  private executeTask(worker: WorkerInstance, task: WorkerTask): void {
    worker.busy = true
    this.activeTasks.set(task.id, task)

    // 设置超时
    task.timeout = window.setTimeout(() => {
      this.activeTasks.delete(task.id)
      this.stats.failedTasks++
      worker.busy = false
      task.reject(new Error(`Task ${task.id} timeout after ${this.options.timeout}ms`))
      this.processNextTask()
    }, this.options.timeout) as unknown as number

    // 发送消息
    const startTime = Date.now()
    worker.worker.postMessage(task.message)

    // 记录开始时间
    const activeTask = this.activeTasks.get(task.id)
    if (activeTask) {
      activeTask.resolve = ((originalResolve) => {
        return (result: EncryptResult | DecryptResult) => {
          const elapsed = Date.now() - startTime
          this.stats.totalTaskTime += elapsed
          originalResolve(result)
        }
      })(task.resolve)
    }
  }

  /**
   * 提交加密任务
   */
  async encrypt(
    data: string,
    key: string,
    algorithm: string,
    options?: Record<string, unknown>,
  ): Promise<EncryptResult> {
    if (!this.isInitialized) {
      this.initialize()
    }

    const taskId = `encrypt-${++this.taskIdCounter}-${Date.now()}`

    return new Promise<EncryptResult>((resolve, reject) => {
      const task: WorkerTask = {
        id: taskId,
        message: {
          id: taskId,
          type: 'encrypt',
          algorithm,
          data,
          key,
          options,
        },
        resolve: resolve as (result: EncryptResult | DecryptResult) => void,
        reject,
      }

      // 查找空闲 Worker
      const idleWorker = this.workers.find(w => !w.busy)
      if (idleWorker) {
        this.executeTask(idleWorker, task)
      }
      else {
        // 加入队列
        this.taskQueue.push(task)
      }
    })
  }

  /**
   * 提交解密任务
   */
  async decrypt(
    data: string,
    key: string,
    algorithm: string,
    options?: Record<string, unknown>,
  ): Promise<DecryptResult> {
    if (!this.isInitialized) {
      this.initialize()
    }

    const taskId = `decrypt-${++this.taskIdCounter}-${Date.now()}`

    return new Promise<DecryptResult>((resolve, reject) => {
      const task: WorkerTask = {
        id: taskId,
        message: {
          id: taskId,
          type: 'decrypt',
          algorithm,
          data,
          key,
          options,
        },
        resolve: resolve as (result: EncryptResult | DecryptResult) => void,
        reject,
      }

      // 查找空闲 Worker
      const idleWorker = this.workers.find(w => !w.busy)
      if (idleWorker) {
        this.executeTask(idleWorker, task)
      }
      else {
        // 加入队列
        this.taskQueue.push(task)
      }
    })
  }

  /**
   * 批量加密
   */
  async batchEncrypt(
    operations: Array<{
      data: string
      key: string
      algorithm: string
      options?: Record<string, unknown>
    }>,
  ): Promise<EncryptResult[]> {
    if (!this.isInitialized) {
      this.initialize()
    }

    const promises = operations.map(op =>
      this.encrypt(op.data, op.key, op.algorithm, op.options),
    )

    return Promise.all(promises)
  }

  /**
   * 批量解密
   */
  async batchDecrypt(
    operations: Array<{
      data: string
      key: string
      algorithm: string
      options?: Record<string, unknown>
    }>,
  ): Promise<DecryptResult[]> {
    if (!this.isInitialized) {
      this.initialize()
    }

    const promises = operations.map(op =>
      this.decrypt(op.data, op.key, op.algorithm, op.options),
    )

    return Promise.all(promises)
  }

  /**
   * 获取统计信息
   */
  getStats(): WorkerPoolStats {
    const idleWorkers = this.workers.filter(w => !w.busy).length
    const busyWorkers = this.workers.length - idleWorkers

    return {
      totalWorkers: this.workers.length,
      idleWorkers,
      busyWorkers,
      queueLength: this.taskQueue.length,
      completedTasks: this.stats.completedTasks,
      failedTasks: this.stats.failedTasks,
      averageTaskTime:
        this.stats.completedTasks > 0
          ? this.stats.totalTaskTime / this.stats.completedTasks
          : 0,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      completedTasks: 0,
      failedTasks: 0,
      totalTaskTime: 0,
    }
  }

  /**
   * 终止所有 Worker
   */
  async terminate(): Promise<void> {
    // 清除所有待处理任务
    for (const task of this.taskQueue) {
      if (task.timeout) {
        clearTimeout(task.timeout)
      }
      task.reject(new Error('Worker pool terminated'))
    }
    this.taskQueue = []

    // 清除所有活动任务
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.timeout) {
        clearTimeout(task.timeout)
      }
      task.reject(new Error('Worker pool terminated'))
      this.activeTasks.delete(taskId)
    }

    // 终止所有 Worker
    for (const instance of this.workers) {
      if (this.isNodeEnv) {
        await instance.worker.terminate()
      }
      else {
        instance.worker.terminate()
      }
    }

    this.workers = []
    this.isInitialized = false
  }

  /**
   * 获取池大小
   */
  get size(): number {
    return this.workers.length
  }

  /**
   * 是否已初始化
   */
  get initialized(): boolean {
    return this.isInitialized
  }
}

/**
 * 全局 Worker 池实例
 */
let globalWorkerPool: WorkerPool | null = null

/**
 * 获取全局 Worker 池
 */
export function getGlobalWorkerPool(options?: WorkerPoolOptions): WorkerPool {
  if (!globalWorkerPool) {
    globalWorkerPool = new WorkerPool(options)
  }
  return globalWorkerPool
}

/**
 * 销毁全局 Worker 池
 */
export async function destroyGlobalWorkerPool(): Promise<void> {
  if (globalWorkerPool) {
    await globalWorkerPool.terminate()
    globalWorkerPool = null
  }
}
