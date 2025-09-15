/**
 * WebSocket 客户端工厂函数
 * 
 * 提供便捷的客户端创建方法和预设配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import {
  ReconnectStrategy,
  AuthType,
  LogLevel,
  MessageType
} from './types'
import type {
  WebSocketClientConfig,
  AuthConfig
} from './types'
import { WebSocketClient } from './core/websocket-client'

/**
 * 创建 WebSocket 客户端
 * @param config 配置选项
 * @returns WebSocket 客户端实例
 */
export function createWebSocketClient(config: Partial<WebSocketClientConfig>): WebSocketClient {
  return new WebSocketClient(config)
}

/**
 * 创建基础 WebSocket 客户端
 * @param url WebSocket 服务器 URL
 * @param options 可选配置
 * @returns WebSocket 客户端实例
 */
export function createBasicClient(
  url: string,
  options: {
    protocols?: string | string[]
    timeout?: number
    debug?: boolean
  } = {}
): WebSocketClient {
  return new WebSocketClient({
    url,
    protocols: options.protocols,
    connectionTimeout: options.timeout || 10000,
    debug: options.debug || false,
    logLevel: options.debug ? LogLevel.DEBUG : LogLevel.INFO,
    reconnect: {
      enabled: false,
      strategy: ReconnectStrategy.FIXED,
      initialDelay: 1000,
      maxDelay: 5000,
      maxAttempts: 3,
      backoffMultiplier: 1.5,
      jitter: 500
    },
    heartbeat: {
      enabled: false,
      interval: 30000,
      timeout: 5000,
      message: 'ping',
      messageType: MessageType.TEXT,
      maxFailures: 3
    },
    auth: {
      type: AuthType.NONE,
      autoRefresh: false
    },
    messageQueue: {
      enabled: false,
      maxSize: 100,
      persistent: false,
      storageKey: 'websocket_basic_queue',
      messageExpiry: 60000,
      deduplication: false
    }
  })
}

/**
 * 创建带重连功能的 WebSocket 客户端
 * @param url WebSocket 服务器 URL
 * @param options 重连配置选项
 * @returns WebSocket 客户端实例
 */
export function createReconnectingClient(
  url: string,
  options: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    strategy?: ReconnectStrategy
    backoffMultiplier?: number
    jitter?: number
    debug?: boolean
  } = {}
): WebSocketClient {
  return new WebSocketClient({
    url,
    debug: options.debug || false,
    logLevel: options.debug ? LogLevel.DEBUG : LogLevel.INFO,
    reconnect: {
      enabled: true,
      strategy: options.strategy || ReconnectStrategy.EXPONENTIAL,
      initialDelay: options.initialDelay || 1000,
      maxDelay: options.maxDelay || 30000,
      maxAttempts: options.maxAttempts || 5,
      backoffMultiplier: options.backoffMultiplier || 2,
      jitter: options.jitter || 1000
    },
    heartbeat: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
      message: 'ping',
      messageType: MessageType.TEXT,
      maxFailures: 3
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000,
      persistent: false,
      storageKey: 'websocket_reconnecting_queue',
      messageExpiry: 300000,
      deduplication: true
    }
  })
}

/**
 * 创建带认证功能的 WebSocket 客户端
 * @param url WebSocket 服务器 URL
 * @param authConfig 认证配置
 * @param options 其他配置选项
 * @returns WebSocket 客户端实例
 */
export function createAuthenticatedClient(
  url: string,
  authConfig: {
    type: AuthType
    token?: string
    username?: string
    password?: string
    customAuth?: () => Promise<Record<string, unknown>>
    refreshToken?: () => Promise<string>
    autoRefresh?: boolean
  },
  options: {
    debug?: boolean
    enableReconnect?: boolean
    enableHeartbeat?: boolean
  } = {}
): WebSocketClient {
  return new WebSocketClient({
    url,
    debug: options.debug || false,
    logLevel: options.debug ? LogLevel.DEBUG : LogLevel.INFO,
    auth: {
      type: authConfig.type,
      token: authConfig.token,
      username: authConfig.username,
      password: authConfig.password,
      customAuth: authConfig.customAuth,
      refreshToken: authConfig.refreshToken,
      autoRefresh: authConfig.autoRefresh || false
    },
    reconnect: {
      enabled: options.enableReconnect !== false,
      strategy: ReconnectStrategy.EXPONENTIAL,
      initialDelay: 1000,
      maxDelay: 30000,
      maxAttempts: 5,
      backoffMultiplier: 2,
      jitter: 1000
    },
    heartbeat: {
      enabled: options.enableHeartbeat !== false,
      interval: 30000,
      timeout: 5000,
      message: 'ping',
      messageType: MessageType.TEXT,
      maxFailures: 3
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000,
      persistent: true,
      storageKey: 'websocket_auth_queue',
      messageExpiry: 300000,
      deduplication: true
    }
  })
}

