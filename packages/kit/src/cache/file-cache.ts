/**
 * 文件缓存
 * 提供基于文件系统的持久化缓存实现
 */

import type { CacheEntry, CacheStats, CacheStore } from '../types'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { FileSystem } from '../filesystem'
import { CryptoUtils } from '../utils'

/**
 * 文件缓存选项
 */
export interface FileCacheOptions {
  cacheDir: string
  defaultTTL?: number
  maxFiles?: number
  maxSize?: number
  compress?: boolean
  serialize?: boolean
  hashKeys?: boolean
  subdirLevels?: number
}

/**
 * 文件缓存条目
 */
interface FileCacheEntry<T = unknown> extends CacheEntry<T> {
  size: number
}

/**
 * 文件缓存类
 */
export class FileCache extends EventEmitter implements CacheStore {
  private options: Required<FileCacheOptions>
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    files: 0,
    totalSize: 0,
  }

  constructor(options: FileCacheOptions) {
    super()

    this.options = {
      cacheDir: options.cacheDir,
      defaultTTL: options.defaultTTL || 3600,
      maxFiles: options.maxFiles || 10000,
      maxSize: options.maxSize || 1024 * 1024 * 1024, // 1GB
      compress: options.compress !== false,
      serialize: options.serialize !== false,
      hashKeys: options.hashKeys !== false,
      subdirLevels: options.subdirLevels || 2,
    }

    this.ensureCacheDir()
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      const filePath = this.getFilePath(key)

      if (!(await FileSystem.exists(filePath))) {
        this.stats.misses++
        this.emit('miss', key)
        return undefined
      }

      const content = await fs.readFile(filePath, 'utf8')
      const entry = JSON.parse(content) as FileCacheEntry<T>

      // 检查是否过期
      if (this.isExpired(entry)) {
        await this.delete(key)
        this.stats.misses++
        this.emit('miss', key)
        this.emit('expired', key)
        return undefined
      }

      this.stats.hits++
      this.emit('hit', key)
      return entry.value
    }
    catch (error) {
      this.stats.misses++
      this.emit('miss', key)
      this.emit('error', error)
      return undefined
    }
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const filePath = this.getFilePath(key)
      const now = Date.now()
      const expiresAt = ttl ? now + ttl * 1000 : undefined

      const entry: FileCacheEntry<T> = {
        value,
        expiresAt,
        createdAt: now,
        size: 0,
      }

      const content = JSON.stringify(entry)
      entry.size = Buffer.byteLength(content, 'utf8')

      // 确保目录存在
      await FileSystem.ensureDir(dirname(filePath))

      // 检查是否需要清理空间
      await this.checkSpaceAndCleanup(entry.size)

      // 写入文件
      await fs.writeFile(filePath, content, 'utf8')

      this.stats.sets++
      this.stats.files++
      this.stats.totalSize += entry.size
      this.emit('set', key, value)
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(key)

      if (!(await FileSystem.exists(filePath))) {
        return false
      }

      const content = await fs.readFile(filePath, 'utf8')
      const entry = JSON.parse(content) as FileCacheEntry

      if (this.isExpired(entry)) {
        await this.delete(key)
        return false
      }

      return true
    }
    catch {
      return false
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(key)

      if (!(await FileSystem.exists(filePath))) {
        return false
      }

      // 获取文件大小
      const stats = await fs.stat(filePath)

      await fs.unlink(filePath)

      this.stats.deletes++
      this.stats.files--
      this.stats.totalSize -= stats.size
      this.emit('delete', key)

      return true
    }
    catch (error) {
      this.emit('error', error)
      return false
    }
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    try {
      if (await FileSystem.exists(this.options.cacheDir)) {
        await FileSystem.removeDir(this.options.cacheDir)
      }

      await this.ensureCacheDir()

      this.stats.files = 0
      this.stats.totalSize = 0
      this.emit('clear')
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 批量获取
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key)
        if (value !== undefined) {
          results.set(key, value)
        }
      }),
    )

    return results
  }

  /**
   * 批量设置
   */
  async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) => this.set(key, value, ttl)),
    )
  }

  /**
   * 批量删除
   */
  async mdel(keys: string[]): Promise<number> {
    const results = await Promise.all(keys.map(key => this.delete(key)))
    return results.filter(Boolean).length
  }

  /**
   * 获取所有键
   */
  async keys(pattern?: string): Promise<string[]> {
    try {
      const allFiles = await this.getAllCacheFiles()
      let keys = allFiles.map(file => this.filePathToKey(file))

      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
        keys = keys.filter(key => regex.test(key))
      }

      return keys
    }
    catch (error) {
      this.emit('error', error)
      return []
    }
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const filePath = this.getFilePath(key)

      if (!(await FileSystem.exists(filePath))) {
        return false
      }

      const content = await fs.readFile(filePath, 'utf8')
      const entry: FileCacheEntry = JSON.parse(content)

      entry.expiresAt = Date.now() + ttl * 1000

      await fs.writeFile(filePath, JSON.stringify(entry), 'utf8')
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    try {
      const filePath = this.getFilePath(key)

      if (!(await FileSystem.exists(filePath))) {
        return -2
      }

      const content = await fs.readFile(filePath, 'utf8')
      const entry = JSON.parse(content) as FileCacheEntry

      if (!entry.expiresAt) {
        return -1
      }

      const remaining = entry.expiresAt - Date.now()
      return remaining > 0 ? Math.ceil(remaining / 1000) : 0
    }
    catch {
      return -2
    }
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<CacheStats> {
    // 更新实际文件统计
    await this.updateStats()

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.stats.files,
      size: this.stats.files,
      memory: this.stats.totalSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
    }
  }

  /**
   * 获取文件路径
   */
  private getFilePath(key: string): string {
    let fileName = this.options.hashKeys ? CryptoUtils.hash(key, 'sha256') : key

    // 清理文件名中的非法字符
    fileName = fileName.replace(/[<>:"/\\|?*]/g, '_')

    // 创建子目录结构
    if (this.options.subdirLevels > 0) {
      const hash = CryptoUtils.hash(fileName, 'md5')
      const subdirs: string[] = []

      for (let i = 0; i < this.options.subdirLevels; i++) {
        subdirs.push(hash.slice(i * 2, (i + 1) * 2))
      }

      return join(this.options.cacheDir, ...subdirs, `${fileName}.cache`)
    }

    return join(this.options.cacheDir, `${fileName}.cache`)
  }

  /**
   * 从文件路径恢复键名
   */
  private filePathToKey(filePath: string): string {
    const fileName = filePath.replace(/\.cache$/, '')

    if (this.options.hashKeys) {
      // 如果使用哈希，无法直接恢复原始键名
      // 这里返回哈希值作为键名
      return fileName
    }

    return fileName.replace(/_/g, '/')
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: FileCacheEntry): boolean {
    return entry.expiresAt ? Date.now() > entry.expiresAt : false
  }

  /**
   * 确保缓存目录存在
   */
  private async ensureCacheDir(): Promise<void> {
    await FileSystem.ensureDir(this.options.cacheDir)
  }

  /**
   * 检查空间并清理
   */
  private async checkSpaceAndCleanup(newEntrySize: number): Promise<void> {
    await this.updateStats()

    // 检查文件数量限制
    if (this.stats.files >= this.options.maxFiles) {
      await this.cleanupOldFiles(Math.floor(this.options.maxFiles * 0.1))
    }

    // 检查总大小限制
    if (this.stats.totalSize + newEntrySize > this.options.maxSize) {
      const targetSize = this.options.maxSize * 0.8
      await this.cleanupBySize(targetSize)
    }
  }

  /**
   * 清理旧文件
   */
  private async cleanupOldFiles(count: number): Promise<void> {
    try {
      const files = await this.getAllCacheFiles()

      // 按修改时间排序
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(file)
          return { file, mtime: stats.mtime }
        }),
      )

      fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime())

      // 删除最旧的文件
      for (let i = 0; i < Math.min(count, fileStats.length); i++) {
        const stat = fileStats[i]
        if (!stat)
          continue
        await fs.unlink(stat.file)
        this.stats.files--
      }
    }
    catch (error) {
      this.emit('error', error)
    }
  }

  /**
   * 按大小清理
   */
  private async cleanupBySize(targetSize: number): Promise<void> {
    try {
      const files = await this.getAllCacheFiles()

      // 按访问时间排序（LRU）
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const stats = await fs.stat(file)
          return { file, atime: stats.atime, size: stats.size }
        }),
      )

      fileStats.sort((a, b) => a.atime.getTime() - b.atime.getTime())

      let currentSize = this.stats.totalSize

      for (const { file, size } of fileStats) {
        if (currentSize <= targetSize)
          break

        await fs.unlink(file)
        currentSize -= size
        this.stats.files--
        this.stats.totalSize -= size
      }
    }
    catch (error) {
      this.emit('error', error)
    }
  }

  /**
   * 获取所有缓存文件
   */
  private async getAllCacheFiles(): Promise<string[]> {
    const files: string[] = []

    const scanDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            await scanDir(fullPath)
          }
          else if (entry.name.endsWith('.cache')) {
            files.push(fullPath)
          }
        }
      }
      catch {
        // 忽略错误
      }
    }

    await scanDir(this.options.cacheDir)
    return files
  }

  /**
   * 更新统计信息
   */
  private async updateStats(): Promise<void> {
    try {
      const files = await this.getAllCacheFiles()
      this.stats.files = files.length

      let totalSize = 0
      for (const file of files) {
        const stats = await fs.stat(file)
        totalSize += stats.size
      }
      this.stats.totalSize = totalSize
    }
    catch (error) {
      this.emit('error', error)
    }
  }

  /**
   * 销毁缓存
   */
  async destroy(): Promise<void> {
    await this.clear()
    this.removeAllListeners()
  }

  /**
   * 创建文件缓存实例
   */
  static create(options: FileCacheOptions): FileCache {
    return new FileCache(options)
  }
}
