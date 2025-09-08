/**
 * 数据库管理器
 * 提供数据库连接管理和基础操作功能
 */

import type { DatabaseConfig, DatabaseConnection, QueryResult } from '../types'
import { EventEmitter } from 'node:events'
import { DatabaseError } from '../types'
import { AsyncUtils } from '../utils'

/**
 * 数据库管理器类
 */
export class DatabaseManager extends EventEmitter {
  private connections: Map<string, DatabaseConnection> = new Map()
  private defaultConnection: string | null = null

  constructor(_config: DatabaseConfig) {
    super()
  }

  /**
   * 添加数据库连接
   * @param name 连接名称
   * @param connectionConfig 连接配置
   */
  async addConnection(name: string, connectionConfig: ConnectionConfig): Promise<void> {
    try {
      const connection = await this.createConnection(connectionConfig)
      this.connections.set(name, connection)

      if (!this.defaultConnection) {
        this.defaultConnection = name
      }

      this.emit('connectionAdded', { name, config: connectionConfig })
    }
    catch (error) {
      throw new DatabaseError(`Failed to add connection: ${name}`, error as Error)
    }
  }

  /**
   * 创建数据库连接
   */
  private async createConnection(config: ConnectionConfig): Promise<DatabaseConnection> {
    const { type, host, port, database, username } = config

    // 这里是一个简化的实现，实际应该根据数据库类型创建相应的连接
    const connection: DatabaseConnection = {
      type,
      host,
      port,
      database,
      username,
      connected: false,
      lastActivity: new Date(),

      async connect() {
        // 模拟连接逻辑
        await AsyncUtils.delay(100)
        this.connected = true
        this.lastActivity = new Date()
      },

      async disconnect() {
        this.connected = false
      },

      async query(_sql: string, _params?: any[]): Promise<QueryResult> {
        if (!this.connected) {
          throw new DatabaseError('Connection not established')
        }

        this.lastActivity = new Date()

        // 模拟查询执行
        await AsyncUtils.delay(10)

        return {
          rows: [],
          rowCount: 0,
          fields: [],
          duration: 10,
        }
      },

      async beginTransaction() {
        if (!this.connected) {
          throw new DatabaseError('Connection not established')
        }
        return this.query('BEGIN')
      },

      async commit() {
        if (!this.connected) {
          throw new DatabaseError('Connection not established')
        }
        return this.query('COMMIT')
      },

      async rollback() {
        if (!this.connected) {
          throw new DatabaseError('Connection not established')
        }
        return this.query('ROLLBACK')
      },
    }

    await connection.connect()
    return connection
  }

  /**
   * 获取连接
   * @param name 连接名称
   */
  getConnection(name?: string): DatabaseConnection {
    const connectionName = name || this.defaultConnection
    if (!connectionName) {
      throw new DatabaseError('No default connection available')
    }

    const connection = this.connections.get(connectionName)
    if (!connection) {
      throw new DatabaseError(`Connection not found: ${connectionName}`)
    }

    return connection
  }

  /**
   * 移除连接
   * @param name 连接名称
   */
  async removeConnection(name: string): Promise<void> {
    const connection = this.connections.get(name)
    if (connection) {
      await connection.disconnect()
      this.connections.delete(name)

      if (this.defaultConnection === name) {
        this.defaultConnection = this.connections.keys().next().value || null
      }

      this.emit('connectionRemoved', { name })
    }
  }

  /**
   * 执行查询
   * @param sql SQL语句
   * @param params 参数
   * @param connectionName 连接名称
   */
  async query(sql: string, params?: any[], connectionName?: string): Promise<QueryResult> {
    const connection = this.getConnection(connectionName)

    try {
      this.emit('queryStart', { sql, params, connection: connectionName })
      const startTime = Date.now()

      const result = await connection.query(sql, params)
      const duration = Date.now() - startTime

      this.emit('queryEnd', { sql, params, result, duration, connection: connectionName })
      return { ...result, duration }
    }
    catch (error) {
      this.emit('queryError', { sql, params, error, connection: connectionName })
      throw new DatabaseError(`Query failed: ${sql}`, error as Error)
    }
  }

  /**
   * 执行事务
   * @param callback 事务回调
   * @param connectionName 连接名称
   */
  async transaction<T>(
    callback: (connection: DatabaseConnection) => Promise<T>,
    connectionName?: string,
  ): Promise<T> {
    const connection = this.getConnection(connectionName)

    try {
      await connection.beginTransaction()
      this.emit('transactionStart', { connection: connectionName })

      const result = await callback(connection)

      await connection.commit()
      this.emit('transactionCommit', { connection: connectionName })

      return result
    }
    catch (error) {
      await connection.rollback()
      this.emit('transactionRollback', { connection: connectionName, error })
      throw error
    }
  }

