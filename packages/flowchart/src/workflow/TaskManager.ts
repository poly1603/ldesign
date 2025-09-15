/**
 * 任务管理器
 * 
 * 负责任务的创建、分配、执行和状态管理
 */

import { EventEmitter } from 'events'
import type {
  Task,
  TaskResult,
  TaskQuery,
  TaskType,
  TaskStatus,
  TaskPriority
} from './types'
import type { WorkflowStorage } from './WorkflowStorage'

/**
 * 任务管理器
 */
export class TaskManager extends EventEmitter {
  private storage: WorkflowStorage
  private taskCache: Map<string, Task> = new Map()
  private assignmentStrategies: Map<string, TaskAssignmentStrategy> = new Map()

  constructor(storage: WorkflowStorage) {
    super()
    this.storage = storage
    this.initializeAssignmentStrategies()
  }

  /**
   * 创建任务
   */
  async createTask(processInstanceId: string, node: any): Promise<Task> {
    const taskId = this.generateTaskId()
    
    const task: Task = {
      id: taskId,
      processInstanceId,
      nodeId: node.id,
      name: node.properties?.name || node.text || `任务-${node.id}`,
      type: this.getTaskType(node),
      status: 'created',
      candidates: this.getCandidates(node),
      candidateGroups: this.getCandidateGroups(node),
      createTime: Date.now(),
      dueTime: this.getDueTime(node),
      data: { ...node.properties },
      priority: this.getTaskPriority(node)
    }

    // 自动分配任务
    await this.assignTask(task)

    // 保存到存储
    await this.storage.saveTask(task)
    
    // 缓存任务
    this.taskCache.set(taskId, task)
    
    // 触发任务创建事件
    this.emit('task:created', task)
    
    console.log(`创建任务: ${taskId} (${task.name})`)
    return task
  }

  /**
   * 获取任务
   */
  async getTask(taskId: string): Promise<Task | null> {
    // 先从缓存获取
    let task = this.taskCache.get(taskId)
    if (task) {
      return task
    }

    // 从存储获取
    task = await this.storage.getTask(taskId)
    if (task) {
      this.taskCache.set(taskId, task)
    }

    return task
  }

  /**
   * 分配任务
   */
  async assignTask(task: Task, assignee?: string): Promise<void> {
    if (task.status !== 'created' && task.status !== 'assigned') {
      throw new Error(`任务状态不允许分配: ${task.status}`)
    }

    if (assignee) {
      // 手动分配
      task.assignee = assignee
    } else {
      // 自动分配
      const strategy = this.assignmentStrategies.get('default')
      if (strategy) {
        task.assignee = await strategy.assign(task)
      }
    }

    if (task.assignee) {
      task.status = 'assigned'
      
      // 保存到存储
      await this.storage.saveTask(task)
      
      // 更新缓存
      this.taskCache.set(task.id, task)
      
      // 触发任务分配事件
      this.emit('task:assigned', task)
      
      console.log(`任务 ${task.id} 分配给 ${task.assignee}`)
    }
  }

