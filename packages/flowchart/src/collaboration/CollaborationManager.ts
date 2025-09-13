/**
 * 协作管理器
 * 实现多用户协作的基础架构，包括事件同步、冲突解决机制
 */

import { EventEmitter } from 'events'

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: { x: number, y: number }
  selection?: string[] // 选中的元素ID
}

export interface CollaborationOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'move'
  target: 'node' | 'edge'
  targetId: string
  userId: string
  timestamp: number
  data: any
  version: number
}

export interface CollaborationConflict {
  id: string
  operations: CollaborationOperation[]
  type: 'concurrent_edit' | 'version_mismatch' | 'permission_denied'
  resolution?: 'merge' | 'reject' | 'manual'
}

export interface CollaborationConfig {
  /** 用户ID */
  userId: string
  /** 用户信息 */
  user: Omit<CollaborationUser, 'id'>
  /** 房间ID */
  roomId: string
  /** WebSocket服务器地址 */
  serverUrl?: string
  /** 启用实时同步 */
  enableRealTimeSync: boolean
  /** 启用光标共享 */
  enableCursorSharing: boolean
  /** 启用选择共享 */
  enableSelectionSharing: boolean
  /** 冲突解决策略 */
  conflictResolution: 'auto_merge' | 'manual' | 'last_writer_wins'
  /** 操作节流间隔 */
  operationThrottleInterval: number
}

/**
 * 协作管理器
 */
export class CollaborationManager extends EventEmitter {
  private config: CollaborationConfig
  private users: Map<string, CollaborationUser> = new Map()
  private operations: CollaborationOperation[] = []
  private conflicts: CollaborationConflict[] = []
  private version: number = 0
  private isConnected: boolean = false
  private websocket?: WebSocket
  private operationQueue: CollaborationOperation[] = []
  private lastSentOperation?: CollaborationOperation

  // 节流函数
  private throttledSendOperation: (operation: CollaborationOperation) => void

  constructor(config: Partial<CollaborationConfig> & { userId: string, user: Omit<CollaborationUser, 'id'>, roomId: string }) {
    super()
    
    this.config = {
      enableRealTimeSync: true,
      enableCursorSharing: true,
      enableSelectionSharing: true,
      conflictResolution: 'auto_merge',
      operationThrottleInterval: 100,
      ...config
    }

    // 创建节流函数
    this.throttledSendOperation = this.throttle(
      this.sendOperationToServer.bind(this),
      this.config.operationThrottleInterval
    )

    // 添加当前用户
    this.users.set(this.config.userId, {
      id: this.config.userId,
      ...this.config.user
    })
  }

  /**
   * 连接到协作服务器
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    if (this.config.serverUrl) {
      // 连接到WebSocket服务器
      await this.connectWebSocket()
    } else {
      // 模拟连接（用于测试或本地模式）
      this.isConnected = true
      this.emit('connected')
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = undefined
    }
    
    this.isConnected = false
    this.emit('disconnected')
  }

  /**
   * 添加用户
   */
  addUser(user: CollaborationUser): void {
    this.users.set(user.id, user)
    this.emit('user:joined', user)
  }

  /**
   * 移除用户
   */
  removeUser(userId: string): void {
    const user = this.users.get(userId)
    if (user) {
      this.users.delete(userId)
      this.emit('user:left', user)
    }
  }

  /**
   * 获取所有用户
   */
  getUsers(): CollaborationUser[] {
    return Array.from(this.users.values())
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): CollaborationUser {
    return this.users.get(this.config.userId)!
  }

  /**
   * 更新用户光标位置
   */
  updateUserCursor(cursor: { x: number, y: number }): void {
    const user = this.users.get(this.config.userId)
    if (user) {
      user.cursor = cursor
      this.users.set(this.config.userId, user)
      
      if (this.config.enableCursorSharing) {
        this.broadcastUserUpdate(user)
      }
    }
  }

  /**
   * 更新用户选择
   */
  updateUserSelection(selection: string[]): void {
    const user = this.users.get(this.config.userId)
    if (user) {
      user.selection = selection
      this.users.set(this.config.userId, user)
      
      if (this.config.enableSelectionSharing) {
        this.broadcastUserUpdate(user)
      }
    }
  }

