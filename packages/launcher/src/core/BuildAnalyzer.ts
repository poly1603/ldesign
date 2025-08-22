/**
 * 构建分析器模块
 * 负责分析 Vite 构建输出，统计文件信息和性能数据
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import type { BuildStats } from '@/types'
import { FileUtils, StringUtils } from '@/utils'

/**
 * 构建文件信息
 */
export interface BuildFileInfo {
  /** 文件路径 */
  path: string
  /** 文件名称 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** 文件类型 */
  type: 'entry' | 'chunk' | 'asset' | 'vendor' | 'other'
  /** 文件扩展名 */
  extension: string
  /** 是否压缩 */
  compressed: boolean
  /** 压缩比（如果有的话） */
  compressionRatio?: number
}

/**
 * 构建分析结果
 */
export interface BuildAnalysisResult {
  /** 总体统计 */
  stats: BuildStats
  /** 文件列表 */
  files: BuildFileInfo[]
  /** 总大小 */
  totalSize: number
  /** 压缩后总大小 */
  compressedSize?: number
  /** 分析耗时 */
  duration: number
  /** 大小建议 */
  sizeRecommendations: string[]
  /** 性能建议 */
  performanceRecommendations: string[]
}

/**
 * 构建分析选项
 */
export interface BuildAnalysisOptions {
  /** 是否详细分析 */
  detailed?: boolean
  /** 是否包含源映射文件 */
  includeSourceMaps?: boolean
  /** 大文件警告阈值（KB） */
  largeFileThreshold?: number
  /** 是否生成报告文件 */
  generateReport?: boolean
  /** 报告文件路径 */
  reportPath?: string
}

/**
 * 构建分析器类
 * 提供构建产物的详细分析和优化建议
 */
export class BuildAnalyzer {
  private readonly defaultOptions: Required<BuildAnalysisOptions> = {
    detailed: true,
    includeSourceMaps: false,
    largeFileThreshold: 500, // 500KB
    generateReport: false,
    reportPath: 'build-analysis.json'
  }

  /**
   * 分析构建输出目录
   * @param outputPath 构建输出目录路径
   * @param options 分析选项
   * @returns 分析结果
   */
  async analyzeBuildOutput(
    outputPath: string,
    options: BuildAnalysisOptions = {}
  ): Promise<BuildAnalysisResult> {
    const startTime = Date.now()
    const mergedOptions = { ...this.defaultOptions, ...options }

    // 检查输出目录是否存在
    if (!(await FileUtils.exists(outputPath))) {
      throw new Error(`构建输出目录不存在: ${outputPath}`)
    }

    if (!(await FileUtils.isDirectory(outputPath))) {
      throw new Error(`路径不是目录: ${outputPath}`)
    }

    try {
      // 获取所有文件
      const allFiles = await this.getAllFiles(outputPath, mergedOptions)
      
      // 分析文件信息
      const files = await this.analyzeFiles(allFiles, outputPath, mergedOptions)
      
      // 生成统计信息
      const stats = this.generateStats(files)
      
      // 计算总大小
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      const compressedSize = this.calculateCompressedSize(files)
      
      // 生成建议
      const sizeRecommendations = this.generateSizeRecommendations(files, mergedOptions)
      const performanceRecommendations = this.generatePerformanceRecommendations(files, stats)
      
      const duration = Date.now() - startTime
      
      const result: BuildAnalysisResult = {
        stats,
        files,
        totalSize,
        compressedSize,
        duration,
        sizeRecommendations,
        performanceRecommendations
      }

      // 生成报告文件
      if (mergedOptions.generateReport) {
        await this.generateReport(result, mergedOptions.reportPath)
      }

      return result
    } catch (error) {
      throw new Error(`构建分析失败: ${(error as Error).message}`)
    }
  }

