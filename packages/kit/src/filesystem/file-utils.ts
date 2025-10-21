/**
 * 文件工具类
 * 提供高级文件操作功能
 */

import type { FileInfo, ScanOptions } from '../types'
import { promises as fs } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { glob } from 'glob'
import { FileSystemError } from '../types'
import { PathUtils, StringUtils } from '../utils'
import { FileSystem } from './file-system'

/**
 * 文件工具类
 */
export class FileUtils {
  /**
   * 扫描目录中的文件
   * @param dirPath 目录路径
   * @param options 扫描选项
   * @returns 文件信息数组
   */
  static async scanFiles(dirPath: string, options: ScanOptions = {}): Promise<FileInfo[]> {
    const {
      includePatterns = ['**/*'],
      ignorePatterns = [],
      maxDepth = Infinity,
      followSymlinks = false,
      extensions = [],
    } = options

    try {
      const results: FileInfo[] = []

      // 构建 glob 模式
      const patterns = includePatterns.map(pattern => PathUtils.join(dirPath, pattern))

      for (const pattern of patterns) {
        const files = await glob(pattern, {
          ignore: ignorePatterns.map(ignore => PathUtils.join(dirPath, ignore)),
          maxDepth,
          follow: followSymlinks,
          nodir: true,
        })

        for (const file of files) {
          // 检查扩展名过滤
          if (extensions.length > 0) {
            const ext = extname(file).toLowerCase()
            if (!extensions.some(e => e.toLowerCase() === ext)) {
              continue
            }
          }

          const info = await FileSystem.getInfo(file)
          results.push(info)
        }
      }

      return results
    }
    catch (error) {
      throw new FileSystemError(`Failed to scan files in: ${dirPath}`, dirPath, error as Error)
    }
  }