  /**
   * 创建操作
   */
  createOperation(
    type: CollaborationOperation['type'],
    target: CollaborationOperation['target'],
    targetId: string,
    data: any
  ): CollaborationOperation {
    const operation: CollaborationOperation = {
      id: this.generateOperationId(),
      type,
      target,
      targetId,
      userId: this.config.userId,
      timestamp: Date.now(),
      data,
      version: this.version + 1
    }

    return operation
  }

  /**
   * 应用操作
   */
  applyOperation(operation: CollaborationOperation): boolean {
    try {
      // 检查版本冲突
      if (operation.version <= this.version && operation.userId !== this.config.userId) {
        console.warn('操作版本过低，可能存在冲突:', operation)
        this.handleVersionConflict(operation)
        return false
      }

      // 检查权限
      if (!this.hasPermission(operation)) {
        console.warn('用户无权限执行操作:', operation)
        this.handlePermissionDenied(operation)
        return false
      }

      // 应用操作到本地状态
      this.applyOperationLocally(operation)
      
      // 更新版本号
      if (operation.version > this.version) {
        this.version = operation.version
      }

      // 添加到操作历史
      this.operations.push(operation)
      
      // 如果是本地操作，发送到服务器
      if (operation.userId === this.config.userId && this.config.enableRealTimeSync) {
        this.throttledSendOperation(operation)
      }

      this.emit('operation:applied', operation)
      return true
    } catch (error) {
      console.error('应用操作失败:', error)
      this.emit('operation:failed', { operation, error })
      return false
    }
  }

  /**
   * 撤销操作
   */
  undoOperation(operationId: string): boolean {
    const operation = this.operations.find(op => op.id === operationId)
    if (!operation) return false

    // 检查权限 - 只能撤销自己的操作
    if (operation.userId !== this.config.userId) {
      console.warn('无权限撤销其他用户的操作')
      return false
    }

    try {
      // 创建反向操作
      const undoOperation = this.createUndoOperation(operation)
      return this.applyOperation(undoOperation)
    } catch (error) {
      console.error('撤销操作失败:', error)
      return false
    }
  }

  /**
   * 解决冲突
   */
  resolveConflict(conflictId: string, resolution: CollaborationConflict['resolution']): boolean {
    const conflict = this.conflicts.find(c => c.id === conflictId)
    if (!conflict) return false

    try {
      switch (resolution) {
        case 'merge':
          return this.mergeConflictOperations(conflict)
        case 'reject':
          return this.rejectConflictOperations(conflict)
        case 'manual':
          this.emit('conflict:manual_resolution_needed', conflict)
          return false
        default:
          return false
      }
    } catch (error) {
      console.error('解决冲突失败:', error)
      return false
    }
  }

  /**
   * 获取操作历史
   */
  getOperationHistory(limit?: number): CollaborationOperation[] {
    return limit ? this.operations.slice(-limit) : [...this.operations]
  }

  /**
   * 获取当前冲突
   */
  getConflicts(): CollaborationConflict[] {
    return [...this.conflicts]
  }

  /**
   * 连接WebSocket服务器
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.config.serverUrl!)
        
        this.websocket.onopen = () => {
          this.isConnected = true
          this.joinRoom()
          this.emit('connected')
          resolve()
        }

        this.websocket.onmessage = (event) => {
          this.handleServerMessage(JSON.parse(event.data))
        }

        this.websocket.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.emit('error', error)
          reject(error)
        }

        this.websocket.onclose = () => {
          this.isConnected = false
          this.emit('disconnected')
          // 尝试重连
          setTimeout(() => this.reconnect(), 3000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 重连
   */
  private async reconnect(): Promise<void> {
    if (!this.isConnected && this.config.serverUrl) {
      try {
        await this.connectWebSocket()
        this.emit('reconnected')
      } catch (error) {
        console.error('重连失败:', error)
        setTimeout(() => this.reconnect(), 5000)
      }
    }
  }

