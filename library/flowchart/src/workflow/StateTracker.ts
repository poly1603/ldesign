/**
 * 状态跟踪器
 * 
 * 负责跟踪流程执行状态、令牌管理和活动实例管理
 */

import { EventEmitter } from 'events'
import type {
  ProcessInstance,
  Token,
  TokenStatus,
  ActivityInstance,
  ActivityType,
  ActivityStatus
} from './types'
import type { WorkflowStorage } from './WorkflowStorage'

/**
 * 状态跟踪器
 */
export class StateTracker extends EventEmitter {
  private storage: WorkflowStorage
  private tokenCache: Map<string, Token> = new Map()
  private activityCache: Map<string, ActivityInstance> = new Map()

  constructor(storage: WorkflowStorage) {
    super()
    this.storage = storage
  }

  /**
   * 初始化流程实例状态
   */
  async initializeInstance(instance: ProcessInstance): Promise<void> {
    // 记录流程启动事件
    await this.recordEvent(instance.id, 'process:started', {
      processDefinitionId: instance.processDefinitionId,
      startedBy: instance.startedBy,
      startTime: instance.startTime
    })

    console.log(`初始化流程实例状态: ${instance.id}`)
  }

  /**
   * 创建令牌
   */
  async createToken(processInstanceId: string, nodeId: string): Promise<Token> {
    const tokenId = this.generateTokenId()
    
    const token: Token = {
      id: tokenId,
      processInstanceId,
      currentNodeId: nodeId,
      status: 'active',
      createTime: Date.now(),
      data: {},
      childTokenIds: []
    }

    // 保存到存储
    await this.storage.saveToken(token)
    
    // 缓存令牌
    this.tokenCache.set(tokenId, token)
    
    // 记录令牌创建事件
    await this.recordEvent(processInstanceId, 'token:created', {
      tokenId,
      nodeId,
      createTime: token.createTime
    })
    
    console.log(`创建令牌: ${tokenId} 在节点 ${nodeId}`)
    return token
  }

  /**
   * 创建子令牌
   */
  async createChildToken(parentToken: Token, nodeId: string): Promise<Token> {
    const tokenId = this.generateTokenId()
    
    const token: Token = {
      id: tokenId,
      processInstanceId: parentToken.processInstanceId,
      currentNodeId: nodeId,
      status: 'active',
      createTime: Date.now(),
      data: { ...parentToken.data },
      parentTokenId: parentToken.id,
      childTokenIds: []
    }

    // 更新父令牌
    parentToken.childTokenIds.push(tokenId)
    await this.storage.saveToken(parentToken)
    this.tokenCache.set(parentToken.id, parentToken)

    // 保存子令牌
    await this.storage.saveToken(token)
    this.tokenCache.set(tokenId, token)
    
    // 记录子令牌创建事件
    await this.recordEvent(parentToken.processInstanceId, 'token:created', {
      tokenId,
      parentTokenId: parentToken.id,
      nodeId,
      createTime: token.createTime
    })
    
    console.log(`创建子令牌: ${tokenId} (父令牌: ${parentToken.id})`)
    return token
  }

  /**
   * 移动令牌
   */
  async moveToken(tokenId: string, targetNodeId: string): Promise<void> {
    const token = await this.getToken(tokenId)
    if (!token) {
      throw new Error(`令牌不存在: ${tokenId}`)
    }

    const oldNodeId = token.currentNodeId
    token.currentNodeId = targetNodeId

    // 保存到存储
    await this.storage.saveToken(token)
    
    // 更新缓存
    this.tokenCache.set(tokenId, token)
    
    // 记录令牌移动事件
    await this.recordEvent(token.processInstanceId, 'token:moved', {
      tokenId,
      fromNodeId: oldNodeId,
      toNodeId: targetNodeId,
      moveTime: Date.now()
    })
    
    console.log(`令牌 ${tokenId} 从 ${oldNodeId} 移动到 ${targetNodeId}`)
  }

