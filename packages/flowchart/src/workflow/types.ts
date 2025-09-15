/**
 * 工作流执行引擎类型定义
 */

import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 流程定义
 */
export interface ProcessDefinition {
  /** 流程ID */
  id: string
  /** 流程名称 */
  name: string
  /** 流程版本 */
  version: string
  /** 流程描述 */
  description?: string
  /** 流程图数据 */
  flowchartData: FlowchartData
  /** 流程配置 */
  config: ProcessConfig
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  createdBy: string
  /** 是否启用 */
  enabled: boolean
  /** 流程变量定义 */
  variables: ProcessVariable[]
  /** 流程表单定义 */
  forms: ProcessForm[]
}

/**
 * 流程配置
 */
export interface ProcessConfig {
  /** 是否允许并行执行 */
  allowParallel: boolean
  /** 超时时间（毫秒） */
  timeout?: number
  /** 优先级 */
  priority: ProcessPriority
  /** 通知配置 */
  notifications: NotificationConfig
  /** 审计配置 */
  audit: AuditConfig
}

/**
 * 流程优先级
 */
export type ProcessPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * 通知配置
 */
export interface NotificationConfig {
  /** 是否启用邮件通知 */
  enableEmail: boolean
  /** 是否启用短信通知 */
  enableSMS: boolean
  /** 是否启用应用内通知 */
  enableInApp: boolean
  /** 通知模板 */
  templates: Record<string, string>
}

/**
 * 审计配置
 */
export interface AuditConfig {
  /** 是否启用审计 */
  enabled: boolean
  /** 审计级别 */
  level: 'basic' | 'detailed' | 'full'
  /** 保留时间（天） */
  retentionDays: number
}

/**
 * 流程变量
 */
export interface ProcessVariable {
  /** 变量名 */
  name: string
  /** 变量类型 */
  type: VariableType
  /** 默认值 */
  defaultValue?: any
  /** 是否必需 */
  required: boolean
  /** 变量描述 */
  description?: string
  /** 验证规则 */
  validation?: ValidationRule[]
}

/**
 * 变量类型
 */
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  /** 规则值 */
  value?: any
  /** 错误消息 */
  message: string
}

/**
 * 流程表单
 */
export interface ProcessForm {
  /** 表单ID */
  id: string
  /** 表单名称 */
  name: string
  /** 表单字段 */
  fields: FormField[]
  /** 表单布局 */
  layout?: FormLayout
}

/**
 * 表单字段
 */
export interface FormField {
  /** 字段名 */
  name: string
  /** 字段类型 */
  type: FieldType
  /** 字段标签 */
  label: string
  /** 是否必需 */
  required: boolean
  /** 默认值 */
  defaultValue?: any
  /** 字段选项 */
  options?: FieldOption[]
  /** 验证规则 */
  validation?: ValidationRule[]
}

/**
 * 字段类型
 */
export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file'

/**
 * 字段选项
 */
