/**
 * 缓存相关工具函数
 */

import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

interface CacheEntry {
  key: string
  value: any
  timestamp: number
  hash?: string
}

interface CacheOptions {
  cacheDir?: string
  ttl?: number // Time to live in milliseconds
  namespace?: string
}

/**
 * 构建缓存管理器
 */
export class BuildCache {
  private cacheDir: string
  private ttl: number
  private namespace: string
  private memoryCache: Map<string, CacheEntry> = new Map()
  private initialized: boolean = false

  constructor(options: CacheOptions = {}) {
    const defaultCacheDir = path.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder')
    this.cacheDir = options.cacheDir || defaultCacheDir
    this.ttl = options.ttl || 24 * 60 * 60 * 1000 // 默认24小时
    this.namespace = options.namespace || 'default'
  }

  /**
   * 初始化缓存目录
   */
  private async ensureCacheDir(): Promise<void> {
    if (!this.initialized) {
      await fs.mkdir(this.cacheDir, { recursive: true })
      this.initialized = true
    }
  }

  /**
   * 生成缓存键的哈希值
   */
  private generateHash(key: string): string {
    return createHash('md5').update(`${this.namespace}:${key}`).digest('hex')
  }

  /**
   * 获取缓存文件路径
   */
  private getCachePath(key: string): string {
    const hash = this.generateHash(key)
    return path.join(this.cacheDir, `${hash}.json`)
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, _options?: { ttl?: number }): Promise<void> {
    await this.ensureCacheDir()

    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      hash: this.generateHash(key)
    }

    // 更新内存缓存
    this.memoryCache.set(key, entry)

    // 写入文件缓存
    const cachePath = this.getCachePath(key)
    try {
      await fs.writeFile(cachePath, JSON.stringify(entry, null, 2))
    } catch (error) {
      // 缓存写入失败不应该中断构建
      console.warn(`Cache write failed for key: ${key}`, error)
    }
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    // 先检查内存缓存
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.value as T
    }

    // 检查文件缓存
    const cachePath = this.getCachePath(key)
    try {
      const content = await fs.readFile(cachePath, 'utf-8')
      const entry: CacheEntry = JSON.parse(content)

      if (this.isValid(entry)) {
        // 更新内存缓存
        this.memoryCache.set(key, entry)
        return entry.value as T
      }
    } catch {
      // 缓存不存在或读取失败
    }

    return null
  }

  /**
   * 检查缓存是否有效
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now()
    return now - entry.timestamp < this.ttl
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)

    const cachePath = this.getCachePath(key)
    try {
      await fs.unlink(cachePath)
    } catch {
      // 文件可能不存在
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    try {
      const files = await fs.readdir(this.cacheDir)
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      )
    } catch {
      // 目录可能不存在
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    memoryEntries: number
    fileEntries: number
    totalSize: number
  }> {
    let fileEntries = 0
    let totalSize = 0

    try {
      const files = await fs.readdir(this.cacheDir)
      fileEntries = files.length

      for (const file of files) {
        const stat = await fs.stat(path.join(this.cacheDir, file))
        totalSize += stat.size
      }
    } catch {
      // 目录可能不存在
    }

    return {
      memoryEntries: this.memoryCache.size,
      fileEntries,
      totalSize
    }
  }
}

/**
 * TypeScript 编译缓存
 */
export class TypeScriptCache extends BuildCache {
  constructor() {
    super({
      namespace: 'typescript',
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    })
  }

  /**
   * 生成 TypeScript 文件的缓存键
   */
  async generateFileKey(filePath: string, content?: string): Promise<string> {
    if (!content) {
      content = await fs.readFile(filePath, 'utf-8')
    }
    const hash = createHash('sha256').update(content).digest('hex')
    return `${filePath}:${hash}`
  }

  /**
   * 缓存编译结果
   */
  async cacheCompiled(
    filePath: string,
    content: string,
    compiled: { code: string; map?: string; dts?: string }
  ): Promise<void> {
    const key = await this.generateFileKey(filePath, content)
    await this.set(key, compiled)
  }

  /**
   * 获取编译缓存
   */
  async getCompiled(
    filePath: string,
    content?: string
  ): Promise<{ code: string; map?: string; dts?: string } | null> {
    const key = await this.generateFileKey(filePath, content)
    return this.get(key)
  }
}

/**
 * Rollup 插件缓存
 */
export class RollupCache extends BuildCache {
  constructor() {
    super({
      namespace: 'rollup',
      ttl: 24 * 60 * 60 * 1000 // 24小时
    })
  }

  /**
   * 缓存 Rollup 构建结果
   */
  async cacheBuildResult(
    config: any,
    result: any
  ): Promise<void> {
    const configHash = createHash('md5').update(JSON.stringify(config)).digest('hex')
    await this.set(`build:${configHash}`, result)
  }

  /**
   * 获取 Rollup 构建缓存
   */
  async getBuildResult(config: any): Promise<any> {
    const configHash = createHash('md5').update(JSON.stringify(config)).digest('hex')
    return this.get(`build:${configHash}`)
  }
}

/**
 * 创建默认缓存实例
 */
export const buildCache = new BuildCache()
export const tsCache = new TypeScriptCache()
export const rollupCache = new RollupCache()

/**
 * 缓存装饰器
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    key?: (...args: Parameters<T>) => string
    ttl?: number
  }
): T {
  const cache = new BuildCache({ ttl: options?.ttl })

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const cacheKey = options?.key ? options.key(...args) : JSON.stringify(args)
    
    // 尝试从缓存获取
    const cached = await cache.get(cacheKey)
    if (cached !== null) {
      return cached
    }

    // 执行原函数
    const result = await fn(...args)
    
    // 缓存结果
    await cache.set(cacheKey, result)
    
    return result
  }) as T
}