  /**
   * 批量执行查询
   * @param queries 查询数组
   * @param connectionName 连接名称
   */
  async batch(queries: BatchQuery[], connectionName?: string): Promise<QueryResult[]> {
    const results: QueryResult[] = []

    for (const query of queries) {
      const result = await this.query(query.sql, query.params, connectionName)
      results.push(result)
    }

    return results
  }

  /**
   * 批量执行事务查询
   * @param queries 查询数组
   * @param connectionName 连接名称
   */
  async batchTransaction(queries: BatchQuery[], connectionName?: string): Promise<QueryResult[]> {
    return this.transaction(async (connection) => {
      const results: QueryResult[] = []

      for (const query of queries) {
        const result = await connection.query(query.sql, query.params)
        results.push(result)
      }

      return results
    }, connectionName)
  }

  /**
   * 测试连接
   * @param connectionName 连接名称
   */
  async testConnection(connectionName?: string): Promise<boolean> {
    try {
      await this.query('SELECT 1', [], connectionName)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取连接状态
   * @param connectionName 连接名称
   */
  getConnectionStatus(connectionName?: string): ConnectionStatus {
    const connection = this.getConnection(connectionName)

    return {
      name: connectionName || this.defaultConnection || '',
      connected: connection.connected,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      lastActivity: connection.lastActivity,
    }
  }

  /**
   * 获取所有连接状态
   */
  getAllConnectionStatus(): ConnectionStatus[] {
    const statuses: ConnectionStatus[] = []

    for (const [name] of this.connections) {
      statuses.push(this.getConnectionStatus(name))
    }

    return statuses
  }

  /**
   * 关闭所有连接
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.connections.entries()).map(async ([name, connection]) => {
      try {
        await connection.disconnect()
        this.emit('connectionClosed', { name })
      }
      catch (error) {
        this.emit('connectionError', { name, error })
      }
    })

    await Promise.all(promises)
    this.connections.clear()
    this.defaultConnection = null
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const results: ConnectionHealthCheck[] = []

    for (const [name] of this.connections) {
      const startTime = Date.now()
      let status: 'healthy' | 'unhealthy' = 'unhealthy'
      let error: string | undefined

      try {
        const isConnected = await this.testConnection(name)
        status = isConnected ? 'healthy' : 'unhealthy'
      }
      catch (err) {
        error = (err as Error).message
      }

      const duration = Date.now() - startTime

      results.push({
        name,
        status,
        duration,
        error,
      })
    }

    const healthyCount = results.filter(r => r.status === 'healthy').length
    const totalCount = results.length

    return {
      overall: healthyCount === totalCount ? 'healthy' : 'unhealthy',
      connections: results,
      summary: {
        total: totalCount,
        healthy: healthyCount,
        unhealthy: totalCount - healthyCount,
      },
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): DatabaseStats {
    const connections = this.getAllConnectionStatus()
    const connectedCount = connections.filter(c => c.connected).length

    return {
      totalConnections: connections.length,
      connectedConnections: connectedCount,
      disconnectedConnections: connections.length - connectedCount,
      defaultConnection: this.defaultConnection,
      connections: connections.map(c => ({
        name: c.name,
        type: c.type,
        connected: c.connected,
        lastActivity: c.lastActivity,
      })),
    }
  }

  /**
   * 创建数据库管理器实例
   * @param config 配置
   */
  static create(config: DatabaseConfig): DatabaseManager {
    return new DatabaseManager(config)
  }
}

// 类型定义
interface ConnectionConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb'
  host: string
  port: number
  database: string
  username: string
  password: string
  options?: Record<string, any>
}

interface BatchQuery {
  sql: string
  params?: any[]
}

interface ConnectionStatus {
  name: string
  connected: boolean
  type: string
  host: string
  port: number
  database: string
  lastActivity: Date
}

interface ConnectionHealthCheck {
  name: string
  status: 'healthy' | 'unhealthy'
  duration: number
  error?: string
}

interface HealthCheckResult {
  overall: 'healthy' | 'unhealthy'
  connections: ConnectionHealthCheck[]
  summary: {
    total: number
    healthy: number
    unhealthy: number
  }
}

interface DatabaseStats {
  totalConnections: number
  connectedConnections: number
  disconnectedConnections: number
  defaultConnection: string | null
  connections: Array<{
    name: string
    type: string
    connected: boolean
    lastActivity: Date
  }>
}
