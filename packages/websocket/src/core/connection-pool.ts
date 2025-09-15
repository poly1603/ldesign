/**
 * WebSocket 连接池管理器
 * 
 * 提供连接池功能，支持连接复用、负载均衡和健康检查
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { WebSocketClient } from './websocket-client'
import { WebSocketEventEmitter } from './event-emitter'
import {
  ConnectionPoolConfig,
  ConnectionPoolEventMap,
  PoolStats,
  ConnectionReuseStrategy,
  LoadBalanceStrategy,
  WebSocketClientConfig,
  WebSocketState
} from '@/types'
import { generateUUID, delay, now } from '@/utils'

/** 连接池中的连接信息 */
interface PooledConnection {
  /** 连接 ID */
  id: string
  /** WebSocket 客户端实例 */
  client: WebSocketClient
  /** 连接配置 */
  config: WebSocketClientConfig
  /** 创建时间 */
  createdAt: number
  /** 最后使用时间 */
  lastUsedAt: number
  /** 使用次数 */
  useCount: number
  /** 是否正在使用 */
  inUse: boolean
  /** 权重（用于加权负载均衡） */
  weight: number
}

/** 默认连接池配置 */
const DEFAULT_POOL_CONFIG: ConnectionPoolConfig = {
  maxConnections: 10,
  minConnections: 2,
  idleTimeout: 300000, // 5 分钟
  acquireTimeout: 10000, // 10 秒
  validateConnections: true,
  validationInterval: 60000, // 1 分钟
  reuseStrategy: ConnectionReuseStrategy.BY_URL,
  loadBalanceStrategy: LoadBalanceStrategy.ROUND_ROBIN,
  healthCheckInterval: 30000, // 30 秒
  enableWarmup: true,
  warmupConnections: 2
}

/**
 * WebSocket 连接池管理器
 * 
 * 提供连接池功能，包括：
 * - 连接复用和管理
 * - 负载均衡
 * - 健康检查
 * - 连接预热
 * - 统计信息
 * 
 * @example
 * ```typescript
 * const pool = new ConnectionPool({
 *   maxConnections: 20,
 *   reuseStrategy: ConnectionReuseStrategy.SMART
 * })
 * 
 * const client = await pool.acquire({
 *   url: 'ws://localhost:8080'
 * })
 * 
 * // 使用客户端...
 * 
 * pool.release(client)
 * ```
 */
export class ConnectionPool extends WebSocketEventEmitter<ConnectionPoolEventMap> {
  /** 连接池配置 */
  private readonly config: ConnectionPoolConfig

  /** 连接池 */
  private readonly connections = new Map<string, PooledConnection>()

  /** URL 到连接的映射（用于连接重用） */
  private readonly urlConnections = new Map<string, Set<string>>()

  /** 轮询计数器 */
  private roundRobinCounter = 0

