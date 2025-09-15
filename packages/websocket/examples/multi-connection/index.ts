/**
 * 多连接管理示例
 * 演示如何使用 @ldesign/websocket 管理多个WebSocket连接
 */

import { 
  ConnectionPool, 
  WebSocketClient,
  createConnectionPool,
  createLoadBalancedPool 
} from '@ldesign/websocket'

// 连接配置接口
interface ConnectionConfig {
  name: string
  url: string
  priority: number
  region: string
}

// 消息接口
interface Message {
  id: string
  content: string
  timestamp: number
  source: string
}

/**
 * 多连接管理器
 * 负责管理多个WebSocket连接，提供负载均衡和故障转移功能
 */
class MultiConnectionManager {
  private pool: ConnectionPool
  private connections: Map<string, WebSocketClient> = new Map()
  private messageHandlers: Map<string, (message: Message) => void> = new Map()
  private stats = {
    totalMessages: 0,
    connectionCount: 0,
    failedConnections: 0
  }

  constructor() {
    // 创建连接池，使用轮询策略
    this.pool = createConnectionPool({
      maxConnections: 10,
      strategy: 'round-robin',
      healthCheck: {
        enabled: true,
        interval: 30000,
        timeout: 5000
      }
    })

    this.setupPoolEvents()
  }

  /**
   * 设置连接池事件监听
   */
  private setupPoolEvents(): void {
    this.pool.on('connectionAdded', (connection) => {
      console.log(`✅ 连接已添加: ${connection.config.url}`)
      this.stats.connectionCount++
    })

    this.pool.on('connectionRemoved', (connection) => {
      console.log(`❌ 连接已移除: ${connection.config.url}`)
      this.stats.connectionCount--
    })

    this.pool.on('connectionFailed', (url, error) => {
      console.error(`🔥 连接失败: ${url}`, error)
      this.stats.failedConnections++
    })

    this.pool.on('healthCheckFailed', (connection) => {
      console.warn(`⚠️ 健康检查失败: ${connection.config.url}`)
    })
  }

