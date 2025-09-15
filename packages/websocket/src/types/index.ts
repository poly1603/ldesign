/**
 * WebSocket 插件库类型定义
 * 
 * 提供完整的 TypeScript 类型定义，确保类型安全
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * WebSocket 连接状态枚举
 */
export enum WebSocketState {
  /** 连接中 */
  CONNECTING = 'connecting',
  /** 已连接 */
  CONNECTED = 'connected',
  /** 连接中断 */
  DISCONNECTED = 'disconnected',
  /** 重连中 */
  RECONNECTING = 'reconnecting',
  /** 连接关闭 */
  CLOSED = 'closed',
  /** 连接错误 */
  ERROR = 'error'
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  /** 文本消息 */
  TEXT = 'text',
  /** JSON 消息 */
  JSON = 'json',
  /** 二进制消息 */
  BINARY = 'binary',
  /** 心跳消息 */
  HEARTBEAT = 'heartbeat',
  /** 认证消息 */
  AUTH = 'auth'
}

/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 调试信息 */
  DEBUG = 'debug',
  /** 一般信息 */
  INFO = 'info',
  /** 警告信息 */
  WARN = 'warn',
  /** 错误信息 */
  ERROR = 'error',
  /** 静默模式 */
  SILENT = 'silent'
}

/**
 * 重连策略枚举
 */
export enum ReconnectStrategy {
  /** 固定间隔 */
  FIXED = 'fixed',
  /** 线性增长 */
  LINEAR = 'linear',
  /** 指数退避 */
  EXPONENTIAL = 'exponential'
}

/**
 * 认证类型枚举
 */
export enum AuthType {
  /** 无认证 */
  NONE = 'none',
  /** Token 认证 */
  TOKEN = 'token',
  /** 基础认证 */
  BASIC = 'basic',
  /** 自定义认证 */
  CUSTOM = 'custom'
}

/**
 * 消息优先级枚举
 */
export enum MessagePriority {
  /** 低优先级 */
  LOW = 'low',
  /** 普通优先级 */
  NORMAL = 'normal',
  /** 高优先级 */
  HIGH = 'high',
  /** 紧急优先级 */
  URGENT = 'urgent'
}

/**
 * WebSocket 消息接口
 */
export interface WebSocketMessage<T = unknown> {
  /** 消息 ID */
  id: string
  /** 消息类型 */
  type: MessageType
  /** 消息数据 */
  data: T
  /** 时间戳 */
  timestamp: number
  /** 消息优先级 */
  priority?: MessagePriority
  /** 是否需要确认 */
  needsAck?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 最大重试次数 */
  maxRetries?: number
}

/**
 * 重连配置接口
 */
export interface ReconnectConfig {
  /** 是否启用自动重连 */
  enabled: boolean
  /** 重连策略 */
  strategy: ReconnectStrategy
  /** 初始重连间隔（毫秒） */
  initialDelay: number
  /** 最大重连间隔（毫秒） */
  maxDelay: number
  /** 最大重连次数 */
  maxAttempts: number
  /** 指数退避倍数 */
  backoffMultiplier: number
  /** 重连抖动（毫秒） */
  jitter: number
}

/**
 * 心跳配置接口
 */
export interface HeartbeatConfig {
  /** 是否启用心跳 */
  enabled: boolean
  /** 心跳间隔（毫秒） */
  interval: number
  /** 心跳超时时间（毫秒） */
  timeout: number
  /** 心跳消息内容 */
  message: string | object
  /** 心跳消息类型 */
  messageType: MessageType
  /** 最大失败次数 */
  maxFailures: number
}

/**
 * 认证配置接口
 */
export interface AuthConfig {
  /** 认证类型 */
  type: AuthType
  /** Token */
  token?: string
  /** 用户名 */
  username?: string
  /** 密码 */
  password?: string
  /** 自定义认证函数 */
  customAuth?: () => Promise<Record<string, unknown>>
  /** Token 刷新函数 */
  refreshToken?: () => Promise<string>
  /** Token 过期时间（毫秒） */
  tokenExpiry?: number
  /** 是否自动刷新 Token */
  autoRefresh?: boolean
}

/**
 * 消息队列配置接口
 */
export interface MessageQueueConfig {
  /** 是否启用消息队列 */
  enabled: boolean
  /** 队列最大长度 */
  maxSize: number
  /** 是否持久化到本地存储 */
  persistent: boolean
  /** 本地存储键名 */
  storageKey: string
  /** 消息过期时间（毫秒） */
  messageExpiry: number
  /** 是否启用消息去重 */
  deduplication: boolean
}

/**
 * WebSocket 客户端配置接口
 */
export interface WebSocketClientConfig {
  /** WebSocket 服务器 URL */
  url: string
  /** 子协议 */
  protocols?: string | string[]
  /** 连接超时时间（毫秒） */
  connectionTimeout: number
  /** 重连配置 */
  reconnect: ReconnectConfig
  /** 心跳配置 */
  heartbeat: HeartbeatConfig
  /** 认证配置 */
  auth: AuthConfig
  /** 消息队列配置 */
  messageQueue: MessageQueueConfig
  /** 日志级别 */
  logLevel: LogLevel
  /** 是否启用调试模式 */
  debug: boolean
  /** 自定义头部 */
  headers?: Record<string, string>
  /** 是否启用消息压缩 */
  compression?: boolean
  /** 最大消息大小（字节） */
  maxMessageSize?: number
}

