/**
 * 协作插件
 * 
 * 为流程图编辑器提供实时协作功能
 */

import { BasePlugin } from '../BasePlugin'
import type { FlowchartEditor } from '../../core/FlowchartEditor'
import {
  CollaborationManager,
  RealTimeSync,
  ConflictResolver,
  UserPresenceManager,
  type CollaborationConfig,
  type User,
  type Operation,
  type UserPresence,
  type Conflict
} from '../../collaboration'

/**
 * 协作插件配置
 */
export interface CollaborationPluginConfig {
  /** 协作服务器URL */
  serverUrl: string
  /** 会话ID */
  sessionId: string
  /** 当前用户信息 */
  user: User
  /** 是否启用实时同步 */
  enableRealTimeSync?: boolean
  /** 是否启用用户状态显示 */
  enableUserPresence?: boolean
  /** 是否启用冲突自动解决 */
  enableAutoConflictResolution?: boolean
  /** 冲突解决策略 */
  conflictResolution?: 'manual' | 'auto' | 'last-write-wins'
  /** 用户离线超时时间（毫秒） */
  presenceTimeout?: number
}

/**
 * 协作插件类
 */
export class CollaborationPlugin extends BasePlugin<CollaborationPluginConfig> {
  readonly name = 'collaboration'
  readonly version = '1.0.0'
  readonly description = '实时协作编辑插件'

  private collaborationManager?: CollaborationManager
  private config?: CollaborationPluginConfig
  private isEnabled: boolean = false

  /**
   * 安装插件
   */
  protected onInstall(): void {
    if (!this.editor) {
      throw new Error('编辑器实例未找到')
    }

    // 监听编辑器事件
    this.setupEditorEventListeners()
    
    console.log('协作插件安装完成')
  }

  /**
   * 卸载插件
   */
  protected onUninstall(): void {
    this.disableCollaboration()
    this.removeEditorEventListeners()
    
    console.log('协作插件卸载完成')
  }

  /**
   * 启用协作功能
   */
  async enableCollaboration(config: CollaborationPluginConfig): Promise<void> {
    if (this.isEnabled) {
      throw new Error('协作功能已启用')
    }

    this.config = {
      enableRealTimeSync: true,
      enableUserPresence: true,
      enableAutoConflictResolution: true,
      conflictResolution: 'auto',
      presenceTimeout: 30000,
      ...config
    }

    try {
      // 创建协作管理器
      this.collaborationManager = new CollaborationManager(this.editor!)
      
      // 设置事件监听器
      this.setupCollaborationEventListeners()
      
      // 启用协作
      const collaborationConfig: CollaborationConfig = {
        serverUrl: this.config.serverUrl,
        sessionId: this.config.sessionId,
        user: this.config.user,
        permissions: {
          canEdit: true,
          canDelete: true,
          canInvite: false,
          canManagePermissions: false,
          canExport: true,
          canComment: true
        },
        autoSave: true,
        conflictResolution: this.config.conflictResolution,
        presenceTimeout: this.config.presenceTimeout
      }

      await this.collaborationManager.enableCollaboration(collaborationConfig)
      await this.collaborationManager.joinSession(this.config.sessionId, this.config.user)
      
      this.isEnabled = true
      
      // 触发协作启用事件
      this.editor!.emit('collaboration:enabled', {
        sessionId: this.config.sessionId,
        user: this.config.user
      })
      
      console.log('协作功能启用成功')
    } catch (error) {
      console.error('启用协作功能失败:', error)
      throw error
    }
  }

  /**
   * 禁用协作功能
   */
  async disableCollaboration(): Promise<void> {
    if (!this.isEnabled || !this.collaborationManager) {
      return
    }

    try {
      await this.collaborationManager.disableCollaboration()
      this.removeCollaborationEventListeners()
      
      this.collaborationManager = undefined
      this.isEnabled = false
      
      // 触发协作禁用事件
      this.editor!.emit('collaboration:disabled')
      
      console.log('协作功能已禁用')
    } catch (error) {
      console.error('禁用协作功能失败:', error)
    }
  }

  /**
   * 获取协作状态
   */
  getCollaborationState(): {
    isEnabled: boolean
    sessionId?: string
    users: User[]
    syncState: any
  } {
    return {
      isEnabled: this.isEnabled,
      sessionId: this.config?.sessionId,
      users: this.collaborationManager?.getUsers() || [],
      syncState: this.collaborationManager?.getSyncState()
    }
  }

  /**
   * 获取在线用户
   */
  getOnlineUsers(): UserPresence[] {
    if (!this.collaborationManager) {
      return []
    }

    return this.collaborationManager.getUsers().map(user => ({
      user,
      activity: 'active' as const,
      lastActivity: Date.now()
    }))
  }

  /**
   * 手动解决冲突
   */
  async resolveConflict(conflictId: string, resolution: 'accept_local' | 'accept_remote' | 'merge'): Promise<void> {
    if (!this.collaborationManager) {
      throw new Error('协作功能未启用')
    }

    // 这里需要实现具体的冲突解决逻辑
    console.log(`手动解决冲突 ${conflictId}，策略: ${resolution}`)
  }

