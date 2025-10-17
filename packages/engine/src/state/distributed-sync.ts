/**
 * Distributed State Synchronization System
 * 
 * 分布式状态同步系统，支持：
 * - 多标签页/窗口同步 (BroadcastChannel)
 * - WebSocket 实时同步
 * - WebRTC P2P 同步
 * - 冲突解决策略
 * - 离线支持和重连机制
 */

import type { Logger } from '../types'
import { computed, type ComputedRef, onUnmounted, reactive, ref, type Ref } from 'vue'

// 同步策略
export type SyncStrategy = 'last-write-wins' | 'first-write-wins' | 'merge' | 'custom'

// 同步传输类型
export type TransportType = 'broadcast' | 'websocket' | 'webrtc' | 'shared-worker'

// 同步消息
export interface SyncMessage {
  id: string
  type: 'state' | 'patch' | 'sync' | 'ack' | 'heartbeat'
  source: string
  timestamp: number
  data: any
  version?: number
  checksum?: string
}

// 同步配置
export interface SyncConfig {
  id?: string
  transports?: TransportType[]
  strategy?: SyncStrategy
  heartbeatInterval?: number
  reconnectDelay?: number
  maxReconnectAttempts?: number
  conflictResolver?: (local: any, remote: any) => any
  compress?: boolean
  encrypt?: boolean
  encryptionKey?: string
  websocketUrl?: string
  signalingServer?: string
  iceServers?: RTCIceServer[]
  roomId?: string
}

// 同步状态
export interface SyncStatus {
  connected: boolean
  syncing: boolean
  lastSync: number
  peers: number
  errors: number
  latency: number
}

/**
 * 抽象传输层
 */
abstract class Transport {
  protected listeners = new Set<(message: SyncMessage) => void>()
  protected connected = false
  
  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract send(message: SyncMessage): Promise<void>
  
  onMessage(listener: (message: SyncMessage) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  protected emit(message: SyncMessage): void {
    this.listeners.forEach(listener => listener(message))
  }
  
  isConnected(): boolean {
    return this.connected
  }
}

/**
 * BroadcastChannel 传输（多标签页同步）
 */
class BroadcastTransport extends Transport {
  private channel?: BroadcastChannel
  
  constructor(
    private channelName: string,
    private logger?: Logger
  ) {
    super()
  }
  
  async connect(): Promise<void> {
    if (typeof BroadcastChannel === 'undefined') {
      this.logger?.warn('BroadcastChannel not supported')
      return
    }
    
    this.channel = new BroadcastChannel(this.channelName)
    
    this.channel.onmessage = (event) => {
      this.emit(event.data)
    }
    
    this.channel.onmessageerror = (event) => {
      this.logger?.error('BroadcastChannel message error', event)
    }
    
    this.connected = true
    this.logger?.debug('BroadcastChannel connected')
  }
  
  async disconnect(): Promise<void> {
    if (this.channel) {
      this.channel.close()
      this.channel = undefined
    }
    this.connected = false
  }
  
  async send(message: SyncMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('BroadcastChannel not connected')
    }
    
    this.channel.postMessage(message)
  }
}

/**
 * WebSocket 传输
 */
class WebSocketTransport extends Transport {
  private ws?: WebSocket
  private reconnectAttempts = 0
  private reconnectTimer?: NodeJS.Timeout
  private pingInterval?: NodeJS.Timeout
  
