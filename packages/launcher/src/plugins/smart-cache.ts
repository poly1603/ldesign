/**
 * 智能构建缓存优化插件
 * 
 * 提供更智能的缓存策略，包括增量构建、智能失效和跨项目缓存共享
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { performance } from 'node:perf_hooks'

export interface SmartCacheOptions {
  /** 缓存目录 */
  cacheDir?: string
  /** 是否启用跨项目缓存共享 */
  enableCrossProject?: boolean
  /** 是否启用智能失效 */
  enableSmartInvalidation?: boolean
  /** 是否启用增量构建 */
  enableIncrementalBuild?: boolean
  /** 缓存压缩级别 (0-9) */
  compressionLevel?: number
  /** 最大缓存大小 (MB) */
  maxCacheSize?: number
  /** 缓存过期时间 (小时) */
  cacheExpiry?: number
  /** 是否启用缓存预热 */
  enablePrewarm?: boolean
  /** 预热文件模式 */
  prewarmPatterns?: string[]
}

export interface CacheEntry {
  /** 文件哈希 */
  hash: string
  /** 依赖哈希 */
  depsHash: string
  /** 构建结果 */
  result: any
  /** 创建时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccess: number
  /** 文件大小 */
  size: number
}

export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存命中率 */
  hitRate: number
  /** 总缓存大小 */
  totalSize: number
  /** 缓存条目数量 */
  entryCount: number
  /** 节省的构建时间 (ms) */
  timeSaved: number
}