  /**
   * 获取所有文件路径
   */
  private async getAllFiles(
    dirPath: string,
    options: Required<BuildAnalysisOptions>
  ): Promise<string[]> {
    const files: string[] = []

    async function collectFiles(currentDir: string): Promise<void> {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          await collectFiles(fullPath)
        } else if (entry.isFile()) {
          // 过滤源映射文件
          if (!options.includeSourceMaps && entry.name.endsWith('.map')) {
            continue
          }
          files.push(fullPath)
        }
      }
    }

    await collectFiles(dirPath)
    return files
  }

  /**
   * 分析文件信息
   */
  private async analyzeFiles(
    filePaths: string[],
    basePath: string,
    options: Required<BuildAnalysisOptions>
  ): Promise<BuildFileInfo[]> {
    const files: BuildFileInfo[] = []

    for (const filePath of filePaths) {
      try {
        const stat = await fs.stat(filePath)
        const relativePath = path.relative(basePath, filePath)
        const fileName = path.basename(filePath)
        const extension = path.extname(fileName).slice(1).toLowerCase()

        const fileInfo: BuildFileInfo = {
          path: relativePath,
          name: fileName,
          size: stat.size,
          type: this.determineFileType(fileName, relativePath),
          extension,
          compressed: this.isCompressed(fileName),
          ...(this.isCompressed(fileName) && {
            compressionRatio: await this.calculateCompressionRatio(filePath)
          })
        }

        files.push(fileInfo)
      } catch (error) {
        console.warn(`无法分析文件 ${filePath}: ${(error as Error).message}`)
      }
    }

    return files.sort((a, b) => b.size - a.size) // 按大小降序排列
  }

  /**
   * 确定文件类型
   */
  private determineFileType(fileName: string, relativePath: string): BuildFileInfo['type'] {
    const lowerName = fileName.toLowerCase()
    const lowerPath = relativePath.toLowerCase()

    // 入口文件
    if (lowerName.includes('index') && (lowerName.endsWith('.js') || lowerName.endsWith('.mjs'))) {
      return 'entry'
    }

    // 第三方库
    if (lowerName.includes('vendor') || lowerName.includes('chunk') || lowerPath.includes('vendor')) {
      return 'vendor'
    }

    // 代码分割块
    if (lowerName.includes('chunk') || /\.[a-f0-9]{8}\.(js|mjs)$/.test(lowerName)) {
      return 'chunk'
    }

    // 资源文件
    if (['css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'].includes(
      path.extname(fileName).slice(1).toLowerCase()
    )) {
      return 'asset'
    }

    return 'other'
  }

  /**
   * 检查文件是否被压缩
   */
  private isCompressed(fileName: string): boolean {
    return fileName.endsWith('.gz') || fileName.endsWith('.br')
  }

  /**
   * 计算压缩比
   */
  private async calculateCompressionRatio(filePath: string): Promise<number> {
    try {
      // 尝试找到原始文件
      const originalPath = filePath.replace(/\.(gz|br)$/, '')
      if (await FileUtils.exists(originalPath)) {
        const originalSize = await FileUtils.getFileSize(originalPath)
        const compressedSize = await FileUtils.getFileSize(filePath)
        return Math.round((1 - compressedSize / originalSize) * 100)
      }
    } catch {
      // 忽略错误
    }
    return 0
  }

  /**
   * 生成统计信息
   */
  private generateStats(files: BuildFileInfo[]): BuildStats {
    const stats: BuildStats = {
      entryCount: 0,
      moduleCount: 0,
      assetCount: 0,
      chunkCount: 0
    }

    for (const file of files) {
      switch (file.type) {
        case 'entry':
          stats.entryCount++
          break
        case 'chunk':
        case 'vendor':
          stats.chunkCount++
          break
        case 'asset':
          stats.assetCount++
          break
      }

      // JavaScript/TypeScript 文件算作模块
      if (['js', 'mjs', 'ts', 'jsx', 'tsx'].includes(file.extension)) {
        stats.moduleCount++
      }
    }

    return stats
  }

  /**
   * 计算压缩后总大小
   */
  private calculateCompressedSize(files: BuildFileInfo[]): number | undefined {
    const compressedFiles = files.filter(f => f.compressed)
    if (compressedFiles.length === 0) return undefined

    return compressedFiles.reduce((sum, file) => sum + file.size, 0)
  }

  /**
   * 生成大小优化建议
   */
  private generateSizeRecommendations(
    files: BuildFileInfo[],
    options: Required<BuildAnalysisOptions>
  ): string[] {
    const recommendations: string[] = []
    const thresholdBytes = options.largeFileThreshold * 1024

    // 检查大文件
    const largeFiles = files.filter(f => f.size > thresholdBytes)
    if (largeFiles.length > 0) {
      recommendations.push(
        `发现 ${largeFiles.length} 个大文件 (>${StringUtils.formatBytes(thresholdBytes)}):`
      )
      largeFiles.slice(0, 5).forEach(file => {
        recommendations.push(`  - ${file.name}: ${StringUtils.formatBytes(file.size)}`)
      })
      if (largeFiles.length > 5) {
        recommendations.push(`  - 还有 ${largeFiles.length - 5} 个文件...`)
      }
    }

    // 检查重复资源
    const assetGroups = new Map<string, BuildFileInfo[]>()
    files.filter(f => f.type === 'asset').forEach(file => {
      const baseName = file.name.replace(/\.[a-f0-9]{8}\./, '.')
      if (!assetGroups.has(baseName)) {
        assetGroups.set(baseName, [])
      }
      assetGroups.get(baseName)!.push(file)
    })

    const duplicates = Array.from(assetGroups.entries()).filter(([_, group]) => group.length > 1)
    if (duplicates.length > 0) {
      recommendations.push('发现可能的重复资源文件:')
      duplicates.forEach(([baseName, group]) => {
        const totalSize = group.reduce((sum, f) => sum + f.size, 0)
        recommendations.push(`  - ${baseName}: ${group.length} 个文件, 总计 ${StringUtils.formatBytes(totalSize)}`)
      })
    }

    // 建议代码分割
    const jsFiles = files.filter(f => ['js', 'mjs'].includes(f.extension) && f.type !== 'vendor')
    const totalJsSize = jsFiles.reduce((sum, f) => sum + f.size, 0)
    if (jsFiles.length === 1 && totalJsSize > 500 * 1024) {
      recommendations.push('建议启用代码分割来减少单个 JS 文件的大小')
    }

    return recommendations
  }

  /**
   * 生成性能优化建议
   */
  private generatePerformanceRecommendations(
    files: BuildFileInfo[],
    stats: BuildStats
  ): string[] {
    const recommendations: string[] = []

    // 检查是否启用了压缩
    const jsFiles = files.filter(f => ['js', 'mjs'].includes(f.extension))
    const hasCompression = files.some(f => f.compressed)
    if (jsFiles.length > 0 && !hasCompression) {
      recommendations.push('建议启用 Gzip 或 Brotli 压缩以减少传输大小')
    }

    // 检查 vendor 文件
    const vendorFiles = files.filter(f => f.type === 'vendor')
    if (vendorFiles.length === 0 && stats.chunkCount > 3) {
      recommendations.push('建议将第三方库单独打包为 vendor chunk 以提高缓存效率')
    }

    // 检查 CSS 文件
    const cssFiles = files.filter(f => f.extension === 'css')
    const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0)
    if (cssFiles.length > 3 || totalCssSize > 100 * 1024) {
      recommendations.push('考虑合并或优化 CSS 文件以减少请求数量')
    }

    // 检查图片资源
    const imageFiles = files.filter(f => ['png', 'jpg', 'jpeg', 'gif'].includes(f.extension))
    const largeImages = imageFiles.filter(f => f.size > 100 * 1024) // 100KB
    if (largeImages.length > 0) {
      recommendations.push(`发现 ${largeImages.length} 个大图片文件，建议优化图片大小或使用 WebP 格式`)
    }

    return recommendations
  }

  /**
   * 生成分析报告文件
   */
  private async generateReport(
    result: BuildAnalysisResult,
    reportPath: string
  ): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: result,
      summary: {
        totalFiles: result.files.length,
        totalSize: StringUtils.formatBytes(result.totalSize),
        ...(result.compressedSize && {
          compressedSize: StringUtils.formatBytes(result.compressedSize),
          compressionRatio: Math.round((1 - result.compressedSize / result.totalSize) * 100)
        }),
        duration: StringUtils.formatTime(result.duration),
        fileTypes: this.getFileTypeDistribution(result.files)
      }
    }

    await FileUtils.writeJson(reportPath, report, 2)
    console.log(`构建分析报告已生成: ${reportPath}`)
  }

  /**
   * 获取文件类型分布
   */
  private getFileTypeDistribution(files: BuildFileInfo[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    files.forEach(file => {
      const type = file.type
      distribution[type] = (distribution[type] || 0) + 1
    })
    
    return distribution
  }

  /**
   * 格式化分析结果为可读字符串
   */
  formatAnalysisResult(result: BuildAnalysisResult): string {
    const lines: string[] = []
    
    lines.push('📊 构建分析结果')
    lines.push('='.repeat(50))
    lines.push(`📁 总文件数: ${result.files.length}`)
    lines.push(`📦 总大小: ${StringUtils.formatBytes(result.totalSize)}`)
    
    if (result.compressedSize) {
      const ratio = Math.round((1 - result.compressedSize / result.totalSize) * 100)
      lines.push(`🗜️  压缩后: ${StringUtils.formatBytes(result.compressedSize)} (压缩率: ${ratio}%)`)
    }
    
    lines.push(`⏱️  分析耗时: ${StringUtils.formatTime(result.duration)}`)
    lines.push('')
    
    // 统计信息
    lines.push('📈 文件统计:')
    lines.push(`  • 入口文件: ${result.stats.entryCount}`)
    lines.push(`  • 代码块: ${result.stats.chunkCount}`)
    lines.push(`  • 模块数: ${result.stats.moduleCount}`)
    lines.push(`  • 资源文件: ${result.stats.assetCount}`)
    lines.push('')
    
    // 最大的文件
    if (result.files.length > 0) {
      lines.push('📋 最大的文件:')
      result.files.slice(0, 5).forEach((file, index) => {
        lines.push(`  ${index + 1}. ${file.name}: ${StringUtils.formatBytes(file.size)} (${file.type})`)
      })
      lines.push('')
    }
    
    // 建议
    if (result.sizeRecommendations.length > 0) {
      lines.push('💡 大小优化建议:')
      result.sizeRecommendations.forEach(rec => lines.push(`  • ${rec}`))
      lines.push('')
    }
    
    if (result.performanceRecommendations.length > 0) {
      lines.push('🚀 性能优化建议:')
      result.performanceRecommendations.forEach(rec => lines.push(`  • ${rec}`))
    }
    
    return lines.join('\n')
  }
}