/**
 * 创建高性能 WebSocket 客户端
 * @param url WebSocket 服务器 URL
 * @param options 性能配置选项
 * @returns WebSocket 客户端实例
 */
export function createHighPerformanceClient(
  url: string,
  options: {
    maxMessageSize?: number
    queueSize?: number
    heartbeatInterval?: number
    compression?: boolean
    debug?: boolean
  } = {}
): WebSocketClient {
  return new WebSocketClient({
    url,
    debug: options.debug || false,
    logLevel: LogLevel.WARN, // 减少日志输出
    compression: options.compression || false,
    maxMessageSize: options.maxMessageSize || 10 * 1024 * 1024, // 10MB
    reconnect: {
      enabled: true,
      strategy: ReconnectStrategy.EXPONENTIAL,
      initialDelay: 500,
      maxDelay: 10000,
      maxAttempts: 10,
      backoffMultiplier: 1.5,
      jitter: 200
    },
    heartbeat: {
      enabled: true,
      interval: options.heartbeatInterval || 15000, // 更频繁的心跳
      timeout: 3000,
      message: 'ping',
      messageType: MessageType.TEXT,
      maxFailures: 2
    },
    messageQueue: {
      enabled: true,
      maxSize: options.queueSize || 5000,
      persistent: false, // 不持久化以提高性能
      storageKey: 'websocket_hp_queue',
      messageExpiry: 60000, // 更短的过期时间
      deduplication: false // 不去重以提高性能
    }
  })
}

/**
 * 创建调试模式的 WebSocket 客户端
 * @param url WebSocket 服务器 URL
 * @param options 调试配置选项
 * @returns WebSocket 客户端实例
 */
export function createDebugClient(
  url: string,
  options: {
    verbose?: boolean
    logLevel?: LogLevel
  } = {}
): WebSocketClient {
  const client = new WebSocketClient({
    url,
    debug: true,
    logLevel: options.logLevel || LogLevel.DEBUG,
    reconnect: {
      enabled: true,
      strategy: ReconnectStrategy.FIXED,
      initialDelay: 2000,
      maxDelay: 5000,
      maxAttempts: 3,
      backoffMultiplier: 1,
      jitter: 0
    },
    heartbeat: {
      enabled: true,
      interval: 10000,
      timeout: 3000,
      message: 'debug-ping',
      messageType: MessageType.TEXT,
      maxFailures: 2
    },
    messageQueue: {
      enabled: true,
      maxSize: 100,
      persistent: true,
      storageKey: 'websocket_debug_queue',
      messageExpiry: 300000,
      deduplication: true
    }
  })

  // 添加详细的事件监听器用于调试
  if (options.verbose) {
    client.on('stateChange', ({ from, to }) => {
      console.log(`🔄 状态变化: ${from} -> ${to}`)
    })

    client.on('messageSent', (message) => {
      console.log('📤 消息发送:', message)
    })

    client.on('messageReceived', (message) => {
      console.log('📥 消息接收:', message)
    })

    client.on('heartbeatSent', ({ timestamp }) => {
      console.log('💓 心跳发送:', new Date(timestamp).toISOString())
    })

    client.on('heartbeatReceived', ({ timestamp, latency }) => {
      console.log('💗 心跳响应:', { timestamp: new Date(timestamp).toISOString(), latency })
    })

    client.on('reconnectStart', ({ attempt, maxAttempts }) => {
      console.log(`🔄 开始第 ${attempt}/${maxAttempts} 次重连`)
    })

    client.on('reconnectSuccess', ({ attempt }) => {
      console.log(`✅ 第 ${attempt} 次重连成功`)
    })

    client.on('reconnectFailed', ({ attempt, error }) => {
      console.log(`❌ 第 ${attempt} 次重连失败:`, error)
    })
  }

  return client
}
