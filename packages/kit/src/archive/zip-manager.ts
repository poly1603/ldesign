/**
 * ZIP 压缩包管理器
 */

import type {
  ArchiveEntry,
  ArchiveProgress,
  ArchiveStats,
  CompressionOptions,
  ExtractionOptions,
  ZipOptions,
} from '../types'
import { EventEmitter } from 'node:events'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import archiver from 'archiver'
import * as yauzl from 'yauzl'
import { FileSystem } from '../filesystem'

/**
 * ZIP 管理器
 */
export class ZipManager extends EventEmitter {
  private options: Required<ZipOptions>

  constructor(options: ZipOptions = {}) {
    super()

    this.options = {
      compressionLevel: options.compressionLevel ?? 6,
      preservePermissions: options.preservePermissions ?? true,
      preserveTimestamps: options.preserveTimestamps ?? true,
      followSymlinks: options.followSymlinks ?? false,
      ignoreHidden: options.ignoreHidden ?? false,
      maxFileSize: options.maxFileSize ?? 100 * 1024 * 1024, // 100MB
      password: options.password ?? '',
      comment: options.comment ?? '',
      ...options,
    }
  }

  /**
   * 创建 ZIP 压缩包
   */
  async create(
    sources: string | string[],
    outputPath: string,
    options: CompressionOptions = {},
  ): Promise<ArchiveStats> {
    const sourceList = Array.isArray(sources) ? sources : [sources]
    const mergedOptions = { ...this.options, ...options }

    return new Promise((resolve, reject) => {
      const output = createWriteStream(outputPath)
      const archive = archiver('zip', {
        zlib: { level: mergedOptions.compressionLevel },
        comment: mergedOptions.comment,
      })

      const stats: ArchiveStats = {
        totalFiles: 0,
        totalSize: 0,
        compressedSize: 0,
        compressionRatio: 0,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
      }

      // 监听事件
      archive.on('entry', (entry) => {
        stats.totalFiles++
        stats.totalSize += entry.stats?.size || 0

        this.emit('entry', {
          name: entry.name,
          size: entry.stats?.size || 0,
          type: entry.stats?.isDirectory() ? 'directory' : 'file',
          lastModified: entry.stats?.mtime,
        } as ArchiveEntry)
      })

      archive.on('progress', (progress) => {
        const progressInfo: ArchiveProgress = {
          processedFiles: progress.entries.processed,
          totalFiles: progress.entries.total,
          processedBytes: progress.fs.processedBytes,
          totalBytes: progress.fs.totalBytes,
          percentage:
            progress.fs.totalBytes > 0
              ? (progress.fs.processedBytes / progress.fs.totalBytes) * 100
              : 0,
        }

        this.emit('progress', progressInfo)
      })

      archive.on('warning', (err) => {
        this.emit('warning', err)
      })

      archive.on('error', reject)

      output.on('close', () => {
        stats.endTime = new Date()
        stats.duration = stats.endTime.getTime() - stats.startTime.getTime()
        stats.compressedSize = archive.pointer()
        stats.compressionRatio
          = stats.totalSize > 0 ? (1 - stats.compressedSize / stats.totalSize) * 100 : 0

        this.emit('complete', stats)
        resolve(stats)
      })

      output.on('error', reject)

      // 连接流
      archive.pipe(output)

      // 添加文件/目录
      this.addSourcesToArchive(archive, sourceList, mergedOptions)
        .then(() => {
          // 完成压缩
          archive.finalize()
        })
        .catch(reject)
    })
  }

