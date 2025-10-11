import type { CacheStats, LRUCache, Storage } from './types'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
  ttl?: number
  size: number
}

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 最大缓存项数量 */
  maxSize?: number
  /** 最大内存使用量（字节） */
  maxMemory?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用TTL */
  enableTTL?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 内存压力阈值（0-1） */
  memoryPressureThreshold?: number
}

/**
 * 增强的高性能 LRU 缓存实现
 *
 * 特性：
 * - 基于 Map 的插入顺序特性实现 LRU
 * - TTL 支持和自动过期清理
 * - 精确的内存使用监控
 * - 智能淘汰策略（LRU + LFU 混合）
 * - 批量操作优化
 * - 内存压力自适应
 */
export class LRUCacheImpl<T = unknown> implements LRUCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private options: Required<CacheOptions>

  // 性能统计
  private hitCount = 0
  private missCount = 0
  private evictionCount = 0
  private setCount = 0
  private currentMemoryUsage = 0

  // 批量操作优化
  private batchOperations: Array<{
    type: 'set' | 'delete'
    key: string
    value?: T
    ttl?: number
  }> = []

  private batchTimeout: any | null = null
  private cleanupTimer: any | null = null

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      maxMemory: options.maxMemory || 50 * 1024 * 1024, // 50MB
      defaultTTL: options.defaultTTL || 60 * 60 * 1000, // 1小时
      enableTTL: options.enableTTL ?? true,
      cleanupInterval: options.cleanupInterval || 5 * 60 * 1000, // 5分钟
      memoryPressureThreshold: options.memoryPressureThreshold || 0.8,
    }

    // 启动定期清理
    if (this.options.enableTTL) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) {
      this.missCount++
      return undefined
    }

    // 检查TTL
    if (this.options.enableTTL && item.ttl && this.isExpired(item)) {
      this.delete(key)
      this.missCount++
      return undefined
    }

    this.hitCount++

    // 更新访问统计
    item.accessCount++
    item.lastAccessed = Date.now()

    // 将项目移到最后（最近使用）- 利用 Map 的插入顺序
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (!item.ttl)
      return false
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 可选的TTL（毫秒）
   */
  set(key: string, value: T, ttl?: number): void {
    this.setCount++

    const now = Date.now()
    const itemSize = this.calculateSize(key, value)
    const effectiveTTL = ttl || (this.options.enableTTL ? this.options.defaultTTL : undefined)

    // 如果已存在，先删除旧项
    const existingItem = this.cache.get(key)
    if (existingItem) {
      this.currentMemoryUsage -= existingItem.size
      this.cache.delete(key)
    }

    // 检查是否需要淘汰
    this.ensureCapacity(itemSize)

    // 创建新缓存项
    const item: CacheItem<T> = {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      ttl: effectiveTTL,
      size: itemSize,
    }

    // 添加新项到末尾
    this.cache.set(key, item)
    this.currentMemoryUsage += itemSize
  }

  /**
   * 计算缓存项的大小（字节）
   */
  private calculateSize(key: string, value: T): number {
    try {
      // 基础大小：键的大小
      let size = key.length * 2 // UTF-16 字符

      // 值的大小估算
      if (typeof value === 'string') {
        size += value.length * 2
      }
      else if (typeof value === 'number') {
        size += 8
      }
      else if (typeof value === 'boolean') {
        size += 4
      }
      else if (value === null || value === undefined) {
        size += 4
      }
      else {
        // 对象类型，使用JSON序列化估算
        try {
          size += JSON.stringify(value).length * 2
        }
        catch {
          // 如果序列化失败，使用默认大小
          size += 1024
        }
      }

      // 添加元数据开销
      size += 64 // CacheItem 结构的开销

      return size
    }
    catch {
      // 如果计算失败，返回默认大小
      return 1024
    }
  }

  /**
   * 确保有足够的容量
   */
  private ensureCapacity(newItemSize: number): void {
    // 检查数量限制
    while (this.cache.size >= this.options.maxSize) {
      this.evictLeastValuable()
    }

    // 检查内存限制
    while (this.currentMemoryUsage + newItemSize > this.options.maxMemory) {
      if (!this.evictLeastValuable()) {
        // 如果无法淘汰更多项目，停止
        break
      }
    }

    // 检查内存压力
    const memoryPressure = this.currentMemoryUsage / this.options.maxMemory
    if (memoryPressure > this.options.memoryPressureThreshold) {
      this.performMemoryPressureCleanup()
    }
  }

  /**
   * 内存压力清理
   */
  private performMemoryPressureCleanup(): void {
    const targetSize = Math.floor(this.cache.size * 0.8) // 清理20%的项目
    const itemsToEvict = this.cache.size - targetSize

    for (let i = 0; i < itemsToEvict; i++) {
      if (!this.evictLeastValuable()) {
        break
      }
    }
  }

  /**
   * 批量设置缓存项（性能优化）
   * @param entries 键值对数组
   */
  setBatch(entries: Array<[string, T, number?]>): void {
    for (const [key, value, ttl] of entries) {
      this.batchOperations.push({ type: 'set', key, value, ttl })
    }
    this.scheduleBatchExecution()
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    this.cache.delete(key)
    this.currentMemoryUsage -= item.size
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.currentMemoryUsage = 0
    this.resetStats()
  }

  /**
   * 获取缓存大小
   * @returns 缓存项数量
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hitCount = 0
    this.missCount = 0
    this.evictionCount = 0
    this.setCount = 0
  }

  /**
   * 预热缓存
   * @param entries 预热数据
   */
  warmUp(entries: Array<[string, T]>): void {
    for (const [key, value] of entries) {
      if (this.cache.size < this.options.maxSize) {
        this.set(key, value)
      }
    }
  }

  /**
   * 智能淘汰策略：结合LRU、LFU和TTL
   */
  private evictLeastValuable(): boolean {
    if (this.cache.size === 0) {
      return false
    }

    let leastValuableKey: string | null = null
    let leastScore = Infinity

    const now = Date.now()

    // 计算每个项目的价值分数（分数越低越容易被淘汰）
    for (const [key, item] of this.cache) {
      let score = 0

      // 1. 访问频率权重（40%）
      const frequencyScore = item.accessCount / Math.max(1, this.cache.size)
      score += frequencyScore * 0.4

      // 2. 最近访问时间权重（30%）
      const timeSinceAccess = now - item.lastAccessed
      const maxTime = 24 * 60 * 60 * 1000 // 24小时
      const recencyScore = Math.max(0, 1 - timeSinceAccess / maxTime)
      score += recencyScore * 0.3

      // 3. 大小权重（20%）- 大项目更容易被淘汰
      const avgSize = this.currentMemoryUsage / this.cache.size
      const sizeScore = Math.max(0, 1 - item.size / (avgSize * 2))
      score += sizeScore * 0.2

      // 4. TTL权重（10%）- 即将过期的项目更容易被淘汰
      if (item.ttl) {
        const timeToExpire = (item.timestamp + item.ttl) - now
        const ttlScore = Math.max(0, timeToExpire / item.ttl)
        score += ttlScore * 0.1
      }
      else {
        score += 0.1 // 没有TTL的项目获得满分
      }

      if (score < leastScore) {
        leastScore = score
        leastValuableKey = key
      }
    }

    // 如果没有找到，使用传统 LRU（删除最旧的）
    if (!leastValuableKey) {
      const firstKey = this.cache.keys().next().value
      leastValuableKey = firstKey || null
    }

    if (leastValuableKey) {
      const item = this.cache.get(leastValuableKey)
      if (item) {
        this.cache.delete(leastValuableKey)
        this.currentMemoryUsage -= item.size
        this.evictionCount++
        return true
      }
    }

    return false
  }

  /**
   * 调度批量操作执行
   */
  private scheduleBatchExecution(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
    }

    this.batchTimeout = setTimeout(() => {
      this.executeBatchOperations()
    }, 0) // 在下一个事件循环中执行
  }

  /**
   * 执行批量操作
   */
  private executeBatchOperations(): void {
    for (const operation of this.batchOperations) {
      if (operation.type === 'set' && operation.value !== undefined) {
        this.set(operation.key, operation.value, operation.ttl)
      }
      else if (operation.type === 'delete') {
        this.delete(operation.key)
      }
    }
    this.batchOperations = []
    this.batchTimeout = null
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.options.cleanupInterval)
  }

  /**
   * 清理过期项目
   */
  private cleanupExpired(): void {
    if (!this.options.enableTTL)
      return

    const expiredKeys: string[] = []

    for (const [key, item] of this.cache) {
      if (item.ttl && this.isExpired(item)) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.delete(key)
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 统计信息对象
   */
  getStats(): CacheStats {
    const total = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      memoryUsagePercent: this.currentMemoryUsage / this.options.maxMemory,
    }
  }

  /**
   * 销毁缓存，清理定时器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    this.clear()
  }

  /**
   * 估算内存使用量（字节）
   */
  private estimateMemoryUsage(): number {
    return this.currentMemoryUsage
  }
}

