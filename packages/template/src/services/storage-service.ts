/**
 * 存储服务
 * 
 * 提供统一的存储接口，包括：
 * - localStorage 支持
 * - sessionStorage 支持
 * - 内存存储支持
 * - 数据序列化/反序列化
 * - 存储统计
 */

/**
 * 存储配置接口
 */
export interface StorageConfig {
  /** 存储类型 */
  type?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 存储键前缀 */
  prefix?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 自定义序列化函数 */
  serialize?: (data: unknown) => string
  /** 自定义反序列化函数 */
  deserialize?: (data: string) => unknown
  /** 存储过期时间 (毫秒) */
  ttl?: number
}

/**
 * 存储项接口
 */
interface StorageItem {
  /** 存储值 */
  value: unknown
  /** 创建时间 */
  timestamp: number
  /** 过期时间 */
  expiry?: number
}

/**
 * 存储统计接口
 */
export interface StorageStats {
  /** 存储项数量 */
  itemCount: number
  /** 存储大小 (字节) */
  totalSize: number
  /** 过期项数量 */
  expiredItems: number
  /** 最后更新时间 */
  lastUpdated: number
}

/**
 * 存储服务类
 */
export class StorageService {
  private config: Required<StorageConfig>
  private memoryStorage = new Map<string, StorageItem>()
  private stats: StorageStats

  constructor(config: StorageConfig = {}) {
    this.config = {
      type: 'localStorage',
      prefix: 'ldesign_template_',
      debug: false,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      ttl: 0, // 0 表示不过期
      ...config,
    }

    this.stats = {
      itemCount: 0,
      totalSize: 0,
      expiredItems: 0,
      lastUpdated: Date.now(),
    }

    this.updateStats()

    if (this.config.debug) {
      console.log('💾 存储服务已初始化', this.config)
    }
  }

  /**
   * 设置存储项
   */
  set(key: string, value: unknown, ttl?: number): boolean {
    const fullKey = this.getFullKey(key)
    const now = Date.now()
    const expiry = ttl || this.config.ttl
    
    const item: StorageItem = {
      value,
      timestamp: now,
      expiry: expiry > 0 ? now + expiry : undefined,
    }

    try {
      const serialized = this.config.serialize(item)

      switch (this.config.type) {
        case 'localStorage':
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(fullKey, serialized)
          }
          else {
            this.memoryStorage.set(fullKey, item)
          }
          break

        case 'sessionStorage':
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(fullKey, serialized)
          }
          else {
            this.memoryStorage.set(fullKey, item)
          }
          break

        case 'memory':
        default:
          this.memoryStorage.set(fullKey, item)
          break
      }

      this.updateStats()

      if (this.config.debug) {
        console.log(`💾 存储设置: ${key}`, value)
      }

