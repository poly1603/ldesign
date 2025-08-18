import type { LRUCache, Storage } from './types'

/**
 * 增强的高性能 LRU 缓存实现
 *
 * 特性：
 * - 基于 Map 的插入顺序特性实现 LRU
 * - 性能指标收集（命中率、淘汰次数等）
 * - 内存使用监控
 * - 缓存预热支持
 * - 智能淘汰策略
 */
export class LRUCacheImpl<T = unknown> implements LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  // 性能统计
  private hitCount = 0
  private missCount = 0
  private evictionCount = 0
  private setCount = 0

  // 缓存键的访问频率统计
  private accessFrequency = new Map<string, number>()

  // 批量操作优化
  private batchOperations: Array<{
    type: 'set' | 'delete'
    key: string
    value?: T
  }> = []
  private batchTimeout: NodeJS.Timeout | null = null

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值或 undefined
   */
  get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value === undefined) {
      this.missCount++
      return undefined
    }

    this.hitCount++

    // 更新访问频率
    this.accessFrequency.set(key, (this.accessFrequency.get(key) || 0) + 1)

    // 将项目移到最后（最近使用）- 利用 Map 的插入顺序
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T): void {
    this.setCount++

    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 使用智能淘汰策略
      this.evictLeastValuable()
    }

    // 添加新项到末尾
    this.cache.set(key, value)
    this.accessFrequency.set(key, 1)
  }

  /**
   * 批量设置缓存项（性能优化）
   * @param entries 键值对数组
   */
  setBatch(entries: Array<[string, T]>): void {
    for (const [key, value] of entries) {
      this.batchOperations.push({ type: 'set', key, value })
    }
    this.scheduleBatchExecution()
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.accessFrequency.delete(key)
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessFrequency.clear()
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
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hitCount + this.missCount
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
      evictionCount: this.evictionCount,
      setCount: this.setCount,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.estimateMemoryUsage(),
    }
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
      if (this.cache.size < this.maxSize) {
        this.cache.set(key, value)
        this.accessFrequency.set(key, 1)
      }
    }
  }

  /**
   * 智能淘汰策略：结合访问频率和时间
   */
  private evictLeastValuable(): void {
    let leastValuableKey: string | null = null
    let leastFrequency = Infinity

    // 找到访问频率最低的键
    for (const [key] of this.cache) {
      const frequency = this.accessFrequency.get(key) || 0
      if (frequency < leastFrequency) {
        leastFrequency = frequency
        leastValuableKey = key
      }
    }

    // 如果没有找到，使用传统 LRU（删除最旧的）
    if (!leastValuableKey) {
      const firstKey = this.cache.keys().next().value
      leastValuableKey = firstKey || null
    }

    if (leastValuableKey) {
      this.cache.delete(leastValuableKey)
      this.accessFrequency.delete(leastValuableKey)
      this.evictionCount++
    }
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
        this.set(operation.key, operation.value)
      } else if (operation.type === 'delete') {
        this.delete(operation.key)
      }
    }
    this.batchOperations = []
    this.batchTimeout = null
  }

  /**
   * 估算内存使用量（字节）
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0

    for (const [key, value] of this.cache) {
      // 估算键的大小
      totalSize += key.length * 2 // UTF-16 字符

      // 估算值的大小
      if (typeof value === 'string') {
        totalSize += value.length * 2
      } else if (typeof value === 'object' && value !== null) {
        totalSize += JSON.stringify(value).length * 2
      } else {
        totalSize += 8 // 基本类型大约 8 字节
      }
    }

    return totalSize
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } = {}
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
    } catch (error) {
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
          date.getTime() + this.options.expires * 24 * 60 * 60 * 1000
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
    } catch (error) {
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
    } catch (error) {
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
  storageKey = 'i18n-locale'
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
