/**
 * 请求优先级管理模块
 * 提供请求优先级调度和队列管理功能
 */

import type { RequestConfig } from '../types'

/**
 * 请求优先级级别
 */
export enum Priority {
  CRITICAL = 0, // 关键请求（最高优先级）
  HIGH = 1, // 高优先级
  NORMAL = 2, // 正常优先级
  LOW = 3, // 低优先级
  IDLE = 4, // 空闲时执行
}

/**
 * 优先级请求项
 */
export interface PriorityItem<T = any> {
  id: string
  priority: Priority
  config: RequestConfig
  executor: () => Promise<T>
  resolve: (value: T) => void
  reject: (reason: any) => void
  timestamp: number
  retryCount?: number
  abortController?: AbortController
}

/**
 * 优先级队列配置
 */
export interface PriorityQueueConfig {
  maxConcurrent?: number
  maxQueueSize?: number
  queueTimeout?: number // 队列超时时间(ms)
  priorityBoost?: boolean // 是否启用等待时间提权
  boostInterval?: number // 提权间隔时间(ms)
}

/**
 * 优先级队列统计
 */
export interface PriorityQueueStats {
  totalQueued: number
  totalProcessed: number
  totalFailed: number
  currentActive: number
  queuedByPriority: Record<Priority, number>
  averageWaitTime: number
  averageProcessTime: number
}

/**
 * 优先级请求队列（优化版）
 *
 * 优化点：
 * 1. 按需触发提权检查，而非定时检查
 * 2. 使用索引优化查找
 * 3. 减少不必要的遍历
 */
export class PriorityQueue<T = any> {
  private queue: Map<Priority, PriorityItem<T>[]> = new Map()
  private active = new Set<string>()
  private config: Required<PriorityQueueConfig>
  private stats = {
    totalQueued: 0,
    totalProcessed: 0,
    totalFailed: 0,
    waitTimes: [] as number[],
    processTimes: [] as number[],
  }

  private processing = false
  private boostTimer?: NodeJS.Timeout
  private lastBoostCheck = 0 // 上次提权检查时间

  constructor(config: PriorityQueueConfig = {}) {
    this.config = {
      maxConcurrent: 6,
      maxQueueSize: 100,
      queueTimeout: 30000,
      priorityBoost: true,
      boostInterval: 5000,
      ...config,
    }

    // 初始化各优先级队列
    for (const priority of Object.values(Priority)) {
      if (typeof priority === 'number') {
        this.queue.set(priority, [])
      }
    }

    // 启动优先级提升定时器（优化：只在有队列项时运行）
    if (this.config.priorityBoost) {
      this.startPriorityBoost()
    }
  }