  /**
   * 设置编辑器事件监听器
   */
  private setupEditorEventListeners(): void {
    if (!this.editor) return

    // 监听节点操作
    this.editor.on('node:add', this.handleNodeAdd)
    this.editor.on('node:update', this.handleNodeUpdate)
    this.editor.on('node:delete', this.handleNodeDelete)
    this.editor.on('node:move', this.handleNodeMove)

    // 监听边操作
    this.editor.on('edge:add', this.handleEdgeAdd)
    this.editor.on('edge:update', this.handleEdgeUpdate)
    this.editor.on('edge:delete', this.handleEdgeDelete)

    // 监听选择变化
    this.editor.on('selection:change', this.handleSelectionChange)
  }

  /**
   * 移除编辑器事件监听器
   */
  private removeEditorEventListeners(): void {
    if (!this.editor) return

    this.editor.off('node:add', this.handleNodeAdd)
    this.editor.off('node:update', this.handleNodeUpdate)
    this.editor.off('node:delete', this.handleNodeDelete)
    this.editor.off('node:move', this.handleNodeMove)
    this.editor.off('edge:add', this.handleEdgeAdd)
    this.editor.off('edge:update', this.handleEdgeUpdate)
    this.editor.off('edge:delete', this.handleEdgeDelete)
    this.editor.off('selection:change', this.handleSelectionChange)
  }

  /**
   * 设置协作事件监听器
   */
  private setupCollaborationEventListeners(): void {
    if (!this.collaborationManager) return

    this.collaborationManager.on('user:join', this.handleUserJoin)
    this.collaborationManager.on('user:leave', this.handleUserLeave)
    this.collaborationManager.on('operation:received', this.handleOperationReceived)
    this.collaborationManager.on('conflict:detected', this.handleConflictDetected)
    this.collaborationManager.on('connection:established', this.handleConnectionEstablished)
    this.collaborationManager.on('connection:lost', this.handleConnectionLost)
  }

  /**
   * 移除协作事件监听器
   */
  private removeCollaborationEventListeners(): void {
    if (!this.collaborationManager) return

    this.collaborationManager.off('user:join', this.handleUserJoin)
    this.collaborationManager.off('user:leave', this.handleUserLeave)
    this.collaborationManager.off('operation:received', this.handleOperationReceived)
    this.collaborationManager.off('conflict:detected', this.handleConflictDetected)
    this.collaborationManager.off('connection:established', this.handleConnectionEstablished)
    this.collaborationManager.off('connection:lost', this.handleConnectionLost)
  }

  // 事件处理器
  private handleNodeAdd = (data: any): void => {
    this.sendOperation('node:add', 'node', data.id, data)
  }

  private handleNodeUpdate = (data: any): void => {
    this.sendOperation('node:update', 'node', data.id, data)
  }

  private handleNodeDelete = (data: any): void => {
    this.sendOperation('node:delete', 'node', data.id, data)
  }

  private handleNodeMove = (data: any): void => {
    this.sendOperation('node:move', 'node', data.id, data)
  }

  private handleEdgeAdd = (data: any): void => {
    this.sendOperation('edge:add', 'edge', data.id, data)
  }

  private handleEdgeUpdate = (data: any): void => {
    this.sendOperation('edge:update', 'edge', data.id, data)
  }

  private handleEdgeDelete = (data: any): void => {
    this.sendOperation('edge:delete', 'edge', data.id, data)
  }

  private handleSelectionChange = (data: any): void => {
    // 更新用户选择状态
    if (this.collaborationManager && this.config) {
      // 这里需要实现选择状态的同步
    }
  }

  private handleUserJoin = (user: User): void => {
    this.editor!.emit('collaboration:user:join', user)
  }

  private handleUserLeave = (user: User): void => {
    this.editor!.emit('collaboration:user:leave', user)
  }

  private handleOperationReceived = (operation: Operation): void => {
    // 应用远程操作到本地编辑器
    this.applyRemoteOperation(operation)
  }

  private handleConflictDetected = (conflict: Conflict): void => {
    this.editor!.emit('collaboration:conflict', conflict)
  }

  private handleConnectionEstablished = (): void => {
    this.editor!.emit('collaboration:connected')
  }

  private handleConnectionLost = (): void => {
    this.editor!.emit('collaboration:disconnected')
  }

  /**
   * 发送操作
   */
  private async sendOperation(
    type: Operation['type'],
    target: Operation['target'],
    targetId: string,
    data: any
  ): Promise<void> {
    if (!this.collaborationManager || !this.config) return

    const operation: Operation = {
      id: this.generateOperationId(),
      type,
      target,
      targetId,
      data,
      userId: this.config.user.id,
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      version: 1
    }

    try {
      await this.collaborationManager.sendOperation(operation)
    } catch (error) {
      console.error('发送操作失败:', error)
    }
  }

  /**
   * 应用远程操作
   */
  private applyRemoteOperation(operation: Operation): void {
    // 这里需要根据操作类型应用到编辑器
    console.log('应用远程操作:', operation)
    
    // 触发编辑器事件
    this.editor!.emit('collaboration:operation:applied', operation)
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
