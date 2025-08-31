/**
 * 缓存管理工具
 * 
 * 提供模板组件和配置的缓存功能
 */

import type { Component } from 'vue'
import type { TemplateMetadata } from '../types/template'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  /** 缓存的数据 */
  data: T
  /** 创建时间 */
  timestamp: number
  /** 过期时间（毫秒） */
  ttl?: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessed: number
}

/**
 * 缓存配置选项
 */
interface CacheOptions {
  /** 最大缓存数量 */
  maxSize?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用LRU淘汰策略 */
  enableLRU?: boolean
}

/**
 * 通用缓存管理器
 */
class CacheManager<T> {
  private cache = new Map<string, CacheItem<T>>()
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: 100,
      defaultTTL: 30 * 60 * 1000, // 30分钟
      enableLRU: true,
      ...options
    }
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.options.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, item)
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()

    // 检查是否过期
    if (item.ttl && now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccessed = now

    return item.data
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now()
    let totalSize = 0
    let expiredCount = 0
    let totalAccess = 0

    for (const [key, item] of this.cache) {
      totalSize++
      totalAccess += item.accessCount

      if (item.ttl && now - item.timestamp > item.ttl) {
        expiredCount++
      }
    }

    return {
      totalSize,
      maxSize: this.options.maxSize,
      expiredCount,
      totalAccess,
      hitRate: totalAccess > 0 ? (totalSize / totalAccess) : 0
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.cache) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    if (!this.options.enableLRU || this.cache.size === 0) return

    let lruKey = ''
    let lruTime = Date.now()

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }
}

/**
 * 组件缓存管理器
 */
export class ComponentCache extends CacheManager<Component> {
  constructor() {
    super({
      maxSize: 50,
      defaultTTL: 60 * 60 * 1000, // 1小时
      enableLRU: true
    })
  }

  /**
   * 生成组件缓存键
   */
  private generateKey(category: string, device: string, templateName: string): string {
    return `${category}:${device}:${templateName}`
  }

  /**
   * 缓存组件
   */
  cacheComponent(
    category: string,
    device: string,
    templateName: string,
    component: Component
  ): void {
    const key = this.generateKey(category, device, templateName)
    this.set(key, component)
  }

  /**
   * 获取缓存的组件
   */
  getComponent(
    category: string,
    device: string,
    templateName: string
  ): Component | null {
    const key = this.generateKey(category, device, templateName)
    return this.get(key)
  }

  /**
   * 检查组件是否已缓存
   */
  hasComponent(category: string, device: string, templateName: string): boolean {
    const key = this.generateKey(category, device, templateName)
    return this.has(key)
  }

  /**
   * 删除组件缓存
   */
  removeComponent(category: string, device: string, templateName: string): boolean {
    const key = this.generateKey(category, device, templateName)
    return this.delete(key)
  }
}

/**
 * 模板元数据缓存管理器
 */
export class MetadataCache extends CacheManager<TemplateMetadata> {
  constructor() {
    super({
      maxSize: 200,
      defaultTTL: 10 * 60 * 1000, // 10分钟
      enableLRU: true
    })
  }
}

/**
 * 全局缓存实例
 */
export const componentCache = new ComponentCache()
export const metadataCache = new MetadataCache()

/**
 * 创建模板缓存
 *
 * @param options 缓存配置选项
 * @returns 缓存管理器实例
 */
export function createTemplateCache(options: CacheOptions = {}) {
  return new CacheManager(options)
}

/**
 * 清空模板缓存
 */
export function clearTemplateCache(): void {
  componentCache.clear()
  metadataCache.clear()
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 清空所有缓存
   */
  clearAll(): void {
    componentCache.clear()
    metadataCache.clear()
  },

  /**
   * 获取所有缓存统计信息
   */
  getAllStats() {
    return {
      component: componentCache.getStats(),
      metadata: metadataCache.getStats()
    }
  },

  /**
   * 清理所有过期缓存
   */
  cleanupAll(): { component: number; metadata: number } {
    return {
      component: componentCache.cleanup(),
      metadata: metadataCache.cleanup()
    }
  }
}
