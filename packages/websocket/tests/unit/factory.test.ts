/**
 * 工厂函数单元测试
 * 
 * 测试各种客户端创建工厂函数
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createWebSocketClient,
  createBasicClient,
  createReconnectingClient,
  createAuthenticatedClient,
  createHighPerformanceClient,
  createDebugClient
} from '@/factory'
import { WebSocketClient } from '@/core/websocket-client'
import { ReconnectStrategy, AuthType, LogLevel } from '@/types'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  protocols?: string | string[]
  binaryType: 'blob' | 'arraybuffer' = 'arraybuffer'

  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string, protocols?: string | string[]) {
    this.url = url
    this.protocols = protocols
  }

  send(data: string | ArrayBuffer): void {}
  close(code?: number, reason?: string): void {}
}

global.WebSocket = MockWebSocket as any

describe('工厂函数', () => {
  let client: WebSocketClient

  afterEach(() => {
    if (client) {
      client.destroy()
    }
  })

  describe('createWebSocketClient', () => {
    it('应该创建基础的 WebSocket 客户端', () => {
      client = createWebSocketClient({ url: 'ws://localhost:8080' })
      
      expect(client).toBeInstanceOf(WebSocketClient)
      expect(client.getConfig().url).toBe('ws://localhost:8080')
    })

    it('应该使用提供的配置', () => {
      const config = {
        url: 'ws://localhost:8080',
        connectionTimeout: 5000,
        debug: true
      }
      
      client = createWebSocketClient(config)
      const clientConfig = client.getConfig()
      
      expect(clientConfig.url).toBe(config.url)
      expect(clientConfig.connectionTimeout).toBe(config.connectionTimeout)
      expect(clientConfig.debug).toBe(config.debug)
    })
  })

  describe('createBasicClient', () => {
    it('应该创建基础客户端', () => {
      client = createBasicClient('ws://localhost:8080')
      const config = client.getConfig()
      
      expect(config.url).toBe('ws://localhost:8080')
      expect(config.reconnect.enabled).toBe(false)
      expect(config.heartbeat.enabled).toBe(false)
      expect(config.messageQueue.enabled).toBe(false)
    })

    it('应该支持可选配置', () => {
      client = createBasicClient('ws://localhost:8080', {
        protocols: ['protocol1', 'protocol2'],
        timeout: 15000,
        debug: true
      })
      
      const config = client.getConfig()
      
      expect(config.protocols).toEqual(['protocol1', 'protocol2'])
      expect(config.connectionTimeout).toBe(15000)
      expect(config.debug).toBe(true)
      expect(config.logLevel).toBe(LogLevel.DEBUG)
    })
  })

  describe('createReconnectingClient', () => {
    it('应该创建带重连功能的客户端', () => {
      client = createReconnectingClient('ws://localhost:8080')
      const config = client.getConfig()
      
      expect(config.url).toBe('ws://localhost:8080')
      expect(config.reconnect.enabled).toBe(true)
      expect(config.reconnect.strategy).toBe(ReconnectStrategy.EXPONENTIAL)
      expect(config.heartbeat.enabled).toBe(true)
      expect(config.messageQueue.enabled).toBe(true)
    })

    it('应该支持重连配置选项', () => {
      client = createReconnectingClient('ws://localhost:8080', {
        maxAttempts: 10,
        initialDelay: 2000,
        maxDelay: 60000,
        strategy: ReconnectStrategy.LINEAR,
        backoffMultiplier: 1.5,
        jitter: 500,
        debug: true
      })
      
      const config = client.getConfig()
      
      expect(config.reconnect.maxAttempts).toBe(10)
      expect(config.reconnect.initialDelay).toBe(2000)
      expect(config.reconnect.maxDelay).toBe(60000)
      expect(config.reconnect.strategy).toBe(ReconnectStrategy.LINEAR)
      expect(config.reconnect.backoffMultiplier).toBe(1.5)
      expect(config.reconnect.jitter).toBe(500)
      expect(config.debug).toBe(true)
    })
  })

  describe('createAuthenticatedClient', () => {
    it('应该创建带认证功能的客户端', () => {
      client = createAuthenticatedClient('ws://localhost:8080', {
        type: AuthType.TOKEN,
        token: 'test-token'
      })
      
      const config = client.getConfig()
      
      expect(config.url).toBe('ws://localhost:8080')
      expect(config.auth.type).toBe(AuthType.TOKEN)
      expect(config.auth.token).toBe('test-token')
      expect(config.reconnect.enabled).toBe(true)
      expect(config.heartbeat.enabled).toBe(true)
      expect(config.messageQueue.enabled).toBe(true)
      expect(config.messageQueue.persistent).toBe(true)
    })

    it('应该支持基础认证', () => {
      client = createAuthenticatedClient('ws://localhost:8080', {
        type: AuthType.BASIC,
        username: 'user',
        password: 'pass'
      })
      
      const config = client.getConfig()
      
      expect(config.auth.type).toBe(AuthType.BASIC)
      expect(config.auth.username).toBe('user')
      expect(config.auth.password).toBe('pass')
    })

    it('应该支持自定义认证', () => {
      const customAuth = vi.fn().mockResolvedValue({ token: 'custom-token' })
      const refreshToken = vi.fn().mockResolvedValue('new-token')
      
      client = createAuthenticatedClient('ws://localhost:8080', {
        type: AuthType.CUSTOM,
        customAuth,
        refreshToken,
        autoRefresh: true
      })
      
      const config = client.getConfig()
      
      expect(config.auth.type).toBe(AuthType.CUSTOM)
      expect(config.auth.customAuth).toBe(customAuth)
      expect(config.auth.refreshToken).toBe(refreshToken)
      expect(config.auth.autoRefresh).toBe(true)
    })

    it('应该支持可选配置', () => {
      client = createAuthenticatedClient('ws://localhost:8080', {
        type: AuthType.TOKEN,
        token: 'test-token'
      }, {
        debug: true,
        enableReconnect: false,
        enableHeartbeat: false
      })
      
      const config = client.getConfig()
      
      expect(config.debug).toBe(true)
      expect(config.reconnect.enabled).toBe(false)
      expect(config.heartbeat.enabled).toBe(false)
    })
  })

  describe('createHighPerformanceClient', () => {
    it('应该创建高性能客户端', () => {
      client = createHighPerformanceClient('ws://localhost:8080')
      const config = client.getConfig()
      
      expect(config.url).toBe('ws://localhost:8080')
      expect(config.logLevel).toBe(LogLevel.WARN) // 减少日志输出
      expect(config.maxMessageSize).toBe(10 * 1024 * 1024) // 10MB
      expect(config.reconnect.enabled).toBe(true)
      expect(config.heartbeat.enabled).toBe(true)
      expect(config.heartbeat.interval).toBe(15000) // 更频繁的心跳
      expect(config.messageQueue.enabled).toBe(true)
      expect(config.messageQueue.maxSize).toBe(5000)
      expect(config.messageQueue.persistent).toBe(false) // 不持久化
      expect(config.messageQueue.deduplication).toBe(false) // 不去重
    })

    it('应该支持性能配置选项', () => {
      client = createHighPerformanceClient('ws://localhost:8080', {
        maxMessageSize: 50 * 1024 * 1024, // 50MB
        queueSize: 10000,
        heartbeatInterval: 10000,
        compression: true,
        debug: true
      })
      
      const config = client.getConfig()
      
      expect(config.maxMessageSize).toBe(50 * 1024 * 1024)
      expect(config.messageQueue.maxSize).toBe(10000)
      expect(config.heartbeat.interval).toBe(10000)
      expect(config.compression).toBe(true)
      expect(config.debug).toBe(true)
    })
  })

  describe('createDebugClient', () => {
    it('应该创建调试客户端', () => {
      client = createDebugClient('ws://localhost:8080')
      const config = client.getConfig()
      
      expect(config.url).toBe('ws://localhost:8080')
      expect(config.debug).toBe(true)
      expect(config.logLevel).toBe(LogLevel.DEBUG)
      expect(config.reconnect.enabled).toBe(true)
      expect(config.reconnect.strategy).toBe(ReconnectStrategy.FIXED)
      expect(config.heartbeat.enabled).toBe(true)
      expect(config.heartbeat.message).toBe('debug-ping')
      expect(config.messageQueue.enabled).toBe(true)
      expect(config.messageQueue.persistent).toBe(true)
    })

    it('应该支持调试配置选项', () => {
      client = createDebugClient('ws://localhost:8080', {
        verbose: true,
        logLevel: LogLevel.INFO
      })
      
      const config = client.getConfig()
      
      expect(config.logLevel).toBe(LogLevel.INFO)
    })

    it('应该在详细模式下添加事件监听器', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      client = createDebugClient('ws://localhost:8080', { verbose: true })
      
      // 触发一些事件来测试监听器
      client.emit('stateChange', { from: 'disconnected' as any, to: 'connecting' as any })
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('错误处理', () => {
    it('应该在无效 URL 时抛出错误', () => {
      expect(() => {
        createBasicClient('')
      }).toThrow('WebSocket URL 不能为空')
    })

    it('应该在无效配置时抛出错误', () => {
      expect(() => {
        createWebSocketClient({
          url: 'ws://localhost:8080',
          connectionTimeout: -1
        })
      }).toThrow('连接超时时间必须大于 0')
    })
  })
})
