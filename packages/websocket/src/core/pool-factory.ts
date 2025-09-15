/**
 * 连接池工厂函数
 * 
 * 提供各种预配置的连接池创建函数
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { ConnectionPool } from './connection-pool'
import {
  ConnectionPoolConfig,
  ConnectionReuseStrategy,
  LoadBalanceStrategy
} from '@/types'

/**
 * 创建基础连接池
 * 
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createBasicPool({
 *   maxConnections: 5
 * })
 * ```
 */
export function createBasicPool(config: Partial<ConnectionPoolConfig> = {}): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 5,
    minConnections: 1,
    idleTimeout: 300000, // 5 分钟
    acquireTimeout: 5000, // 5 秒
    validateConnections: false,
    reuseStrategy: ConnectionReuseStrategy.BY_URL,
    loadBalanceStrategy: LoadBalanceStrategy.ROUND_ROBIN,
    healthCheckInterval: 0, // 禁用健康检查
    enableWarmup: false,
    ...config
  }
  
  return new ConnectionPool(poolConfig)
}

/**
 * 创建高性能连接池
 * 
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createHighPerformancePool({
 *   maxConnections: 50
 * })
 * ```
 */
export function createHighPerformancePool(config: Partial<ConnectionPoolConfig> = {}): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 20,
    minConnections: 5,
    idleTimeout: 600000, // 10 分钟
    acquireTimeout: 3000, // 3 秒
    validateConnections: true,
    validationInterval: 30000, // 30 秒
    reuseStrategy: ConnectionReuseStrategy.SMART,
    loadBalanceStrategy: LoadBalanceStrategy.LEAST_CONNECTIONS,
    healthCheckInterval: 15000, // 15 秒
    enableWarmup: true,
    warmupConnections: 3,
    ...config
  }
  
  return new ConnectionPool(poolConfig)
}

/**
 * 创建负载均衡连接池
 * 
 * @param strategy 负载均衡策略
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createLoadBalancedPool(LoadBalanceStrategy.WEIGHTED_ROUND_ROBIN, {
 *   maxConnections: 10
 * })
 * ```
 */
export function createLoadBalancedPool(
  strategy: LoadBalanceStrategy = LoadBalanceStrategy.ROUND_ROBIN,
  config: Partial<ConnectionPoolConfig> = {}
): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 10,
    minConnections: 2,
    idleTimeout: 300000, // 5 分钟
    acquireTimeout: 5000, // 5 秒
    validateConnections: true,
    validationInterval: 60000, // 1 分钟
    reuseStrategy: ConnectionReuseStrategy.BY_URL,
    loadBalanceStrategy: strategy,
    healthCheckInterval: 30000, // 30 秒
    enableWarmup: true,
    warmupConnections: 2,
    ...config
  }
  
  return new ConnectionPool(poolConfig)
}

/**
 * 创建智能连接池
 * 
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createSmartPool({
 *   maxConnections: 15
 * })
 * ```
 */
export function createSmartPool(config: Partial<ConnectionPoolConfig> = {}): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 15,
    minConnections: 3,
    idleTimeout: 450000, // 7.5 分钟
    acquireTimeout: 4000, // 4 秒
    validateConnections: true,
    validationInterval: 45000, // 45 秒
    reuseStrategy: ConnectionReuseStrategy.SMART,
    loadBalanceStrategy: LoadBalanceStrategy.LEAST_CONNECTIONS,
    healthCheckInterval: 20000, // 20 秒
    enableWarmup: true,
    warmupConnections: 2,
    ...config
  }
  
  return new ConnectionPool(poolConfig)
}

/**
 * 创建调试连接池
 * 
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createDebugPool({
 *   maxConnections: 3
 * })
 * ```
 */
export function createDebugPool(config: Partial<ConnectionPoolConfig> = {}): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 3,
    minConnections: 1,
    idleTimeout: 120000, // 2 分钟
    acquireTimeout: 10000, // 10 秒
    validateConnections: true,
    validationInterval: 30000, // 30 秒
    reuseStrategy: ConnectionReuseStrategy.BY_URL,
    loadBalanceStrategy: LoadBalanceStrategy.ROUND_ROBIN,
    healthCheckInterval: 10000, // 10 秒
    enableWarmup: false,
    ...config
  }
  
  const pool = new ConnectionPool(poolConfig)
  
  // 添加调试事件监听器
  pool.on('connectionCreated', ({ connectionId, url }) => {
    console.log(`[连接池调试] 连接已创建: ${connectionId} -> ${url}`)
  })
  
  pool.on('connectionDestroyed', ({ connectionId, reason }) => {
    console.log(`[连接池调试] 连接已销毁: ${connectionId}, 原因: ${reason}`)
  })
  
  pool.on('connectionReused', ({ connectionId, url }) => {
    console.log(`[连接池调试] 连接已重用: ${connectionId} -> ${url}`)
  })
  
  pool.on('poolFull', ({ maxConnections }) => {
    console.warn(`[连接池调试] 连接池已满: ${maxConnections}`)
  })
  
  pool.on('healthCheck', ({ healthy, unhealthy }) => {
    console.log(`[连接池调试] 健康检查: 健康=${healthy}, 不健康=${unhealthy}`)
  })
  
  return pool
}

/**
 * 创建轻量级连接池
 * 
 * @param config 连接池配置
 * @returns 连接池实例
 * 
 * @example
 * ```typescript
 * const pool = createLightweightPool({
 *   maxConnections: 2
 * })
 * ```
 */
export function createLightweightPool(config: Partial<ConnectionPoolConfig> = {}): ConnectionPool {
  const poolConfig: Partial<ConnectionPoolConfig> = {
    maxConnections: 2,
    minConnections: 0,
    idleTimeout: 180000, // 3 分钟
    acquireTimeout: 3000, // 3 秒
    validateConnections: false,
    reuseStrategy: ConnectionReuseStrategy.BY_URL,
    loadBalanceStrategy: LoadBalanceStrategy.RANDOM,
    healthCheckInterval: 0, // 禁用健康检查
    enableWarmup: false,
    ...config
  }
  
  return new ConnectionPool(poolConfig)
}
