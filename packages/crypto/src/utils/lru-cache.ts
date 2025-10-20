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
  /** 最大内存大小（字节），0 表示不限制 */
  maxMemorySize?: number
  /** 计算条目大小的函数 */
  sizeCalculator?: <V>(value: V) => number
  /** 自动清理过期项的间隔（毫秒），0 表示不自动清理 */
  cleanupInterval?: number
}

/**
 * LRU 缓存类
 */
export class LRUCache<K = string, V = unknown> {
  private maxSize: number
  private ttl: number
  private updateAgeOnGet: boolean
  private cache: Map<K, LRUNode<K, V>>
  private head: LRUNode<K, V> | null = null
  private tail: LRUNode<K, V> | null = null
  
  // 内存管理
  private maxMemorySize: number
  private currentMemorySize = 0
  private sizeCalculator: <T>(value: T) => number
  private memorySizes: Map<K, number> = new Map()
  
  // 自动清理
  private cleanupInterval: number
  private cleanupTimer?: NodeJS.Timeout | number
  
  // 统计信息
  private hits = 0
  private misses = 0
  private evictions = 0
  private memoryEvictions = 0

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize
    this.ttl = options.ttl || 0
    this.updateAgeOnGet = options.updateAgeOnGet ?? true
    this.maxMemorySize = options.maxMemorySize || 0
    this.cleanupInterval = options.cleanupInterval || 0
    this.cache = new Map()
    
    // 默认的大小计算器
    this.sizeCalculator = options.sizeCalculator || this.defaultSizeCalculator
    
    // 启动自动清理
    if (this.cleanupInterval > 0 && this.ttl > 0) {
      this.startAutoCleanup()
    }
  }
  
  /**
   * 默认的大小计算器
   */
  private defaultSizeCalculator<T>(value: T): number {
    if (value === null || value === undefined) {
      return 0
    }
    
    // 对于字符串，使用UTF-8字节长度
    if (typeof value === 'string') {
      return new Blob([value]).size
    }
    
    // 对于对象和数组，序列化后计算大小
    if (typeof value === 'object') {
      try {
        const json = JSON.stringify(value)
        return new Blob([json]).size
      } catch {
        // 如果无法序列化，返回估计值
        return 256
      }
    }
    
    // 对于数字和布尔值
    if (typeof value === 'number') {
      return 8
    }
    if (typeof value === 'boolean') {
      return 4
    }
    
    // 默认估计值
    return 64
  }
  
  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }
  
  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer as NodeJS.Timeout)
      this.cleanupTimer = undefined
    }
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
    const newSize = this.sizeCalculator(value)

    if (node) {
      // 更新现有节点
      const oldSize = this.memorySizes.get(key) || 0
      this.currentMemorySize = this.currentMemorySize - oldSize + newSize
      this.memorySizes.set(key, newSize)
      
      node.value = value
      node.timestamp = Date.now()
      this.moveToHead(node)
    } else {
      // 创建新节点
      node = new LRUNode(key, value)
      
      // 检查内存限制
      if (this.maxMemorySize > 0) {
        // 如果单个条目超过最大内存限制，拒绝添加
        if (newSize > this.maxMemorySize) {
          console.warn(`Cache entry size (${newSize} bytes) exceeds max memory size (${this.maxMemorySize} bytes)`)
          return
        }
        
        // 淘汰条目直到有足够空间
        while (this.currentMemorySize + newSize > this.maxMemorySize && this.tail) {
          this.removeTail()
          this.memoryEvictions++
        }
      }
      
      this.cache.set(key, node)
      this.addToHead(node)
      this.currentMemorySize += newSize
      this.memorySizes.set(key, newSize)

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
    
    // 更新内存大小
    const size = this.memorySizes.get(key) || 0
    this.currentMemorySize -= size
    this.memorySizes.delete(key)
    
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
    // 优化：显式解除节点引用，帮助垃圾回收
    let current = this.head
    while (current) {
      const next = current.next
      current.prev = null
      current.next = null
      current = next
    }
    
    this.cache.clear()
    this.memorySizes.clear()
    this.head = null
    this.tail = null
    this.currentMemorySize = 0
    this.hits = 0
    this.misses = 0
    this.evictions = 0
    this.memoryEvictions = 0
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
      currentMemorySize: this.currentMemorySize,
      maxMemorySize: this.maxMemorySize,
      memoryUsagePercent: this.maxMemorySize > 0 ? (this.currentMemorySize / this.maxMemorySize) * 100 : 0,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      memoryEvictions: this.memoryEvictions,
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
    this.memoryEvictions = 0
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
   * 批量获取缓存值
   * 性能优化：减少多次调用的开销
   */
  getMany(keys: K[]): Map<K, V> {
    const results = new Map<K, V>()

    for (const key of keys) {
      const value = this.get(key)
      if (value !== undefined) {
        results.set(key, value)
      }
    }

    return results
  }

  /**
   * 批量设置缓存值
   * 性能优化：减少多次调用的开销
   */
  setMany(entries: Array<[K, V]>): void {
    for (const [key, value] of entries) {
      this.set(key, value)
    }
  }

  /**
   * 批量删除缓存项
   * 性能优化：减少多次调用的开销
   */
  deleteMany(keys: K[]): number {
    let deleted = 0

    for (const key of keys) {
      if (this.delete(key)) {
        deleted++
      }
    }

    return deleted
  }

  /**
   * 获取所有键
   */
  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有值
   */
  values(): V[] {
    const values: V[] = []

    for (const node of this.cache.values()) {
      if (!this.isExpired(node)) {
        values.push(node.value)
      }
    }

    return values
  }

  /**
   * 获取所有条目
   */
  entries(): Array<[K, V]> {
    const entries: Array<[K, V]> = []

    for (const [key, node] of this.cache.entries()) {
      if (!this.isExpired(node)) {
        entries.push([key, node.value])
      }
    }

    return entries
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
    const tailNode = this.tail
    this.removeNode(tailNode)
    this.cache.delete(key)
    this.evictions++
    
    // 更新内存大小
    const size = this.memorySizes.get(key) || 0
    this.currentMemorySize -= size
    this.memorySizes.delete(key)
    
    // 优化：显式清除节点引用
    tailNode.prev = null
    tailNode.next = null
  }
  
  /**
   * 销毁缓存（释放资源）
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.clear()
  }
}

