/**
 * 临时文件管理器
 * 提供临时文件和目录的创建、管理和自动清理功能
 */

import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileSystemError } from '../types'
import { RandomUtils } from '../utils'
import { FileSystem } from './file-system'

/**
 * 临时文件管理器类
 */
export class TempManager {
  private static readonly instances: Map<string, TempManager> = new Map()
  private static readonly globalCleanupHandlers: Set<() => Promise<void>> = new Set()

  private tempPaths: Set<string> = new Set()
  private cleanupHandlers: Set<() => Promise<void>> = new Set()
  private autoCleanup: boolean
  private prefix: string
  private baseTempDir: string

  constructor(options: TempManagerOptions = {}) {
    this.autoCleanup = options.autoCleanup ?? true
    this.prefix = options.prefix ?? 'tmp'
    this.baseTempDir = options.baseTempDir ?? tmpdir()

    if (this.autoCleanup) {
      this.setupCleanupHandlers()
    }
  }

  /**
   * 创建临时文件
   * @param options 选项
   * @returns 临时文件路径
   */
  async createTempFile(options: TempFileOptions = {}): Promise<string> {
    try {
      const { suffix = '', content = '', encoding = 'utf8', mode = 0o644 } = options

      const fileName = this.generateTempName('file', suffix)
      const tempPath = join(this.baseTempDir, fileName)

      await FileSystem.writeFile(tempPath, content, encoding)
      await FileSystem.chmod(tempPath, mode)

      this.tempPaths.add(tempPath)
      return tempPath
    }
    catch (error) {
      throw new FileSystemError('Failed to create temp file', '', error as Error)
    }
  }

  /**
   * 创建临时目录
   * @param options 选项
   * @returns 临时目录路径
   */
  async createTempDir(options: TempDirOptions = {}): Promise<string> {
    try {
      const { suffix = '', mode = 0o755 } = options

      const dirName = this.generateTempName('dir', suffix)
      const tempPath = join(this.baseTempDir, dirName)

      await FileSystem.createDir(tempPath)
      await FileSystem.chmod(tempPath, mode)

      this.tempPaths.add(tempPath)
      return tempPath
    }
    catch (error) {
      throw new FileSystemError('Failed to create temp directory', '', error as Error)
    }
  }

  /**
   * 创建临时符号链接
   * @param target 目标路径
   * @param options 选项
   * @returns 临时符号链接路径
   */
  async createTempSymlink(target: string, options: TempSymlinkOptions = {}): Promise<string> {
    try {
      const { suffix = '', type = 'file' } = options

      const linkName = this.generateTempName('link', suffix)
      const tempPath = join(this.baseTempDir, linkName)

      await FileSystem.createSymlink(target, tempPath, type)

      this.tempPaths.add(tempPath)
      return tempPath
    }
    catch (error) {
      throw new FileSystemError('Failed to create temp symlink', '', error as Error)
    }
  }

  /**
   * 创建临时工作空间
   * @param structure 目录结构
   * @param options 选项
   * @returns 工作空间根目录路径
   */
  async createWorkspace(
    structure: WorkspaceStructure,
    options: TempDirOptions = {},
  ): Promise<string> {
    try {
      const workspaceDir = await this.createTempDir(options)
      await this.createWorkspaceStructure(workspaceDir, structure)
      return workspaceDir
    }
    catch (error) {
      throw new FileSystemError('Failed to create temp workspace', '', error as Error)
    }
  }

  /**
   * 创建工作空间结构
   */
  private async createWorkspaceStructure(
    basePath: string,
    structure: WorkspaceStructure,
  ): Promise<void> {
    for (const [name, content] of Object.entries(structure)) {
      const fullPath = join(basePath, name)

      if (typeof content === 'string') {
        // 文件内容
        await FileSystem.writeFile(fullPath, content)
      }
      else if (content === null) {
        // 空文件
        await FileSystem.writeFile(fullPath, '')
      }
      else if (typeof content === 'object') {
        // 子目录
        await FileSystem.createDir(fullPath)
        await this.createWorkspaceStructure(fullPath, content)
      }
    }
  }

  /**
   * 生成临时名称
   */
  private generateTempName(type: string, suffix: string): string {
    const timestamp = Date.now()
    const random = RandomUtils.alphanumeric(8)
    const parts = [this.prefix, type, timestamp, random]

    if (suffix) {
      parts.push(suffix)
    }

    return parts.join('-')
  }

  /**
   * 添加清理处理器
   * @param handler 清理处理器
   */
  addCleanupHandler(handler: () => Promise<void>): void {
    this.cleanupHandlers.add(handler)
  }

  /**
   * 移除清理处理器
   * @param handler 清理处理器
   */
  removeCleanupHandler(handler: () => Promise<void>): void {
    this.cleanupHandlers.delete(handler)
  }

  /**
   * 手动清理指定路径
   * @param path 路径
   */
  async cleanup(path: string): Promise<void> {
    try {
      if (this.tempPaths.has(path)) {
        if (await FileSystem.exists(path)) {
          const isDirectory = await FileSystem.isDirectory(path)
          if (isDirectory) {
            await FileSystem.removeDir(path, true)
          }
          else {
            await FileSystem.removeFile(path)
          }
        }
        this.tempPaths.delete(path)
      }
    }
    catch (error) {
      // 忽略清理错误，但可以记录日志
      console.warn(`Failed to cleanup temp path: ${path}`, error)
    }
  }

