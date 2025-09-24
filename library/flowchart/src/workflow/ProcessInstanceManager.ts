/**
 * 流程实例管理器
 * 
 * 负责流程实例的创建、管理和状态更新
 */

import { EventEmitter } from 'events'
import type {
  ProcessInstance,
  ProcessDefinition,
  ProcessContext,
  ProcessStatus
} from './types'
import type { WorkflowStorage } from './WorkflowStorage'

/**
 * 流程实例管理器
 */
export class ProcessInstanceManager extends EventEmitter {
  private storage: WorkflowStorage
  private instanceCache: Map<string, ProcessInstance> = new Map()

  constructor(storage: WorkflowStorage) {
    super()
    this.storage = storage
  }

  /**
   * 创建流程实例
   */
  async createInstance(
    definition: ProcessDefinition,
    context: ProcessContext
  ): Promise<ProcessInstance> {
    const instanceId = this.generateInstanceId()
    
    const instance: ProcessInstance = {
      id: instanceId,
      processDefinitionId: definition.id,
      name: `${definition.name} - ${new Date().toLocaleString()}`,
      status: 'running',
      startTime: Date.now(),
      startedBy: context.user.id,
      currentNodes: [],
      variables: { ...context.variables },
      businessKey: context.businessData.businessKey,
      parentInstanceId: context.businessData.parentInstanceId,
      childInstanceIds: [],
      data: { ...context.businessData }
    }

    // 保存到存储
    await this.storage.saveProcessInstance(instance)
    
    // 缓存实例
    this.instanceCache.set(instanceId, instance)
    
    // 触发实例创建事件
    this.emit('instance:created', instance)
    
    console.log(`创建流程实例: ${instanceId}`)
    return instance
  }

  /**
   * 获取流程实例
   */
  async getInstance(instanceId: string): Promise<ProcessInstance | null> {
    // 先从缓存获取
    let instance = this.instanceCache.get(instanceId)
    if (instance) {
      return instance
    }

    // 从存储获取
    instance = await this.storage.getProcessInstance(instanceId)
    if (instance) {
      this.instanceCache.set(instanceId, instance)
    }

    return instance
  }

  /**
   * 更新流程实例状态
   */
  async updateInstanceStatus(instanceId: string, status: ProcessStatus): Promise<void> {
    const instance = await this.getInstance(instanceId)
    if (!instance) {
      throw new Error(`流程实例不存在: ${instanceId}`)
    }

    const oldStatus = instance.status
    instance.status = status

    // 设置结束时间
    if (status === 'completed' || status === 'terminated') {
      instance.endTime = Date.now()
    }

    // 保存到存储
    await this.storage.saveProcessInstance(instance)
    
    // 更新缓存
    this.instanceCache.set(instanceId, instance)
    
    // 触发状态变化事件
    this.emit('instance:status-changed', instance, oldStatus, status)
    
    console.log(`流程实例 ${instanceId} 状态从 ${oldStatus} 变更为 ${status}`)
  }

  /**
   * 更新流程实例变量
   */
  async updateInstanceVariables(
    instanceId: string,
    variables: Record<string, any>
  ): Promise<void> {
    const instance = await this.getInstance(instanceId)
    if (!instance) {
      throw new Error(`流程实例不存在: ${instanceId}`)
    }

    // 合并变量
    instance.variables = { ...instance.variables, ...variables }

    // 保存到存储
    await this.storage.saveProcessInstance(instance)
    
    // 更新缓存
    this.instanceCache.set(instanceId, instance)
    
    // 触发变量更新事件
    this.emit('instance:variables-updated', instance, variables)
    
    console.log(`更新流程实例 ${instanceId} 变量`)
  }

  /**
   * 更新当前节点
   */
  async updateCurrentNodes(instanceId: string, nodeIds: string[]): Promise<void> {
    const instance = await this.getInstance(instanceId)
    if (!instance) {
      throw new Error(`流程实例不存在: ${instanceId}`)
    }

    const oldNodes = [...instance.currentNodes]
    instance.currentNodes = [...nodeIds]

    // 保存到存储
    await this.storage.saveProcessInstance(instance)
    
    // 更新缓存
    this.instanceCache.set(instanceId, instance)
    
    // 触发当前节点更新事件
    this.emit('instance:current-nodes-updated', instance, oldNodes, nodeIds)
    
    console.log(`更新流程实例 ${instanceId} 当前节点: ${nodeIds.join(', ')}`)
  }

  /**
   * 添加子实例
   */
  async addChildInstance(parentInstanceId: string, childInstanceId: string): Promise<void> {
    const parentInstance = await this.getInstance(parentInstanceId)
    if (!parentInstance) {
      throw new Error(`父流程实例不存在: ${parentInstanceId}`)
    }

    if (!parentInstance.childInstanceIds.includes(childInstanceId)) {
      parentInstance.childInstanceIds.push(childInstanceId)
      
      // 保存到存储
      await this.storage.saveProcessInstance(parentInstance)
      
      // 更新缓存
      this.instanceCache.set(parentInstanceId, parentInstance)
      
      console.log(`添加子实例 ${childInstanceId} 到父实例 ${parentInstanceId}`)
    }
  }

