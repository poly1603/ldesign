/**
 * 构建缓存管理器
 * 
 * 提供高级缓存管理功能，包括智能缓存策略、缓存分析和优化
 */

import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { Logger } from './logger'

/**
 * 缓存条目
 */
export interface CacheEntry {
  key: string
  hash: string
  data: any
  metadata: {
    size: number
    createdAt: Date
    lastAccessed: Date
    accessCount: number
    tags: string[]
    dependencies: string[]
    ttl?: number
    expiresAt?: Date
  }
}

/**
 * 缓存统计
 */
export interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictionCount: number
  oldestEntry: Date
  newestEntry: Date
  averageAccessCount: number
  sizeDistribution: {
    small: number // < 1KB
    medium: number // 1KB - 100KB
    large: number // 100KB - 1MB
    huge: number // > 1MB
  }
  tagDistribution: Record<string, number>
}

/**
 * 缓存策略
 */
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'size-based' | 'dependency-based'

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 缓存目录 */
  cacheDir: string
  /** 最大缓存大小 (bytes) */
  maxSize: number
  /** 最大条目数 */
  maxEntries: number
  /** 默认TTL (秒) */
  defaultTtl?: number
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 是否启用压缩 */
  compression: boolean
  /** 是否启用加密 */
  encryption: boolean
  /** 清理间隔 (秒) */
  cleanupInterval: number
}

/**
 * 缓存操作结果
 */
export interface CacheOperationResult {
  success: boolean
  key: string
  hit?: boolean
  size?: number
  error?: string
  fromCache?: boolean
  executionTime: number
}

/**
 * 依赖变更检测器
 */
export interface DependencyTracker {
  /** 文件路径到哈希的映射 */
  fileHashes: Map<string, string>
  /** 依赖关系图 */
  dependencyGraph: Map<string, Set<string>>
}

/**
 * 构建缓存管理器
 */
