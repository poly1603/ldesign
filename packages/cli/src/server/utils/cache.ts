/**
 * 缓存工具
 * 
 * 用于缓存 Node 版本列表等数据，减少重复的 fnm 命令执行
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // 缓存有效期（毫秒）
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map()

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 缓存有效期（毫秒），默认 5 分钟
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果不存在或已过期则返回 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

// 导出单例
export const cacheManager = new CacheManager()

// 定期清理过期缓存（每小时）
setInterval(() => {
  cacheManager.cleanup()
}, 60 * 60 * 1000)