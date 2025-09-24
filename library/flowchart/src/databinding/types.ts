/**
 * 数据绑定系统类型定义
 */

import type { FlowchartNode } from '../types'

/**
 * 数据源类型
 */
export type DataSourceType = 'rest' | 'websocket' | 'static' | 'database' | 'graphql' | 'custom'

/**
 * 数据源状态
 */
export type DataSourceStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'

/**
 * 数据源配置
 */
export interface DataSourceConfig {
  /** 数据源ID */
  id: string
  /** 数据源名称 */
  name: string
  /** 数据源类型 */
  type: DataSourceType
  /** 数据源URL */
  url?: string
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求体 */
  body?: any
  /** 查询参数 */
  params?: Record<string, any>
  /** 认证信息 */
  auth?: AuthConfig
  /** 轮询间隔（毫秒） */
  pollInterval?: number
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存过期时间（毫秒） */
  cacheExpiry?: number
  /** 重试配置 */
  retry?: RetryConfig
  /** 超时时间（毫秒） */
  timeout?: number
  /** 静态数据（当type为static时） */
  staticData?: any
  /** 自定义配置 */
  customConfig?: Record<string, any>
}

/**
 * 认证配置
 */
export interface AuthConfig {
  /** 认证类型 */
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth'
  /** 用户名 */
  username?: string
  /** 密码 */
  password?: string
  /** Token */
  token?: string
  /** API Key */
  apiKey?: string
  /** API Key 头部名称 */
  apiKeyHeader?: string
  /** OAuth配置 */
  oauth?: OAuthConfig
}

/**
 * OAuth配置
 */
export interface OAuthConfig {
  /** 客户端ID */
  clientId: string
  /** 客户端密钥 */
  clientSecret: string
  /** 授权URL */
  authUrl: string
  /** Token URL */
  tokenUrl: string
  /** 作用域 */
  scope?: string[]
}

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 */
  maxRetries: number
  /** 重试延迟（毫秒） */
  retryDelay: number
  /** 指数退避 */
  exponentialBackoff?: boolean
}

/**
 * 数据源实例
 */
export interface DataSource {
  /** 配置 */
  config: DataSourceConfig
  /** 状态 */
  status: DataSourceStatus
  /** 最后更新时间 */
  lastUpdated?: number
  /** 错误信息 */
  error?: string
  /** 数据 */
  data?: any
  /** 连接实例 */
  connection?: any
}

/**
 * 数据绑定配置
 */
export interface DataBinding {
  /** 绑定ID */
  id: string
  /** 节点ID */
  nodeId: string
  /** 数据源ID */
  dataSourceId: string
  /** 绑定表达式 */
  expression: string
  /** 目标属性 */
  targetProperty: string
  /** 数据转换器 */
  transformer?: DataTransformer
  /** 数据验证器 */
  validator?: DataValidator
  /** 条件表达式 */
  condition?: string
  /** 默认值 */
  defaultValue?: any
  /** 是否启用 */
  enabled: boolean
  /** 更新频率限制（毫秒） */
  throttle?: number
  /** 错误处理策略 */
  errorStrategy?: ErrorStrategy
}

/**
 * 数据转换器
 */
export interface DataTransformer {
  /** 转换器ID */
  id: string
  /** 转换器名称 */
  name: string
  /** 转换函数 */
  transform: (value: any, context?: TransformContext) => any
  /** 参数配置 */
  params?: Record<string, any>
}

/**
 * 转换上下文
 */
export interface TransformContext {
  /** 节点数据 */
  node: FlowchartNode
  /** 原始数据 */
  sourceData: any
  /** 绑定配置 */
  binding: DataBinding
  /** 其他上下文数据 */
  context?: Record<string, any>
}

/**
 * 数据验证器
 */
export interface DataValidator {
  /** 验证器ID */
  id: string
  /** 验证器名称 */
  name: string
  /** 验证函数 */
  validate: (value: any, context?: ValidationContext) => ValidationResult
  /** 参数配置 */
  params?: Record<string, any>
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  /** 节点数据 */
  node: FlowchartNode
  /** 绑定配置 */
  binding: DataBinding
  /** 其他上下文数据 */
  context?: Record<string, any>
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息 */
  errors?: string[]
  /** 警告消息 */
  warnings?: string[]
}

/**
 * 错误处理策略
 */
export type ErrorStrategy = 'ignore' | 'default' | 'retry' | 'fallback' | 'notify'

/**
 * 绑定表达式解析结果
 */
export interface ExpressionResult {
  /** 解析后的值 */
  value: any
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 依赖的数据路径 */
  dependencies?: string[]
}

/**
 * 数据更新事件
 */
export interface DataUpdateEvent {
  /** 数据源ID */
  dataSourceId: string
  /** 更新的数据 */
  data: any
  /** 更新时间 */
  timestamp: number
  /** 变更类型 */
  changeType: 'create' | 'update' | 'delete' | 'refresh'
  /** 变更路径 */
  changePath?: string
}

/**
 * 绑定更新事件
 */
