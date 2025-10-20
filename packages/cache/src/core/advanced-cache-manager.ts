/**
 * 高级缓存管理器 - 支持分层缓存、分区和优先级管理
 */

import type { SerializableValue, SetOptions, StorageEngine } from '../types'
import { CacheManager } from './cache-manager'

/**
 * 缓存层级配置
 */
export interface CacheTier {
  /** 层级名称 */
  name: string
  /** 存储引擎 */
  engine: StorageEngine
  /** 最大容量（字节） */
  maxSize: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 优先级（数字越小优先级越高） */
  priority: number
}

/**
 * 缓存分区配置
 */
export interface CachePartition {
  /** 分区名称 */
  name: string
  /** 键前缀或模式 */
  keyPattern: string | RegExp
  /** 指定的缓存层级 */
  tiers?: string[]
  /** 最大项数 */
  maxItems?: number
  /** 优先级 */
  priority?: 'high' | 'medium' | 'low'
}

/**
 * 缓存项优先级
 */
export enum CachePriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3
}

/**
 * 缓存项元数据扩展
 */
interface _ExtendedMetadata {
  priority: CachePriority
  partition?: string
  tier?: string
  accessFrequency: number
  lastPromotionTime?: number
  cost?: number // 获取成本（用于成本感知淘汰）
}

/**
 * 分层缓存管理器
 */
export class TieredCacheManager {
  private tiers: Map<string, { config: CacheTier, manager: CacheManager }> = new Map()
  private tierOrder: string[] = []
  
  constructor(tiers: CacheTier[]) {
    // 按优先级排序
    const sorted = [...tiers].sort((a, b) => a.priority - b.priority)
    
    for (const tier of sorted) {
      const manager = new CacheManager({
        defaultEngine: tier.engine,
        defaultTTL: tier.defaultTTL,
        maxMemory: tier.maxSize
      })
      
      this.tiers.set(tier.name, { config: tier, manager })
      this.tierOrder.push(tier.name)
    }
  }
  
  /**
   * 分层设置缓存
   */
  async set<T extends SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions & { tier?: string }
  ): Promise<void> {
    // 如果指定了层级
    if (options?.tier) {
      const tier = this.tiers.get(options.tier)
      if (tier) {
        await tier.manager.set(key, value, options)
        return
      }
    }
    
    // 默认写入第一层（最快的层）
    const firstTier = this.tiers.get(this.tierOrder[0])
    if (firstTier) {
      await firstTier.manager.set(key, value, options)
    }
  }
  
  /**
   * 分层获取缓存
   */
  async get<T extends SerializableValue>(key: string): Promise<T | null> {
    // 从高优先级到低优先级查找
    for (const tierName of this.tierOrder) {
      const tier = this.tiers.get(tierName)
      if (!tier) continue
      
      const value = await tier.manager.get<T>(key)
      if (value !== null) {
        // 提升到更高层级（如果不是最高层）
        const currentIndex = this.tierOrder.indexOf(tierName)
        if (currentIndex > 0) {
          await this.promote(key, value, tierName, this.tierOrder[0])
        }
        return value
      }
    }
    
    return null
  }
  
  /**
   * 提升缓存项到更高层级
   */
  private async promote<T extends SerializableValue>(
    key: string,
    value: T,
    fromTier: string,
    toTier: string
  ): Promise<void> {
    const source = this.tiers.get(fromTier)
    const target = this.tiers.get(toTier)
    
    if (!source || !target) return
    
    // 写入目标层级
    await target.manager.set(key, value, {
      ttl: 3600000 // 默认1小时
    })
    
    // 可选：从源层级删除（避免重复）
    // await source.manager.remove(key)
  }
  
  /**
   * 降级缓存项到更低层级
   */
  async demote(key: string, fromTier: string, toTier: string): Promise<void> {
    const source = this.tiers.get(fromTier)
    const target = this.tiers.get(toTier)
    
    if (!source || !target) return
    
    const value = await source.manager.get(key)
    if (value !== null) {
      await target.manager.set(key, value)
      await source.manager.remove(key)
    }
  }
  
  /**
   * 获取所有层级的统计信息
   */
  async getStats(): Promise<Map<string, any>> {
    const stats = new Map()
    
    for (const [name, tier] of this.tiers) {
      stats.set(name, await tier.manager.getStats())
    }
    
    return stats
  }
}

/**
 * 分区缓存管理器
 */
export class PartitionedCacheManager {
  private partitions = new Map<string, CachePartition>()
  private partitionManagers = new Map<string, CacheManager>()
  private defaultManager: CacheManager
  
  constructor(partitions: CachePartition[], defaultConfig?: any) {
    this.defaultManager = new CacheManager(defaultConfig)
    
    for (const partition of partitions) {
      this.partitions.set(partition.name, partition)
      this.partitionManagers.set(
        partition.name,
        new CacheManager({
          keyPrefix: partition.name,
          maxItems: partition.maxItems
        })
      )
    }
  }
  
  /**
   * 根据键选择分区
   */
  private selectPartition(key: string): string | null {
    for (const [name, partition] of this.partitions) {
      if (typeof partition.keyPattern === 'string') {
        if (key.startsWith(partition.keyPattern)) {
          return name
        }
      } else if (partition.keyPattern instanceof RegExp) {
        if (partition.keyPattern.test(key)) {
          return name
        }
      }
    }
    return null
  }
  
