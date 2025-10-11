/**
import { getLogger } from '../logger/unified-logger';

 * 本地存储管理器
 * 💾 提供类型安全的本地存储，支持加密、过期时间和命名空间
 */

/**
 * 存储项配置
 */
export interface StorageItem<T = unknown> {
  value: T
  timestamp: number
  expires?: number
  encrypted?: boolean
}

/**
 * 存储配置
 */
export interface StorageConfig {
  prefix?: string
  encrypt?: boolean
  encryptionKey?: string
  defaultExpires?: number
  storage?: Storage
}

/**
 * 存储管理器类
 */
export class StorageManager {
  private logger = getLogger('StorageManager')

  private config: Required<StorageConfig>
  private storage: Storage

  constructor(config: StorageConfig = {}) {
    this.config = {
      prefix: 'app_',
      encrypt: false,
      encryptionKey: '',
      defaultExpires: 0, // 0表示永不过期
      storage: typeof window !== 'undefined' ? window.localStorage : ({} as Storage),
      ...config,
    }

    this.storage = this.config.storage
  }

  /**
   * 设置存储项
   */
  set<T = unknown>(
    key: string,
    value: T,
    expires?: number
  ): void {
    const fullKey = this.getFullKey(key)
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expires: expires || this.config.defaultExpires || undefined,
      encrypted: this.config.encrypt,
    }

    let serialized = JSON.stringify(item)

    if (this.config.encrypt && this.config.encryptionKey) {
      serialized = this.encrypt(serialized)
    }

