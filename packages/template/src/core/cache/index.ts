/**
 * 缓存管理核心模块
 * 统一管理所有缓存相关功能
 */

import type { TemplateComponent, TemplateConfig, TemplateMetadata } from '../../types'

// ============ LRU 缓存实现 ============

/**
 * LRU 缓存节点
 */
interface LRUNode<T> {
  key: string
  value: T
  prev: LRUNode<T> | null
  next: LRUNode<T> | null
  timestamp: number
  ttl?: number
}

/**
 * LRU 缓存实现
 */
export class LRUCache<T> {
  private capacity: number
  private cache = new Map<string, LRUNode<T>>()
  private head: LRUNode<T>
  private tail: LRUNode<T>

  constructor(capacity: number = 100) {
    this.capacity = capacity

    // 创建虚拟头尾节点
    this.head = { key: '', value: null as T, prev: null, next: null, timestamp: 0 }
    this.tail = { key: '', value: null as T, prev: null, next: null, timestamp: 0 }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | null {
    const node = this.cache.get(key)
    if (!node) {
      return null
    }

    // 检查是否过期
    if (node.ttl && Date.now() - node.timestamp > node.ttl) {
      this.delete(key)
      return null
    }

    // 移动到头部（最近使用）
    this.moveToHead(node)
    return node.value
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T, ttl?: number): void {
    const existingNode = this.cache.get(key)

    if (existingNode) {
      // 更新现有节点
      existingNode.value = value
      existingNode.timestamp = Date.now()
      existingNode.ttl = ttl
      this.moveToHead(existingNode)
    }
    else {
      // 创建新节点
      const newNode: LRUNode<T> = {
        key,
        value,
        prev: null,
        next: null,
        timestamp: Date.now(),
        ttl,
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)

      // 检查容量限制
      if (this.cache.size > this.capacity) {
        const tail = this.removeTail()
        if (tail) {
          this.cache.delete(tail.key)
        }
      }
    }
  }

  /**
   * 删除缓存值
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
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
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
    if (node.ttl && Date.now() - node.timestamp > node.ttl) {
      this.delete(key)
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
      // 检查是否过期
      if (!current.ttl || Date.now() - current.timestamp <= current.ttl) {
        keys.push(current.key)
      }
      current = current.next
    }

    return keys
  }

  // ============ 私有方法 ============

  private addToHead(node: LRUNode<T>): void {
    node.prev = this.head
    node.next = this.head.next
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
  }

  private moveToHead(node: LRUNode<T>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  private removeTail(): LRUNode<T> | null {
    const lastNode = this.tail.prev
    if (lastNode && lastNode !== this.head) {
      this.removeNode(lastNode)
      return lastNode
    }
    return null
  }
}

// ============ 模板缓存管理 ============

/**
 * 模板缓存管理器
 */
export class TemplateCache {
  private componentCache: LRUCache<TemplateComponent>
  private configCache: LRUCache<TemplateConfig>
  private metadataCache: LRUCache<TemplateMetadata>

  constructor(maxSize: number = 100, _defaultTTL: number = 10 * 60 * 1000) {
    this.componentCache = new LRUCache<TemplateComponent>(maxSize)
    this.configCache = new LRUCache<TemplateConfig>(maxSize)
    this.metadataCache = new LRUCache<TemplateMetadata>(maxSize)
  }

  // ============ 组件缓存 ============

  /**
   * 获取缓存的组件
   */
  getComponent(category: string, device: string, template: string): TemplateComponent | null {
    const key = `${category}/${device}/${template}`
    return this.componentCache.get(key)
  }

  /**
   * 设置组件缓存
   */
  setComponent(category: string, device: string, template: string, component: TemplateComponent, ttl?: number): void {
    const key = `${category}/${device}/${template}`
    this.componentCache.set(key, component, ttl)
  }

  /**
   * 删除组件缓存
   */
  deleteComponent(category: string, device: string, template: string): boolean {
    const key = `${category}/${device}/${template}`
    return this.componentCache.delete(key)
  }

  // ============ 配置缓存 ============

  /**
   * 获取缓存的配置
   */
  getConfig(category: string, device: string, template: string): TemplateConfig | null {
    const key = `${category}/${device}/${template}`
    return this.configCache.get(key)
  }

  /**
   * 设置配置缓存
   */
  setConfig(category: string, device: string, template: string, config: TemplateConfig, ttl?: number): void {
    const key = `${category}/${device}/${template}`
    this.configCache.set(key, config, ttl)
  }

  // ============ 元数据缓存 ============

  /**
   * 获取缓存的元数据
   */
  getMetadata(category: string, device: string, template: string): TemplateMetadata | null {
    const key = `${category}/${device}/${template}`
    return this.metadataCache.get(key)
  }

  /**
   * 设置元数据缓存
   */
  setMetadata(category: string, device: string, template: string, metadata: TemplateMetadata, ttl?: number): void {
    const key = `${category}/${device}/${template}`
    this.metadataCache.set(key, metadata, ttl)
  }

  // ============ 通用操作 ============

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.componentCache.clear()
    this.configCache.clear()
    this.metadataCache.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    components: number
    configs: number
    metadata: number
    total: number
  } {
    return {
      components: this.componentCache.size(),
      configs: this.configCache.size(),
      metadata: this.metadataCache.size(),
      total: this.componentCache.size() + this.configCache.size() + this.metadataCache.size(),
    }
  }
}

// ============ 全局缓存实例 ============

let globalTemplateCache: TemplateCache | null = null

/**
 * 获取全局模板缓存实例
 */
export function getGlobalTemplateCache(): TemplateCache {
  if (!globalTemplateCache) {
    globalTemplateCache = new TemplateCache()
  }
  return globalTemplateCache
}

/**
 * 设置全局模板缓存实例
 */
export function setGlobalTemplateCache(cache: TemplateCache): void {
  globalTemplateCache = cache
}

// ============ 便捷函数 ============

/**
 * 获取缓存的模板
 */
export function getCachedTemplate(category: string, device: string, template: string): TemplateComponent | null {
  return getGlobalTemplateCache().getComponent(category, device, template)
}

/**
 * 缓存模板
 */
export function setCachedTemplate(
  category: string,
  device: string,
  template: string,
  component: TemplateComponent,
  ttl?: number,
): void {
  getGlobalTemplateCache().setComponent(category, device, template, component, ttl)
}

/**
 * 清除模板缓存
 */
export function clearTemplateCache(): void {
  getGlobalTemplateCache().clear()
}