  /**
   * 设置缓存（自动路由到分区）
   */
  async set<T extends SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions
  ): Promise<void> {
    const partitionName = this.selectPartition(key)
    const manager = partitionName 
      ? this.partitionManagers.get(partitionName) || this.defaultManager
      : this.defaultManager
    
    await manager.set(key, value, options)
  }
  
  /**
   * 获取缓存（自动路由到分区）
   */
  async get<T extends SerializableValue>(key: string): Promise<T | null> {
    const partitionName = this.selectPartition(key)
    const manager = partitionName
      ? this.partitionManagers.get(partitionName) || this.defaultManager
      : this.defaultManager
    
    return manager.get<T>(key)
  }
  
  /**
   * 获取分区统计
   */
  async getPartitionStats(): Promise<Map<string, any>> {
    const stats = new Map()
    
    for (const [name, manager] of this.partitionManagers) {
      stats.set(name, await manager.getStats())
    }
    
    stats.set('default', await this.defaultManager.getStats())
    return stats
  }
}

/**
 * 优先级感知缓存管理器
 */
export class PriorityCacheManager {
  private cache: CacheManager
  private priorities = new Map<string, CachePriority>()
  private priorityQueues = new Map<CachePriority, Set<string>>()
  
  constructor(config?: any) {
    this.cache = new CacheManager(config)
    
    // 初始化优先级队列
    for (const priority of Object.values(CachePriority)) {
      if (typeof priority === 'number') {
        this.priorityQueues.set(priority, new Set())
      }
    }
  }
  
  /**
   * 设置带优先级的缓存
   */
  async set<T extends SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions & { priority?: CachePriority }
  ): Promise<void> {
    const priority = options?.priority ?? CachePriority.MEDIUM
    
    // 记录优先级
    this.priorities.set(key, priority)
    this.priorityQueues.get(priority)?.add(key)
    
    // 设置缓存
    await this.cache.set(key, value, options)
  }
  
  /**
   * 获取缓存并更新访问频率
   */
  async get<T extends SerializableValue>(key: string): Promise<T | null> {
    const value = await this.cache.get<T>(key)
    
    if (value !== null) {
      // 可以在这里实现动态优先级调整
      const currentPriority = this.priorities.get(key)
      if (currentPriority !== undefined && currentPriority < CachePriority.CRITICAL) {
        // 频繁访问的项可以提升优先级
        await this.promotePriority(key)
      }
    }
    
    return value
  }
  
  /**
   * 提升优先级
   */
  private async promotePriority(key: string): Promise<void> {
    const current = this.priorities.get(key)
    if (current === undefined || current >= CachePriority.CRITICAL) return
    
    // 从当前队列移除
    this.priorityQueues.get(current)?.delete(key)
    
    // 提升一级
    const newPriority = current + 1 as CachePriority
    this.priorities.set(key, newPriority)
    this.priorityQueues.get(newPriority)?.add(key)
  }
  
  /**
   * 基于优先级的淘汰
   */
  async evictByPriority(count: number): Promise<void> {
    let evicted = 0
    
    // 从低优先级开始淘汰
    for (const priority of [CachePriority.LOW, CachePriority.MEDIUM, CachePriority.HIGH]) {
      const queue = this.priorityQueues.get(priority)
      if (!queue) continue
      
      for (const key of queue) {
        await this.cache.remove(key)
        queue.delete(key)
        this.priorities.delete(key)
        evicted++
        
        if (evicted >= count) return
      }
    }
  }
  
  /**
   * 获取优先级统计
   */
  getPriorityStats(): Map<CachePriority, number> {
    const stats = new Map<CachePriority, number>()
    
    for (const [priority, queue] of this.priorityQueues) {
      stats.set(priority, queue.size)
    }
    
    return stats
  }
}

/**
 * 成本感知缓存管理器
 */
export class CostAwareCacheManager {
  private cache: CacheManager
  private costs = new Map<string, number>()
  private values = new Map<string, number>()
  
  constructor(config?: any) {
    this.cache = new CacheManager(config)
  }
  
  /**
   * 设置带成本的缓存
   */
  async set<T extends SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions & { cost?: number, value?: number }
  ): Promise<void> {
    // 记录成本和价值
    if (options?.cost !== undefined) {
      this.costs.set(key, options.cost)
    }
    if (options?.value !== undefined) {
      this.values.set(key, options.value)
    }
    
    await this.cache.set(key, value, options)
  }
  
  /**
   * 基于价值/成本比的淘汰
   */
  async evictByValueCostRatio(count: number): Promise<void> {
    // 计算所有项的价值/成本比
    const ratios: Array<{ key: string, ratio: number }> = []
    
    for (const [key, cost] of this.costs) {
      const value = this.values.get(key) || 1
      ratios.push({ key, ratio: value / cost })
    }
    
    // 按比率排序，淘汰比率最低的
    ratios.sort((a, b) => a.ratio - b.ratio)
    
    for (let i = 0; i < Math.min(count, ratios.length); i++) {
      const { key } = ratios[i]
      await this.cache.remove(key)
      this.costs.delete(key)
      this.values.delete(key)
    }
  }
}

/**
 * 创建高级缓存管理器
 */
export function createAdvancedCacheManager(config: {
  type: 'tiered' | 'partitioned' | 'priority' | 'cost'
  tiers?: CacheTier[]
  partitions?: CachePartition[]
  options?: any
}): TieredCacheManager | PartitionedCacheManager | PriorityCacheManager | CostAwareCacheManager {
  switch (config.type) {
    case 'tiered':
      if (!config.tiers) {
        throw new Error('Tiers configuration is required for tiered cache')
      }
      return new TieredCacheManager(config.tiers)
    
    case 'partitioned':
      if (!config.partitions) {
        throw new Error('Partitions configuration is required for partitioned cache')
      }
      return new PartitionedCacheManager(config.partitions, config.options)
    
    case 'priority':
      return new PriorityCacheManager(config.options)
    
    case 'cost':
      return new CostAwareCacheManager(config.options)
    
    default:
      throw new Error(`Unknown cache type: ${config.type}`)
  }
}