  /**
   * 清理所有临时文件
   */
  async cleanupAll(): Promise<void> {
    // 执行自定义清理处理器
    for (const handler of this.cleanupHandlers) {
      try {
        await handler()
      }
      catch (error) {
        console.warn('Cleanup handler failed:', error)
      }
    }

    // 清理所有临时路径
    const paths = Array.from(this.tempPaths)
    await Promise.all(paths.map(path => this.cleanup(path)))
  }

  /**
   * 获取所有临时路径
   */
  getTempPaths(): string[] {
    return Array.from(this.tempPaths)
  }

  /**
   * 检查路径是否由此管理器管理
   * @param path 路径
   */
  isManaged(path: string): boolean {
    return this.tempPaths.has(path)
  }

  /**
   * 设置自动清理
   */
  private setupCleanupHandlers(): void {
    const cleanup = () => {
      this.cleanupAll().catch((error) => {
        console.warn('Auto cleanup failed:', error)
      })
    }

    // 进程退出时清理
    process.on('exit', cleanup)
    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('uncaughtException', cleanup)
    process.on('unhandledRejection', cleanup)

    // 添加到全局清理处理器
    TempManager.globalCleanupHandlers.add(this.cleanupAll.bind(this))
  }

  /**
   * 获取默认实例
   */
  static getDefault(): TempManager {
    const key = 'default'
    if (!TempManager.instances.has(key)) {
      TempManager.instances.set(key, new TempManager())
    }
    return TempManager.instances.get(key)!
  }

  /**
   * 获取命名实例
   * @param name 实例名称
   * @param options 选项
   */
  static getInstance(name: string, options?: TempManagerOptions): TempManager {
    if (!TempManager.instances.has(name)) {
      TempManager.instances.set(name, new TempManager(options))
    }
    return TempManager.instances.get(name)!
  }

  /**
   * 创建临时文件（静态方法）
   * @param options 选项
   */
  static async createTempFile(options?: TempFileOptions): Promise<string> {
    return TempManager.getDefault().createTempFile(options)
  }

  /**
   * 创建临时目录（静态方法）
   * @param suffix 后缀
   * @param options 选项
   */
  static async createTempDir(suffix?: string, options?: TempDirOptions): Promise<string> {
    return TempManager.getDefault().createTempDir({ suffix, ...options })
  }

  /**
   * 创建临时工作空间（静态方法）
   * @param structure 目录结构
   * @param options 选项
   */
  static async createWorkspace(
    structure: WorkspaceStructure,
    options?: TempDirOptions,
  ): Promise<string> {
    return TempManager.getDefault().createWorkspace(structure, options)
  }

  /**
   * 在临时目录中执行函数
   * @param fn 要执行的函数
   * @param options 选项
   */
  static async withTempDir<T>(
    fn: (tempDir: string) => Promise<T>,
    options?: TempDirOptions,
  ): Promise<T> {
    const manager = TempManager.getDefault()
    const tempDir = await manager.createTempDir(options)

    try {
      return await fn(tempDir)
    }
    finally {
      await manager.cleanup(tempDir)
    }
  }

  /**
   * 在临时文件中执行函数
   * @param fn 要执行的函数
   * @param options 选项
   */
  static async withTempFile<T>(
    fn: (tempFile: string) => Promise<T>,
    options?: TempFileOptions,
  ): Promise<T> {
    const manager = TempManager.getDefault()
    const tempFile = await manager.createTempFile(options)

    try {
      return await fn(tempFile)
    }
    finally {
      await manager.cleanup(tempFile)
    }
  }

  /**
   * 清理所有实例
   */
  static async cleanupAllInstances(): Promise<void> {
    for (const handler of TempManager.globalCleanupHandlers) {
      try {
        await handler()
      }
      catch (error) {
        console.warn('Global cleanup handler failed:', error)
      }
    }
  }

  /**
   * 清理旧的临时文件
   * @param maxAge 最大年龄（毫秒）
   * @param baseTempDir 基础临时目录
   */
  static async cleanupOldTempFiles(
    maxAge: number = 24 * 60 * 60 * 1000, // 24小时
    baseTempDir: string = tmpdir(),
  ): Promise<number> {
    try {
      let cleanedCount = 0
      const entries = await fs.readdir(baseTempDir, { withFileTypes: true })
      const now = Date.now()

      for (const entry of entries) {
        if (entry.name.startsWith('tmp-')) {
          const fullPath = join(baseTempDir, entry.name)
          try {
            const stat = await fs.stat(fullPath)
            const age = now - stat.mtime.getTime()

            if (age > maxAge) {
              if (entry.isDirectory()) {
                await FileSystem.removeDir(fullPath, true)
              }
              else {
                await FileSystem.removeFile(fullPath)
              }
              cleanedCount++
            }
          }
          catch {
            // 忽略无法访问的文件
          }
        }
      }

      return cleanedCount
    }
    catch (error) {
      throw new FileSystemError('Failed to cleanup old temp files', baseTempDir, error as Error)
    }
  }
}

// 类型定义
interface TempManagerOptions {
  autoCleanup?: boolean
  prefix?: string
  baseTempDir?: string
}

interface TempFileOptions {
  suffix?: string
  content?: string | Buffer
  encoding?: BufferEncoding
  mode?: number
}

interface TempDirOptions {
  suffix?: string
  mode?: number
}

interface TempSymlinkOptions {
  suffix?: string
  type?: 'file' | 'dir' | 'junction'
}

interface WorkspaceStructure {
  [key: string]: string | null | WorkspaceStructure
}
