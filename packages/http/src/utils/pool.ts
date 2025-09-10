/**
 * 请求池化模块
 * 提供连接池管理和请求复用功能
 */

import type { RequestConfig } from '../types'

/**
 * 连接信息
 */
export interface ConnectionInfo {
  id: string
  host: string
  port: number
  protocol: string
  createdAt: number
  lastUsedAt: number
  useCount: number
  state: 'idle' | 'active' | 'closed'
}

/**
 * 连接池配置
 */
export interface PoolConfig {
  maxConnections?: number // 最大连接数
  maxIdleConnections?: number // 最大空闲连接数
  maxConnectionAge?: number // 连接最大生命周期(ms)
  idleTimeout?: number // 空闲超时时间(ms)
  connectionTimeout?: number // 连接超时时间(ms)
  keepAlive?: boolean // 是否保持连接
  keepAliveTimeout?: number // Keep-Alive超时时间(ms)
  pipelining?: boolean // 是否启用管道化
  maxPipelineLength?: number // 最大管道长度
}

/**
 * 连接池统计
 */
export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  totalRequests: number
  connectionReuse: number
  averageRequestsPerConnection: number
  connectionErrors: number
}

/**
 * 请求连接池
 */
export class RequestPool {
  private connections = new Map<string, ConnectionInfo[]>()
  private activeRequests = new Map<string, Set<string>>()
  private config: Required<PoolConfig>
  private stats = {
    totalRequests: 0,
    connectionReuse: 0,
    connectionErrors: 0,
  }
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: PoolConfig = {}) {
    this.config = {
      maxConnections: 10,
      maxIdleConnections: 5,
      maxConnectionAge: 300000, // 5分钟
      idleTimeout: 60000, // 1分钟
      connectionTimeout: 30000, // 30秒
      keepAlive: true,
      keepAliveTimeout: 60000, // 1分钟
      pipelining: false,
      maxPipelineLength: 10,
      ...config,
    }

    // 启动定期清理
    this.startCleanup()
  }

  /**
   * 获取或创建连接
   */
  async getConnection(config: RequestConfig): Promise<ConnectionInfo> {
    const key = this.getConnectionKey(config)
    let connections = this.connections.get(key) || []

    // 查找可用的空闲连接
    const idleConnection = connections.find(conn => 
      conn.state === 'idle' && 
      this.isConnectionValid(conn)
    )

    if (idleConnection) {
      // 复用现有连接
      this.markConnectionActive(idleConnection)
      this.stats.connectionReuse++
      return idleConnection
    }

    // 检查是否达到最大连接数
    const activeCount = connections.filter(c => c.state === 'active').length
    if (activeCount >= this.config.maxConnections) {
      // 等待连接释放
      return this.waitForConnection(key, config)
    }

    // 创建新连接
    const newConnection = await this.createConnection(config)
    connections.push(newConnection)
    this.connections.set(key, connections)

    return newConnection
  }

  /**
   * 释放连接
   */
  releaseConnection(connection: ConnectionInfo): void {
    const key = `${connection.protocol}//${connection.host}:${connection.port}`
    const connections = this.connections.get(key)

    if (!connections) return

    const conn = connections.find(c => c.id === connection.id)
    if (conn) {
      conn.state = 'idle'
      conn.lastUsedAt = Date.now()
      conn.useCount++

      // 检查是否超过最大空闲连接数
      this.trimIdleConnections(key)
    }

    // 通知等待的请求
    this.notifyWaiters(key)
  }

  /**
   * 创建新连接
   */
  private async createConnection(config: RequestConfig): Promise<ConnectionInfo> {
    const url = new URL(config.url || '')
    const connection: ConnectionInfo = {
      id: this.generateId(),
      host: url.hostname,
      port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      useCount: 1,
      state: 'active',
    }

    this.stats.totalRequests++

    // 设置连接超时
    if (this.config.connectionTimeout > 0) {
      setTimeout(() => {
        if (connection.state === 'active') {
          this.closeConnection(connection)
        }
      }, this.config.connectionTimeout)
    }

    return connection
  }

  /**
   * 等待可用连接
   */
  private async waitForConnection(key: string, config: RequestConfig): Promise<ConnectionInfo> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'))
      }, this.config.connectionTimeout)

      // 添加到等待队列
      const checkConnection = () => {
        const connections = this.connections.get(key) || []
        const idleConnection = connections.find(conn => 
          conn.state === 'idle' && 
          this.isConnectionValid(conn)
        )

        if (idleConnection) {
          clearTimeout(timeout)
          this.markConnectionActive(idleConnection)
          resolve(idleConnection)
        } else {
          // 继续等待
          setTimeout(checkConnection, 100)
        }
      }

      checkConnection()
    })
  }

  /**
   * 标记连接为活跃
   */
  private markConnectionActive(connection: ConnectionInfo): void {
    connection.state = 'active'
    connection.lastUsedAt = Date.now()
  }

  /**
   * 检查连接是否有效
   */
  private isConnectionValid(connection: ConnectionInfo): boolean {
    const now = Date.now()

    // 检查连接年龄
    if (now - connection.createdAt > this.config.maxConnectionAge) {
      return false
    }

    // 检查空闲时间
    if (connection.state === 'idle' && 
        now - connection.lastUsedAt > this.config.idleTimeout) {
      return false
    }

    return connection.state !== 'closed'
  }

  /**
   * 关闭连接
   */
  private closeConnection(connection: ConnectionInfo): void {
    connection.state = 'closed'

    // 从连接池移除
    const key = `${connection.protocol}//${connection.host}:${connection.port}`
    const connections = this.connections.get(key)
    if (connections) {
      const index = connections.findIndex(c => c.id === connection.id)
      if (index !== -1) {
        connections.splice(index, 1)
      }
    }
  }

  /**
   * 修剪空闲连接
   */
  private trimIdleConnections(key: string): void {
    const connections = this.connections.get(key)
    if (!connections) return

    const idleConnections = connections.filter(c => c.state === 'idle')
    
    if (idleConnections.length > this.config.maxIdleConnections) {
      // 按最后使用时间排序，关闭最旧的连接
      idleConnections.sort((a, b) => a.lastUsedAt - b.lastUsedAt)
      
      const toClose = idleConnections.slice(0, 
        idleConnections.length - this.config.maxIdleConnections
      )
      
      for (const conn of toClose) {
        this.closeConnection(conn)
      }
    }
  }

  /**
   * 通知等待者
   */
  private notifyWaiters(key: string): void {
    // 这里可以实现等待队列的通知机制
    // 当前简化实现，依赖轮询
  }

  /**
   * 获取连接键值
   */
  private getConnectionKey(config: RequestConfig): string {
    const url = new URL(config.url || '')
    return `${url.protocol}//${url.hostname}:${url.port || (url.protocol === 'https:' ? 443 : 80)}`
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()

      for (const [key, connections] of this.connections.entries()) {
        // 清理无效连接
        const validConnections = connections.filter(conn => {
          if (!this.isConnectionValid(conn)) {
            this.closeConnection(conn)
            return false
          }
          return true
        })

        if (validConnections.length === 0) {
          this.connections.delete(key)
        } else {
          this.connections.set(key, validConnections)
        }
      }
    }, 10000) // 每10秒清理一次
  }

  /**
   * 获取统计信息
   */
  getStats(): PoolStats {
    let totalConnections = 0
    let activeConnections = 0
    let idleConnections = 0

    for (const connections of this.connections.values()) {
      totalConnections += connections.length
      activeConnections += connections.filter(c => c.state === 'active').length
      idleConnections += connections.filter(c => c.state === 'idle').length
    }

    const avgRequestsPerConnection = totalConnections > 0
      ? this.stats.totalRequests / totalConnections
      : 0

    return {
      totalConnections,
      activeConnections,
      idleConnections,
      totalRequests: this.stats.totalRequests,
      connectionReuse: this.stats.connectionReuse,
      averageRequestsPerConnection: avgRequestsPerConnection,
      connectionErrors: this.stats.connectionErrors,
    }
  }

  /**
   * 获取连接详情
   */
  getConnectionDetails(): Map<string, ConnectionInfo[]> {
    return new Map(this.connections)
  }

  /**
   * 关闭所有连接
   */
  closeAll(): void {
    for (const connections of this.connections.values()) {
      for (const conn of connections) {
        this.closeConnection(conn)
      }
    }
    this.connections.clear()
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁连接池
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.closeAll()
  }
}

/**
 * 创建请求池
 */
export function createRequestPool(config?: PoolConfig): RequestPool {
  return new RequestPool(config)
}

/**
 * 默认连接池实例
 */
export const defaultPool = createRequestPool()
