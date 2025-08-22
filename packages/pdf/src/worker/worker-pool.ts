/**
 * Worker池管理器
 * 负责Worker实例的创建、管理和复用
 */

import type { WorkerConfig } from '../types'

/**
 * Worker池统计信息
 */
export interface WorkerPoolStatistics {
  totalWorkers: number
  idleWorkers: number
  busyWorkers: number
  createdWorkers: number
  destroyedWorkers: number
}

/**
 * Worker实例信息
 */
interface PoolWorkerInstance {
  id: string
  worker: Worker
  busy: boolean
  createdAt: number
  lastUsed: number
}

/**
 * Worker池管理器
 * 管理Worker的创建、复用和生命周期
 */
export class WorkerPool {
  private readonly maxWorkers: number
  private readonly workerScript: string
  private readonly enableLogging: boolean

  private workers = new Map<string, PoolWorkerInstance>()
  private idleWorkers: string[] = []
  private busyWorkers = new Set<string>()
  private waitingQueue: Array<(worker: Worker) => void> = []

  private createdCount = 0
  private destroyedCount = 0
  private destroyed = false

  constructor(config: Partial<WorkerConfig> = {}) {
    this.maxWorkers = config.maxWorkers || navigator.hardwareConcurrency || 4
    this.workerScript = config.workerScript || '/pdf.worker.js'
    this.enableLogging = config.enableLogging || false

    this.log('WorkerPool initialized', {
      maxWorkers: this.maxWorkers,
      workerScript: this.workerScript,
    })
  }

  /**
   * 获取Worker池大小
   */
  get size(): number {
    return this.workers.size
  }

  /**
   * 获取Worker实例
   */
  getWorker(): Worker | Promise<Worker> {
    if (this.destroyed) {
      throw new Error('WorkerPool has been destroyed')
    }

    // 如果有空闲Worker，直接返回
    if (this.idleWorkers.length > 0) {
      const workerId = this.idleWorkers.shift()!
      const workerInstance = this.workers.get(workerId)!

      workerInstance.busy = true
      workerInstance.lastUsed = Date.now()

      this.idleWorkers.splice(this.idleWorkers.indexOf(workerId), 1)
      this.busyWorkers.add(workerId)

      this.log(`Reusing worker ${workerId}`)
      return workerInstance.worker
    }

    // 如果可以创建新Worker，创建并返回
    if (this.workers.size < this.maxWorkers) {
      return this.createWorker()
    }

    // 如果达到限制，返回Promise等待Worker可用
    return new Promise<Worker>((resolve) => {
      this.waitingQueue.push(resolve)
      this.log('Worker requested but pool is full, added to waiting queue')
    })
  }

  /**
   * 释放Worker
   */
  releaseWorker(worker: Worker): void {
    if (this.destroyed) {
      return
    }

    const workerId = this.findWorkerIdByInstance(worker)
    if (!workerId) {
      this.log('Attempted to release unknown worker')
      return
    }

    const workerInstance = this.workers.get(workerId)!
    workerInstance.busy = false
    workerInstance.lastUsed = Date.now()

    this.busyWorkers.delete(workerId)

    // 如果有等待的请求，直接分配给它们
    if (this.waitingQueue.length > 0) {
      const resolver = this.waitingQueue.shift()!
      workerInstance.busy = true
      this.busyWorkers.add(workerId)
      resolver(worker)
      this.log(`Worker ${workerId} assigned to waiting request`)
    } else {
      this.idleWorkers.push(workerId)
      this.log(`Worker ${workerId} released to idle pool`)
    }
  }

  /**
   * 移除Worker
   */
  removeWorker(worker: Worker): void {
    if (this.destroyed) {
      return
    }

    const workerId = this.findWorkerIdByInstance(worker)
    if (!workerId) {
      return
    }

    this.destroyWorkerById(workerId)
  }

  /**
   * 获取统计信息
   */
  getStatistics(): WorkerPoolStatistics {
    return {
      totalWorkers: this.workers.size,
      idleWorkers: this.idleWorkers.length,
      busyWorkers: this.busyWorkers.size,
      createdWorkers: this.createdCount,
      destroyedWorkers: this.destroyedCount,
    }
  }

  /**
   * 销毁Worker池
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    // 取消所有等待的请求
    for (const resolver of this.waitingQueue) {
      resolver = () => {
        throw new Error('WorkerPool has been destroyed')
      }
    }
    this.waitingQueue.length = 0

    // 销毁所有Worker
    for (const workerId of this.workers.keys()) {
      this.destroyWorkerById(workerId)
    }

    this.workers.clear()
    this.idleWorkers.length = 0
    this.busyWorkers.clear()

    this.log('WorkerPool destroyed')
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 创建新Worker
   */
  private createWorker(): Worker {
    const workerId = this.generateWorkerId()

    try {
      const worker = new Worker(this.workerScript)

      const workerInstance: PoolWorkerInstance = {
        id: workerId,
        worker,
        busy: true, // 新创建的Worker默认是忙碌状态
        createdAt: Date.now(),
        lastUsed: Date.now(),
      }

      this.workers.set(workerId, workerInstance)
      this.busyWorkers.add(workerId)
      this.createdCount++

      this.log(`Created worker ${workerId}`)
      return worker
    } catch (error) {
      this.log(`Failed to create worker: ${error}`)
      throw error
    }
  }

  /**
   * 销毁指定Worker
   */
  private destroyWorkerById(workerId: string): void {
    const workerInstance = this.workers.get(workerId)
    if (!workerInstance) {
      return
    }

    try {
      workerInstance.worker.terminate()
    } catch (error) {
      this.log(`Error terminating worker ${workerId}: ${error}`)
    }

    this.workers.delete(workerId)
    this.idleWorkers.splice(this.idleWorkers.indexOf(workerId), 1)
    this.busyWorkers.delete(workerId)
    this.destroyedCount++

    this.log(`Destroyed worker ${workerId}`)
  }

  /**
   * 根据Worker实例查找ID
   */
  private findWorkerIdByInstance(worker: Worker): string | undefined {
    for (const [workerId, workerInstance] of this.workers.entries()) {
      if (workerInstance.worker === worker) {
        return workerId
      }
    }
    return undefined
  }

  /**
   * 生成Worker ID
   */
  private generateWorkerId(): string {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 日志记录
   */
  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[WorkerPool] ${message}`, data || '')
    }
  }
}