  /**
   * 完成令牌
   */
  async completeToken(tokenId: string): Promise<void> {
    const token = await this.getToken(tokenId)
    if (!token) {
      throw new Error(`令牌不存在: ${tokenId}`)
    }

    token.status = 'completed'

    // 保存到存储
    await this.storage.saveToken(token)
    
    // 更新缓存
    this.tokenCache.set(tokenId, token)
    
    // 记录令牌完成事件
    await this.recordEvent(token.processInstanceId, 'token:completed', {
      tokenId,
      nodeId: token.currentNodeId,
      completeTime: Date.now()
    })
    
    console.log(`令牌 ${tokenId} 已完成`)
  }

  /**
   * 等待令牌
   */
  async waitToken(tokenId: string): Promise<void> {
    const token = await this.getToken(tokenId)
    if (!token) {
      throw new Error(`令牌不存在: ${tokenId}`)
    }

    token.status = 'waiting'

    // 保存到存储
    await this.storage.saveToken(token)
    
    // 更新缓存
    this.tokenCache.set(tokenId, token)
    
    console.log(`令牌 ${tokenId} 进入等待状态`)
  }

  /**
   * 终止令牌
   */
  async terminateToken(tokenId: string): Promise<void> {
    const token = await this.getToken(tokenId)
    if (!token) {
      throw new Error(`令牌不存在: ${tokenId}`)
    }

    token.status = 'terminated'

    // 终止所有子令牌
    for (const childTokenId of token.childTokenIds) {
      await this.terminateToken(childTokenId)
    }

    // 保存到存储
    await this.storage.saveToken(token)
    
    // 更新缓存
    this.tokenCache.set(tokenId, token)
    
    console.log(`令牌 ${tokenId} 已终止`)
  }

  /**
   * 获取令牌
   */
  async getToken(tokenId: string): Promise<Token | null> {
    // 先从缓存获取
    let token = this.tokenCache.get(tokenId)
    if (token) {
      return token
    }

    // 从存储获取
    token = await this.storage.getToken(tokenId)
    if (token) {
      this.tokenCache.set(tokenId, token)
    }

    return token
  }

  /**
   * 获取活跃令牌
   */
  async getActiveTokens(processInstanceId: string): Promise<Token[]> {
    return this.storage.getTokensByStatus(processInstanceId, 'active')
  }

  /**
   * 获取兄弟令牌
   */
  async getSiblingTokens(tokenId: string): Promise<Token[]> {
    const token = await this.getToken(tokenId)
    if (!token || !token.parentTokenId) {
      return []
    }

    const parentToken = await this.getToken(token.parentTokenId)
    if (!parentToken) {
      return []
    }

    const siblingTokens = []
    for (const childTokenId of parentToken.childTokenIds) {
      if (childTokenId !== tokenId) {
        const siblingToken = await this.getToken(childTokenId)
        if (siblingToken) {
          siblingTokens.push(siblingToken)
        }
      }
    }

    return siblingTokens
  }

  /**
   * 创建活动实例
   */
  async createActivity(
    processInstanceId: string,
    nodeId: string,
    name: string,
    type: ActivityType,
    executor?: string
  ): Promise<ActivityInstance> {
    const activityId = this.generateActivityId()
    
    const activity: ActivityInstance = {
      id: activityId,
      processInstanceId,
      nodeId,
      name,
      type,
      status: 'waiting',
      startTime: Date.now(),
      executor,
      data: {}
    }

    // 保存到存储
    await this.storage.saveActivity(activity)
    
    // 缓存活动
    this.activityCache.set(activityId, activity)
    
    // 记录活动创建事件
    await this.recordEvent(processInstanceId, 'activity:created', {
      activityId,
      nodeId,
      name,
      type,
      createTime: activity.startTime
    })
    
    console.log(`创建活动实例: ${activityId} (${name})`)
    return activity
  }

  /**
   * 开始活动
   */
  async startActivity(activityId: string): Promise<void> {
    const activity = await this.getActivity(activityId)
    if (!activity) {
      throw new Error(`活动实例不存在: ${activityId}`)
    }

    activity.status = 'active'

    // 保存到存储
    await this.storage.saveActivity(activity)
    
    // 更新缓存
    this.activityCache.set(activityId, activity)
    
    // 记录活动开始事件
    await this.recordEvent(activity.processInstanceId, 'activity:started', {
      activityId,
      nodeId: activity.nodeId,
      startTime: Date.now()
    })
    
    console.log(`活动实例 ${activityId} 开始执行`)
  }

