/**
 * @ldesign/router 缓存插件
 *
 * 提供多种缓存策略的路由组件缓存功能
 */

import type { App, Component } from 'vue'
import type { CacheConfig, CacheItem, CacheStrategy } from '../components/types'
import type { RouteLocationNormalized, Router } from '../types'

// ==================== 缓存存储接口 ====================

/**
 * 缓存存储接口
 */
interface CacheStorage {
  get: (key: string) => CacheItem | null
  set: (key: string, item: CacheItem) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
}

// ==================== 内存缓存存储 ====================

/**
 * 内存缓存存储
 */
class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()

  get(key: string): CacheItem | null {
    const item = this.cache.get(key)
    if (item) {
      item.lastAccessedAt = Date.now()
      item.accessCount++
      return item
    }
    return null
  }

  set(key: string, item: CacheItem): void {
    this.cache.set(key, item)
  }

  has(key: string): boolean {
    return this.cache.has(key)
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

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// ==================== 会话存储缓存 ====================

/**
 * 会话存储缓存
 */
class SessionCacheStorage implements CacheStorage {
  private prefix = 'ldesign-router-cache:'

  get(key: string): CacheItem | null {
    if (typeof sessionStorage === 'undefined')
      return null

    try {
      const data = sessionStorage.getItem(this.prefix + key)
      if (data) {
        const item = JSON.parse(data) as CacheItem
        item.lastAccessedAt = Date.now()
        item.accessCount++
        this.set(key, item)
        return item
      }
    }
    catch (error) {
      console.warn('Failed to get from session storage:', error)
    }
    return null
  }

  set(key: string, item: CacheItem): void {
    if (typeof sessionStorage === 'undefined')
      return

    try {
      // 不能序列化组件实例，只存储元数据
      const serializable = {
        ...item,
        component: null, // 组件实例不能序列化
      }
      sessionStorage.setItem(this.prefix + key, JSON.stringify(serializable))
    }
    catch (error) {
      console.warn('Failed to set to session storage:', error)
    }
  }

  has(key: string): boolean {
    if (typeof sessionStorage === 'undefined')
      return false
    return sessionStorage.getItem(this.prefix + key) !== null
  }

  delete(key: string): boolean {
    if (typeof sessionStorage === 'undefined')
      return false
    try {
      sessionStorage.removeItem(this.prefix + key)
      return true
    }
    catch {
      return false
    }
  }

  clear(): void {
    if (typeof sessionStorage === 'undefined')
      return

    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  }

  size(): number {
    if (typeof sessionStorage === 'undefined')
      return 0

    let count = 0
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        count++
      }
    }
    return count
  }

  keys(): string[] {
    if (typeof sessionStorage === 'undefined')
      return []

    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }
}

// ==================== 本地存储缓存 ====================

/**
 * 本地存储缓存
 */
class LocalCacheStorage implements CacheStorage {
  private prefix = 'ldesign-router-cache:'

  get(key: string): CacheItem | null {
    if (typeof localStorage === 'undefined')
      return null

    try {
      const data = localStorage.getItem(this.prefix + key)
      if (data) {
        const item = JSON.parse(data) as CacheItem

        // 检查是否过期
        if (item.ttl && Date.now() > item.createdAt + item.ttl) {
          this.delete(key)
          return null
        }

        item.lastAccessedAt = Date.now()
        item.accessCount++
        this.set(key, item)
        return item
      }
    }
    catch (error) {
      console.warn('Failed to get from local storage:', error)
    }
    return null
  }

  set(key: string, item: CacheItem): void {
    if (typeof localStorage === 'undefined')
      return

    try {
      // 不能序列化组件实例，只存储元数据
      const serializable = {
        ...item,
        component: null, // 组件实例不能序列化
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(serializable))
    }
    catch (error) {
      console.warn('Failed to set to local storage:', error)
    }
  }

  has(key: string): boolean {
    if (typeof localStorage === 'undefined')
      return false
    return localStorage.getItem(this.prefix + key) !== null
  }

  delete(key: string): boolean {
    if (typeof localStorage === 'undefined')
      return false
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    }
    catch {
      return false
    }
  }

  clear(): void {
    if (typeof localStorage === 'undefined')
      return

    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  size(): number {
    if (typeof localStorage === 'undefined')
      return 0

    let count = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        count++
      }
    }
    return count
  }

  keys(): string[] {
    if (typeof localStorage === 'undefined')
      return []

    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }
}

// ==================== 缓存管理器 ====================

/**
 * 缓存管理器
 */
export class CacheManager {
  private storage: CacheStorage
  private config: CacheConfig
  private componentCache = new Map<string, Component>() // 内存中的组件缓存

  constructor(config: CacheConfig) {
    this.config = config
    this.storage = this.createStorage(config.strategy)
  }

  /**
   * 创建存储实例
   */
  private createStorage(strategy: CacheStrategy): CacheStorage {
    switch (strategy) {
      case 'session':
        return new SessionCacheStorage()
      case 'local':
        return new LocalCacheStorage()
      case 'memory':
      default:
        return new MemoryCacheStorage()
    }
  }

  /**
   * 生成缓存键（优化：减少JSON序列化开销）
   */
  private generateKey(route: RouteLocationNormalized): string {
    // 优化：只在有参数时才序列化
    const paramsStr = Object.keys(route.params).length > 0
      ? `-${JSON.stringify(route.params)}`
      : ''
    const queryStr = Object.keys(route.query).length > 0
      ? `-${JSON.stringify(route.query)}`
      : ''
    return `${route.path}${paramsStr}${queryStr}`
  }