  constructor(
    private url: string,
    private config: {
      reconnectDelay?: number
      maxReconnectAttempts?: number
      heartbeatInterval?: number
    } = {},
    private logger?: Logger
  ) {
    super()
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          this.connected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.logger?.debug('WebSocket connected')
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.emit(message)
          } catch (error) {
            this.logger?.error('Failed to parse WebSocket message', error)
          }
        }
        
        this.ws.onerror = (error) => {
          this.logger?.error('WebSocket error', error)
          reject(error)
        }
        
        this.ws.onclose = () => {
          this.connected = false
          this.stopHeartbeat()
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
  async disconnect(): Promise<void> {
    this.stopHeartbeat()
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = undefined
    }
    
    this.connected = false
  }
  
  async send(message: SyncMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }
    
    this.ws.send(JSON.stringify(message))
  }
  
  private startHeartbeat(): void {
    const interval = this.config.heartbeatInterval || 30000
    
    this.pingInterval = setInterval(() => {
      if (this.connected) {
        this.send({
          id: `ping-${Date.now()}`,
          type: 'heartbeat',
          source: 'client',
          timestamp: Date.now(),
          data: null
        }).catch(error => {
          this.logger?.error('Heartbeat failed', error)
        })
      }
    }, interval)
  }
  
  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = undefined
    }
  }
  
  private attemptReconnect(): void {
    const maxAttempts = this.config.maxReconnectAttempts || 5
    const delay = this.config.reconnectDelay || 1000
    
    if (this.reconnectAttempts >= maxAttempts) {
      this.logger?.error('Max reconnection attempts reached')
      return
    }
    
    this.reconnectAttempts++
    this.logger?.debug(`Attempting reconnection ${this.reconnectAttempts}/${maxAttempts}`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.logger?.error('Reconnection failed', error)
      })
    }, delay * 2**(this.reconnectAttempts - 1)) // 指数退避
  }
}

/**
 * WebRTC 传输
 */
class WebRTCTransport extends Transport {
  private peerConnection?: RTCPeerConnection
  private dataChannel?: RTCDataChannel
  private signaling?: WebSocket
  
  constructor(
    private config: {
      signalingServer: string
      iceServers?: RTCIceServer[]
      roomId?: string
    },
    private logger?: Logger
  ) {
    super()
  }
  
  async connect(): Promise<void> {
    // 连接信令服务器
    await this.connectSignaling()
    
    // 创建 RTCPeerConnection
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    // 设置事件处理
    this.setupPeerConnection()
    
    // 创建数据通道
    this.dataChannel = this.peerConnection.createDataChannel('sync', {
      ordered: true
    })
    
    this.setupDataChannel()
    
    // 创建 offer
    await this.createOffer()
  }
  
  async disconnect(): Promise<void> {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    
    if (this.signaling) {
      this.signaling.close()
    }
    
    this.connected = false
  }
  
  async send(message: SyncMessage): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('WebRTC data channel not open')
    }
    
    this.dataChannel.send(JSON.stringify(message))
  }
  
  private async connectSignaling(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.signaling = new WebSocket(this.config.signalingServer)
      
      this.signaling.onopen = () => {
        // 加入房间
        this.signaling!.send(JSON.stringify({
          type: 'join',
          roomId: this.config.roomId || 'default'
        }))
        resolve()
      }
      
      this.signaling.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        await this.handleSignalingMessage(data)
      }
      
      this.signaling.onerror = reject
    })
  }
  
  private setupPeerConnection(): void {
    if (!this.peerConnection) return
    
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signaling) {
        this.signaling.send(JSON.stringify({
          type: 'ice',
          candidate: event.candidate
        }))
      }
    }
    
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel
      this.setupDataChannel(channel)
    }
  }
  
  private setupDataChannel(channel?: RTCDataChannel): void {
    const dc = channel || this.dataChannel
    if (!dc) return
    
    dc.onopen = () => {
      this.connected = true
      this.logger?.debug('WebRTC data channel opened')
    }
    
    dc.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.emit(message)
      } catch (error) {
        this.logger?.error('Failed to parse WebRTC message', error)
      }
    }
    
    dc.onerror = (error) => {
      this.logger?.error('WebRTC data channel error', error)
    }
    
    dc.onclose = () => {
      this.connected = false
      this.logger?.debug('WebRTC data channel closed')
    }
  }
  
  private async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.signaling) return
    
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    
    this.signaling.send(JSON.stringify({
      type: 'offer',
      offer
    }))
  }
  
  private async handleSignalingMessage(data: any): Promise<void> {
    if (!this.peerConnection) return
    
    switch (data.type) {
      case 'offer': {
        await this.peerConnection.setRemoteDescription(data.offer)
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        
        if (this.signaling) {
          this.signaling.send(JSON.stringify({
            type: 'answer',
            answer
          }))
        }
        break
      }
        
      case 'answer':
        await this.peerConnection.setRemoteDescription(data.answer)
        break
        
      case 'ice':
        await this.peerConnection.addIceCandidate(data.candidate)
        break
    }
  }
}

