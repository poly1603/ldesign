/**
 * 连接池工厂函数单元测试
 */

import { describe, it, expect, afterEach } from 'vitest'
import {
  createBasicPool,
  createHighPerformancePool,
  createLoadBalancedPool,
  createSmartPool,
  createDebugPool,
  createLightweightPool
} from '../../src/core/pool-factory'
import {
  ConnectionReuseStrategy,
  LoadBalanceStrategy
} from '../../src/types'
import { ConnectionPool } from '../../src/core/connection-pool'

describe('Pool Factory Functions', () => {
  const pools: ConnectionPool[] = []

  afterEach(() => {
    // 清理所有创建的连接池
    pools.forEach(pool => pool.destroyPool())
    pools.length = 0
  })

  describe('createBasicPool', () => {
    it('应该创建基础连接池', () => {
      const pool = createBasicPool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(5)
      expect(config.minConnections).toBe(1)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.BY_URL)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.ROUND_ROBIN)
      expect(config.validateConnections).toBe(false)
      expect(config.enableWarmup).toBe(false)
    })

    it('应该支持自定义配置', () => {
      const pool = createBasicPool({
        maxConnections: 10,
        minConnections: 2
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(10)
      expect(config.minConnections).toBe(2)
    })
  })

  describe('createHighPerformancePool', () => {
    it('应该创建高性能连接池', () => {
      const pool = createHighPerformancePool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(20)
      expect(config.minConnections).toBe(5)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.SMART)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.LEAST_CONNECTIONS)
      expect(config.validateConnections).toBe(true)
      expect(config.enableWarmup).toBe(true)
      expect(config.warmupConnections).toBe(3)
    })

    it('应该支持自定义配置', () => {
      const pool = createHighPerformancePool({
        maxConnections: 50,
        warmupConnections: 5
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(50)
      expect(config.warmupConnections).toBe(5)
    })
  })

  describe('createLoadBalancedPool', () => {
    it('应该创建负载均衡连接池（默认轮询）', () => {
      const pool = createLoadBalancedPool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(10)
      expect(config.minConnections).toBe(2)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.ROUND_ROBIN)
      expect(config.validateConnections).toBe(true)
      expect(config.enableWarmup).toBe(true)
    })

    it('应该支持指定负载均衡策略', () => {
      const pool = createLoadBalancedPool(LoadBalanceStrategy.WEIGHTED_ROUND_ROBIN)
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.WEIGHTED_ROUND_ROBIN)
    })

    it('应该支持自定义配置', () => {
      const pool = createLoadBalancedPool(LoadBalanceStrategy.LEAST_CONNECTIONS, {
        maxConnections: 15,
        minConnections: 3
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(15)
      expect(config.minConnections).toBe(3)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.LEAST_CONNECTIONS)
    })
  })

  describe('createSmartPool', () => {
    it('应该创建智能连接池', () => {
      const pool = createSmartPool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(15)
      expect(config.minConnections).toBe(3)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.SMART)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.LEAST_CONNECTIONS)
      expect(config.validateConnections).toBe(true)
      expect(config.enableWarmup).toBe(true)
      expect(config.warmupConnections).toBe(2)
    })

    it('应该支持自定义配置', () => {
      const pool = createSmartPool({
        maxConnections: 25,
        warmupConnections: 4
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(25)
      expect(config.warmupConnections).toBe(4)
    })
  })

  describe('createDebugPool', () => {
    it('应该创建调试连接池', () => {
      const pool = createDebugPool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(3)
      expect(config.minConnections).toBe(1)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.BY_URL)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.ROUND_ROBIN)
      expect(config.validateConnections).toBe(true)
      expect(config.enableWarmup).toBe(false)
    })

    it('应该支持自定义配置', () => {
      const pool = createDebugPool({
        maxConnections: 5,
        minConnections: 2
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(5)
      expect(config.minConnections).toBe(2)
    })
  })

  describe('createLightweightPool', () => {
    it('应该创建轻量级连接池', () => {
      const pool = createLightweightPool()
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(2)
      expect(config.minConnections).toBe(0)
      expect(config.reuseStrategy).toBe(ConnectionReuseStrategy.BY_URL)
      expect(config.loadBalanceStrategy).toBe(LoadBalanceStrategy.RANDOM)
      expect(config.validateConnections).toBe(false)
      expect(config.enableWarmup).toBe(false)
      expect(config.healthCheckInterval).toBe(0)
    })

    it('应该支持自定义配置', () => {
      const pool = createLightweightPool({
        maxConnections: 4,
        minConnections: 1
      })
      pools.push(pool)
      
      const config = pool.getConfig()
      expect(config.maxConnections).toBe(4)
      expect(config.minConnections).toBe(1)
    })
  })

  describe('工厂函数通用测试', () => {
    it('所有工厂函数都应该返回 ConnectionPool 实例', () => {
      const basicPool = createBasicPool()
      const highPerfPool = createHighPerformancePool()
      const loadBalancedPool = createLoadBalancedPool()
      const smartPool = createSmartPool()
      const debugPool = createDebugPool()
      const lightweightPool = createLightweightPool()
      
      pools.push(
        basicPool,
        highPerfPool,
        loadBalancedPool,
        smartPool,
        debugPool,
        lightweightPool
      )
      
      expect(basicPool).toBeInstanceOf(ConnectionPool)
      expect(highPerfPool).toBeInstanceOf(ConnectionPool)
      expect(loadBalancedPool).toBeInstanceOf(ConnectionPool)
      expect(smartPool).toBeInstanceOf(ConnectionPool)
      expect(debugPool).toBeInstanceOf(ConnectionPool)
      expect(lightweightPool).toBeInstanceOf(ConnectionPool)
    })

    it('所有工厂函数都应该支持空配置参数', () => {
      expect(() => createBasicPool()).not.toThrow()
      expect(() => createHighPerformancePool()).not.toThrow()
      expect(() => createLoadBalancedPool()).not.toThrow()
      expect(() => createSmartPool()).not.toThrow()
      expect(() => createDebugPool()).not.toThrow()
      expect(() => createLightweightPool()).not.toThrow()
    })

    it('所有工厂函数都应该支持部分配置覆盖', () => {
      const customConfig = { maxConnections: 100 }
      
      const basicPool = createBasicPool(customConfig)
      const highPerfPool = createHighPerformancePool(customConfig)
      const loadBalancedPool = createLoadBalancedPool(LoadBalanceStrategy.RANDOM, customConfig)
      const smartPool = createSmartPool(customConfig)
      const debugPool = createDebugPool(customConfig)
      const lightweightPool = createLightweightPool(customConfig)
      
      pools.push(
        basicPool,
        highPerfPool,
        loadBalancedPool,
        smartPool,
        debugPool,
        lightweightPool
      )
      
      expect(basicPool.getConfig().maxConnections).toBe(100)
      expect(highPerfPool.getConfig().maxConnections).toBe(100)
      expect(loadBalancedPool.getConfig().maxConnections).toBe(100)
      expect(smartPool.getConfig().maxConnections).toBe(100)
      expect(debugPool.getConfig().maxConnections).toBe(100)
      expect(lightweightPool.getConfig().maxConnections).toBe(100)
    })
  })

  describe('配置差异化测试', () => {
    it('不同工厂函数应该有不同的默认配置', () => {
      const basicPool = createBasicPool()
      const highPerfPool = createHighPerformancePool()
      const lightweightPool = createLightweightPool()
      
      pools.push(basicPool, highPerfPool, lightweightPool)
      
      const basicConfig = basicPool.getConfig()
      const highPerfConfig = highPerfPool.getConfig()
      const lightweightConfig = lightweightPool.getConfig()
      
      // 最大连接数应该不同
      expect(basicConfig.maxConnections).not.toBe(highPerfConfig.maxConnections)
      expect(basicConfig.maxConnections).not.toBe(lightweightConfig.maxConnections)
      expect(highPerfConfig.maxConnections).not.toBe(lightweightConfig.maxConnections)
      
      // 重用策略应该不同
      expect(basicConfig.reuseStrategy).not.toBe(highPerfConfig.reuseStrategy)
      
      // 负载均衡策略应该不同
      expect(basicConfig.loadBalanceStrategy).not.toBe(highPerfConfig.loadBalanceStrategy)
      expect(basicConfig.loadBalanceStrategy).not.toBe(lightweightConfig.loadBalanceStrategy)
    })

    it('高性能池应该启用更多功能', () => {
      const basicPool = createBasicPool()
      const highPerfPool = createHighPerformancePool()
      
      pools.push(basicPool, highPerfPool)
      
      const basicConfig = basicPool.getConfig()
      const highPerfConfig = highPerfPool.getConfig()
      
      expect(basicConfig.validateConnections).toBe(false)
      expect(highPerfConfig.validateConnections).toBe(true)
      
      expect(basicConfig.enableWarmup).toBe(false)
      expect(highPerfConfig.enableWarmup).toBe(true)
      
      expect(basicConfig.healthCheckInterval).toBe(0)
      expect(highPerfConfig.healthCheckInterval).toBeGreaterThan(0)
    })
  })
})
