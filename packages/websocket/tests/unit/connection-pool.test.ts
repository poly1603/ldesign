/**
 * 连接池单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConnectionPool } from '../../src/core/connection-pool'
import {
  ConnectionReuseStrategy,
  LoadBalanceStrategy,
  WebSocketClientConfig
} from '../../src/types'

describe('ConnectionPool', () => {
  let pool: ConnectionPool

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (pool) {
      pool.destroyPool()
    }
  })

  describe('构造函数和配置', () => {
    it('应该使用默认配置创建连接池', () => {
      pool = new ConnectionPool()
      const config = pool.getConfig()
      
      expect(config.maxConnections).toBe(10)
      expect(config.minConnections).toBe(2)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.BY_URL)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.ROUND_ROBIN)
    })

    it('应该使用自定义配置创建连接池', () => {
      const customConfig = {
        maxConnections: 20,
        minConnections: 5,
        reuseStrategy: ConnectionReuseStrategy.SMART,
        loadBalanceStrategy: LoadBalanceStrategy.LEAST_CONNECTIONS
      }
      
      pool = new ConnectionPool(customConfig)
      const config = pool.getConfig()
      
      expect(config.maxConnections).toBe(20)
      expect(config.minConnections).toBe(5)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.SMART)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.LEAST_CONNECTIONS)
    })

    it('应该验证配置参数', () => {
      expect(() => {
        new ConnectionPool({ maxConnections: 0 })
      }).toThrow('最大连接数必须大于 0')

      expect(() => {
        new ConnectionPool({ minConnections: -1 })
      }).toThrow('最小连接数不能小于 0')

      expect(() => {
        new ConnectionPool({ maxConnections: 5, minConnections: 10 })
      }).toThrow('最小连接数不能大于最大连接数')
    })
  })

  describe('连接获取和释放', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 3,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该能够获取新连接', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client = await pool.acquire(config)
      expect(client).toBeDefined()
      expect(client.isConnected()).toBe(true)

      const stats = pool.getStats()
      expect(stats.totalConnections).toBe(1)
      expect(stats.activeConnections).toBe(1)
    })

    it('应该能够释放连接', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client = await pool.acquire(config)
      pool.release(client)

      const stats = pool.getStats()
      expect(stats.activeConnections).toBe(0)
      expect(stats.idleConnections).toBe(1)
    })

    it('应该能够销毁连接', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client = await pool.acquire(config)
      pool.destroy(client)

      const stats = pool.getStats()
      expect(stats.totalConnections).toBe(0)
    })

    it('应该在连接池满时抛出错误', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      // 填满连接池
      await pool.acquire(config)
      await pool.acquire({ url: 'ws://localhost:8081' })
      await pool.acquire({ url: 'ws://localhost:8082' })

      // 尝试获取第四个连接应该失败
      await expect(pool.acquire({ url: 'ws://localhost:8083' }))
        .rejects.toThrow('连接池已满')
    })
  })

  describe('连接重用', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 5,
        reuseStrategy: ConnectionReuseStrategy.BY_URL,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该重用相同 URL 的连接', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client1 = await pool.acquire(config)
      pool.release(client1)

      const client2 = await pool.acquire(config)
      expect(client2).toBe(client1)

      const stats = pool.getStats()
      expect(stats.totalConnections).toBe(1)
    })

    it('应该在 NONE 策略下不重用连接', async () => {
      pool.destroyPool()
      pool = new ConnectionPool({
        maxConnections: 5,
        reuseStrategy: ConnectionReuseStrategy.NONE,
        healthCheckInterval: 0,
        validationInterval: 0
      })

      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client1 = await pool.acquire(config)
      pool.release(client1)

      const client2 = await pool.acquire(config)
      expect(client2).not.toBe(client1)

      const stats = pool.getStats()
      expect(stats.totalConnections).toBe(2)
    })
  })

  describe('负载均衡', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 10,
        loadBalanceStrategy: LoadBalanceStrategy.ROUND_ROBIN,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该使用轮询策略分配连接', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      // 创建多个连接
      const client1 = await pool.acquire(config)
      pool.release(client1)
      
      const client2 = await pool.acquire(config)
      pool.release(client2)
      
      const client3 = await pool.acquire(config)
      pool.release(client3)

      // 由于是轮询，应该重用第一个连接
      const client4 = await pool.acquire(config)
      expect(client4).toBe(client1)
    })
  })

  describe('统计信息', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 5,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该正确统计连接数量', async () => {
      const config1: WebSocketClientConfig = { url: 'ws://localhost:8080' }
      const config2: WebSocketClientConfig = { url: 'ws://localhost:8081' }

      const client1 = await pool.acquire(config1)
      const client2 = await pool.acquire(config2)

      let stats = pool.getStats()
      expect(stats.totalConnections).toBe(2)
      expect(stats.activeConnections).toBe(2)
      expect(stats.idleConnections).toBe(0)

      pool.release(client1)

      stats = pool.getStats()
      expect(stats.activeConnections).toBe(1)
      expect(stats.idleConnections).toBe(1)
    })

    it('应该正确计算命中率', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      // 第一次获取（创建新连接）
      const client1 = await pool.acquire(config)
      pool.release(client1)

      // 第二次获取（重用连接）
      const client2 = await pool.acquire(config)

      const stats = pool.getStats()
      expect(stats.totalRequests).toBe(2)
      expect(stats.successfulRequests).toBe(2)
      expect(stats.hitRate).toBe(1)
    })
  })

  describe('连接池管理', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 3,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该能够清空连接池', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      await pool.acquire(config)
      await pool.acquire({ url: 'ws://localhost:8081' })

      let stats = pool.getStats()
      expect(stats.totalConnections).toBe(2)

      pool.clear()

      stats = pool.getStats()
      expect(stats.totalConnections).toBe(0)
    })

    it('应该能够销毁连接池', async () => {
      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      await pool.acquire(config)
      pool.destroyPool()

      // 销毁后不应该能够获取新连接
      await expect(pool.acquire(config))
        .rejects.toThrow('连接池已销毁')
    })
  })

  describe('事件处理', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        maxConnections: 3,
        healthCheckInterval: 0,
        validationInterval: 0
      })
    })

    it('应该触发连接创建事件', async () => {
      const eventSpy = vi.fn()
      pool.on('connectionCreated', eventSpy)

      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      await pool.acquire(config)

      expect(eventSpy).toHaveBeenCalledWith({
        connectionId: expect.any(String),
        url: 'ws://localhost:8080'
      })
    })

    it('应该触发连接重用事件', async () => {
      const eventSpy = vi.fn()
      pool.on('connectionReused', eventSpy)

      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      const client1 = await pool.acquire(config)
      pool.release(client1)

      await pool.acquire(config)

      expect(eventSpy).toHaveBeenCalledWith({
        connectionId: expect.any(String),
        url: 'ws://localhost:8080'
      })
    })

    it('应该触发连接池满事件', async () => {
      const eventSpy = vi.fn()
      pool.on('poolFull', eventSpy)

      const config: WebSocketClientConfig = {
        url: 'ws://localhost:8080'
      }

      // 填满连接池
      await pool.acquire(config)
      await pool.acquire({ url: 'ws://localhost:8081' })
      await pool.acquire({ url: 'ws://localhost:8082' })

      // 尝试获取第四个连接
      try {
        await pool.acquire({ url: 'ws://localhost:8083' })
      } catch {
        // 忽略错误
      }

      expect(eventSpy).toHaveBeenCalledWith({
        maxConnections: 3
      })
    })
  })
})
