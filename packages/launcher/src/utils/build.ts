/**
 * 构建相关工具函数
 * 
 * 提供构建过程的辅助工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { FileSystem } from './file-system'
import { PathUtils } from './path-utils'
import type { RollupOutput } from 'rollup'

/**
 * 分析构建结果
 * 
 * @param result - 构建结果
 * @returns 构建分析信息
 */
export function analyzeBuildResult(result: RollupOutput): {
  totalFiles: number
  totalSize: number
  jsFiles: number
  cssFiles: number
  assetFiles: number
  chunks: Array<{
    fileName: string
    size: number
    type: string
    isEntry: boolean
  }>
} {
  const analysis = {
    totalFiles: 0,
    totalSize: 0,
    jsFiles: 0,
    cssFiles: 0,
    assetFiles: 0,
    chunks: [] as Array<{
      fileName: string
      size: number
      type: string
      isEntry: boolean
    }>
  }

  if (!result.output || !Array.isArray(result.output)) {
    return analysis
  }

  for (const chunk of result.output) {
    const size = 'source' in chunk && chunk.source
      ? chunk.source.length
      : ('code' in chunk && chunk.code ? chunk.code.length : 0)

    const fileType = getFileType(chunk.fileName)
    const isEntry = 'isEntry' in chunk ? chunk.isEntry : false

    analysis.totalFiles++
    analysis.totalSize += size

    switch (fileType) {
      case 'js':
        analysis.jsFiles++
        break
      case 'css':
        analysis.cssFiles++
        break
      default:
        analysis.assetFiles++
        break
    }

    analysis.chunks.push({
      fileName: chunk.fileName,
      size,
      type: fileType,
      isEntry
    })
  }

  return analysis
}

/**
 * 获取文件类型
 * 
 * @param fileName - 文件名
 * @returns 文件类型
 */
export function getFileType(fileName: string): string {
  const ext = PathUtils.extname(fileName).toLowerCase()

  if (['.js', '.mjs', '.cjs'].includes(ext)) {
    return 'js'
  } else if (ext === '.css') {
    return 'css'
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
    return 'image'
  } else if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
    return 'font'
  } else if (['.html', '.htm'].includes(ext)) {
    return 'html'
  } else {
    return 'asset'
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 计算压缩比
 * 
 * @param originalSize - 原始大小
 * @param compressedSize - 压缩后大小
 * @returns 压缩比（百分比）
 */
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * 获取目录大小
 * 
 * @param dirPath - 目录路径
 * @returns 目录大小（字节）
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    if (!(await FileSystem.exists(dirPath))) {
      return 0
    }

    const stats = await FileSystem.stat(dirPath)
    if (!stats.isDirectory()) {
      return stats.size
    }

    const files = await FileSystem.readDir(dirPath)
    let totalSize = 0

    for (const file of files) {
      const filePath = PathUtils.join(dirPath, file)
      const fileStats = await FileSystem.stat(filePath)

      if (fileStats.isDirectory()) {
        totalSize += await getDirectorySize(filePath)
      } else {
        totalSize += fileStats.size
      }
    }

    return totalSize
  } catch (error) {
    return 0
  }
}

/**
 * 清理构建目录
 * 
 * @param outDir - 输出目录
 * @param keepFiles - 要保留的文件列表
 */
export async function cleanBuildDirectory(outDir: string, keepFiles: string[] = []): Promise<void> {
  try {
    if (!(await FileSystem.exists(outDir))) {
      return
    }

    const files = await FileSystem.readDir(outDir)

    for (const file of files) {
      if (keepFiles.includes(file)) {
        continue
      }

      const filePath = PathUtils.join(outDir, file)
      await FileSystem.remove(filePath)
    }
  } catch (error) {
    throw new Error(`清理构建目录失败: ${(error as Error).message}`)
  }
}

/**
 * 生成构建报告
 * 
 * @param result - 构建结果
 * @param outDir - 输出目录
 * @param options - 报告选项
 */
export async function generateBuildReport(
  result: RollupOutput,
  outDir: string,
  options: {
    fileName?: string
    includeSourceMap?: boolean
    includeAssets?: boolean
  } = {}
): Promise<void> {
  try {
    const analysis = analyzeBuildResult(result)
    const reportFileName = options.fileName || 'build-report.json'
    const reportPath = PathUtils.join(outDir, reportFileName)

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: analysis.totalFiles,
        totalSize: analysis.totalSize,
        totalSizeFormatted: formatFileSize(analysis.totalSize),
        jsFiles: analysis.jsFiles,
        cssFiles: analysis.cssFiles,
        assetFiles: analysis.assetFiles
      },
      files: analysis.chunks.map(chunk => ({
        fileName: chunk.fileName,
        size: chunk.size,
        sizeFormatted: formatFileSize(chunk.size),
        type: chunk.type,
        isEntry: chunk.isEntry
      })),
      breakdown: {
        byType: getFileTypeBreakdown(analysis.chunks),
        bySize: getSizeBreakdown(analysis.chunks)
      }
    }

    await FileSystem.writeFile(reportPath, JSON.stringify(report, null, 2))
  } catch (error) {
    throw new Error(`生成构建报告失败: ${(error as Error).message}`)
  }
}

