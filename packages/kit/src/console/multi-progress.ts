/**
 * 多任务进度管理器
 * 支持并行任务的进度显示和管理
 */

import { EventEmitter } from 'node:events'
import * as cliProgress from 'cli-progress'
import { StatusIndicator } from './status-indicator'

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * 任务配置
 */
export interface TaskConfig {
  id: string
  name: string
  total?: number
  current?: number
  status?: TaskStatus
  metadata?: Record<string, any>
}

/**
 * 多任务进度选项
 */
export interface MultiProgressOptions {
  theme?: string
  showOverall?: boolean
  showIndividual?: boolean
  showStatus?: boolean
  clearOnComplete?: boolean
  stopOnComplete?: boolean
  format?: string
  stream?: NodeJS.WriteStream
  maxConcurrent?: number
  autoStart?: boolean
}

/**
 * 任务进度信息
 */
export interface TaskProgress {
  id: string
  name: string
  current: number
  total: number
  percentage: number
  status: TaskStatus
  startTime?: number
  endTime?: number
  duration?: number
  rate?: number
  eta?: number
  metadata?: Record<string, any>
}

/**
 * 整体进度信息
 */
export interface OverallProgress {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  runningTasks: number
  pendingTasks: number
  percentage: number
  startTime: number
  duration: number
  estimatedCompletion?: number
}

/**
 * 多任务进度管理器类
 */
export class MultiProgress extends EventEmitter {
  private options: Required<MultiProgressOptions>
  private multiBar: cliProgress.MultiBar | null = null
  private tasks = new Map<string, TaskProgress>()
  private taskBars = new Map<string, cliProgress.SingleBar>()
  private overallBar: cliProgress.SingleBar | null = null
  private statusIndicator: StatusIndicator
  private isActive = false
  private startTime = 0

  constructor(options: MultiProgressOptions = {}) {
    super()

    this.statusIndicator = StatusIndicator.create({ theme: options.theme })

    this.options = {
      theme: options.theme || 'default',
      showOverall: options.showOverall !== false,
      showIndividual: options.showIndividual !== false,
      showStatus: options.showStatus !== false,
      clearOnComplete: options.clearOnComplete !== false,
      stopOnComplete: options.stopOnComplete !== false,
      format: options.format || '{name} [{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
      stream: options.stream || process.stdout,
      maxConcurrent: options.maxConcurrent || 5,
      autoStart: options.autoStart !== false,
    }
  }

  /**
   * 启动多任务进度
   */
  start(): void {
    if (this.isActive) {
      return
    }

    this.multiBar = new cliProgress.MultiBar({
      clearOnComplete: this.options.clearOnComplete,
      stopOnComplete: this.options.stopOnComplete,
      format: this.options.format,
      stream: this.options.stream,
      hideCursor: true,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      fps: 10,
    })

    // 创建整体进度条
    if (this.options.showOverall) {
      this.overallBar = this.multiBar.create(this.tasks.size, 0, {
        name: '总体进度',
      })
    }

    this.isActive = true
    this.startTime = Date.now()

    this.emit('started')
  }

  /**
   * 添加任务
   */
  addTask(config: TaskConfig): void {
    const task: TaskProgress = {
      id: config.id,
      name: config.name,
      current: config.current || 0,
      total: config.total || 100,
      percentage: 0,
      status: config.status || 'pending',
      metadata: config.metadata,
    }

    this.tasks.set(config.id, task)

    // 如果已经启动，创建进度条
    if (this.isActive && this.multiBar && this.options.showIndividual) {
      const bar = this.multiBar.create(task.total, task.current, {
        name: task.name,
        id: task.id,
      })
      this.taskBars.set(config.id, bar)
    }

    // 更新整体进度条总数
    if (this.overallBar) {
      this.overallBar.setTotal(this.tasks.size)
    }

    // 自动启动
    if (this.options.autoStart && !this.isActive) {
      this.start()
    }

    this.emit('taskAdded', task)
  }