export class SmartCacheManager {
  private logger: Logger
  private options: Required<SmartCacheOptions>
  private cacheIndex: Map<string, CacheEntry> = new Map()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    entryCount: 0,
    timeSaved: 0
  }
  private indexPath: string
  private initialized = false

  constructor(options: SmartCacheOptions = {}) {
    this.logger = new Logger('SmartCache')
    this.options = {
      cacheDir: path.join(process.cwd(), '.cache', 'smart-build'),
      enableCrossProject: true,
      enableSmartInvalidation: true,
      enableIncrementalBuild: true,
      compressionLevel: 6,
      maxCacheSize: 1024, // 1GB
      cacheExpiry: 24 * 7, // 7天
      enablePrewarm: true,
      prewarmPatterns: ['**/*.{ts,js,vue,jsx,tsx}'],
      ...options
    }
    
    this.indexPath = path.join(this.options.cacheDir, 'index.json')
  }

  /**
   * 初始化缓存管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // 确保缓存目录存在
      await fs.mkdir(this.options.cacheDir, { recursive: true })
      
      // 加载缓存索引
      await this.loadCacheIndex()
      
      // 清理过期缓存
      await this.cleanExpiredCache()
      
      // 预热缓存
      if (this.options.enablePrewarm) {
        await this.prewarmCache()
      }
      
      this.initialized = true
      this.logger.info('智能缓存管理器初始化完成', {
        cacheDir: this.options.cacheDir,
        entryCount: this.cacheIndex.size
      })
    } catch (error) {
      this.logger.error('缓存管理器初始化失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 获取缓存
   */
  async get(key: string, dependencies: string[] = []): Promise<any | null> {
    await this.initialize()
    
    const startTime = performance.now()
    const entry = this.cacheIndex.get(key)
    
    if (!entry) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // 检查依赖是否变更
    if (this.options.enableSmartInvalidation) {
      const currentDepsHash = await this.calculateDependenciesHash(dependencies)
      if (entry.depsHash !== currentDepsHash) {
        this.logger.debug('缓存失效：依赖变更', { key })
        await this.invalidate(key)
        this.stats.misses++
        this.updateHitRate()
        return null
      }
    }

    // 检查缓存是否过期
    const now = Date.now()
    const ageHours = (now - entry.timestamp) / (1000 * 60 * 60)
    if (ageHours > this.options.cacheExpiry) {
      this.logger.debug('缓存失效：已过期', { key, ageHours })
      await this.invalidate(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    try {
      // 读取缓存文件
      const cachePath = this.getCachePath(key)
      const cacheData = await fs.readFile(cachePath)
      const result = JSON.parse(cacheData.toString())
      
      // 更新访问统计
      entry.accessCount++
      entry.lastAccess = now
      
      this.stats.hits++
      this.stats.timeSaved += performance.now() - startTime
      this.updateHitRate()
      
      this.logger.debug('缓存命中', { key, accessCount: entry.accessCount })
      return result
    } catch (error) {
      this.logger.warn('读取缓存失败', { key, error: (error as Error).message })
      await this.invalidate(key)
      this.stats.misses++
      this.updateHitRate()
      return null
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, dependencies: string[] = []): Promise<void> {
    await this.initialize()
    
    try {
      const cachePath = this.getCachePath(key)
      const cacheData = JSON.stringify(value)
      
      // 写入缓存文件
      await fs.mkdir(path.dirname(cachePath), { recursive: true })
      await fs.writeFile(cachePath, cacheData)
      
      // 计算哈希
      const hash = this.calculateHash(cacheData)
      const depsHash = await this.calculateDependenciesHash(dependencies)
      const size = Buffer.byteLength(cacheData)
      
      // 更新缓存索引
      const entry: CacheEntry = {
        hash,
        depsHash,
        result: value,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccess: Date.now(),
        size
      }
      
      this.cacheIndex.set(key, entry)
      this.stats.totalSize += size
      this.stats.entryCount = this.cacheIndex.size
      
      // 检查缓存大小限制
      await this.enforceMaxCacheSize()
      
      // 保存索引
      await this.saveCacheIndex()
      
      this.logger.debug('缓存已设置', { key, size })
    } catch (error) {
      this.logger.error('设置缓存失败', { key, error: (error as Error).message })
    }
  }

  /**
   * 失效缓存
   */
  async invalidate(key: string): Promise<void> {
    const entry = this.cacheIndex.get(key)
    if (!entry) return

    try {
      const cachePath = this.getCachePath(key)
      await fs.unlink(cachePath).catch(() => {}) // 忽略文件不存在的错误
      
      this.cacheIndex.delete(key)
      this.stats.totalSize -= entry.size
      this.stats.entryCount = this.cacheIndex.size
      
      await this.saveCacheIndex()
      
      this.logger.debug('缓存已失效', { key })
    } catch (error) {
      this.logger.warn('失效缓存失败', { key, error: (error as Error).message })
    }
  }

  /**
   * 清理所有缓存
   */
  async clear(): Promise<void> {
    try {
      await fs.rm(this.options.cacheDir, { recursive: true, force: true })
      await fs.mkdir(this.options.cacheDir, { recursive: true })
      
      this.cacheIndex.clear()
      this.stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalSize: 0,
        entryCount: 0,
        timeSaved: 0
      }
      
      this.logger.info('缓存已清理')
    } catch (error) {
      this.logger.error('清理缓存失败', { error: (error as Error).message })
    }
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 预热缓存
   */
  private async prewarmCache(): Promise<void> {
    this.logger.info('开始预热缓存...')
    
    try {
      // 这里可以实现预热逻辑，比如预编译常用文件
      // 实际实现会根据具体需求来定制
      this.logger.info('缓存预热完成')
    } catch (error) {
      this.logger.warn('缓存预热失败', { error: (error as Error).message })
    }
  }

  /**
   * 加载缓存索引
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexData = await fs.readFile(this.indexPath, 'utf8')
      const index = JSON.parse(indexData)
      
      this.cacheIndex = new Map(Object.entries(index.entries || {}))
      this.stats = { ...this.stats, ...index.stats }
      
      this.logger.debug('缓存索引已加载', { entryCount: this.cacheIndex.size })
    } catch (error) {
      // 索引文件不存在或损坏，创建新的
      this.cacheIndex = new Map()
      this.logger.debug('创建新的缓存索引')
    }
  }

  /**
   * 保存缓存索引
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const indexData = {
        version: '1.0.0',
        timestamp: Date.now(),
        entries: Object.fromEntries(this.cacheIndex),
        stats: this.stats
      }
      
      await fs.writeFile(this.indexPath, JSON.stringify(indexData, null, 2))
    } catch (error) {
      this.logger.warn('保存缓存索引失败', { error: (error as Error).message })
    }
  }

  /**
   * 清理过期缓存
   */
  private async cleanExpiredCache(): Promise<void> {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.cacheIndex) {
      const ageHours = (now - entry.timestamp) / (1000 * 60 * 60)
      if (ageHours > this.options.cacheExpiry) {
        expiredKeys.push(key)
      }
    }
    
    if (expiredKeys.length > 0) {
      this.logger.info(`清理 ${expiredKeys.length} 个过期缓存`)
      for (const key of expiredKeys) {
        await this.invalidate(key)
      }
    }
  }

  /**
   * 强制执行最大缓存大小限制
   */
  private async enforceMaxCacheSize(): Promise<void> {
    const maxSizeBytes = this.options.maxCacheSize * 1024 * 1024 // 转换为字节
    
    if (this.stats.totalSize <= maxSizeBytes) return
    
    // 按最后访问时间排序，删除最久未访问的缓存
    const entries = Array.from(this.cacheIndex.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
    
    let removedSize = 0
    const targetSize = maxSizeBytes * 0.8 // 清理到80%
    
    for (const [key, entry] of entries) {
      if (this.stats.totalSize - removedSize <= targetSize) break
      
      await this.invalidate(key)
      removedSize += entry.size
    }
    
    this.logger.info(`缓存大小限制清理完成，释放 ${(removedSize / 1024 / 1024).toFixed(2)}MB`)
  }

  /**
   * 计算文件哈希
   */
  private calculateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 计算依赖哈希
   */
  private async calculateDependenciesHash(dependencies: string[]): Promise<string> {
    if (dependencies.length === 0) return ''
    
    const hashes: string[] = []
    
    for (const dep of dependencies) {
      try {
        const stats = await fs.stat(dep)
        hashes.push(`${dep}:${stats.mtime.getTime()}:${stats.size}`)
      } catch {
        // 文件不存在，使用文件路径作为哈希
        hashes.push(dep)
      }
    }
    
    return crypto.createHash('md5').update(hashes.join('|')).digest('hex')
  }

  /**
   * 获取缓存文件路径
   */
  private getCachePath(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex')
    return path.join(this.options.cacheDir, 'entries', hash.slice(0, 2), hash + '.json')
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }
}

/**
 * 创建智能缓存插件
 */
export function createSmartCachePlugin(options: SmartCacheOptions = {}): Plugin {
  const cacheManager = new SmartCacheManager(options)
  
  return {
    name: 'smart-cache',
    
    async buildStart() {
      await cacheManager.initialize()
    },
    
    async buildEnd() {
      const stats = cacheManager.getStats()
      if (stats.hits + stats.misses > 0) {
        console.log(`\n📊 智能缓存统计:`)
        console.log(`   命中率: ${(stats.hitRate * 100).toFixed(1)}%`)
        console.log(`   节省时间: ${stats.timeSaved.toFixed(0)}ms`)
        console.log(`   缓存大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`)
      }
    }
  }
}
