/**
 * 淘汰策略接口
 */
export interface EvictionStrategy {
  /** 策略名称 */
  name: string
  /** 添加访问记录 */
  recordAccess: (key: string) => void
  /** 添加新项（某些策略可利用TTL信息） */
  recordAdd: (key: string, ttl?: number) => void
  /** 获取应该淘汰的键 */
  getEvictionKey: () => string | null
  /** 移除键的记录 */
  removeKey: (key: string) => void
  /** 清空所有记录 */
  clear: () => void
  /** 获取统计信息 */
  getStats: () => Record<string, any>
}

/**
 * 双向链表节点
 */
class LRUNode {
  constructor(
    public key: string,
    public prev: LRUNode | null = null,
    public next: LRUNode | null = null,
  ) {}
}

/**
 * LRU (Least Recently Used) 淘汰策略
 *
 * 优化版本：使用双向链表+哈希表实现O(1)复杂度
 * - recordAccess: O(1)
 * - recordAdd: O(1)
 * - getEvictionKey: O(1)
 * - removeKey: O(1)
 *
 * 性能提升：从O(n)优化到O(1)，在大量缓存项时性能提升显著
 */
export class LRUStrategy implements EvictionStrategy {
  readonly name = 'LRU'
  private nodeMap: Map<string, LRUNode> = new Map()
  private head: LRUNode | null = null // 最近使用的
  private tail: LRUNode | null = null // 最久未使用的

  recordAccess(key: string): void {
    const node = this.nodeMap.get(key)
    if (node) {
      // 将节点移到头部
      this.moveToHead(node)
    }
  }

  recordAdd(key: string): void {
    // 如果已存在，移到头部
    if (this.nodeMap.has(key)) {
      this.recordAccess(key)
      return
    }

    // 创建新节点并添加到头部
    const node = new LRUNode(key)
    this.nodeMap.set(key, node)
    this.addToHead(node)
  }

  getEvictionKey(): string | null {
    // 返回尾部节点（最久未使用）
    return this.tail?.key ?? null
  }

  removeKey(key: string): void {
    const node = this.nodeMap.get(key)
    if (node) {
      this.removeNode(node)
      this.nodeMap.delete(key)
    }
  }

  clear(): void {
    this.nodeMap.clear()
    this.head = null
    this.tail = null
  }

  getStats(): Record<string, any> {
    return {
      totalKeys: this.nodeMap.size,
      headKey: this.head?.key,
      tailKey: this.tail?.key,
    }
  }

  /**
   * 将节点移到头部
   */
  private moveToHead(node: LRUNode): void {
    if (node === this.head) { return }

    // 从当前位置移除
    this.removeNode(node)
    // 添加到头部
    this.addToHead(node)
  }

  /**
   * 添加节点到头部
   */
  private addToHead(node: LRUNode): void {
    node.next = this.head
    node.prev = null

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
  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    }
    else {
      this.tail = node.prev
    }
  }
}

/**
 * LFU (Least Frequently Used) 淘汰策略
 * 
 * 淘汰使用频率最低的缓存项
 */
export class LFUStrategy implements EvictionStrategy {
  readonly name = 'LFU'
  private frequencyMap: Map<string, number> = new Map()
  private lastAccessTime: Map<string, number> = new Map()

  recordAccess(key: string): void {
    const frequency = this.frequencyMap.get(key) || 0
    this.frequencyMap.set(key, frequency + 1)
    this.lastAccessTime.set(key, Date.now())
  }

  recordAdd(key: string): void {
    this.frequencyMap.set(key, 1)
    this.lastAccessTime.set(key, Date.now())
  }

  getEvictionKey(): string | null {
    if (this.frequencyMap.size === 0) { return null }

    let evictionKey: string | null = null
    let lowestFrequency = Infinity
    let oldestTime = Infinity

    for (const [key, frequency] of this.frequencyMap) {
      const accessTime = this.lastAccessTime.get(key) || 0
      
      // 优先淘汰频率低的，频率相同则淘汰最旧的
      if (frequency < lowestFrequency 
        || (frequency === lowestFrequency && accessTime < oldestTime)) {
        lowestFrequency = frequency
        oldestTime = accessTime
        evictionKey = key
      }
    }

    return evictionKey
  }