  /** 统计信息 */
  private stats: PoolStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    connectingConnections: 0,
    failedConnections: 0,
    hitRate: 0,
    averageConnectionTime: 0,
    totalRequests: 0,
    successfulRequests: 0
  }

  /** 健康检查定时器 */
  private healthCheckTimer?: NodeJS.Timeout

  /** 连接验证定时器 */
  private validationTimer?: NodeJS.Timeout

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 创建连接池实例
   * 
   * @param config 连接池配置
   */
  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    super()

    this.config = { ...DEFAULT_POOL_CONFIG, ...config }

    // 验证配置
    this.validateConfig()

    // 启动健康检查
    if (this.config.healthCheckInterval > 0) {
      this.startHealthCheck()
    }

    // 启动连接验证
    if (this.config.validateConnections && this.config.validationInterval > 0) {
      this.startValidation()
    }

    // 预热连接
    if (this.config.enableWarmup && this.config.warmupConnections > 0) {
      this.warmupConnections()
    }
  }

  /**
   * 获取连接
   * 
   * @param config WebSocket 客户端配置
   * @returns WebSocket 客户端实例
   */
  async acquire(config: WebSocketClientConfig): Promise<WebSocketClient> {
    if (this.destroyed) {
      throw new Error('连接池已销毁')
    }

    this.stats.totalRequests++

    try {
      // 尝试重用现有连接
      const reusedConnection = this.findReusableConnection(config)
      if (reusedConnection) {
        this.stats.successfulRequests++
        this.updateHitRate()
        return this.reuseConnection(reusedConnection, config)
      }

      // 创建新连接
      const connection = await this.createConnection(config)
      this.stats.successfulRequests++
      this.updateHitRate()

      return connection.client
    } catch (error) {
      this.stats.failedConnections++
      throw error
    }
  }

  /**
   * 释放连接
   * 
   * @param client WebSocket 客户端实例
   */
  release(client: WebSocketClient): void {
    const connection = this.findConnectionByClient(client)
    if (!connection) {
      return
    }

    connection.inUse = false
    connection.lastUsedAt = now()

    this.updateStats()
  }

  /**
   * 销毁连接
   * 
   * @param client WebSocket 客户端实例
   */
  destroy(client: WebSocketClient): void {
    const connection = this.findConnectionByClient(client)
    if (!connection) {
      return
    }

    this.removeConnection(connection.id, '手动销毁')
  }

  /**
   * 获取连接池统计信息
   * 
   * @returns 统计信息
   */
  getStats(): PoolStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 获取连接池配置
   * 
   * @returns 配置信息
   */
  getConfig(): ConnectionPoolConfig {
    return { ...this.config }
  }

  /**
   * 清空连接池
   */
  clear(): void {
    const connectionIds = Array.from(this.connections.keys())
    for (const id of connectionIds) {
      this.removeConnection(id, '清空连接池')
    }
  }

  /**
   * 销毁连接池
   */
  destroyPool(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    // 停止定时器
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }
    if (this.validationTimer) {
      clearInterval(this.validationTimer)
    }

    // 清空连接池
    this.clear()

    // 清除事件监听器
    this.removeAllListeners()
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (this.config.maxConnections <= 0) {
      throw new Error('最大连接数必须大于 0')
    }

    if (this.config.minConnections < 0) {
      throw new Error('最小连接数不能小于 0')
    }

    if (this.config.minConnections > this.config.maxConnections) {
      throw new Error('最小连接数不能大于最大连接数')
    }

    if (this.config.idleTimeout <= 0) {
      throw new Error('空闲超时时间必须大于 0')
    }

    if (this.config.acquireTimeout <= 0) {
      throw new Error('获取连接超时时间必须大于 0')
    }
  }

  /**
   * 查找可重用的连接
   *
   * @param config WebSocket 客户端配置
   * @returns 可重用的连接或 null
   */
  private findReusableConnection(config: WebSocketClientConfig): PooledConnection | null {
    switch (this.config.reuseStrategy) {
      case ConnectionReuseStrategy.NONE:
        return null

      case ConnectionReuseStrategy.BY_URL:
        return this.findConnectionByUrl(config.url)

      case ConnectionReuseStrategy.BY_CONFIG:
        return this.findConnectionByConfig(config)

      case ConnectionReuseStrategy.SMART:
        return this.findConnectionSmart(config)

      default:
        return null
    }
  }

  /**
   * 按 URL 查找连接
   *
   * @param url WebSocket URL
   * @returns 连接或 null
   */
  private findConnectionByUrl(url: string): PooledConnection | null {
    const connectionIds = this.urlConnections.get(url)
    if (!connectionIds || connectionIds.size === 0) {
      return null
    }

    // 使用负载均衡策略选择连接
    const availableConnections = Array.from(connectionIds)
      .map(id => this.connections.get(id))
      .filter((conn): conn is PooledConnection =>
        conn !== undefined &&
        !conn.inUse &&
        conn.client.isConnected()
      )

    if (availableConnections.length === 0) {
      return null
    }

    return this.selectConnectionByLoadBalance(availableConnections)
  }

  /**
   * 按配置查找连接
   *
   * @param config WebSocket 客户端配置
   * @returns 连接或 null
   */
  private findConnectionByConfig(config: WebSocketClientConfig): PooledConnection | null {
    for (const connection of this.connections.values()) {
      if (
        !connection.inUse &&
        connection.client.isConnected() &&
        this.isConfigMatched(connection.config, config)
      ) {
        return connection
      }
    }
    return null
  }

  /**
   * 智能查找连接
   *
   * @param config WebSocket 客户端配置
   * @returns 连接或 null
   */
  private findConnectionSmart(config: WebSocketClientConfig): PooledConnection | null {
    // 首先尝试按 URL 查找
    let connection = this.findConnectionByUrl(config.url)
    if (connection) {
      return connection
    }

    // 然后尝试按配置查找
    connection = this.findConnectionByConfig(config)
    if (connection) {
      return connection
    }

    return null
  }

  /**
   * 使用负载均衡策略选择连接
   *
   * @param connections 可用连接列表
   * @returns 选中的连接
   */
  private selectConnectionByLoadBalance(connections: PooledConnection[]): PooledConnection {
    switch (this.config.loadBalanceStrategy) {
      case LoadBalanceStrategy.ROUND_ROBIN:
        return this.selectRoundRobin(connections)

      case LoadBalanceStrategy.LEAST_CONNECTIONS:
        return this.selectLeastConnections(connections)

      case LoadBalanceStrategy.RANDOM:
        return this.selectRandom(connections)

      case LoadBalanceStrategy.WEIGHTED_ROUND_ROBIN:
        return this.selectWeightedRoundRobin(connections)

      default:
        return connections[0]
    }
  }

  /**
   * 轮询选择连接
   *
   * @param connections 可用连接列表
   * @returns 选中的连接
   */
  private selectRoundRobin(connections: PooledConnection[]): PooledConnection {
    const index = this.roundRobinCounter % connections.length
    this.roundRobinCounter++
    return connections[index]
  }

  /**
   * 选择最少连接的连接
   *
   * @param connections 可用连接列表
   * @returns 选中的连接
   */
  private selectLeastConnections(connections: PooledConnection[]): PooledConnection {
    return connections.reduce((min, current) =>
      current.useCount < min.useCount ? current : min
    )
  }

  /**
   * 随机选择连接
   *
   * @param connections 可用连接列表
   * @returns 选中的连接
   */
  private selectRandom(connections: PooledConnection[]): PooledConnection {
    const index = Math.floor(Math.random() * connections.length)
    return connections[index]
  }

  /**
   * 加权轮询选择连接
   *
   * @param connections 可用连接列表
   * @returns 选中的连接
   */
  private selectWeightedRoundRobin(connections: PooledConnection[]): PooledConnection {
    const totalWeight = connections.reduce((sum, conn) => sum + conn.weight, 0)
    let random = Math.random() * totalWeight

    for (const connection of connections) {
      random -= connection.weight
      if (random <= 0) {
        return connection
      }
    }

    return connections[0]
  }

  /**
   * 重用连接
   *
   * @param connection 连接信息
   * @param config WebSocket 客户端配置
   * @returns WebSocket 客户端实例
   */
  private reuseConnection(connection: PooledConnection, config: WebSocketClientConfig): WebSocketClient {
    connection.inUse = true
    connection.lastUsedAt = now()
    connection.useCount++

    this.emit('connectionReused', {
      connectionId: connection.id,
      url: config.url
    })

    return connection.client
  }

  /**
   * 创建新连接
   *
   * @param config WebSocket 客户端配置
   * @returns 连接信息
   */
  private async createConnection(config: WebSocketClientConfig): Promise<PooledConnection> {
    // 检查连接池是否已满
    if (this.connections.size >= this.config.maxConnections) {
      // 尝试清理空闲连接
      this.cleanupIdleConnections()

      if (this.connections.size >= this.config.maxConnections) {
        this.emit('poolFull', { maxConnections: this.config.maxConnections })
        throw new Error(`连接池已满，最大连接数: ${this.config.maxConnections}`)
      }
    }

    const connectionId = generateUUID()
    const client = new WebSocketClient(config)

    const connection: PooledConnection = {
      id: connectionId,
      client,
      config,
      createdAt: now(),
      lastUsedAt: now(),
      useCount: 1,
      inUse: true,
      weight: 1
    }

    try {
      // 连接到 WebSocket 服务器
      await client.connect()

      // 添加到连接池
      this.connections.set(connectionId, connection)

      // 添加到 URL 映射
      const urlConnections = this.urlConnections.get(config.url) || new Set()
      urlConnections.add(connectionId)
      this.urlConnections.set(config.url, urlConnections)

      // 监听连接事件
      this.setupConnectionListeners(connection)

      this.emit('connectionCreated', {
        connectionId,
        url: config.url
      })

      this.updateStats()

      return connection
    } catch (error) {
      // 连接失败，清理资源
      client.destroy()
      throw error
    }
  }

  /**
   * 设置连接事件监听器
   *
   * @param connection 连接信息
   */
  private setupConnectionListeners(connection: PooledConnection): void {
    const { client } = connection

    // 监听连接关闭事件
    client.on('connectionClosed', () => {
      this.removeConnection(connection.id, '连接关闭')
    })

    // 监听连接错误事件
    client.on('connectionError', () => {
      this.removeConnection(connection.id, '连接错误')
    })
  }

  /**
   * 移除连接
   *
   * @param connectionId 连接 ID
   * @param reason 移除原因
   */
  private removeConnection(connectionId: string, reason: string): void {
    const connection = this.connections.get(connectionId)
    if (!connection) {
      return
    }

    // 从连接池中移除
    this.connections.delete(connectionId)

    // 从 URL 映射中移除
    const urlConnections = this.urlConnections.get(connection.config.url)
    if (urlConnections) {
      urlConnections.delete(connectionId)
      if (urlConnections.size === 0) {
        this.urlConnections.delete(connection.config.url)
      }
    }

    // 销毁客户端
    connection.client.destroy()

    this.emit('connectionDestroyed', {
      connectionId,
      reason
    })

    this.updateStats()
  }

  /**
   * 查找连接通过客户端实例
   *
   * @param client WebSocket 客户端实例
   * @returns 连接信息或 undefined
   */
  private findConnectionByClient(client: WebSocketClient): PooledConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.client === client) {
        return connection
      }
    }
    return undefined
  }

  /**
   * 检查配置是否匹配
   *
   * @param config1 配置1
   * @param config2 配置2
   * @returns 是否匹配
   */
  private isConfigMatched(config1: WebSocketClientConfig, config2: WebSocketClientConfig): boolean {
    return (
      config1.url === config2.url &&
      JSON.stringify(config1.protocols) === JSON.stringify(config2.protocols) &&
      config1.connectionTimeout === config2.connectionTimeout
    )
  }

  /**
   * 清理空闲连接
   */
  private cleanupIdleConnections(): void {
    const now = Date.now()
    const connectionsToRemove: string[] = []

    for (const [id, connection] of this.connections) {
      if (
        !connection.inUse &&
        now - connection.lastUsedAt > this.config.idleTimeout
      ) {
        connectionsToRemove.push(id)
      }
    }

    for (const id of connectionsToRemove) {
      this.removeConnection(id, '空闲超时')
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    let activeConnections = 0
    let idleConnections = 0
    let connectingConnections = 0

    for (const connection of this.connections.values()) {
      const state = connection.client.getState()

      if (connection.inUse) {
        activeConnections++
      } else if (state === WebSocketState.CONNECTED) {
        idleConnections++
      } else if (state === WebSocketState.CONNECTING) {
        connectingConnections++
      }
    }

    this.stats.totalConnections = this.connections.size
    this.stats.activeConnections = activeConnections
    this.stats.idleConnections = idleConnections
    this.stats.connectingConnections = connectingConnections
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.successfulRequests / this.stats.totalRequests
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  /**
   * 执行健康检查
   */
  private performHealthCheck(): void {
    let healthy = 0
    let unhealthy = 0

    for (const connection of this.connections.values()) {
      if (connection.client.isConnected()) {
        healthy++
      } else {
        unhealthy++
        // 移除不健康的连接
        this.removeConnection(connection.id, '健康检查失败')
      }
    }

    this.emit('healthCheck', { healthy, unhealthy })
  }

  /**
   * 启动连接验证
   */
  private startValidation(): void {
    this.validationTimer = setInterval(() => {
      this.validateConnections()
    }, this.config.validationInterval)
  }

  /**
   * 验证连接
   */
  private validateConnections(): void {
    for (const connection of this.connections.values()) {
      // 检查连接是否仍然有效
      if (!connection.client.isConnected()) {
        this.removeConnection(connection.id, '连接验证失败')
      }
    }
  }

  /**
   * 预热连接
   */
  private async warmupConnections(): Promise<void> {
    // 这里可以根据需要预创建一些连接
    // 由于需要具体的配置，这里只是一个占位符
    // 实际使用时可以通过配置指定预热的连接配置
  }
}