  /**
   * 查找文件
   * @param dirPath 目录路径
   * @param fileName 文件名（支持通配符）
   * @param recursive 是否递归查找
   * @returns 找到的文件路径数组
   */
  static async findFiles(dirPath: string, fileName: string, recursive = true): Promise<string[]> {
    try {
      const pattern = recursive ? `**/${fileName}` : fileName
      const fullPattern = PathUtils.join(dirPath, pattern)

      return await glob(fullPattern, { nodir: true })
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to find files: ${fileName} in ${dirPath}`,
        dirPath,
        error as Error,
      )
    }
  }

  /**
   * 按扩展名分组文件
   * @param files 文件路径数组
   * @returns 按扩展名分组的文件
   */
  static groupByExtension(files: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {}

    for (const file of files) {
      const ext = extname(file).toLowerCase() || '.none'
      if (!groups[ext]) {
        groups[ext] = []
      }
      groups[ext].push(file)
    }

    return groups
  }

  /**
   * 按大小分组文件
   * @param files 文件信息数组
   * @param sizeRanges 大小范围
   * @returns 按大小分组的文件
   */
  static async groupBySize(
    files: string[],
    sizeRanges: Array<{ name: string, min: number, max: number }>,
  ): Promise<Record<string, string[]>> {
    const groups: Record<string, string[]> = {}

    // 初始化分组
    for (const range of sizeRanges) {
      groups[range.name] = []
    }
    groups.other = []

    for (const file of files) {
      try {
        const size = await FileSystem.getSize(file)
        let grouped = false

        for (const range of sizeRanges) {
          if (size >= range.min && size <= range.max) {
            ; (groups[range.name] ?? (groups[range.name] = [])).push(file)
            grouped = true
            break
          }
        }

        if (!grouped) {
          groups.other.push(file)
        }
      }
      catch {
        groups.other.push(file)
      }
    }

    return groups
  }

  /**
   * 查找重复文件（基于内容哈希）
   * @param dirPath 目录路径
   * @param recursive 是否递归查找
   * @returns 重复文件分组
   */
  static async findDuplicates(
    dirPath: string,
    recursive = true,
  ): Promise<Record<string, string[]>> {
    try {
      const { CryptoUtils } = await import('../utils/crypto-utils')
      const files = await FileUtils.scanFiles(dirPath, {
        includePatterns: recursive ? ['**/*'] : ['*'],
        maxDepth: recursive ? Infinity : 1,
      })

      const hashGroups: Record<string, string[]> = {}

      for (const file of files) {
        if (file.isFile) {
          try {
            const hash = await CryptoUtils.fileHash(file.path, 'md5')
            if (!hashGroups[hash]) {
              hashGroups[hash] = []
            }
            hashGroups[hash].push(file.path)
          }
          catch {
            // 忽略无法读取的文件
          }
        }
      }

      // 只返回有重复的文件
      const duplicates: Record<string, string[]> = {}
      for (const [hash, paths] of Object.entries(hashGroups)) {
        if (paths.length > 1) {
          duplicates[hash] = paths
        }
      }

      return duplicates
    }
    catch (error) {
      throw new FileSystemError(`Failed to find duplicates in: ${dirPath}`, dirPath, error as Error)
    }
  }

  /**
   * 计算目录大小
   * @param dirPath 目录路径
   * @param recursive 是否递归计算
   * @returns 目录大小（字节）
   */
  static async getDirectorySize(dirPath: string, recursive = true): Promise<number> {
    try {
      let totalSize = 0
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)

        if (entry.isFile()) {
          const stat = await fs.stat(fullPath)
          totalSize += stat.size
        }
        else if (entry.isDirectory() && recursive) {
          totalSize += await FileUtils.getDirectorySize(fullPath, recursive)
        }
      }

      return totalSize
    }
    catch (error) {
      throw new FileSystemError(`Failed to get directory size: ${dirPath}`, dirPath, error as Error)
    }
  }

  /**
   * 清空目录
   * @param dirPath 目录路径
   * @param keepDir 是否保留目录本身
   */
  static async emptyDirectory(dirPath: string, keepDir = true): Promise<void> {
    try {
      if (!(await FileSystem.exists(dirPath))) {
        return
      }

      const entries = await fs.readdir(dirPath)

      for (const entry of entries) {
        const fullPath = join(dirPath, entry)
        const stat = await fs.stat(fullPath)

        if (stat.isDirectory()) {
          await FileSystem.removeDir(fullPath, true)
        }
        else {
          await FileSystem.removeFile(fullPath)
        }
      }

      if (!keepDir) {
        await FileSystem.removeDir(dirPath, false)
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to empty directory: ${dirPath}`, dirPath, error as Error)
    }
  }

  /**
   * 批量重命名文件
   * @param files 文件路径数组
   * @param renameFunction 重命名函数
   */
  static async batchRename(
    files: string[],
    renameFunction: (fileName: string, index: number) => string,
  ): Promise<void> {
    try {
      for (let i = 0; i < files.length; i++) {
        const oldPath = files[i]
        if (!oldPath)
          continue
        const oldName = basename(oldPath)
        const newName = renameFunction(oldName, i)
        const newPath = join(dirname(oldPath), newName)

        if (oldPath !== newPath) {
          await FileSystem.moveFile(oldPath, newPath)
        }
      }
    }
    catch (error) {
      throw new FileSystemError('Failed to batch rename files', '', error as Error)
    }
  }

  /**
   * 安全删除文件（移动到回收站）
   * @param filePath 文件路径
   */
  static async safeDelete(filePath: string): Promise<void> {
    try {
      // 简化实现：移动到临时目录
      const { TempManager } = await import('./temp-manager')
      const tempDir = await TempManager.createTempDir('deleted-files')
      const fileName = basename(filePath)
      const safePath = join(tempDir, `${fileName}.${Date.now()}`)

      await FileSystem.moveFile(filePath, safePath)
    }
    catch (error) {
      throw new FileSystemError(`Failed to safely delete: ${filePath}`, filePath, error as Error)
    }
  }

  /**
   * 文件内容搜索
   * @param filePath 文件路径
   * @param searchText 搜索文本
   * @param options 搜索选项
   * @returns 匹配结果
   */
  static async searchInFile(
    filePath: string,
    searchText: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      regex?: boolean
    } = {},
  ): Promise<Array<{ line: number, content: string, match: string }>> {
    try {
      const content = await FileSystem.readFile(filePath)
      const lines = content.split('\n')
      const results: Array<{ line: number, content: string, match: string }> = []

      const { caseSensitive = false, wholeWord = false, regex = false } = options

      let pattern: RegExp
      if (regex) {
        const flags = caseSensitive ? 'g' : 'gi'
        pattern = new RegExp(searchText, flags)
      }
      else {
        const escapedText = StringUtils.escapeRegExp(searchText)
        const wordBoundary = wholeWord ? '\\b' : ''
        const flags = caseSensitive ? 'g' : 'gi'
        pattern = new RegExp(`${wordBoundary}${escapedText}${wordBoundary}`, flags)
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? ''
        const matches = line.match(pattern)

        if (matches) {
          for (const match of matches) {
            results.push({
              line: i + 1,
              content: line,
              match,
            })
          }
        }
      }

      return results
    }
    catch (error) {
      throw new FileSystemError(`Failed to search in file: ${filePath}`, filePath, error as Error)
    }
  }

  /**
   * 目录内容搜索
   * @param dirPath 目录路径
   * @param searchText 搜索文本
   * @param options 搜索选项
   * @returns 搜索结果
   */
  static async searchInDirectory(
    dirPath: string,
    searchText: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      regex?: boolean
      filePatterns?: string[]
      recursive?: boolean
    } = {},
  ): Promise<Record<string, Array<{ line: number, content: string, match: string }>>> {
    try {
      const { filePatterns = ['**/*'], recursive = true } = options
      const files = await FileUtils.scanFiles(dirPath, {
        includePatterns: filePatterns,
        maxDepth: recursive ? Infinity : 1,
      })

      const results: Record<string, Array<{ line: number, content: string, match: string }>> = {}

      for (const file of files) {
        if (file.isFile) {
          try {
            const matches = await FileUtils.searchInFile(file.path, searchText, options)
            if (matches.length > 0) {
              results[file.path] = matches
            }
          }
          catch {
            // 忽略无法搜索的文件（如二进制文件）
          }
        }
      }

      return results
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to search in directory: ${dirPath}`,
        dirPath,
        error as Error,
      )
    }
  }

  /**
   * 文件内容替换
   * @param filePath 文件路径
   * @param searchText 搜索文本
   * @param replaceText 替换文本
   * @param options 替换选项
   * @returns 替换次数
   */
  static async replaceInFile(
    filePath: string,
    searchText: string,
    replaceText: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      regex?: boolean
      backup?: boolean
    } = {},
  ): Promise<number> {
    try {
      const { caseSensitive = false, wholeWord = false, regex = false, backup = true } = options

      // 创建备份
      if (backup) {
        const backupPath = `${filePath}.backup.${Date.now()}`
        await FileSystem.copyFile(filePath, backupPath)
      }

      const content = await FileSystem.readFile(filePath)

      let pattern: RegExp
      if (regex) {
        const flags = caseSensitive ? 'g' : 'gi'
        pattern = new RegExp(searchText, flags)
      }
      else {
        const escapedText = StringUtils.escapeRegExp(searchText)
        const wordBoundary = wholeWord ? '\\b' : ''
        const flags = caseSensitive ? 'g' : 'gi'
        pattern = new RegExp(`${wordBoundary}${escapedText}${wordBoundary}`, flags)
      }

      const matches = content.match(pattern)
      const replacedContent = content.replace(pattern, replaceText)

      await FileSystem.writeFile(filePath, replacedContent)

      return matches ? matches.length : 0
    }
    catch (error) {
      throw new FileSystemError(`Failed to replace in file: ${filePath}`, filePath, error as Error)
    }
  }

  /**
   * 获取文件编码
   * @param filePath 文件路径
   * @returns 文件编码
   */
  static async detectEncoding(filePath: string): Promise<string> {
    try {
      const buffer = await FileSystem.readBuffer(filePath)
      const firstBytes = buffer.slice(0, 4)

      // 检查 BOM
      if (firstBytes[0] === 0xEF && firstBytes[1] === 0xBB && firstBytes[2] === 0xBF) {
        return 'utf8'
      }
      if (firstBytes[0] === 0xFF && firstBytes[1] === 0xFE) {
        return 'utf16le'
      }
      if (firstBytes[0] === 0xFE && firstBytes[1] === 0xFF) {
        return 'utf16be'
      }
      if (
        firstBytes[0] === 0xFF
        && firstBytes[1] === 0xFE
        && firstBytes[2] === 0x00
        && firstBytes[3] === 0x00
      ) {
        return 'utf32le'
      }
      if (
        firstBytes[0] === 0x00
        && firstBytes[1] === 0x00
        && firstBytes[2] === 0xFE
        && firstBytes[3] === 0xFF
      ) {
        return 'utf32be'
      }

      // 简单的 UTF-8 检测
      try {
        buffer.toString('utf8')
        return 'utf8'
      }
      catch {
        return 'binary'
      }
    }
    catch (error) {
      throw new FileSystemError(`Failed to detect encoding: ${filePath}`, filePath, error as Error)
    }
  }

  /**
   * 转换文件编码
   * @param filePath 文件路径
   * @param fromEncoding 源编码
   * @param toEncoding 目标编码
   */
  static async convertEncoding(
    filePath: string,
    fromEncoding: BufferEncoding,
    toEncoding: BufferEncoding,
  ): Promise<void> {
    try {
      const content = await fs.readFile(filePath, fromEncoding)
      await fs.writeFile(filePath, content, toEncoding)
    }
    catch (error) {
      throw new FileSystemError(`Failed to convert encoding: ${filePath}`, filePath, error as Error)
    }
  }
}
