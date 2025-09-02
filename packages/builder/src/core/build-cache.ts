/**
 * 智能构建缓存系统
 * 基于文件内容哈希和依赖关系的增量构建缓存
 */

import type {
  BuildOptions,
  ProjectScanResult,
  FileInfo,
} from '../types'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { Logger } from '../utils/logger'

const logger = new Logger('BuildCache')

export interface CacheEntry {
  /** 文件内容哈希 */
  contentHash: string
  /** 文件大小 */
  size: number
  /** 最后修改时间 */
  mtime: number
  /** 依赖文件哈希集合 */
  dependencyHashes: Record<string, string>
  /** 构建输出文件路径 */
  outputFiles: string[]
  /** 缓存创建时间 */
  cacheTime: number
}

export interface BuildCacheManifest {
  /** 缓存版本 */
  version: string
  /** 构建选项哈希 */
  optionsHash: string
  /** 文件缓存映射 */
  entries: Record<string, CacheEntry>
  /** 最后更新时间 */
  lastUpdated: number
}

export interface CacheValidationResult {
  /** 需要重新构建的文件 */
  changedFiles: string[]
  /** 可以从缓存恢复的文件 */
  cachedFiles: string[]
  /** 缓存命中率 */
  hitRate: number
  /** 详细信息 */
  details: {
    totalFiles: number
    cacheHits: number
    cacheMisses: number
    invalidated: number
  }
}

export class BuildCache {
  private cacheDir: string
  private manifestPath: string
  private manifest: BuildCacheManifest | null = null
  private readonly CACHE_VERSION = '1.0.0'

  constructor(rootDir: string) {
    this.cacheDir = resolve(rootDir, 'node_modules', '.ldesign-cache')
    this.manifestPath = resolve(this.cacheDir, 'manifest.json')
    this.ensureCacheDir()
  }

  /**
   * 初始化缓存
   */
  async initialize(buildOptions: BuildOptions): Promise<void> {
    logger.info('初始化构建缓存...')
    
    try {
      await this.loadManifest()
      
      // 检查构建选项是否变化
      const currentOptionsHash = this.hashBuildOptions(buildOptions)
      if (this.manifest && this.manifest.optionsHash !== currentOptionsHash) {
        logger.info('构建选项发生变化，清空缓存')
        await this.clearCache()
        this.manifest = null
      }

      // 创建新的缓存清单
      if (!this.manifest) {
        this.manifest = {
          version: this.CACHE_VERSION,
          optionsHash: currentOptionsHash,
          entries: {},
          lastUpdated: Date.now(),
        }
      }
    }
    catch (error) {
      logger.warn('初始化缓存失败:', error)
      this.manifest = {
        version: this.CACHE_VERSION,
        optionsHash: this.hashBuildOptions(buildOptions),
        entries: {},
        lastUpdated: Date.now(),
      }
    }
  }

