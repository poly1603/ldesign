import { EventEmitter } from 'events'
import { randomUUID } from 'crypto'
import { logger } from '../utils/logger'

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Task {
  id: string
  type: string
  projectId?: string
  status: TaskStatus
  progress: number
  message: string
  error?: string
  result?: any
  createdAt: number
  startedAt?: number
  completedAt?: number
  logs: TaskLog[]
}

export interface TaskLog {
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
}

export type TaskExecutor = (task: Task, updateProgress: (progress: number, message: string) => void) => Promise<any>

class TaskManager extends EventEmitter {
  private tasks: Map<string, Task> = new Map()
  private executors: Map<string, TaskExecutor> = new Map()
  private runningTasks: Set<string> = new Set()
  private maxConcurrent = 3

  /**
   * 注册任务执行器
   */
  registerExecutor(type: string, executor: TaskExecutor) {
    this.executors.set(type, executor)
    logger.info(`任务执行器已注册: ${type}`)
  }

  /**
   * 创建新任务
   */
  createTask(type: string, projectId?: string): Task {
    const id = randomUUID()
    const task: Task = {
      id,
      type,
      projectId,
      status: 'pending',
      progress: 0,
      message: '等待执行',
      logs: [],
      createdAt: Date.now(),
    }

    this.tasks.set(id, task)
    this.emit('task:created', task)
    
    // 自动开始执行
    this.executeTask(id)

    return task
  }

  /**
   * 获取任务
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id)
  }

  /**
   * 获取所有任务
   */
  getAllTasks(filter?: { projectId?: string; status?: TaskStatus }): Task[] {
    let tasks = Array.from(this.tasks.values())

    if (filter?.projectId) {
      tasks = tasks.filter(t => t.projectId === filter.projectId)
    }

    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status)
    }

    return tasks.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 取消任务
   */
  cancelTask(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false

    if (task.status === 'running') {
      task.status = 'cancelled'
      task.message = '任务已取消'
      task.completedAt = Date.now()
      this.runningTasks.delete(id)
      this.addLog(task, 'warn', '任务被取消')
      this.emit('task:cancelled', task)
      return true
    }

    if (task.status === 'pending') {
      task.status = 'cancelled'
      task.message = '任务已取消'
      task.completedAt = Date.now()
      this.addLog(task, 'warn', '任务被取消')
      this.emit('task:cancelled', task)
      return true
    }

    return false
  }

  /**
   * 删除任务
   */
  deleteTask(id: string): boolean {
    const task = this.tasks.get(id)
    if (!task) return false

    if (task.status === 'running') {
      this.cancelTask(id)
    }

    this.tasks.delete(id)
    this.emit('task:deleted', { id })
    return true
  }

  /**
   * 清理已完成的任务
   */
  cleanupCompletedTasks(olderThan: number = 24 * 60 * 60 * 1000) {
    const now = Date.now()
    let count = 0

    for (const [id, task] of this.tasks.entries()) {
      if (
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
        task.completedAt &&
        now - task.completedAt > olderThan
      ) {
        this.tasks.delete(id)
        count++
      }
    }

    logger.info(`清理了 ${count} 个过期任务`)
    return count
  }

  /**
   * 执行任务
   */
  private async executeTask(id: string) {
    const task = this.tasks.get(id)
    if (!task) return

    // 检查并发限制
    if (this.runningTasks.size >= this.maxConcurrent) {
      logger.debug(`达到最大并发数，任务 ${id} 等待执行`)
      setTimeout(() => this.executeTask(id), 1000)
      return
    }

    const executor = this.executors.get(task.type)
    if (!executor) {
      task.status = 'failed'
      task.error = `未找到任务类型 ${task.type} 的执行器`
      task.completedAt = Date.now()
      this.addLog(task, 'error', task.error)
      this.emit('task:failed', task)
      return
    }

    task.status = 'running'
    task.startedAt = Date.now()
    task.message = '正在执行'
    this.runningTasks.add(id)
    this.addLog(task, 'info', '任务开始执行')
    this.emit('task:started', task)

    const updateProgress = (progress: number, message: string) => {
      task.progress = Math.min(100, Math.max(0, progress))
      task.message = message
      this.addLog(task, 'info', message)
      this.emit('task:progress', task)
    }

    try {
      const result = await executor(task, updateProgress)
      
      if (task.status === 'cancelled') {
        return
      }

      task.status = 'completed'
      task.progress = 100
      task.message = '任务完成'
      task.result = result
      task.completedAt = Date.now()
      this.addLog(task, 'success', '任务执行成功')
      this.emit('task:completed', task)
    } catch (error: any) {
      if (task.status === 'cancelled') {
        return
      }

      task.status = 'failed'
      task.error = error.message
      task.completedAt = Date.now()
      this.addLog(task, 'error', `任务执行失败: ${error.message}`)
      this.emit('task:failed', task)
      logger.error(`任务 ${id} 执行失败`, error)
    } finally {
      this.runningTasks.delete(id)
    }
  }

  /**
   * 添加日志
   */
  private addLog(task: Task, level: TaskLog['level'], message: string) {
    task.logs.push({
      level,
      message,
      timestamp: Date.now(),
    })

    // 限制日志数量
    if (task.logs.length > 100) {
      task.logs = task.logs.slice(-100)
    }
  }
}

export const taskManager = new TaskManager()
