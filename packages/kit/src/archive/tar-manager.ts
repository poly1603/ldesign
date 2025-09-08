/**
 * TAR 压缩包管理器
 */

import type {
  ArchiveEntry,
  ArchiveProgress,
  ArchiveStats,
  CompressionOptions,
  ExtractionOptions,
  TarOptions,
} from '../types'
import { EventEmitter } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import * as tar from 'tar'
import { FileSystem } from '../filesystem'

/**
 * TAR 管理器
 */
export class TarManager extends EventEmitter {
  private options: Required<TarOptions>

  constructor(options: TarOptions = {}) {
    super()

    this.options = {
      gzip: options.gzip ?? false,
      compressionLevel: options.compressionLevel ?? 6,
      preservePermissions: options.preservePermissions ?? true,
      preserveTimestamps: options.preserveTimestamps ?? true,
      followSymlinks: options.followSymlinks ?? false,
      ignoreHidden: options.ignoreHidden ?? false,
      maxFileSize: options.maxFileSize ?? 100 * 1024 * 1024, // 100MB
      password: options.password ?? '',
      ...options,
    }
  }

  /**
   * 创建 TAR 压缩包
   */
  async create(
    sources: string | string[],
    outputPath: string,
    options: CompressionOptions = {},
  ): Promise<ArchiveStats> {
    const sourceList = Array.isArray(sources) ? sources : [sources]
    const mergedOptions = { ...this.options, ...options }

    const stats: ArchiveStats = {
      totalFiles: 0,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
    }

    // 准备文件列表
    const files: string[] = []
    for (const source of sourceList) {
      if (await FileSystem.exists(source)) {
        const sourceStat = await FileSystem.stat(source)
        if (sourceStat.isDirectory()) {
          const dirFiles = await this.getDirectoryFiles(source, mergedOptions)
          files.push(...dirFiles)
        }
        else {
          files.push(source)
        }
      }
    }

    stats.totalFiles = files.length

    // 创建 TAR 流
    const tarStream = tar.create(
      {
        gzip: mergedOptions.gzip,
        preservePaths: false,
        follow: mergedOptions.followSymlinks,
        filter: (path) => {
          if (mergedOptions.ignoreHidden && path.split('/').some(part => part.startsWith('.'))) {
            return false
          }
          return true
        },
      },
      files,
    )

    // 监听事件
    tarStream.on('entry', (entry: any) => {
      const archiveEntry: ArchiveEntry = {
        name: entry.path,
        size: entry.size || 0,
        type: entry.type === 'Directory' ? 'directory' : 'file',
        lastModified: entry.mtime,
      }

      stats.totalSize += archiveEntry.size
      this.emit('entry', archiveEntry)

      const progress: ArchiveProgress = {
        processedFiles: stats.totalFiles,
        totalFiles: files.length,
        processedBytes: stats.totalSize,
        totalBytes: stats.totalSize,
        percentage: (stats.totalFiles / files.length) * 100,
      }

      this.emit('progress', progress)
    })

    // 写入文件
    const output = createWriteStream(outputPath)
    await pipeline(tarStream, output)

    // 计算最终统计
    const outputStats = await FileSystem.stat(outputPath)
    stats.compressedSize = outputStats.size
    stats.endTime = new Date()
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime()
    stats.compressionRatio
      = stats.totalSize > 0 ? (1 - stats.compressedSize / stats.totalSize) * 100 : 0

    this.emit('complete', stats)
    return stats
  }

