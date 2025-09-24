/**
 * 工作流执行引擎
 * 
 * 负责流程的执行、状态管理和任务调度
 */

import { EventEmitter } from 'events'
import type {
  WorkflowEngine as IWorkflowEngine,
  ProcessDefinition,
  ProcessInstance,
  ProcessContext,
  Task,
  TaskResult,
  TaskQuery,
  WorkflowConfig,
  WorkflowEvents,
  WorkflowStats,
  ProcessStatus,
  Token,
  ActivityInstance,
  Transition
} from './types'
import { ProcessInstanceManager } from './ProcessInstanceManager'
import { TaskManager } from './TaskManager'
import { StateTracker } from './StateTracker'
import { ConditionEvaluator } from './ConditionEvaluator'
import { WorkflowStorage } from './WorkflowStorage'

/**
 * 工作流执行引擎实现
 */
export class WorkflowEngine extends EventEmitter implements IWorkflowEngine {
  private config: WorkflowConfig
  private processInstanceManager: ProcessInstanceManager
  private taskManager: TaskManager
  private stateTracker: StateTracker
  private conditionEvaluator: ConditionEvaluator
  private storage: WorkflowStorage
  private processDefinitions: Map<string, ProcessDefinition> = new Map()
  private isInitialized: boolean = false

  constructor(config: WorkflowConfig) {
    super()
    this.config = config
    this.storage = new WorkflowStorage(config.storage)
    this.processInstanceManager = new ProcessInstanceManager(this.storage)
    this.taskManager = new TaskManager(this.storage)
    this.stateTracker = new StateTracker(this.storage)
    this.conditionEvaluator = new ConditionEvaluator()
    
    this.setupEventListeners()
  }

