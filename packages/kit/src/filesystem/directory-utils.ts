/**
 * 目录工具类
 * 提供目录操作和管理功能
 */

import { promises as fs } from 'node:fs'
import { basename, join } from 'node:path'
import { FileSystemError } from '../types'
import { PathUtils } from '../utils'
import { FileSystem } from './file-system'

/**
 * 目录工具类
 */
export class DirectoryUtils {
  /**
   * 获取目录树结构
   * @param dirPath 目录路径
   * @param maxDepth 最大深度
   * @returns 目录树
   */
  static async getDirectoryTree(dirPath: string, maxDepth = Infinity): Promise<DirectoryTree> {
    try {
      const stat = await fs.stat(dirPath)
      const tree: DirectoryTree = {
        name: basename(dirPath),
        path: PathUtils.normalize(dirPath),
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.size,
        mtime: stat.mtime,
        children: [],
      }

      if (stat.isDirectory() && maxDepth > 0) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })

        for (const entry of entries) {
          const childPath = join(dirPath, entry.name)
          const childTree = await DirectoryUtils.getDirectoryTree(childPath, maxDepth - 1)
          tree.children!.push(childTree)
        }

        // 排序：目录在前，文件在后，然后按名称排序
        tree.children!.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }

      return tree
    }
    catch (error) {
      throw new FileSystemError(`Failed to get directory tree: ${dirPath}`, dirPath, error as Error)
    }
  }

  /**
   * 比较两个目录
   * @param dir1 目录1路径
   * @param dir2 目录2路径
   * @returns 比较结果
   */
  static async compareDirectories(dir1: string, dir2: string): Promise<DirectoryComparison> {
    try {
      const [tree1, tree2] = await Promise.all([
        DirectoryUtils.getDirectoryTree(dir1),
        DirectoryUtils.getDirectoryTree(dir2),
      ])

      const comparison: DirectoryComparison = {
        onlyInFirst: [],
        onlyInSecond: [],
        different: [],
        same: [],
      }

      await DirectoryUtils.compareTreeNodes(tree1, tree2, '', comparison)

      return comparison
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to compare directories: ${dir1} vs ${dir2}`,
        dir1,
        error as Error,
      )
    }
  }

  /**
   * 递归比较树节点
   */
  private static async compareTreeNodes(
    node1: DirectoryTree,
    node2: DirectoryTree,
    relativePath: string,
    comparison: DirectoryComparison,
  ): Promise<void> {
    const currentPath = relativePath ? join(relativePath, node1.name) : node1.name

    if (node1.type === 'file' && node2.type === 'file') {
      // 比较文件
      if (node1.size !== node2.size || node1.mtime.getTime() !== node2.mtime.getTime()) {
        comparison.different.push(currentPath)
      }
      else {
        comparison.same.push(currentPath)
      }
      return
    }

    if (node1.type === 'directory' && node2.type === 'directory') {
      // 比较目录
      const children1 = new Map(node1.children!.map(child => [child.name, child]))
      const children2 = new Map(node2.children!.map(child => [child.name, child]))

      // 找出只在第一个目录中存在的文件
      for (const [name] of children1) {
        if (!children2.has(name)) {
          comparison.onlyInFirst.push(join(currentPath, name))
        }
      }

      // 找出只在第二个目录中存在的文件
      for (const [name] of children2) {
        if (!children1.has(name)) {
          comparison.onlyInSecond.push(join(currentPath, name))
        }
      }

      // 递归比较共同的子项
      for (const [name, child1] of children1) {
        const child2 = children2.get(name)
        if (child2) {
          await DirectoryUtils.compareTreeNodes(child1, child2, currentPath, comparison)
        }
      }
    }
  }

  /**
   * 同步两个目录
   * @param sourceDir 源目录
   * @param targetDir 目标目录
   * @param options 同步选项
   */
  static async syncDirectories(
    sourceDir: string,
    targetDir: string,
    options: {
      deleteExtra?: boolean
      overwriteNewer?: boolean
      dryRun?: boolean
    } = {},
  ): Promise<SyncResult> {
    try {
      const { deleteExtra = false, overwriteNewer = false, dryRun = false } = options
      const result: SyncResult = {
        copied: [],
        updated: [],
        deleted: [],
        skipped: [],
      }

      const comparison = await DirectoryUtils.compareDirectories(sourceDir, targetDir)

      // 复制只在源目录中存在的文件
      for (const relativePath of comparison.onlyInFirst) {
        const sourcePath = join(sourceDir, relativePath)
        const targetPath = join(targetDir, relativePath)

        if (!dryRun) {
          if (await FileSystem.isDirectory(sourcePath)) {
            await FileSystem.createDir(targetPath)
          }
          else {
            await FileSystem.copyFile(sourcePath, targetPath)
          }
        }
        result.copied.push(relativePath)
      }

      // 删除只在目标目录中存在的文件（如果启用）
      if (deleteExtra) {
        for (const relativePath of comparison.onlyInSecond) {
          const targetPath = join(targetDir, relativePath)

          if (!dryRun) {
            if (await FileSystem.isDirectory(targetPath)) {
              await FileSystem.removeDir(targetPath)
            }
            else {
              await FileSystem.removeFile(targetPath)
            }
          }
          result.deleted.push(relativePath)
        }
      }

      // 更新不同的文件
      for (const relativePath of comparison.different) {
        const sourcePath = join(sourceDir, relativePath)
        const targetPath = join(targetDir, relativePath)

        if (await FileSystem.isFile(sourcePath)) {
          const [sourceStat, targetStat] = await Promise.all([
            fs.stat(sourcePath),
            fs.stat(targetPath),
          ])

          if (overwriteNewer || sourceStat.mtime > targetStat.mtime) {
            if (!dryRun) {
              await FileSystem.copyFile(sourcePath, targetPath)
            }
            result.updated.push(relativePath)
          }
          else {
            result.skipped.push(relativePath)
          }
        }
      }

      return result
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to sync directories: ${sourceDir} -> ${targetDir}`,
        sourceDir,
        error as Error,
      )
    }
  }

  /**
   * 创建目录结构
   * @param basePath 基础路径
   * @param structure 目录结构
   */
  static async createStructure(basePath: string, structure: DirectoryStructure): Promise<void> {
    try {
      await FileSystem.ensureDir(basePath)

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
        else {
          // 子目录
          await DirectoryUtils.createStructure(fullPath, content)
        }
      }
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to create directory structure: ${basePath}`,
        basePath,
        error as Error,
      )
    }
  }

  /**
   * 获取目录统计信息
   * @param dirPath 目录路径
   * @returns 统计信息
   */
  static async getDirectoryStats(dirPath: string): Promise<DirectoryStats> {
    try {
      const stats: DirectoryStats = {
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0,
        filesByExtension: {},
        largestFile: { path: '', size: 0 },
        oldestFile: { path: '', mtime: new Date() },
        newestFile: { path: '', mtime: new Date(0) },
      }

      await DirectoryUtils.collectStats(dirPath, stats)

      return stats
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to get directory stats: ${dirPath}`,
        dirPath,
        error as Error,
      )
    }
  }

  /**
   * 递归收集统计信息
   */
  private static async collectStats(dirPath: string, stats: DirectoryStats): Promise<void> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        stats.totalDirectories++
        await DirectoryUtils.collectStats(fullPath, stats)
      }
      else if (entry.isFile()) {
        stats.totalFiles++

        const stat = await fs.stat(fullPath)
        stats.totalSize += stat.size

        // 按扩展名统计
        const ext = PathUtils.extname(entry.name).toLowerCase() || '.none'
        stats.filesByExtension[ext] = (stats.filesByExtension[ext] || 0) + 1

        // 最大文件
        if (stat.size > stats.largestFile.size) {
          stats.largestFile = { path: fullPath, size: stat.size }
        }

        // 最旧文件
        if (stat.mtime < stats.oldestFile.mtime) {
          stats.oldestFile = { path: fullPath, mtime: stat.mtime }
        }

        // 最新文件
        if (stat.mtime > stats.newestFile.mtime) {
          stats.newestFile = { path: fullPath, mtime: stat.mtime }
        }
      }
    }
  }

  /**
   * 清理空目录
   * @param dirPath 目录路径
   * @param recursive 是否递归清理
   * @returns 删除的目录数量
   */
  static async cleanEmptyDirectories(dirPath: string, recursive = true): Promise<number> {
    try {
      let deletedCount = 0
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      if (recursive) {
        // 先递归清理子目录
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const subDirPath = join(dirPath, entry.name)
            deletedCount += await DirectoryUtils.cleanEmptyDirectories(subDirPath, recursive)
          }
        }
      }

      // 重新检查当前目录是否为空
      const currentEntries = await fs.readdir(dirPath)
      if (currentEntries.length === 0) {
        await FileSystem.removeDir(dirPath, false)
        deletedCount++
      }

      return deletedCount
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to clean empty directories: ${dirPath}`,
        dirPath,
        error as Error,
      )
    }
  }

  /**
   * 获取目录大小分布
   * @param dirPath 目录路径
   * @param maxDepth 最大深度
   * @returns 大小分布
   */
  static async getDirectorySizeDistribution(
    dirPath: string,
    maxDepth = 2,
  ): Promise<Array<{ path: string, size: number, percentage: number }>> {
    try {
      const distribution: Array<{ path: string, size: number }> = []
      await DirectoryUtils.collectSizeDistribution(dirPath, '', maxDepth, distribution)

      // 计算总大小
      const totalSize = distribution.reduce((sum, item) => sum + item.size, 0)

      // 添加百分比并排序
      return distribution
        .map(item => ({
          ...item,
          percentage: totalSize > 0 ? (item.size / totalSize) * 100 : 0,
        }))
        .sort((a, b) => b.size - a.size)
    }
    catch (error) {
      throw new FileSystemError(
        `Failed to get directory size distribution: ${dirPath}`,
        dirPath,
        error as Error,
      )
    }
  }

  /**
   * 递归收集大小分布
   */
  private static async collectSizeDistribution(
    dirPath: string,
    relativePath: string,
    maxDepth: number,
    distribution: Array<{ path: string, size: number }>,
  ): Promise<number> {
    let totalSize = 0
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)
      const entryRelativePath = relativePath ? join(relativePath, entry.name) : entry.name

      if (entry.isFile()) {
        const stat = await fs.stat(fullPath)
        totalSize += stat.size
      }
      else if (entry.isDirectory()) {
        if (maxDepth > 0) {
          const subDirSize = await DirectoryUtils.collectSizeDistribution(
            fullPath,
            entryRelativePath,
            maxDepth - 1,
            distribution,
          )
          totalSize += subDirSize
        }
      }
    }

    if (relativePath) {
      distribution.push({ path: relativePath, size: totalSize })
    }

    return totalSize
  }
}

// 类型定义
interface DirectoryTree {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  mtime: Date
  children?: DirectoryTree[]
}

interface DirectoryComparison {
  onlyInFirst: string[]
  onlyInSecond: string[]
  different: string[]
  same: string[]
}

interface SyncResult {
  copied: string[]
  updated: string[]
  deleted: string[]
  skipped: string[]
}

interface DirectoryStructure {
  [key: string]: string | null | DirectoryStructure
}

interface DirectoryStats {
  totalFiles: number
  totalDirectories: number
  totalSize: number
  filesByExtension: Record<string, number>
  largestFile: { path: string, size: number }
  oldestFile: { path: string, mtime: Date }
  newestFile: { path: string, mtime: Date }
}
