import { DeduplicationConfig } from '../types/index.js'

/**
 * 请求去重管理器
 */
declare class DeduplicationManager {
  /** 配置 */
  private readonly config
  /** 正在执行的任务映射 */
  private readonly runningTasks
  /** 统计信息 */
  private readonly stats
  constructor(config: DeduplicationConfig)
  /**
   * 执行去重任务
   */
  execute<T = unknown>(key: string, task: () => Promise<T>): Promise<T>
  /**
   * 创建任务
   */
  private createTask
  /**
   * 取消指定任务
   */
  cancel(key: string): boolean
  /**
   * 取消所有任务
   */
  cancelAll(): void
  /**
   * 检查任务是否正在执行
   */
  isRunning(key: string): boolean
  /**
   * 获取正在执行的任务数量
   */
  getRunningTaskCount(): number
  /**
   * 获取所有正在执行任务的键
   */
  getRunningTaskKeys(): string[]
  /**
   * 获取统计信息
   */
  getStats(): {
    runningTasks: number
    deduplicationRate: number
    savedRequests: number
    executions: number
    duplications: number
    totalSaved: number
  }
  /**
   * 清空所有任务和统计
   */
  clear(): void
  /**
   * 获取任务信息
   */
  getTaskInfo(key: string): {
    key: string
    createdAt: number
    refCount: number
    duration: number
  } | null
  /**
   * 获取所有任务信息
   */
  getAllTaskInfo(): {
    key: string
    createdAt: number
    refCount: number
    duration: number
  }[]
  /**
   * 等待指定任务完成
   */
  waitFor<T = unknown>(key: string): Promise<T | null>
  /**
   * 等待所有任务完成
   */
  waitForAll(): Promise<void>
  /**
   * 获取任务的引用计数
   */
  getRefCount(key: string): number
  /**
   * 获取最高引用计数的任务
   */
  getMostReferencedTask(): {
    key: string
    refCount: number
    info: {
      key: string
      createdAt: number
      refCount: number
      duration: number
    } | null
  } | null
  /**
   * 获取运行时间最长的任务
   */
  getLongestRunningTask(): {
    key: string
    duration: number
    info: {
      key: string
      createdAt: number
      refCount: number
      duration: number
    } | null
  } | null
}

export { DeduplicationManager }
