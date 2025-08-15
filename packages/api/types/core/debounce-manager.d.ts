import { DebounceConfig } from '../types/index.js'

/**
 * 防抖管理器
 */
declare class DebounceManager {
  /** 配置 */
  private readonly config
  /** 防抖任务映射 */
  private readonly tasks
  /** 统计信息 */
  private readonly stats
  constructor(config: DebounceConfig)
  /**
   * 执行防抖任务
   */
  execute<T = unknown>(
    key: string,
    task: () => Promise<T>,
    delay?: number
  ): Promise<T>
  /**
   * 取消防抖任务
   */
  cancel(key: string): boolean
  /**
   * 取消所有防抖任务
   */
  cancelAll(): void
  /**
   * 检查是否有待执行的任务
   */
  hasPendingTask(key: string): boolean
  /**
   * 获取待执行任务数量
   */
  getPendingTaskCount(): number
  /**
   * 获取所有待执行任务的键
   */
  getPendingTaskKeys(): string[]
  /**
   * 获取统计信息
   */
  getStats(): {
    pendingTasks: number
    averageDelay: number
    executions: number
    cancellations: number
    totalDelay: number
  }
  /**
   * 清空所有任务和统计
   */
  clear(): void
  /**
   * 立即执行指定任务（跳过防抖）
   */
  flush<T = unknown>(key: string): Promise<T | null>
  /**
   * 立即执行所有待执行任务
   */
  flushAll(): Promise<void>
  /**
   * 获取任务信息
   */
  getTaskInfo(key: string): {
    key: string
    delay: number
    createdAt: number
    remainingTime: number
  } | null
  /**
   * 获取所有任务信息
   */
  getAllTaskInfo(): {
    key: string
    delay: number
    createdAt: number
    remainingTime: number
  }[]
}

export { DebounceManager }
