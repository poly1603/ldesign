/**
 * 实时协作模块
 * 
 * 支持多人实时编辑翻译，WebSocket同步
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import type { I18n } from './i18n'
import { TimeUtils } from '../utils/common'

/**
 * 协作事件类型
 */
export enum CollaborationEventType {
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  TRANSLATION_UPDATE = 'translation_update',
  TRANSLATION_DELETE = 'translation_delete',
  LOCALE_ADD = 'locale_add',
  LOCALE_REMOVE = 'locale_remove',
  CURSOR_MOVE = 'cursor_move',
  SELECTION_CHANGE = 'selection_change',
  CONFLICT_DETECTED = 'conflict_detected',
  SYNC_REQUEST = 'sync_request',
  SYNC_RESPONSE = 'sync_response',
}

/**
 * 用户信息
 */
export interface CollaborationUser {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string // 用于显示光标颜色
  isOnline: boolean
  lastSeen: number
  cursor?: {
    key: string
    position: number
  }
  selection?: {
    key: string
    start: number
    end: number
  }
}

/**
 * 协作事件
 */
export interface CollaborationEvent {
  type: CollaborationEventType
  userId: string
  timestamp: number
  data: any
}

/**
 * 翻译变更
 */
export interface TranslationChange {
  key: string
  locale: string
  oldValue?: string
  newValue?: string
  userId: string
  timestamp: number
  version: number
}

/**
 * 冲突解决策略
 */
export enum ConflictResolution {
  LATEST_WINS = 'latest_wins', // 最新的覆盖
  MERGE = 'merge', // 合并变更
  MANUAL = 'manual', // 手动解决
  BRANCH = 'branch', // 创建分支
}

/**
 * 协作配置
 */
export interface CollaborationConfig {
  serverUrl?: string
  roomId?: string
  userId?: string
  userName?: string
  conflictResolution?: ConflictResolution
  syncInterval?: number
  enablePresence?: boolean // 显示其他用户状态
  enableHistory?: boolean // 记录历史
  maxHistorySize?: number
  reconnectAttempts?: number
  reconnectDelay?: number
}

/**
 * WebSocket连接状态
 */
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

/**
 * 操作转换（OT）算法实现
 */
class OperationalTransform {
  /**
   * 转换操作
   */
  static transform(op1: TranslationChange, op2: TranslationChange): [TranslationChange, TranslationChange] {
    // 如果操作不同的键，不需要转换
    if (op1.key !== op2.key || op1.locale !== op2.locale) {
      return [op1, op2]
    }
    
    // 根据时间戳决定优先级
    if (op1.timestamp < op2.timestamp) {
      return [op1, { ...op2, version: op1.version + 1 }]
    } else {
      return [{ ...op1, version: op2.version + 1 }, op2]
    }
  }
  
  /**
   * 合并操作
   */
  static merge(changes: TranslationChange[]): TranslationChange[] {
    const merged: TranslationChange[] = []
    const keyMap = new Map<string, TranslationChange>()
    
    for (const change of changes) {
      const key = `${change.locale}:${change.key}`
      const existing = keyMap.get(key)
      
      if (!existing || change.version > existing.version) {
        keyMap.set(key, change)
      }
    }
    
    return Array.from(keyMap.values())
  }
}

/**
 * 协作管理器
 */
export class CollaborationManager {
  private ws?: WebSocket
  private config: Required<CollaborationConfig>
  private i18n?: I18n
  private users = new Map<string, CollaborationUser>()
  private pendingChanges: TranslationChange[] = []
  private history: TranslationChange[] = []
  private connectionState = ConnectionState.DISCONNECTED
  private reconnectTimer?: NodeJS.Timeout
  private syncTimer?: NodeJS.Timeout
  private version = 0
  private listeners = new Map<CollaborationEventType, Array<(event: CollaborationEvent) => void>>()
  
  constructor(config: CollaborationConfig = {}) {
    this.config = {
      serverUrl: config.serverUrl || 'ws://localhost:3001',
      roomId: config.roomId || 'default',
      userId: config.userId || this.generateUserId(),
      userName: config.userName || 'Anonymous',
      conflictResolution: config.conflictResolution || ConflictResolution.LATEST_WINS,
      syncInterval: config.syncInterval || 1000,
      enablePresence: config.enablePresence ?? true,
      enableHistory: config.enableHistory ?? true,
      maxHistorySize: config.maxHistorySize || 100,
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 1000,
    }
  }
  
