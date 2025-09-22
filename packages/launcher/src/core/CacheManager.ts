/**
 * 缓存管理系统
 * 
 * 提供构建缓存、依赖缓存、模块缓存等多种缓存策略
 * 支持缓存清理、压缩、分析等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import path from 'path'
import { createHash } from 'crypto'
import { Logger } from '../utils/logger'
import { FileSystem } from '../utils/file-system'

/**
 * 缓存类型
 */
export type CacheType = 
  | 'build'
  | 'deps'
  | 'modules'
  | 'transform'
  | 'assets'
  | 'temp'

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean
  /** 缓存目录 */
  cacheDir: string
  /** 最大缓存大小 (MB) */
  maxSize: number
  /** 缓存过期时间 (毫秒) */
  ttl: number
  /** 启用的缓存类型 */
  types: CacheType[]
  /** 是否启用压缩 */
  compression: boolean
  /** 自动清理策略 */
  autoClean: {
    enabled: boolean
    /** 清理间隔 (小时) */
    interval: number
    /** 清理阈值 (使用率) */
    threshold: number
  }
}

/**
 * 缓存项接口
 */
export interface CacheItem {
  /** 缓存键 */
  key: string
  /** 缓存类型 */
  type: CacheType
  /** 数据 */
  data: any
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessed: number
  /** 访问次数 */
  accessCount: number
  /** 文件大小 */
  size: number
  /** 过期时间 */
  expiresAt?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总缓存项数量 */
  totalItems: number
  /** 总缓存大小 */
  totalSize: number
  /** 各类型统计 */
  byType: Record<CacheType, {
    count: number
    size: number
  }>
  /** 命中率 */
  hitRate: number
  /** 最近清理时间 */
  lastCleanup?: number
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private config: CacheConfig
  private logger: Logger
  private cache = new Map<string, CacheItem>()
  private hitCount = 0
  private missCount = 0
  private lastCleanup = 0
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}, logger?: Logger) {
    this.logger = logger || new Logger('Cache')
    this.config = {
      enabled: true,
      cacheDir: '.cache',
      maxSize: 500, // 500MB
      ttl: 24 * 60 * 60 * 1000, // 24小时
      types: ['build', 'deps', 'modules', 'transform'],
      compression: true,
      autoClean: {
        enabled: true,
        interval: 4, // 4小时
        threshold: 0.8 // 80%
      },
      ...config
    }

    this.initialize()
  }

  /**
   * 初始化缓存管理器
   */
  private async initialize(): Promise<void> {
    try {
      // 确保缓存目录存在
      await FileSystem.ensureDir(this.config.cacheDir)

      // 加载现有缓存
      await this.loadCache()

      // 设置自动清理
      if (this.config.autoClean.enabled) {
        this.startAutoCleanup()
      }

      // 只在debug模式下输出详细信息
      if (this.logger.getLevel() === 'debug') {
        this.logger.debug(`缓存系统初始化完成，缓存目录: ${this.config.cacheDir}`)
      }
    } catch (error) {
      this.logger.error('缓存系统初始化失败', error)
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string, type: CacheType): Promise<T | null> {
    if (!this.config.enabled || !this.config.types.includes(type)) {
      return null
    }

    const cacheKey = this.buildCacheKey(key, type)
    let item: CacheItem | undefined | null = this.cache.get(cacheKey)

    if (!item) {
      // 从磁盘加载
      item = await this.loadFromDisk(cacheKey)
      if (item) {
        this.cache.set(cacheKey, item)
      }
    }

    if (!item || this.isExpired(item)) {
      this.missCount++
      return null
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++
    this.hitCount++

    return item.data
  }

  /**
   * 设置缓存
   */
  async set(key: string, type: CacheType, data: any, ttl?: number): Promise<void> {
    if (!this.config.enabled || !this.config.types.includes(type)) {
      return
    }

    const cacheKey = this.buildCacheKey(key, type)
    const now = Date.now()
    const size = this.calculateSize(data)
    
    const item: CacheItem = {
      key: cacheKey,
      type,
      data,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      size,
      expiresAt: ttl ? now + ttl : now + this.config.ttl
    }

    // 检查缓存大小限制
    await this.enforceSize(size)

    this.cache.set(cacheKey, item)
    
    // 保存到磁盘
    await this.saveToDisk(item)

    this.logger.debug(`缓存已设置: ${cacheKey} (${this.formatSize(size)})`)
  }

  /**
   * 删除缓存
   */
  async delete(key: string, type: CacheType): Promise<void> {
    const cacheKey = this.buildCacheKey(key, type)
    
    this.cache.delete(cacheKey)
    await this.deleteFromDisk(cacheKey)
    
    this.logger.debug(`缓存已删除: ${cacheKey}`)
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string, type: CacheType): Promise<boolean> {
    if (!this.config.enabled || !this.config.types.includes(type)) {
      return false
    }

    const cacheKey = this.buildCacheKey(key, type)
    
    if (this.cache.has(cacheKey)) {
      const item = this.cache.get(cacheKey)!
      return !this.isExpired(item)
    }

    // 检查磁盘
    const item = await this.loadFromDisk(cacheKey)
    return item !== null && !this.isExpired(item)
  }

  /**
   * 清理指定类型的缓存
   */
  async clear(type?: CacheType): Promise<void> {
    if (type) {
      // 清理指定类型
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(`${type}:`)
      )

      for (const key of keysToDelete) {
        this.cache.delete(key)
        await this.deleteFromDisk(key)
      }

      this.logger.info(`已清理 ${type} 类型缓存，删除 ${keysToDelete.length} 项`)
    } else {
      // 清理所有缓存
      this.cache.clear()
      await FileSystem.emptyDir(this.config.cacheDir)
      
      this.logger.info('已清理所有缓存')
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const stats: CacheStats = {
      totalItems: this.cache.size,
      totalSize: 0,
      byType: {} as any,
      hitRate: this.hitCount + this.missCount > 0 
        ? this.hitCount / (this.hitCount + this.missCount) 
        : 0,
      lastCleanup: this.lastCleanup
    }

    // 初始化类型统计
    for (const type of this.config.types) {
      stats.byType[type] = { count: 0, size: 0 }
    }

    // 计算统计数据
    for (const item of this.cache.values()) {
      stats.totalSize += item.size
      
      if (stats.byType[item.type]) {
        stats.byType[item.type].count++
        stats.byType[item.type].size += item.size
      }
    }

    return stats
  }

  /**
   * 压缩缓存
   */
  async compress(): Promise<void> {
    if (!this.config.compression) {
      return
    }

    this.logger.info('开始压缩缓存...')
    
    const startTime = Date.now()
    let compressed = 0

    for (const item of this.cache.values()) {
      if (await this.compressItem(item)) {
        compressed++
      }
    }

    const duration = Date.now() - startTime
    this.logger.info(`缓存压缩完成，压缩 ${compressed} 项，耗时 ${duration}ms`)
  }

  /**
   * 自动清理过期缓存
   */
  async cleanup(): Promise<void> {
    const now = Date.now()
    const stats = this.getStats()
    
    this.logger.info('开始清理过期缓存...')

    let cleaned = 0
    const expired: string[] = []
    const lru: Array<{ key: string; score: number }> = []

    // 查找过期项和计算LRU分数
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expired.push(key)
      } else {
        // LRU分数 = 访问频率 * 最近访问时间权重
        const recency = (now - item.lastAccessed) / (24 * 60 * 60 * 1000) // 天数
        const frequency = item.accessCount
        const score = frequency / (1 + recency)
        lru.push({ key, score })
      }
    }

    // 删除过期项
    for (const key of expired) {
      this.cache.delete(key)
      await this.deleteFromDisk(key)
      cleaned++
    }

    // 如果仍然超过阈值，删除最少使用的项
    const sizeThreshold = this.config.maxSize * 1024 * 1024 * this.config.autoClean.threshold
    if (stats.totalSize > sizeThreshold && lru.length > 0) {
      lru.sort((a, b) => a.score - b.score)
      
      let currentSize = stats.totalSize
      for (const { key } of lru) {
        if (currentSize <= sizeThreshold) break
        
        const item = this.cache.get(key)
        if (item) {
          currentSize -= item.size
          this.cache.delete(key)
          await this.deleteFromDisk(key)
          cleaned++
        }
      }
    }

    this.lastCleanup = now
    this.logger.info(`清理完成，删除 ${cleaned} 项缓存`)
  }

  /**
   * 构建缓存键
   */
  private buildCacheKey(key: string, type: CacheType): string {
    const hash = createHash('md5').update(key).digest('hex')
    return `${type}:${hash}`
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return item.expiresAt ? Date.now() > item.expiresAt : false
  }

  /**
   * 计算数据大小
   */
  private calculateSize(data: any): number {
    return Buffer.byteLength(JSON.stringify(data), 'utf8')
  }

  /**
   * 格式化大小显示
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  /**
   * 从磁盘加载缓存
   */
  private async loadFromDisk(key: string): Promise<CacheItem | null> {
    try {
      const filePath = path.join(this.config.cacheDir, `${key}.json`)
      
      if (!(await FileSystem.exists(filePath))) {
        return null
      }

      const content = await FileSystem.readFile(filePath)
      const item: CacheItem = JSON.parse(content)

      if (this.isExpired(item)) {
        await FileSystem.remove(filePath)
        return null
      }

      return item
    } catch (error) {
      this.logger.debug(`加载缓存失败: ${key}`, error)
      return null
    }
  }

  /**
   * 保存缓存到磁盘
   */
  private async saveToDisk(item: CacheItem): Promise<void> {
    try {
      const filePath = path.join(this.config.cacheDir, `${item.key}.json`)
      await FileSystem.writeFile(filePath, JSON.stringify(item))
    } catch (error) {
      this.logger.debug(`保存缓存失败: ${item.key}`, error)
    }
  }

  /**
   * 从磁盘删除缓存
   */
  private async deleteFromDisk(key: string): Promise<void> {
    try {
      const filePath = path.join(this.config.cacheDir, `${key}.json`)
      if (await FileSystem.exists(filePath)) {
        await FileSystem.remove(filePath)
      }
    } catch (error) {
      this.logger.debug(`删除缓存文件失败: ${key}`, error)
    }
  }

  /**
   * 加载现有缓存
   */
  private async loadCache(): Promise<void> {
    try {
      if (!(await FileSystem.exists(this.config.cacheDir))) {
        return
      }

      const files = await FileSystem.readDir(this.config.cacheDir)
      let loaded = 0

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        try {
          const filePath = path.join(this.config.cacheDir, file)
          const content = await FileSystem.readFile(filePath)
          const item: CacheItem = JSON.parse(content)

          if (!this.isExpired(item)) {
            this.cache.set(item.key, item)
            loaded++
          } else {
            await FileSystem.remove(filePath)
          }
        } catch (error) {
          this.logger.debug(`加载缓存文件失败: ${file}`, error)
        }
      }

      if (loaded > 0 && this.logger.getLevel() === 'debug') {
        this.logger.debug(`加载了 ${loaded} 项缓存`)
      }
    } catch (error) {
      this.logger.warn('加载现有缓存失败', error)
    }
  }

  /**
   * 强制执行大小限制
   */
  private async enforceSize(newItemSize: number): Promise<void> {
    const stats = this.getStats()
    const maxBytes = this.config.maxSize * 1024 * 1024
    const projectedSize = stats.totalSize + newItemSize

    if (projectedSize > maxBytes) {
      // 需要清理空间
      const targetSize = maxBytes * 0.8 // 清理到80%
      const needToFree = projectedSize - targetSize

      const items = Array.from(this.cache.values())
        .sort((a, b) => {
          // 按LRU分数排序（访问频率和最近性）
          const aScore = a.accessCount / (1 + (Date.now() - a.lastAccessed) / (24 * 60 * 60 * 1000))
          const bScore = b.accessCount / (1 + (Date.now() - b.lastAccessed) / (24 * 60 * 60 * 1000))
          return aScore - bScore
        })

      let freed = 0
      for (const item of items) {
        if (freed >= needToFree) break

        this.cache.delete(item.key)
        await this.deleteFromDisk(item.key)
        freed += item.size
      }

      this.logger.debug(`为新缓存释放空间: ${this.formatSize(freed)}`)
    }
  }

  /**
   * 压缩单个缓存项
   */
  private async compressItem(_item: CacheItem): Promise<boolean> {
    // 这里可以实现具体的压缩逻辑
    // 例如使用 zlib 压缩数据
    return false
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    const interval = this.config.autoClean.interval * 60 * 60 * 1000 // 转换为毫秒

    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanup()
      } catch (error) {
        this.logger.error('自动清理失败', error)
      }
    }, interval)

    // 允许进程在仅有该定时器时正常退出
    if (typeof (this.cleanupTimer as any).unref === 'function') {
      (this.cleanupTimer as any).unref()
    }

    this.logger.debug(`启动自动清理，间隔: ${this.config.autoClean.interval} 小时`)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
      this.logger.debug('停止自动清理')
    }
  }

  /**
   * 销毁缓存管理器
   */
  async destroy(): Promise<void> {
    this.stopAutoCleanup()
    this.cache.clear()
    this.logger.info('缓存管理器已销毁')
  }
}

// 全局缓存管理器实例
export const cacheManager = new CacheManager()
