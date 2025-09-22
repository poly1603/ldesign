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
    if (this.config.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | null {
    if (!this.config.enabled) {
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
    if (!this.config.enabled) {
      return
    }

    const expireTime = Date.now() + (ttl ?? this.config.defaultTTL)
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.expireTime = expireTime
      this.moveToHead(existingNode)
    } else {
      // 创建新节点
      const newNode = new LRUNode(key, value, expireTime)
      
      // 检查容量限制
      if (this.cache.size >= this.config.maxSize) {
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
      maxSize: this.config.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      evictions: this.stats.evictions,
      memoryUsage: this.stats.memoryUsage,
    }
  }

  /**
   * 批量设置
   */
  setMany(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl)
    })
  }

  /**
   * 批量获取
   */
  getMany(keys: string[]): Map<string, T> {
    const result = new Map<string, T>()
    keys.forEach(key => {
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
  warmup(entries: Array<{ key: string; value: T; ttl?: number }>): void {
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
   * 更新内存使用估算
   */
  private updateMemoryUsage(): void {
    let usage = 0
    this.cache.forEach((node, key) => {
      // 估算键和值的内存使用
      usage += key.length * 2 // UTF-16字符
      usage += this.estimateValueSize(node.value)
      usage += 64 // 节点对象开销
    })
    this.stats.memoryUsage = usage
  }

  /**
   * 估算值的内存大小
   */
  private estimateValueSize(value: T): number {
    if (value === null || value === undefined) {
      return 8
    }
    if (typeof value === 'string') {
      return value.length * 2
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return 8
    }
    // 对象类型，使用JSON序列化长度估算
    try {
      return JSON.stringify(value).length * 2
    } catch {
      return 64 // 默认估算
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.config.cleanupInterval)
  }

  /**
   * 清理过期项
   */
  private cleanupExpired(): void {
    const now = Date.now()
    const toRemove: string[] = []

    this.cache.forEach((node, key) => {
      if (now > node.expireTime) {
        toRemove.push(key)
      }
    })

    toRemove.forEach(key => {
      const node = this.cache.get(key)
      if (node) {
        this.removeNode(node)
        this.cache.delete(key)
        this.stats.evictions++
      }
    })

    if (toRemove.length > 0) {
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
