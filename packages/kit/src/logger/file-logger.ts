/**
 * 文件日志传输器
 * 提供文件日志记录和轮转功能
 */

import type { WriteStream } from 'node:fs'
import type { LogEntry, LogTransport } from '../types'
import { createWriteStream, promises as fs } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { FileSystem } from '../filesystem'

/**
 * 文件日志器选项
 */
export interface FileLoggerOptions {
  filename: string
  maxSize?: number
  maxFiles?: number
  format?: 'json' | 'text'
  datePattern?: string
  compress?: boolean
  level?: string
  filter?: (entry: LogEntry) => boolean
}

/**
 * 文件日志传输器类
 */
export class FileLogger implements LogTransport {
  private options: Required<FileLoggerOptions>
  private writeStream: WriteStream | null = null
  private currentSize = 0
  private isRotating = false

  constructor(options: FileLoggerOptions) {
    this.options = {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: 'text',
      datePattern: 'YYYY-MM-DD',
      compress: false,
      level: 'info',
      filter: () => true,
      ...options,
    }
  }

  /**
   * 记录日志
   */
  async log(entry: LogEntry): Promise<void> {
    if (!this.options.filter(entry)) {
      return
    }

    await this.ensureStream()

    const formatted = this.formatEntry(entry)
    const data = `${formatted}\n`

    // 检查是否需要轮转
    if (this.needsRotation(data.length)) {
      await this.rotate()
    }

    return new Promise((resolve, reject) => {
      if (!this.writeStream) {
        reject(new Error('Write stream not available'))
        return
      }

      this.writeStream.write(data, (error) => {
        if (error) {
          reject(error)
        }
        else {
          this.currentSize += data.length
          resolve()
        }
      })
    })
  }

  /**
   * 格式化日志条目
   */
  private formatEntry(entry: LogEntry): string {
    if (this.options.format === 'json') {
      return JSON.stringify({
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        module: entry.module,
        message: entry.message,
        data: entry.data,
      })
    }

    // 文本格式
    const timestamp = entry.timestamp.toISOString()
    const module = entry.module ? `[${entry.module}]` : ''
    const level = `[${entry.level.toUpperCase()}]`
    const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : ''

    return `[${timestamp}] ${module} ${level} ${entry.message}${dataStr}`
  }

  /**
   * 确保写入流存在
   */
  private async ensureStream(): Promise<void> {
    if (this.writeStream && !this.writeStream.destroyed) {
      return
    }

    await FileSystem.ensureDir(dirname(this.options.filename))

    // 获取当前文件大小
    try {
      const stats = await fs.stat(this.options.filename)
      this.currentSize = stats.size
    }
    catch {
      this.currentSize = 0
    }

    this.writeStream = createWriteStream(this.options.filename, { flags: 'a' })

    this.writeStream.on('error', (error) => {
      console.error('File logger write stream error:', error)
    })
  }

  /**
   * 检查是否需要轮转
   */
  private needsRotation(dataLength: number): boolean {
    return this.currentSize + dataLength > this.options.maxSize
  }

  /**
   * 轮转日志文件
   */
  private async rotate(): Promise<void> {
    if (this.isRotating) {
      return
    }

    this.isRotating = true

    try {
      // 关闭当前流
      if (this.writeStream) {
        await new Promise<void>((resolve) => {
          this.writeStream!.end(() => resolve())
        })
        this.writeStream = null
      }

      // 轮转文件
      await this.rotateFiles()

      // 重置大小
      this.currentSize = 0
    }
    finally {
      this.isRotating = false
    }
  }

