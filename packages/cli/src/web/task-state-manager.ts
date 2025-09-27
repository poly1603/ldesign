/**
 * 任务状态管理器
 * 负责在后端存储和管理任务状态、日志信息
 */

export interface TaskOutputLine {
  /** 时间戳 */
  timestamp: string
  /** 输出内容 */
  content: string
  /** 输出类型 */
  type: 'info' | 'error' | 'warning'
}

export interface TaskServerInfo {
  /** 本地访问地址 */
  localUrl?: string
  /** 网络访问地址 */
  networkUrl?: string
  /** 端口号 */
  port?: string
}

export interface TaskState {
  /** 任务ID */
  taskId: string
  /** 任务类型 */
  taskType: 'dev' | 'build' | 'preview'
  /** 环境 */
  environment: string
  /** 任务状态 */
  status: 'idle' | 'running' | 'completed' | 'error'
  /** 输出日志行 */
  outputLines: TaskOutputLine[]
  /** 服务器信息 */
  serverInfo: TaskServerInfo
  /** 开始时间 */
  startTime?: Date
  /** 结束时间 */
  endTime?: Date
}

/**
 * 任务状态管理器
 * 在内存中存储所有任务的状态和日志信息
 */
export class TaskStateManager {
  private tasks: Map<string, TaskState> = new Map()

  /**
   * 创建新任务
   * @param taskId 任务ID
   * @param taskType 任务类型
   * @param environment 环境
   */
  createTask(taskId: string, taskType: 'dev' | 'build' | 'preview', environment: string): TaskState {
    const task: TaskState = {
      taskId,
      taskType,
      environment,
      status: 'idle',
      outputLines: [],
      serverInfo: {},
      startTime: new Date()
    }

    this.tasks.set(taskId, task)
    console.log(`[TaskStateManager] Created task: ${taskId}`)
    return task
  }

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param status 新状态
   */
  updateTaskStatus(taskId: string, status: TaskState['status']): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = status
      if (status === 'completed' || status === 'error') {
        task.endTime = new Date()
      }
      console.log(`[TaskStateManager] Updated task ${taskId} status to: ${status}`)
    }
  }

  /**
   * 添加输出日志行
   * @param taskId 任务ID
   * @param outputLine 输出行
   */
  addOutputLine(taskId: string, outputLine: TaskOutputLine): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.outputLines.push(outputLine)
      // 限制日志行数，避免内存过度使用
      if (task.outputLines.length > 1000) {
        task.outputLines = task.outputLines.slice(-800) // 保留最后800行
      }
    }
  }

  /**
   * 更新服务器信息
   * @param taskId 任务ID
   * @param serverInfo 服务器信息
   */
  updateServerInfo(taskId: string, serverInfo: Partial<TaskServerInfo>): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.serverInfo = { ...task.serverInfo, ...serverInfo }
      console.log(`[TaskStateManager] Updated server info for task ${taskId}:`, serverInfo)
    }
  }

  /**
   * 获取任务状态
   * @param taskId 任务ID
   * @returns 任务状态或undefined
   */
  getTask(taskId: string): TaskState | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有任务
   * @returns 所有任务状态
   */
  getAllTasks(): TaskState[] {
    return Array.from(this.tasks.values())
  }

  /**
   * 根据类型和环境获取任务
   * @param taskType 任务类型
   * @param environment 环境
   * @returns 任务状态或undefined
   */
  getTaskByTypeAndEnv(taskType: string, environment: string): TaskState | undefined {
    for (const task of this.tasks.values()) {
      if (task.taskType === taskType && task.environment === environment) {
        return task
      }
    }
    return undefined
  }

  /**
   * 删除任务
   * @param taskId 任务ID
   */
  deleteTask(taskId: string): void {
    if (this.tasks.delete(taskId)) {
      console.log(`[TaskStateManager] Deleted task: ${taskId}`)
    }
  }

  /**
   * 清空所有任务
   */
  clearAllTasks(): void {
    this.tasks.clear()
    console.log('[TaskStateManager] Cleared all tasks')
  }

  /**
   * 清空指定类型的任务
   * @param taskType 任务类型
   */
  clearTasksByType(taskType: 'dev' | 'build' | 'preview'): void {
    const tasksToDelete: string[] = []
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.taskType === taskType) {
        tasksToDelete.push(taskId)
      }
    }

    tasksToDelete.forEach(taskId => {
      this.tasks.delete(taskId)
    })

    console.log(`[TaskStateManager] Cleared ${tasksToDelete.length} tasks of type: ${taskType}`)
  }

  /**
   * 清空指定环境的任务
   * @param environment 环境
   */
  clearTasksByEnvironment(environment: string): void {
    const tasksToDelete: string[] = []
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.environment === environment) {
        tasksToDelete.push(taskId)
      }
    }

    tasksToDelete.forEach(taskId => {
      this.tasks.delete(taskId)
    })

    console.log(`[TaskStateManager] Cleared ${tasksToDelete.length} tasks for environment: ${environment}`)
  }

  /**
   * 获取运行中的任务数量
   */
  getRunningTasksCount(): number {
    let count = 0
    for (const task of this.tasks.values()) {
      if (task.status === 'running') {
        count++
      }
    }
    return count
  }
}

// 全局单例实例
export const taskStateManager = new TaskStateManager()
