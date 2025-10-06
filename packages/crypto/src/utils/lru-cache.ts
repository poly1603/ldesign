/**
 * LRU (Least Recently Used) 缓存实现
 * 
 * 高性能的 LRU 缓存，用于优化加密操作的性能
 * 特性：
 * - O(1) 时间复杂度的读写操作
 * - 自动淘汰最久未使用的项
 * - 支持过期时间
 * - 内存使用优化
 */

/**
 * 缓存节点
 */
class LRUNode<K, V> {
  key: K
  value: V
  prev: LRUNode<K, V> | null = null
  next: LRUNode<K, V> | null = null
  timestamp: number

  constructor(key: K, value: V) {
    this.key = key
    this.value = value
    this.timestamp = Date.now()
  }
}

/**
 * LRU 缓存配置
 */
export interface LRUCacheOptions {
  /** 最大缓存数量 */
  maxSize: number
  /** 过期时间（毫秒），0 表示永不过期 */
  ttl?: number
  /** 是否在获取时更新过期时间 */
  updateAgeOnGet?: boolean
}

/**
 * LRU 缓存类
 */
export class LRUCache<K = string, V = any> {
  private maxSize: number
  private ttl: number
  private updateAgeOnGet: boolean
  private cache: Map<K, LRUNode<K, V>>
  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null
  
  // 统计信息
  private hits = 0
  private misses = 0
  private evictions = 0

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize
    this.ttl = options.ttl || 0
    this.updateAgeOnGet = options.updateAgeOnGet ?? true
    this.cache = new Map()
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const node = this.cache.get(key)
    
    if (!node) {
      this.misses++
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(node)) {
      this.delete(key)
      this.misses++
      return undefined
    }

    // 更新访问时间
    if (this.updateAgeOnGet) {
      node.timestamp = Date.now()
    }

    // 移动到链表头部（最近使用）
    this.moveToHead(node)
    this.hits++
    
    return node.value
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    let node = this.cache.get(key)

    if (node) {
      // 更新现有节点
      node.value = value
      node.timestamp = Date.now()
      this.moveToHead(node)
    } else {
      // 创建新节点
      node = new LRUNode(key, value)
      this.cache.set(key, node)
      this.addToHead(node)

      // 检查是否超过最大容量
      if (this.cache.size > this.maxSize) {
        this.removeTail()
      }
    }
  }

  /**
   * 删除缓存项
   */
  delete(key: K): boolean {
    const node = this.cache.get(key)
    
    if (!node) {
      return false
    }

    this.removeNode(node)
    this.cache.delete(key)
    return true
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    const node = this.cache.get(key)
    
    if (!node) {
      return false
    }

    // 检查是否过期
    if (this.isExpired(node)) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
    this.hits = 0
    this.misses = 0
    this.evictions = 0
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? this.hits / total : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate,
      totalRequests: total,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
    this.evictions = 0
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    if (this.ttl === 0) {
      return 0
    }

    let cleaned = 0
    const now = Date.now()
    const keysToDelete: K[] = []

    for (const [key, node] of this.cache.entries()) {
      if (now - node.timestamp > this.ttl) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.delete(key)
      cleaned++
    }

    return cleaned
  }

  /**
   * 检查节点是否过期
   */
  private isExpired(node: LRUNode<K, V>): boolean {
    if (this.ttl === 0) {
      return false
    }
    return Date.now() - node.timestamp > this.ttl
  }

  /**
   * 将节点移动到头部
   */
  private moveToHead(node: LRUNode<K, V>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: LRUNode<K, V>): void {
    node.prev = null
    node.next = this.head

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  /**
   * 从链表中移除节点
   */
  private removeNode(node: LRUNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
  }

  /**
   * 移除尾部节点（最久未使用）
   */
  private removeTail(): void {
    if (!this.tail) {
      return
    }

    const key = this.tail.key
    this.removeNode(this.tail)
    this.cache.delete(key)
    this.evictions++
  }
}