export interface FieldOption {
  /** 选项值 */
  value: any
  /** 选项标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 表单布局
 */
export interface FormLayout {
  /** 列数 */
  columns: number
  /** 字段布局 */
  fieldLayout: Record<string, FieldLayout>
}

/**
 * 字段布局
 */
export interface FieldLayout {
  /** 列跨度 */
  colSpan: number
  /** 行跨度 */
  rowSpan: number
  /** 排序 */
  order: number
}

/**
 * 流程实例
 */
export interface ProcessInstance {
  /** 实例ID */
  id: string
  /** 流程定义ID */
  processDefinitionId: string
  /** 实例名称 */
  name: string
  /** 实例状态 */
  status: ProcessStatus
  /** 启动时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 启动者 */
  startedBy: string
  /** 当前节点 */
  currentNodes: string[]
  /** 流程变量 */
  variables: Record<string, any>
  /** 业务键 */
  businessKey?: string
  /** 父实例ID */
  parentInstanceId?: string
  /** 子实例ID列表 */
  childInstanceIds: string[]
  /** 实例数据 */
  data: Record<string, any>
}

/**
 * 流程状态
 */
export type ProcessStatus = 'running' | 'completed' | 'terminated' | 'suspended' | 'error'

/**
 * 任务
 */
export interface Task {
  /** 任务ID */
  id: string
  /** 流程实例ID */
  processInstanceId: string
  /** 节点ID */
  nodeId: string
  /** 任务名称 */
  name: string
  /** 任务类型 */
  type: TaskType
  /** 任务状态 */
  status: TaskStatus
  /** 分配给 */
  assignee?: string
  /** 候选人 */
  candidates: string[]
  /** 候选组 */
  candidateGroups: string[]
  /** 创建时间 */
  createTime: number
  /** 到期时间 */
  dueTime?: number
  /** 完成时间 */
  completeTime?: number
  /** 任务数据 */
  data: Record<string, any>
  /** 表单数据 */
  formData?: Record<string, any>
  /** 优先级 */
  priority: TaskPriority
}

/**
 * 任务类型
 */
export type TaskType = 'user' | 'service' | 'script' | 'manual' | 'receive' | 'send'

/**
 * 任务状态
 */
export type TaskStatus = 'created' | 'assigned' | 'started' | 'completed' | 'cancelled' | 'error'

/**
 * 任务优先级
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * 任务结果
 */
export interface TaskResult {
  /** 任务ID */
  taskId: string
  /** 执行结果 */
  result: 'approve' | 'reject' | 'complete' | 'delegate' | 'cancel'
  /** 结果数据 */
  data?: Record<string, any>
  /** 表单数据 */
  formData?: Record<string, any>
  /** 备注 */
  comment?: string
  /** 执行者 */
  executor: string
  /** 执行时间 */
  executeTime: number
}

/**
 * 活动实例
 */
export interface ActivityInstance {
  /** 活动ID */
  id: string
  /** 流程实例ID */
  processInstanceId: string
  /** 节点ID */
  nodeId: string
  /** 活动名称 */
  name: string
  /** 活动类型 */
  type: ActivityType
  /** 活动状态 */
  status: ActivityStatus
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 执行者 */
  executor?: string
  /** 活动数据 */
  data: Record<string, any>
}

/**
 * 活动类型
 */
export type ActivityType = 'start' | 'end' | 'gateway' | 'task' | 'subprocess' | 'event'

/**
 * 活动状态
 */
export type ActivityStatus = 'waiting' | 'active' | 'completed' | 'skipped' | 'error'

/**
 * 令牌
 */
export interface Token {
  /** 令牌ID */
  id: string
  /** 流程实例ID */
  processInstanceId: string
  /** 当前节点ID */
  currentNodeId: string
  /** 令牌状态 */
  status: TokenStatus
  /** 创建时间 */
  createTime: number
  /** 令牌数据 */
  data: Record<string, any>
  /** 父令牌ID */
  parentTokenId?: string
  /** 子令牌ID列表 */
  childTokenIds: string[]
}

/**
 * 令牌状态
 */
export type TokenStatus = 'active' | 'waiting' | 'completed' | 'terminated'

/**
 * 转换
 */
export interface Transition {
  /** 转换ID */
  id: string
  /** 源节点ID */
  sourceNodeId: string
  /** 目标节点ID */
  targetNodeId: string
  /** 转换名称 */
  name?: string
  /** 转换条件 */
  condition?: string
  /** 转换类型 */
  type: TransitionType
  /** 转换数据 */
  data: Record<string, any>
}

/**
 * 转换类型
 */
export type TransitionType = 'sequence' | 'conditional' | 'default' | 'exception'

/**
 * 条件表达式
 */
export interface ConditionExpression {
  /** 表达式 */
  expression: string
  /** 表达式类型 */
  type: ExpressionType
  /** 表达式语言 */
  language?: string
}

/**
 * 表达式类型
 */
export type ExpressionType = 'javascript' | 'groovy' | 'juel' | 'custom'

/**
 * 流程上下文
 */
export interface ProcessContext {
  /** 流程实例 */
  processInstance: ProcessInstance
  /** 当前任务 */
  currentTask?: Task
  /** 流程变量 */
  variables: Record<string, any>
  /** 用户信息 */
  user: ProcessUser
  /** 组织信息 */
  organization: ProcessOrganization
  /** 业务数据 */
  businessData: Record<string, any>
}

/**
 * 流程用户
 */
export interface ProcessUser {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 显示名称 */
  displayName: string
  /** 邮箱 */
  email: string
  /** 角色 */
  roles: string[]
  /** 组织 */
  organizations: string[]
}

/**
 * 流程组织
 */
export interface ProcessOrganization {
  /** 组织ID */
  id: string
  /** 组织名称 */
  name: string
  /** 父组织ID */
  parentId?: string
  /** 组织类型 */
  type: string
  /** 组织层级 */
  level: number
}

/**
 * 工作流引擎接口
 */
export interface WorkflowEngine {
  /** 部署流程定义 */
  deployProcess(definition: ProcessDefinition): Promise<void>
  
