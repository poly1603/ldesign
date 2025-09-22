/**
 * 实时协作系统
 * 基于 WebRTC 和 WebSocket 实现多用户同步
 */

import type { ColorMode } from '../core/types'

/**
 * 协作事件类型
 */
export type CollaborationEvent =
  | 'user-joined'
  | 'user-left'
  | 'color-changed'
  | 'theme-changed'
  | 'cursor-moved'
  | 'selection-changed'
  | 'sync-request'
  | 'sync-complete'
  | 'conflict-detected'
  | 'connection-established'
  | 'connection-lost'

/**
 * 用户信息
 */
export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string // 用户标识色
  cursor?: {
    x: number
    y: number
  }
  selection?: {
    color: string
    timestamp: number
  }
  isOwner?: boolean
  isOnline: boolean
  lastSeen: Date
}

/**
 * 协作会话
 */
export interface CollaborationSession {
  id: string
  name: string
  createdAt: Date
  owner: string
  users: CollaborationUser[]
  state: CollaborationState
  settings: {
    maxUsers?: number
    allowGuests?: boolean
    autoSync?: boolean
    conflictResolution?: 'owner' | 'last-write' | 'merge'
  }
}

/**
 * 协作状态
 */
export interface CollaborationState {
  theme: string
  mode: ColorMode
  colors: Record<string, string>
  version: number
  lastModified: Date
  lastModifiedBy: string
}

/**
 * 同步消息
 */
export interface SyncMessage {
  type: 'state' | 'delta' | 'cursor' | 'selection' | 'presence'
  userId: string
  timestamp: number
  data: any
  version?: number
}

/**
 * 冲突解决策略
 */
export type ConflictResolution = (
  local: CollaborationState,
  remote: CollaborationState,
  base: CollaborationState
) => CollaborationState

/**
 * WebRTC 数据通道管理器
 */
class DataChannelManager {
  private channels: Map<string, RTCDataChannel> = new Map()
  private messageQueue: Map<string, SyncMessage[]> = new Map()

  /**
   * 添加数据通道
   */
  addChannel(userId: string, channel: RTCDataChannel): void {
    this.channels.set(userId, channel)

    // 处理排队的消息
    const queued = this.messageQueue.get(userId)
    if (queued) {
      queued.forEach(msg => this.send(userId, msg))
      this.messageQueue.delete(userId)
    }
  }

  /**
   * 移除数据通道
   */
  removeChannel(userId: string): void {
    const channel = this.channels.get(userId)
    if (channel) {
      channel.close()
      this.channels.delete(userId)
    }
  }

  /**
   * 发送消息
   */
  send(userId: string, message: SyncMessage): void {
    const channel = this.channels.get(userId)

    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify(message))
    }
    else {
      // 排队等待连接
      if (!this.messageQueue.has(userId)) {
        this.messageQueue.set(userId, [])
      }
      this.messageQueue.get(userId)!.push(message)
    }
  }

  /**
   * 广播消息
   */
  broadcast(message: SyncMessage, excludeUserId?: string): void {
    this.channels.forEach((channel, userId) => {
      if (userId !== excludeUserId && channel.readyState === 'open') {
        channel.send(JSON.stringify(message))
      }
    })
  }

  /**
   * 关闭所有通道
   */
  closeAll(): void {
    this.channels.forEach(channel => channel.close())
    this.channels.clear()
    this.messageQueue.clear()
  }
}

/**
 * 简单的事件发射器
 */
class SimpleEventEmitter {
  private events: Map<string, Set<(...args: any[]) => void>> = new Map()

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.events.get(event)?.delete(listener)
  }

  emit(event: string, data?: any): void {
    this.events.get(event)?.forEach((listener) => {
      try {
        listener(data)
      }
      catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
    }
    else {
      this.events.clear()
    }
  }
}

/**
 * 实时协作管理器
 */
export class RealtimeCollaboration extends SimpleEventEmitter {
  private ws: WebSocket | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private dataChannels: DataChannelManager = new DataChannelManager()
  private session: CollaborationSession | null = null
  private currentUser: CollaborationUser | null = null
  private localState: CollaborationState | null = null
  private baseState: CollaborationState | null = null
  private stateHistory: CollaborationState[] = []
  private conflictResolver: ConflictResolution
  private reconnectTimer?: NodeJS.Timeout
  private heartbeatTimer?: NodeJS.Timeout
  private syncTimer?: NodeJS.Timeout

