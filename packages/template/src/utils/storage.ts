/**
 * 本地存储工具
 * 提供类型安全、加密、过期时间等高级功能
 */

/**
 * 存储项配置
 */
export interface StorageItemConfig {
  /** 过期时间(毫秒) */
  ttl?: number
  /** 是否加密 */
  encrypt?: boolean
  /** 是否压缩 */
  compress?: boolean
}

/**
 * 存储项
 */
interface StorageItem<T = any> {
  /** 值 */
  value: T
  /** 创建时间 */
  createdAt: number
  /** 过期时间 */
  expiresAt?: number
  /** 是否加密 */
  encrypted?: boolean
  /** 是否压缩 */
  compressed?: boolean
}

/**
 * 存储选项
 */
export interface StorageOptions {
  /** 存储键前缀 */
  prefix?: string
  /** 默认过期时间(毫秒) */
  defaultTTL?: number
  /** 是否默认加密 */
  defaultEncrypt?: boolean
  /** 加密密钥 */
  encryptionKey?: string
  /** 存储类型 */
  storageType?: 'localStorage' | 'sessionStorage'
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<StorageOptions> = {
  prefix: 'ldesign_',
  defaultTTL: 0, // 0 表示永不过期
  defaultEncrypt: false,
  encryptionKey: 'ldesign-default-key',
  storageType: 'localStorage',
}

/**
 * 存储管理类
 */
export class StorageManager {
  private options: Required<StorageOptions>
  private storage: Storage

  constructor(options: StorageOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.storage = typeof window !== 'undefined'
      ? (this.options.storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage)
      : ({
          length: 0,
          clear: () => {},
          getItem: () => null,
          key: () => null,
          removeItem: () => {},
          setItem: () => {},
        } as Storage) // SSR 兼容
  }

  /**
   * 获取完整键名
   */
  private getFullKey(key: string): string {
    return `${this.options.prefix}${key}`
  }

  /**
   * 设置存储项
   */
  set<T>(key: string, value: T, config: StorageItemConfig = {}): boolean {
    try {
      const {
        ttl = this.options.defaultTTL,
        encrypt = this.options.defaultEncrypt,
        compress = false,
      } = config

      const now = Date.now()
      const item: StorageItem<T> = {
        value,
        createdAt: now,
        expiresAt: ttl > 0 ? now + ttl : undefined,
        encrypted: encrypt,
        compressed: compress,
      }

      let serialized = JSON.stringify(item)

      // 加密
      if (encrypt) {
        serialized = this.encrypt(serialized)
      }

      // 压缩
      if (compress) {
        serialized = this.compress(serialized)
      }

      this.storage.setItem(this.getFullKey(key), serialized)
      return true
    } catch (error) {
      console.error(`Failed to set storage item "${key}":`, error)
      return false
    }
  }

  /**
   * 获取存储项
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const fullKey = this.getFullKey(key)
      let serialized = this.storage.getItem(fullKey)

      if (!serialized) {
        return defaultValue
      }

      // 尝试解压缩
      try {
        serialized = this.decompress(serialized)
      } catch {
        // 不是压缩数据，继续
      }

      // 尝试解密
      try {
        serialized = this.decrypt(serialized)
      } catch {
        // 不是加密数据，继续
      }

      const item: StorageItem<T> = JSON.parse(serialized)

      // 检查过期
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key)
        return defaultValue
      }

      return item.value
    } catch (error) {
      console.error(`Failed to get storage item "${key}":`, error)
      return defaultValue
    }
  }

  /**
   * 移除存储项
   */
  remove(key: string): boolean {
    try {
      this.storage.removeItem(this.getFullKey(key))
      return true
    } catch (error) {
      console.error(`Failed to remove storage item "${key}":`, error)
      return false
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): boolean {
    try {
      // 只清除带前缀的项
      const keys = this.keys()
      keys.forEach(key => this.remove(key))
      return true
    } catch (error) {
      console.error('Failed to clear storage:', error)
      return false
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    return this.storage.getItem(this.getFullKey(key)) !== null
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []
    const prefix = this.options.prefix

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length))
      }
    }

    return keys
  }

  /**
   * 获取存储大小(字节)
   */
  size(): number {
    let size = 0
    const keys = this.keys()

    keys.forEach(key => {
      const value = this.storage.getItem(this.getFullKey(key))
      if (value) {
        size += value.length * 2 // UTF-16 编码，每个字符2字节
      }
    })

    return size
  }

  /**
   * 获取剩余空间(字节)
   */
  remainingSpace(): number {
    const maxSize = 5 * 1024 * 1024 // 5MB (localStorage 通常限制)
    return maxSize - this.size()
  }

  /**
   * 清理过期项
   */
  cleanExpired(): number {
    let count = 0
    const keys = this.keys()

    keys.forEach(key => {
      const value = this.get(key)
      if (value === undefined) {
        count++
      }
    })

    return count
  }

  /**
   * 简单加密
   */
  private encrypt(data: string): string {
    // 简单的 XOR 加密 (实际应用中应使用更强的加密算法)
    const key = this.options.encryptionKey
    let encrypted = ''

    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }

    return btoa(encrypted) // Base64 编码
  }

  /**
   * 简单解密
   */
  private decrypt(data: string): string {
    const decoded = atob(data) // Base64 解码
    const key = this.options.encryptionKey
    let decrypted = ''

    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }

    return decrypted
  }

  /**
   * 简单压缩 (使用 LZ-string 算法的简化版)
   */
  private compress(data: string): string {
    // 简单的 RLE 压缩
    return data.replace(/(.)\1+/g, (match, char) => {
      return `${char}${match.length}`
    })
  }

  /**
   * 简单解压缩
   */
  private decompress(data: string): string {
    // 简单的 RLE 解压缩
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.substring(1))
      return char.repeat(count)
    })
  }
}

/**
 * 创建存储管理器实例
 */
export function createStorage(options?: StorageOptions): StorageManager {
  return new StorageManager(options)
}

/**
 * 默认存储实例
 */
export const storage = createStorage()

/**
 * 会话存储实例
 */
export const sessionStorage = createStorage({ storageType: 'sessionStorage' })

/**
 * 便捷方法
 */
export const storageUtils = {
  /**
   * 设置项
   */
  set: <T>(key: string, value: T, config?: StorageItemConfig) => storage.set(key, value, config),

  /**
   * 获取项
   */
  get: <T>(key: string, defaultValue?: T) => storage.get<T>(key, defaultValue),

  /**
   * 移除项
   */
  remove: (key: string) => storage.remove(key),

  /**
   * 清空
   */
  clear: () => storage.clear(),

  /**
   * 检查存在
   */
  has: (key: string) => storage.has(key),

  /**
   * 获取所有键
   */
  keys: () => storage.keys(),

  /**
   * 获取大小
   */
  size: () => storage.size(),

  /**
   * 清理过期项
   */
  cleanExpired: () => storage.cleanExpired(),
}