  /**
   * 验证缓存并获取需要重新构建的文件
   */
  async validateCache(scanResult: ProjectScanResult): Promise<CacheValidationResult> {
    const startTime = Date.now()
    logger.info('验证构建缓存...')

    const changedFiles: string[] = []
    const cachedFiles: string[] = []
    let cacheHits = 0
    let cacheMisses = 0
    let invalidated = 0

    if (!this.manifest) {
      // 没有缓存，所有文件都需要构建
      const sourceFiles = scanResult.files.filter(f => this.isSourceFile(f))
      return {
        changedFiles: sourceFiles.map(f => f.path),
        cachedFiles: [],
        hitRate: 0,
        details: {
          totalFiles: sourceFiles.length,
          cacheHits: 0,
          cacheMisses: sourceFiles.length,
          invalidated: 0,
        },
      }
    }

    // 验证每个源文件
    const sourceFiles = scanResult.files.filter(f => this.isSourceFile(f))

    for (const file of sourceFiles) {
      const cacheEntry = this.manifest.entries[file.path]
      
      if (!cacheEntry) {
        // 新文件，需要构建
        changedFiles.push(file.path)
        cacheMisses++
        continue
      }

      // 检查文件本身是否变化
      const currentHash = await this.hashFile(file.path)
      const currentStat = statSync(file.path)
      
      if (
        cacheEntry.contentHash !== currentHash ||
        cacheEntry.size !== currentStat.size ||
        cacheEntry.mtime !== currentStat.mtimeMs
      ) {
        // 文件内容变化
        changedFiles.push(file.path)
        invalidated++
        continue
      }

      // 检查依赖文件是否变化
      const dependenciesChanged = await this.checkDependenciesChanged(file, cacheEntry)
      if (dependenciesChanged) {
        changedFiles.push(file.path)
        invalidated++
        continue
      }

      // 检查输出文件是否存在
      const outputFilesExist = cacheEntry.outputFiles.every(outputFile => 
        existsSync(outputFile)
      )
      
      if (!outputFilesExist) {
        // 输出文件丢失
        changedFiles.push(file.path)
        invalidated++
        continue
      }

      // 缓存有效
      cachedFiles.push(file.path)
      cacheHits++
    }

    const totalFiles = sourceFiles.length
    const hitRate = totalFiles > 0 ? (cacheHits / totalFiles) * 100 : 0
    const validationTime = Date.now() - startTime

    logger.info(`缓存验证完成，耗时 ${validationTime}ms`)
    logger.info(`缓存命中率: ${hitRate.toFixed(1)}% (${cacheHits}/${totalFiles})`)
    logger.info(`需要重新构建: ${changedFiles.length} 个文件`)

    return {
      changedFiles,
      cachedFiles,
      hitRate,
      details: {
        totalFiles,
        cacheHits,
        cacheMisses,
        invalidated,
      },
    }
  }

  /**
   * 更新文件缓存
   */
  async updateCache(
    filePath: string,
    outputFiles: string[],
    dependencies: string[] = []
  ): Promise<void> {
    if (!this.manifest) {
      return
    }

    try {
      const fileStats = statSync(filePath)
      const contentHash = await this.hashFile(filePath)
      
      // 生成依赖哈希映射
      const dependencyHashes: Record<string, string> = {}
      for (const depPath of dependencies) {
        if (existsSync(depPath)) {
          dependencyHashes[depPath] = await this.hashFile(depPath)
        }
      }

      const cacheEntry: CacheEntry = {
        contentHash,
        size: fileStats.size,
        mtime: fileStats.mtimeMs,
        dependencyHashes,
        outputFiles: outputFiles.slice(), // 复制数组
        cacheTime: Date.now(),
      }

      this.manifest.entries[filePath] = cacheEntry
      this.manifest.lastUpdated = Date.now()

      // 异步保存清单
      setImmediate(() => this.saveManifest())
    }
    catch (error) {
      logger.warn(`更新缓存失败 (${relative(process.cwd(), filePath)}):`, error)
    }
  }

