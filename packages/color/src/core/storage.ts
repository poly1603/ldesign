/**
 * 存储和缓存系统实现
 */

import type { CacheItem, CacheOptions, LRUCache, Storage } from './types'

/**
 * 本地存储实现
 */
export class LocalStorage implements Storage {
  getItem(key: string): string | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    }
    catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value)
      }
    }
    catch (error) {
      console.warn('Failed to set localStorage item:', error)
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key)
      }
    }
    catch (error) {
      console.warn('Failed to remove localStorage item:', error)
    }
  }

  clear(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear()
      }
    }
    catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

/**
 * 会话存储实现
 */
export class SessionStorage implements Storage {
  getItem(key: string): string | null {
    try {
      return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null
    }
    catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value)
      }
    }
    catch (error) {
      console.warn('Failed to set sessionStorage item:', error)
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key)
      }
    }
    catch (error) {
      console.warn('Failed to remove sessionStorage item:', error)
    }
  }

  clear(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear()
      }
    }
    catch (error) {
      console.warn('Failed to clear sessionStorage:', error)
    }
  }
}

/**
 * 内存存储实现
 */
export class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map()

  getItem(key: string): string | null {
    return this.store.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

/**
 * 无存储实现（不保存任何数据）
 */
export class NoStorage implements Storage {
  getItem(_key: string): string | null {
    return null
  }

  setItem(_key: string, _value: string): void {
    // 不执行任何操作
  }

  removeItem(_key: string): void {
    // 不执行任何操作
  }

  clear(): void {
    // 不执行任何操作
  }
}

/**
 * Cookie 存储实现
 */
export class CookieStorage implements Storage {
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
      return null
    }

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  private setCookie(name: string, value: string, days: number = 365): void {
    if (typeof document === 'undefined') {
      return
    }

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') {
      return
    }

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  }

  getItem(key: string): string | null {
    return this.getCookie(key)
  }

  setItem(key: string, value: string): void {
    this.setCookie(key, value)
  }

  removeItem(key: string): void {
    this.deleteCookie(key)
  }

  clear(): void {
    if (typeof document === 'undefined') {
      return
    }

    // 删除所有 cookie（这是一个简化的实现）
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      this.deleteCookie(name)
    }
  }
}

/**
 * LRU 缓存实现
 */
export class LRUCacheImpl<T = any> implements LRUCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private options: Required<CacheOptions>

  constructor(options?: CacheOptions) {
    this.options = {
      maxSize: options?.maxSize || 100,
      defaultTTL: options?.defaultTTL || 60 * 60 * 1000, // 1小时
    }
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问时间
    item.accessed = Date.now()

    // 移动到最后（LRU）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const expires = now + (ttl || this.options.defaultTTL)

    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 检查大小限制
    if (this.cache.size >= this.options.maxSize) {
      // 删除最久未访问的项（第一个）
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // 添加新项
    this.cache.set(key, {
      value,
      expires,
      accessed: now,
    })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // 检查是否过期
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 清理过期项
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: 0, // 简化实现，不计算命中率
    }
  }
}

/**
 * 创建存储实例
 */
export function createStorage(type: 'localStorage' | 'sessionStorage' | 'memory' | 'cookie' | 'none'): Storage {
  switch (type) {
    case 'localStorage':
      return new LocalStorage()
    case 'sessionStorage':
      return new SessionStorage()
    case 'memory':
      return new MemoryStorage()
    case 'cookie':
      return new CookieStorage()
    case 'none':
      return new NoStorage()
    default:
      return new MemoryStorage()
  }
}

/**
 * 创建 LRU 缓存实例
 */
export function createLRUCache<T = any>(options?: CacheOptions): LRUCache<T> {
  return new LRUCacheImpl<T>(options)
}

/**
 * 默认存储实例
 */
export const defaultStorage = new LocalStorage()

/**
 * 默认缓存实例
 */
export const defaultCache = new LRUCacheImpl()
