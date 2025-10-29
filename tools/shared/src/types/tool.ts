/**
 * 工具相关类型定义
 */

/**
 * 工具名称枚举
 */
export type ToolName =
  | 'builder'
  | 'launcher'
  | 'tester'
  | 'analyzer'
  | 'deployer'
  | 'docs-generator'
  | 'generator'
  | 'git'
  | 'monitor'
  | 'security'
  | 'deps'

/**
 * 工具状态
 */
export type ToolStatus = 'inactive' | 'initializing' | 'active' | 'error' | 'busy'

/**
 * 工具配置
 */
export interface ToolConfig {
  enabled: boolean
  options?: Record<string, any>
  [key: string]: any
}

/**
 * 工具元数据
 */
export interface ToolMetadata {
  name: ToolName
  displayName: string
  version?: string
  description?: string
  icon?: string
  category?: string
}

/**
 * 工具执行结果
 */
export interface ToolExecutionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  logs?: string[]
  duration?: number
  timestamp: number
}

/**
 * 工具适配器接口
 */
export interface IToolAdapter {
  /**
   * 工具名称
   */
  readonly name: ToolName

  /**
   * 工具元数据
   */
  readonly metadata: ToolMetadata

  /**
   * 初始化工具
   */
  initialize(): Promise<void>

  /**
   * 执行工具操作
   */
  execute(action: string, params: any): Promise<ToolExecutionResult>

  /**
   * 获取工具状态
   */
  getStatus(): ToolStatus

  /**
   * 健康检查
   */
  healthCheck(): Promise<boolean>

  /**
   * 释放资源
   */
  dispose(): Promise<void>

  /**
   * 获取工具配置
   */
  getConfig(): ToolConfig

  /**
   * 更新工具配置
   */
  updateConfig(config: Partial<ToolConfig>): Promise<void>
}

/**
 * 工具进度事件
 */
export interface ToolProgressEvent {
  tool: ToolName
  action: string
  progress: number
  message?: string
  timestamp: number
}

/**
 * 工具日志事件
 */
export interface ToolLogEvent {
  tool: ToolName
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: number
  metadata?: Record<string, any>
}

/**
 * 工具状态变更事件
 */
export interface ToolStatusChangeEvent {
  tool: ToolName
  oldStatus: ToolStatus
  newStatus: ToolStatus
  timestamp: number
}