  constructor(
    private config: {
      wsUrl: string
      rtcConfig?: RTCConfiguration
      userId: string
      userName: string
      userColor?: string
      autoReconnect?: boolean
      reconnectDelay?: number
      heartbeatInterval?: number
      syncInterval?: number
      maxHistorySize?: number
    },
  ) {
    super()

    this.conflictResolver = this.createDefaultConflictResolver()

    // 设置默认配置
    this.config = {
      ...config,
      rtcConfig: config.rtcConfig || {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
      autoReconnect: config.autoReconnect !== false,
      reconnectDelay: config.reconnectDelay || 5000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      syncInterval: config.syncInterval || 1000,
      maxHistorySize: config.maxHistorySize || 100,
    }
  }

  /**
   * 连接到协作会话
   */
  async connect(sessionId: string): Promise<void> {
    // 连接 WebSocket 信令服务器
    await this.connectWebSocket(sessionId)

    // 初始化当前用户
    this.currentUser = {
      id: this.config.userId,
      name: this.config.userName,
      color: this.config.userColor || this.generateUserColor(),
      isOnline: true,
      lastSeen: new Date(),
    }

    // 发送加入请求
    this.sendSignal({
      type: 'join',
      sessionId,
      user: this.currentUser,
    })

    // 启动心跳
    this.startHeartbeat()

    // 启动自动同步
    this.startAutoSync()
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    // 停止定时器
    this.stopHeartbeat()
    this.stopAutoSync()
    this.stopReconnect()

    // 发送离开通知
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSignal({
        type: 'leave',
        sessionId: this.session?.id,
        userId: this.currentUser?.id,
      })
    }

    // 关闭连接
    this.closeAllConnections()

    // 清理状态
    this.session = null
    this.currentUser = null
    this.localState = null
    this.baseState = null
    this.stateHistory = []
  }

  /**
   * 更新本地状态
   */
  updateState(updates: Partial<CollaborationState>): void {
    if (!this.localState)
      return

    const newState: CollaborationState = {
      ...this.localState,
      ...updates,
      version: this.localState.version + 1,
      lastModified: new Date(),
      lastModifiedBy: this.currentUser?.id || 'unknown',
    }

    // 保存历史
    this.addToHistory(this.localState)

    // 更新本地状态
    this.localState = newState

    // 广播变更
    this.broadcastStateChange(newState)

    // 触发事件
    this.emit('state-changed', newState)
  }

  /**
   * 更新光标位置
   */
  updateCursor(x: number, y: number): void {
    if (!this.currentUser)
      return

    this.currentUser.cursor = { x, y }

    // 广播光标位置
    this.dataChannels.broadcast({
      type: 'cursor',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { x, y },
    })
  }

  /**
   * 更新选择
   */
  updateSelection(color: string): void {
    if (!this.currentUser)
      return

    this.currentUser.selection = {
      color,
      timestamp: Date.now(),
    }

    // 广播选择
    this.dataChannels.broadcast({
      type: 'selection',
      userId: this.currentUser.id,
      timestamp: Date.now(),
      data: { color },
    })

    this.emit('selection-changed', {
      userId: this.currentUser.id,
      color,
    })
  }

  /**
   * 获取当前会话
   */
  getSession(): CollaborationSession | null {
    return this.session
  }

  /**
   * 获取当前状态
   */
  getState(): CollaborationState | null {
    return this.localState
  }

  /**
   * 获取在线用户
   */
  getOnlineUsers(): CollaborationUser[] {
    return this.session?.users.filter(u => u.isOnline) || []
  }

