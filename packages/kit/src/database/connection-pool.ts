/**
 * 数据库连接池
 * 提供数据库连接的池化管理功能
 */

import type { DatabaseConnection } from '../types'
import { EventEmitter } from 'node:events'
import { DatabaseError } from '../types'

/**
 * 连接池类
 */
export class ConnectionPool extends EventEmitter {
  private connections: PooledConnection[] = []
  private waitingQueue: Array<{
    resolve: (connection: PooledConnection) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }> = []

  private options: Required<ConnectionPoolOptions>
  private isDestroyed = false

  constructor(options: ConnectionPoolOptions) {
    super()

    this.options = {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      ...options,
    }

    this.startReaper()
  }

  /**
   * 获取连接
   */
  async acquire(): Promise<PooledConnection> {
    if (this.isDestroyed) {
      throw new DatabaseError('Connection pool has been destroyed')
    }

    // 查找可用连接
    const availableConnection = this.connections.find(conn => !conn.inUse)
    if (availableConnection) {
      availableConnection.inUse = true
      availableConnection.lastUsed = new Date()
      this.emit('acquire', availableConnection)
      return availableConnection
    }

    // 如果可以创建新连接
    if (this.connections.length < this.options.max) {
      try {
        const connection = await this.createConnection()
        this.emit('acquire', connection)
        return connection
      }
      catch (error) {
        this.emit('createError', error)
        throw error
      }
    }

    // 等待连接释放
    return this.waitForConnection()
  }

  /**
   * 释放连接
   */
  release(connection: PooledConnection): void {
    const pooledConnection = this.connections.find(conn => conn.id === connection.id)
    if (!pooledConnection) {
      return
    }

    pooledConnection.inUse = false
    pooledConnection.lastUsed = new Date()

    this.emit('release', pooledConnection)

    // 处理等待队列
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!
      clearTimeout(waiter.timeout)

      pooledConnection.inUse = true
      waiter.resolve(pooledConnection)
    }
  }

  /**
   * 销毁连接
   */
  async destroy(connection: PooledConnection): Promise<void> {
    const index = this.connections.findIndex(conn => conn.id === connection.id)
    if (index === -1) {
      return
    }

    this.connections.splice(index, 1)

    try {
      await connection.connection.disconnect()
      this.emit('destroy', connection)
    }
    catch (error) {
      this.emit('destroyError', { connection, error })
    }
  }

  /**
   * 销毁连接池
   */
  async destroyPool(): Promise<void> {
    this.isDestroyed = true

    // 清空等待队列
    for (const waiter of this.waitingQueue) {
      clearTimeout(waiter.timeout)
      waiter.reject(new DatabaseError('Connection pool destroyed'))
    }
    this.waitingQueue = []

    // 销毁所有连接
    const destroyPromises = this.connections.map(conn => this.destroy(conn))
    await Promise.all(destroyPromises)

    this.emit('destroy')
  }

  /**
   * 创建新连接
   */
  private async createConnection(): Promise<PooledConnection> {
    const connectionId = this.generateConnectionId()

    try {
      const connection = await this.options.create()

      const pooledConnection: PooledConnection = {
        id: connectionId,
        connection,
        inUse: true,
        created: new Date(),
        lastUsed: new Date(),
      }

      this.connections.push(pooledConnection)
      this.emit('create', pooledConnection)

      return pooledConnection
    }
    catch (error) {
      throw new DatabaseError(`Failed to create connection: ${connectionId}`, error as Error)
    }
  }

  /**
   * 等待连接可用
   */
  private waitForConnection(): Promise<PooledConnection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(w => w.resolve === resolve)
        if (index !== -1) {
          this.waitingQueue.splice(index, 1)
        }
        reject(new DatabaseError('Acquire timeout'))
      }, this.options.acquireTimeoutMillis)

      this.waitingQueue.push({ resolve, reject, timeout })
    })
  }

  /**
   * 启动连接回收器
   */
  private startReaper(): void {
    const reaper = setInterval(() => {
      if (this.isDestroyed) {
        clearInterval(reaper)
        return
      }

      this.reapIdleConnections()
      this.ensureMinConnections()
    }, this.options.reapIntervalMillis)
  }

  /**
   * 回收空闲连接
   */
  private reapIdleConnections(): void {
    const now = Date.now()
    const idleConnections = this.connections.filter(
      conn =>
        !conn.inUse
        && now - conn.lastUsed.getTime() > this.options.idleTimeoutMillis
        && this.connections.length > this.options.min,
    )

    for (const connection of idleConnections) {
      this.destroy(connection).catch((error) => {
        this.emit('reapError', { connection, error })
      })
    }
  }

  /**
   * 确保最小连接数
   */
  private ensureMinConnections(): void {
    const availableConnections = this.connections.filter(conn => !conn.inUse).length
    const neededConnections = this.options.min - availableConnections

    for (let i = 0; i < neededConnections && this.connections.length < this.options.max; i++) {
      this.createConnection().catch((error) => {
        this.emit('ensureMinError', error)
      })
    }
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取连接池统计信息
   */
  getStats(): PoolStats {
    const totalConnections = this.connections.length
    const inUseConnections = this.connections.filter(conn => conn.inUse).length
    const idleConnections = totalConnections - inUseConnections
    const waitingRequests = this.waitingQueue.length

    return {
      totalConnections,
      inUseConnections,
      idleConnections,
      waitingRequests,
      minConnections: this.options.min,
      maxConnections: this.options.max,
    }
  }

  /**
   * 检查连接池健康状态
   */
  async healthCheck(): Promise<PoolHealthCheck> {
    const stats = this.getStats()
    const healthyConnections: string[] = []
    const unhealthyConnections: string[] = []

    for (const pooledConnection of this.connections) {
      try {
        await pooledConnection.connection.query('SELECT 1')
        healthyConnections.push(pooledConnection.id)
      }
      catch {
        unhealthyConnections.push(pooledConnection.id)
      }
    }

    const isHealthy
      = unhealthyConnections.length === 0 && stats.totalConnections >= this.options.min

    return {
      isHealthy,
      stats,
      healthyConnections,
      unhealthyConnections,
    }
  }

  /**
   * 使用连接执行操作
   */
  async use<T>(operation: (connection: DatabaseConnection) => Promise<T>): Promise<T> {
    const pooledConnection = await this.acquire()

    try {
      return await operation(pooledConnection.connection)
    }
    finally {
      this.release(pooledConnection)
    }
  }

  /**
   * 创建连接池实例
   */
  static create(options: ConnectionPoolOptions): ConnectionPool {
    return new ConnectionPool(options)
  }
}

