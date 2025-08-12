import type { LRUCache, Storage } from './types'

/**
 * 高性能 LRU 缓存实现
 * 使用 Map 的插入顺序特性来实现 LRU，避免频繁的删除和重新插入
 */
export class LRUCacheImpl<T = unknown> implements LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  constructor(maxSize = 100) {
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
      return undefined
    }

    // 将项目移到最后（最近使用）- 利用 Map 的插入顺序
    this.cache.set(key, value)

    return value
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 如果缓存已满，删除最旧的项（Map 的第一个项）
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    // 添加新项到末尾
    this.cache.set(key, value)
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
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
   * @returns 缓存项数量
   */
  size(): number {
    return this.cache.size
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
