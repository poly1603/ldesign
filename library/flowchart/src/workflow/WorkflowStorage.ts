/**
 * 工作流存储
 * 
 * 负责工作流数据的持久化存储
 */

import type {
  ProcessDefinition,
  ProcessInstance,
  ProcessStatus,
  Task,
  TaskResult,
  TaskQuery,
  TaskStatus,
  Token,
  TokenStatus,
  ActivityInstance,
  WorkflowStorageConfig,
  WorkflowStats
} from './types'
import type { ProcessEvent } from './StateTracker'
import type { ProcessInstanceQuery, ProcessInstanceQueryResult } from './ProcessInstanceManager'

/**
 * 工作流存储接口
 */
export abstract class WorkflowStorage {
  protected config: WorkflowStorageConfig

  constructor(config: WorkflowStorageConfig) {
    this.config = config
  }

  // 初始化和关闭
  abstract initialize(): Promise<void>
  abstract close(): Promise<void>

  // 流程定义
  abstract saveProcessDefinition(definition: ProcessDefinition): Promise<void>
  abstract getProcessDefinition(id: string): Promise<ProcessDefinition | null>
  abstract getProcessDefinitions(): Promise<ProcessDefinition[]>
  abstract deleteProcessDefinition(id: string): Promise<void>

  // 流程实例
  abstract saveProcessInstance(instance: ProcessInstance): Promise<void>
  abstract getProcessInstance(id: string): Promise<ProcessInstance | null>
  abstract getAllProcessInstances(): Promise<ProcessInstance[]>
  abstract getProcessInstancesByStatus(status: ProcessStatus): Promise<ProcessInstance[]>
  abstract getProcessInstancesByUser(userId: string): Promise<ProcessInstance[]>
  abstract getProcessInstancesByDefinition(definitionId: string): Promise<ProcessInstance[]>
  abstract queryProcessInstances(query: ProcessInstanceQuery): Promise<ProcessInstanceQueryResult>
  abstract deleteProcessInstance(id: string): Promise<void>

  // 任务
  abstract saveTask(task: Task): Promise<void>
  abstract getTask(id: string): Promise<Task | null>
  abstract getAllTasks(): Promise<Task[]>
  abstract getTasksByInstance(instanceId: string): Promise<Task[]>
  abstract getTasksByNode(instanceId: string, nodeId: string): Promise<Task[]>
  abstract getUserTasks(userId: string, status?: TaskStatus[]): Promise<Task[]>
  abstract getCandidateTasks(userId: string, groups: string[]): Promise<Task[]>
  abstract queryTasks(query: TaskQuery): Promise<Task[]>
  abstract saveTaskResult(result: TaskResult): Promise<void>
  abstract deleteTask(id: string): Promise<void>

  // 令牌
  abstract saveToken(token: Token): Promise<void>
  abstract getToken(id: string): Promise<Token | null>
  abstract getTokensByInstance(instanceId: string): Promise<Token[]>
  abstract getTokensByStatus(instanceId: string, status: TokenStatus): Promise<Token[]>
  abstract deleteToken(id: string): Promise<void>

  // 活动实例
  abstract saveActivity(activity: ActivityInstance): Promise<void>
  abstract getActivity(id: string): Promise<ActivityInstance | null>
  abstract getActivitiesByInstance(instanceId: string): Promise<ActivityInstance[]>
  abstract deleteActivity(id: string): Promise<void>

  // 事件
  abstract saveEvent(event: ProcessEvent): Promise<void>
  abstract getEventsByInstance(instanceId: string): Promise<ProcessEvent[]>

  // 统计
  abstract getStats(): Promise<WorkflowStats>
}

/**
 * 内存存储实现
 */
export class MemoryWorkflowStorage extends WorkflowStorage {
  private processDefinitions: Map<string, ProcessDefinition> = new Map()
  private processInstances: Map<string, ProcessInstance> = new Map()
  private tasks: Map<string, Task> = new Map()
  private taskResults: Map<string, TaskResult> = new Map()
  private tokens: Map<string, Token> = new Map()
  private activities: Map<string, ActivityInstance> = new Map()
  private events: Map<string, ProcessEvent[]> = new Map()

  async initialize(): Promise<void> {
    console.log('内存工作流存储初始化完成')
  }

  async close(): Promise<void> {
    this.processDefinitions.clear()
    this.processInstances.clear()
    this.tasks.clear()
    this.taskResults.clear()
    this.tokens.clear()
    this.activities.clear()
    this.events.clear()
    console.log('内存工作流存储已关闭')
  }