/**
 * 本地存储实现
 */
export class LocalStorage implements Storage {
  private storageKey: string

  constructor(storageKey = 'i18n-locale') {
    this.storageKey = storageKey
  }

  /**
   * 获取存储的语言
   * @returns 语言代码或 null
   */
  getLanguage(): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null
      }
      return window.localStorage.getItem(this.storageKey)
    }
    catch (error) {
      console.warn('Failed to get language from localStorage:', error)
      return null
    }
  }

  /**
   * 设置存储的语言
   * @param locale 语言代码
   */
  setLanguage(locale: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      window.localStorage.setItem(this.storageKey, locale)
    }
    catch (error) {
      console.warn('Failed to set language to localStorage:', error)
    }
  }

  /**
   * 清除存储的语言
   */
  clearLanguage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      window.localStorage.removeItem(this.storageKey)
    }
    catch (error) {
      console.warn('Failed to clear language from localStorage:', error)
    }
  }
}

/**
 * 会话存储实现
 */
export class SessionStorage implements Storage {
  private storageKey: string

  constructor(storageKey = 'i18n-locale') {
    this.storageKey = storageKey
  }

  /**
   * 获取存储的语言
   * @returns 语言代码或 null
   */
  getLanguage(): string | null {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return null
      }
      return window.sessionStorage.getItem(this.storageKey)
    }
    catch (error) {
      console.warn('Failed to get language from sessionStorage:', error)
      return null
    }
  }

  /**
   * 设置存储的语言
   * @param locale 语言代码
   */
  setLanguage(locale: string): void {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return
      }
      window.sessionStorage.setItem(this.storageKey, locale)
    }
    catch (error) {
      console.warn('Failed to set language to sessionStorage:', error)
    }
  }

  /**
   * 清除存储的语言
   */
  clearLanguage(): void {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return
      }
      window.sessionStorage.removeItem(this.storageKey)
    }
    catch (error) {
      console.warn('Failed to clear language from sessionStorage:', error)
    }
  }
}

