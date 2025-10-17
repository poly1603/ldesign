/**
 * 缓存相关工具函数
 */

import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs-extra'

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
  maxSize?: number // 最大缓存体积（字节），超过后按时间淘汰
}

/**
 * 构建缓存管理器
 */
export class BuildCache {
  private cacheDir: string
  private ttl: number
  private namespace: string
  private maxSize?: number
  private memoryCache: Map<string, CacheEntry> = new Map()
  private initialized: boolean = false

  constructor(options: CacheOptions = {}) {
    const defaultCacheDir = path.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder')
    this.cacheDir = options.cacheDir || defaultCacheDir
    this.ttl = options.ttl || 24 * 60 * 60 * 1000 // 默认24小时
    this.namespace = options.namespace || 'default'
    this.maxSize = options.maxSize
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
      // 写入后进行体积检查与清理
      if (this.maxSize && this.maxSize > 0) {
        await this.enforceMaxSize()
      }
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

  /** 获取缓存目录 */
  public getDirectory(): string { return this.cacheDir }
  /** 获取 TTL */
  public getTTL(): number { return this.ttl }
  /** 获取最大体积限制 */
  public getMaxSize(): number | undefined { return this.maxSize }

  /**
   * 检查缓存是否有效
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now()
    return now - entry.timestamp < this.ttl
  }

  /**
   * 若设置了 maxSize，则在超过阈值时按旧到新淘汰文件
   */
  private async enforceMaxSize(): Promise<void> {
    if (!this.maxSize || this.maxSize <= 0) return
    try {
      const files = await fs.readdir(this.cacheDir)
      // 收集 {file, size, timestamp}
      const entries: Array<{ file: string; size: number; timestamp: number }> = []
      let total = 0
      for (const f of files) {
        const full = path.join(this.cacheDir, f)
        const stat = await fs.stat(full)
        total += stat.size
        try {
          const content = await fs.readFile(full, 'utf-8')
          const parsed = JSON.parse(content) as CacheEntry
          entries.push({ file: full, size: stat.size, timestamp: parsed.timestamp || 0 })
        } catch {
          entries.push({ file: full, size: stat.size, timestamp: 0 })
        }
      }
      if (total <= this.maxSize) return
      // 按 timestamp 升序（旧的优先删除）
      entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      for (const e of entries) {
        if (total <= this.maxSize) break
        try {
          await fs.unlink(e.file)
          total -= e.size
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
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
        files.map((file: string) => fs.unlink(path.join(this.cacheDir, file)))
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
    const hash = createHash('sha256').update(content || '').digest('hex')
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
  constructor(options: CacheOptions = {}) {
    super({
      namespace: 'rollup',
      ttl: options.ttl ?? 24 * 60 * 60 * 1000, // 24小时
      cacheDir: options.cacheDir,
      maxSize: options.maxSize,
    })
  }

  /**
   * 缓存 Rollup 构建结果（包含文件内容）
   */
  async cacheBuildResult(
    config: any,
    result: any
  ): Promise<void> {
    const configHash = createHash('md5').update(JSON.stringify(config)).digest('hex')

    // 增强缓存数据，包含文件内容
    const enhancedResult = {
      ...result,
      _cacheMetadata: {
        timestamp: Date.now(),
        configHash,
        hasFileContents: true
      }
    }

    // 如果有输出文件，尝试读取文件内容并缓存
    if (result.outputs && Array.isArray(result.outputs)) {
      const fs = await import('fs-extra')
      const path = await import('path')

      for (const output of result.outputs) {
        if (output.fileName && typeof output.fileName === 'string') {
          try {
            const fullPath = path.isAbsolute(output.fileName)
              ? output.fileName
              : path.resolve(process.cwd(), output.fileName)

            if (await fs.pathExists(fullPath)) {
              // 读取文件内容并添加到缓存
              const content = await fs.readFile(fullPath)
              output._cachedContent = content.toString('base64')
              output._cachedPath = fullPath
            }
          } catch (error) {
            // 忽略文件读取错误，继续处理其他文件
          }
        }
      }
    }

    await this.set(`build:${configHash}`, enhancedResult)
  }

  /**
   * 获取 Rollup 构建缓存
   */
  async getBuildResult(config: any): Promise<any> {
    const configHash = createHash('md5').update(JSON.stringify(config)).digest('hex')
    return this.get(`build:${configHash}`)
  }

  /**
   * 从缓存结果恢复文件
   */
  async restoreFilesFromCache(cachedResult: any): Promise<boolean> {
    if (!cachedResult || !cachedResult.outputs || !Array.isArray(cachedResult.outputs)) {
      return false
    }

    const fs = await import('fs-extra')
    const path = await import('path')
    let restoredCount = 0

    for (const output of cachedResult.outputs) {
      if (output._cachedContent && output._cachedPath) {
        try {
          // 确保目录存在
          await fs.ensureDir(path.dirname(output._cachedPath))

          // 恢复文件内容
          const content = Buffer.from(output._cachedContent, 'base64')
          await fs.writeFile(output._cachedPath, content)

          restoredCount++
        } catch (error) {
          console.warn(`恢复文件失败: ${output._cachedPath}`, error)
        }
      }
    }

    return restoredCount > 0
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