export class BuildCacheManager {
  private logger: Logger
  private config: CacheConfig
  private cache = new Map<string, CacheEntry>()
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  }
  private dependencyTracker: DependencyTracker = {
    fileHashes: new Map(),
    dependencyGraph: new Map()
  }
  private cleanupTimer?: NodeJS.Timeout

  constructor(config?: Partial<CacheConfig>, logger?: Logger) {
    const defaultConfig: CacheConfig = {
      cacheDir: path.join(process.cwd(), '.cache'),
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 1000,
      strategy: 'lru',
      compression: false,
      encryption: false,
      cleanupInterval: 60 * 60 // 1 hour
    }

    this.config = { ...defaultConfig, ...config }
    this.logger = logger || new Logger({ level: 'info' })
    this.startCleanupTimer()
  }

  /**
   * 初始化缓存
   */
  async initialize(): Promise<void> {
    try {
      await fs.ensureDir(this.config?.cacheDir)
      await this.loadCacheIndex()
      this.logger.info(`缓存管理器初始化完成，缓存目录: ${this.config?.cacheDir}`)
    } catch (error) {
      this.logger.error('缓存初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string, dependencies?: string[]): Promise<T | null> {
    const startTime = Date.now()

    try {
      let entry: CacheEntry | null = this.cache.get(key) || null

      // 如果内存中没有，尝试从磁盘加载
      if (!entry) {
        entry = await this.loadFromDisk(key)
        if (!entry) {
          this.stats.misses++
          return null
        }

        // 加载到内存中
        this.cache.set(key, entry)
      }

      // 检查TTL
      if (entry.metadata.ttl && this.isExpired(entry)) {
        await this.delete(key)
        this.stats.misses++
        return null
      }

      // 检查依赖是否变更
      if (dependencies && await this.hasDependencyChanged(key, dependencies)) {
        await this.delete(key)
        this.stats.misses++
        return null
      }

      // 更新访问信息
      entry.metadata.lastAccessed = new Date()
      entry.metadata.accessCount++

      this.stats.hits++

      this.logger.debug(`缓存命中: ${key}, 耗时: ${Date.now() - startTime}ms`)
      return entry.data
    } catch (error) {
      this.logger.error(`获取缓存失败: ${key}`, error)
      this.stats.misses++
      return null
    }
  }

  /**
   * 设置缓存
   */
  async set<T = any>(
    key: string,
    data: T,
    options: {
      tags?: string[]
      dependencies?: string[]
      ttl?: number
    } = {}
  ): Promise<CacheOperationResult> {
    const startTime = Date.now()

    try {
      const serializedData = JSON.stringify(data)
      const hash = this.generateHash(serializedData)
      const size = Buffer.byteLength(serializedData, 'utf8')

      // 检查是否需要清理空间
      await this.ensureSpace(size)

      const entry: CacheEntry = {
        key,
        hash,
        data,
        metadata: {
          size,
          createdAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 0,
          tags: options.tags || [],
          dependencies: options.dependencies || [],
          ttl: options.ttl || this.config?.defaultTtl
        }
      }

      this.cache.set(key, entry)

      // 更新依赖跟踪
      if (options.dependencies) {
        await this.updateDependencyTracking(key, options.dependencies)
      }

      // 持久化到磁盘
      await this.persistEntry(entry)

      const executionTime = Date.now() - startTime
      this.logger.debug(`缓存设置成功: ${key}, 大小: ${size} bytes, 耗时: ${executionTime}ms`)

      return {
        success: true,
        key,
        size,
        executionTime
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      this.logger.error(`设置缓存失败: ${key}`, error)

      // 对于某些错误，抛出异常而不是返回错误结果
      if (error instanceof Error && error.message.includes('Permission denied')) {
        throw error
      }

      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      }
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    if (this.cache.has(key)) {
      return true
    }

    // 检查磁盘文件
    const filePath = this.getCacheFilePath(key)
    return await fs.pathExists(filePath)
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      let deleted = false

      // 从内存中删除
      if (this.cache.has(key)) {
        this.cache.delete(key)
        deleted = true
      }

      // 删除磁盘文件
      const filePath = this.getCacheFilePath(key)
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath)
          deleted = true
        }
      } catch {
        // 文件可能不存在，忽略错误
      }

      if (deleted) {
        this.logger.debug(`缓存删除成功: ${key}`)
      }

      return deleted
    } catch (error) {
      this.logger.error(`删除缓存失败: ${key}`, error)
      return false
    }
  }

  /**
   * 设置缓存（带依赖跟踪）
   */
  async setWithDependencies(key: string, data: any, dependencies: string[], options?: { ttl?: number, tags?: string[] }): Promise<CacheOperationResult> {
    const result = await this.set(key, data, options)

    if (result.success) {
      await this.updateDependencyTracking(key, dependencies)
    }

    return result
  }

  /**
   * 清空缓存
   */
  async clear(tags?: string[]): Promise<number> {
    let deletedCount = 0

    try {
      if (tags && tags.length > 0) {
        // 按标签清理
        for (const [key, entry] of this.cache) {
          if (entry.metadata.tags.some(tag => tags.includes(tag))) {
            await this.delete(key)
            deletedCount++
          }
        }
      } else {
        // 清空所有缓存
        deletedCount = this.cache.size
        this.cache.clear()

        // 清空缓存目录
        await fs.emptyDir(this.config?.cacheDir)
      }

      this.logger.info(`清理缓存完成，删除 ${deletedCount} 个条目`)
      return deletedCount
    } catch (error) {
      this.logger.error('清理缓存失败:', error)
      return deletedCount
    }
  }

  /**
   * 获取缓存大小
   */
  async getSize(): Promise<number> {
    try {
      let totalSize = 0

      // 计算内存中的缓存大小
      const memorySize = Array.from(this.cache.values())
        .reduce((sum, entry) => sum + entry.metadata.size, 0)

      // 如果有内存缓存，直接返回
      if (memorySize > 0) {
        return memorySize
      }

      // 否则扫描磁盘文件
      if (await fs.pathExists(this.config?.cacheDir)) {
        const files = await fs.readdir(this.config?.cacheDir)
        const cacheFiles = files.filter(file => file.endsWith('.cache'))

        for (const file of cacheFiles) {
          try {
            const filePath = path.join(this.config?.cacheDir, file)
            const stats = await fs.stat(filePath)
            totalSize += stats.size
          } catch {
            // 忽略无法访问的文件
          }
        }
      }

      return totalSize
    } catch (error) {
      this.logger.error('获取缓存大小失败:', error)
      return 0
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalEntries = entries.length
    const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.size, 0)
    const totalOperations = this.stats.hits + this.stats.misses

    const hitRate = totalOperations > 0 ? this.stats.hits / totalOperations : 0
    const missRate = totalOperations > 0 ? this.stats.misses / totalOperations : 0

    const sizeDistribution = {
      small: 0,
      medium: 0,
      large: 0,
      huge: 0
    }

    const tagDistribution: Record<string, number> = {}

    let oldestEntry = new Date()
    let newestEntry = new Date(0)
    let totalAccessCount = 0

    for (const entry of entries) {
      // 大小分布
      if (entry.metadata.size < 1024) {
        sizeDistribution.small++
      } else if (entry.metadata.size < 100 * 1024) {
        sizeDistribution.medium++
      } else if (entry.metadata.size < 1024 * 1024) {
        sizeDistribution.large++
      } else {
        sizeDistribution.huge++
      }

      // 标签分布
      for (const tag of entry.metadata.tags) {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + 1
      }

      // 时间统计
      if (entry.metadata.createdAt < oldestEntry) {
        oldestEntry = entry.metadata.createdAt
      }
      if (entry.metadata.createdAt > newestEntry) {
        newestEntry = entry.metadata.createdAt
      }

      totalAccessCount += entry.metadata.accessCount
    }

    return {
      totalEntries,
      entryCount: totalEntries, // 为了兼容测试
      totalSize,
      hitRate,
      missRate,
      evictionCount: this.stats.evictions,
      oldestEntry,
      newestEntry,
      averageAccessCount: totalEntries > 0 ? totalAccessCount / totalEntries : 0,
      sizeDistribution,
      tagDistribution
    } as any
  }

  /**
   * 清理缓存
   */
  async cleanup(): Promise<number> {
    const expiredCount = await this.cleanupExpired()
    const unusedCount = await this.cleanupUnused()
    return expiredCount + unusedCount
  }

  /**
   * 优化缓存
   */
  async optimize(): Promise<{
    beforeStats: CacheStats
    afterStats: CacheStats
    optimizations: string[]
  }> {
    const beforeStats = this.getStats()
    const optimizations: string[] = []

    try {
      // 清理过期条目
      const expiredCount = await this.cleanupExpired()
      if (expiredCount > 0) {
        optimizations.push(`清理了 ${expiredCount} 个过期条目`)
      }

      // 清理未使用的条目
      const unusedCount = await this.cleanupUnused()
      if (unusedCount > 0) {
        optimizations.push(`清理了 ${unusedCount} 个未使用条目`)
      }

      // 压缩大文件
      const compressedCount = await this.compressLargeEntries()
      if (compressedCount > 0) {
        optimizations.push(`压缩了 ${compressedCount} 个大文件`)
      }

      const afterStats = this.getStats()

      this.logger.info(`缓存优化完成: ${optimizations.join(', ')}`)

      return {
        beforeStats,
        afterStats,
        optimizations
      }
    } catch (error) {
      this.logger.error('缓存优化失败:', error)
      throw error
    }
  }

  /**
   * 生成哈希
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * 检查是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    if (!entry.metadata.ttl) {
      return false
    }

    const now = Date.now()
    const createdAt = entry.metadata.createdAt.getTime()
    const ttlMs = entry.metadata.ttl * 1000

    return now - createdAt > ttlMs
  }

  /**
   * 检查依赖是否变更
   */
  private async hasDependencyChanged(_key: string, dependencies: string[]): Promise<boolean> {
    for (const dep of dependencies) {
      try {
        const stats = await fs.stat(dep)
        const currentHash = this.generateHash(stats.mtime.toISOString() + stats.size)
        const cachedHash = this.dependencyTracker.fileHashes.get(dep)

        if (cachedHash !== currentHash) {
          return true
        }
      } catch {
        // 文件不存在或无法访问，认为已变更
        return true
      }
    }

    return false
  }

  /**
   * 更新依赖跟踪
   */
  private async updateDependencyTracking(key: string, dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      try {
        const stats = await fs.stat(dep)
        const hash = this.generateHash(stats.mtime.toISOString() + stats.size)
        this.dependencyTracker.fileHashes.set(dep, hash)

        if (!this.dependencyTracker.dependencyGraph.has(key)) {
          this.dependencyTracker.dependencyGraph.set(key, new Set())
        }
        this.dependencyTracker.dependencyGraph.get(key)!.add(dep)
      } catch {
        // 忽略无法访问的文件
      }
    }
  }

  /**
   * 确保有足够空间
   */
  private async ensureSpace(requiredSize: number): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.metadata.size, 0)

    if (currentSize + requiredSize <= this.config?.maxSize &&
      this.cache.size < this.config?.maxEntries) {
      return
    }

    // 根据策略清理缓存
    await this.evictEntries(requiredSize)
  }

  /**
   * 驱逐条目
   */
  private async evictEntries(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.values())
    let freedSize = 0

    // 根据策略排序
    const sortedEntries = this.sortEntriesForEviction(entries)

    for (const entry of sortedEntries) {
      if (freedSize >= requiredSize && this.cache.size < this.config?.maxEntries) {
        break
      }

      await this.delete(entry.key)
      freedSize += entry.metadata.size
      this.stats.evictions++
    }
  }

  /**
   * 根据策略排序条目
   */
  private sortEntriesForEviction(entries: CacheEntry[]): CacheEntry[] {
    switch (this.config?.strategy) {
      case 'lru':
        return entries.sort((a, b) =>
          a.metadata.lastAccessed.getTime() - b.metadata.lastAccessed.getTime()
        )

      case 'lfu':
        return entries.sort((a, b) =>
          a.metadata.accessCount - b.metadata.accessCount
        )

      case 'size-based':
        return entries.sort((a, b) => b.metadata.size - a.metadata.size)

      case 'ttl':
        return entries.sort((a, b) =>
          a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime()
        )

      default:
        return entries
    }
  }

  /**
   * 获取缓存文件路径
   */
  private getCacheFilePath(key: string): string {
    const hash = this.generateHash(key)
    return path.join(this.config?.cacheDir, `${hash}.cache`)
  }

  /**
   * 从磁盘加载缓存条目
   */
  private async loadFromDisk(key: string): Promise<CacheEntry | null> {
    try {
      const filePath = this.getCacheFilePath(key)

      if (!(await fs.pathExists(filePath))) {
        return null
      }

      const stats = await fs.stat(filePath)
      const data = await fs.readFile(filePath, 'utf8')
      const entry: CacheEntry = JSON.parse(data)

      // 恢复日期对象
      entry.metadata.createdAt = new Date(entry.metadata.createdAt)
      entry.metadata.lastAccessed = new Date(entry.metadata.lastAccessed)
      if (entry.metadata.expiresAt) {
        entry.metadata.expiresAt = new Date(entry.metadata.expiresAt)
      }

      // 更新文件大小
      entry.metadata.size = stats.size

      return entry
    } catch (error) {
      this.logger.debug(`从磁盘加载缓存失败: ${key}`, error)
      return null
    }
  }

  /**
   * 持久化条目
   */
  private async persistEntry(entry: CacheEntry): Promise<void> {
    const filePath = this.getCacheFilePath(entry.key)

    // 确保目录存在
    await fs.ensureDir(path.dirname(filePath))

    const data = JSON.stringify(entry)
    await fs.writeFile(filePath, data, 'utf8')
  }

  /**
   * 加载缓存索引
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const files = await fs.readdir(this.config?.cacheDir)
      const cacheFiles = files.filter(file => file.endsWith('.cache'))

      for (const file of cacheFiles) {
        try {
          const filePath = path.join(this.config?.cacheDir, file)
          const content = await fs.readFile(filePath, 'utf8')
          const entry: CacheEntry = JSON.parse(content)

          // 恢复日期对象
          entry.metadata.createdAt = new Date(entry.metadata.createdAt)
          entry.metadata.lastAccessed = new Date(entry.metadata.lastAccessed)

          this.cache.set(entry.key, entry)
        } catch (error) {
          this.logger.warn(`加载缓存文件失败: ${file}`, error)
        }
      }

      this.logger.info(`加载了 ${this.cache.size} 个缓存条目`)
    } catch (error) {
      this.logger.warn('加载缓存索引失败:', error)
    }
  }

  /**
   * 清理过期条目
   */
  private async cleanupExpired(): Promise<number> {
    let count = 0

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        await this.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * 清理未使用条目
   */
  private async cleanupUnused(): Promise<number> {
    let count = 0
    const threshold = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7天

    for (const [key, entry] of this.cache) {
      if (entry.metadata.lastAccessed.getTime() < threshold &&
        entry.metadata.accessCount === 0) {
        await this.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * 压缩大条目
   */
  private async compressLargeEntries(): Promise<number> {
    // 简化实现，实际可以使用 zlib 压缩
    return 0
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanupExpired()
      } catch (error) {
        this.logger.error('定时清理失败:', error)
      }
    }, this.config?.cleanupInterval * 1000)
  }

  /**
   * 销毁缓存管理器
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    // 保存当前状态
    const stats = this.getStats()
    this.logger.info(`缓存管理器销毁，最终统计: ${stats.totalEntries} 条目, ${Math.round(stats.totalSize / 1024)} KB`)
  }
}
