import type { StorageEngineConfig } from '../types'

import { BaseStorageEngine } from './base-engine'

/**
 * sessionStorage 存储引擎
 */
export class SessionStorageEngine extends BaseStorageEngine {
  readonly name = 'sessionStorage' as const
  readonly maxSize: number
  private keyPrefix: string

  constructor(config?: StorageEngineConfig['sessionStorage']) {
    super()
    this.maxSize = config?.maxSize || 5 * 1024 * 1024 // 默认 5MB
    this.keyPrefix = config?.keyPrefix || 'ldesign_cache_session_'

    // 初始化时计算已使用大小
    this.updateUsedSize().catch(console.error)
  }

  get available(): boolean {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return false
      }

      // 测试是否可以写入
      const testKey = '__ldesign_cache_session_test__'
      window.sessionStorage.setItem(testKey, 'test')
      window.sessionStorage.removeItem(testKey)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 生成完整键名
   */
  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`
  }

  /**
   * 从完整键名提取原始键名
   */
  private extractKey(fullKey: string): string {
    return fullKey.startsWith(this.keyPrefix)
      ? fullKey.slice(this.keyPrefix.length)
      : fullKey
  }

  /**
   * 设置缓存项
   */
  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.available) {
      throw new Error('sessionStorage is not available')
    }

    const fullKey = this.getFullKey(key)
    const data = this.createTTLData(value, ttl)
    const dataSize = this.calculateSize(fullKey) + this.calculateSize(data)

    // 检查存储空间
    if (!this.checkStorageSpace(dataSize)) {
      // 尝试清理过期项
      await this.cleanup()

      // 再次检查
      if (!this.checkStorageSpace(dataSize)) {
        throw new Error('Insufficient storage space in sessionStorage')
      }
    }

    try {
      window.sessionStorage.setItem(fullKey, data)
      await this.updateUsedSize()
    }
    catch (error) {
      if (
        error instanceof DOMException
        && error.name === 'QuotaExceededError'
      ) {
        throw new Error('sessionStorage quota exceeded')
      }
      throw error
    }
  }

  /**
   * 获取缓存项
   */
  async getItem(key: string): Promise<string | null> {
    if (!this.available) {
      return null
    }

    const fullKey = this.getFullKey(key)

    try {
      const data = window.sessionStorage.getItem(fullKey)
      if (!data) {
        return null
      }

      const { value, expired } = this.parseTTLData(data)

      if (expired) {
        await this.removeItem(key)
        return null
      }

      return value
    }
    catch (error) {
      console.warn('Error getting item from sessionStorage:', error)
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

    const fullKey = this.getFullKey(key)
    window.sessionStorage.removeItem(fullKey)
    await this.updateUsedSize()
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
      const fullKey = this.getFullKey(key)
      window.sessionStorage.removeItem(fullKey)
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

    const keys: string[] = []

    for (let i = 0; i < window.sessionStorage.length; i++) {
      const fullKey = window.sessionStorage.key(i)
      if (fullKey && fullKey.startsWith(this.keyPrefix)) {
        keys.push(this.extractKey(fullKey))
      }
    }

    return keys
  }

  /**
   * 获取缓存项数量
   */
  async length(): Promise<number> {
    const keys = await this.keys()
    return keys.length
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