  /**
   * 移除任务
   */
  removeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      return
    }

    // 移除进度条
    const bar = this.taskBars.get(taskId)
    if (bar && this.multiBar) {
      this.multiBar.remove(bar)
      this.taskBars.delete(taskId)
    }

    this.tasks.delete(taskId)

    // 更新整体进度条总数
    if (this.overallBar) {
      this.overallBar.setTotal(this.tasks.size)
    }

    this.emit('taskRemoved', task)
  }

  /**
   * 启动任务
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    task.status = 'running'
    task.startTime = Date.now()

    // 创建进度条（如果还没有）
    if (
      this.isActive
      && this.multiBar
      && this.options.showIndividual
      && !this.taskBars.has(taskId)
    ) {
      const bar = this.multiBar.create(task.total, task.current, {
        name: task.name,
        id: task.id,
      })
      this.taskBars.set(taskId, bar)
    }

    if (this.options.showStatus) {
      this.statusIndicator.loading(`开始任务: ${task.name}`)
    }

    this.emit('taskStarted', task)
  }

  /**
   * 更新任务进度
   */
  updateTask(taskId: string, current: number, metadata?: Record<string, any>): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    const oldCurrent = task.current
    task.current = Math.min(current, task.total)
    task.percentage = (task.current / task.total) * 100

    if (metadata) {
      task.metadata = { ...task.metadata, ...metadata }
    }

    // 计算速率和 ETA
    if (task.startTime) {
      const elapsed = (Date.now() - task.startTime) / 1000
      task.rate = task.current / elapsed
      task.eta = task.rate > 0 ? (task.total - task.current) / task.rate : 0
    }

    // 更新进度条
    const bar = this.taskBars.get(taskId)
    if (bar) {
      bar.update(task.current, {
        name: task.name,
        id: task.id,
        eta: Math.round(task.eta || 0),
        rate: Math.round(task.rate || 0),
      })
    }

    // 检查是否完成
    if (task.current >= task.total && task.status === 'running') {
      this.completeTask(taskId)
    }

    this.updateOverallProgress()
    this.emit('taskUpdated', task, oldCurrent)
  }

  /**
   * 完成任务
   */
  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    task.status = 'completed'
    task.endTime = Date.now()
    task.current = task.total
    task.percentage = 100

    if (task.startTime) {
      task.duration = task.endTime - task.startTime
    }

    // 更新进度条
    const bar = this.taskBars.get(taskId)
    if (bar) {
      bar.update(task.total)
    }

    if (this.options.showStatus) {
      this.statusIndicator.success(`完成任务: ${task.name}`)
    }

    this.updateOverallProgress()
    this.emit('taskCompleted', task)

    // 检查是否所有任务都完成
    if (this.isAllTasksCompleted()) {
      this.complete()
    }
  }

  /**
   * 任务失败
   */
  failTask(taskId: string, error?: Error): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    task.status = 'failed'
    task.endTime = Date.now()

    if (task.startTime) {
      task.duration = task.endTime - task.startTime
    }

    if (error) {
      task.metadata = { ...task.metadata, error: error.message }
    }

    if (this.options.showStatus) {
      this.statusIndicator.error(`任务失败: ${task.name}${error ? ` - ${error.message}` : ''}`)
    }

    this.updateOverallProgress()
    this.emit('taskFailed', task, error)
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    task.status = 'cancelled'
    task.endTime = Date.now()

    if (task.startTime) {
      task.duration = task.endTime - task.startTime
    }

    if (this.options.showStatus) {
      this.statusIndicator.warning(`取消任务: ${task.name}`)
    }

    this.updateOverallProgress()
    this.emit('taskCancelled', task)
  }

  /**
   * 获取任务信息
   */
  getTask(taskId: string): TaskProgress | null {
    return this.tasks.get(taskId) || null
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): TaskProgress[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 获取指定状态的任务
   */
  getTasksByStatus(status: TaskStatus): TaskProgress[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status)
  }

  /**
   * 获取整体进度
   */
  getOverallProgress(): OverallProgress {
    const tasks = Array.from(this.tasks.values())
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const failedTasks = tasks.filter(t => t.status === 'failed').length
    const runningTasks = tasks.filter(t => t.status === 'running').length
    const pendingTasks = tasks.filter(t => t.status === 'pending').length

    return {
      totalTasks: tasks.length,
      completedTasks,
      failedTasks,
      runningTasks,
      pendingTasks,
      percentage: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
    }
  }

  /**
   * 完成所有任务
   */
  complete(): void {
    if (!this.isActive) {
      return
    }

    if (this.multiBar) {
      this.multiBar.stop()
    }

    this.isActive = false

    if (this.options.showStatus) {
      const overall = this.getOverallProgress()
      this.statusIndicator.showSummary('任务执行摘要')
      this.statusIndicator.success(`总任务数: ${overall.totalTasks}`)
      this.statusIndicator.success(`完成任务: ${overall.completedTasks}`)
      if (overall.failedTasks > 0) {
        this.statusIndicator.error(`失败任务: ${overall.failedTasks}`)
      }
      this.statusIndicator.info(`总耗时: ${Math.round(overall.duration / 1000)}s`)
    }

    this.emit('completed')
  }

  /**
   * 停止所有任务
   */
  stop(): void {
    if (!this.isActive) {
      return
    }

    if (this.multiBar) {
      this.multiBar.stop()
    }

    this.isActive = false
    this.emit('stopped')
  }

  /**
   * 检查是否运行中
   */
  isRunning(): boolean {
    return this.isActive
  }

  // 私有方法

  private updateOverallProgress(): void {
    if (!this.overallBar) {
      return
    }

    const completedTasks = this.getTasksByStatus('completed').length
    this.overallBar.update(completedTasks)
  }

  private isAllTasksCompleted(): boolean {
    const tasks = Array.from(this.tasks.values())
    return (
      tasks.length > 0
      && tasks.every(
        task =>
          task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled',
      )
    )
  }

  /**
   * 创建多任务进度管理器实例
   */
  static create(options: MultiProgressOptions = {}): MultiProgress {
    return new MultiProgress(options)
  }

  /**
   * 创建简单多任务进度管理器
   */
  static createSimple(): MultiProgress {
    return new MultiProgress({
      showOverall: true,
      showIndividual: true,
      showStatus: false,
    })
  }

  /**
   * 创建详细多任务进度管理器
   */
  static createDetailed(): MultiProgress {
    return new MultiProgress({
      showOverall: true,
      showIndividual: true,
      showStatus: true,
    })
  }
}