  /**
   * 添加连接配置
   */
  async addConnection(config: ConnectionConfig): Promise<void> {
    try {
      // 创建WebSocket客户端
      const client = new WebSocketClient({
        url: config.url,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          maxAttempts: 5,
          initialDelay: 1000
        },
        heartbeat: {
          enabled: true,
          interval: 30000,
          message: 'ping'
        },
        metadata: {
          name: config.name,
          priority: config.priority,
          region: config.region
        }
      })

      // 设置事件监听
      this.setupClientEvents(client, config)

      // 添加到连接池
      await this.pool.addConnection(client)
      
      // 保存到本地映射
      this.connections.set(config.name, client)

      console.log(`🔗 已添加连接: ${config.name} (${config.url})`)
    } catch (error) {
      console.error(`❌ 添加连接失败: ${config.name}`, error)
      throw error
    }
  }

  /**
   * 设置客户端事件监听
   */
  private setupClientEvents(client: WebSocketClient, config: ConnectionConfig): void {
    client.on('connected', () => {
      console.log(`🟢 ${config.name} 已连接`)
    })

    client.on('disconnected', () => {
      console.log(`🔴 ${config.name} 已断开`)
    })

    client.on('message', (data) => {
      this.handleMessage(data, config.name)
    })

    client.on('error', (error) => {
      console.error(`💥 ${config.name} 连接错误:`, error)
    })

    client.on('reconnecting', (attempt) => {
      console.log(`🔄 ${config.name} 正在重连 (第${attempt}次)`)
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: any, source: string): void {
    const message: Message = {
      id: Date.now().toString(),
      content: typeof data === 'string' ? data : JSON.stringify(data),
      timestamp: Date.now(),
      source
    }

    this.stats.totalMessages++

    // 调用注册的消息处理器
    const handler = this.messageHandlers.get(source)
    if (handler) {
      handler(message)
    }

    // 全局消息处理器
    const globalHandler = this.messageHandlers.get('*')
    if (globalHandler) {
      globalHandler(message)
    }
  }

  /**
   * 注册消息处理器
   */
  onMessage(source: string, handler: (message: Message) => void): void {
    this.messageHandlers.set(source, handler)
  }

  /**
   * 发送消息到指定连接
   */
  async sendToConnection(connectionName: string, message: any): Promise<void> {
    const client = this.connections.get(connectionName)
    if (!client) {
      throw new Error(`连接不存在: ${connectionName}`)
    }

    try {
      await client.send(message)
      console.log(`📤 消息已发送到 ${connectionName}:`, message)
    } catch (error) {
      console.error(`❌ 发送消息失败 ${connectionName}:`, error)
      throw error
    }
  }

  /**
   * 广播消息到所有连接
   */
  async broadcast(message: any): Promise<void> {
    const promises = Array.from(this.connections.entries()).map(async ([name, client]) => {
      try {
        await client.send(message)
        console.log(`📤 广播消息到 ${name}`)
      } catch (error) {
        console.error(`❌ 广播到 ${name} 失败:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * 使用负载均衡发送消息
   */
  async sendBalanced(message: any): Promise<void> {
    try {
      const connection = this.pool.getConnection()
      await connection.send(message)
      console.log(`⚖️ 负载均衡发送消息:`, message)
    } catch (error) {
      console.error(`❌ 负载均衡发送失败:`, error)
      throw error
    }
  }

  /**
   * 移除连接
   */
  async removeConnection(connectionName: string): Promise<void> {
    const client = this.connections.get(connectionName)
    if (!client) {
      console.warn(`⚠️ 连接不存在: ${connectionName}`)
      return
    }

    try {
      await this.pool.removeConnection(client)
      this.connections.delete(connectionName)
      this.messageHandlers.delete(connectionName)
      
      console.log(`🗑️ 已移除连接: ${connectionName}`)
    } catch (error) {
      console.error(`❌ 移除连接失败: ${connectionName}`, error)
      throw error
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    
    for (const [name, client] of this.connections) {
      status[name] = {
        state: client.getState(),
        isConnected: client.isConnected(),
        stats: client.getStats(),
        config: client.config
      }
    }

    return status
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      poolStats: this.pool.getStats(),
      activeConnections: Array.from(this.connections.keys())
    }
  }

  /**
   * 关闭所有连接
   */
  async shutdown(): Promise<void> {
    console.log('🔌 正在关闭所有连接...')
    
    const promises = Array.from(this.connections.values()).map(client => 
      client.disconnect()
    )
    
    await Promise.allSettled(promises)
    
    this.connections.clear()
    this.messageHandlers.clear()
    
    console.log('✅ 所有连接已关闭')
  }
}

/**
 * 使用示例
 */
async function example() {
  const manager = new MultiConnectionManager()

  // 连接配置
  const connections: ConnectionConfig[] = [
    {
      name: 'primary',
      url: 'ws://primary.example.com:8080',
      priority: 1,
      region: 'us-east-1'
    },
    {
      name: 'secondary',
      url: 'ws://secondary.example.com:8080',
      priority: 2,
      region: 'us-west-1'
    },
    {
      name: 'backup',
      url: 'ws://backup.example.com:8080',
      priority: 3,
      region: 'eu-west-1'
    }
  ]

  try {
    // 添加连接
    for (const config of connections) {
      await manager.addConnection(config)
    }

    // 注册全局消息处理器
    manager.onMessage('*', (message) => {
      console.log(`📨 收到消息 [${message.source}]:`, message.content)
    })

    // 注册特定连接的消息处理器
    manager.onMessage('primary', (message) => {
      console.log(`🎯 主连接消息:`, message.content)
    })

    // 等待连接建立
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 发送消息到指定连接
    await manager.sendToConnection('primary', {
      type: 'greeting',
      message: 'Hello from primary!'
    })

    // 广播消息
    await manager.broadcast({
      type: 'announcement',
      message: 'Hello everyone!'
    })

    // 使用负载均衡发送消息
    for (let i = 0; i < 5; i++) {
      await manager.sendBalanced({
        type: 'data',
        sequence: i,
        message: `Message ${i}`
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 显示连接状态
    console.log('📊 连接状态:', manager.getConnectionStatus())
    console.log('📈 统计信息:', manager.getStats())

    // 模拟运行一段时间
    await new Promise(resolve => setTimeout(resolve, 10000))

  } catch (error) {
    console.error('❌ 示例运行失败:', error)
  } finally {
    // 清理资源
    await manager.shutdown()
  }
}

/**
 * 高级示例：动态连接管理
 */
async function advancedExample() {
  const manager = new MultiConnectionManager()

  // 动态添加连接的函数
  const addDynamicConnection = async (region: string, index: number) => {
    const config: ConnectionConfig = {
      name: `dynamic-${region}-${index}`,
      url: `ws://${region}.example.com:808${index}`,
      priority: index,
      region
    }

    try {
      await manager.addConnection(config)
      console.log(`✨ 动态添加连接: ${config.name}`)
    } catch (error) {
      console.error(`❌ 动态添加连接失败: ${config.name}`, error)
    }
  }

  // 连接健康监控
  const monitorConnections = () => {
    setInterval(() => {
      const status = manager.getConnectionStatus()
      const stats = manager.getStats()
      
      console.log('\n📊 连接监控报告:')
      console.log(`活跃连接: ${stats.activeConnections.length}`)
      console.log(`总消息数: ${stats.totalMessages}`)
      console.log(`失败连接: ${stats.failedConnections}`)
      
      // 检查不健康的连接
      for (const [name, info] of Object.entries(status)) {
        if (!info.isConnected) {
          console.warn(`⚠️ 连接异常: ${name} - ${info.state}`)
        }
      }
    }, 5000)
  }

  try {
    // 启动监控
    monitorConnections()

    // 动态添加连接
    await addDynamicConnection('us-east', 1)
    await addDynamicConnection('us-west', 2)
    await addDynamicConnection('eu-central', 3)

    // 模拟连接故障和恢复
    setTimeout(async () => {
      console.log('🔧 模拟连接故障...')
      await manager.removeConnection('dynamic-us-east-1')
      
      // 5秒后重新添加
      setTimeout(async () => {
        console.log('🔄 恢复连接...')
        await addDynamicConnection('us-east', 1)
      }, 5000)
    }, 10000)

    // 持续发送消息
    const sendMessages = async () => {
      let counter = 0
      const interval = setInterval(async () => {
        try {
          await manager.sendBalanced({
            type: 'heartbeat',
            counter: counter++,
            timestamp: Date.now()
          })
        } catch (error) {
          console.error('❌ 发送心跳失败:', error)
        }
      }, 2000)

      // 30秒后停止
      setTimeout(() => {
        clearInterval(interval)
      }, 30000)
    }

    await sendMessages()

  } catch (error) {
    console.error('❌ 高级示例运行失败:', error)
  } finally {
    await manager.shutdown()
  }
}

// 导出类和函数供其他模块使用
export {
  MultiConnectionManager,
  type ConnectionConfig,
  type Message,
  example,
  advancedExample
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  console.log('🚀 启动多连接管理示例...')
  
  // 运行基础示例
  example()
    .then(() => {
      console.log('\n🎉 基础示例完成，启动高级示例...')
      return advancedExample()
    })
    .then(() => {
      console.log('\n✅ 所有示例完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 示例运行失败:', error)
      process.exit(1)
    })
}