  // 流程定义实现
  async saveProcessDefinition(definition: ProcessDefinition): Promise<void> {
    this.processDefinitions.set(definition.id, { ...definition })
  }

  async getProcessDefinition(id: string): Promise<ProcessDefinition | null> {
    const definition = this.processDefinitions.get(id)
    return definition ? { ...definition } : null
  }

  async getProcessDefinitions(): Promise<ProcessDefinition[]> {
    return Array.from(this.processDefinitions.values()).map(def => ({ ...def }))
  }

  async deleteProcessDefinition(id: string): Promise<void> {
    this.processDefinitions.delete(id)
  }

  // 流程实例实现
  async saveProcessInstance(instance: ProcessInstance): Promise<void> {
    this.processInstances.set(instance.id, { ...instance })
  }

  async getProcessInstance(id: string): Promise<ProcessInstance | null> {
    const instance = this.processInstances.get(id)
    return instance ? { ...instance } : null
  }

  async getAllProcessInstances(): Promise<ProcessInstance[]> {
    return Array.from(this.processInstances.values()).map(inst => ({ ...inst }))
  }

  async getProcessInstancesByStatus(status: ProcessStatus): Promise<ProcessInstance[]> {
    return Array.from(this.processInstances.values())
      .filter(inst => inst.status === status)
      .map(inst => ({ ...inst }))
  }

  async getProcessInstancesByUser(userId: string): Promise<ProcessInstance[]> {
    return Array.from(this.processInstances.values())
      .filter(inst => inst.startedBy === userId)
      .map(inst => ({ ...inst }))
  }

  async getProcessInstancesByDefinition(definitionId: string): Promise<ProcessInstance[]> {
    return Array.from(this.processInstances.values())
      .filter(inst => inst.processDefinitionId === definitionId)
      .map(inst => ({ ...inst }))
  }