      return true
    }
    catch (error) {
      console.error('存储设置失败:', error)
      return false
    }
  }

  /**
   * 获取存储项
   */
  get<T = unknown>(key: string): T | null {
    const fullKey = this.getFullKey(key)

    try {
      let serialized: string | null = null

      switch (this.config.type) {
        case 'localStorage':
          if (typeof window !== 'undefined' && window.localStorage) {
            serialized = window.localStorage.getItem(fullKey)
          }
          else {
            const item = this.memoryStorage.get(fullKey)
            serialized = item ? this.config.serialize(item) : null
          }
          break

        case 'sessionStorage':
          if (typeof window !== 'undefined' && window.sessionStorage) {
            serialized = window.sessionStorage.getItem(fullKey)
          }
          else {
            const item = this.memoryStorage.get(fullKey)
            serialized = item ? this.config.serialize(item) : null
          }
          break

        case 'memory':
        default:
          const item = this.memoryStorage.get(fullKey)
          serialized = item ? this.config.serialize(item) : null
          break
      }

      if (!serialized) {
        return null
      }

      const item = this.config.deserialize(serialized) as StorageItem

      // 检查是否过期
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key)
        this.stats.expiredItems++
        return null
      }

      if (this.config.debug) {
        console.log(`💾 存储获取: ${key}`, item.value)
      }

      return item.value as T
    }
    catch (error) {
      console.error('存储获取失败:', error)
      return null
    }
  }

  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 移除存储项
   */
  remove(key: string): boolean {
    const fullKey = this.getFullKey(key)

    try {
      switch (this.config.type) {
        case 'localStorage':
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(fullKey)
          }
          else {
            this.memoryStorage.delete(fullKey)
          }
          break

        case 'sessionStorage':
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(fullKey)
          }
          else {
            this.memoryStorage.delete(fullKey)
          }
          break

        case 'memory':
        default:
          this.memoryStorage.delete(fullKey)
          break
      }

      this.updateStats()

      if (this.config.debug) {
        console.log(`💾 存储移除: ${key}`)
      }

      return true
    }
    catch (error) {
      console.error('存储移除失败:', error)
      return false
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): boolean {
    try {
      switch (this.config.type) {
        case 'localStorage':
          if (typeof window !== 'undefined' && window.localStorage) {
            // 只清除带前缀的项
            const keys = Object.keys(window.localStorage).filter(key => 
              key.startsWith(this.config.prefix)
            )
            keys.forEach(key => window.localStorage.removeItem(key))
          }
          else {
            this.memoryStorage.clear()
          }
          break

        case 'sessionStorage':
          if (typeof window !== 'undefined' && window.sessionStorage) {
            // 只清除带前缀的项
            const keys = Object.keys(window.sessionStorage).filter(key => 
              key.startsWith(this.config.prefix)
            )
            keys.forEach(key => window.sessionStorage.removeItem(key))
          }
          else {
            this.memoryStorage.clear()
          }
          break

        case 'memory':
        default:
          this.memoryStorage.clear()
          break
      }

      this.updateStats()

      if (this.config.debug) {
        console.log('💾 存储已清空')
      }

      return true
    }
    catch (error) {
      console.error('存储清空失败:', error)
      return false
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    const keys: string[] = []

    try {
      switch (this.config.type) {
        case 'localStorage':
          if (typeof window !== 'undefined' && window.localStorage) {
            Object.keys(window.localStorage).forEach(key => {
              if (key.startsWith(this.config.prefix)) {
                keys.push(key.substring(this.config.prefix.length))
              }
            })
          }
          else {
            this.memoryStorage.forEach((_, key) => {
              if (key.startsWith(this.config.prefix)) {
                keys.push(key.substring(this.config.prefix.length))
              }
            })
          }
          break

        case 'sessionStorage':
          if (typeof window !== 'undefined' && window.sessionStorage) {
            Object.keys(window.sessionStorage).forEach(key => {
              if (key.startsWith(this.config.prefix)) {
                keys.push(key.substring(this.config.prefix.length))
              }
            })
          }
          else {
            this.memoryStorage.forEach((_, key) => {
              if (key.startsWith(this.config.prefix)) {
                keys.push(key.substring(this.config.prefix.length))
              }
            })
          }
          break

        case 'memory':
        default:
          this.memoryStorage.forEach((_, key) => {
            if (key.startsWith(this.config.prefix)) {
              keys.push(key.substring(this.config.prefix.length))
            }
          })
          break
      }
    }
    catch (error) {
      console.error('获取存储键失败:', error)
    }

    return keys
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    const keys = this.keys()
    let cleanedCount = 0

    keys.forEach(key => {
      const value = this.get(key)
      if (value === null) {
        cleanedCount++
      }
    })

    if (cleanedCount > 0) {
      this.updateStats()

      if (this.config.debug) {
        console.log(`💾 清理过期存储项: ${cleanedCount} 项`)
      }
    }

    return cleanedCount
  }

  /**
   * 获取存储统计
   */
  getStats(): StorageStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 获取完整键名
   */
  private getFullKey(key: string): string {
    return `${this.config.prefix}${key}`
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const keys = this.keys()
    this.stats.itemCount = keys.length
    this.stats.totalSize = this.calculateTotalSize(keys)
    this.stats.lastUpdated = Date.now()
  }

  /**
   * 计算总存储大小
   */
  private calculateTotalSize(keys: string[]): number {
    let totalSize = 0

    keys.forEach(key => {
      try {
        const fullKey = this.getFullKey(key)
        let serialized: string | null = null

        switch (this.config.type) {
          case 'localStorage':
            if (typeof window !== 'undefined' && window.localStorage) {
              serialized = window.localStorage.getItem(fullKey)
            }
            break
          case 'sessionStorage':
            if (typeof window !== 'undefined' && window.sessionStorage) {
              serialized = window.sessionStorage.getItem(fullKey)
            }
            break
          case 'memory':
          default:
            const item = this.memoryStorage.get(fullKey)
            serialized = item ? this.config.serialize(item) : null
            break
        }

        if (serialized) {
          totalSize += new Blob([serialized]).size
        }
      }
      catch (error) {
        // 忽略计算错误
      }
    })

    return totalSize
  }

  /**
   * 销毁存储服务
   */
  destroy(): void {
    if (this.config.type === 'memory') {
      this.memoryStorage.clear()
    }

    if (this.config.debug) {
      console.log('💾 存储服务已销毁')
    }
  }
}
