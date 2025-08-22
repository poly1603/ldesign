/**
 * Worker管理器 - WebWorker支持架构
 * 提供多线程渲染的基础设施
 */

import type {
  PdfError,
  TaskPriority,
  WorkerManagerOptions,
  WorkerMessage,
  WorkerResponse,
  WorkerStatistics,
  WorkerTask,
} from '../types'
import { ErrorCode } from '../types'

/**
 * Worker实例信息
 */
interface WorkerInstance {
  id: string
  worker: Worker
  busy: boolean
  currentTask?: WorkerTask | undefined
  createdAt: number
  completedTasks: number
  failedTasks: number
}

/**
 * Worker管理器
 * 负责Worker的创建、销毁和任务分配
 */
export class WorkerManager {
  private readonly maxWorkers: number
  private readonly workerScript: string
  private readonly enableLogging: boolean
  private readonly taskTimeout: number
  private readonly maxRetries: number

  private workers = new Map<string, WorkerInstance>()
  private taskQueue: WorkerTask[] = []
  private activeTasks = new Map<string, WorkerTask>()
  private pendingMessages = new Map<string, (response: WorkerResponse) => void>()

  private totalTasks = 0
  private completedTasks = 0
  private failedTasks = 0
  private taskTimes: number[] = []

  private destroyed = false

  constructor(options: WorkerManagerOptions = {}) {
    this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4
    this.workerScript = options.workerScript || this.getDefaultWorkerScript()
    this.enableLogging = options.enableLogging || false
    this.taskTimeout = options.taskTimeout || 30000 // 30秒
    this.maxRetries = options.maxRetries || 3

    this.log('WorkerManager initialized', {
      maxWorkers: this.maxWorkers,
      workerScript: this.workerScript,
    })
  }

  /**
   * 初始化Worker管理器
   */
  async initialize(): Promise<void> {
    if (this.destroyed) {
      throw new Error('WorkerManager has been destroyed')
    }

    // 创建初始Worker
    const initialWorkers = Math.min(2, this.maxWorkers)
    const promises = []

    for (let i = 0; i < initialWorkers; i++) {
      promises.push(this.createWorker())
    }

    await Promise.all(promises)
    this.log(`Initialized with ${initialWorkers} workers`)
  }

  /**
   * 执行任务（新接口）
   */
  async execute(task: Pick<WorkerTask, 'type' | 'data' | 'priority'>): Promise<any> {
    return this.executeTask(task.type, task.data, task.priority)
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): void {
    // 从队列中移除
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId)
    if (queueIndex !== -1) {
      const task = this.taskQueue.splice(queueIndex, 1)[0]
      task.reject(new Error('Task cancelled'))
      return
    }