/**
 * 分布式状态同步管理器
 */
export class DistributedSync {
  private transports = new Map<TransportType, Transport>()
  private localState = reactive<Record<string, any>>({})
  private remoteState = reactive<Record<string, any>>({})
  private syncStatus: Ref<SyncStatus>
  private syncQueue: SyncMessage[] = []
  private isSyncing = ref(false)
  private version = 0
  private peerId: string
  private listeners = new Map<string, Set<(data: any, oldValue?: any) => void>>()
  
  constructor(
    private config: SyncConfig = {},
    private logger?: Logger
  ) {
    this.peerId = config.id || this.generatePeerId()
    
    this.syncStatus = ref({
      connected: false,
      syncing: false,
      lastSync: 0,
      peers: 0,
      errors: 0,
      latency: 0
    })
    
    this.initialize()
  }
  
  /**
   * 初始化传输层
   */
  private async initialize(): Promise<void> {
    const transports = this.config.transports || ['broadcast']
    
    for (const type of transports) {
      try {
        const transport = await this.createTransport(type)
        if (transport) {
          this.transports.set(type, transport)
          await this.setupTransport(transport)
        }
      } catch (error) {
        this.logger?.error(`Failed to initialize ${type} transport`, error)
      }
    }
  }
  
  /**
   * 创建传输实例
   */
  private async createTransport(type: TransportType): Promise<Transport | null> {
    switch (type) {
      case 'broadcast':
        return new BroadcastTransport('ldesign-sync', this.logger)
        
      case 'websocket':
        // 需要配置 WebSocket URL
        if (!this.config.websocketUrl) {
          this.logger?.warn('WebSocket URL not configured')
          return null
        }
        return new WebSocketTransport(this.config.websocketUrl, {
          reconnectDelay: this.config.reconnectDelay,
          maxReconnectAttempts: this.config.maxReconnectAttempts,
          heartbeatInterval: this.config.heartbeatInterval
        }, this.logger)
        
      case 'webrtc':
        // 需要配置信令服务器
        if (!this.config.signalingServer) {
          this.logger?.warn('Signaling server not configured')
          return null
        }
        return new WebRTCTransport({
          signalingServer: this.config.signalingServer,
          iceServers: this.config.iceServers,
          roomId: this.config.roomId
        }, this.logger)
        
      default:
        this.logger?.warn(`Unknown transport type: ${type}`)
        return null
    }
  }
  
  /**
   * 设置传输层
   */
  private async setupTransport(transport: Transport): Promise<void> {
    // 连接传输层
    await transport.connect()
    
    // 监听消息
    transport.onMessage((message) => {
      this.handleRemoteMessage(message)
    })
    
    // 更新连接状态
    this.updateConnectionStatus()
  }
  
  /**
   * 设置状态值
   */
  async set(key: string, value: any): Promise<void> {
    const oldValue = this.localState[key]
    this.localState[key] = value
    this.version++
    
    // 广播变更
    const message: SyncMessage = {
      id: this.generateMessageId(),
      type: 'state',
      source: this.peerId,
      timestamp: Date.now(),
      data: { key, value, oldValue },
      version: this.version
    }
    
    await this.broadcast(message)
    
    // 触发监听器
    this.notifyListeners(key, value, oldValue)
  }
  
  /**
   * 获取状态值
   */
  get<T = any>(key: string): T | undefined {
    // 优先返回本地状态，如果没有则返回远程状态
    return this.localState[key] ?? this.remoteState[key]
  }
  
  /**
   * 批量更新状态
   */
  async batch(updates: Record<string, any>): Promise<void> {
    const changes: Array<{ key: string; value: any; oldValue: any }> = []
    
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this.localState[key]
      this.localState[key] = value
      changes.push({ key, value, oldValue })
    }
    
    this.version++
    
    // 广播批量变更
    const message: SyncMessage = {
      id: this.generateMessageId(),
      type: 'patch',
      source: this.peerId,
      timestamp: Date.now(),
      data: changes,
      version: this.version
    }
    