  /**
   * 轮转文件
   */
  private async rotateFiles(): Promise<void> {
    const dir = dirname(this.options.filename)
    const name = basename(this.options.filename, extname(this.options.filename))
    const ext = extname(this.options.filename)

    // 删除最老的文件
    const oldestFile = join(dir, `${name}.${this.options.maxFiles}${ext}`)
    try {
      await fs.unlink(oldestFile)
    }
    catch {
      // 文件不存在，忽略错误
    }

    // 重命名现有文件
    for (let i = this.options.maxFiles - 1; i >= 1; i--) {
      const oldFile = join(dir, `${name}.${i}${ext}`)
      const newFile = join(dir, `${name}.${i + 1}${ext}`)

      try {
        await fs.rename(oldFile, newFile)
      }
      catch {
        // 文件不存在，忽略错误
      }
    }

    // 重命名当前文件
    const currentFile = this.options.filename
    const firstRotatedFile = join(dir, `${name}.1${ext}`)

    try {
      await fs.rename(currentFile, firstRotatedFile)

      // 如果启用压缩，压缩轮转的文件
      if (this.options.compress) {
        await this.compressFile(firstRotatedFile)
      }
    }
    catch (error) {
      console.error('Failed to rotate log file:', error)
    }
  }

  /**
   * 压缩文件
   */
  private async compressFile(filePath: string): Promise<void> {
    try {
      const { createGzip } = await import('node:zlib')
      const { pipeline } = await import('node:stream/promises')
      const { createReadStream } = await import('node:fs')

      const gzipPath = `${filePath}.gz`
      const readStream = createReadStream(filePath)
      const gzipStream = createGzip()
      const writeStream = createWriteStream(gzipPath)

      await pipeline(readStream, gzipStream, writeStream)

      // 删除原文件
      await fs.unlink(filePath)
    }
    catch (error) {
      console.error('Failed to compress log file:', error)
    }
  }

  /**
   * 清理日志文件
   */
  async cleanup(): Promise<void> {
    const dir = dirname(this.options.filename)
    const name = basename(this.options.filename, extname(this.options.filename))
    const ext = extname(this.options.filename)

    try {
      const files = await fs.readdir(dir)
      const logFiles = files.filter(
        file => file.startsWith(name) && (file.endsWith(ext) || file.endsWith(`${ext}.gz`)),
      )

      // 按修改时间排序
      const fileStats = await Promise.all(
        logFiles.map(async (file) => {
          const filePath = join(dir, file)
          const stats = await fs.stat(filePath)
          return { file, path: filePath, mtime: stats.mtime }
        }),
      )

      fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

      // 删除超出数量限制的文件
      const filesToDelete = fileStats.slice(this.options.maxFiles)
      for (const { path } of filesToDelete) {
        await fs.unlink(path)
      }
    }
    catch (error) {
      console.error('Failed to cleanup log files:', error)
    }
  }

  /**
   * 获取日志文件列表
   */
  async getLogFiles(): Promise<string[]> {
    const dir = dirname(this.options.filename)
    const name = basename(this.options.filename, extname(this.options.filename))
    const ext = extname(this.options.filename)

    try {
      const files = await fs.readdir(dir)
      return files
        .filter(file => file.startsWith(name) && (file.endsWith(ext) || file.endsWith(`${ext}.gz`)))
        .map(file => join(dir, file))
        .sort()
    }
    catch {
      return []
    }
  }

  /**
   * 读取日志文件内容
   */
  async readLogFile(filePath: string): Promise<string> {
    try {
      if (filePath.endsWith('.gz')) {
        const { createGunzip } = await import('node:zlib')
        const { pipeline } = await import('node:stream/promises')
        const { createReadStream } = await import('node:fs')

        const readStream = createReadStream(filePath)
        const gunzipStream = createGunzip()

        let content = ''
        gunzipStream.on('data', (chunk) => {
          content += chunk.toString()
        })

        await pipeline(readStream, gunzipStream)
        return content
      }
      else {
        return await fs.readFile(filePath, 'utf-8')
      }
    }
    catch (error) {
      throw new Error(`Failed to read log file: ${error}`)
    }
  }

  /**
   * 获取日志文件大小
   */
  async getLogFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath)
      return stats.size
    }
    catch {
      return 0
    }
  }

  /**
   * 关闭文件日志器
   */
  async close(): Promise<void> {
    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve())
      })
      this.writeStream = null
    }
  }

  /**
   * 设置选项
   */
  setOptions(options: Partial<FileLoggerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取选项
   */
  getOptions(): Required<FileLoggerOptions> {
    return { ...this.options }
  }

  /**
   * 创建文件日志器实例
   */
  static create(options: FileLoggerOptions): FileLogger {
    return new FileLogger(options)
  }
}