  /**
   * 清空缓存
   */
  async clearCache(): Promise<void> {
    logger.info('清空构建缓存...')
    
    try {
      this.manifest = null
      
      // 删除缓存文件
      if (existsSync(this.manifestPath)) {
        const fs = await import('fs-extra')
        await fs.remove(this.cacheDir)
      }
      
      this.ensureCacheDir()
      logger.info('缓存已清空')
    }
    catch (error) {
      logger.error('清空缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    totalEntries: number
    cacheSize: string
    oldestEntry: number | null
    newestEntry: number | null
  } {
    if (!this.manifest) {
      return {
        totalEntries: 0,
        cacheSize: '0 B',
        oldestEntry: null,
        newestEntry: null,
      }
    }

    const entries = Object.values(this.manifest.entries)
    const totalEntries = entries.length
    
    let totalSize = 0
    let oldestEntry: number | null = null
    let newestEntry: number | null = null

    entries.forEach(entry => {
      totalSize += entry.size
      
      if (oldestEntry === null || entry.cacheTime < oldestEntry) {
        oldestEntry = entry.cacheTime
      }
      
      if (newestEntry === null || entry.cacheTime > newestEntry) {
        newestEntry = entry.cacheTime
      }
    })

    return {
      totalEntries,
      cacheSize: this.formatBytes(totalSize),
      oldestEntry,
      newestEntry,
    }
  }

  /**
   * 清理过期缓存条目
   */
  async cleanupExpiredCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    if (!this.manifest) {
      return 0
    }

    const now = Date.now()
    const cutoffTime = now - maxAge
    let removedCount = 0

    Object.keys(this.manifest.entries).forEach(filePath => {
      const entry = this.manifest!.entries[filePath]
      if (entry.cacheTime < cutoffTime || !existsSync(filePath)) {
        delete this.manifest!.entries[filePath]
        removedCount++
      }
    })

    if (removedCount > 0) {
      this.manifest.lastUpdated = now
      await this.saveManifest()
      logger.info(`清理了 ${removedCount} 个过期缓存条目`)
    }

    return removedCount
  }

  // 私有方法

  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true })
    }
  }

  private async loadManifest(): Promise<void> {
    if (!existsSync(this.manifestPath)) {
      return
    }

    try {
      const content = readFileSync(this.manifestPath, 'utf-8')
      const manifest = JSON.parse(content) as BuildCacheManifest
      
      // 检查缓存版本
      if (manifest.version !== this.CACHE_VERSION) {
        logger.info('缓存版本不匹配，清空缓存')
        return
      }

      this.manifest = manifest
      logger.debug(`加载了 ${Object.keys(manifest.entries).length} 个缓存条目`)
    }
    catch (error) {
      logger.warn('加载缓存清单失败:', error)
    }
  }

  private async saveManifest(): Promise<void> {
    if (!this.manifest) {
      return
    }

    try {
      const content = JSON.stringify(this.manifest, null, 2)
      writeFileSync(this.manifestPath, content, 'utf-8')
    }
    catch (error) {
      logger.error('保存缓存清单失败:', error)
    }
  }

  private async hashFile(filePath: string): Promise<string> {
    try {
      const content = readFileSync(filePath)
      return createHash('sha256').update(content).digest('hex')
    }
    catch (error) {
      logger.warn(`计算文件哈希失败 (${relative(process.cwd(), filePath)}):`, error)
      return ''
    }
  }

  private hashBuildOptions(options: BuildOptions): string {
    // 只关注影响构建结果的关键选项
    const relevantOptions = {
      formats: options.formats,
      mode: options.mode,
      minify: options.minify,
      sourcemap: options.sourcemap,
      external: Array.isArray(options.external) ? options.external : undefined,
      globals: options.globals,
      dts: options.dts,
    }

    const content = JSON.stringify(relevantOptions, Object.keys(relevantOptions).sort())
    return createHash('sha256').update(content).digest('hex')
  }

  private async checkDependenciesChanged(
    file: FileInfo,
    cacheEntry: CacheEntry
  ): Promise<boolean> {
    // 检查依赖文件是否变化
    for (const [depPath, cachedHash] of Object.entries(cacheEntry.dependencyHashes)) {
      if (!existsSync(depPath)) {
        // 依赖文件被删除
        return true
      }

      const currentHash = await this.hashFile(depPath)
      if (currentHash !== cachedHash) {
        // 依赖文件内容变化
        return true
      }
    }

    // 检查是否有新的依赖
    const currentDependencies = file.dependencies || []
    const cachedDependencies = Object.keys(cacheEntry.dependencyHashes)
    
    for (const dep of currentDependencies) {
      // 跳过外部依赖
      if (this.isExternalDependency(dep)) {
        continue
      }

      // 简单检查：如果依赖不在缓存中，认为是新依赖
      if (!cachedDependencies.some(cached => cached.includes(dep))) {
        return true
      }
    }

    return false
  }

  private isSourceFile(file: FileInfo): boolean {
    return [
      'typescript',
      'tsx',
      'javascript',
      'jsx',
      'vue',
    ].includes(file.type)
  }

  private isExternalDependency(dep: string): boolean {
    return !dep.startsWith('.') && !dep.startsWith('/') && !dep.startsWith('@/') && !dep.startsWith('~/')
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  }
}