    try {
      this.storage.setItem(fullKey, serialized)
    } catch (error) {
      this.logger.error('Storage quota exceeded or storage is unavailable', error)
      // 尝试清理过期项
      this.cleanup()
      // 重试一次
      try {
        this.storage.setItem(fullKey, serialized)
      } catch {
        throw new Error('Unable to save to storage')
      }
    }
  }

  /**
   * 获取存储项
   */
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const fullKey = this.getFullKey(key)
    const serialized = this.storage.getItem(fullKey)

    if (!serialized) {
      return defaultValue
    }

    try {
      let data = serialized

      if (this.config.encrypt && this.config.encryptionKey) {
        data = this.decrypt(serialized)
      }

      const item: StorageItem<T> = JSON.parse(data)

      // 检查是否过期
      if (item.expires && Date.now() - item.timestamp > item.expires) {
        this.remove(key)
        return defaultValue
      }

      return item.value
    } catch (error) {
      this.logger.error('Failed to parse storage item', error)
      this.remove(key)
      return defaultValue
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 移除存储项
   */
  remove(key: string): void {
    const fullKey = this.getFullKey(key)
    this.storage.removeItem(fullKey)
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    const keys = this.keys()
    keys.forEach(key => this.remove(key))
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []
    const prefix = this.config.prefix

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key.slice(prefix.length))
      }
    }

    return keys
  }

  /**
   * 获取所有值
   */
  values<T = unknown>(): T[] {
    return this.keys().map(key => this.get<T>(key)).filter(v => v !== undefined) as T[]
  }

  /**
   * 获取所有条目
   */
  entries<T = unknown>(): Array<[string, T]> {
    const entries: Array<[string, T]> = []
    for (const key of this.keys()) {
      const value = this.get<T>(key)
      if (value !== undefined) {
        entries.push([key, value])
      }
    }
    return entries
  }

  /**
   * 获取存储大小（字节）
   */
  getSize(): number {
    let size = 0
    const keys = this.keys()

    for (const key of keys) {
      const fullKey = this.getFullKey(key)
      const value = this.storage.getItem(fullKey)
      if (value) {
        size += key.length + value.length
      }
    }

    return size * 2 // 字符串大小估算（UTF-16）
  }

  /**
   * 获取使用率（0-100）
   */
  getUsage(): number {
    const size = this.getSize()
    const quota = 5 * 1024 * 1024 // 假设5MB限制
    return (size / quota) * 100
  }

  /**
   * 清理过期项
   */
  cleanup(): void {
    const keys = this.keys()
    for (const key of keys) {
      this.get(key) // 会自动删除过期项
    }
  }

  /**
   * 导出所有数据
   */
  export(): string {
    const data: Record<string, unknown> = {}
    const entries = this.entries()

    for (const [key, value] of entries) {
      data[key] = value
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入数据
   */
  import(json: string, overwrite = false): void {
    try {
      const data = JSON.parse(json) as Record<string, unknown>

      for (const [key, value] of Object.entries(data)) {
        if (overwrite || !this.has(key)) {
          this.set(key, value)
        }
      }
    } catch (error) {
      throw new Error(`Failed to import data: ${(error as Error).message}`)
    }
  }

  /**
   * 创建命名空间
   */
  namespace(name: string): StorageManager {
    return new StorageManager({
      ...this.config,
      prefix: `${this.config.prefix}${name}_`,
    })
  }

  /**
   * 获取完整键名
   */
  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}`
  }

  /**
   * 简单加密（Base64 + XOR）
   * 注意：这不是安全的加密，仅用于基本的数据混淆
   */
  private encrypt(text: string): string {
    if (!this.config.encryptionKey) {
      return text
    }

    const key = this.config.encryptionKey
    let encrypted = ''

    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }

    return btoa(encrypted)
  }

  /**
   * 简单解密
   */
  private decrypt(encrypted: string): string {
    if (!this.config.encryptionKey) {
      return encrypted
    }

    const key = this.config.encryptionKey
    const text = atob(encrypted)
    let decrypted = ''

    for (let i = 0; i < text.length; i++) {
      decrypted += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }

    return decrypted
  }
}

/**
 * Session存储管理器
 */
export class SessionStorageManager extends StorageManager {
  constructor(config: Omit<StorageConfig, 'storage'> = {}) {
    super({
      ...config,
      storage: typeof window !== 'undefined' ? window.sessionStorage : ({} as Storage),
    })
  }
}

/**
 * Cookie存储管理器
 */
export class CookieStorageManager {
  private config: {
    prefix: string
    domain?: string
    path: string
    secure: boolean
    sameSite: 'Strict' | 'Lax' | 'None'
  }

  constructor(config: {
    prefix?: string
    domain?: string
    path?: string
    secure?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None'
  } = {}) {
    this.config = {
      prefix: 'app_',
      path: '/',
      secure: false,
      sameSite: 'Lax',
      ...config,
    }
  }

  /**
   * 设置Cookie
   */
  set<T = unknown>(
    key: string,
    value: T,
    expires?: number
  ): void {
    const fullKey = `${this.config.prefix}${key}`
    const serialized = JSON.stringify(value)
    const encodedValue = encodeURIComponent(serialized)

    let cookie = `${fullKey}=${encodedValue}`

    if (expires) {
      const date = new Date()
      date.setTime(date.getTime() + expires)
      cookie += `; expires=${date.toUTCString()}`
    }

    if (this.config.path) {
      cookie += `; path=${this.config.path}`
    }

    if (this.config.domain) {
      cookie += `; domain=${this.config.domain}`
    }

    if (this.config.secure) {
      cookie += '; secure'
    }

    cookie += `; SameSite=${this.config.sameSite}`

    document.cookie = cookie
  }

  /**
   * 获取Cookie
   */
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const fullKey = `${this.config.prefix}${key}`
    const cookies = document.cookie.split(';')

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === fullKey) {
        try {
          const decoded = decodeURIComponent(value)
          return JSON.parse(decoded) as T
        } catch {
          return defaultValue
        }
      }
    }

    return defaultValue
  }

  /**
   * 检查Cookie是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  /**
   * 移除Cookie
   */
  remove(key: string): void {
    this.set(key, '', -1)
  }

  /**
   * 获取所有Cookie键
   */
  keys(): string[] {
    const keys: string[] = []
    const cookies = document.cookie.split(';')
    const prefix = this.config.prefix

    for (const cookie of cookies) {
      const name = cookie.trim().split('=')[0]
      if (name.startsWith(prefix)) {
        keys.push(name.slice(prefix.length))
      }
    }

    return keys
  }
}

/**
 * 全局本地存储实例
 */
let globalLocalStorage: StorageManager | null = null
let globalSessionStorage: SessionStorageManager | null = null

/**
 * 获取全局本地存储
 */
export function getGlobalLocalStorage(): StorageManager {
  if (!globalLocalStorage) {
    globalLocalStorage = new StorageManager()
  }
  return globalLocalStorage
}

/**
 * 获取全局会话存储
 */
export function getGlobalSessionStorage(): SessionStorageManager {
  if (!globalSessionStorage) {
    globalSessionStorage = new SessionStorageManager()
  }
  return globalSessionStorage
}

/**
 * 快捷存储函数
 */
export const storage = {
  set: <T = unknown>(key: string, value: T, expires?: number) =>
    getGlobalLocalStorage().set(key, value, expires),
  get: <T = unknown>(key: string, defaultValue?: T) =>
    getGlobalLocalStorage().get<T>(key, defaultValue),
  remove: (key: string) => getGlobalLocalStorage().remove(key),
  clear: () => getGlobalLocalStorage().clear(),
  has: (key: string) => getGlobalLocalStorage().has(key),
  keys: () => getGlobalLocalStorage().keys(),
  namespace: (name: string) => getGlobalLocalStorage().namespace(name),
}

/**
 * 快捷会话存储函数
 */
export const session = {
  set: <T = unknown>(key: string, value: T, expires?: number) =>
    getGlobalSessionStorage().set(key, value, expires),
  get: <T = unknown>(key: string, defaultValue?: T) =>
    getGlobalSessionStorage().get<T>(key, defaultValue),
  remove: (key: string) => getGlobalSessionStorage().remove(key),
  clear: () => getGlobalSessionStorage().clear(),
  has: (key: string) => getGlobalSessionStorage().has(key),
  keys: () => getGlobalSessionStorage().keys(),
}
