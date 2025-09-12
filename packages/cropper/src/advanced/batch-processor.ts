/**
 * @file 批量处理器
 * @description 批量处理多个图片的裁剪操作
 */

import { EventEmitter } from '@/core/event-emitter'
import type { CropData } from '@/types'

/**
 * 批量处理任务
 */
export interface BatchTask {
  /** 任务ID */
  id: string
  /** 图片源 */
  source: HTMLImageElement | File | string
  /** 裁剪参数 */
  cropData: CropData
  /** 输出配置 */
  output: {
    format?: string
    quality?: number
    width?: number
    height?: number
    filename?: string
  }
  /** 任务状态 */
  status: 'pending' | 'processing' | 'completed' | 'failed'
  /** 处理结果 */
  result?: Blob | string
  /** 错误信息 */
  error?: string
  /** 开始时间 */
  startTime?: number
  /** 结束时间 */
  endTime?: number
}

/**
 * 批量处理配置
 */
export interface BatchConfig {
  /** 并发数量 */
  concurrency: number
  /** 超时时间（毫秒） */
  timeout: number
  /** 是否在出错时停止 */
  stopOnError: boolean
  /** 输出目录（用于文件输出） */
  outputDir?: string
  /** 文件名模板 */
  filenameTemplate?: string
}

/**
 * 批量处理进度
 */
export interface BatchProgress {
  /** 总任务数 */
  total: number
  /** 已完成数 */
  completed: number
  /** 失败数 */
  failed: number
  /** 进度百分比 */
  percentage: number
  /** 当前处理的任务 */
  currentTask?: BatchTask
  /** 预计剩余时间（毫秒） */
  estimatedTimeRemaining?: number
}

/**
 * 批量处理结果
 */
export interface BatchResult {
  /** 成功的任务 */
  successful: BatchTask[]
  /** 失败的任务 */
  failed: BatchTask[]
  /** 总处理时间 */
  totalTime: number
  /** 平均处理时间 */
  averageTime: number
}

/**
 * 批量处理器类
 */
export class BatchProcessor extends EventEmitter {
  /** 任务队列 */
  private taskQueue: BatchTask[] = []

  /** 正在处理的任务 */
  private processingTasks: Set<string> = new Set()

  /** 已完成的任务 */
  private completedTasks: BatchTask[] = []

  /** 失败的任务 */
  private failedTasks: BatchTask[] = []

  /** 处理配置 */
  private config: BatchConfig

  /** 是否正在处理 */
  private isProcessing: boolean = false

  /** 处理开始时间 */
  private startTime: number = 0

  /** 任务计数器 */
  private taskCounter: number = 0

  /**
   * 构造函数
   * @param config 批量处理配置
   */
  constructor(config: Partial<BatchConfig> = {}) {
    super()

    this.config = {
      concurrency: 3,
      timeout: 30000,
      stopOnError: false,
      filenameTemplate: '{name}_{timestamp}',
      ...config
    }
  }

  /**
   * 添加批量任务
   * @param tasks 任务列表
   */
  addTasks(tasks: Omit<BatchTask, 'id' | 'status'>[]): void {
    const newTasks = tasks.map(task => ({
      ...task,
      id: this.generateTaskId(),
      status: 'pending' as const
    }))

    this.taskQueue.push(...newTasks)
    this.emit('tasksAdded', { tasks: newTasks, totalTasks: this.taskQueue.length })
  }

  /**
   * 添加单个任务
   * @param task 任务信息
   */
  addTask(task: Omit<BatchTask, 'id' | 'status'>): string {
    const newTask: BatchTask = {
      ...task,
      id: this.generateTaskId(),
      status: 'pending'
    }

    this.taskQueue.push(newTask)
    this.emit('taskAdded', { task: newTask, totalTasks: this.taskQueue.length })
    
    return newTask.id
  }

  /**
   * 开始批量处理
   */
  async startProcessing(): Promise<BatchResult> {
    if (this.isProcessing) {
      throw new Error('Batch processing is already running')
    }

    if (this.taskQueue.length === 0) {
      throw new Error('No tasks to process')
    }

    this.isProcessing = true
    this.startTime = Date.now()
    this.completedTasks = []
    this.failedTasks = []

    this.emit('processingStarted', { totalTasks: this.taskQueue.length })

    try {
      await this.processTasks()
      
      const result = this.generateResult()
      this.emit('processingCompleted', result)
      
      return result
    } catch (error) {
      this.emit('processingError', error)
      throw error
    } finally {
      this.isProcessing = false
      this.processingTasks.clear()
    }
  }

  /**
   * 停止批量处理
   */
  stopProcessing(): void {
    if (!this.isProcessing) return

    this.isProcessing = false
    this.emit('processingStopped', { 
      completed: this.completedTasks.length,
      failed: this.failedTasks.length,
      remaining: this.taskQueue.length
    })
  }