/**
 * 简单连接池实现
 */
export class SimpleConnectionPool {
  private connections: DatabaseConnection[] = []
  private available: boolean[] = []
  private maxSize: number

  constructor(maxSize = 10) {
    this.maxSize = maxSize
  }

  /**
   * 添加连接到池
   */
  addConnection(connection: DatabaseConnection): void {
    if (this.connections.length < this.maxSize) {
      this.connections.push(connection)
      this.available.push(true)
    }
  }

  /**
   * 获取连接
   */
  async getConnection(): Promise<DatabaseConnection | null> {
    const index = this.available.findIndex(available => available)
    if (index !== -1) {
      this.available[index] = false
      return this.connections[index] || null
    }
    return null
  }

  /**
   * 释放连接
   */
  releaseConnection(connection: DatabaseConnection): void {
    const index = this.connections.indexOf(connection)
    if (index !== -1) {
      this.available[index] = true
    }
  }

  /**
   * 获取池大小
   */
  getSize(): number {
    return this.connections.length
  }

  /**
   * 获取可用连接数
   */
  getAvailableCount(): number {
    return this.available.filter(Boolean).length
  }

  /**
   * 关闭所有连接
   */
  async closeAll(): Promise<void> {
    const promises = this.connections.map(conn => conn.disconnect())
    await Promise.all(promises)
    this.connections = []
    this.available = []
  }
}

// 类型定义
interface ConnectionPoolOptions {
  min?: number
  max?: number
  acquireTimeoutMillis?: number
  createTimeoutMillis?: number
  destroyTimeoutMillis?: number
  idleTimeoutMillis?: number
  reapIntervalMillis?: number
  createRetryIntervalMillis?: number
  create: () => Promise<DatabaseConnection>
}

interface PooledConnection {
  id: string
  connection: DatabaseConnection
  inUse: boolean
  created: Date
  lastUsed: Date
}

interface PoolStats {
  totalConnections: number
  inUseConnections: number
  idleConnections: number
  waitingRequests: number
  minConnections: number
  maxConnections: number
}

interface PoolHealthCheck {
  isHealthy: boolean
  stats: PoolStats
  healthyConnections: string[]
  unhealthyConnections: string[]
}
