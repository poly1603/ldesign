/**
 * 闲时处理器 - 使用 requestIdleCallback 在浏览器空闲时执行任务
 */

import type { IdleProcessor } from '../core/types'

/**
 * 任务接口
 */
interface IdleTask {
  /** 任务 ID */
  id: string
  /** 任务函数 */
  task: () => void | Promise<void>
  /** 优先级（数字越小优先级越高） */
  priority: number
  /** 创建时间 */
  createdAt: number
}

/**
 * 闲时处理器选项
 */
export interface IdleProcessorOptions {
  /** 单次处理的最大时间（毫秒） */
  maxProcessingTime?: number
  /** 任务队列最大长度 */
  maxQueueSize?: number
  /** 是否自动启动 */
  autoStart?: boolean
  /** 错误处理回调 */
  onError?: (error: Error, task: IdleTask) => void
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<IdleProcessorOptions> = {
  maxProcessingTime: 50, // 50ms
  maxQueueSize: 100,
  autoStart: true,
  onError: (error, task) => {
    console.warn(`Idle task ${task.id} failed:`, error)
  },
}

/**
 * 闲时处理器实现
 */
export class IdleProcessorImpl implements IdleProcessor {
  private options: Required<IdleProcessorOptions>
  private taskQueue: IdleTask[] = []
  private isRunning: boolean = false
  private isProcessing: boolean = false
  private taskIdCounter: number = 0
  private requestId: number | null = null

  constructor(options?: IdleProcessorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }

    if (this.options.autoStart) {
      this.start()
    }
  }

  /**
   * 添加闲时任务
   */
  addTask(task: () => void | Promise<void>, priority: number = 0): void {
    // 检查队列大小限制
    if (this.taskQueue.length >= this.options.maxQueueSize) {
      console.warn('Idle task queue is full, dropping oldest task')
      this.taskQueue.shift()
    }

    const idleTask: IdleTask = {
      id: `task-${++this.taskIdCounter}`,
      task,
      priority,
      createdAt: Date.now(),
    }

    // 按优先级插入任务
    this.insertTaskByPriority(idleTask)

    // 如果处理器正在运行但没有在处理，立即开始处理
    if (this.isRunning && !this.isProcessing) {
      this.scheduleProcessing()
    }
  }

  /**
   * 开始处理
   */
  start(): void {
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.scheduleProcessing()
  }

  /**
   * 停止处理
   */
  stop(): void {
    this.isRunning = false

    if (this.requestId !== null) {
      if (typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(this.requestId)
      }
      else {
        clearTimeout(this.requestId)
      }
      this.requestId = null
    }
  }

  /**
   * 清空任务队列
   */
  clear(): void {
    this.taskQueue = []
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): {
    length: number
    isRunning: boolean
    isProcessing: boolean
  } {
    return {
      length: this.taskQueue.length,
      isRunning: this.isRunning,
      isProcessing: this.isProcessing,
    }
  }

  /**
   * 按优先级插入任务
   */
  private insertTaskByPriority(task: IdleTask): void {
    let insertIndex = this.taskQueue.length

    for (let i = 0; i < this.taskQueue.length; i++) {
      if (task.priority < this.taskQueue[i].priority) {
        insertIndex = i
        break
      }
    }

    this.taskQueue.splice(insertIndex, 0, task)
  }

  /**
   * 调度处理
   */
  private scheduleProcessing(): void {
    if (!this.isRunning || this.isProcessing || this.taskQueue.length === 0) {
      return
    }

    // 使用 requestIdleCallback 或回退到 setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      this.requestId = requestIdleCallback((deadline) => {
        this.processTasksInIdle(deadline)
      })
    }
    else {
      // 回退到 setTimeout
      this.requestId = setTimeout(() => {
        this.processTasksInIdle({
          timeRemaining: () => this.options.maxProcessingTime,
          didTimeout: false,
        } as IdleDeadline)
      }, 0) as unknown as number
    }
  }

  /**
   * 在空闲时间处理任务
   */
  private async processTasksInIdle(deadline: IdleDeadline): Promise<void> {
    this.isProcessing = true
    this.requestId = null

    const startTime = performance.now()

    try {
      while (
        this.taskQueue.length > 0
        && this.isRunning
        && (deadline.timeRemaining() > 0 || deadline.didTimeout)
        && performance.now() - startTime < this.options.maxProcessingTime
      ) {
        const task = this.taskQueue.shift()
        if (!task)
          break

        try {
          const result = task.task()

          // 如果任务返回 Promise，等待完成
          if (result instanceof Promise) {
            await result
          }
        }
        catch (error) {
          this.options.onError(error as Error, task)
        }
      }
    }
    finally {
      this.isProcessing = false

      // 如果还有任务且处理器仍在运行，继续调度
      if (this.taskQueue.length > 0 && this.isRunning) {
        this.scheduleProcessing()
      }
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<IdleProcessorOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<IdleProcessorOptions> {
    return { ...this.options }
  }
}

/**
 * 创建闲时处理器实例
 */
export function createIdleProcessor(
  options?: IdleProcessorOptions,
): IdleProcessor {
  return new IdleProcessorImpl(options)
}

/**
 * 全局默认闲时处理器实例
 */
export const defaultIdleProcessor = new IdleProcessorImpl()

/**
 * 便捷函数：添加闲时任务到默认处理器
 */
export function addIdleTask(
  task: () => void | Promise<void>,
  priority?: number,
): void {
  defaultIdleProcessor.addTask(task, priority)
}

/**
 * 便捷函数：批量添加闲时任务
 */
export function addIdleTasks(
  tasks: Array<{
    task: () => void | Promise<void>
    priority?: number
  }>,
): void {
  tasks.forEach(({ task, priority }) => {
    defaultIdleProcessor.addTask(task, priority)
  })
}

/**
 * 便捷函数：创建延迟执行的闲时任务
 */
export function createDelayedIdleTask(
  task: () => void | Promise<void>,
  delay: number,
  priority?: number,
): void {
  setTimeout(() => {
    defaultIdleProcessor.addTask(task, priority)
  }, delay)
}

/**
 * 便捷函数：创建条件执行的闲时任务
 */
export function createConditionalIdleTask(
  condition: () => boolean,
  task: () => void | Promise<void>,
  priority?: number,
): void {
  defaultIdleProcessor.addTask(() => {
    if (condition()) {
      return task()
    }
  }, priority)
}

/**
 * 检查浏览器是否支持 requestIdleCallback
 */
export function supportsIdleCallback(): boolean {
  return typeof requestIdleCallback !== 'undefined'
}

/**
 * 获取默认处理器状态
 */
export function getDefaultProcessorStatus(): {
  length: number
  isRunning: boolean
  isProcessing: boolean
  supportsIdleCallback: boolean
} {
  return {
    ...defaultIdleProcessor.getQueueStatus(),
    supportsIdleCallback: supportsIdleCallback(),
  }
}