  /**
   * 添加请求到队列
   */
  async enqueue(
    config: RequestConfig,
    executor: () => Promise<T>,
    priority: Priority = Priority.NORMAL,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 检查队列大小
      if (this.getTotalQueueSize() >= this.config.maxQueueSize) {
        reject(new Error('Queue is full'))
        return
      }

      const item: PriorityItem<T> = {
        id: this.generateId(),
        priority,
        config,
        executor,
        resolve,
        reject,
        timestamp: Date.now(),
        abortController: new AbortController(),
      }

      // 添加到对应优先级队列
      const priorityQueue = this.queue.get(priority)
      if (priorityQueue) {
        priorityQueue.push(item)
        this.stats.totalQueued++
      }

      // 设置超时
      if (this.config.queueTimeout > 0) {
        setTimeout(() => {
          if (this.removeItem(item)) {
            item.reject(new Error('Request timeout in queue'))
            this.stats.totalFailed++
          }
        }, this.config.queueTimeout)
      }

      // 尝试处理队列
      this.processQueue()
    })
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.processing)
      return
    this.processing = true

    while (this.active.size < this.config.maxConcurrent) {
      const item = this.getNextItem()
      if (!item)
        break

      this.active.add(item.id)
      this.executeItem(item)
    }

    this.processing = false
  }

  /**
   * 执行请求项
   */
  private async executeItem(item: PriorityItem<T>): Promise<void> {
    const waitTime = Date.now() - item.timestamp
    this.stats.waitTimes.push(waitTime)

    const startTime = Date.now()

    try {
      const result = await item.executor()
      item.resolve(result)
      this.stats.totalProcessed++

      const processTime = Date.now() - startTime
      this.stats.processTimes.push(processTime)
    }
    catch (error) {
      item.reject(error)
      this.stats.totalFailed++
    }
    finally {
      this.active.delete(item.id)
      // 继续处理队列
      this.processQueue()
    }
  }

  /**
   * 获取下一个要处理的项
   */
  private getNextItem(): PriorityItem<T> | undefined {
    // 按优先级顺序获取
    for (const priority of [Priority.CRITICAL, Priority.HIGH, Priority.NORMAL, Priority.LOW, Priority.IDLE]) {
      const priorityQueue = this.queue.get(priority)
      if (priorityQueue && priorityQueue.length > 0) {
        return priorityQueue.shift()
      }
    }
    return undefined
  }

  /**
   * 移除队列项
   */
  private removeItem(item: PriorityItem<T>): boolean {
    const priorityQueue = this.queue.get(item.priority)
    if (!priorityQueue)
      return false

    const index = priorityQueue.findIndex(i => i.id === item.id)
    if (index !== -1) {
      priorityQueue.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 启动优先级提升（优化版 - 按需检查）
   */
  private startPriorityBoost(): void {
    this.boostTimer = setInterval(() => {
      // 优化：只在有队列项时检查
      if (this.getTotalQueueSize() === 0) {
        return
      }

      const now = Date.now()

      // 优化：避免频繁检查
      if (now - this.lastBoostCheck < this.config.boostInterval / 2) {
        return
      }

      this.lastBoostCheck = now
      this.performPriorityBoost(now)
    }, 2000) // 降低检查频率到每2秒
  }

  /**
   * 执行优先级提升
   */
  private performPriorityBoost(now: number): void {
    // 遍历所有队列，提升等待时间过长的请求
    for (const [priority, items] of this.queue.entries()) {
      if (priority === Priority.CRITICAL || items.length === 0) {
        continue // 已经是最高优先级或队列为空
      }

      // 优化：使用索引而非 filter，减少数组创建
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i]
        if (now - item.timestamp > this.config.boostInterval) {
          // 移除原队列
          items.splice(i, 1)

          // 提升优先级
          const newPriority = Math.max(Priority.CRITICAL, priority - 1)
          item.priority = newPriority

          // 添加到新队列
          const newQueue = this.queue.get(newPriority)
          if (newQueue) {
            newQueue.push(item)
          }
        }
      }
    }
  }

  /**
   * 取消请求
   */
  cancel(id: string): boolean {
    // 在队列中查找并移除
    for (const [, items] of this.queue.entries()) {
      const index = items.findIndex(item => item.id === id)
      if (index !== -1) {
        const item = items[index]
        items.splice(index, 1)
        item.reject(new Error('Request cancelled'))
        item.abortController?.abort()
        return true
      }
    }

    // 检查是否在执行中
    if (this.active.has(id)) {
      // 无法取消正在执行的请求
      return false
    }

    return false
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason = 'All requests cancelled'): void {
    for (const [, items] of this.queue.entries()) {
      for (const item of items) {
        item.reject(new Error(reason))
        item.abortController?.abort()
      }
      items.length = 0
    }
  }

  /**
   * 获取队列统计信息
   */
  getStats(): PriorityQueueStats {
    const queuedByPriority: Record<Priority, number> = {} as any

    for (const [priority, items] of this.queue.entries()) {
      queuedByPriority[priority] = items.length
    }

    const avgWaitTime = this.stats.waitTimes.length > 0
      ? this.stats.waitTimes.reduce((a, b) => a + b, 0) / this.stats.waitTimes.length
      : 0

    const avgProcessTime = this.stats.processTimes.length > 0
      ? this.stats.processTimes.reduce((a, b) => a + b, 0) / this.stats.processTimes.length
      : 0

    return {
      totalQueued: this.stats.totalQueued,
      totalProcessed: this.stats.totalProcessed,
      totalFailed: this.stats.totalFailed,
      currentActive: this.active.size,
      queuedByPriority,
      averageWaitTime: avgWaitTime,
      averageProcessTime: avgProcessTime,
    }
  }

  /**
   * 获取总队列大小
   */
  private getTotalQueueSize(): number {
    let total = 0
    for (const [, items] of this.queue.entries()) {
      total += items.length
    }
    return total
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.boostTimer) {
      clearInterval(this.boostTimer)
    }
    this.cancelAll('Queue destroyed')
    this.queue.clear()
    this.active.clear()
  }
}

/**
 * 创建优先级队列
 */
export function createPriorityQueue<T = any>(config?: PriorityQueueConfig): PriorityQueue<T> {
  return new PriorityQueue<T>(config)
}

/**
 * 判断请求优先级
 */
export function determinePriority(config: RequestConfig): Priority {
  // 可以根据请求配置自动判断优先级
  if (config.priority !== undefined) {
    return config.priority as Priority
  }

  // 根据URL模式判断
  const url = config.url || ''

  // 认证相关请求 - 关键
  if (url.includes('/auth') || url.includes('/login') || url.includes('/token')) {
    return Priority.CRITICAL
  }

  // API 请求 - 高优先级
  if (url.includes('/api')) {
    return Priority.HIGH
  }

  // 静态资源 - 低优先级
  if (url.match(/\.(jpg|jpeg|png|gif|css|js)$/i)) {
    return Priority.LOW
  }

  // 分析和日志 - 空闲时执行
  if (url.includes('/analytics') || url.includes('/log')) {
    return Priority.IDLE
  }

  return Priority.NORMAL
}