  async queryProcessInstances(query: ProcessInstanceQuery): Promise<ProcessInstanceQueryResult> {
    let instances = Array.from(this.processInstances.values())

    // 应用过滤条件
    if (query.processDefinitionId) {
      instances = instances.filter(inst => inst.processDefinitionId === query.processDefinitionId)
    }

    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status]
      instances = instances.filter(inst => statuses.includes(inst.status))
    }

    if (query.startedBy) {
      instances = instances.filter(inst => inst.startedBy === query.startedBy)
    }

    if (query.businessKey) {
      instances = instances.filter(inst => inst.businessKey === query.businessKey)
    }

    if (query.startTimeRange) {
      const [start, end] = query.startTimeRange
      instances = instances.filter(inst => inst.startTime >= start && inst.startTime <= end)
    }

    if (query.endTimeRange) {
      const [start, end] = query.endTimeRange
      instances = instances.filter(inst => inst.endTime && inst.endTime >= start && inst.endTime <= end)
    }

    // 应用排序
    if (query.sort) {
      const { field, order } = query.sort
      instances.sort((a, b) => {
        const aValue = (a as any)[field]
        const bValue = (b as any)[field]
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return order === 'desc' ? -comparison : comparison
      })
    }

    const total = instances.length

    // 应用分页
    if (query.pagination) {
      const { offset, limit } = query.pagination
      instances = instances.slice(offset, offset + limit)
    }

    return {
      instances: instances.map(inst => ({ ...inst })),
      total,
      offset: query.pagination?.offset || 0,
      limit: query.pagination?.limit || total
    }
  }

  async deleteProcessInstance(id: string): Promise<void> {
    this.processInstances.delete(id)
  }

  // 任务实现
  async saveTask(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task })
  }

  async getTask(id: string): Promise<Task | null> {
    const task = this.tasks.get(id)
    return task ? { ...task } : null
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).map(task => ({ ...task }))
  }

  async getTasksByInstance(instanceId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.processInstanceId === instanceId)
      .map(task => ({ ...task }))
  }

  async getTasksByNode(instanceId: string, nodeId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.processInstanceId === instanceId && task.nodeId === nodeId)
      .map(task => ({ ...task }))
  }

  async getUserTasks(userId: string, status?: TaskStatus[]): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values())
      .filter(task => task.assignee === userId)

    if (status) {
      tasks = tasks.filter(task => status.includes(task.status))
    }

    return tasks.map(task => ({ ...task }))
  }

  async getCandidateTasks(userId: string, groups: string[]): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => 
        task.candidates.includes(userId) || 
        task.candidateGroups.some(group => groups.includes(group))
      )
      .map(task => ({ ...task }))
  }

  async queryTasks(query: TaskQuery): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values())

    // 应用过滤条件
    if (query.processInstanceId) {
      tasks = tasks.filter(task => task.processInstanceId === query.processInstanceId)
    }

    if (query.assignee) {
      tasks = tasks.filter(task => task.assignee === query.assignee)
    }

    if (query.candidate) {
      tasks = tasks.filter(task => task.candidates.includes(query.candidate!))
    }

    if (query.candidateGroup) {
      tasks = tasks.filter(task => task.candidateGroups.includes(query.candidateGroup!))
    }

    if (query.status) {
      tasks = tasks.filter(task => task.status === query.status)
    }

    if (query.createTimeRange) {
      const [start, end] = query.createTimeRange
      tasks = tasks.filter(task => task.createTime >= start && task.createTime <= end)
    }

    if (query.dueTimeRange) {
      const [start, end] = query.dueTimeRange
      tasks = tasks.filter(task => task.dueTime && task.dueTime >= start && task.dueTime <= end)
    }

    // 应用排序
    if (query.sort) {
      const { field, order } = query.sort
      tasks.sort((a, b) => {
        const aValue = (a as any)[field]
        const bValue = (b as any)[field]
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        return order === 'desc' ? -comparison : comparison
      })
    }

    // 应用分页
    if (query.pagination) {
      const { offset, limit } = query.pagination
      tasks = tasks.slice(offset, offset + limit)
    }

    return tasks.map(task => ({ ...task }))
  }

  async saveTaskResult(result: TaskResult): Promise<void> {
    this.taskResults.set(result.taskId, { ...result })
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id)
    this.taskResults.delete(id)
  }

  // 令牌实现
  async saveToken(token: Token): Promise<void> {
    this.tokens.set(token.id, { ...token })
  }

  async getToken(id: string): Promise<Token | null> {
    const token = this.tokens.get(id)
    return token ? { ...token } : null
  }

  async getTokensByInstance(instanceId: string): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.processInstanceId === instanceId)
      .map(token => ({ ...token }))
  }

  async getTokensByStatus(instanceId: string, status: TokenStatus): Promise<Token[]> {
    return Array.from(this.tokens.values())
      .filter(token => token.processInstanceId === instanceId && token.status === status)
      .map(token => ({ ...token }))
  }

  async deleteToken(id: string): Promise<void> {
    this.tokens.delete(id)
  }

  // 活动实例实现
  async saveActivity(activity: ActivityInstance): Promise<void> {
    this.activities.set(activity.id, { ...activity })
  }

  async getActivity(id: string): Promise<ActivityInstance | null> {
    const activity = this.activities.get(id)
    return activity ? { ...activity } : null
  }

  async getActivitiesByInstance(instanceId: string): Promise<ActivityInstance[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.processInstanceId === instanceId)
      .map(activity => ({ ...activity }))
  }

  async deleteActivity(id: string): Promise<void> {
    this.activities.delete(id)
  }

  // 事件实现
  async saveEvent(event: ProcessEvent): Promise<void> {
    const instanceEvents = this.events.get(event.processInstanceId) || []
    instanceEvents.push({ ...event })
    this.events.set(event.processInstanceId, instanceEvents)
  }

  async getEventsByInstance(instanceId: string): Promise<ProcessEvent[]> {
    const events = this.events.get(instanceId) || []
    return events.map(event => ({ ...event }))
  }

  // 统计实现
  async getStats(): Promise<WorkflowStats> {
    const instances = Array.from(this.processInstances.values())
    const tasks = Array.from(this.tasks.values())

    const stats: WorkflowStats = {
      totalProcessDefinitions: this.processDefinitions.size,
      activeProcessInstances: instances.filter(inst => inst.status === 'running').length,
      completedProcessInstances: instances.filter(inst => inst.status === 'completed').length,
      pendingTasks: tasks.filter(task => task.status === 'assigned' || task.status === 'started').length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      averageProcessingTime: 0,
      lastUpdateTime: Date.now()
    }

    // 计算平均处理时间
    const completedInstances = instances.filter(inst => inst.status === 'completed' && inst.endTime)
    if (completedInstances.length > 0) {
      const totalTime = completedInstances.reduce((sum, inst) => sum + (inst.endTime! - inst.startTime), 0)
      stats.averageProcessingTime = totalTime / completedInstances.length
    }

    return stats
  }
}