  /**
   * 移除子实例
   */
  async removeChildInstance(parentInstanceId: string, childInstanceId: string): Promise<void> {
    const parentInstance = await this.getInstance(parentInstanceId)
    if (!parentInstance) {
      throw new Error(`父流程实例不存在: ${parentInstanceId}`)
    }

    const index = parentInstance.childInstanceIds.indexOf(childInstanceId)
    if (index > -1) {
      parentInstance.childInstanceIds.splice(index, 1)
      
      // 保存到存储
      await this.storage.saveProcessInstance(parentInstance)
      
      // 更新缓存
      this.instanceCache.set(parentInstanceId, parentInstance)
      
      console.log(`从父实例 ${parentInstanceId} 移除子实例 ${childInstanceId}`)
    }
  }

  /**
   * 获取运行中的流程实例
   */
  async getRunningInstances(): Promise<ProcessInstance[]> {
    return this.storage.getProcessInstancesByStatus('running')
  }

  /**
   * 获取用户的流程实例
   */
  async getUserInstances(userId: string): Promise<ProcessInstance[]> {
    return this.storage.getProcessInstancesByUser(userId)
  }

  /**
   * 获取流程定义的实例
   */
  async getInstancesByDefinition(definitionId: string): Promise<ProcessInstance[]> {
    return this.storage.getProcessInstancesByDefinition(definitionId)
  }

  /**
   * 删除流程实例
   */
  async deleteInstance(instanceId: string): Promise<void> {
    const instance = await this.getInstance(instanceId)
    if (!instance) {
      throw new Error(`流程实例不存在: ${instanceId}`)
    }

    // 检查实例状态
    if (instance.status === 'running') {
      throw new Error(`不能删除运行中的流程实例: ${instanceId}`)
    }

    // 删除子实例
    for (const childId of instance.childInstanceIds) {
      await this.deleteInstance(childId)
    }

    // 从父实例中移除
    if (instance.parentInstanceId) {
      await this.removeChildInstance(instance.parentInstanceId, instanceId)
    }

    // 从存储删除
    await this.storage.deleteProcessInstance(instanceId)
    
    // 从缓存删除
    this.instanceCache.delete(instanceId)
    
    // 触发实例删除事件
    this.emit('instance:deleted', instance)
    
    console.log(`删除流程实例: ${instanceId}`)
  }

  /**
   * 查询流程实例
   */
  async queryInstances(query: ProcessInstanceQuery): Promise<ProcessInstanceQueryResult> {
    return this.storage.queryProcessInstances(query)
  }

  /**
   * 获取流程实例统计
   */
  async getInstanceStats(definitionId?: string): Promise<ProcessInstanceStats> {
    const stats: ProcessInstanceStats = {
      total: 0,
      running: 0,
      completed: 0,
      terminated: 0,
      suspended: 0,
      error: 0,
      averageDuration: 0,
      lastUpdateTime: Date.now()
    }

    const instances = definitionId 
      ? await this.getInstancesByDefinition(definitionId)
      : await this.storage.getAllProcessInstances()

    stats.total = instances.length

    let totalDuration = 0
    let completedCount = 0

    for (const instance of instances) {
      switch (instance.status) {
        case 'running':
          stats.running++
          break
        case 'completed':
          stats.completed++
          if (instance.endTime) {
            totalDuration += instance.endTime - instance.startTime
            completedCount++
          }
          break
        case 'terminated':
          stats.terminated++
          break
        case 'suspended':
          stats.suspended++
          break
        case 'error':
          stats.error++
          break
      }
    }

    if (completedCount > 0) {
      stats.averageDuration = totalDuration / completedCount
    }

    return stats
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.instanceCache.clear()
    console.log('清理流程实例缓存')
  }

  /**
   * 生成实例ID
   */
  private generateInstanceId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 流程实例查询条件
 */
export interface ProcessInstanceQuery {
  /** 流程定义ID */
  processDefinitionId?: string
  /** 实例状态 */
  status?: ProcessStatus | ProcessStatus[]
  /** 启动者 */
  startedBy?: string
  /** 业务键 */
  businessKey?: string
  /** 开始时间范围 */
  startTimeRange?: [number, number]
  /** 结束时间范围 */
  endTimeRange?: [number, number]
  /** 变量过滤 */
  variables?: Record<string, any>
  /** 分页 */
  pagination?: {
    offset: number
    limit: number
  }
  /** 排序 */
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
}

/**
 * 流程实例查询结果
 */
export interface ProcessInstanceQueryResult {
  /** 实例列表 */
  instances: ProcessInstance[]
  /** 总数 */
  total: number
  /** 偏移量 */
  offset: number
  /** 限制数 */
  limit: number
}

/**
 * 流程实例统计
 */
export interface ProcessInstanceStats {
  /** 总数 */
  total: number
  /** 运行中 */
  running: number
  /** 已完成 */
  completed: number
  /** 已终止 */
  terminated: number
  /** 已暂停 */
  suspended: number
  /** 错误 */
  error: number
  /** 平均持续时间 */
  averageDuration: number
  /** 最后更新时间 */
  lastUpdateTime: number
}
