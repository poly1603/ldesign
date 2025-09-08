/**
 * 压缩解压管理器
 */

import type {
  ArchiveEntry,
  ArchiveOptions,
  ArchiveProgress,
  ArchiveStats,
  CompressionOptions,
  ExtractionOptions,
} from '../types'
import { EventEmitter } from 'node:events'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { createGunzip, createGzip } from 'node:zlib'
import archiver from 'archiver'
import * as yauzl from 'yauzl'
import { FileSystem } from '../filesystem'

/**
 * 压缩解压管理器
 */
export class ArchiveManager extends EventEmitter {
  private options: Required<ArchiveOptions>

  constructor(options: ArchiveOptions = {}) {
    super()

    this.options = {
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
   * 创建 ZIP 压缩包
   */
  async createZip(
    sources: string | string[],
    outputPath: string,
    options: CompressionOptions = {},
  ): Promise<ArchiveStats> {
    const sourceList = Array.isArray(sources) ? sources : [sources]
    const mergedOptions = { ...this.options, ...options }

    // 预先获取需要添加的条目，避免在 Promise 执行器中使用 await
    const entries: Array<{ source: string, isDir: boolean }> = []
    for (const source of sourceList) {
      if (await FileSystem.exists(source)) {
        const stat = await FileSystem.stat(source)
        entries.push({ source, isDir: stat.isDirectory() })
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const output = createWriteStream(outputPath)
        const archive = archiver('zip', {
          zlib: { level: mergedOptions.compressionLevel },
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
          } as ArchiveEntry)
        })

        archive.on('progress', (progress) => {
          const progressInfo: ArchiveProgress = {
            processedFiles: progress.entries.processed,
            totalFiles: progress.entries.total,
            processedBytes: progress.fs.processedBytes,
            totalBytes: progress.fs.totalBytes,
            percentage: (progress.fs.processedBytes / progress.fs.totalBytes) * 100,
          }

          this.emit('progress', progressInfo)
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

        // 连接流
        archive.pipe(output)

        // 添加文件/目录（无需在此处 await）
        for (const { source, isDir } of entries) {
          if (isDir) {
            archive.directory(source, false)
          }
          else {
            archive.file(source, { name: source })
          }
        }

        // 完成压缩
        archive.finalize()
      }
      catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 创建 TAR 压缩包
   */
  async createTar(
    sources: string | string[],
    outputPath: string,
    options: CompressionOptions = {},
  ): Promise<ArchiveStats> {
    const sourceList = Array.isArray(sources) ? sources : [sources]
    const mergedOptions = { ...this.options, ...options }

    // 预先获取需要添加的条目，避免在 Promise 执行器中使用 await
    const entries: Array<{ source: string, isDir: boolean }> = []
    for (const source of sourceList) {
      if (await FileSystem.exists(source)) {
        const stat = await FileSystem.stat(source)
        entries.push({ source, isDir: stat.isDirectory() })
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const output = createWriteStream(outputPath)
        const archive = archiver('tar', {
          gzip: mergedOptions.gzip,
          gzipOptions: {
            level: mergedOptions.compressionLevel,
          },
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
          } as ArchiveEntry)
        })

        archive.on('error', reject)

        output.on('close', () => {
          stats.endTime = new Date()
          stats.duration = stats.endTime.getTime() - stats.startTime.getTime()
          stats.compressedSize = archive.pointer()
          stats.compressionRatio
            = stats.totalSize > 0 ? (1 - stats.compressedSize / stats.totalSize) * 100 : 0

          resolve(stats)
        })

        // 连接流
        archive.pipe(output)

        // 添加文件/目录（无需在此处 await）
        for (const { source, isDir } of entries) {
          if (isDir) {
            archive.directory(source, false)
          }
          else {
            archive.file(source, { name: source })
          }
        }

        // 完成压缩
        archive.finalize()
      }
      catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 解压 ZIP 文件
   */
  async extractZip(
    archivePath: string,
    outputDir: string,
    _options: ExtractionOptions = {},
  ): Promise<ArchiveStats> {
    // Remove unused variable
    // const mergedOptions = { ...this.options, ...options }

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

          const entryPath = `${outputDir}/${entry.fileName}`

          // 发出条目事件
          this.emit('entry', {
            name: entry.fileName,
            size: entry.uncompressedSize,
            type: entry.fileName.endsWith('/') ? 'directory' : 'file',
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
   * 压缩单个文件 (GZIP)
   */
  async compressFile(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions = {},
  ): Promise<void> {
    const mergedOptions = { ...this.options, ...options }

    const input = createReadStream(inputPath)
    const output = createWriteStream(outputPath)
    const gzip = createGzip({ level: mergedOptions.compressionLevel })

    await pipeline(input, gzip, output)
  }

  /**
   * 解压单个文件 (GZIP)
   */
  async decompressFile(inputPath: string, outputPath: string): Promise<void> {
    const input = createReadStream(inputPath)
    const output = createWriteStream(outputPath)
    const gunzip = createGunzip()

    await pipeline(input, gunzip, output)
  }

  /**
   * 获取压缩包信息
   */
  async getArchiveInfo(archivePath: string): Promise<{
    type: string
    entries: ArchiveEntry[]
    totalSize: number
    compressedSize: number
  }> {
    const ext = archivePath.toLowerCase().split('.').pop()

    if (ext === 'zip') {
      return this.getZipInfo(archivePath)
    }

    throw new Error(`Unsupported archive format: ${ext}`)
  }

  /**
   * 获取 ZIP 文件信息
   */
  private async getZipInfo(archivePath: string): Promise<{
    type: string
    entries: ArchiveEntry[]
    totalSize: number
    compressedSize: number
  }> {
    return new Promise((resolve, reject) => {
      yauzl.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err)
          return reject(err)
        if (!zipfile)
          return reject(new Error('Failed to open ZIP file'))

        const entries: ArchiveEntry[] = []
        let totalSize = 0
        let compressedSize = 0

        zipfile.readEntry()

        zipfile.on('entry', (entry) => {
          const archiveEntry: ArchiveEntry = {
            name: entry.fileName,
            size: entry.uncompressedSize,
            type: entry.fileName.endsWith('/') ? 'directory' : 'file',
            compressedSize: entry.compressedSize,
            lastModified: entry.getLastModDate(),
          }

          entries.push(archiveEntry)
          totalSize += entry.uncompressedSize
          compressedSize += entry.compressedSize

          zipfile.readEntry()
        })

        zipfile.on('end', () => {
          resolve({
            type: 'zip',
            entries,
            totalSize,
            compressedSize,
          })
        })

        zipfile.on('error', reject)
      })
    })
  }

  /**
   * 创建压缩管理器实例
   */
  static create(options?: ArchiveOptions): ArchiveManager {
    return new ArchiveManager(options)
  }
}