  /**
   * 解压 ZIP 文件
   */
  async extract(
    archivePath: string,
    outputDir: string,
    options: ExtractionOptions = {},
  ): Promise<ArchiveStats> {
    const mergedOptions = { ...this.options, ...options }

    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, async (err, zipfile) => {
        if (err)
          return reject(err)
        if (!zipfile)
          return reject(new Error('Failed to open ZIP file'))

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

        zipfile.readEntry()

        zipfile.on('entry', async (entry) => {
          stats.totalFiles++
          stats.totalSize += entry.uncompressedSize
          stats.compressedSize += entry.compressedSize

          const entryPath = FileSystem.join(outputDir, entry.fileName)

          // 安全检查：防止路径遍历攻击
          if (!entryPath.startsWith(outputDir)) {
            this.emit('warning', new Error(`Unsafe path: ${entry.fileName}`))
            zipfile.readEntry()
            return
          }

          // 发出条目事件
          this.emit('entry', {
            name: entry.fileName,
            size: entry.uncompressedSize,
            type: entry.fileName.endsWith('/') ? 'directory' : 'file',
            lastModified: entry.getLastModDate(),
          } as ArchiveEntry)

          if (entry.fileName.endsWith('/')) {
            // 目录
            await FileSystem.ensureDir(entryPath)
            zipfile.readEntry()
          }
          else {
            // 文件
            zipfile.openReadStream(entry, async (err, readStream) => {
              if (err)
                return reject(err)
              if (!readStream)
                return reject(new Error('Failed to open read stream'))

              try {
                await FileSystem.ensureDir(FileSystem.dirname(entryPath))
                const writeStream = createWriteStream(entryPath)
                await pipeline(readStream, writeStream)

                // 设置文件时间戳
                if (mergedOptions.preserveTimestamps) {
                  const mtime = entry.getLastModDate()
                  await FileSystem.setTimestamps(entryPath, mtime, mtime)
                }

                zipfile.readEntry()
              }
              catch (error) {
                reject(error)
              }
            })
          }
        })

        zipfile.on('end', () => {
          stats.endTime = new Date()
          stats.duration = stats.endTime.getTime() - stats.startTime.getTime()
          stats.compressionRatio
            = stats.totalSize > 0 ? (1 - stats.compressedSize / stats.totalSize) * 100 : 0

          this.emit('complete', stats)
          resolve(stats)
        })

        zipfile.on('error', reject)
      })
    })
  }

  /**
   * 列出 ZIP 文件内容
   */
  async list(archivePath: string): Promise<ArchiveEntry[]> {
    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err)
          return reject(err)
        if (!zipfile)
          return reject(new Error('Failed to open ZIP file'))

        const entries: ArchiveEntry[] = []

        zipfile.readEntry()

        zipfile.on('entry', (entry) => {
          entries.push({
            name: entry.fileName,
            size: entry.uncompressedSize,
            type: entry.fileName.endsWith('/') ? 'directory' : 'file',
            compressedSize: entry.compressedSize,
            lastModified: entry.getLastModDate(),
            crc32: entry.crc32,
          })

          zipfile.readEntry()
        })

        zipfile.on('end', () => resolve(entries))
        zipfile.on('error', reject)
      })
    })
  }

  /**
   * 添加文件到现有 ZIP
   */
  async addFiles(
    archivePath: string,
    files: string | string[],
    options: CompressionOptions = {},
  ): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]
    const tempPath = `${archivePath}.tmp`

    // 解压现有 ZIP 到临时目录
    const tempDir = await FileSystem.createTempDir()
    try {
      await this.extract(archivePath, tempDir)

      // 复制新文件到临时目录
      for (const file of fileList) {
        if (await FileSystem.exists(file)) {
          const targetPath = FileSystem.join(tempDir, FileSystem.basename(file))
          await FileSystem.copy(file, targetPath)
        }
      }

      // 重新创建 ZIP
      await this.create(tempDir, tempPath, options)

      // 替换原文件
      await FileSystem.move(tempPath, archivePath)
    }
    finally {
      // 清理临时目录
      await FileSystem.removeDir(tempDir)
    }
  }

  /**
   * 从 ZIP 中移除文件
   */
  async removeFiles(archivePath: string, filesToRemove: string | string[]): Promise<void> {
    const removeList = Array.isArray(filesToRemove) ? filesToRemove : [filesToRemove]
    const tempPath = `${archivePath}.tmp`
    const tempDir = await FileSystem.createTempDir()

    try {
      // 解压现有 ZIP
      await this.extract(archivePath, tempDir)

      // 删除指定文件
      for (const file of removeList) {
        const filePath = FileSystem.join(tempDir, file)
        if (await FileSystem.exists(filePath)) {
          await FileSystem.deleteFile(filePath)
        }
      }

      // 重新创建 ZIP
      await this.create(tempDir, tempPath)

      // 替换原文件
      await FileSystem.move(tempPath, archivePath)
    }
    finally {
      // 清理临时目录
      await FileSystem.removeDir(tempDir)
    }
  }

  /**
   * 验证 ZIP 文件
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
   * 获取 ZIP 文件信息
   */
  async getInfo(archivePath: string): Promise<{
    type: string
    entries: ArchiveEntry[]
    totalSize: number
    compressedSize: number
    comment?: string
  }> {
    const entries = await this.list(archivePath)
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)
    const compressedSize = entries.reduce((sum, entry) => sum + (entry.compressedSize || 0), 0)

    return {
      type: 'zip',
      entries,
      totalSize,
      compressedSize,
      comment: this.options.comment,
    }
  }

  /**
   * 添加源文件到压缩包
   */
  private async addSourcesToArchive(
    archive: archiver.Archiver,
    sources: string[],
    options: Required<ZipOptions>,
  ): Promise<void> {
    for (const source of sources) {
      if (await FileSystem.exists(source)) {
        const stat = await FileSystem.stat(source)

        if (stat.isDirectory()) {
          archive.directory(source, false, (entry) => {
            if (options.ignoreHidden && entry.name.startsWith('.')) {
              return false
            }
            return entry
          })
        }
        else {
          if (options.ignoreHidden && FileSystem.basename(source).startsWith('.')) {
            continue
          }
          archive.file(source, { name: FileSystem.basename(source) })
        }
      }
    }
  }

  /**
   * 创建 ZIP 管理器实例
   */
  static create(options?: ZipOptions): ZipManager {
    return new ZipManager(options)
  }
}
