/**
 * 协作功能类型定义
 */

import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 用户角色
 */
export type UserRole = 'owner' | 'editor' | 'viewer' | 'commenter'

/**
 * 用户信息
 */
export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
  role: UserRole
  isOnline: boolean
  lastSeen: number
}

/**
 * 协作配置
 */
export interface CollaborationConfig {
  serverUrl: string
  sessionId: string
  user: User
  permissions: CollaborationPermissions
  autoSave: boolean
  conflictResolution: 'manual' | 'auto' | 'last-write-wins'
  presenceTimeout: number // 用户离线超时时间（毫秒）
}

/**
 * 协作权限
 */
export interface CollaborationPermissions {
  canEdit: boolean
  canDelete: boolean
  canInvite: boolean
  canManagePermissions: boolean
  canExport: boolean
  canComment: boolean
}

/**
 * 操作类型
 */
export type OperationType = 
  | 'node:add' 
  | 'node:update' 
  | 'node:delete' 
  | 'node:move'
  | 'edge:add' 
  | 'edge:update' 
  | 'edge:delete'
  | 'canvas:update'
  | 'selection:change'
  | 'cursor:move'

/**
 * 协作操作
 */
export interface Operation {
  id: string
  type: OperationType
  target: 'node' | 'edge' | 'canvas' | 'selection' | 'cursor'
  targetId?: string
  data: any
  userId: string
  timestamp: number
  sessionId: string
  version: number
}

/**
 * 操作结果
 */
export interface OperationResult {
  success: boolean
  operation: Operation
  conflicts?: Conflict[]
  error?: string
}

/**
 * 冲突信息
 */
export interface Conflict {
  id: string
  type: 'concurrent_edit' | 'delete_modified' | 'move_conflict'
  operation1: Operation
  operation2: Operation
  resolution?: ConflictResolution
}

/**
 * 冲突解决方案
 */
export interface ConflictResolution {
  strategy: 'accept_local' | 'accept_remote' | 'merge' | 'manual'
  resolvedOperation?: Operation
  resolvedBy: string
  resolvedAt: number
}

/**
 * 协作消息类型
 */
export type CollaborationMessageType = 
  | 'operation'
  | 'presence'
  | 'cursor'
  | 'selection'
  | 'user_join'
  | 'user_leave'
  | 'conflict'
  | 'sync_request'
  | 'sync_response'
  | 'error'

/**
 * 协作消息
 */
export interface CollaborationMessage {
  id: string
  type: CollaborationMessageType
  sessionId: string
  userId: string
  timestamp: number
  data: any
}

/**
 * 用户状态
 */
export interface UserPresence {
  user: User
  cursor?: {
    x: number
    y: number
    visible: boolean
  }
  selection?: {
    nodeIds: string[]
    edgeIds: string[]
  }
  viewport?: {
    x: number
    y: number
    scale: number
  }
  activity: 'active' | 'idle' | 'away'
  lastActivity: number
}

/**
 * 协作会话信息
 */
export interface CollaborationSession {
  id: string
  name: string
  description?: string
  createdBy: User
  createdAt: number
  updatedAt: number
  users: User[]
  permissions: Record<string, CollaborationPermissions>
  isActive: boolean
  flowchartData: FlowchartData
  version: number
}

/**
 * 同步状态
 */
export interface SyncState {
  isConnected: boolean
  isSyncing: boolean
  lastSyncTime: number
  pendingOperations: Operation[]
  conflictCount: number
  version: number
}

/**
 * 协作事件
 */
export interface CollaborationEvents {
  'user:join': (user: User) => void
  'user:leave': (user: User) => void
  'user:presence': (presence: UserPresence) => void
  'operation:received': (operation: Operation) => void
  'operation:applied': (operation: Operation) => void
  'conflict:detected': (conflict: Conflict) => void
  'conflict:resolved': (conflict: Conflict, resolution: ConflictResolution) => void
  'sync:started': () => void
  'sync:completed': () => void
  'sync:failed': (error: Error) => void
  'connection:established': () => void
  'connection:lost': () => void
  'connection:restored': () => void
  'error': (error: CollaborationError) => void
}

/**
 * 协作错误
 */
export interface CollaborationError {
  code: string
  message: string
  details?: any
  timestamp: number
  userId?: string
  operation?: Operation
}

/**
 * 操作变换函数类型
 */
export type OperationTransform = (op1: Operation, op2: Operation) => Operation[]

/**
 * 冲突解决器接口
 */
export interface ConflictResolver {
  detectConflict(op1: Operation, op2: Operation): Conflict | null
  resolveConflict(conflict: Conflict, strategy: ConflictResolution['strategy']): ConflictResolution
  canAutoResolve(conflict: Conflict): boolean
}

/**
 * 实时同步接口
 */
export interface RealTimeSync {
  connect(config: CollaborationConfig): Promise<void>
  disconnect(): Promise<void>
  sendOperation(operation: Operation): Promise<void>
  onMessage(callback: (message: CollaborationMessage) => void): void
  getConnectionState(): 'connected' | 'connecting' | 'disconnected' | 'error'
}

/**
 * 用户状态管理接口
 */
export interface UserPresenceManager {
  updatePresence(presence: Partial<UserPresence>): void
  getUserPresence(userId: string): UserPresence | null
  getAllPresences(): UserPresence[]
  startTracking(): void
  stopTracking(): void
}

/**
 * 协作管理器接口
 */
export interface CollaborationManagerInterface {
  enableCollaboration(config: CollaborationConfig): Promise<void>
  disableCollaboration(): Promise<void>
  joinSession(sessionId: string, user: User): Promise<void>
  leaveSession(): Promise<void>
  sendOperation(operation: Operation): Promise<OperationResult>
  handleOperation(operation: Operation): Promise<OperationResult>
  getSession(): CollaborationSession | null
  getSyncState(): SyncState
  getUsers(): User[]
  getUserPresence(userId: string): UserPresence | null
  resolveConflict(conflict: Conflict, resolution: ConflictResolution): Promise<void>
  on<K extends keyof CollaborationEvents>(event: K, listener: CollaborationEvents[K]): void
  off<K extends keyof CollaborationEvents>(event: K, listener: CollaborationEvents[K]): void
}

/**
 * 操作历史记录
 */
export interface OperationHistory {
  operations: Operation[]
  version: number
  lastSyncVersion: number
}

/**
 * 协作统计信息
 */
export interface CollaborationStats {
  totalOperations: number
  operationsByType: Record<OperationType, number>
  operationsByUser: Record<string, number>
  conflictsDetected: number
  conflictsResolved: number
  averageResponseTime: number
  connectionUptime: number
}