  /**
   * 连接 WebSocket
   */
  private async connectWebSocket(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.config.wsUrl}?session=${sessionId}&user=${this.config.userId}`)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.emit('connection-established')
        resolve()
      }

      this.ws.onmessage = (event) => {
        this.handleSignal(JSON.parse(event.data))
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.emit('connection-lost')

        if (this.config.autoReconnect) {
          this.scheduleReconnect()
        }
      }
    })
  }

  /**
   * 处理信令消息
   */
  private async handleSignal(signal: any): Promise<void> {
    switch (signal.type) {
      case 'session-info':
        this.session = signal.session
        this.localState = signal.state
        this.baseState = { ...signal.state }
        break

      case 'user-joined':
        await this.handleUserJoined(signal.user)
        break

      case 'user-left':
        this.handleUserLeft(signal.userId)
        break

      case 'offer':
        await this.handleOffer(signal.userId, signal.offer)
        break

      case 'answer':
        await this.handleAnswer(signal.userId, signal.answer)
        break

      case 'ice-candidate':
        await this.handleIceCandidate(signal.userId, signal.candidate)
        break

      case 'state-sync':
        await this.handleStateSync(signal.state)
        break
    }
  }

  /**
   * 处理用户加入
   */
  private async handleUserJoined(user: CollaborationUser): Promise<void> {
    // 添加到会话
    if (this.session) {
      this.session.users.push(user)
    }

    // 创建 P2P 连接
    await this.createPeerConnection(user.id, true)

    // 触发事件
    this.emit('user-joined', user)
  }

  /**
   * 处理用户离开
   */
  private handleUserLeft(userId: string): void {
    // 从会话移除
    if (this.session) {
      this.session.users = this.session.users.filter(u => u.id !== userId)
    }

    // 关闭连接
    this.closePeerConnection(userId)

    // 触发事件
    this.emit('user-left', { userId })
  }

  /**
   * 创建 P2P 连接
   */
  private async createPeerConnection(userId: string, isInitiator: boolean): Promise<void> {
    const pc = new RTCPeerConnection(this.config.rtcConfig)
    this.peerConnections.set(userId, pc)

    // 处理 ICE 候选
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          userId: this.currentUser?.id,
          targetUserId: userId,
          candidate: event.candidate,
        })
      }
    }

    // 创建数据通道
    if (isInitiator) {
      const channel = pc.createDataChannel('sync', {
        ordered: true,
        maxRetransmits: 3,
      })

      this.setupDataChannel(userId, channel)

      // 创建 Offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      this.sendSignal({
        type: 'offer',
        userId: this.currentUser?.id,
        targetUserId: userId,
        offer,
      })
    }
    else {
      // 等待数据通道
      pc.ondatachannel = (event) => {
        this.setupDataChannel(userId, event.channel)
      }
    }
  }

  /**
   * 设置数据通道
   */
  private setupDataChannel(userId: string, channel: RTCDataChannel): void {
    channel.onopen = () => {
      console.log(`Data channel opened with ${userId}`)
      this.dataChannels.addChannel(userId, channel)

      // 发送初始同步
      this.sendStateSync(userId)
    }

    channel.onmessage = (event) => {
      const message: SyncMessage = JSON.parse(event.data)
      this.handleSyncMessage(message)
    }

    channel.onclose = () => {
      console.log(`Data channel closed with ${userId}`)
      this.dataChannels.removeChannel(userId)
    }

    channel.onerror = (error) => {
      console.error(`Data channel error with ${userId}:`, error)
    }
  }

  /**
   * 处理 Offer
   */
  private async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    let pc = this.peerConnections.get(userId)

    if (!pc) {
      await this.createPeerConnection(userId, false)
      pc = this.peerConnections.get(userId)!
    }

    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    this.sendSignal({
      type: 'answer',
      userId: this.currentUser?.id,
      targetUserId: userId,
      answer,
    })
  }

  /**
   * 处理 Answer
   */
  private async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(userId)
    if (pc) {
      await pc.setRemoteDescription(answer)
    }
  }

  /**
   * 处理 ICE 候选
   */
  private async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(userId)
    if (pc) {
      await pc.addIceCandidate(candidate)
    }
  }

  /**
   * 处理同步消息
   */
  private handleSyncMessage(message: SyncMessage): void {
    switch (message.type) {
      case 'state':
        this.handleStateUpdate(message.data)
        break

      case 'cursor':
        this.handleCursorUpdate(message.userId, message.data)
        break

      case 'selection':
        this.handleSelectionUpdate(message.userId, message.data)
        break

      case 'presence':
        this.handlePresenceUpdate(message.userId, message.data)
        break
    }
  }

  /**
   * 处理状态更新
   */
  private handleStateUpdate(remoteState: CollaborationState): void {
    if (!this.localState || !this.baseState)
      return

    // 检测冲突
    if (remoteState.version > this.localState.version) {
      // 远程状态更新，直接应用
      this.localState = remoteState
      this.baseState = { ...remoteState }
      this.emit('state-changed', remoteState)
    }
    else if (remoteState.version === this.localState.version
      && remoteState.lastModified > this.localState.lastModified) {
      // 版本相同但远程更新，应用远程
      this.localState = remoteState
      this.baseState = { ...remoteState }
      this.emit('state-changed', remoteState)
    }
    else if (remoteState.version < this.localState.version) {
      // 本地更新，忽略远程

    }
    else {
      // 检测到冲突
      const resolved = this.conflictResolver(this.localState, remoteState, this.baseState)
      this.localState = resolved
      this.baseState = { ...resolved }

      this.emit('conflict-detected', {
        local: this.localState,
        remote: remoteState,
        resolved,
      })

      // 广播解决后的状态
      this.broadcastStateChange(resolved)
    }
  }

  /**
   * 处理光标更新
   */
  private handleCursorUpdate(userId: string, cursor: { x: number, y: number }): void {
    const user = this.session?.users.find(u => u.id === userId)
    if (user) {
      user.cursor = cursor
      this.emit('cursor-moved', { userId, cursor })
    }
  }

  /**
   * 处理选择更新
   */
  private handleSelectionUpdate(userId: string, selection: { color: string }): void {
    const user = this.session?.users.find(u => u.id === userId)
    if (user) {
      user.selection = {
        color: selection.color,
        timestamp: Date.now(),
      }
      this.emit('selection-changed', { userId, color: selection.color })
    }
  }

  /**
   * 处理在线状态更新
   */
  private handlePresenceUpdate(userId: string, presence: { isOnline: boolean }): void {
    const user = this.session?.users.find(u => u.id === userId)
    if (user) {
      user.isOnline = presence.isOnline
      user.lastSeen = new Date()
    }
  }

  /**
   * 处理状态同步
   */
  private async handleStateSync(state: CollaborationState): Promise<void> {
    this.handleStateUpdate(state)
  }

  /**
   * 发送信令
   */
  private sendSignal(signal: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(signal))
    }
  }

  /**
   * 广播状态变更
   */
  private broadcastStateChange(state: CollaborationState): void {
    this.dataChannels.broadcast({
      type: 'state',
      userId: this.currentUser?.id || '',
      timestamp: Date.now(),
      data: state,
      version: state.version,
    })
  }

  /**
   * 发送状态同步
   */
  private sendStateSync(userId: string): void {
    if (!this.localState)
      return

    this.dataChannels.send(userId, {
      type: 'state',
      userId: this.currentUser?.id || '',
      timestamp: Date.now(),
      data: this.localState,
      version: this.localState.version,
    })
  }

  /**
   * 关闭 P2P 连接
   */
  private closePeerConnection(userId: string): void {
    const pc = this.peerConnections.get(userId)
    if (pc) {
      pc.close()
      this.peerConnections.delete(userId)
    }

    this.dataChannels.removeChannel(userId)
  }

  /**
   * 关闭所有连接
   */
  private closeAllConnections(): void {
    // 关闭 WebSocket
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    // 关闭所有 P2P 连接
    this.peerConnections.forEach(pc => pc.close())
    this.peerConnections.clear()

    // 关闭所有数据通道
    this.dataChannels.closeAll()
  }

  /**
   * 计划重连
   */
  private scheduleReconnect(): void {
    this.stopReconnect()

    this.reconnectTimer = setTimeout(async () => {
      console.log('Attempting to reconnect...')

      try {
        if (this.session) {
          await this.connect(this.session.id)
        }
      }
      catch (error) {
        console.error('Reconnection failed:', error)
        this.scheduleReconnect()
      }
    }, this.config.reconnectDelay)
  }

  /**
   * 停止重连
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      this.sendSignal({
        type: 'heartbeat',
        userId: this.currentUser?.id,
        timestamp: Date.now(),
      })

      // 广播在线状态
      this.dataChannels.broadcast({
        type: 'presence',
        userId: this.currentUser?.id || '',
        timestamp: Date.now(),
        data: { isOnline: true },
      })
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(): void {
    this.stopAutoSync()

    this.syncTimer = setInterval(() => {
      if (this.localState) {
        this.broadcastStateChange(this.localState)
      }
    }, this.config.syncInterval)
  }

  /**
   * 停止自动同步
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }
  }

  /**
   * 添加到历史
   */
  private addToHistory(state: CollaborationState): void {
    this.stateHistory.push({ ...state })

    // 限制历史大小
    if (this.stateHistory.length > this.config.maxHistorySize!) {
      this.stateHistory = this.stateHistory.slice(-this.config.maxHistorySize!)
    }
  }

  /**
   * 生成用户颜色
   */
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  /**
   * 创建默认冲突解决器
   */
  private createDefaultConflictResolver(): ConflictResolution {
    return (local, remote, _base) => {
      // 默认策略：最后写入获胜
      if (remote.lastModified > local.lastModified) {
        return remote
      }
      return local
    }
  }

  /**
   * 撤销操作
   */
  undo(): void {
    if (this.stateHistory.length > 0) {
      const previousState = this.stateHistory.pop()
      if (previousState && this.localState) {
        this.localState = previousState
        this.broadcastStateChange(this.localState)
        this.emit('state-changed', this.localState)
      }
    }
  }

  /**
   * 获取协作统计
   */
  getStats(): {
    sessionId: string | undefined
    users: number
    onlineUsers: number
    stateVersion: number
    historySize: number
    connections: number
  } {
    return {
      sessionId: this.session?.id,
      users: this.session?.users.length || 0,
      onlineUsers: this.getOnlineUsers().length,
      stateVersion: this.localState?.version || 0,
      historySize: this.stateHistory.length,
      connections: this.peerConnections.size,
    }
  }
}