  /**
   * 初始化工作流引擎
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 初始化存储
      await this.storage.initialize()
      
      // 加载流程定义
      await this.loadProcessDefinitions()
      
      // 恢复运行中的流程实例
      await this.recoverRunningInstances()
      
      this.isInitialized = true
      
      console.log('工作流引擎初始化完成')
    } catch (error) {
      console.error('工作流引擎初始化失败:', error)
      throw error
    }
  }

  /**
   * 部署流程定义
   */
  async deployProcess(definition: ProcessDefinition): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('工作流引擎未初始化')
    }

    try {
      // 验证流程定义
      this.validateProcessDefinition(definition)
      
      // 保存流程定义
      await this.storage.saveProcessDefinition(definition)
      
      // 缓存流程定义
      this.processDefinitions.set(definition.id, definition)
      
      console.log(`流程定义 ${definition.name} 部署成功`)
    } catch (error) {
      console.error(`部署流程定义失败:`, error)
      throw error
    }
  }

  /**
   * 启动流程实例
   */
  async startProcess(processDefinitionId: string, context: ProcessContext): Promise<ProcessInstance> {
    if (!this.isInitialized) {
      throw new Error('工作流引擎未初始化')
    }

    const definition = this.processDefinitions.get(processDefinitionId)
    if (!definition) {
      throw new Error(`流程定义不存在: ${processDefinitionId}`)
    }

    if (!definition.enabled) {
      throw new Error(`流程定义已禁用: ${processDefinitionId}`)
    }

    try {
      // 创建流程实例
      const instance = await this.processInstanceManager.createInstance(definition, context)
      
      // 初始化状态跟踪
      await this.stateTracker.initializeInstance(instance)
      
      // 查找开始节点
      const startNodes = this.findStartNodes(definition)
      if (startNodes.length === 0) {
        throw new Error('流程定义中没有开始节点')
      }

      // 创建初始令牌
      for (const startNode of startNodes) {
        await this.createToken(instance.id, startNode.id)
      }

      // 开始执行流程
      await this.executeProcess(instance.id)
      
      // 触发流程启动事件
      this.emit('process:started', instance)
      
      console.log(`流程实例 ${instance.id} 启动成功`)
      return instance
    } catch (error) {
      console.error(`启动流程实例失败:`, error)
      throw error
    }
  }

  /**
   * 执行任务
   */
  async executeTask(taskId: string, result: TaskResult): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('工作流引擎未初始化')
    }

    try {
      // 获取任务
      const task = await this.taskManager.getTask(taskId)
      if (!task) {
        throw new Error(`任务不存在: ${taskId}`)
      }

      // 验证任务状态
      if (task.status !== 'assigned' && task.status !== 'started') {
        throw new Error(`任务状态不允许执行: ${task.status}`)
      }

      // 完成任务
      await this.taskManager.completeTask(taskId, result)
      
      // 继续执行流程
      await this.executeProcess(task.processInstanceId)
      
      // 触发任务完成事件
      this.emit('task:completed', task, result)
      
      console.log(`任务 ${taskId} 执行完成`)
    } catch (error) {
      console.error(`执行任务失败:`, error)
      throw error
    }
  }

  /**
   * 获取流程实例
   */
  async getProcessInstance(instanceId: string): Promise<ProcessInstance | null> {
    return this.processInstanceManager.getInstance(instanceId)
  }

  /**
   * 获取任务列表
   */
  async getTasks(query: TaskQuery): Promise<Task[]> {
    return this.taskManager.queryTasks(query)
  }

  /**
   * 暂停流程实例
   */
  async suspendProcess(instanceId: string): Promise<void> {
    try {
      const instance = await this.processInstanceManager.getInstance(instanceId)
      if (!instance) {
        throw new Error(`流程实例不存在: ${instanceId}`)
      }

      if (instance.status !== 'running') {
        throw new Error(`流程实例状态不允许暂停: ${instance.status}`)
      }

      // 更新实例状态
      await this.processInstanceManager.updateInstanceStatus(instanceId, 'suspended')
      
      // 暂停相关任务
      await this.taskManager.suspendTasksByInstance(instanceId)
      
      // 触发暂停事件
      const updatedInstance = await this.processInstanceManager.getInstance(instanceId)
      this.emit('process:suspended', updatedInstance!)
      
      console.log(`流程实例 ${instanceId} 已暂停`)
    } catch (error) {
      console.error(`暂停流程实例失败:`, error)
      throw error
    }
  }

  /**
   * 恢复流程实例
   */
  async resumeProcess(instanceId: string): Promise<void> {
    try {
      const instance = await this.processInstanceManager.getInstance(instanceId)
      if (!instance) {
        throw new Error(`流程实例不存在: ${instanceId}`)
      }

      if (instance.status !== 'suspended') {
        throw new Error(`流程实例状态不允许恢复: ${instance.status}`)
      }

      // 更新实例状态
      await this.processInstanceManager.updateInstanceStatus(instanceId, 'running')
      
      // 恢复相关任务
      await this.taskManager.resumeTasksByInstance(instanceId)
      
      // 继续执行流程
      await this.executeProcess(instanceId)
      
      // 触发恢复事件
      const updatedInstance = await this.processInstanceManager.getInstance(instanceId)
      this.emit('process:resumed', updatedInstance!)
      
      console.log(`流程实例 ${instanceId} 已恢复`)
    } catch (error) {
      console.error(`恢复流程实例失败:`, error)
      throw error
    }
  }

  /**
   * 终止流程实例
   */
  async terminateProcess(instanceId: string, reason?: string): Promise<void> {
    try {
      const instance = await this.processInstanceManager.getInstance(instanceId)
      if (!instance) {
        throw new Error(`流程实例不存在: ${instanceId}`)
      }

      if (instance.status === 'completed' || instance.status === 'terminated') {
        throw new Error(`流程实例已结束: ${instance.status}`)
      }

      // 更新实例状态
      await this.processInstanceManager.updateInstanceStatus(instanceId, 'terminated')
      
      // 取消相关任务
      await this.taskManager.cancelTasksByInstance(instanceId)
      
      // 记录终止原因
      if (reason) {
        await this.stateTracker.recordEvent(instanceId, 'process:terminated', { reason })
      }
      
      // 触发终止事件
      const updatedInstance = await this.processInstanceManager.getInstance(instanceId)
      this.emit('process:terminated', updatedInstance!)
      
      console.log(`流程实例 ${instanceId} 已终止`)
    } catch (error) {
      console.error(`终止流程实例失败:`, error)
      throw error
    }
  }

  /**
   * 获取工作流统计信息
   */
  async getStats(): Promise<WorkflowStats> {
    const stats = await this.storage.getStats()
    return {
      ...stats,
      lastUpdateTime: Date.now()
    }
  }

  /**
   * 销毁工作流引擎
   */
  async destroy(): Promise<void> {
    try {
      // 停止所有运行中的流程
      const runningInstances = await this.processInstanceManager.getRunningInstances()
      for (const instance of runningInstances) {
        await this.suspendProcess(instance.id)
      }
      
      // 关闭存储连接
      await this.storage.close()
      
      // 清理资源
      this.processDefinitions.clear()
      this.removeAllListeners()
      
      this.isInitialized = false
      
      console.log('工作流引擎已销毁')
    } catch (error) {
      console.error('销毁工作流引擎失败:', error)
      throw error
    }
  }

  /**
   * 执行流程
   */
  private async executeProcess(instanceId: string): Promise<void> {
    const instance = await this.processInstanceManager.getInstance(instanceId)
    if (!instance || instance.status !== 'running') {
      return
    }

    const definition = this.processDefinitions.get(instance.processDefinitionId)
    if (!definition) {
      throw new Error(`流程定义不存在: ${instance.processDefinitionId}`)
    }

    // 获取活跃令牌
    const activeTokens = await this.stateTracker.getActiveTokens(instanceId)
    
    for (const token of activeTokens) {
      await this.processToken(token, definition)
    }

    // 检查流程是否完成
    await this.checkProcessCompletion(instanceId)
  }

  /**
   * 处理令牌
   */
  private async processToken(token: Token, definition: ProcessDefinition): Promise<void> {
    const node = definition.flowchartData.nodes.find(n => n.id === token.currentNodeId)
    if (!node) {
      throw new Error(`节点不存在: ${token.currentNodeId}`)
    }

    // 根据节点类型处理
    switch (node.type) {
      case 'start':
        await this.processStartNode(token, node, definition)
        break
      case 'end':
        await this.processEndNode(token, node, definition)
        break
      case 'task':
        await this.processTaskNode(token, node, definition)
        break
      case 'gateway':
        await this.processGatewayNode(token, node, definition)
        break
      case 'subprocess':
        await this.processSubprocessNode(token, node, definition)
        break
      default:
        console.warn(`未知节点类型: ${node.type}`)
    }
  }

  /**
   * 处理开始节点
   */
  private async processStartNode(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    // 开始节点直接流转到下一个节点
    const outgoingEdges = this.getOutgoingEdges(node.id, definition)
    for (const edge of outgoingEdges) {
      await this.moveToken(token, edge.target)
    }
  }

  /**
   * 处理结束节点
   */
  private async processEndNode(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    // 结束节点完成令牌
    await this.stateTracker.completeToken(token.id)
  }

  /**
   * 处理任务节点
   */
  private async processTaskNode(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    // 检查是否已有任务
    const existingTasks = await this.taskManager.getTasksByNode(token.processInstanceId, node.id)
    if (existingTasks.length > 0) {
      return // 任务已存在，等待完成
    }

    // 创建任务
    const task = await this.taskManager.createTask(token.processInstanceId, node)
    
    // 触发任务创建事件
    this.emit('task:created', task)
  }

  /**
   * 处理网关节点
   */
  private async processGatewayNode(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    const gatewayType = node.properties?.gatewayType || 'exclusive'
    
    switch (gatewayType) {
      case 'exclusive':
        await this.processExclusiveGateway(token, node, definition)
        break
      case 'parallel':
        await this.processParallelGateway(token, node, definition)
        break
      case 'inclusive':
        await this.processInclusiveGateway(token, node, definition)
        break
      default:
        throw new Error(`未知网关类型: ${gatewayType}`)
    }
  }

  /**
   * 处理排他网关
   */
  private async processExclusiveGateway(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    const outgoingEdges = this.getOutgoingEdges(node.id, definition)
    
    // 评估条件，选择第一个满足条件的路径
    for (const edge of outgoingEdges) {
      if (await this.evaluateCondition(edge, token)) {
        await this.moveToken(token, edge.target)
        return
      }
    }
    
    // 如果没有满足条件的路径，选择默认路径
    const defaultEdge = outgoingEdges.find(edge => edge.properties?.isDefault)
    if (defaultEdge) {
      await this.moveToken(token, defaultEdge.target)
    } else {
      throw new Error(`排他网关没有可执行的路径: ${node.id}`)
    }
  }

  /**
   * 处理并行网关
   */
  private async processParallelGateway(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    const outgoingEdges = this.getOutgoingEdges(node.id, definition)
    const incomingEdges = this.getIncomingEdges(node.id, definition)
    
    if (outgoingEdges.length > 1) {
      // 分叉：为每个输出路径创建新令牌
      for (const edge of outgoingEdges) {
        const childToken = await this.createChildToken(token, edge.target)
        await this.moveToken(childToken, edge.target)
      }
      // 完成父令牌
      await this.stateTracker.completeToken(token.id)
    } else if (incomingEdges.length > 1) {
      // 汇聚：等待所有输入路径完成
      const siblingTokens = await this.stateTracker.getSiblingTokens(token.id)
      const completedSiblings = siblingTokens.filter(t => t.status === 'completed')
      
      if (completedSiblings.length === incomingEdges.length - 1) {
        // 所有兄弟令牌都已完成，继续执行
        const outgoingEdge = outgoingEdges[0]
        if (outgoingEdge) {
          await this.moveToken(token, outgoingEdge.target)
        }
      } else {
        // 等待其他令牌
        await this.stateTracker.waitToken(token.id)
      }
    }
  }

  /**
   * 处理包容网关
   */
  private async processInclusiveGateway(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    const outgoingEdges = this.getOutgoingEdges(node.id, definition)
    
    // 评估所有条件，执行满足条件的路径
    const validEdges = []
    for (const edge of outgoingEdges) {
      if (await this.evaluateCondition(edge, token)) {
        validEdges.push(edge)
      }
    }
    
    if (validEdges.length === 0) {
      // 如果没有满足条件的路径，选择默认路径
      const defaultEdge = outgoingEdges.find(edge => edge.properties?.isDefault)
      if (defaultEdge) {
        validEdges.push(defaultEdge)
      }
    }
    
    if (validEdges.length === 0) {
      throw new Error(`包容网关没有可执行的路径: ${node.id}`)
    }
    
    // 为每个有效路径创建令牌
    for (const edge of validEdges) {
      if (validEdges.length === 1) {
        await this.moveToken(token, edge.target)
      } else {
        const childToken = await this.createChildToken(token, edge.target)
        await this.moveToken(childToken, edge.target)
      }
    }
    
    if (validEdges.length > 1) {
      await this.stateTracker.completeToken(token.id)
    }
  }

  /**
   * 处理子流程节点
   */
  private async processSubprocessNode(token: Token, node: any, definition: ProcessDefinition): Promise<void> {
    // TODO: 实现子流程处理逻辑
    console.log(`处理子流程节点: ${node.id}`)
  }

  /**
   * 移动令牌
   */
  private async moveToken(token: Token, targetNodeId: string): Promise<void> {
    const oldNodeId = token.currentNodeId
    await this.stateTracker.moveToken(token.id, targetNodeId)
    this.emit('token:moved', token, oldNodeId, targetNodeId)
  }

  /**
   * 创建令牌
   */
  private async createToken(instanceId: string, nodeId: string): Promise<Token> {
    const token = await this.stateTracker.createToken(instanceId, nodeId)
    this.emit('token:created', token)
    return token
  }

  /**
   * 创建子令牌
   */
  private async createChildToken(parentToken: Token, nodeId: string): Promise<Token> {
    const token = await this.stateTracker.createChildToken(parentToken, nodeId)
    this.emit('token:created', token)
    return token
  }

  /**
   * 评估条件
   */
  private async evaluateCondition(edge: any, token: Token): Promise<boolean> {
    if (!edge.properties?.condition) {
      return true // 没有条件，默认为真
    }
    
    const instance = await this.processInstanceManager.getInstance(token.processInstanceId)
    if (!instance) {
      return false
    }
    
    return this.conditionEvaluator.evaluate(edge.properties.condition, {
      variables: instance.variables,
      token: token,
      instance: instance
    })
  }

  /**
   * 获取输出边
   */
  private getOutgoingEdges(nodeId: string, definition: ProcessDefinition): any[] {
    return definition.flowchartData.edges.filter(edge => edge.source === nodeId)
  }

  /**
   * 获取输入边
   */
  private getIncomingEdges(nodeId: string, definition: ProcessDefinition): any[] {
    return definition.flowchartData.edges.filter(edge => edge.target === nodeId)
  }

  /**
   * 检查流程完成
   */
  private async checkProcessCompletion(instanceId: string): Promise<void> {
    const activeTokens = await this.stateTracker.getActiveTokens(instanceId)
    if (activeTokens.length === 0) {
      // 所有令牌都已完成，流程结束
      await this.processInstanceManager.updateInstanceStatus(instanceId, 'completed')
      
      const instance = await this.processInstanceManager.getInstance(instanceId)
      this.emit('process:completed', instance!)
      
      console.log(`流程实例 ${instanceId} 已完成`)
    }
  }

  /**
   * 查找开始节点
   */
  private findStartNodes(definition: ProcessDefinition): any[] {
    return definition.flowchartData.nodes.filter(node => node.type === 'start')
  }

  /**
   * 验证流程定义
   */
  private validateProcessDefinition(definition: ProcessDefinition): void {
    // 检查必需字段
    if (!definition.id || !definition.name || !definition.flowchartData) {
      throw new Error('流程定义缺少必需字段')
    }
    
    // 检查开始节点
    const startNodes = this.findStartNodes(definition)
    if (startNodes.length === 0) {
      throw new Error('流程定义必须包含至少一个开始节点')
    }
    
    // 检查结束节点
    const endNodes = definition.flowchartData.nodes.filter(node => node.type === 'end')
    if (endNodes.length === 0) {
      throw new Error('流程定义必须包含至少一个结束节点')
    }
    
    // TODO: 添加更多验证逻辑
  }

  /**
   * 加载流程定义
   */
  private async loadProcessDefinitions(): Promise<void> {
    const definitions = await this.storage.getProcessDefinitions()
    for (const definition of definitions) {
      this.processDefinitions.set(definition.id, definition)
    }
    console.log(`加载了 ${definitions.length} 个流程定义`)
  }

  /**
   * 恢复运行中的流程实例
   */
  private async recoverRunningInstances(): Promise<void> {
    const runningInstances = await this.processInstanceManager.getRunningInstances()
    for (const instance of runningInstances) {
      try {
        await this.executeProcess(instance.id)
      } catch (error) {
        console.error(`恢复流程实例 ${instance.id} 失败:`, error)
      }
    }
    console.log(`恢复了 ${runningInstances.length} 个运行中的流程实例`)
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听任务完成事件
    this.taskManager.on('task:completed', async (task: Task) => {
      try {
        // 任务完成后继续执行流程
        await this.executeProcess(task.processInstanceId)
      } catch (error) {
        console.error(`任务完成后执行流程失败:`, error)
      }
    })
  }
}
