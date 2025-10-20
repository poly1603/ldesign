/**
 * 安全存储工具
 * 提供加密的本地存储功能
 */

import { aes } from '../algorithms'

/**
 * 存储选项
 */
export interface SecureStorageOptions {
  /** 加密密钥 */
  key: string
  /** 存储前缀（默认'secure_'） */
  prefix?: string
  /** 使用sessionStorage而非localStorage */
  useSessionStorage?: boolean
  /** 数据过期时间（毫秒，0表示永不过期） */
  ttl?: number
}

/**
 * 存储项
 */
interface StorageItem {
  /** 加密的数据 */
  data: string
  /** 创建时间戳 */
  timestamp: number
  /** 过期时间戳（0表示永不过期） */
  expiresAt: number
  /** 数据类型 */
  type: string
}

/**
 * 安全存储工具类
 * 
 * 提供加密的localStorage/sessionStorage功能
 * 自动处理数据的加密、解密、序列化和反序列化
 */
export class SecureStorage {
  private key: string
  private prefix: string
  private storage: Storage
  private defaultTTL: number

  /**
   * 创建安全存储实例
   * 
   * @param options 存储选项
   * 
   * @example
   * ```typescript
   * const storage = new SecureStorage({ key: 'my-secret-key' })
   * storage.set('user', { name: 'John', age: 30 })
   * const user = storage.get('user')
   * ```
   */
  constructor(options: SecureStorageOptions) {
    this.key = options.key
    this.prefix = options.prefix || 'secure_'
    this.storage = options.useSessionStorage ? sessionStorage : localStorage
    this.defaultTTL = options.ttl || 0
  }

  /**
   * 存储数据
   * 
   * @param key 键名
   * @param value 值（自动序列化）
   * @param ttl 过期时间（毫秒，可选）
   * @returns 是否成功
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const now = Date.now()
      const expiresAt = ttl || this.defaultTTL ? now + (ttl || this.defaultTTL) : 0

      // 序列化数据
      const serialized = JSON.stringify(value)
      
      // 加密数据
      const encrypted = aes.encrypt(serialized, this.key)
      if (!encrypted.success) {
        throw new Error(encrypted.error || 'Encryption failed')
      }

      // 创建存储项
      const item: StorageItem = {
        data: encrypted.data || '',
        timestamp: now,
        expiresAt,
        type: typeof value,
      }

      // 存储
      this.storage.setItem(
        this.prefix + key,
        JSON.stringify(item)
      )

      return true
    }
    catch (error) {
      console.error('SecureStorage.set error:', error)
      return false
    }
  }

  /**
   * 获取数据
   * 
   * @param key 键名
   * @param defaultValue 默认值（可选）
   * @returns 值或默认值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const itemStr = this.storage.getItem(this.prefix + key)
      if (!itemStr) {
        return defaultValue
      }

      const item: StorageItem = JSON.parse(itemStr)

      // 检查是否过期
      if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
        this.remove(key)
        return defaultValue
      }

      // 解密数据
      const decrypted = aes.decrypt(item.data, this.key)
      if (!decrypted.success || !decrypted.data) {
        throw new Error(decrypted.error || 'Decryption failed')
      }

      // 反序列化
      return JSON.parse(decrypted.data) as T
    }
    catch (error) {
      console.error('SecureStorage.get error:', error)
      return defaultValue
    }
  }

  /**
   * 删除数据
   * 
   * @param key 键名
   * @returns 是否成功
   */
  remove(key: string): boolean {
    try {
      this.storage.removeItem(this.prefix + key)
      return true
    }
    catch (error) {
      console.error('SecureStorage.remove error:', error)
      return false
    }
  }

  /**
   * 清空所有数据
   * 
   * @returns 是否成功
   */
  clear(): boolean {
    try {
      const keys = this.keys()
      keys.forEach(key => this.remove(key))
      return true
    }
    catch (error) {
      console.error('SecureStorage.clear error:', error)
      return false
    }
  }

  /**
   * 检查键是否存在
   * 
   * @param key 键名
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.storage.getItem(this.prefix + key) !== null
  }

  /**
   * 获取所有键名
   * 
   * @returns 键名数组
   */
  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  /**
   * 获取存储项数量
   * 
   * @returns 数量
   */
  size(): number {
    return this.keys().length
  }

  /**
   * 清理过期数据
   * 
   * @returns 清理的数量
   */
  cleanup(): number {
    let count = 0
    const now = Date.now()
    const keys = this.keys()

    for (const key of keys) {
      try {
        const itemStr = this.storage.getItem(this.prefix + key)
        if (itemStr) {
          const item: StorageItem = JSON.parse(itemStr)
          if (item.expiresAt > 0 && now > item.expiresAt) {
            this.remove(key)
            count++
          }
        }
      }
      catch {
        // 忽略错误，继续清理
      }
    }

    return count
  }

  /**
   * 获取存储项的元数据
   * 
   * @param key 键名
   * @returns 元数据或undefined
   */
  getMetadata(key: string): {
    timestamp: number
    expiresAt: number
    type: string
    isExpired: boolean
  } | undefined {
    try {
      const itemStr = this.storage.getItem(this.prefix + key)
      if (!itemStr) {
        return undefined
      }

      const item: StorageItem = JSON.parse(itemStr)
      const now = Date.now()

      return {
        timestamp: item.timestamp,
        expiresAt: item.expiresAt,
        type: item.type,
        isExpired: item.expiresAt > 0 && now > item.expiresAt,
      }
    }
    catch {
      return undefined
    }
  }

  /**
   * 更新密钥（重新加密所有数据）
   * 
   * @param newKey 新密钥
   * @returns 是否成功
   */
  updateKey(newKey: string): boolean {
    try {
      const keys = this.keys()
      const tempData: Map<string, unknown> = new Map()

      // 使用旧密钥解密所有数据
      for (const key of keys) {
        const value = this.get(key)
        if (value !== undefined) {
          tempData.set(key, value)
        }
      }

      // 更新密钥
      this.key = newKey

      // 使用新密钥重新加密所有数据
      for (const [key, value] of tempData.entries()) {
        this.set(key, value)
      }

      return true
    }
    catch (error) {
      console.error('SecureStorage.updateKey error:', error)
      return false
    }
  }
}

/**
 * 创建安全存储实例的便捷函数
 */
export function createSecureStorage(options: SecureStorageOptions): SecureStorage {
  return new SecureStorage(options)
}