/**
 * 内存存储实现（不持久化）
 */
export class MemoryStorage implements Storage {
  private language: string | null = null

  /**
   * 获取存储的语言
   * @returns 语言代码或 null
   */
  getLanguage(): string | null {
    return this.language
  }

  /**
   * 设置存储的语言
   * @param locale 语言代码
   */
  setLanguage(locale: string): void {
    this.language = locale
  }

  /**
   * 清除存储的语言
   */
  clearLanguage(): void {
    this.language = null
  }
}

/**
 * 无存储实现（不存储任何内容）
 */
export class NoStorage implements Storage {
  /**
   * 获取存储的语言
   * @returns 始终返回 null
   */
  getLanguage(): string | null {
    return null
  }

  /**
   * 设置存储的语言（不执行任何操作）
   * @param _locale 语言代码
   */
  setLanguage(_locale: string): void {
    // 不执行任何操作
  }

  /**
   * 清除存储的语言（不执行任何操作）
   */
  clearLanguage(): void {
    // 不执行任何操作
  }
}

/**
 * Cookie 存储实现
 */
export class CookieStorage implements Storage {
  private storageKey: string
  private options: {
    expires?: number // 过期天数
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }

  constructor(
    storageKey = 'i18n-locale',
    options: {
      expires?: number
      path?: string
      domain?: string
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    } = {},
  ) {
    this.storageKey = storageKey
    this.options = {
      expires: 365, // 默认1年
      path: '/',
      ...options,
    }
  }

  /**
   * 获取存储的语言
   * @returns 语言代码或 null
   */
  getLanguage(): string | null {
    try {
      if (typeof document === 'undefined') {
        return null
      }

      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === this.storageKey) {
          return decodeURIComponent(value)
        }
      }
      return null
    }
    catch (error) {
      console.warn('Failed to get language from cookie:', error)
      return null
    }
  }

  /**
   * 设置存储的语言
   * @param locale 语言代码
   */
  setLanguage(locale: string): void {
    try {
      if (typeof document === 'undefined') {
        return
      }

      let cookieString = `${this.storageKey}=${encodeURIComponent(locale)}`

      if (this.options.expires) {
        const date = new Date()
        date.setTime(
          date.getTime() + this.options.expires * 24 * 60 * 60 * 1000,
        )
        cookieString += `; expires=${date.toUTCString()}`
      }

      if (this.options.path) {
        cookieString += `; path=${this.options.path}`
      }

      if (this.options.domain) {
        cookieString += `; domain=${this.options.domain}`
      }

      if (this.options.secure) {
        cookieString += '; secure'
      }

      if (this.options.sameSite) {
        cookieString += `; samesite=${this.options.sameSite}`
      }

      document.cookie = cookieString
    }
    catch (error) {
      console.warn('Failed to set language to cookie:', error)
    }
  }

  /**
   * 清除存储的语言
   */
  clearLanguage(): void {
    try {
      if (typeof document === 'undefined') {
        return
      }

      let cookieString = `${this.storageKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`

      if (this.options.path) {
        cookieString += `; path=${this.options.path}`
      }

      if (this.options.domain) {
        cookieString += `; domain=${this.options.domain}`
      }

      document.cookie = cookieString
    }
    catch (error) {
      console.warn('Failed to clear language from cookie:', error)
    }
  }
}

/**
 * 创建存储实例
 * @param type 存储类型
 * @param storageKey 存储键名
 * @returns 存储实例
 */
export function createStorage(
  type:
    | 'localStorage'
    | 'sessionStorage'
    | 'memory'
    | 'cookie'
    | 'none' = 'localStorage',
  storageKey = 'i18n-locale',
): Storage {
  switch (type) {
    case 'localStorage':
      return new LocalStorage(storageKey)
    case 'sessionStorage':
      return new SessionStorage(storageKey)
    case 'memory':
      return new MemoryStorage()
    case 'cookie':
      return new CookieStorage(storageKey)
    case 'none':
      return new NoStorage()
    default:
      return new LocalStorage(storageKey)
  }
}
