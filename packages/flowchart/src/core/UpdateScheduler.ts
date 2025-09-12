/**
 * 更新调度器
 * 
 * 基于 requestAnimationFrame 的更新调度器，用于合并同帧多次更新请求，
 * 避免重复重绘和重排，提升性能。
 */

/**
 * 更新任务类型
 */
export type UpdateTask = () => void

/**
 * 更新任务优先级
 */
export enum UpdatePriority {
  /** 低优先级 - 装饰性更新（如背景、网格） */
  LOW = 0,
  /** 普通优先级 - 一般内容更新 */
  NORMAL = 1,
  /** 高优先级 - 交互相关更新（如选中状态、拖拽） */
  HIGH = 2,
  /** 紧急优先级 - 立即执行（如错误处理） */
  URGENT = 3
}

/**
 * 调度任务项
 */
interface ScheduledTask {
  /** 任务ID */
  id: string
  /** 任务函数 */
  task: UpdateTask
  /** 优先级 */
  priority: UpdatePriority
  /** 创建时间 */
  timestamp: number
  /** 是否只执行一次 */
  once?: boolean
}

/**
 * 更新调度器配置
 */
export interface UpdateSchedulerConfig {
  /** 最大任务队列长度 */
  maxQueueSize?: number
  /** 防抖延迟时间（毫秒） */
  debounceDelay?: number
  /** 是否启用性能监控 */
  enablePerfMonitor?: boolean
}

/**
 * 更新调度器
 * 
 * 功能特性：
 * - 基于 requestAnimationFrame 的帧同步更新
 * - 任务优先级排序
 * - 防抖机制避免频繁调度
 * - 任务去重避免重复执行
 * - 性能监控和统计
 */
export class UpdateScheduler {
  private config: Required<UpdateSchedulerConfig>
  private taskQueue: Map<string, ScheduledTask> = new Map()
  private isScheduled = false
  private rafId: number | null = null
  private debounceTimer: number | null = null
  
  // 性能监控
  private frameCount = 0
  private totalExecutionTime = 0
  private lastFrameTime = 0

  constructor(config: UpdateSchedulerConfig = {}) {
    this.config = {
      maxQueueSize: 100,
      debounceDelay: 0,
      enablePerfMonitor: false,
      ...config
    }
  }

  /**
   * 调度更新任务
   * @param id 任务唯一标识
   * @param task 更新任务
   * @param priority 优先级
   * @param once 是否只执行一次
   */
  schedule(
    id: string,
    task: UpdateTask,
    priority: UpdatePriority = UpdatePriority.NORMAL,
    once = true
  ): void {
    // 检查队列大小限制
    if (this.taskQueue.size >= this.config.maxQueueSize) {
      console.warn(`UpdateScheduler: 任务队列已满 (${this.config.maxQueueSize})，跳过任务: ${id}`)
      return
    }

    // 添加或更新任务
    this.taskQueue.set(id, {
      id,
      task,
      priority,
      timestamp: Date.now(),
      once
    })

    // 调度执行
    this.scheduleExecution()
  }

  /**
   * 立即执行任务（跳过调度）
   * @param task 更新任务
   */
  immediate(task: UpdateTask): void {
    try {
      task()
    } catch (error) {
      console.error('UpdateScheduler: 立即执行任务失败:', error)
    }
  }

  /**
   * 取消指定任务
   * @param id 任务ID
   */
  cancel(id: string): void {
    this.taskQueue.delete(id)
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.taskQueue.clear()
    this.cancelScheduledExecution()
  }

  /**
   * 强制立即执行所有任务
   */
  flush(): void {
    this.cancelScheduledExecution()
    this.executeAllTasks()
  }

  /**
   * 获取性能统计信息
   */
  getPerformanceStats() {
    return {
      frameCount: this.frameCount,
      averageExecutionTime: this.frameCount > 0 ? this.totalExecutionTime / this.frameCount : 0,
      queueSize: this.taskQueue.size,
      isScheduled: this.isScheduled
    }
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.clear()
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * 调度执行
   */
  private scheduleExecution(): void {
    if (this.isScheduled) {
      return
    }

    if (this.config.debounceDelay > 0) {
      // 使用防抖
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = window.setTimeout(() => {
        this.requestFrame()
      }, this.config.debounceDelay)
    } else {
      // 直接调度
      this.requestFrame()
    }
  }

  /**
   * 请求动画帧
   */
  private requestFrame(): void {
    if (this.isScheduled) {
      return
    }

    this.isScheduled = true
    this.rafId = requestAnimationFrame(() => {
      this.executeAllTasks()
    })
  }

  /**
   * 取消已调度的执行
   */
  private cancelScheduledExecution(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    this.isScheduled = false
  }

  /**
   * 执行所有任务
   */
  private executeAllTasks(): void {
    const startTime = this.config.enablePerfMonitor ? performance.now() : 0

    try {
      // 按优先级排序任务
      const sortedTasks = Array.from(this.taskQueue.values()).sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority // 高优先级在前
        }
        return a.timestamp - b.timestamp // 相同优先级按时间排序
      })

      // 执行任务
      for (const scheduledTask of sortedTasks) {
        try {
          scheduledTask.task()
          
          // 如果是一次性任务，执行后移除
          if (scheduledTask.once) {
            this.taskQueue.delete(scheduledTask.id)
          }
        } catch (error) {
          console.error(`UpdateScheduler: 执行任务失败 (${scheduledTask.id}):`, error)
          // 移除出错的任务
          this.taskQueue.delete(scheduledTask.id)
        }
      }
    } finally {
      // 重置调度状态
      this.isScheduled = false
      this.rafId = null

      // 性能监控
      if (this.config.enablePerfMonitor) {
        const executionTime = performance.now() - startTime
        this.frameCount++
        this.totalExecutionTime += executionTime
        this.lastFrameTime = executionTime

        // 如果执行时间过长，发出警告
        if (executionTime > 16) { // 超过一帧时间
          console.warn(`UpdateScheduler: 帧执行时间过长: ${executionTime.toFixed(2)}ms`)
        }
      }
    }
  }
}

/**
 * 全局默认调度器实例
 */
export const defaultUpdateScheduler = new UpdateScheduler({
  enablePerfMonitor: process.env.NODE_ENV === 'development'
})