  /**
   * 开始任务
   */
  async startTask(taskId: string, executor: string): Promise<void> {
    const task = await this.getTask(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    if (task.status !== 'assigned') {
      throw new Error(`任务状态不允许开始: ${task.status}`)
    }

    if (task.assignee !== executor) {
      throw new Error(`只有任务分配者才能开始任务`)
    }

    task.status = 'started'
    
    // 保存到存储
    await this.storage.saveTask(task)
    
    // 更新缓存
    this.taskCache.set(taskId, task)
    
    // 触发任务开始事件
    this.emit('task:started', task)
    
    console.log(`任务 ${taskId} 开始执行`)
  }

  /**
   * 完成任务
   */
  async completeTask(taskId: string, result: TaskResult): Promise<void> {
    const task = await this.getTask(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    if (task.status !== 'assigned' && task.status !== 'started') {
      throw new Error(`任务状态不允许完成: ${task.status}`)
    }

    // 更新任务状态
    task.status = 'completed'
    task.completeTime = result.executeTime
    task.formData = result.formData
    
    // 合并结果数据
    if (result.data) {
      task.data = { ...task.data, ...result.data }
    }

    // 保存到存储
    await this.storage.saveTask(task)
    await this.storage.saveTaskResult(result)
    
    // 更新缓存
    this.taskCache.set(taskId, task)
    
    // 触发任务完成事件
    this.emit('task:completed', task, result)
    
    console.log(`任务 ${taskId} 完成，结果: ${result.result}`)
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, reason?: string): Promise<void> {
    const task = await this.getTask(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new Error(`任务已结束，不能取消: ${task.status}`)
    }

    task.status = 'cancelled'
    
    if (reason) {
      task.data.cancelReason = reason
    }

    // 保存到存储
    await this.storage.saveTask(task)
    
    // 更新缓存
    this.taskCache.set(taskId, task)
    
    // 触发任务取消事件
    this.emit('task:cancelled', task)
    
    console.log(`任务 ${taskId} 已取消`)
  }

  /**
   * 委派任务
   */
  async delegateTask(taskId: string, fromUser: string, toUser: string): Promise<void> {
    const task = await this.getTask(taskId)
    if (!task) {
      throw new Error(`任务不存在: ${taskId}`)
    }

    if (task.assignee !== fromUser) {
      throw new Error(`只有任务分配者才能委派任务`)
    }

    if (task.status !== 'assigned' && task.status !== 'started') {
      throw new Error(`任务状态不允许委派: ${task.status}`)
    }

    const oldAssignee = task.assignee
    task.assignee = toUser
    task.status = 'assigned' // 重置为已分配状态
    
    // 记录委派历史
    if (!task.data.delegationHistory) {
      task.data.delegationHistory = []
    }
    task.data.delegationHistory.push({
      from: fromUser,
      to: toUser,
      time: Date.now()
    })

    // 保存到存储
    await this.storage.saveTask(task)
    
    // 更新缓存
    this.taskCache.set(taskId, task)
    
    // 触发任务委派事件
    this.emit('task:delegated', task, oldAssignee, toUser)
    
    console.log(`任务 ${taskId} 从 ${fromUser} 委派给 ${toUser}`)
  }

  /**
   * 查询任务
   */
  async queryTasks(query: TaskQuery): Promise<Task[]> {
    return this.storage.queryTasks(query)
  }

  /**
   * 获取节点的任务
   */
  async getTasksByNode(processInstanceId: string, nodeId: string): Promise<Task[]> {
    return this.storage.getTasksByNode(processInstanceId, nodeId)
  }

  /**
   * 获取用户的任务
   */
  async getUserTasks(userId: string, status?: TaskStatus[]): Promise<Task[]> {
    return this.storage.getUserTasks(userId, status)
  }

  /**
   * 获取候选任务
   */
  async getCandidateTasks(userId: string, groups: string[]): Promise<Task[]> {
    return this.storage.getCandidateTasks(userId, groups)
  }

  /**
   * 暂停实例的任务
   */
  async suspendTasksByInstance(instanceId: string): Promise<void> {
    const tasks = await this.storage.getTasksByInstance(instanceId)
    
    for (const task of tasks) {
      if (task.status === 'assigned' || task.status === 'started') {
        task.data.suspendedStatus = task.status
        task.status = 'created' // 暂时设为创建状态
        
        await this.storage.saveTask(task)
        this.taskCache.set(task.id, task)
      }
    }
    
    console.log(`暂停实例 ${instanceId} 的 ${tasks.length} 个任务`)
  }

  /**
   * 恢复实例的任务
   */
  async resumeTasksByInstance(instanceId: string): Promise<void> {
    const tasks = await this.storage.getTasksByInstance(instanceId)
    
    for (const task of tasks) {
      if (task.data.suspendedStatus) {
        task.status = task.data.suspendedStatus
        delete task.data.suspendedStatus
        
        await this.storage.saveTask(task)
        this.taskCache.set(task.id, task)
      }
    }
    
    console.log(`恢复实例 ${instanceId} 的 ${tasks.length} 个任务`)
  }

  /**
   * 取消实例的任务
   */
  async cancelTasksByInstance(instanceId: string): Promise<void> {
    const tasks = await this.storage.getTasksByInstance(instanceId)
    
    for (const task of tasks) {
      if (task.status !== 'completed' && task.status !== 'cancelled') {
        await this.cancelTask(task.id, '流程实例已终止')
      }
    }
    
    console.log(`取消实例 ${instanceId} 的 ${tasks.length} 个任务`)
  }

  /**
   * 获取任务统计
   */
  async getTaskStats(userId?: string): Promise<TaskStats> {
    const stats: TaskStats = {
      total: 0,
      created: 0,
      assigned: 0,
      started: 0,
      completed: 0,
      cancelled: 0,
      error: 0,
      overdue: 0,
      averageCompletionTime: 0,
      lastUpdateTime: Date.now()
    }

    const tasks = userId 
      ? await this.getUserTasks(userId)
      : await this.storage.getAllTasks()

    stats.total = tasks.length

    let totalCompletionTime = 0
    let completedCount = 0
    const now = Date.now()

    for (const task of tasks) {
      switch (task.status) {
        case 'created':
          stats.created++
          break
        case 'assigned':
          stats.assigned++
          break
        case 'started':
          stats.started++
          break
        case 'completed':
          stats.completed++
          if (task.completeTime) {
            totalCompletionTime += task.completeTime - task.createTime
            completedCount++
          }
          break
        case 'cancelled':
          stats.cancelled++
          break
        case 'error':
          stats.error++
          break
      }

      // 检查是否过期
      if (task.dueTime && task.dueTime < now && task.status !== 'completed' && task.status !== 'cancelled') {
        stats.overdue++
      }
    }

    if (completedCount > 0) {
      stats.averageCompletionTime = totalCompletionTime / completedCount
    }

    return stats
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.taskCache.clear()
    console.log('清理任务缓存')
  }

  /**
   * 获取任务类型
   */
  private getTaskType(node: any): TaskType {
    return node.properties?.taskType || 'user'
  }

  /**
   * 获取候选人
   */
  private getCandidates(node: any): string[] {
    return node.properties?.candidates || []
  }

  /**
   * 获取候选组
   */
  private getCandidateGroups(node: any): string[] {
    return node.properties?.candidateGroups || []
  }

  /**
   * 获取到期时间
   */
  private getDueTime(node: any): number | undefined {
    const duration = node.properties?.duration
    if (duration) {
      return Date.now() + duration
    }
    return undefined
  }

  /**
   * 获取任务优先级
   */
  private getTaskPriority(node: any): TaskPriority {
    return node.properties?.priority || 'normal'
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 初始化分配策略
   */
  private initializeAssignmentStrategies(): void {
    // 默认分配策略：选择第一个候选人
    this.assignmentStrategies.set('default', {
      assign: async (task: Task): Promise<string | undefined> => {
        if (task.candidates.length > 0) {
          return task.candidates[0]
        }
        return undefined
      }
    })

    // 轮询分配策略
    this.assignmentStrategies.set('round_robin', {
      assign: async (task: Task): Promise<string | undefined> => {
        // TODO: 实现轮询分配逻辑
        return task.candidates[0]
      }
    })

    // 负载最少分配策略
    this.assignmentStrategies.set('least_loaded', {
      assign: async (task: Task): Promise<string | undefined> => {
        // TODO: 实现负载最少分配逻辑
        return task.candidates[0]
      }
    })
  }
}

/**
 * 任务分配策略接口
 */
interface TaskAssignmentStrategy {
  assign(task: Task): Promise<string | undefined>
}

/**
 * 任务统计
 */
export interface TaskStats {
  /** 总数 */
  total: number
  /** 已创建 */
  created: number
  /** 已分配 */
  assigned: number
  /** 进行中 */
  started: number
  /** 已完成 */
  completed: number
  /** 已取消 */
  cancelled: number
  /** 错误 */
  error: number
  /** 过期 */
  overdue: number
  /** 平均完成时间 */
  averageCompletionTime: number
  /** 最后更新时间 */
  lastUpdateTime: number
}
