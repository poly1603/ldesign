/**
 * 构建缓存管理工具
 * 
 * 提供构建缓存的创建、验证和清理功能
 * 
 * @author LDesign Team
 * @since 1.0.1
 */

import { PathUtils } from './path-utils'
import { FileSystem } from './file-system'
import { Logger } from './logger'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 缓存条目接口
 */
export interface CacheEntry {
  /** 文件路径 */
  path: string
  /** 文件哈希值 */
  hash: string
  /** 最后修改时间 */
  mtime: number
  /** 文件大小 */
  size: number
}

/**
 * 缓存清单接口
 */
export interface CacheManifest {
  /** 版本号 */
  version: string
  /** 创建时间 */
  timestamp: number
  /** 环境 */
  environment: string
  /** 配置哈希 */
  configHash: string
  /** 文件缓存 */
  files: Record<string, CacheEntry>
  /** 依赖哈希 */
  dependencies: Record<string, string>
}

/**
 * 构建缓存管理器
 */
export class BuildCacheManager {
  private logger: Logger
  private cacheDir: string
  private manifestPath: string
  private manifest: CacheManifest | null = null

  constructor(cwd: string) {
    this.logger = new Logger('build-cache')
    this.cacheDir = PathUtils.join(cwd, 'node_modules', '.cache', 'ldesign-launcher')
    this.manifestPath = PathUtils.join(this.cacheDir, 'build-manifest.json')
  }

  /**
   * 初始化缓存目录
   */
  async initialize(): Promise<void> {
    try {
      if (!await FileSystem.exists(this.cacheDir)) {
        const fs = require('fs').promises
        await fs.mkdir(this.cacheDir, { recursive: true })
      }

      // 加载现有清单
      if (await FileSystem.exists(this.manifestPath)) {
        const content = await FileSystem.readFile(this.manifestPath)
        this.manifest = JSON.parse(content)
      }
    } catch (error) {
      this.logger.debug(`缓存初始化失败: ${(error as Error).message}`)
    }
  }

  /**
   * 计算文件哈希
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5')
      const stream = fs.createReadStream(filePath)

      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * 计算配置哈希
   */
  async calculateConfigHash(config: any): Promise<string> {
    const configStr = JSON.stringify(config, Object.keys(config).sort())
    return crypto.createHash('md5').update(configStr).digest('hex')
  }

  /**
   * 检查文件是否有变化
   */
  async hasFileChanged(filePath: string): Promise<boolean> {
    if (!this.manifest || !this.manifest.files[filePath]) {
      return true
    }

    try {
      const stats = await FileSystem.stat(filePath)
      const cached = this.manifest.files[filePath]

      // 先检查修改时间和大小
      if (stats.mtime.getTime() !== cached.mtime || stats.size !== cached.size) {
        // 如果不同，再计算哈希确认
        const currentHash = await this.calculateFileHash(filePath)
        return currentHash !== cached.hash
      }

      return false
    } catch {
      return true
    }
  }

  /**
   * 检查是否需要重新构建
   */
  async shouldRebuild(
    environment: string,
    configHash: string,
    sourceFiles: string[]
  ): Promise<boolean> {
    if (!this.manifest) {
      this.logger.debug('没有找到缓存清单，需要构建')
      return true
    }

    // 检查环境是否变化
    if (this.manifest.environment !== environment) {
      this.logger.debug(`环境变化: ${this.manifest.environment} -> ${environment}`)
      return true
    }

    // 检查配置是否变化
    if (this.manifest.configHash !== configHash) {
      this.logger.debug('配置已变化')
      return true
    }

    // 检查源文件是否变化
    for (const file of sourceFiles) {
      if (await this.hasFileChanged(file)) {
        this.logger.debug(`文件已变化: ${file}`)
        return true
      }
    }

    this.logger.info('使用缓存的构建结果')
    return false
  }

  /**
   * 更新缓存清单
   */
  async updateManifest(
    environment: string,
    configHash: string,
    sourceFiles: string[],
    dependencies: Record<string, string>
  ): Promise<void> {
    const files: Record<string, CacheEntry> = {}

    // 收集所有文件信息
    for (const file of sourceFiles) {
      try {
        const stats = await FileSystem.stat(file)
        const hash = await this.calculateFileHash(file)

        files[file] = {
          path: file,
          hash,
          mtime: stats.mtime.getTime(),
          size: stats.size
        }
      } catch (error) {
        this.logger.debug(`无法处理文件 ${file}: ${(error as Error).message}`)
      }
    }

    // 创建新清单
    this.manifest = {
      version: '1.0.0',
      timestamp: Date.now(),
      environment,
      configHash,
      files,
      dependencies
    }

    // 保存清单
    try {
      await FileSystem.writeFile(
        this.manifestPath,
        JSON.stringify(this.manifest, null, 2)
      )
      this.logger.debug('缓存清单已更新')
    } catch (error) {
      this.logger.error(`保存缓存清单失败: ${(error as Error).message}`)
    }
  }

  /**
   * 清除缓存
   */
  async clear(): Promise<void> {
    try {
      if (await FileSystem.exists(this.cacheDir)) {
        await FileSystem.remove(this.cacheDir)
        this.manifest = null
        this.logger.info('缓存已清除')
      }
    } catch (error) {
      this.logger.error(`清除缓存失败: ${(error as Error).message}`)
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    exists: boolean
    size: number
    fileCount: number
    lastBuild: number | null
  }> {
    if (!this.manifest) {
      return {
        exists: false,
        size: 0,
        fileCount: 0,
        lastBuild: null
      }
    }

    let totalSize = 0
    try {
      const files = await FileSystem.readDir(this.cacheDir)
      for (const file of files) {
        const filePath = PathUtils.join(this.cacheDir, file)
        const stats = await FileSystem.stat(filePath)
        if (stats.isFile()) {
          totalSize += stats.size
        }
      }
    } catch {
      // 忽略错误
    }

    return {
      exists: true,
      size: totalSize,
      fileCount: Object.keys(this.manifest.files).length,
      lastBuild: this.manifest.timestamp
    }
  }

  /**
   * 获取缓存信息
   */
  getManifest(): CacheManifest | null {
    return this.manifest
  }
}

