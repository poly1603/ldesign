/**
 * LRU缓存系统 - 最近最少使用缓存实现
 * 提供高效的内存管理和资源回收
 */

import type {
  CacheItem,
  CacheStats,
  LRUCache,
  CacheOptions
} from '../types'

/**
 * 双向链表节点
 */
class CacheNode<T = any> {
  key: string
  value: T
  size: number
  accessTime: number
  createTime: number
  ttl: number | undefined
  prev: CacheNode<T> | null = null
  next: CacheNode<T> | null = null

  constructor(key: string, value: T, size: number = 1, ttl: number | undefined = undefined) {
    this.key = key
    this.value = value
    this.size = size
    this.accessTime = Date.now()
    this.createTime = this.accessTime
    this.ttl = ttl
  }

  /**
   * 检查节点是否已过期
   */
  isExpired(): boolean {
    if (!this.ttl) return false
    return Date.now() - this.createTime > this.ttl
  }

  /**
   * 更新访问时间
   */
  updateAccessTime(): void {
    this.accessTime = Date.now()
  }

  /**
   * 转换为缓存项
   */
  toCacheItem(): CacheItem<T> {
    return {
      key: this.key,
      value: this.value,
      size: this.size,
      accessTime: this.accessTime,
      createTime: this.createTime,
      ttl: this.ttl
    }
  }
}

/**
 * LRU缓存实现
 */
export class LRUCacheImpl<T = any> implements LRUCache<T> {
  private readonly maxSize: number
  private readonly maxItems: number
  private readonly defaultTtl: number | undefined
  
  private currentSize = 0
  private itemCount = 0
  private hits = 0
  private misses = 0
  
  private readonly cache = new Map<string, CacheNode<T>>()
  private readonly head: CacheNode<T>
  private readonly tail: CacheNode<T>
  
  private cleanupTimer?: NodeJS.Timeout | undefined
  private readonly cleanupInterval = 60000 // 1分钟清理一次过期项

  constructor(options: CacheOptions) {
    this.maxSize = options.maxSize
    this.maxItems = options.maxItems
    this.defaultTtl = options.ttl && options.ttl > 0 ? options.ttl : undefined
    
    // 创建哨兵节点
    this.head = new CacheNode('__head__', null as any, 0)
    this.tail = new CacheNode('__tail__', null as any, 0)
    this.head.next = this.tail
    this.tail.prev = this.head
    
    // 启动定期清理
    this.startCleanup()
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const node = this.cache.get(key)
    
    if (!node) {
      this.misses++
      return undefined
    }
    
    // 检查是否过期
    if (node.isExpired()) {
      this.delete(key)
      this.misses++
      return undefined
    }
    
    // 更新访问时间并移到头部
    node.updateAccessTime()
    this.moveToHead(node)
    this.hits++
    
    return node.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, size: number = 1): void {
    const existingNode = this.cache.get(key)
    
    if (existingNode) {
      // 更新现有节点
      this.currentSize = this.currentSize - existingNode.size + size
      existingNode.value = value
      existingNode.size = size
      existingNode.updateAccessTime()
      existingNode.createTime = Date.now()
      existingNode.ttl = this.defaultTtl || undefined
      this.moveToHead(existingNode)
    } else {
      // 创建新节点
      const newNode = new CacheNode(key, value, size, this.defaultTtl)
      
      // 检查容量限制
      this.ensureCapacity(size)
      
      this.cache.set(key, newNode)
      this.addToHead(newNode)
      this.currentSize += size
      this.itemCount++
    }
    
    // 确保不超过限制
    this.evictIfNecessary()
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const node = this.cache.get(key)
    if (!node) return false
    
    if (node.isExpired()) {
      this.delete(key)
      return false
    }
    
    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const node = this.cache.get(key)
    if (!node) return false
    
    this.cache.delete(key)
    this.removeNode(node)
    this.currentSize -= node.size
    this.itemCount--
    
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head.next = this.tail
    this.tail.prev = this.head
    this.currentSize = 0
    this.itemCount = 0
    this.hits = 0
    this.misses = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.currentSize,
      itemCount: this.itemCount,
      hitRate: total > 0 ? this.hits / total : 0
    }
  }

  /**
   * 调整缓存大小
   */
  resize(maxSize: number, maxItems: number): void {
    const oldMaxSize = this.maxSize
    const oldMaxItems = this.maxItems
    
    // 更新限制（需要类型断言因为这些是readonly）
    ;(this as any).maxSize = maxSize
    ;(this as any).maxItems = maxItems
    
    // 如果新限制更小，需要清理
    if (maxSize < oldMaxSize || maxItems < oldMaxItems) {
      this.evictIfNecessary()
    }
  }

  /**
   * 获取所有缓存项（用于调试）
   */
  getAllItems(): CacheItem<T>[] {
    const items: CacheItem<T>[] = []
    let current = this.head.next
    
    while (current && current !== this.tail) {
      if (!current.isExpired()) {
        items.push(current.toCacheItem())
      }
      current = current.next
    }
    
    return items
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 将节点移到头部
   */
  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: CacheNode<T>): void {
    node.prev = this.head
    node.next = this.head.next
    
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node
  }

  /**
   * 移除节点
   */
  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  /**
   * 移除尾部节点
   */
  private removeTail(): CacheNode<T> | null {
    const lastNode = this.tail.prev
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode)
      return lastNode
    }
    return null
  }

  /**
   * 确保有足够容量
   */
  private ensureCapacity(newItemSize: number): void {
    // 如果单个项目就超过最大容量，拒绝添加
    if (newItemSize > this.maxSize) {
      throw new Error(`Item size (${newItemSize}) exceeds maximum cache size (${this.maxSize})`)
    }
    
    // 清理过期项
    this.cleanupExpired()
    
    // 如果仍然没有足够空间，清理LRU项
    while (this.currentSize + newItemSize > this.maxSize || this.itemCount >= this.maxItems) {
      const removed = this.removeTail()
      if (!removed) break
      
      this.cache.delete(removed.key)
      this.currentSize -= removed.size
      this.itemCount--
    }
  }

  /**
   * 必要时清理缓存
   */
  private evictIfNecessary(): void {
    this.cleanupExpired()
    
    while (this.currentSize > this.maxSize || this.itemCount > this.maxItems) {
      const removed = this.removeTail()
      if (!removed) break
      
      this.cache.delete(removed.key)
      this.currentSize -= removed.size
      this.itemCount--
    }
  }

  /**
   * 清理过期项
   */
  private cleanupExpired(): void {
    const expiredKeys: string[] = []
    
    for (const [key, node] of this.cache) {
      if (node.isExpired()) {
        expiredKeys.push(key)
      }
    }
    
    for (const key of expiredKeys) {
      this.delete(key)
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * 停止定期清理
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }
}

/**
 * 创建LRU缓存实例
 */
export function createLRUCache<T = any>(options: CacheOptions): LRUCache<T> {
  return new LRUCacheImpl<T>(options)
}

/**
 * 默认缓存配置
 */
export const defaultCacheOptions: CacheOptions = {
  maxSize: 100 * 1024 * 1024, // 100MB
  maxItems: 1000,
  ttl: 30 * 60 * 1000, // 30分钟
  strategy: 'lru'
}

/**
 * 创建默认LRU缓存
 */
export function createDefaultCache<T = any>(): LRUCache<T> {
  return createLRUCache<T>(defaultCacheOptions)
}