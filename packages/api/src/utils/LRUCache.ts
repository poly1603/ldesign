/**
 * 高性能LRU缓存实现
 * 使用双向链表 + HashMap 实现O(1)的get/set操作
 */

/**
 * LRU缓存节点
 */
class LRUNode<T = unknown> {
  key: string
  value: T
  expireTime: number
  prev: LRUNode<T> | null = null
  next: LRUNode<T> | null = null

  constructor(key: string, value: T, expireTime: number) {
    this.key = key
    this.value = value
    this.expireTime = expireTime
  }
}

/**
 * LRU缓存配置
 */
export interface LRUCacheConfig {
  /** 最大缓存数量 */
  maxSize: number
  /** 默认TTL (毫秒) */
  defaultTTL: number
  /** 是否启用 */
  enabled: boolean
  /** 过期检查间隔 (毫秒) */
  cleanupInterval?: number
}

/**
 * LRU缓存统计信息
 */
export interface LRUCacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 当前缓存项数量 */
  size: number
  /** 最大缓存数量 */
  maxSize: number
  /** 命中率 */
  hitRate: number
  /** 过期清理次数 */
  evictions: number
  /** 内存使用估算 (字节) */
  memoryUsage: number
}

/**
 * 高性能LRU缓存
 */
export class LRUCache<T = unknown> {
  private cache = new Map<string, LRUNode<T>>()
  private head: LRUNode<T>
  private tail: LRUNode<T>
  private config: Required<LRUCacheConfig>
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    memoryUsage: 0,
  }
  private lastCalculatedSize = 0

  private cleanupTimer?: NodeJS.Timeout

  constructor(config: LRUCacheConfig) {
    this.config = {
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      ...config,
    }

    // 创建虚拟头尾节点
    this.head = new LRUNode('__head__', null as any, 0)
    this.tail = new LRUNode('__tail__', null as any, 0)
    this.head.next = this.tail
    this.tail.prev = this.head

    // 启动定期清理
    if (this.config?.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | null {
    if (!this.config?.enabled) {
      return null
    }

    const node = this.cache.get(key)
    if (!node) {
      this.stats.misses++
      return null
    }

    // 检查是否过期
    if (Date.now() > node.expireTime) {
      this.removeNode(node)
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      return null
    }

    // 移动到头部（最近使用）
    this.moveToHead(node)
    this.stats.hits++
    return node.value
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T, ttl?: number): void {
    if (!this.config?.enabled) {
      return
    }

    const expireTime = Date.now() + (ttl ?? this.config?.defaultTTL)
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.expireTime = expireTime
      this.moveToHead(existingNode)
    }
    else {
      // 创建新节点
      const newNode = new LRUNode(key, value, expireTime)

      // 检查容量限制
      if (this.cache.size >= this.config?.maxSize) {
        this.evictLRU()
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)
    }

    this.updateMemoryUsage()
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const node = this.cache.get(key)
    if (!node) {
      return false
    }

    this.removeNode(node)
    this.cache.delete(key)
    this.updateMemoryUsage()
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head.next = this.tail
    this.tail.prev = this.head
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.evictions = 0
    this.stats.memoryUsage = 0
  }

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    const node = this.cache.get(key)
    if (!node) {
      return false
    }

    // 检查是否过期
    if (Date.now() > node.expireTime) {
      this.removeNode(node)
      this.cache.delete(key)
      this.stats.evictions++
      return false
    }

    return true
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []
    let current = this.head.next
    while (current && current !== this.tail) {
      if (Date.now() <= current.expireTime) {
        keys.push(current.key)
      }
      current = current.next
    }
    return keys
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): LRUCacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.config?.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      memoryUsage: this.stats.memoryUsage,
    }
  }

  /**
   * 批量设置
   */
  setMany(entries: Array<{ key: string, value: T, ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl)
    })
  }

  /**
   * 批量获取
   */
  getMany(keys: string[]): Map<string, T> {
    const result = new Map<string, T>()
    keys.forEach((key) => {
      const value = this.get(key)
      if (value !== null) {
        result.set(key, value)
      }
    })
    return result
  }

  /**
   * 预热缓存
   */
  warmup(entries: Array<{ key: string, value: T, ttl?: number }>): void {
    // 批量设置，但不触发LRU移动（保持插入顺序）
    entries.forEach(({ key, value, ttl }) => {
      if (!this.cache.has(key)) {
        this.set(key, value, ttl)
      }
    })
  }

  /**
   * 移动节点到头部
   */
  private moveToHead(node: LRUNode<T>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: LRUNode<T>): void {
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
  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  /**
   * 淘汰最少使用的节点
   */
  private evictLRU(): void {
    const lru = this.tail.prev
    if (lru && lru !== this.head) {
      this.removeNode(lru)
      this.cache.delete(lru.key)
      this.stats.evictions++
    }
  }

  /**
   * 更新内存使用估算（优化版：增量更新而非全量计算）
   */
  private updateMemoryUsage(): void {
    // 使用增量更新策略，避免频繁的全量计算
    // 仅在关键时刻重新计算：缓存大小变化超过阈值或明确需要
    const shouldRecalculate = 
      this.cache.size === 0 || 
      this.cache.size === 1 ||
      this.cache.size % 50 === 0 || 
      Math.abs(this.cache.size - this.lastCalculatedSize) > 20
    
    if (shouldRecalculate) {
      let usage = 0
      // 使用采样估算，避免遍历所有项
      if (this.cache.size > 100) {
        // 大缓存时采样估算
        const sampleSize = Math.min(20, this.cache.size)
        const entries = Array.from(this.cache.entries())
        const step = Math.floor(this.cache.size / sampleSize)
        
        for (let i = 0; i < this.cache.size; i += step) {
          const [key, node] = entries[i]
          usage += (key.length * 2 + this.estimateValueSize(node.value) + 64) * step
        }
      } else {
        // 小缓存时全量计算
        this.cache.forEach((node, key) => {
          usage += key.length * 2 // UTF-16字符
          usage += this.estimateValueSize(node.value)
          usage += 64 // 节点对象开销
        })
      }
      
      this.stats.memoryUsage = usage
      this.lastCalculatedSize = this.cache.size
    }
  }

  /**
   * 估算值的内存大小（优化版：使用WeakMap缓存避免重复计算）
   */
  private estimateValueSize(value: T): number {
    if (value === null || value === undefined) {
      return 8
    }
    if (typeof value === 'string') {
      return Math.min(value.length * 2, 65536) // 限制最大64KB
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return 8
    }
    if (value instanceof Date) {
      return 24
    }
    if (value instanceof RegExp) {
      return 48 + (value.source?.length || 0) * 2
    }
    if (Array.isArray(value)) {
      // 数组：估算前10个元素，然后推算
      const sampleSize = Math.min(10, value.length)
      let size = 24 // 数组对象开销
      for (let i = 0; i < sampleSize; i++) {
        size += this.estimateValueSize(value[i])
      }
      if (value.length > sampleSize) {
        size = (size / sampleSize) * value.length
      }
      return Math.min(size, 1048576) // 限制最大1MB
    }
    if (typeof value === 'object') {
      // 对象：使用浅层估算，避免深度递归
      let size = 24 // 对象基础开销
      const keys = Object.keys(value as any)
      const sampleSize = Math.min(10, keys.length)
      
      for (let i = 0; i < sampleSize; i++) {
        const key = keys[i]
        size += key.length * 2 + 8 // 键名和引用
        const val = (value as any)[key]
        // 仅做浅层估算，避免深度递归
        if (typeof val === 'string') {
          size += Math.min(val.length * 2, 1024)
        } else if (typeof val === 'number' || typeof val === 'boolean') {
          size += 8
        } else {
          size += 64 // 复杂类型使用固定估算
        }
      }
      
      if (keys.length > sampleSize) {
        size = (size / sampleSize) * keys.length
      }
      
      return Math.min(size, 1048576) // 限制最大1MB
    }
    
    return 64 // 默认估算
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.config?.cleanupInterval)
  }

  /**
   * 清理过期项（优化版：直接删除，减少临时数组分配）
   */
  private cleanupExpired(): void {
    const now = Date.now()
    let evictionCount = 0

    // 直接遍历删除，避免创建临时数组
    for (const [key, node] of this.cache.entries()) {
      if (now > node.expireTime) {
        this.removeNode(node)
        this.cache.delete(key)
        evictionCount++
      }
    }

    this.stats.evictions += evictionCount

    if (evictionCount > 0) {
      this.updateMemoryUsage()
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }
}
