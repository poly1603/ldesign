/**
 * 缓存工具类
 */

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  value: T
  timestamp: number
  ttl?: number
}

/**
 * LRU 缓存实现
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // 重新设置以更新访问顺序
    this.cache.delete(key)
    this.cache.set(key, item)
    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl,
    }

    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项目
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, item)
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    // 检查是否过期
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  keys(): IterableIterator<string> {
    return this.cache.keys()
  }

  values(): IterableIterator<T> {
    const values: T[] = []
    for (const [key, item] of this.cache.entries()) {
      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key)
        continue
      }
      values.push(item.value)
    }
    return values[Symbol.iterator]()
  }

  entries(): IterableIterator<[string, T]> {
    const entries: [string, T][] = []
    for (const [key, item] of this.cache.entries()) {
      // 检查是否过期
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key)
        continue
      }
      entries.push([key, item.value])
    }
    return entries[Symbol.iterator]()
  }
}

/**
 * 模板缓存类
 */
export class TemplateCache extends LRUCache<any> {
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  }

  constructor(maxSize = 50) {
    super(maxSize)
  }

  get(key: string): any {
    const value = super.get(key)
    if (value !== undefined) {
      this.stats.hits++
    } else {
      this.stats.misses++
    }
    return value
  }

  set(key: string, value: any, ttl?: number): void {
    super.set(key, value, ttl)
    this.stats.sets++
  }

  delete(key: string): boolean {
    const result = super.delete(key)
    if (result) {
      this.stats.deletes++
    }
    return result
  }

  getStats() {
    return {
      ...this.stats,
      size: this.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    }
  }

  // 模板特定方法
  setTemplate(category: string, device: string, template: string, component: any): void {
    const key = `${category}:${device}:${template}`
    this.set(key, {
      component,
      timestamp: Date.now(),
      category,
      device,
      template,
    })
  }

  getTemplate(category: string, device: string, template: string): any {
    const key = `${category}:${device}:${template}`
    return this.get(key)
  }

  hasTemplate(category: string, device: string, template: string): boolean {
    const key = `${category}:${device}:${template}`
    return this.has(key)
  }

  deleteTemplate(category: string, device: string, template: string): boolean {
    const key = `${category}:${device}:${template}`
    return this.delete(key)
  }

  getTemplatesByCategory(category: string): any[] {
    const results: any[] = []
    for (const [key, value] of this.entries()) {
      if (key.startsWith(`${category}:`)) {
        results.push(value)
      }
    }
    return results
  }

  getTemplatesByDevice(device: string): any[] {
    const results: any[] = []
    for (const [key, value] of this.entries()) {
      const parts = key.split(':')
      if (parts[1] === device) {
        results.push(value)
      }
    }
    return results
  }

  cleanup(maxAge = 3600000): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, value] of this.entries()) {
      if (value && typeof value === 'object' && value.timestamp) {
        if (now - value.timestamp > maxAge) {
          this.delete(key)
          cleaned++
        }
      }
    }

    return cleaned
  }
}
