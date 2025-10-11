import type { StorageEngineConfig } from '../types'

import { BaseStorageEngine } from './base-engine'

/**
 * Cookie 存储引擎
 */
export class CookieEngine extends BaseStorageEngine {
  readonly name = 'cookie' as const
  readonly maxSize = 4 * 1024 // 4KB per cookie, total ~4MB for all cookies

  private domain?: string
  private path: string
  private secure: boolean
  private sameSite: 'strict' | 'lax' | 'none'
  private httpOnly: boolean

  constructor(config?: StorageEngineConfig['cookie']) {
    super()
    this.domain = config?.domain
    this.path = config?.path || '/'
    this.secure = config?.secure || false
    this.sameSite = config?.sameSite || 'lax'
    this.httpOnly = config?.httpOnly || false

    // 初始化时计算已使用大小
    this.updateUsedSize().catch(console.error)
  }

  get available(): boolean {
    try {
      if (typeof document === 'undefined') {
        return false
      }

      // 测试是否可以写入 cookie
      const testKey = '__ldesign_cache_cookie_test__'
      document.cookie = `${testKey}=test; path=${this.path}`
      const canRead = document.cookie.includes(`${testKey}=test`)

      // 清理测试 cookie
      document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${this.path}`

      return canRead
    }
    catch {
      return false
    }
  }

  /**
   * 设置缓存项
   */
  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.available) {
      throw new Error('Cookie storage is not available')
    }

    const dataSize = this.calculateSize(key) + this.calculateSize(value)

    // Cookie 单个大小限制
    if (dataSize > this.maxSize) {
      throw new Error(
        `Cookie data too large: ${dataSize} bytes (max: ${this.maxSize} bytes)`,
      )
    }

    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`

    // 添加过期时间
    if (ttl) {
      const expiresDate = new Date(Date.now() + ttl)
      cookieString += `; expires=${expiresDate.toUTCString()}`
    }

    // 添加其他属性
    cookieString += `; path=${this.path}`

    if (this.domain) {
      cookieString += `; domain=${this.domain}`
    }

    if (this.secure) {
      cookieString += '; secure'
    }

    if (this.httpOnly) {
      cookieString += '; httpOnly'
    }

    cookieString += `; samesite=${this.sameSite}`

    try {
      document.cookie = cookieString
      await this.updateUsedSize()
    }
    catch (error) {
      throw new Error(`Failed to set cookie: ${error}`)
    }
  }

  /**
   * 获取缓存项
   */
  async getItem(key: string): Promise<string | null> {
    if (!this.available) {
      return null
    }

    try {
      const cookies = document.cookie.split(';')
      const encodedKey = encodeURIComponent(key)

      for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.trim().split('=')
        if (cookieKey === encodedKey && cookieValue) {
          return decodeURIComponent(cookieValue)
        }
      }

      return null
    }
    catch (error) {
      console.warn('Error getting cookie:', error)
      return null
    }
  }

  /**
   * 删除缓存项
   */
  async removeItem(key: string): Promise<void> {
    if (!this.available) {
      return
    }

    try {
      let cookieString = `${encodeURIComponent(
        key,
      )}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${this.path}`

      if (this.domain) {
        cookieString += `; domain=${this.domain}`
      }

      document.cookie = cookieString
      await this.updateUsedSize()
    }
    catch (error) {
      console.warn('Error removing cookie:', error)
    }
  }

  /**
   * 清空所有缓存项
   */
  async clear(): Promise<void> {
    if (!this.available) {
      return
    }

    const keys = await this.keys()
    for (const key of keys) {
      await this.removeItem(key)
    }

    this._usedSize = 0
  }

  /**
   * 获取所有键名
   */
  async keys(): Promise<string[]> {
    if (!this.available) {
      return []
    }

    try {
      const cookies = document.cookie.split(';')
      const keys: string[] = []

      for (const cookie of cookies) {
        const [cookieKey] = cookie.trim().split('=')
        if (cookieKey) {
          try {
            keys.push(decodeURIComponent(cookieKey))
          }
          catch {
            // 跳过无法解码的键
          }
        }
      }

      return keys
    }
    catch (error) {
      console.warn('Error getting cookie keys:', error)
      return []
    }
  }

  /**
   * 获取缓存项数量
   */
  async length(): Promise<number> {
    const keys = await this.keys()
    return keys.length
  }

  /**
   * 清理过期项（Cookie 会自动过期，这里主要是更新统计）
   */
  async cleanup(): Promise<void> {
    await this.updateUsedSize()
  }

  /**
   * 获取剩余存储空间
   */
  getRemainingSpace(): number {
    return Math.max(0, this.maxSize - this._usedSize)
  }

  /**
   * 获取存储使用率
   */
  getUsageRatio(): number {
    return this._usedSize / this.maxSize
  }
}