  /**
   * 检查是否应该缓存
   */
  private shouldCache(componentName: string): boolean {
    if (this.config?.include) {
      const include = Array.isArray(this.config?.include)
        ? this.config?.include
        : [this.config?.include]
      return include.some((pattern) => {
        if (typeof pattern === 'string') {
          return componentName === pattern
        }
        return pattern.test(componentName)
      })
    }

    if (this.config?.exclude) {
      const exclude = Array.isArray(this.config?.exclude)
        ? this.config?.exclude
        : [this.config?.exclude]
      return !exclude.some((pattern) => {
        if (typeof pattern === 'string') {
          return componentName === pattern
        }
        return pattern.test(componentName)
      })
    }

    return true
  }

  /**
   * 获取缓存项
   */
  get(route: RouteLocationNormalized): Component | null {
    const key = this.generateKey(route)

    // 先检查内存缓存
    const memoryComponent = this.componentCache.get(key)
    if (memoryComponent) {
      return memoryComponent
    }

    // 再检查存储缓存
    const item = this.storage.get(key)
    if (item && item.component) {
      // 恢复到内存缓存
      this.componentCache.set(key, item.component)
      return item.component
    }

    return null
  }

  /**
   * 设置缓存项
   */
  set(route: RouteLocationNormalized, component: Component): void {
    const componentName = component.name || 'Anonymous'

    if (!this.shouldCache(componentName)) {
      return
    }

    const key = this.generateKey(route)

    // 检查缓存大小限制
    if (this.storage.size() >= this.config?.maxSize) {
      this.evict()
    }

    const item: CacheItem = {
      component,
      route,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 1,
      ttl: this.config?.ttl || 0,
    }

    // 存储到内存和持久化存储
    this.componentCache.set(key, component)
    this.storage.set(key, item)
  }

  /**
   * 检查是否存在缓存
   */
  has(route: RouteLocationNormalized): boolean {
    const key = this.generateKey(route)
    return this.componentCache.has(key) || this.storage.has(key)
  }

  /**
   * 删除缓存项
   */
  delete(route: RouteLocationNormalized): boolean {
    const key = this.generateKey(route)
    this.componentCache.delete(key)
    return this.storage.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.componentCache.clear()
    this.storage.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.storage.size(),
      memorySize: this.componentCache.size,
      maxSize: this.config?.maxSize,
      strategy: this.config?.strategy,
      keys: this.storage.keys(),
    }
  }

  /**
   * 淘汰缓存项（LRU 策略）
   */
  private evict(): void {
    const keys = this.storage.keys()
    if (keys.length === 0)
      return

    let oldestKey = keys[0]
    let oldestTime = Date.now()

    for (const key of keys) {
      const item = this.storage.get(key)
      if (item && item.lastAccessedAt < oldestTime) {
        oldestTime = item.lastAccessedAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.storage.delete(oldestKey)
      this.componentCache.delete(oldestKey)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const keys = this.storage.keys()
    for (const key of keys) {
      const item = this.storage.get(key)
      if (item && item.ttl && Date.now() > item.createdAt + item.ttl) {
        this.storage.delete(key)
        this.componentCache.delete(key)
      }
    }
  }
}

// ==================== 缓存插件 ====================

/**
 * 缓存插件选项
 */
export interface CachePluginOptions extends Partial<CacheConfig> {
  /** 是否启用缓存 */
  enabled?: boolean
}

/**
 * 创建缓存插件
 */
export function createCachePlugin(options: CachePluginOptions = {}) {
  const {
    enabled = true,
    strategy = 'memory',
    maxSize = 5, // 优化：减少默认缓存大小
    ttl,
    include,
    exclude,
  } = options

  if (!enabled) {
    return {
      install() {
        // 空实现
      },
      manager: null,
    }
  }

  const config: any = {
    strategy,
    maxSize,
    ttl: ttl || 0,
  }
  if (include !== undefined) {
    config.include = include
  }
  if (exclude !== undefined) {
    config.exclude = exclude
  }

  const manager = new CacheManager(config)

  return {
    install(app: App, router: Router) {
      // 提供缓存管理器
      app.provide('cacheManager', manager)

      // 全局属性
      app.config.globalProperties.$cacheManager = manager

      // 路由守卫：清理过期缓存
      router.afterEach(() => {
        // 定期清理过期缓存
        if (Math.random() < 0.1) {
          // 10% 概率执行清理
          manager.cleanup?.()
        }
      })
    },
    manager,
  }
}

// ==================== 缓存工具函数 ====================

/**
 * 创建缓存配置
 */
export function createCacheConfig(config: Partial<CacheConfig>): CacheConfig {
  return {
    strategy: 'memory',
    maxSize: 5, // 优化：减少默认缓存大小
    ...config,
  }
}

/**
 * 检查缓存支持
 */
export function supportsCaching(): {
  memory: boolean
  session: boolean
  local: boolean
} {
  return {
    memory: true,
    session: typeof sessionStorage !== 'undefined',
    local: typeof localStorage !== 'undefined',
  }
}

// ==================== 默认导出 ====================

export default {
  createCachePlugin,
  CacheManager,
  createCacheConfig,
  supportsCaching,
}
