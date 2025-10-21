/**
 * LRU (Least Recently Used) Cache Implementation
 * 提供高效的LRU缓存，自动淘汰最久未使用的项
 */

export interface LRUCacheOptions {
  maxSize: number
  onEvict?: (key: string, value: unknown) => void
}

interface CacheNode<T> {
  key: string
  value: T
  prev: CacheNode<T> | null
  next: CacheNode<T> | null
  hits: number
  lastAccess: number
}

/**
 * LRU缓存类
 * 使用双向链表+Map实现O(1)时间复杂度的get/set操作
 */
export class LRUCache<T = unknown> {
  private maxSize: number
  private cache: Map<string, CacheNode<T>>
  private head: CacheNode<T> | null = null
  private tail: CacheNode<T> | null = null
  private onEvict?: (key: string, value: T) => void

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize
    this.onEvict = options.onEvict as ((key: string, value: T) => void) | undefined
    this.cache = new Map()
  }

  /**
   * 获取缓存值
   * @param key 缓存键
   * @returns 缓存值或undefined
   */
  get(key: string): T | undefined {
    const node = this.cache.get(key)
    if (!node) {
      return undefined
    }

    // 更新访问信息
    node.hits++
    node.lastAccess = Date.now()

    // 移动到链表头部（最近使用）
    this.moveToHead(node)

    return node.value
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新已存在的节点
      existingNode.value = value
      existingNode.lastAccess = Date.now()
      this.moveToHead(existingNode)
      return
    }

    // 创建新节点
    const newNode: CacheNode<T> = {
      key,
      value,
      prev: null,
      next: null,
      hits: 0,
      lastAccess: Date.now()
    }

    this.cache.set(key, newNode)
    this.addToHead(newNode)

    // 检查容量限制
    if (this.cache.size > this.maxSize) {
      this.removeTail()
    }
  }

  /**
   * 检查键是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    const node = this.cache.get(key)
    if (!node) {
      return false
    }

    this.removeNode(node)
    this.cache.delete(key)
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    mostUsed: Array<{ key: string; hits: number }>
  } {
    const nodes = Array.from(this.cache.values())
    const totalHits = nodes.reduce((sum, node) => sum + node.hits, 0)
    const totalAccess = nodes.length * Math.max(...nodes.map(n => n.hits), 1)

    // 获取最常用的前5个
    const mostUsed = nodes
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 5)
      .map(node => ({ key: node.key, hits: node.hits }))

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccess > 0 ? (totalHits / totalAccess) * 100 : 0,
      mostUsed
    }
  }

  /**
   * 将节点移动到头部
   * @private
   */
  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  /**
   * 添加节点到头部
   * @private
   */
  private addToHead(node: CacheNode<T>): void {
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
   * @private
   */
  private removeNode(node: CacheNode<T>): void {
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
   * @private
   */
  private removeTail(): void {
    if (!this.tail) {
      return
    }

    const key = this.tail.key
    const value = this.tail.value

    this.removeNode(this.tail)
    this.cache.delete(key)

    // 触发淘汰回调
    if (this.onEvict) {
      this.onEvict(key, value)
    }
  }

  /**
   * 迭代器支持
   */
  *[Symbol.iterator](): Iterator<[string, T]> {
    let current = this.head
    while (current) {
      yield [current.key, current.value]
      current = current.next
    }
  }
}

/**
 * 创建LRU缓存实例
 */
export function createLRUCache<T = unknown>(options: LRUCacheOptions): LRUCache<T> {
  return new LRUCache<T>(options)
}




