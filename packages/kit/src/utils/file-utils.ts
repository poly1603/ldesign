/**
 * 文件操作增强工具
 * 提供高级文件操作、批量处理、文件监控等功能
 */

import { createHash } from 'node:crypto'
import { createReadStream, createWriteStream, promises as fs } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { FileSystem } from '../filesystem'

/**
 * 文件复制选项
 */
export interface CopyOptions {
  overwrite?: boolean
  preserveTimestamps?: boolean
  filter?: (src: string, dest: string) => boolean
  onProgress?: (copied: number, total: number) => void
}

/**
 * 文件搜索选项
 */
export interface SearchOptions {
  pattern?: RegExp
  extensions?: string[]
  maxDepth?: number
  includeDirectories?: boolean
  caseSensitive?: boolean
}

/**
 * 文件比较结果
 */
export interface CompareResult {
  identical: boolean
  sizeDifference: number
  contentDifference?: {
    line: number
    column: number
    expected: string
    actual: string
  }[]
}

/**
 * 文件操作工具类
 */
export class FileUtils {
  /**
   * 计算文件哈希值
   */
  static async calculateHash(filePath: string, algorithm = 'sha256'): Promise<string> {
    const hash = createHash(algorithm)
    const stream = createReadStream(filePath)

    for await (const chunk of stream) {
      hash.update(chunk)
    }

    return hash.digest('hex')
  }

  /**
   * 比较两个文件
   */
  static async compareFiles(file1: string, file2: string): Promise<CompareResult> {
    const [stats1, stats2] = await Promise.all([fs.stat(file1), fs.stat(file2)])

    const result: CompareResult = {
      identical: false,
      sizeDifference: stats1.size - stats2.size,
    }

    // 如果大小不同，直接返回
    if (result.sizeDifference !== 0) {
      return result
    }

    // 比较哈希值
    const [hash1, hash2] = await Promise.all([this.calculateHash(file1), this.calculateHash(file2)])

    result.identical = hash1 === hash2
    return result
  }

  /**
   * 批量复制文件
   */
  static async copyFiles(
    sources: string[],
    destination: string,
    options: CopyOptions = {},
  ): Promise<string[]> {
    const copied: string[] = []

    await FileSystem.ensureDir(destination)

    for (const source of sources) {
      const fileName = basename(source)
      const destPath = join(destination, fileName)

      // 检查过滤器
      if (options.filter && !options.filter(source, destPath)) {
        continue
      }

      // 检查是否覆盖
      if (!options.overwrite && (await FileSystem.exists(destPath))) {
        continue
      }

      await fs.copyFile(source, destPath)

      // 保持时间戳
      if (options.preserveTimestamps) {
        const stats = await fs.stat(source)
        await fs.utimes(destPath, stats.atime, stats.mtime)
      }

      copied.push(destPath)

      // 进度回调
      if (options.onProgress) {
        options.onProgress(copied.length, sources.length)
      }
    }

    return copied
  }