  /**
   * 加入房间
   */
  private joinRoom(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'join_room',
        data: {
          roomId: this.config.roomId,
          user: this.getCurrentUser()
        }
      }))
    }
  }

  /**
   * 发送操作到服务器
   */
  private sendOperationToServer(operation: CollaborationOperation): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'operation',
        data: operation
      }))
      this.lastSentOperation = operation
    } else {
      // 离线模式，添加到队列
      this.operationQueue.push(operation)
    }
  }

  /**
   * 广播用户更新
   */
  private broadcastUserUpdate(user: CollaborationUser): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'user_update',
        data: user
      }))
    }
  }

  /**
   * 处理服务器消息
   */
  private handleServerMessage(message: any): void {
    switch (message.type) {
      case 'user_joined':
        this.addUser(message.data)
        break
      case 'user_left':
        this.removeUser(message.data.userId)
        break
      case 'user_update':
        this.users.set(message.data.id, message.data)
        this.emit('user:updated', message.data)
        break
      case 'operation':
        if (message.data.userId !== this.config.userId) {
          this.applyOperation(message.data)
        }
        break
      case 'conflict':
        this.handleConflictFromServer(message.data)
        break
      default:
        console.warn('未知消息类型:', message.type)
    }
  }

  /**
   * 本地应用操作
   */
  private applyOperationLocally(operation: CollaborationOperation): void {
    // 这里应该调用实际的编辑器操作
    // 例如：this.editor.applyOperation(operation)
    this.emit('operation:apply_locally', operation)
  }

  /**
   * 检查权限
   */
  private hasPermission(operation: CollaborationOperation): boolean {
    // 简单的权限检查 - 可以根据需要扩展
    return true
  }

  /**
   * 处理版本冲突
   */
  private handleVersionConflict(operation: CollaborationOperation): void {
    const conflict: CollaborationConflict = {
      id: this.generateConflictId(),
      operations: [operation],
      type: 'version_mismatch'
    }

    this.conflicts.push(conflict)
    
    if (this.config.conflictResolution === 'auto_merge') {
      this.resolveConflict(conflict.id, 'merge')
    } else {
      this.emit('conflict:detected', conflict)
    }
  }

  /**
   * 处理权限拒绝
   */
  private handlePermissionDenied(operation: CollaborationOperation): void {
    const conflict: CollaborationConflict = {
      id: this.generateConflictId(),
      operations: [operation],
      type: 'permission_denied'
    }

    this.conflicts.push(conflict)
    this.emit('conflict:permission_denied', conflict)
  }

  /**
   * 处理来自服务器的冲突
   */
  private handleConflictFromServer(conflictData: any): void {
    const conflict: CollaborationConflict = conflictData
    this.conflicts.push(conflict)
    this.emit('conflict:from_server', conflict)
  }

  /**
   * 创建撤销操作
   */
  private createUndoOperation(operation: CollaborationOperation): CollaborationOperation {
    // 根据操作类型创建相应的撤销操作
    let undoType: CollaborationOperation['type']
    let undoData: any

    switch (operation.type) {
      case 'create':
        undoType = 'delete'
        undoData = { id: operation.targetId }
        break
      case 'delete':
        undoType = 'create'
        undoData = operation.data
        break
      case 'update':
        undoType = 'update'
        undoData = operation.data.previousState || {}
        break
      case 'move':
        undoType = 'move'
        undoData = { 
          x: operation.data.previousPosition?.x || 0,
          y: operation.data.previousPosition?.y || 0
        }
        break
      default:
        throw new Error(`无法为操作类型 ${operation.type} 创建撤销操作`)
    }

    return this.createOperation(undoType, operation.target, operation.targetId, undoData)
  }

  /**
   * 合并冲突操作
   */
  private mergeConflictOperations(conflict: CollaborationConflict): boolean {
    // 简单的合并策略 - 应用最后一个操作
    const lastOperation = conflict.operations[conflict.operations.length - 1]
    return this.applyOperation(lastOperation)
  }

  /**
   * 拒绝冲突操作
   */
  private rejectConflictOperations(conflict: CollaborationConflict): boolean {
    // 移除冲突
    this.conflicts = this.conflicts.filter(c => c.id !== conflict.id)
    this.emit('conflict:resolved', { conflict, resolution: 'reject' })
    return true
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `op_${this.config.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成冲突ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 节流函数
   */
  private throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let lastCallTime = 0
    let timeoutId: number | undefined

    return ((...args: any[]) => {
      const now = Date.now()

      if (now - lastCallTime >= delay) {
        lastCallTime = now
        func(...args)
      } else if (timeoutId === undefined) {
        timeoutId = window.setTimeout(() => {
          lastCallTime = Date.now()
          func(...args)
          timeoutId = undefined
        }, delay - (now - lastCallTime))
      }
    }) as T
  }

  /**
   * 销毁协作管理器
   */
  destroy(): void {
    this.disconnect()
    this.users.clear()
    this.operations = []
    this.conflicts = []
    this.operationQueue = []
    this.removeAllListeners()
  }
}
