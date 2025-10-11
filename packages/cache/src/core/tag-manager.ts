import type { SerializableValue, SetOptions } from '../types'

import type { CacheManager } from './cache-manager'

/**
 * 标签配置
 */
export interface TagConfig {
  /** 标签键前缀 */
  tagPrefix?: string
  /** 是否自动清理空标签 */
  autoCleanup?: boolean
}

/**
 * 缓存标签管理器
 * 
 * 支持为缓存项添加标签，并按标签批量操作
 * 
 * @example
 * ```typescript
 * const tagManager = new TagManager(cache)
 * 
 * // 设置带标签的缓存
 * await tagManager.set('user:1', userData, { tags: ['user', 'active'] })
 * await tagManager.set('user:2', userData2, { tags: ['user', 'inactive'] })
 * 
 * // 按标签获取所有键
 * const userKeys = await tagManager.getKeysByTag('user')
 * 
 * // 按标签清除缓存
 * await tagManager.clearByTag('inactive')
 * 
 * // 按多个标签查询（交集）
 * const activeUsers = await tagManager.getKeysByTags(['user', 'active'])
 * ```
 */
export class TagManager {
  private tagPrefix: string
  private autoCleanup: boolean
  private readonly TAG_INDEX_KEY = '__tag_index__'

  constructor(
    private cache: CacheManager,
    config: TagConfig = {},
  ) {
    this.tagPrefix = config.tagPrefix || '__tag__'
    this.autoCleanup = config.autoCleanup ?? true
  }

  /**
   * 设置带标签的缓存项
   */
  async set<T extends SerializableValue>(
    key: string,
    value: T,
    options?: SetOptions & { tags?: string[] },
  ): Promise<void> {
    const { tags, ...cacheOptions } = options || {}

    // 设置缓存值
    await this.cache.set(key, value, cacheOptions)

    // 添加标签
    if (tags && tags.length > 0) {
      await this.addTags(key, tags)
    }
  }

  /**
   * 为已存在的键添加标签
   */
  async addTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.getTagKey(tag)
      const keys = await this.getTagKeys(tagKey)