  /**
   * 连接到协作服务器
   */
  async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED) {
      return
    }
    
    this.connectionState = ConnectionState.CONNECTING
    
    try {
      // 创建WebSocket连接
      this.ws = new WebSocket(`${this.config.serverUrl}/room/${this.config.roomId}`)
      
      this.ws.onopen = () => {
        this.handleConnect()
      }
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event)
      }
      
      this.ws.onerror = (error) => {
        this.handleError(error)
      }
      
      this.ws.onclose = () => {
        this.handleDisconnect()
      }
      
      // 启动同步定时器
      this.startSyncTimer()
      
    } catch (error) {
      console.error('Failed to connect:', error)
      this.connectionState = ConnectionState.FAILED
      throw error
    }
  }
  
  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = undefined
    }
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    
    this.connectionState = ConnectionState.DISCONNECTED
  }
  
  /**
   * 发送翻译更新
   */
  updateTranslation(key: string, locale: string, value: string): void {
    const change: TranslationChange = {
      key,
      locale,
      newValue: value,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      version: ++this.version,
    }
    
    // 添加到待发送队列
    this.pendingChanges.push(change)
    
    // 立即应用到本地
    if (this.i18n) {
      this.i18n.mergeLocaleMessage(locale, { [key]: value })
    }
    
    // 添加到历史
    if (this.config.enableHistory) {
      this.addToHistory(change)
    }
    
    // 如果已连接，立即发送
    if (this.connectionState === ConnectionState.CONNECTED) {
      this.sendChange(change)
    }
  }
  
  /**
   * 删除翻译
   */
  deleteTranslation(key: string, locale: string): void {
    const change: TranslationChange = {
      key,
      locale,
      newValue: undefined,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      version: ++this.version,
    }
    
    this.pendingChanges.push(change)
    
    if (this.connectionState === ConnectionState.CONNECTED) {
      this.sendChange(change)
    }
  }
  
  /**
   * 更新光标位置
   */
  updateCursor(key: string, position: number): void {
    if (!this.config.enablePresence) return
    
    this.sendEvent({
      type: CollaborationEventType.CURSOR_MOVE,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      data: { key, position },
    })
  }
  
  /**
   * 更新选区
   */
  updateSelection(key: string, start: number, end: number): void {
    if (!this.config.enablePresence) return
    
    this.sendEvent({
      type: CollaborationEventType.SELECTION_CHANGE,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      data: { key, start, end },
    })
  }
  
  /**
   * 获取在线用户
   */
  getOnlineUsers(): CollaborationUser[] {
    return Array.from(this.users.values()).filter(user => user.isOnline)
  }
  
  /**
   * 获取历史记录
   */
  getHistory(): TranslationChange[] {
    return [...this.history]
  }
  
  /**
   * 监听事件
   */
  on(type: CollaborationEventType, handler: (event: CollaborationEvent) => void): void {
    const handlers = this.listeners.get(type) || []
    handlers.push(handler)
    this.listeners.set(type, handlers)
  }
  
  /**
   * 取消监听
   */
  off(type: CollaborationEventType, handler: (event: CollaborationEvent) => void): void {
    const handlers = this.listeners.get(type) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
    this.listeners.set(type, handlers)
  }
  
  /**
   * 设置i18n实例
   */
  setI18n(i18n: I18n): void {
    this.i18n = i18n
  }
  
  // 私有方法
  
  private handleConnect(): void {
    this.connectionState = ConnectionState.CONNECTED
    console.log('Connected to collaboration server')
    
    // 发送加入事件
    this.sendEvent({
      type: CollaborationEventType.USER_JOIN,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      data: {
        name: this.config.userName,
        color: this.generateColor(),
      },
    })
    
    // 请求同步
    this.requestSync()
    
    // 发送待发送的变更
    this.flushPendingChanges()
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case CollaborationEventType.USER_JOIN:
          this.handleUserJoin(data)
          break
          
        case CollaborationEventType.USER_LEAVE:
          this.handleUserLeave(data)
          break
          
        case CollaborationEventType.TRANSLATION_UPDATE:
          this.handleTranslationUpdate(data)
          break
          
        case CollaborationEventType.SYNC_RESPONSE:
          this.handleSyncResponse(data)
          break
          
        case CollaborationEventType.CONFLICT_DETECTED:
          this.handleConflict(data)
          break
          
        default:
          // 触发自定义事件处理
          this.emit(data.type, data)
      }
    } catch (error) {
      console.error('Failed to handle message:', error)
    }
  }
  
  private handleError(error: Event): void {
    console.error('WebSocket error:', error)
    this.connectionState = ConnectionState.FAILED
  }
  
  private handleDisconnect(): void {
    this.connectionState = ConnectionState.DISCONNECTED
    console.log('Disconnected from collaboration server')
    
    // 尝试重连
    this.attemptReconnect()
  }
  
  private handleUserJoin(event: CollaborationEvent): void {
    const user: CollaborationUser = {
      id: event.userId,
      name: event.data.name,
      color: event.data.color,
      isOnline: true,
      lastSeen: event.timestamp,
    }
    
    this.users.set(event.userId, user)
    this.emit(CollaborationEventType.USER_JOIN, event)
  }
  
  private handleUserLeave(event: CollaborationEvent): void {
    const user = this.users.get(event.userId)
    if (user) {
      user.isOnline = false
      user.lastSeen = event.timestamp
    }
    
    this.emit(CollaborationEventType.USER_LEAVE, event)
  }
  
  private handleTranslationUpdate(event: CollaborationEvent): void {
    const change: TranslationChange = event.data
    
    // 应用OT转换
    const transformed = this.transformChange(change)
    
    // 应用到本地i18n
    if (this.i18n && transformed.newValue !== undefined) {
      this.i18n.mergeLocaleMessage(transformed.locale, {
        [transformed.key]: transformed.newValue,
      })
    }
    
    // 添加到历史
    if (this.config.enableHistory) {
      this.addToHistory(transformed)
    }
    
    this.emit(CollaborationEventType.TRANSLATION_UPDATE, event)
  }
  
  private handleSyncResponse(event: CollaborationEvent): void {
    const { changes, users, version } = event.data
    
    // 同步版本
    this.version = Math.max(this.version, version)
    
    // 同步用户
    for (const user of users) {
      this.users.set(user.id, user)
    }
    
    // 应用变更
    for (const change of changes) {
      this.handleTranslationUpdate({
        type: CollaborationEventType.TRANSLATION_UPDATE,
        userId: change.userId,
        timestamp: change.timestamp,
        data: change,
      })
    }
  }
  
  private handleConflict(event: CollaborationEvent): void {
    const { local, remote } = event.data
    
    switch (this.config.conflictResolution) {
      case ConflictResolution.LATEST_WINS:
        // 使用最新的
        if (remote.timestamp > local.timestamp) {
          this.applyChange(remote)
        }
        break
        
      case ConflictResolution.MERGE:
        // 合并变更
        const merged = this.mergeChanges(local, remote)
        this.applyChange(merged)
        break
        
      case ConflictResolution.MANUAL:
        // 触发手动解决事件
        this.emit(CollaborationEventType.CONFLICT_DETECTED, event)
        break
        
      case ConflictResolution.BRANCH:
        // 创建分支
        this.createBranch(local, remote)
        break
    }
  }
  
  private sendEvent(event: CollaborationEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event))
    }
  }
  
  private sendChange(change: TranslationChange): void {
    this.sendEvent({
      type: CollaborationEventType.TRANSLATION_UPDATE,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      data: change,
    })
  }
  
  private flushPendingChanges(): void {
    while (this.pendingChanges.length > 0) {
      const change = this.pendingChanges.shift()!
      this.sendChange(change)
    }
  }
  
  private requestSync(): void {
    this.sendEvent({
      type: CollaborationEventType.SYNC_REQUEST,
      userId: this.config.userId,
      timestamp: TimeUtils.now(),
      data: { version: this.version },
    })
  }
  
  private startSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      if (this.connectionState === ConnectionState.CONNECTED) {
        this.flushPendingChanges()
      }
    }, this.config.syncInterval)
  }
  
  private attemptReconnect(): void {
    if (this.connectionState === ConnectionState.RECONNECTING) return
    
    this.connectionState = ConnectionState.RECONNECTING
    let attempts = 0
    
    const reconnect = () => {
      if (attempts >= this.config.reconnectAttempts) {
        this.connectionState = ConnectionState.FAILED
        console.error('Failed to reconnect after maximum attempts')
        return
      }
      
      attempts++
      console.log(`Reconnecting... (attempt ${attempts}/${this.config.reconnectAttempts})`)
      
      this.connect().catch(() => {
        this.reconnectTimer = setTimeout(reconnect, this.config.reconnectDelay * attempts)
      })
    }
    
    reconnect()
  }
  
  private transformChange(change: TranslationChange): TranslationChange {
    // 应用OT算法
    for (const pending of this.pendingChanges) {
      const [transformed] = OperationalTransform.transform(change, pending)
      change = transformed
    }
    return change
  }
  
  private applyChange(change: TranslationChange): void {
    if (this.i18n && change.newValue !== undefined) {
      this.i18n.mergeLocaleMessage(change.locale, {
        [change.key]: change.newValue,
      })
    }
  }
  
  private mergeChanges(local: TranslationChange, remote: TranslationChange): TranslationChange {
    // 简单的合并策略
    return {
      ...local,
      newValue: `${local.newValue}\n[Merged with:]\n${remote.newValue}`,
      version: Math.max(local.version, remote.version) + 1,
    }
  }
  
  private createBranch(local: TranslationChange, remote: TranslationChange): void {
    // 创建分支逻辑
    console.log('Creating branch for conflict:', { local, remote })
  }
  
  private addToHistory(change: TranslationChange): void {
    this.history.push(change)
    
    // 限制历史大小
    if (this.history.length > this.config.maxHistorySize) {
      this.history.shift()
    }
  }
  
  private emit(type: CollaborationEventType, event: CollaborationEvent): void {
    const handlers = this.listeners.get(type) || []
    for (const handler of handlers) {
      handler(event)
    }
  }
  
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private generateColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

/**
 * 创建协作管理器
 */
export function createCollaborationManager(config?: CollaborationConfig): CollaborationManager {
  return new CollaborationManager(config)
}