/**
 * 获取文件类型分布
 * 
 * @param chunks - 文件块列表
 * @returns 类型分布
 */
function getFileTypeBreakdown(chunks: Array<{ type: string; size: number }>) {
  const breakdown: Record<string, { count: number; size: number }> = {}

  for (const chunk of chunks) {
    if (!breakdown[chunk.type]) {
      breakdown[chunk.type] = { count: 0, size: 0 }
    }

    breakdown[chunk.type].count++
    breakdown[chunk.type].size += chunk.size
  }

  // 添加格式化大小
  for (const type of Object.keys(breakdown)) {
    (breakdown[type] as any).sizeFormatted = formatFileSize(breakdown[type].size)
  }

  return breakdown
}

/**
 * 获取大小分布
 * 
 * @param chunks - 文件块列表
 * @returns 大小分布
 */
function getSizeBreakdown(chunks: Array<{ fileName: string; size: number }>) {
  const sorted = [...chunks].sort((a, b) => b.size - a.size)

  return {
    largest: sorted.slice(0, 10).map(chunk => ({
      fileName: chunk.fileName,
      size: chunk.size,
      sizeFormatted: formatFileSize(chunk.size)
    })),
    smallest: sorted.slice(-10).reverse().map(chunk => ({
      fileName: chunk.fileName,
      size: chunk.size,
      sizeFormatted: formatFileSize(chunk.size)
    }))
  }
}

/**
 * 验证构建输出
 * 
 * @param outDir - 输出目录
 * @returns 验证结果
 */
export async function validateBuildOutput(outDir: string): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
  files: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []
  const files: string[] = []

  try {
    if (!(await FileSystem.exists(outDir))) {
      errors.push('构建输出目录不存在')
      return { valid: false, errors, warnings, files }
    }

    const dirFiles = await FileSystem.readDir(outDir)

    if (dirFiles.length === 0) {
      errors.push('构建输出目录为空')
      return { valid: false, errors, warnings, files }
    }

    // 检查是否有 HTML 文件
    const htmlFiles = dirFiles.filter((file: string) => file.endsWith('.html'))
    if (htmlFiles.length === 0) {
      warnings.push('未找到 HTML 文件')
    }

    // 检查是否有 JavaScript 文件
    const jsFiles = dirFiles.filter((file: string) => /\.(js|mjs|cjs)$/.test(file))
    if (jsFiles.length === 0) {
      warnings.push('未找到 JavaScript 文件')
    }

    // 收集所有文件
    for (const file of dirFiles) {
      const filePath = PathUtils.join(outDir, file)
      const stats = await FileSystem.stat(filePath)

      if (stats.isFile()) {
        files.push(file)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      files
    }

  } catch (error) {
    errors.push(`验证构建输出失败: ${(error as Error).message}`)
    return { valid: false, errors, warnings, files }
  }
}

/**
 * 比较构建结果
 * 
 * @param current - 当前构建结果
 * @param previous - 之前的构建结果
 * @returns 比较结果
 */
export function compareBuildResults(current: RollupOutput, previous: RollupOutput): {
  totalSizeDiff: number
  fileDiffs: Array<{
    fileName: string
    sizeDiff: number
    status: 'added' | 'removed' | 'modified' | 'unchanged'
  }>
} {
  const currentAnalysis = analyzeBuildResult(current)
  const previousAnalysis = analyzeBuildResult(previous)

  const totalSizeDiff = currentAnalysis.totalSize - previousAnalysis.totalSize

  const currentFiles = new Map(currentAnalysis.chunks.map(chunk => [chunk.fileName, chunk.size]))
  const previousFiles = new Map(previousAnalysis.chunks.map(chunk => [chunk.fileName, chunk.size]))

  const fileDiffs: Array<{
    fileName: string
    sizeDiff: number
    status: 'added' | 'removed' | 'modified' | 'unchanged'
  }> = []

  // 检查当前文件
  for (const [fileName, currentSize] of currentFiles) {
    const previousSize = previousFiles.get(fileName)

    if (previousSize === undefined) {
      fileDiffs.push({
        fileName,
        sizeDiff: currentSize,
        status: 'added'
      })
    } else if (currentSize !== previousSize) {
      fileDiffs.push({
        fileName,
        sizeDiff: currentSize - previousSize,
        status: 'modified'
      })
    } else {
      fileDiffs.push({
        fileName,
        sizeDiff: 0,
        status: 'unchanged'
      })
    }
  }

  // 检查已删除的文件
  for (const [fileName, previousSize] of previousFiles) {
    if (!currentFiles.has(fileName)) {
      fileDiffs.push({
        fileName,
        sizeDiff: -previousSize,
        status: 'removed'
      })
    }
  }

  return {
    totalSizeDiff,
    fileDiffs
  }
}