      if (!keys.includes(key)) {
        keys.push(key)
        await this.cache.set(tagKey, keys)
      }
    }

    // 更新键的标签索引
    await this.updateKeyTags(key, tags, 'add')
  }

  /**
   * 移除键的标签
   */
  async removeTags(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.getTagKey(tag)
      const keys = await this.getTagKeys(tagKey)

      const index = keys.indexOf(key)
      if (index > -1) {
        keys.splice(index, 1)

        if (keys.length === 0 && this.autoCleanup) {
          // 删除空标签
          await this.cache.remove(tagKey)
        }
        else {
          await this.cache.set(tagKey, keys)
        }
      }
    }

    // 更新键的标签索引
    await this.updateKeyTags(key, tags, 'remove')
  }

  /**
   * 获取键的所有标签
   */
  async getKeyTags(key: string): Promise<string[]> {
    const indexKey = this.getKeyIndexKey(key)
    const tags = await this.cache.get<string[]>(indexKey)
    return tags || []
  }

  /**
   * 获取标签下的所有键
   */
  async getKeysByTag(tag: string): Promise<string[]> {
    const tagKey = this.getTagKey(tag)
    return this.getTagKeys(tagKey)
  }

  /**
   * 获取多个标签的交集键
   */
  async getKeysByTags(tags: string[], mode: 'and' | 'or' = 'and'): Promise<string[]> {
    if (tags.length === 0) { return [] }

    const keySets = await Promise.all(
      tags.map(async tag => this.getKeysByTag(tag)),
    )

    if (mode === 'and') {
      // 交集
      return keySets.reduce((acc, keys) => {
        return acc.filter(key => keys.includes(key))
      })
    }
    else {
      // 并集
      const allKeys = new Set<string>()
      keySets.forEach((keys) => {
        keys.forEach(key => allKeys.add(key))
      })
      return Array.from(allKeys)
    }
  }

  /**
   * 按标签清除缓存
   */
  async clearByTag(tag: string): Promise<void> {
    const keys = await this.getKeysByTag(tag)

    // 删除所有键
    await Promise.all(keys.map(async key => this.cache.remove(key)))

    // 删除标签索引
    const tagKey = this.getTagKey(tag)
    await this.cache.remove(tagKey)

    // 清理键的标签索引
    await Promise.all(
      keys.map(async key => this.removeKeyTagIndex(key)),
    )
  }

  /**
   * 按多个标签清除缓存
   */
  async clearByTags(tags: string[], mode: 'and' | 'or' = 'and'): Promise<void> {
    const keys = await this.getKeysByTags(tags, mode)

    // 删除所有键
    await Promise.all(keys.map(async key => this.cache.remove(key)))

    // 如果是 AND 模式，只清理这些键的标签索引
    // 如果是 OR 模式，清理所有相关标签
    if (mode === 'or') {
      await Promise.all(tags.map(async (tag) => {
        const tagKey = this.getTagKey(tag)
        return this.cache.remove(tagKey)
      }))
    }

    // 清理键的标签索引
    await Promise.all(
      keys.map(async key => this.removeKeyTagIndex(key)),
    )
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<string[]> {
    const allKeys = await this.cache.keys()
    const tags: string[] = []

    for (const key of allKeys) {
      if (key.startsWith(this.tagPrefix)) {
        const tag = key.substring(this.tagPrefix.length)
        tags.push(tag)
      }
    }

    return tags
  }

  /**
   * 获取标签统计信息
   */
  async getTagStats(): Promise<Record<string, number>> {
    const tags = await this.getAllTags()
    const stats: Record<string, number> = {}

    for (const tag of tags) {
      const keys = await this.getKeysByTag(tag)
      stats[tag] = keys.length
    }

    return stats
  }

  /**
   * 清理空标签
   */
  async cleanupEmptyTags(): Promise<number> {
    const tags = await this.getAllTags()
    let cleaned = 0

    for (const tag of tags) {
      const keys = await this.getKeysByTag(tag)
      if (keys.length === 0) {
        const tagKey = this.getTagKey(tag)
        await this.cache.remove(tagKey)
        cleaned++
      }
    }

    return cleaned
  }

  /**
   * 重命名标签
   */
  async renameTag(oldTag: string, newTag: string): Promise<void> {
    const keys = await this.getKeysByTag(oldTag)

    // 为所有键添加新标签
    await Promise.all(keys.map(async key => this.addTags(key, [newTag])))

    // 移除旧标签
    await this.clearByTag(oldTag)
  }

  /**
   * 获取标签键
   */
  private getTagKey(tag: string): string {
    return `${this.tagPrefix}${tag}`
  }

  /**
   * 获取键的标签索引键
   */
  private getKeyIndexKey(key: string): string {
    return `${this.TAG_INDEX_KEY}:${key}`
  }

  /**
   * 获取标签下的键列表
   */
  private async getTagKeys(tagKey: string): Promise<string[]> {
    const keys = await this.cache.get<string[]>(tagKey)
    return keys || []
  }

  /**
   * 更新键的标签索引
   */
  private async updateKeyTags(key: string, tags: string[], action: 'add' | 'remove'): Promise<void> {
    const indexKey = this.getKeyIndexKey(key)
    const currentTags = await this.cache.get<string[]>(indexKey) || []

    let updatedTags: string[]

    if (action === 'add') {
      updatedTags = Array.from(new Set([...currentTags, ...tags]))
    }
    else {
      updatedTags = currentTags.filter(t => !tags.includes(t))
    }

    if (updatedTags.length === 0) {
      await this.cache.remove(indexKey)
    }
    else {
      await this.cache.set(indexKey, updatedTags)
    }
  }

  /**
   * 移除键的标签索引
   */
  private async removeKeyTagIndex(key: string): Promise<void> {
    const indexKey = this.getKeyIndexKey(key)
    await this.cache.remove(indexKey)
  }
}

/**
 * 创建标签管理器
 */
export function createTagManager(cache: CacheManager, config?: TagConfig): TagManager {
  return new TagManager(cache, config)
}