  /**
   * 获取处理进度
   */
  getProgress(): BatchProgress {
    const total = this.completedTasks.length + this.failedTasks.length + this.taskQueue.length
    const completed = this.completedTasks.length
    const failed = this.failedTasks.length
    const percentage = total > 0 ? ((completed + failed) / total) * 100 : 0

    // 估算剩余时间
    let estimatedTimeRemaining: number | undefined
    if (completed > 0 && this.taskQueue.length > 0) {
      const elapsedTime = Date.now() - this.startTime
      const averageTime = elapsedTime / completed
      estimatedTimeRemaining = averageTime * this.taskQueue.length
    }

    return {
      total,
      completed,
      failed,
      percentage,
      estimatedTimeRemaining
    }
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   */
  getTaskStatus(taskId: string): BatchTask | null {
    // 在各个列表中查找任务
    const allTasks = [...this.taskQueue, ...this.completedTasks, ...this.failedTasks]
    return allTasks.find(task => task.id === taskId) || null
  }

  /**
   * 移除任务
   * @param taskId 任务ID
   */
  removeTask(taskId: string): boolean {
    const index = this.taskQueue.findIndex(task => task.id === taskId)
    if (index !== -1) {
      this.taskQueue.splice(index, 1)
      this.emit('taskRemoved', { taskId, remainingTasks: this.taskQueue.length })
      return true
    }
    return false
  }

  /**
   * 清空任务队列
   */
  clearTasks(): void {
    const removedCount = this.taskQueue.length
    this.taskQueue = []
    this.emit('tasksCleared', { removedCount })
  }

  /**
   * 重试失败的任务
   */
  retryFailedTasks(): void {
    const failedTasks = this.failedTasks.map(task => ({
      ...task,
      status: 'pending' as const,
      error: undefined,
      startTime: undefined,
      endTime: undefined
    }))

    this.taskQueue.push(...failedTasks)
    this.failedTasks = []

    this.emit('failedTasksRetried', { retriedCount: failedTasks.length })
  }

  /**
   * 导出处理结果
   */
  exportResults(): string {
    const result = this.generateResult()
    return JSON.stringify({
      result,
      config: this.config,
      exportTime: Date.now()
    }, null, 2)
  }

  /**
   * 处理任务队列
   */
  private async processTasks(): Promise<void> {
    const promises: Promise<void>[] = []

    // 启动并发处理
    for (let i = 0; i < this.config.concurrency; i++) {
      promises.push(this.processTaskWorker())
    }

    await Promise.all(promises)
  }

  /**
   * 任务处理工作器
   */
  private async processTaskWorker(): Promise<void> {
    while (this.isProcessing && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()
      if (!task) break

      await this.processTask(task)

      // 检查是否应该停止处理
      if (this.config.stopOnError && this.failedTasks.length > 0) {
        this.isProcessing = false
        break
      }
    }
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: BatchTask): Promise<void> {
    task.status = 'processing'
    task.startTime = Date.now()
    this.processingTasks.add(task.id)

    this.emit('taskStarted', { task, progress: this.getProgress() })

    try {
      // 加载图片
      const image = await this.loadImage(task.source)
      
      // 执行裁剪
      const result = await this.cropImage(image, task.cropData, task.output)
      
      task.result = result
      task.status = 'completed'
      task.endTime = Date.now()
      
      this.completedTasks.push(task)
      this.emit('taskCompleted', { task, progress: this.getProgress() })
      
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Unknown error'
      task.endTime = Date.now()
      
      this.failedTasks.push(task)
      this.emit('taskFailed', { task, error, progress: this.getProgress() })
    } finally {
      this.processingTasks.delete(task.id)
    }
  }

  /**
   * 加载图片
   */
  private async loadImage(source: HTMLImageElement | File | string): Promise<HTMLImageElement> {
    if (source instanceof HTMLImageElement) {
      return source
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, this.config.timeout)

      img.onload = () => {
        clearTimeout(timeout)
        resolve(img)
      }

      img.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('Failed to load image'))
      }

      if (source instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target?.result as string
        }
        reader.onerror = () => {
          clearTimeout(timeout)
          reject(new Error('Failed to read file'))
        }
        reader.readAsDataURL(source)
      } else {
        img.src = source
      }
    })
  }

  /**
   * 裁剪图片
   */
  private async cropImage(
    image: HTMLImageElement, 
    cropData: CropData, 
    output: BatchTask['output']
  ): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // 设置输出尺寸
    canvas.width = output.width || cropData.width
    canvas.height = output.height || cropData.height

    // 绘制裁剪后的图片
    ctx.drawImage(
      image,
      cropData.x, cropData.y, cropData.width, cropData.height,
      0, 0, canvas.width, canvas.height
    )

    // 转换为Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        output.format || 'image/png',
        output.quality || 0.92
      )
    })
  }

  /**
   * 生成处理结果
   */
  private generateResult(): BatchResult {
    const totalTime = Date.now() - this.startTime
    const totalTasks = this.completedTasks.length + this.failedTasks.length
    const averageTime = totalTasks > 0 ? totalTime / totalTasks : 0

    return {
      successful: [...this.completedTasks],
      failed: [...this.failedTasks],
      totalTime,
      averageTime
    }
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `batch_task_${++this.taskCounter}_${Date.now()}`
  }

  /**
   * 销毁批量处理器
   */
  destroy(): void {
    this.stopProcessing()
    this.clearTasks()
    this.completedTasks = []
    this.failedTasks = []
    this.removeAllListeners()
  }
}