    await this.broadcast(message)
    
    // 触发监听器
    for (const { key, value, oldValue } of changes) {
      this.notifyListeners(key, value, oldValue)
    }
  }
  
  /**
   * 监听状态变化
   */
  watch(key: string, callback: (value: any, oldValue: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    
    this.listeners.get(key)!.add(callback)
    
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.listeners.delete(key)
        }
      }
    }
  }
  
  /**
   * 全量同步
   */
  async sync(): Promise<void> {
    if (this.isSyncing.value) {
      this.logger?.debug('Sync already in progress')
      return
    }
    
    this.isSyncing.value = true
    this.syncStatus.value.syncing = true
    
    try {
      // 发送同步请求
      const message: SyncMessage = {
        id: this.generateMessageId(),
        type: 'sync',
        source: this.peerId,
        timestamp: Date.now(),
        data: this.localState,
        version: this.version
      }
      
      await this.broadcast(message)
      
      this.syncStatus.value.lastSync = Date.now()
    } finally {
      this.isSyncing.value = false
      this.syncStatus.value.syncing = false
    }
  }
  
  /**
   * 广播消息
   */
  private async broadcast(message: SyncMessage): Promise<void> {
    const promises: Promise<void>[] = []
    
    for (const transport of this.transports.values()) {
      if (transport.isConnected()) {
        promises.push(
          transport.send(message).catch(error => {
            this.logger?.error('Failed to send message', error)
            this.syncStatus.value.errors++
          })
        )
      }
    }
    
    await Promise.all(promises)
  }
  
  /**
   * 处理远程消息
   */
  private handleRemoteMessage(message: SyncMessage): void {
    // 忽略自己的消息
    if (message.source === this.peerId) {
      return
    }
    
    const startTime = Date.now()
    
    switch (message.type) {
      case 'state':
        this.handleStateUpdate(message)
        break
        
      case 'patch':
        this.handlePatchUpdate(message)
        break
        
      case 'sync':
        this.handleSyncRequest(message)
        break
        
      case 'ack':
        this.handleAck(message)
        break
        
      case 'heartbeat':
        // 更新延迟
        this.syncStatus.value.latency = Date.now() - message.timestamp
        break
    }
    
    this.logger?.debug('Message processed', {
      type: message.type,
      source: message.source,
      duration: Date.now() - startTime
    })
  }
  
  /**
   * 处理状态更新
   */
  private handleStateUpdate(message: SyncMessage): void {
    const { key, value, oldValue } = message.data
    
    // 应用冲突解决策略
    const resolvedValue = this.resolveConflict(
      key,
      this.localState[key],
      value,
      message
    )
    
    if (resolvedValue !== this.localState[key]) {
      this.remoteState[key] = resolvedValue
      this.notifyListeners(key, resolvedValue, oldValue)
    }
  }
  
  /**
   * 处理批量更新
   */
  private handlePatchUpdate(message: SyncMessage): void {
    const changes = message.data as Array<{ key: string; value: any; oldValue: any }>
    
    for (const { key, value, oldValue } of changes) {
      const resolvedValue = this.resolveConflict(
        key,
        this.localState[key],
        value,
        message
      )
      
      if (resolvedValue !== this.localState[key]) {
        this.remoteState[key] = resolvedValue
        this.notifyListeners(key, resolvedValue, oldValue)
      }
    }
  }
  
  /**
   * 处理同步请求
   */
  private handleSyncRequest(message: SyncMessage): void {
    const remoteState = message.data
    
    // 合并远程状态
    for (const [key, value] of Object.entries(remoteState)) {
      const resolvedValue = this.resolveConflict(
        key,
        this.localState[key],
        value,
        message
      )
      
      if (resolvedValue !== this.localState[key]) {
        this.remoteState[key] = resolvedValue
        this.notifyListeners(key, resolvedValue, this.localState[key])
      }
    }
    
    // 发送确认
    this.sendAck(message.id, message.source)
  }
  
  /**
   * 处理确认消息
   */
  private handleAck(message: SyncMessage): void {
    this.logger?.debug('Received ack', {
      from: message.source,
      for: message.data.messageId
    })
  }
  
  /**
   * 解决冲突
   */
  private resolveConflict(
    key: string,
    localValue: any,
    remoteValue: any,
    message: SyncMessage
  ): any {
    // 如果本地没有值，直接使用远程值
    if (localValue === undefined) {
      return remoteValue
    }
    
    // 如果配置了自定义冲突解决器
    if (this.config.conflictResolver) {
      return this.config.conflictResolver(localValue, remoteValue)
    }
    
    // 使用配置的策略
    switch (this.config.strategy || 'last-write-wins') {
      case 'last-write-wins':
        // 比较版本号或时间戳
        return message.version! > this.version ? remoteValue : localValue
        
      case 'first-write-wins':
        // 保持第一个写入的值
        return localValue
        
      case 'merge':
        // 尝试合并对象
        if (typeof localValue === 'object' && typeof remoteValue === 'object') {
          return { ...localValue, ...remoteValue }
        }
        return remoteValue
        
      default:
        return remoteValue
    }
  }
  
  /**
   * 发送确认消息
   */
  private async sendAck(messageId: string, target: string): Promise<void> {
    const message: SyncMessage = {
      id: this.generateMessageId(),
      type: 'ack',
      source: this.peerId,
      timestamp: Date.now(),
      data: { messageId, target }
    }
    
    await this.broadcast(message)
  }
  
  /**
   * 通知监听器
   */
  private notifyListeners(key: string, value: any, oldValue: any): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value, oldValue)
        } catch (error) {
          this.logger?.error('Listener error', error)
        }
      })
    }
  }
  
  /**
   * 更新连接状态
   */
  private updateConnectionStatus(): void {
    let connected = false
    let peers = 0
    
    for (const transport of this.transports.values()) {
      if (transport.isConnected()) {
        connected = true
        peers++
      }
    }
    
    this.syncStatus.value.connected = connected
    this.syncStatus.value.peers = peers
  }
  
  /**
   * 生成消息 ID
   */
  private generateMessageId(): string {
    return `${this.peerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 生成对等节点 ID
   */
  private generatePeerId(): string {
    return `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 获取同步状态
   */
  getStatus(): SyncStatus {
    return this.syncStatus.value
  }
  
  /**
   * 获取所有状态
   */
  getState(): Record<string, any> {
    return { ...this.localState, ...this.remoteState }
  }
  
  /**
   * 清空状态
   */
  clear(): void {
    Object.keys(this.localState).forEach(key => delete this.localState[key])
    Object.keys(this.remoteState).forEach(key => delete this.remoteState[key])
    this.version = 0
  }
  
  /**
   * 销毁
   */
  async dispose(): Promise<void> {
    // 断开所有传输
    for (const transport of this.transports.values()) {
      await transport.disconnect()
    }
    
    this.transports.clear()
    this.listeners.clear()
    this.syncQueue = []
    this.clear()
  }
}

/**
 * Vue 组合式 API
 */
export function useDistributedSync(
  config?: SyncConfig
): {
  sync: DistributedSync
  state: ComputedRef<Record<string, any>>
  status: Ref<SyncStatus>
  set: (key: string, value: any) => Promise<void>
  get: <T = any>(key: string) => T | undefined
  watch: (key: string, callback: (value: any, oldValue: any) => void) => () => void
} {
  const sync = new DistributedSync(config)
  
  const state = computed(() => sync.getState())
  const status = ref(sync.getStatus())
  
  // 定期更新状态
  const interval = setInterval(() => {
    status.value = sync.getStatus()
  }, 1000)
  
  // 清理
  onUnmounted(() => {
    clearInterval(interval)
    sync.dispose()
  })
  
  return {
    sync,
    state,
    status,
    set: (key, value) => sync.set(key, value),
    get: (key) => sync.get(key),
    watch: (key, callback) => sync.watch(key, callback)
  }
}

/**
 * 创建分布式同步实例
 */
export function createDistributedSync(
  config?: SyncConfig,
  logger?: Logger
): DistributedSync {
  return new DistributedSync(config, logger)
}