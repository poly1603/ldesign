/**
 * LRU 缓存实现
 * 
 * 提供高性能的路由匹配结果缓存
 */

import type { MatchResult } from './types'

/**
 * LRU 缓存节点
 */
interface LRUNode {
  key: string
  value: MatchResult | null
  prev: LRUNode | null
  next: LRUNode | null
  timestamp: number
}

/**
 * LRU 缓存实现（优化版 - 支持动态容量调整）
 */
export class LRUCache {
  private capacity: number
  private size: number
  private cache: Map<string, LRUNode>
  private head: LRUNode
  private tail: LRUNode

  // 性能指标
  private hits: number = 0
  private misses: number = 0
  private lastOptimizeTime: number = Date.now()

  // 动态容量配置
  private readonly minCapacity: number = 50
  private readonly maxCapacity: number = 500
  private readonly optimizeInterval: number = 60000 // 1分钟

  constructor(capacity: number = 50) {
    this.capacity = Math.max(this.minCapacity, Math.min(capacity, this.maxCapacity))
    this.size = 0
    this.cache = new Map()

    // 创建虚拟头尾节点
    this.head = { key: '', value: null, timestamp: 0, prev: null, next: null }
    this.tail = { key: '', value: null, timestamp: 0, prev: null, next: null }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key: string): MatchResult | null | undefined {
    const node = this.cache.get(key)
    if (!node) {
      this.misses++
      this.tryOptimizeCapacity()
      return undefined
    }

    this.hits++
    // 移动到头部（最近使用）
    this.moveToHead(node)
    node.timestamp = Date.now()
    this.tryOptimizeCapacity()
    return node.value
  }

  set(key: string, value: MatchResult | null): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.timestamp = Date.now()
      this.moveToHead(existingNode)
    }
    else {
      // 创建新节点
      const newNode: LRUNode = {
        key,
        value,
        timestamp: Date.now(),
        prev: null,
        next: null,
      }

      if (this.size >= this.capacity) {
        // 移除最少使用的节点
        const tail = this.removeTail()
        if (tail) {
          this.cache.delete(tail.key)
          this.size--
        }
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)
      this.size++
    }
  }

  clear(): void {
    this.cache.clear()
    this.size = 0
    this.head.next = this.tail
    this.tail.prev = this.head
    this.hits = 0
    this.misses = 0
  }

  getStats() {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.size,
      capacity: this.capacity
    }
  }

  /**
   * 动态调整缓存大小
   */
  resize(newCapacity: number): void {
    const validCapacity = Math.max(this.minCapacity, Math.min(newCapacity, this.maxCapacity))

    if (validCapacity === this.capacity) {
      return
    }

    this.capacity = validCapacity

    // 如果新容量小于当前大小，需要移除多余的项
    while (this.size > this.capacity) {
      const tail = this.removeTail()
      if (tail) {
        this.cache.delete(tail.key)
        this.size--
      }
    }
  }

  private addToHead(node: LRUNode): void {
    node.prev = this.head
    node.next = this.head.next
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node
  }

  private removeNode(node: LRUNode): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  private removeTail(): LRUNode | null {
    const lastNode = this.tail.prev
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode)
      return lastNode
    }
    return null
  }

  private tryOptimizeCapacity(): void {
    const now = Date.now()
    if (now - this.lastOptimizeTime < this.optimizeInterval) {
      return
    }

    this.lastOptimizeTime = now
    const hitRate = this.getStats().hitRate

    // 根据命中率动态调整容量
    if (hitRate < 0.3 && this.capacity < this.maxCapacity) {
      // 低命中率，增加容量
      this.capacity = Math.min(this.capacity * 1.5, this.maxCapacity)
    } else if (hitRate > 0.8 && this.capacity > this.minCapacity) {
      // 高命中率，可以减少容量以节省内存
      this.capacity = Math.max(this.capacity * 0.8, this.minCapacity)
    }
  }
}