  removeKey(key: string): void {
    this.frequencyMap.delete(key)
    this.lastAccessTime.delete(key)
  }

  clear(): void {
    this.frequencyMap.clear()
    this.lastAccessTime.clear()
  }

  getStats(): Record<string, any> {
    const frequencies = Array.from(this.frequencyMap.values())
    const avgFrequency = frequencies.length > 0
      ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
      : 0

    return {
      totalKeys: this.frequencyMap.size,
      averageFrequency: avgFrequency,
      maxFrequency: Math.max(...frequencies, 0),
      minFrequency: Math.min(...frequencies, 0),
    }
  }
}

/**
 * FIFO (First In First Out) 淘汰策略
 * 
 * 淘汰最早添加的缓存项
 */
export class FIFOStrategy implements EvictionStrategy {
  readonly name = 'FIFO'
  private queue: string[] = []

  recordAccess(_key: string): void {
    // FIFO 不关心访问顺序
  }

  recordAdd(key: string): void {
    // 避免重复
    const index = this.queue.indexOf(key)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
    this.queue.push(key)
  }

  getEvictionKey(): string | null {
    return this.queue.length > 0 ? this.queue[0] : null
  }

  removeKey(key: string): void {
    const index = this.queue.indexOf(key)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
  }

  clear(): void {
    this.queue = []
  }

  getStats(): Record<string, any> {
    return {
      queueLength: this.queue.length,
      oldestKey: this.queue[0] || null,
      newestKey: this.queue[this.queue.length - 1] || null,
    }
  }
}

/**
 * MRU (Most Recently Used) 淘汰策略
 * 
 * 淘汰最近使用的缓存项（适用于某些特殊场景）
 */
export class MRUStrategy implements EvictionStrategy {
  readonly name = 'MRU'
  private accessOrder: Map<string, number> = new Map()
  private counter = 0

  recordAccess(key: string): void {
    this.accessOrder.set(key, this.counter++)
  }

  recordAdd(key: string): void {
    this.accessOrder.set(key, this.counter++)
  }

  getEvictionKey(): string | null {
    if (this.accessOrder.size === 0) { return null }

    let newestKey: string | null = null
    let newestTime = -1

    for (const [key, time] of this.accessOrder) {
      if (time > newestTime) {
        newestTime = time
        newestKey = key
      }
    }

    return newestKey
  }

  removeKey(key: string): void {
    this.accessOrder.delete(key)
  }

  clear(): void {
    this.accessOrder.clear()
    this.counter = 0
  }

  getStats(): Record<string, any> {
    return {
      totalKeys: this.accessOrder.size,
      accessCounter: this.counter,
    }
  }
}

/**
 * 随机淘汰策略
 * 
 * 随机选择一个缓存项进行淘汰
 */
export class RandomStrategy implements EvictionStrategy {
  readonly name = 'Random'
  private keys: Set<string> = new Set()

  recordAccess(_key: string): void {
    // 随机策略不关心访问模式
  }

  recordAdd(key: string): void {
    this.keys.add(key)
  }

  getEvictionKey(): string | null {
    if (this.keys.size === 0) { return null }

    const keysArray = Array.from(this.keys)
    const randomIndex = Math.floor(Math.random() * keysArray.length)
    return keysArray[randomIndex]
  }

  removeKey(key: string): void {
    this.keys.delete(key)
  }

  clear(): void {
    this.keys.clear()
  }

  getStats(): Record<string, any> {
    return {
      totalKeys: this.keys.size,
    }
  }
}

/**
 * TTL 优先淘汰策略
 * 
 * 优先淘汰即将过期的缓存项
 */
export class TTLStrategy implements EvictionStrategy {
  readonly name = 'TTL'
  private ttlMap: Map<string, number> = new Map()

  recordAccess(_key: string): void {
    // TTL 策略不关心访问模式
  }

  recordAdd(key: string, ttl?: number): void {
    if (ttl) {
      this.ttlMap.set(key, Date.now() + ttl)
    }
  }

  getEvictionKey(): string | null {
    if (this.ttlMap.size === 0) { return null }

    const now = Date.now()
    let soonestKey: string | null = null
    let soonestExpiry = Infinity

    for (const [key, expiry] of this.ttlMap) {
      // 已过期的优先淘汰
      if (expiry <= now) {
        return key
      }
      
      // 找出最快过期的
      if (expiry < soonestExpiry) {
        soonestExpiry = expiry
        soonestKey = key
      }
    }

    return soonestKey
  }