  /**
   * 解压 TAR 文件
   */
  async extract(
    archivePath: string,
    outputDir: string,
    options: ExtractionOptions = {},
  ): Promise<ArchiveStats> {
    const mergedOptions = { ...this.options, ...options }

    const stats: ArchiveStats = {
      totalFiles: 0,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
    }

    // 确保输出目录存在
    await FileSystem.ensureDir(outputDir)

    // 获取压缩包大小
    const archiveStats = await FileSystem.stat(archivePath)
    stats.compressedSize = archiveStats.size

    // 创建解压流
    const extractStream = tar.extract({
      cwd: outputDir,
      preservePaths: false,
      filter: (path) => {
        if (mergedOptions.ignoreHidden && path.split('/').some(part => part.startsWith('.'))) {
          return false
        }
        return true
      },
    })

    // 监听事件
    extractStream.on('entry', (entry) => {
      stats.totalFiles++
      stats.totalSize += entry.size || 0

      const archiveEntry: ArchiveEntry = {
        name: entry.path,
        size: entry.size || 0,
        type: entry.type === 'Directory' ? 'directory' : 'file',
        lastModified: entry.mtime,
      }

      this.emit('entry', archiveEntry)

      const progress: ArchiveProgress = {
        processedFiles: stats.totalFiles,
        totalFiles: stats.totalFiles, // 无法预知总数
        processedBytes: stats.totalSize,
        totalBytes: stats.totalSize,
        percentage: 0, // 无法计算准确百分比
      }

      this.emit('progress', progress)
    })

    // 读取并解压
    const input = createReadStream(archivePath)
    await pipeline(input, extractStream)

    // 计算最终统计
    stats.endTime = new Date()
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime()
    stats.compressionRatio
      = stats.totalSize > 0 ? (1 - stats.compressedSize / stats.totalSize) * 100 : 0

    this.emit('complete', stats)
    return stats
  }

  /**
   * 列出 TAR 文件内容
   */
  async list(archivePath: string): Promise<ArchiveEntry[]> {
    const entries: ArchiveEntry[] = []

    const listStream = tar.list({
      file: archivePath,
      onentry: (entry) => {
        entries.push({
          name: entry.path,
          size: entry.size || 0,
          type: entry.type === 'Directory' ? 'directory' : 'file',
          lastModified: entry.mtime ? new Date(entry.mtime) : undefined,
        })
      },
    })

    await listStream
    return entries
  }

  /**
   * 添加文件到现有 TAR
   */
  async addFiles(
    archivePath: string,
    files: string | string[],
    options: CompressionOptions = {},
  ): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]

    // 创建临时文件
    const tempPath = `${archivePath}.tmp`

    // 读取现有 TAR 内容
    const existingEntries = await this.list(archivePath)
    const existingFiles = existingEntries.map(entry => entry.name)

    // 合并文件列表
    const allFiles = [...existingFiles, ...fileList]

    // 创建新的 TAR
    await this.create(allFiles, tempPath, options)

    // 替换原文件
    await FileSystem.move(tempPath, archivePath)
  }

  /**
   * 从 TAR 中移除文件
   */
  async removeFiles(archivePath: string, filesToRemove: string | string[]): Promise<void> {
    const removeList = Array.isArray(filesToRemove) ? filesToRemove : [filesToRemove]
    const tempPath = `${archivePath}.tmp`

    // 读取现有 TAR 内容
    const existingEntries = await this.list(archivePath)
    const keepFiles = existingEntries
      .filter(entry => !removeList.includes(entry.name))
      .map(entry => entry.name)

    // 创建新的 TAR（只包含保留的文件）
    await this.create(keepFiles, tempPath)

    // 替换原文件
    await FileSystem.move(tempPath, archivePath)
  }

  /**
   * 获取目录中的所有文件
   */
  private async getDirectoryFiles(
    dirPath: string,
    options: Required<TarOptions>,
  ): Promise<string[]> {
    const files: string[] = []

    const entries = await FileSystem.readDir(dirPath)

    for (const entry of entries) {
      if (
        options.ignoreHidden
        && (typeof entry === 'string' ? entry.startsWith('.') : entry.name.startsWith('.'))
      ) {
        continue
      }

      if (typeof entry === 'object' && entry.isFile) {
        files.push(entry.path)
      }
    }

    return files
  }

  /**
   * 验证 TAR 文件
   */
  async validate(archivePath: string): Promise<boolean> {
    try {
      await this.list(archivePath)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取 TAR 文件信息
   */
  async getInfo(archivePath: string): Promise<{
    type: string
    entries: ArchiveEntry[]
    totalSize: number
    compressedSize: number
    isGzipped: boolean
  }> {
    const entries = await this.list(archivePath)
    const stats = await FileSystem.stat(archivePath)

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)

    // 检测是否为 gzipped
    const buffer = Buffer.alloc(2)
    const file = await FileSystem.readFile(archivePath)
    Buffer.from(file).copy(buffer, 0, 0, 2)
    const isGzipped = buffer[0] === 0x1F && buffer[1] === 0x8B

    return {
      type: 'tar',
      entries,
      totalSize,
      compressedSize: stats.size,
      isGzipped,
    }
  }

  /**
   * 创建 TAR 管理器实例
   */
  static create(options?: TarOptions): TarManager {
    return new TarManager(options)
  }
}