    // 取消活动任务
    const activeTask = this.activeTasks.get(taskId)
    if (activeTask) {
      activeTask.reject(new Error('Task cancelled'))
      this.activeTasks.delete(taskId)
    }
  }

  /**
   * 获取任务ID（用于测试）
   */
  async getTaskId(taskPromise: Promise<any>): Promise<string> {
    // 这是一个模拟方法，实际实现可能不同
    return this.generateTaskId()
  }

  /**
   * 执行任务
   */
  async executeTask<T = any>(
    type: string,
    data: any,
    priority: TaskPriority = 'normal',
  ): Promise<T> {
    if (this.destroyed) {
      throw new Error('WorkerManager has been destroyed')
    }

    return new Promise<T>((resolve, reject) => {
      const task: WorkerTask = {
        id: this.generateTaskId(),
        type,
        data,
        priority,
        status: 'pending',
        retries: 0,
        maxAttempts: this.maxRetries,
        resolve,
        reject,
      }

      this.totalTasks++
      this.queueTask(task)
      this.processQueue()
    })
  }

  /**
   * 获取统计信息
   */
  getStatistics(): WorkerStatistics {
    const averageTaskTime = this.taskTimes.length > 0
      ? this.taskTimes.reduce((sum, time) => sum + time, 0) / this.taskTimes.length
      : 0

    return {
      totalTasks: this.totalTasks,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      activeWorkers: this.workers.size,
      queuedTasks: this.taskQueue.length,
      averageTaskTime,
    }
  }

  /**
   * 销毁Worker管理器
   */
  destroy(): void {
    if (this.destroyed)
      return

    this.destroyed = true

    // 取消所有待处理任务
    for (const task of this.taskQueue) {
      task.reject(new Error('WorkerManager destroyed'))
    }
    this.taskQueue.length = 0

    // 取消所有活动任务
    for (const task of this.activeTasks.values()) {
      task.reject(new Error('WorkerManager destroyed'))
    }
    this.activeTasks.clear()

    // 销毁所有Worker
    for (const workerInstance of this.workers.values()) {
      this.destroyWorker(workerInstance.id)
    }
    this.workers.clear()

    this.pendingMessages.clear()
    this.log('WorkerManager destroyed')
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 创建Worker
   */
  private async createWorker(): Promise<WorkerInstance> {
    const workerId = this.generateWorkerId()

    try {
      const worker = new Worker(this.workerScript)

      const workerInstance: WorkerInstance = {
        id: workerId,
        worker,
        busy: false,
        currentTask: undefined as WorkerTask | undefined,
        createdAt: Date.now(),
        completedTasks: 0,
        failedTasks: 0,
      }

      // 设置消息处理器
      worker.onmessage = (event) => {
        this.handleWorkerMessage(workerId, event.data)
      }

      worker.onerror = (error) => {
        this.handleWorkerError(workerId, error)
      }

      // 初始化Worker
      await this.initializeWorker(workerInstance)

      this.workers.set(workerId, workerInstance)
      this.log(`Worker ${workerId} created`)

      return workerInstance
    }
    catch (error) {
      this.log(`Failed to create worker ${workerId}:`, error)
      throw error
    }
  }

  /**
   * 初始化Worker
   */
  private async initializeWorker(workerInstance: WorkerInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId()
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(messageId)
        reject(new Error('Worker initialization timeout'))
      }, 5000)

      this.pendingMessages.set(messageId, (response) => {
        clearTimeout(timeout)
        if (response.type === 'success') {
          resolve()
        }
        else {
          reject(new Error(response.error as string))
        }
      })

      const initMessage: WorkerMessage = {
        id: messageId,
        type: 'init',
        payload: {
          workerId: workerInstance.id,
          options: {
            enableLogging: this.enableLogging,
          },
        },
      }

      workerInstance.worker.postMessage(initMessage)
    })
  }

  /**
   * 销毁Worker
   */
  private destroyWorker(workerId: string): void {
    const workerInstance = this.workers.get(workerId)
    if (!workerInstance)
      return

    try {
      // 如果Worker正在执行任务，取消任务
      if (workerInstance.currentTask) {
        this.failTask(workerInstance.currentTask, 'Worker destroyed')
        workerInstance.currentTask = undefined as WorkerTask | undefined
      }

      // 发送销毁消息
      const destroyMessage: WorkerMessage = {
        id: this.generateMessageId(),
        type: 'destroy',
      }
      workerInstance.worker.postMessage(destroyMessage)

      // 终止Worker
      workerInstance.worker.terminate()

      this.workers.delete(workerId)
      this.log(`Worker ${workerId} destroyed`)
    }
    catch (error) {
      this.log(`Error destroying worker ${workerId}:`, error)
    }
  }

  /**
   * 处理Worker消息
   */
  private handleWorkerMessage(workerId: string, message: WorkerResponse): void {
    this.log(`Received message from worker ${workerId}:`, message)

    // 处理初始化响应
    const pendingCallback = this.pendingMessages.get(message.id)
    if (pendingCallback) {
      this.pendingMessages.delete(message.id)
      pendingCallback(message)
      return
    }

    // 处理任务响应
    const task = this.activeTasks.get(message.id)
    if (!task) {
      this.log(`Received response for unknown task ${message.id}`)
      return
    }

    const workerInstance = this.workers.get(workerId)
    if (workerInstance) {
      workerInstance.busy = false
      workerInstance.currentTask = undefined as WorkerTask | undefined
    }

    this.activeTasks.delete(message.id)

    if (message.type === 'success') {
      this.completeTask(task, message.data)
      if (workerInstance) {
        workerInstance.completedTasks++
      }
    }
    else {
      this.failTask(task, message.error as string)
      if (workerInstance) {
        workerInstance.failedTasks++
      }
    }

    // 处理队列中的下一个任务
    this.processQueue()
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(workerId: string, error: ErrorEvent): void {
    this.log(`Worker ${workerId} error:`, error)

    const workerInstance = this.workers.get(workerId)
    if (workerInstance?.currentTask) {
      this.failTask(workerInstance.currentTask, `Worker error: ${error.message}`)
    }

    // 重新创建Worker
    this.destroyWorker(workerId)
    if (!this.destroyed && this.workers.size < this.maxWorkers) {
      this.createWorker().catch((err) => {
        this.log('Failed to recreate worker:', err)
      })
    }
  }

  /**
   * 将任务加入队列
   */
  private queueTask(task: WorkerTask): void {
    // 按优先级插入
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
    const taskPriority = priorityOrder[task.priority]

    let insertIndex = this.taskQueue.length
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuedTask = this.taskQueue[i]
      if (!queuedTask)
        continue
      const queuedTaskPriority = priorityOrder[queuedTask.priority]
      if (taskPriority < queuedTaskPriority) {
        insertIndex = i
        break
      }
    }

    this.taskQueue.splice(insertIndex, 0, task)
    this.log(`Task ${task.id} queued with priority ${task.priority}`)
  }

  /**
   * 处理任务队列
   */
  private processQueue(): void {
    if (this.destroyed || this.taskQueue.length === 0) {
      return
    }

    // 查找空闲Worker
    const availableWorker = this.findAvailableWorker()
    if (!availableWorker) {
      // 如果没有空闲Worker且未达到最大数量，创建新Worker
      if (this.workers.size < this.maxWorkers) {
        this.createWorker().then(() => {
          this.processQueue()
        }).catch((error) => {
          this.log('Failed to create worker for queue processing:', error)
        })
      }
      return
    }

    // 分配任务
    const task = this.taskQueue.shift()!
    this.assignTaskToWorker(task, availableWorker)
  }

  /**
   * 查找可用Worker
   */
  private findAvailableWorker(): WorkerInstance | null {
    for (const workerInstance of this.workers.values()) {
      if (!workerInstance.busy) {
        return workerInstance
      }
    }
    return null
  }

  /**
   * 将任务分配给Worker
   */
  private assignTaskToWorker(task: WorkerTask, workerInstance: WorkerInstance): void {
    task.status = 'running'
    workerInstance.busy = true
    workerInstance.currentTask = task

    this.activeTasks.set(task.id, task)

    const message: WorkerMessage = {
      id: task.id,
      type: task.type as any,
      data: task.data,
      payload: task.data,
    }

    workerInstance.worker.postMessage(message)

    // 设置任务超时
    setTimeout(() => {
      if (this.activeTasks.has(task.id)) {
        this.failTask(task, 'Task timeout')
        workerInstance.busy = false
        workerInstance.currentTask = undefined
        this.activeTasks.delete(task.id)
      }
    }, this.taskTimeout)

    this.log(`Task ${task.id} assigned to worker ${workerInstance.id}`)
  }

  /**
   * 完成任务
   */
  private completeTask(task: WorkerTask, result: any): void {
    const startTime = Date.now()
    task.status = 'completed'
    this.completedTasks++

    // 记录任务时间（估算）
    const taskTime = Date.now() - startTime
    this.taskTimes.push(taskTime)
    if (this.taskTimes.length > 100) {
      this.taskTimes.shift() // 保持最近100个任务的时间
    }

    task.resolve(result)
    this.log(`Task ${task.id} completed`)
  }

  /**
   * 任务失败
   */
  private failTask(task: WorkerTask, errorMessage: string): void {
    task.retries++

    if (task.retries < task.maxAttempts) {
      // 重试任务
      task.status = 'pending'
      this.queueTask(task)
      this.log(`Task ${task.id} failed, retrying (${task.retries}/${task.maxAttempts})`)
      this.processQueue()
    }
    else {
      // 任务最终失败
      task.status = 'failed'
      this.failedTasks++

      const error = new Error(errorMessage) as PdfError
      error.code = ErrorCode.WORKER_ERROR
      task.reject(error)

      this.log(`Task ${task.id} failed permanently: ${errorMessage}`)
    }
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成Worker ID
   */
  private generateWorkerId(): string {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取默认Worker脚本
   */
  private getDefaultWorkerScript(): string {
    // 这里应该返回实际的Worker脚本路径
    // 在实际项目中，这应该是构建后的Worker文件路径
    return '/pdf-worker.js'
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.warn(`[WorkerManager] ${message}`, ...args)
    }
  }
}

/**
 * 创建Worker管理器
 */
export function createWorkerManager(options: WorkerManagerOptions = {}): WorkerManager {
  return new WorkerManager(options)
}

/**
 * 默认Worker管理器实例
 */
export const defaultWorkerManager = createWorkerManager()
