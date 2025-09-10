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
    if (this.worker) return
    
    try {
      // 尝试创建 Worker
      this.worker = new Worker(
        new URL(this.workerPath, import.meta.url),
        { type: 'module' }
      )
      
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
          } else {
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
        this.tasks.forEach(task => {
          task.reject(new Error('Worker crashed'))
        })
        this.tasks.clear()
        this.terminate()
      })
    } catch (error) {
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
      this.workers = this.workers.filter(worker => {
        if (
          worker.getIsIdle() &&
          now - worker.getLastUsedTime() > this.options.terminateDelay
        ) {
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
export async function executeInWorker<T>(
  type: WorkerMessage['type'],
  payload: any
): Promise<T> {
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
    to: 'hex' | 'rgb' | 'hsl' | 'hsv'
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
    mode?: 'light' | 'dark' | 'both'
  ): Promise<string[]> {
    return this.pool.execute({
      type: 'scale',
      payload: { baseColor, count, mode },
    })
  }
  
  /**
   * 混合颜色
   */
  async blend(
    color1: string,
    color2: string,
    ratio?: number,
    mode?: string
  ): Promise<string> {
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
    type?: 'linear' | 'radial'
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
    count?: number
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