  /** 启动流程实例 */
  startProcess(processDefinitionId: string, context: ProcessContext): Promise<ProcessInstance>
  
  /** 执行任务 */
  executeTask(taskId: string, result: TaskResult): Promise<void>
  
  /** 获取流程实例 */
  getProcessInstance(instanceId: string): Promise<ProcessInstance | null>
  
  /** 获取任务列表 */
  getTasks(query: TaskQuery): Promise<Task[]>
  
  /** 暂停流程实例 */
  suspendProcess(instanceId: string): Promise<void>
  
  /** 恢复流程实例 */
  resumeProcess(instanceId: string): Promise<void>
  
  /** 终止流程实例 */
  terminateProcess(instanceId: string, reason?: string): Promise<void>
}

/**
 * 任务查询
 */
export interface TaskQuery {
  /** 流程实例ID */
  processInstanceId?: string
  /** 分配给 */
  assignee?: string
  /** 候选人 */
  candidate?: string
  /** 候选组 */
  candidateGroup?: string
  /** 任务状态 */
  status?: TaskStatus
  /** 创建时间范围 */
  createTimeRange?: [number, number]
  /** 到期时间范围 */
  dueTimeRange?: [number, number]
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
 * 工作流事件
 */
export interface WorkflowEvents {
  'process:started': (instance: ProcessInstance) => void
  'process:completed': (instance: ProcessInstance) => void
  'process:terminated': (instance: ProcessInstance) => void
  'process:suspended': (instance: ProcessInstance) => void
  'process:resumed': (instance: ProcessInstance) => void
  'task:created': (task: Task) => void
  'task:assigned': (task: Task) => void
  'task:completed': (task: Task, result: TaskResult) => void
  'task:cancelled': (task: Task) => void
  'activity:started': (activity: ActivityInstance) => void
  'activity:completed': (activity: ActivityInstance) => void
  'token:created': (token: Token) => void
  'token:moved': (token: Token, fromNode: string, toNode: string) => void
  'token:completed': (token: Token) => void
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  /** 是否启用工作流 */
  enabled: boolean
  /** 默认超时时间 */
  defaultTimeout: number
  /** 最大并发实例数 */
  maxConcurrentInstances: number
  /** 任务分配策略 */
  taskAssignmentStrategy: 'round_robin' | 'least_loaded' | 'random' | 'custom'
  /** 是否启用审计 */
  enableAudit: boolean
  /** 存储配置 */
  storage: WorkflowStorageConfig
}

/**
 * 工作流存储配置
 */
export interface WorkflowStorageConfig {
  /** 存储类型 */
  type: 'memory' | 'database' | 'file'
  /** 连接配置 */
  connection?: Record<string, any>
  /** 表前缀 */
  tablePrefix?: string
}

/**
 * 工作流统计
 */
export interface WorkflowStats {
  /** 总流程定义数 */
  totalProcessDefinitions: number
  /** 活跃流程实例数 */
  activeProcessInstances: number
  /** 已完成流程实例数 */
  completedProcessInstances: number
  /** 待处理任务数 */
  pendingTasks: number
  /** 已完成任务数 */
  completedTasks: number
  /** 平均处理时间 */
  averageProcessingTime: number
  /** 最后更新时间 */
  lastUpdateTime: number
}