  /**
   * 完成活动
   */
  async completeActivity(activityId: string, data?: Record<string, any>): Promise<void> {
    const activity = await this.getActivity(activityId)
    if (!activity) {
      throw new Error(`活动实例不存在: ${activityId}`)
    }

    activity.status = 'completed'
    activity.endTime = Date.now()
    
    if (data) {
      activity.data = { ...activity.data, ...data }
    }

    // 保存到存储
    await this.storage.saveActivity(activity)
    
    // 更新缓存
    this.activityCache.set(activityId, activity)
    
    // 记录活动完成事件
    await this.recordEvent(activity.processInstanceId, 'activity:completed', {
      activityId,
      nodeId: activity.nodeId,
      endTime: activity.endTime,
      duration: activity.endTime - activity.startTime
    })
    
    console.log(`活动实例 ${activityId} 已完成`)
  }

  /**
   * 跳过活动
   */
  async skipActivity(activityId: string, reason?: string): Promise<void> {
    const activity = await this.getActivity(activityId)
    if (!activity) {
      throw new Error(`活动实例不存在: ${activityId}`)
    }

    activity.status = 'skipped'
    activity.endTime = Date.now()
    
    if (reason) {
      activity.data.skipReason = reason
    }

    // 保存到存储
    await this.storage.saveActivity(activity)
    
    // 更新缓存
    this.activityCache.set(activityId, activity)
    
    console.log(`活动实例 ${activityId} 已跳过`)
  }

  /**
   * 获取活动实例
   */
  async getActivity(activityId: string): Promise<ActivityInstance | null> {
    // 先从缓存获取
    let activity = this.activityCache.get(activityId)
    if (activity) {
      return activity
    }

    // 从存储获取
    activity = await this.storage.getActivity(activityId)
    if (activity) {
      this.activityCache.set(activityId, activity)
    }

    return activity
  }

  /**
   * 获取流程的活动实例
   */
  async getActivitiesByInstance(processInstanceId: string): Promise<ActivityInstance[]> {
    return this.storage.getActivitiesByInstance(processInstanceId)
  }

  /**
   * 记录事件
   */
  async recordEvent(
    processInstanceId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    const event = {
      id: this.generateEventId(),
      processInstanceId,
      eventType,
      eventData,
      timestamp: Date.now()
    }

    await this.storage.saveEvent(event)
    
    console.log(`记录事件: ${eventType} (实例: ${processInstanceId})`)
  }

  /**
   * 获取流程事件
   */
  async getEvents(processInstanceId: string): Promise<ProcessEvent[]> {
    return this.storage.getEventsByInstance(processInstanceId)
  }

  /**
   * 获取流程执行轨迹
   */
  async getExecutionTrace(processInstanceId: string): Promise<ExecutionTrace> {
    const events = await this.getEvents(processInstanceId)
    const activities = await this.getActivitiesByInstance(processInstanceId)
    const tokens = await this.storage.getTokensByInstance(processInstanceId)

    return {
      processInstanceId,
      events,
      activities,
      tokens,
      generateTime: Date.now()
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.tokenCache.clear()
    this.activityCache.clear()
    console.log('清理状态跟踪缓存')
  }

  /**
   * 生成令牌ID
   */
  private generateTokenId(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成活动ID
   */
  private generateActivityId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 流程事件
 */
export interface ProcessEvent {
  /** 事件ID */
  id: string
  /** 流程实例ID */
  processInstanceId: string
  /** 事件类型 */
  eventType: string
  /** 事件数据 */
  eventData: Record<string, any>
  /** 时间戳 */
  timestamp: number
}

/**
 * 执行轨迹
 */
export interface ExecutionTrace {
  /** 流程实例ID */
  processInstanceId: string
  /** 事件列表 */
  events: ProcessEvent[]
  /** 活动实例列表 */
  activities: ActivityInstance[]
  /** 令牌列表 */
  tokens: Token[]
  /** 生成时间 */
  generateTime: number
}
