/**
 * 应用缓存管理
 * 提供统一的缓存操作接口
 */

import { useCacheManager } from '@ldesign/cache/vue'
import type { SerializableValue } from '@ldesign/cache'

/**
 * 使用应用缓存
 */
export function useAppCache() {
  const cacheManager = useCacheManager()

  return {
    /**
     * 获取缓存
     */
    async get<T extends SerializableValue = SerializableValue>(key: string): Promise<T | null> {
      try {
        return await cacheManager.get<T>(key)
      } catch (error) {
        console.error('[useAppCache] Failed to get cache:', key, error)
        return null
      }
    },

    /**
     * 设置缓存
     */
    async set<T extends SerializableValue = SerializableValue>(
      key: string,
      value: T,
      ttl?: number
    ): Promise<void> {
      try {
        await cacheManager.set(key, value, ttl ? { ttl } : undefined)
      } catch (error) {
        console.error('[useAppCache] Failed to set cache:', key, error)
      }
    },

    /**
     * 删除缓存
     */
    async remove(key: string): Promise<void> {
      try {
        await cacheManager.remove(key)
      } catch (error) {
        console.error('[useAppCache] Failed to remove cache:', key, error)
      }
    },

    /**
     * 清空缓存
     */
    async clear(): Promise<void> {
      try {
        await cacheManager.clear()
      } catch (error) {
        console.error('[useAppCache] Failed to clear cache:', error)
      }
    },

    /**
     * 检查缓存是否存在
     */
    async has(key: string): Promise<boolean> {
      try {
        return await cacheManager.has(key)
      } catch (error) {
        console.error('[useAppCache] Failed to check cache:', key, error)
        return false
      }
    },

    /**
     * 获取所有缓存键
     */
    async keys(): Promise<string[]> {
      try {
        return await cacheManager.keys()
      } catch (error) {
        console.error('[useAppCache] Failed to get cache keys:', error)
        return []
      }
    },

    /**
     * 获取缓存统计信息
     */
    async getStats() {
      try {
        return await cacheManager.getStats()
      } catch (error) {
        console.error('[useAppCache] Failed to get cache stats:', error)
        return null
      }
    },

    /**
     * 记忆函数：如果缓存不存在则执行 fetcher 并缓存结果
     */
    async remember<T extends SerializableValue = SerializableValue>(
      key: string,
      fetcher: () => Promise<T> | T,
      ttl?: number
    ): Promise<T> {
      try {
        return await cacheManager.remember(key, fetcher, ttl ? { ttl } : undefined)
      } catch (error) {
        console.error('[useAppCache] Failed to remember:', key, error)
        throw error
      }
    },

    // 导出原始 manager 以供高级使用
    manager: cacheManager
  }
}