  /**
   * 搜索文件
   */
  static async searchFiles(directory: string, options: SearchOptions = {}): Promise<string[]> {
    const results: string[] = []

    const search = async (dir: string, depth = 0): Promise<void> => {
      if (options.maxDepth !== undefined && depth > options.maxDepth) {
        return
      }

      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          if (options.includeDirectories) {
            if (this.matchesPattern(entry.name, options)) {
              results.push(fullPath)
            }
          }
          await search(fullPath, depth + 1)
        }
        else if (entry.isFile()) {
          if (this.matchesPattern(entry.name, options)) {
            results.push(fullPath)
          }
        }
      }
    }

    await search(directory)
    return results
  }

  /**
   * 获取文件详细信息
   */
  static async getFileInfo(filePath: string): Promise<{
    path: string
    name: string
    extension: string
    size: number
    created: Date
    modified: Date
    accessed: Date
    isDirectory: boolean
    isFile: boolean
    permissions: string
    hash?: string
  }> {
    const stats = await fs.stat(filePath)
    const name = basename(filePath)
    const extension = extname(filePath)

    return {
      path: filePath,
      name,
      extension,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      permissions: stats.mode.toString(8),
      hash: stats.isFile() ? await this.calculateHash(filePath) : undefined,
    }
  }

  /**
   * 批量重命名文件
   */
  static async renameFiles(
    files: string[],
    renameFunction: (oldName: string, index: number) => string,
  ): Promise<Array<{ old: string, new: string }>> {
    const renamed: Array<{ old: string, new: string }> = []

    for (let i = 0; i < files.length; i++) {
      const oldPath = files[i]!
      const oldName = basename(oldPath)
      const newName = renameFunction(oldName, i)
      const newPath = join(dirname(oldPath), newName)

      if (oldPath !== newPath) {
        await fs.rename(oldPath, newPath)
        renamed.push({ old: oldPath, new: newPath })
      }
    }

    return renamed
  }

  /**
   * 清理空目录
   */
  static async cleanEmptyDirectories(directory: string): Promise<string[]> {
    const removed: string[] = []

    const clean = async (dir: string): Promise<boolean> => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      let isEmpty = true

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          const dirIsEmpty = await clean(fullPath)
          if (dirIsEmpty) {
            await fs.rmdir(fullPath)
            removed.push(fullPath)
          }
          else {
            isEmpty = false
          }
        }
        else {
          isEmpty = false
        }
      }

      return isEmpty
    }

    await clean(directory)
    return removed
  }

  /**
   * 获取目录大小
   */
  static async getDirectorySize(directory: string): Promise<{
    size: number
    fileCount: number
    directoryCount: number
  }> {
    let size = 0
    let fileCount = 0
    let directoryCount = 0

    const calculate = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          directoryCount++
          await calculate(fullPath)
        }
        else if (entry.isFile()) {
          fileCount++
          const stats = await fs.stat(fullPath)
          size += stats.size
        }
      }
    }

    await calculate(directory)

    return { size, fileCount, directoryCount }
  }

  /**
   * 创建文件备份
   */
  static async createBackup(filePath: string, backupDir?: string): Promise<string> {
    const fileName = basename(filePath)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = `${fileName}.backup.${timestamp}`

    const backupPath = backupDir ? join(backupDir, backupName) : join(dirname(filePath), backupName)

    if (backupDir) {
      await FileSystem.ensureDir(backupDir)
    }

    await fs.copyFile(filePath, backupPath)
    return backupPath
  }

  /**
   * 安全删除文件（移动到回收站）
   */
  static async safeDelete(filePath: string, trashDir?: string): Promise<string> {
    const fileName = basename(filePath)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const trashedName = `${fileName}.deleted.${timestamp}`

    const trashPath = trashDir
      ? join(trashDir, trashedName)
      : join(dirname(filePath), '.trash', trashedName)

    await FileSystem.ensureDir(dirname(trashPath))
    await fs.rename(filePath, trashPath)

    return trashPath
  }

  /**
   * 分割大文件
   */
  static async splitFile(
    filePath: string,
    chunkSize: number,
    outputDir?: string,
  ): Promise<string[]> {
    const fileName = basename(filePath, extname(filePath))
    const extension = extname(filePath)
    const outputDirectory = outputDir || dirname(filePath)

    await FileSystem.ensureDir(outputDirectory)

    const chunks: string[] = []
    const readStream = createReadStream(filePath, { highWaterMark: chunkSize })

    let chunkIndex = 0
    let currentChunk: Buffer[] = []
    let currentSize = 0

    for await (const chunk of readStream) {
      currentChunk.push(chunk)
      currentSize += chunk.length

      if (currentSize >= chunkSize) {
        const chunkPath = join(outputDirectory, `${fileName}.part${chunkIndex}${extension}`)
        await fs.writeFile(chunkPath, Buffer.concat(currentChunk))
        chunks.push(chunkPath)

        currentChunk = []
        currentSize = 0
        chunkIndex++
      }
    }

    // 写入最后一个块
    if (currentChunk.length > 0) {
      const chunkPath = join(outputDirectory, `${fileName}.part${chunkIndex}${extension}`)
      await fs.writeFile(chunkPath, Buffer.concat(currentChunk))
      chunks.push(chunkPath)
    }

    return chunks
  }

  /**
   * 合并文件块
   */
  static async mergeFiles(chunkPaths: string[], outputPath: string): Promise<void> {
    await FileSystem.ensureDir(dirname(outputPath))

    const writeStream = createWriteStream(outputPath)

    for (const chunkPath of chunkPaths) {
      const readStream = createReadStream(chunkPath)
      await pipeline(readStream, writeStream, { end: false })
    }

    writeStream.end()
  }

  // 私有方法

  private static matchesPattern(fileName: string, options: SearchOptions): boolean {
    // 检查扩展名
    if (options.extensions && options.extensions.length > 0) {
      const ext = extname(fileName).toLowerCase()
      const hasMatchingExtension = options.extensions.some((extension) => {
        const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`
        return options.caseSensitive
          ? ext === normalizedExt
          : ext.toLowerCase() === normalizedExt.toLowerCase()
      })

      if (!hasMatchingExtension) {
        return false
      }
    }

    // 检查正则表达式
    if (options.pattern) {
      const testName = options.caseSensitive ? fileName : fileName.toLowerCase()
      const pattern = options.caseSensitive
        ? options.pattern
        : new RegExp(options.pattern.source, `${options.pattern.flags}i`)

      return pattern.test(testName)
    }

    return true
  }
}
