import type { StorageEngineConfig } from '../types'
import { BaseStorageEngine } from './base-engine'

/**
 * 内存缓存项
 */
interface MemoryCacheItem {
  value: string
  createdAt: number
  expiresAt?: number
}

/**
 * 内存存储引擎
 */
export class MemoryEngine extends BaseStorageEngine {
  readonly name = 'memory' as const
  readonly available = true
  readonly maxSize: number

  private storage: Map<string, MemoryCacheItem> = new Map()
  private cleanupTimer?: number

  constructor(config?: StorageEngineConfig['memory']) {
    super()
    this.maxSize = config?.maxSize || 10 * 1024 * 1024 // 默认 10MB

    // 启动定期清理
    const cleanupInterval = config?.cleanupInterval || 60000 // 默认 1 分钟
    this.startCleanupTimer(cleanupInterval)
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(interval: number): void {
    const setIntervalFn =
      typeof window !== 'undefined' ? window.setInterval : global.setInterval
    this.cleanupTimer = setIntervalFn(() => {
      this.cleanup().catch(console.error)
    }, interval) as unknown as number
  }

  /**
   * 设置缓存项
   */
  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    const dataSize = this.calculateSize(key) + this.calculateSize(value)

    // 检查存储空间
    if (!this.checkStorageSpace(dataSize)) {
      // 尝试清理过期项
      await this.cleanup()

      // 再次检查
      if (!this.checkStorageSpace(dataSize)) {
        // 清理最旧的项
        await this.evictOldestItems(dataSize)
      }
    }

    const now = Date.now()
    const item: MemoryCacheItem = {
      value,
      createdAt: now,
      expiresAt: ttl ? now + ttl : undefined,
    }

    this.storage.set(key, item)
    await this.updateUsedSize()
  }

  /**
   * 获取缓存项
   */
  async getItem(key: string): Promise<string | null> {
    const item = this.storage.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.storage.delete(key)
      await this.updateUsedSize()
      return null
    }

    return item.value
  }

  /**
   * 删除缓存项
   */
  async removeItem(key: string): Promise<void> {
    this.storage.delete(key)
    await this.updateUsedSize()
  }

  /**
   * 清空所有缓存项
   */
  async clear(): Promise<void> {
    this.storage.clear()
    this._usedSize = 0
  }

  /**
   * 获取所有键名
   */
  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys())
  }

  /**
   * 检查键是否存在
   */
  async hasItem(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  /**
   * 获取缓存项数量
   */
  async length(): Promise<number> {
    return this.storage.size
  }

  /**
   * 清理过期项
   */
  async cleanup(): Promise<void> {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.storage) {
      if (item.expiresAt && now > item.expiresAt) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.storage.delete(key)
    }

    if (keysToDelete.length > 0) {
      await this.updateUsedSize()
    }
  }

  /**
   * 清理最旧的项以释放空间
   */
  private async evictOldestItems(requiredSpace: number): Promise<void> {
    // 按创建时间排序，删除最旧的项
    const items = Array.from(this.storage.entries()).sort(
      ([, a], [, b]) => a.createdAt - b.createdAt
    )

    let freedSpace = 0
    const keysToDelete: string[] = []

    for (const [key, item] of items) {
      const itemSize = this.calculateSize(key) + this.calculateSize(item.value)
      keysToDelete.push(key)
      freedSpace += itemSize

      // 确保释放足够的空间，并且至少删除一个项
      if (freedSpace >= requiredSpace && keysToDelete.length > 0) {
        break
      }
    }

    // 如果仍然空间不足，删除更多项
    if (freedSpace < requiredSpace && keysToDelete.length < items.length) {
      // 删除一半的项
      const halfLength = Math.ceil(items.length / 2)
      for (let i = keysToDelete.length; i < halfLength; i++) {
        if (items[i]) {
          keysToDelete.push(items[i][0])
        }
      }
    }

    for (const key of keysToDelete) {
      this.storage.delete(key)
    }

    await this.updateUsedSize()
  }

  /**
   * 更新使用大小
   */
  protected async updateUsedSize(): Promise<void> {
    let totalSize = 0

    for (const [key, item] of this.storage) {
      totalSize += this.calculateSize(key) + this.calculateSize(item.value)
    }

    this._usedSize = totalSize
  }

  /**
   * 获取缓存项详细信息
   */
  async getItemInfo(key: string): Promise<MemoryCacheItem | null> {
    return this.storage.get(key) || null
  }

  /**
   * 获取所有缓存项（用于调试）
   */
  async getAllItems(): Promise<Record<string, MemoryCacheItem>> {
    const result: Record<string, MemoryCacheItem> = {}

    for (const [key, item] of this.storage) {
      result[key] = { ...item }
    }

    return result
  }

  /**
   * 获取存储统计
   */
  async getStorageStats(): Promise<{
    totalItems: number
    totalSize: number
    expiredItems: number
    oldestItem?: { key: string; age: number }
    newestItem?: { key: string; age: number }
  }> {
    const now = Date.now()
    let expiredItems = 0
    let oldestTime = Infinity
    let newestTime = 0
    let oldestKey = ''
    let newestKey = ''

    for (const [key, item] of this.storage) {
      if (item.expiresAt && now > item.expiresAt) {
        expiredItems++
      }

      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt
        oldestKey = key
      }

      if (item.createdAt > newestTime) {
        newestTime = item.createdAt
        newestKey = key
      }
    }

    return {
      totalItems: this.storage.size,
      totalSize: this._usedSize,
      expiredItems,
      oldestItem: oldestKey
        ? { key: oldestKey, age: now - oldestTime }
        : undefined,
      newestItem: newestKey
        ? { key: newestKey, age: now - newestTime }
        : undefined,
    }
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      const clearIntervalFn =
        typeof window !== 'undefined'
          ? window.clearInterval
          : global.clearInterval
      clearIntervalFn(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.storage.clear()
    this._usedSize = 0
  }
}