  removeKey(key: string): void {
    this.ttlMap.delete(key)
  }

  clear(): void {
    this.ttlMap.clear()
  }

  getStats(): Record<string, any> {
    const now = Date.now()
    const expired = Array.from(this.ttlMap.values()).filter(t => t <= now).length
    const ttls = Array.from(this.ttlMap.values()).map(t => Math.max(0, t - now))
    const avgTTL = ttls.length > 0 ? ttls.reduce((a, b) => a + b, 0) / ttls.length : 0

    return {
      totalKeys: this.ttlMap.size,
      expiredKeys: expired,
      averageTTL: avgTTL,
    }
  }
}

/**
 * 自适应替换缓存策略 (ARC)
 * 
 * 结合 LRU 和 LFU 的优点，自动调整策略
 */
export class ARCStrategy implements EvictionStrategy {
  readonly name = 'ARC'
  private lru: LRUStrategy = new LRUStrategy()
  private lfu: LFUStrategy = new LFUStrategy()
  private adaptiveWeight = 0.5 // LRU 权重，1-weight 为 LFU 权重
  private hitCount = 0
  private missCount = 0

  recordAccess(key: string): void {
    this.lru.recordAccess(key)
    this.lfu.recordAccess(key)
    this.hitCount++
    this.updateWeight()
  }

  recordAdd(key: string): void {
    this.lru.recordAdd(key)
    this.lfu.recordAdd(key)
    this.missCount++
    this.updateWeight()
  }

  private updateWeight(): void {
    // 根据命中率动态调整权重
    const total = this.hitCount + this.missCount
    if (total > 100) { // 每100次访问调整一次
      const hitRate = this.hitCount / total
      
      // 命中率高时增加 LFU 权重，命中率低时增加 LRU 权重
      if (hitRate > 0.8) {
        this.adaptiveWeight = Math.max(0.2, this.adaptiveWeight - 0.1)
      }
      else if (hitRate < 0.5) {
        this.adaptiveWeight = Math.min(0.8, this.adaptiveWeight + 0.1)
      }
      
      // 重置计数器
      this.hitCount = 0
      this.missCount = 0
    }
  }

  getEvictionKey(): string | null {
    // 根据权重决定使用哪种策略
    if (Math.random() < this.adaptiveWeight) {
      return this.lru.getEvictionKey()
    }
    else {
      return this.lfu.getEvictionKey()
    }
  }

  removeKey(key: string): void {
    this.lru.removeKey(key)
    this.lfu.removeKey(key)
  }

  clear(): void {
    this.lru.clear()
    this.lfu.clear()
    this.hitCount = 0
    this.missCount = 0
    this.adaptiveWeight = 0.5
  }

  getStats(): Record<string, any> {
    return {
      lruWeight: this.adaptiveWeight,
      lfuWeight: 1 - this.adaptiveWeight,
      hitCount: this.hitCount,
      missCount: this.missCount,
      lruStats: this.lru.getStats(),
      lfuStats: this.lfu.getStats(),
    }
  }
}

/**
 * 策略工厂
 */
export class EvictionStrategyFactory {
  private static strategies: Map<string, () => EvictionStrategy> = new Map<string, () => EvictionStrategy>([
    ['LRU', () => new LRUStrategy()],
    ['LFU', () => new LFUStrategy()],
    ['FIFO', () => new FIFOStrategy()],
    ['MRU', () => new MRUStrategy()],
    ['RANDOM', () => new RandomStrategy()],
    ['TTL', () => new TTLStrategy()],
    ['ARC', () => new ARCStrategy()],
  ])

  /**
   * 创建淘汰策略
   */
  static create(name: string): EvictionStrategy {
    // 支持大小写不敏感
    const normalizedName = name.toUpperCase()
    const factory = this.strategies.get(normalizedName)
    if (!factory) {
      throw new Error(`Unknown eviction strategy: ${name}`)
    }
    return factory()
  }

  /**
   * 注册自定义策略
   */
  static register(name: string, factory: () => EvictionStrategy): void {
    this.strategies.set(name.toUpperCase(), factory)
  }

  /**
   * 获取所有可用策略名称
   */
  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys())
  }
}
