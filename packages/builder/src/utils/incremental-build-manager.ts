/**
 * 增量构建管理器
 * 
 * 提供智能的增量构建功能，只重新构建变更的文件
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs-extra'
import { Logger } from './logger'

/**
 * 文件变更信息
 */
export interface FileChangeInfo {
  path: string
  hash: string
  timestamp: number
  size: number
}

/**
 * 增量构建状态
 */
export interface IncrementalBuildState {
  files: Map<string, FileChangeInfo>
  lastBuildTime: number
  buildCount: number
}

/**
 * 增量构建选项
 */
export interface IncrementalBuildOptions {
  /** 状态文件路径 */
  stateFile?: string
  /** 是否启用 */
  enabled?: boolean
  /** 忽略的文件模式 */
  ignorePatterns?: string[]
  /** 自定义哈希算法 */
  hashAlgorithm?: 'md5' | 'sha1' | 'sha256'
}

/**
 * 增量构建管理器
 */
export class IncrementalBuildManager {
  private state: IncrementalBuildState
  private stateFile: string
  private enabled: boolean
  private ignorePatterns: RegExp[]
  private hashAlgorithm: string
  private logger: Logger

  constructor(options: IncrementalBuildOptions = {}) {
    this.stateFile = options.stateFile || path.join(
      process.cwd(),
      'node_modules',
      '.cache',
      '@ldesign',
      'builder',
      'incremental-state.json'
    )
    this.enabled = options.enabled !== false
    this.ignorePatterns = (options.ignorePatterns || []).map(p => new RegExp(p))
    this.hashAlgorithm = options.hashAlgorithm || 'md5'
    this.logger = new Logger({ prefix: 'IncrementalBuild' })
    
    this.state = {
      files: new Map(),
      lastBuildTime: 0,
      buildCount: 0
    }
  }

  /**
   * 加载构建状态
   */
  async loadState(): Promise<void> {
    if (!this.enabled) return

    try {
      const content = await fs.readFile(this.stateFile, 'utf-8')
      const data = JSON.parse(content)
      
      this.state = {
        files: new Map(Object.entries(data.files || {})),
        lastBuildTime: data.lastBuildTime || 0,
        buildCount: data.buildCount || 0
      }
      
      this.logger.debug(`已加载增量构建状态: ${this.state.files.size} 个文件`)
    } catch (error) {
      // 状态文件不存在或损坏，使用默认状态
      this.logger.debug('未找到增量构建状态，将进行完整构建')
    }
  }

  /**
   * 保存构建状态
   */
  async saveState(): Promise<void> {
    if (!this.enabled) return

    try {
      await fs.mkdir(path.dirname(this.stateFile), { recursive: true })
      
      const data = {
        files: Object.fromEntries(this.state.files),
        lastBuildTime: Date.now(),
        buildCount: this.state.buildCount + 1
      }
      
      await fs.writeFile(this.stateFile, JSON.stringify(data, null, 2))
      this.logger.debug('已保存增量构建状态')
    } catch (error) {
      this.logger.warn('保存增量构建状态失败:', error)
    }
  }

  /**
   * 计算文件哈希
   */
  private async calculateFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath)
    return createHash(this.hashAlgorithm).update(content).digest('hex')
  }

  /**
   * 检查文件是否应该被忽略
   */
  private shouldIgnore(filePath: string): boolean {
    return this.ignorePatterns.some(pattern => pattern.test(filePath))
  }

  /**
   * 检查文件是否变更
   */
  async hasFileChanged(filePath: string): Promise<boolean> {
    if (!this.enabled || this.shouldIgnore(filePath)) {
      return true // 禁用时或忽略的文件总是认为已变更
    }

    try {
      const stats = await fs.stat(filePath)
      const currentHash = await this.calculateFileHash(filePath)
      const previousInfo = this.state.files.get(filePath)

      if (!previousInfo) {
        // 新文件
        return true
      }

      // 检查哈希和大小
      return previousInfo.hash !== currentHash || previousInfo.size !== stats.size
    } catch (error) {
      // 文件不存在或无法访问
      return true
    }
  }

  /**
   * 批量检查文件变更
   */
  async getChangedFiles(filePaths: string[]): Promise<{
    changed: string[]
    unchanged: string[]
    added: string[]
    removed: string[]
  }> {
    const changed: string[] = []
    const unchanged: string[] = []
    const added: string[] = []
    
    for (const filePath of filePaths) {
      const isChanged = await this.hasFileChanged(filePath)
      const isNew = !this.state.files.has(filePath)
      
      if (isNew) {
        added.push(filePath)
      } else if (isChanged) {
        changed.push(filePath)
      } else {
        unchanged.push(filePath)
      }
    }

    // 检查已删除的文件
    const currentFiles = new Set(filePaths)
    const removed = Array.from(this.state.files.keys()).filter(
      f => !currentFiles.has(f)
    )

    return { changed, unchanged, added, removed }
  }

  /**
   * 更新文件信息
   */
  async updateFile(filePath: string): Promise<void> {
    if (!this.enabled || this.shouldIgnore(filePath)) {
      return
    }

    try {
      const stats = await fs.stat(filePath)
      const hash = await this.calculateFileHash(filePath)
      
      this.state.files.set(filePath, {
        path: filePath,
        hash,
        timestamp: stats.mtimeMs,
        size: stats.size
      })
    } catch (error) {
      this.logger.warn(`更新文件信息失败: ${filePath}`, error)
    }
  }

  /**
   * 批量更新文件信息
   */
  async updateFiles(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map(f => this.updateFile(f)))
  }

  /**
   * 移除文件信息
   */
  removeFile(filePath: string): void {
    this.state.files.delete(filePath)
  }

  /**
   * 清除所有状态
   */
  async clear(): Promise<void> {
    this.state = {
      files: new Map(),
      lastBuildTime: 0,
      buildCount: 0
    }
    
    try {
      await fs.unlink(this.stateFile)
      this.logger.info('已清除增量构建状态')
    } catch {
      // 文件可能不存在
    }
  }

  /**
   * 获取构建统计信息
   */
  getStats(): {
    totalFiles: number
    lastBuildTime: number
    buildCount: number
    cacheHitRate?: number
  } {
    return {
      totalFiles: this.state.files.size,
      lastBuildTime: this.state.lastBuildTime,
      buildCount: this.state.buildCount
    }
  }

  /**
   * 是否需要完整构建
   */
  needsFullBuild(): boolean {
    return !this.enabled || this.state.files.size === 0
  }
}

/**
 * 创建增量构建管理器实例
 */
export function createIncrementalBuildManager(
  options?: IncrementalBuildOptions
): IncrementalBuildManager {
  return new IncrementalBuildManager(options)
}