/**
 * 事件监听器类型
 */
export type EventListener<T = unknown> = (data: T) => void | Promise<void>

/**
 * WebSocket 事件映射接口
 */
export interface WebSocketEventMap {
  /** 连接打开事件 */
  open: Event
  /** 连接关闭事件 */
  close: CloseEvent
  /** 连接错误事件 */
  error: Event
  /** 接收消息事件 */
  message: WebSocketMessage
  /** 状态变化事件 */
  stateChange: { from: WebSocketState; to: WebSocketState }
  /** 重连开始事件 */
  reconnectStart: { attempt: number; maxAttempts: number }
  /** 重连成功事件 */
  reconnectSuccess: { attempt: number }
  /** 重连失败事件 */
  reconnectFailed: { attempt: number; error: Error }
  /** 心跳发送事件 */
  heartbeatSent: { timestamp: number }
  /** 心跳响应事件 */
  heartbeatReceived: { timestamp: number; latency: number }
  /** 心跳超时事件 */
  heartbeatTimeout: { timestamp: number }
  /** 认证成功事件 */
  authSuccess: { timestamp: number }
  /** 认证失败事件 */
  authFailed: { error: Error }
  /** 消息发送事件 */
  messageSent: WebSocketMessage
  /** 消息接收事件 */
  messageReceived: WebSocketMessage
  /** 消息发送失败事件 */
  messageFailed: { message: WebSocketMessage; error: Error }
}

/**
 * 连接统计信息接口
 */
export interface ConnectionStats {
  /** 连接开始时间 */
  connectedAt: number | null
  /** 总连接时间（毫秒） */
  totalConnectedTime: number
  /** 重连次数 */
  reconnectCount: number
  /** 发送消息数量 */
  messagesSent: number
  /** 接收消息数量 */
  messagesReceived: number
  /** 发送失败消息数量 */
  messagesFailedToSend: number
  /** 平均延迟（毫秒） */
  averageLatency: number
  /** 最后一次心跳时间 */
  lastHeartbeatAt: number | null
  /** 心跳失败次数 */
  heartbeatFailures: number
}

/**
 * 连接池配置接口
 */
export interface ConnectionPoolConfig {
  /** 最大连接数 */
  maxConnections: number
  /** 最小连接数 */
  minConnections: number
  /** 连接空闲超时时间（毫秒） */
  idleTimeout: number
  /** 连接获取超时时间（毫秒） */
  acquireTimeout: number
  /** 是否启用连接验证 */
  validateConnections: boolean
  /** 连接验证间隔（毫秒） */
  validationInterval: number
  /** 连接重用策略 */
  reuseStrategy: ConnectionReuseStrategy
  /** 负载均衡策略 */
  loadBalanceStrategy: LoadBalanceStrategy
  /** 健康检查间隔（毫秒） */
  healthCheckInterval: number
  /** 是否启用连接预热 */
  enableWarmup: boolean
  /** 预热连接数 */
  warmupConnections: number
}

/** 连接重用策略 */
export enum ConnectionReuseStrategy {
  /** 不重用 */
  NONE = 'none',
  /** 按 URL 重用 */
  BY_URL = 'by_url',
  /** 按配置重用 */
  BY_CONFIG = 'by_config',
  /** 智能重用 */
  SMART = 'smart'
}

/** 负载均衡策略 */
export enum LoadBalanceStrategy {
  /** 轮询 */
  ROUND_ROBIN = 'round_robin',
  /** 最少连接 */
  LEAST_CONNECTIONS = 'least_connections',
  /** 随机 */
  RANDOM = 'random',
  /** 加权轮询 */
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin'
}

/** 连接池统计信息 */
export interface PoolStats {
  /** 总连接数 */
  totalConnections: number
  /** 活跃连接数 */
  activeConnections: number
  /** 空闲连接数 */
  idleConnections: number
  /** 连接中的连接数 */
  connectingConnections: number
  /** 失败连接数 */
  failedConnections: number
  /** 连接池命中率 */
  hitRate: number
  /** 平均连接时间 */
  averageConnectionTime: number
  /** 总请求数 */
  totalRequests: number
  /** 成功请求数 */
  successfulRequests: number
}

/** 连接池事件映射 */
export interface ConnectionPoolEventMap {
  /** 连接创建事件 */
  connectionCreated: { connectionId: string; url: string }
  /** 连接销毁事件 */
  connectionDestroyed: { connectionId: string; reason: string }
  /** 连接重用事件 */
  connectionReused: { connectionId: string; url: string }
  /** 连接池满事件 */
  poolFull: { maxConnections: number }
  /** 健康检查事件 */
  healthCheck: { healthy: number; unhealthy: number }
  /** 连接超时事件 */
  connectionTimeout: { connectionId: string; timeout: number }
}

/**
 * 导出所有类型
 */
export * from './events'
export * from './utils'
