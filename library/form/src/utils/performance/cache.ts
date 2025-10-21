/**
 * @ldesign/form - Cache Utilities
 * 缓存工具函数
 */

import { MAX_CACHE_SIZE } from '../constants'

/**
 * LRU 缓存
 */
export class LRUCache<K = any, V = any> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    // 更新访问顺序（移到最后）
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果缓存已满，删除最旧的项（第一个）
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // 添加新项
    this.cache.set(key, value)
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  /**
   * 获取所有值
   */
  values(): IterableIterator<V> {
    return this.cache.values()
  }

  /**
   * 遍历缓存
   */
  forEach(
    callback: (value: V, key: K, cache: LRUCache<K, V>) => void
  ): void {
    this.cache.forEach((value, key) => {
      callback(value, key, this)
    })
  }
}

/**
 * 记忆化函数
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T & { cache: LRUCache<string, ReturnType<T>> } {
  const cache = new LRUCache<string, ReturnType<T>>()

  const memoized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func.apply(this, args)
    cache.set(key, result)

    return result
  } as T & { cache: LRUCache<string, ReturnType<T>> }

  memoized.cache = cache

  return memoized
}

/**
 * 简单的内存缓存
 */
export class SimpleCache<K = any, V = any> {
  private cache: Map<K, { value: V; expireTime?: number }>

  constructor() {
    this.cache = new Map()
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (item.expireTime && Date.now() > item.expireTime) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  /**
   * 设置缓存值
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（毫秒），不传则永不过期
   */
  set(key: K, value: V, ttl?: number): void {
    const item: { value: V; expireTime?: number } = { value }

    if (ttl && ttl > 0) {
      item.expireTime = Date.now() + ttl
    }

    this.cache.set(key, item)
  }

  /**
   * 检查是否存在且未过期
   */
  has(key: K): boolean {
    const value = this.get(key)
    return value !== undefined
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }
}




