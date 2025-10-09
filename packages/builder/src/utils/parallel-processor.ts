/**
 * 并行处理器
 * 
 * 提供高效的并行任务处理能力，支持任务队列、优先级、超时等
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import * as os from 'os'
import { Logger } from './logger'

/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

/**
 * 任务定义
 */
export interface Task<T = any, R = any> {
  id: string
  fn: (data: T) => Promise<R>
  data: T
  priority?: number
  timeout?: number
  retries?: number
  onProgress?: (progress: number) => void
}

/**
 * 任务结果
 */
export interface TaskResult<R = any> {
  id: string
  status: TaskStatus
  result?: R
  error?: Error
  duration: number
  retryCount: number
}

/**
 * 并行处理器选项
 */
export interface ParallelProcessorOptions {
  /** 最大并发数 */
  maxConcurrency?: number
  /** 默认超时时间 (ms) */
  defaultTimeout?: number
  /** 默认重试次数 */
  defaultRetries?: number
  /** 是否启用优先级队列 */
  enablePriority?: boolean
  /** 是否自动调整并发数 */
  autoAdjustConcurrency?: boolean
}

/**
 * 并行处理器
 */
export class ParallelProcessor extends EventEmitter {
  private maxConcurrency: number
  private defaultTimeout: number
  private defaultRetries: number
  private enablePriority: boolean
  private autoAdjustConcurrency: boolean
  private logger: Logger

  private runningTasks = new Map<string, { task: Task; startTime: number }>()
  private pendingTasks: Task[] = []
  private completedTasks: TaskResult[] = []
  private currentConcurrency = 0

  constructor(options: ParallelProcessorOptions = {}) {
    super()
    
    this.maxConcurrency = options.maxConcurrency || Math.max(1, os.cpus().length - 1)
    this.defaultTimeout = options.defaultTimeout || 30000
    this.defaultRetries = options.defaultRetries || 0
    this.enablePriority = options.enablePriority !== false
    this.autoAdjustConcurrency = options.autoAdjustConcurrency || false
    this.logger = new Logger({ prefix: 'ParallelProcessor' })

    this.logger.debug(`初始化并行处理器，最大并发数: ${this.maxConcurrency}`)
  }

  /**
   * 添加任务
   */
  addTask<T, R>(task: Task<T, R>): void {
    const fullTask: Task<T, R> = {
      ...task,
      priority: task.priority ?? 0,
      timeout: task.timeout ?? this.defaultTimeout,
      retries: task.retries ?? this.defaultRetries
    }

    this.pendingTasks.push(fullTask)

    // 如果启用优先级，按优先级排序
    if (this.enablePriority) {
      this.pendingTasks.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    }

    this.emit('task:added', task.id)
    this.processQueue()
  }

  /**
   * 批量添加任务
   */
  addTasks<T, R>(tasks: Task<T, R>[]): void {
    tasks.forEach(task => this.addTask(task))
  }

  /**
   * 处理任务队列
   */
  private async processQueue(): Promise<void> {
    while (
      this.pendingTasks.length > 0 &&
      this.currentConcurrency < this.maxConcurrency
    ) {
      const task = this.pendingTasks.shift()
      if (!task) break

      this.currentConcurrency++
      this.runTask(task)
    }
  }

  /**
   * 运行单个任务
   */
  private async runTask<T, R>(task: Task<T, R>): Promise<void> {
    const startTime = Date.now()
    this.runningTasks.set(task.id, { task, startTime })
    this.emit('task:start', task.id)

    let retryCount = 0
    let lastError: Error | undefined

    while (retryCount <= (task.retries || 0)) {
      try {
        const result = await this.executeWithTimeout(task)
        
        const taskResult: TaskResult<R> = {
          id: task.id,
          status: TaskStatus.COMPLETED,
          result,
          duration: Date.now() - startTime,
          retryCount
        }

        this.completedTasks.push(taskResult)
        this.emit('task:complete', taskResult)
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (retryCount < (task.retries || 0)) {
          retryCount++
          this.logger.debug(`任务 ${task.id} 失败，重试 ${retryCount}/${task.retries}`)
          this.emit('task:retry', { id: task.id, retryCount, error: lastError })
          
          // 指数退避
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 10000)))
        } else {
          const taskResult: TaskResult = {
            id: task.id,
            status: TaskStatus.FAILED,
            error: lastError,
            duration: Date.now() - startTime,
            retryCount
          }

          this.completedTasks.push(taskResult)
          this.emit('task:failed', taskResult)
          break
        }
      }
    }

    this.runningTasks.delete(task.id)
    this.currentConcurrency--

    // 自动调整并发数
    if (this.autoAdjustConcurrency) {
      this.adjustConcurrency()
    }

    // 继续处理队列
    this.processQueue()
  }

  /**
   * 带超时的任务执行
   */
  private async executeWithTimeout<T, R>(task: Task<T, R>): Promise<R> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`任务 ${task.id} 超时 (${task.timeout}ms)`))
      }, task.timeout!)

      task.fn(task.data)
        .then(result => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  /**
   * 自动调整并发数
   */
  private adjustConcurrency(): void {
    const memUsage = process.memoryUsage()
    const heapUsedRatio = memUsage.heapUsed / memUsage.heapTotal

    // 如果内存使用率过高，降低并发数
    if (heapUsedRatio > 0.85 && this.maxConcurrency > 1) {
      this.maxConcurrency = Math.max(1, this.maxConcurrency - 1)
      this.logger.debug(`降低并发数至 ${this.maxConcurrency}`)
    }
    // 如果内存使用率较低，可以增加并发数
    else if (heapUsedRatio < 0.5 && this.maxConcurrency < os.cpus().length) {
      this.maxConcurrency = Math.min(os.cpus().length, this.maxConcurrency + 1)
      this.logger.debug(`提升并发数至 ${this.maxConcurrency}`)
    }
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    // 从待处理队列中移除
    const index = this.pendingTasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      this.pendingTasks.splice(index, 1)
      this.emit('task:cancelled', taskId)
      return true
    }

    // 正在运行的任务无法取消（可以扩展支持 AbortController）
    return false
  }

  /**
   * 等待所有任务完成
   */
  async waitAll(): Promise<TaskResult[]> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.pendingTasks.length === 0 && this.runningTasks.size === 0) {
          resolve(this.completedTasks)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    pending: number
    running: number
    completed: number
    failed: number
    maxConcurrency: number
    currentConcurrency: number
  } {
    const failed = this.completedTasks.filter(t => t.status === TaskStatus.FAILED).length

    return {
      pending: this.pendingTasks.length,
      running: this.runningTasks.size,
      completed: this.completedTasks.length,
      failed,
      maxConcurrency: this.maxConcurrency,
      currentConcurrency: this.currentConcurrency
    }
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.pendingTasks = []
    this.completedTasks = []
    this.emit('cleared')
  }
}

/**
 * 创建并行处理器
 */
export function createParallelProcessor(
  options?: ParallelProcessorOptions
): ParallelProcessor {
  return new ParallelProcessor(options)
}