export interface BindingUpdateEvent {
  /** 绑定ID */
  bindingId: string
  /** 节点ID */
  nodeId: string
  /** 目标属性 */
  targetProperty: string
  /** 旧值 */
  oldValue: any
  /** 新值 */
  newValue: any
  /** 更新时间 */
  timestamp: number
}

/**
 * 数据源适配器接口
 */
export interface DataSourceAdapter {
  /** 适配器类型 */
  type: DataSourceType
  
  /** 连接数据源 */
  connect(config: DataSourceConfig): Promise<void>
  
  /** 断开连接 */
  disconnect(): Promise<void>
  
  /** 获取数据 */
  fetchData(): Promise<any>
  
  /** 订阅数据变化 */
  subscribe(callback: (data: any) => void): void
  
  /** 取消订阅 */
  unsubscribe(): void
  
  /** 获取状态 */
  getStatus(): DataSourceStatus
  
  /** 测试连接 */
  testConnection(): Promise<boolean>
}

/**
 * 数据绑定管理器接口
 */
export interface DataBindingManager {
  /** 添加数据源 */
  addDataSource(config: DataSourceConfig): Promise<DataSource>
  
  /** 移除数据源 */
  removeDataSource(id: string): Promise<void>
  
  /** 获取数据源 */
  getDataSource(id: string): DataSource | null
  
  /** 获取所有数据源 */
  getDataSources(): DataSource[]
  
  /** 添加数据绑定 */
  addBinding(binding: DataBinding): Promise<void>
  
  /** 移除数据绑定 */
  removeBinding(id: string): Promise<void>
  
  /** 获取数据绑定 */
  getBinding(id: string): DataBinding | null
  
  /** 获取节点的所有绑定 */
  getNodeBindings(nodeId: string): DataBinding[]
  
  /** 更新绑定数据 */
  updateBinding(bindingId: string): Promise<void>
  
  /** 刷新所有绑定 */
  refreshAllBindings(): Promise<void>
  
  /** 启用/禁用绑定 */
  toggleBinding(bindingId: string, enabled: boolean): Promise<void>
}

/**
 * 绑定解析器接口
 */
export interface BindingResolver {
  /** 解析表达式 */
  resolveExpression(expression: string, data: any, context?: any): ExpressionResult
  
  /** 验证表达式语法 */
  validateExpression(expression: string): boolean
  
  /** 获取表达式依赖 */
  getExpressionDependencies(expression: string): string[]
  
  /** 编译表达式 */
  compileExpression(expression: string): CompiledExpression
}

/**
 * 编译后的表达式
 */
export interface CompiledExpression {
  /** 原始表达式 */
  source: string
  /** 执行函数 */
  execute: (data: any, context?: any) => any
  /** 依赖路径 */
  dependencies: string[]
  /** 是否有效 */
  valid: boolean
}

/**
 * 数据绑定配置
 */
export interface DataBindingConfig {
  /** 是否启用数据绑定 */
  enabled: boolean
  /** 默认轮询间隔 */
  defaultPollInterval: number
  /** 默认缓存过期时间 */
  defaultCacheExpiry: number
  /** 最大并发连接数 */
  maxConcurrentConnections: number
  /** 默认超时时间 */
  defaultTimeout: number
  /** 是否启用调试模式 */
  debugMode: boolean
  /** 内置转换器 */
  builtinTransformers: DataTransformer[]
  /** 内置验证器 */
  builtinValidators: DataValidator[]
}

/**
 * 数据绑定事件
 */
export interface DataBindingEvents {
  'datasource:connected': (dataSource: DataSource) => void
  'datasource:disconnected': (dataSource: DataSource) => void
  'datasource:error': (dataSource: DataSource, error: Error) => void
  'datasource:data-updated': (event: DataUpdateEvent) => void
  'binding:created': (binding: DataBinding) => void
  'binding:updated': (event: BindingUpdateEvent) => void
  'binding:removed': (bindingId: string) => void
  'binding:error': (binding: DataBinding, error: Error) => void
}

/**
 * 数据源统计信息
 */
export interface DataSourceStats {
  /** 总数据源数量 */
  totalDataSources: number
  /** 已连接数据源数量 */
  connectedDataSources: number
  /** 错误数据源数量 */
  errorDataSources: number
  /** 总绑定数量 */
  totalBindings: number
  /** 活跃绑定数量 */
  activeBindings: number
  /** 数据更新次数 */
  dataUpdates: number
  /** 最后更新时间 */
  lastUpdateTime: number
}

/**
 * 数据缓存项
 */
export interface CacheItem {
  /** 数据 */
  data: any
  /** 创建时间 */
  createdAt: number
  /** 过期时间 */
  expiresAt: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessedAt: number
}

/**
 * 数据缓存接口
 */
export interface DataCache {
  /** 获取缓存数据 */
  get(key: string): CacheItem | null
  
  /** 设置缓存数据 */
  set(key: string, data: any, expiry?: number): void
  
  /** 删除缓存数据 */
  delete(key: string): void
  
  /** 清空缓存 */
  clear(): void
  
  /** 获取缓存统计 */
  getStats(): {
    size: number
    hitRate: number
    missRate: number
  }
}
