/**
 * 服务器相关类型定义
 */

/**
 * 项目实体
 */
export interface Project {
  id: string
  name: string
  path: string
  description?: string
  type?: string
  framework?: string
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
  nodeVersion?: string
  createdAt: Date
  updatedAt: Date
  lastOpenedAt?: Date
}

/**
 * Node 版本信息
 */
export interface NodeVersion {
  version: string
  isInstalled: boolean
  isCurrent: boolean
  path?: string
}

/**
 * Git 状态
 */
export interface GitStatus {
  isInstalled: boolean
  version?: string
  path?: string
  globalUser?: string
  globalEmail?: string
}

/**
 * 系统信息
 */
export interface SystemInfo {
  platform: string
  arch: string
  nodeVersion: string
  npmVersion: string
  hostname: string
  cpus: number
  totalMemory: number
  freeMemory: number
  homeDir: string
  tempDir: string
}

/**
 * 日志条目
 */
export interface LogEntry {
  timestamp: Date
  level: 'error' | 'warn' | 'log' | 'debug' | 'verbose'
  message: string
  context?: string
  trace?: string
}

/**
 * 日志统计
 */
export interface LogStats {
  total: number
  errors: number
  warnings: number
  logs: number
  debug: number
  verbose: number
}

/**
 * API 响应包装器
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * WebSocket 事件类型
 */
export enum WebSocketEvent {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  
  // 项目相关事件
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_DELETED = 'project:deleted',
  
  // Node 相关事件
  NODE_INSTALLING = 'node:installing',
  NODE_INSTALLED = 'node:installed',
  NODE_SWITCHING = 'node:switching',
  NODE_SWITCHED = 'node:switched',
  
  // 日志事件
  LOG_ADDED = 'log:added',
}

/**
 * WebSocket 消息
 */
export interface WebSocketMessage<T = any> {
  event: WebSocketEvent | string
  data: T
  timestamp?: number
}
