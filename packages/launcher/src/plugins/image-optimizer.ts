/**
 * 图片优化插件
 * 
 * 自动优化和转换图片格式，支持 WebP、AVIF 等现代格式
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface ImageOptimizerOptions {
  /** 图片源目录 */
  sourceDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 支持的输入格式 */
  inputFormats?: string[]
  /** 输出格式 */
  outputFormats?: ('webp' | 'avif' | 'jpeg' | 'png')[]
  /** 质量设置 */
  quality?: {
    jpeg?: number
    webp?: number
    avif?: number
    png?: number
  }
  /** 是否生成响应式图片 */
  responsive?: boolean
  /** 响应式尺寸 */
  responsiveSizes?: number[]
  /** 是否保留原图 */
  keepOriginal?: boolean
  /** 压缩级别 */
  compressionLevel?: number
  /** 是否生成 manifest */
  generateManifest?: boolean
  /** 最大文件大小（KB） */
  maxFileSize?: number
}

export interface OptimizedImageInfo {
  /** 原始文件 */
  originalPath: string
  /** 原始大小 */
  originalSize: number
  /** 生成的文件 */
  optimizedFiles: Array<{
    path: string
    format: string
    size: number
    width?: number
    height?: number
    quality?: number
  }>
  /** 压缩率 */
  compressionRatio: number
}

export class ImageOptimizer {
  private logger: Logger
  private options: Required<ImageOptimizerOptions>

  constructor(options: ImageOptimizerOptions = {}) {
    this.logger = new Logger('ImageOptimizer')
    this.options = {
      sourceDir: './src/assets/images',
      outputDir: './public/images',
      inputFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
      outputFormats: ['webp', 'jpeg'],
      quality: {
        jpeg: 85,
        webp: 80,
        avif: 75,
        png: 90
      },
      responsive: true,
      responsiveSizes: [320, 640, 768, 1024, 1280, 1920],
      keepOriginal: false,
      compressionLevel: 6,
      generateManifest: true,
      maxFileSize: 1024, // 1MB
      ...options
    }
  }

  /**
   * 优化图片
   */
  async optimizeImages(): Promise<OptimizedImageInfo[]> {
    this.logger.info('开始图片优化...')

    try {
      // 确保输出目录存在
      await fs.mkdir(this.options.outputDir, { recursive: true })

      // 扫描图片文件
      const imageFiles = await this.scanImageFiles()

      if (imageFiles.length === 0) {
        this.logger.warn('未找到图片文件')
        return []
      }

      this.logger.info(`找到 ${imageFiles.length} 个图片文件`)

      // 优化每个图片
      const optimizedInfos: OptimizedImageInfo[] = []
      for (const imageFile of imageFiles) {
        const optimizedInfo = await this.optimizeSingleImage(imageFile)
        if (optimizedInfo) {
          optimizedInfos.push(optimizedInfo)
        }
      }

      // 生成 manifest
      if (this.options.generateManifest) {
        await this.generateManifest(optimizedInfos)
      }

      // 显示统计信息
      this.showOptimizationStats(optimizedInfos)

      this.logger.success(`图片优化完成，共处理 ${optimizedInfos.length} 个文件`)
      return optimizedInfos

    } catch (error) {
      this.logger.error('图片优化失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 扫描图片文件
   */
  private async scanImageFiles(): Promise<string[]> {
    try {
      const files = await this.getAllFiles(this.options.sourceDir)
      return files.filter(file =>
        this.options.inputFormats.some(format =>
          file.toLowerCase().endsWith(`.${format}`)
        )
      )
    } catch {
      return []
    }
  }

  /**
   * 获取所有文件
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath))
        } else {
          files.push(fullPath)
        }
      }
    } catch {
      // 忽略无法访问的目录
    }

    return files
  }

  /**
   * 优化单个图片
   */
  private async optimizeSingleImage(imagePath: string): Promise<OptimizedImageInfo | null> {
    try {
      const fileName = path.basename(imagePath, path.extname(imagePath))
      const originalStats = await fs.stat(imagePath)

      this.logger.debug(`优化图片: ${fileName}`)

      // 检查文件大小
      if (originalStats.size > this.options.maxFileSize * 1024) {
        this.logger.warn(`图片文件过大，跳过: ${fileName} (${(originalStats.size / 1024).toFixed(2)}KB)`)
        return null
      }

      const optimizedFiles: Array<{
        path: string
        format: string
        size: number
        width?: number
        height?: number
        quality?: number
      }> = []

      // 获取图片信息
      const imageInfo = await this.getImageInfo(imagePath)

      // 为每种格式生成优化图片
      for (const format of this.options.outputFormats) {
        if (this.options.responsive) {
          // 生成响应式图片
          for (const size of this.options.responsiveSizes) {
            if (size <= imageInfo.width) {
              const optimizedFile = await this.convertImage(
                imagePath,
                fileName,
                format,
                size
              )
              if (optimizedFile) {
                optimizedFiles.push(optimizedFile)
              }
            }
          }
        } else {
          // 生成单一尺寸图片
          const optimizedFile = await this.convertImage(
            imagePath,
            fileName,
            format
          )
          if (optimizedFile) {
            optimizedFiles.push(optimizedFile)
          }
        }
      }

      // 保留原图（如果需要）
      if (this.options.keepOriginal) {
        const originalOutputPath = path.join(
          this.options.outputDir,
          path.basename(imagePath)
        )
        await fs.copyFile(imagePath, originalOutputPath)

        optimizedFiles.push({
          path: originalOutputPath,
          format: path.extname(imagePath).slice(1),
          size: originalStats.size,
          width: imageInfo.width,
          height: imageInfo.height
        })
      }

      const totalOptimizedSize = optimizedFiles.reduce((sum, file) => sum + file.size, 0)
      const compressionRatio = (originalStats.size - totalOptimizedSize) / originalStats.size

      return {
        originalPath: imagePath,
        originalSize: originalStats.size,
        optimizedFiles,
        compressionRatio
      }

    } catch (error) {
      this.logger.error(`优化图片失败: ${imagePath}`, { error: (error as Error).message })
      return null
    }
  }

  /**
   * 获取图片信息
   */
  private async getImageInfo(imagePath: string): Promise<{
    width: number
    height: number
    format: string
  }> {
    // 简化版本，实际项目中可以使用 sharp 或 jimp 等库
    // 这里返回默认值
    return {
      width: 1920,
      height: 1080,
      format: path.extname(imagePath).slice(1)
    }
  }

  /**
   * 转换图片
   */
  private async convertImage(
    inputPath: string,
    fileName: string,
    format: string,
    width?: number
  ): Promise<{
    path: string
    format: string
    size: number
    width?: number
    height?: number
    quality?: number
  } | null> {
    try {
      const suffix = width ? `_${width}w` : ''
      const outputPath = path.join(
        this.options.outputDir,
        `${fileName}${suffix}.${format}`
      )

      // 这里应该使用图片处理库（如 sharp）进行实际转换
      // 为了演示，我们只是复制文件
      await fs.copyFile(inputPath, outputPath)

      const stats = await fs.stat(outputPath)
      const quality = this.options.quality[format as keyof typeof this.options.quality]

      return {
        path: outputPath,
        format,
        size: stats.size,
        width,
        quality
      }

    } catch (error) {
      this.logger.warn(`转换图片失败: ${format}`, { error: (error as Error).message })
      return null
    }
  }

  /**
   * 生成 manifest
   */
  private async generateManifest(optimizedInfos: OptimizedImageInfo[]): Promise<void> {
    const manifest: Record<string, any> = {}

    for (const info of optimizedInfos) {
      const originalName = path.basename(info.originalPath)
      const baseName = path.basename(info.originalPath, path.extname(info.originalPath))

      manifest[originalName] = {
        original: {
          path: info.originalPath,
          size: info.originalSize
        },
        optimized: info.optimizedFiles.map(file => ({
          path: path.relative(this.options.outputDir, file.path),
          format: file.format,
          size: file.size,
          width: file.width,
          height: file.height,
          quality: file.quality
        })),
        compressionRatio: info.compressionRatio,
        savings: `${(info.compressionRatio * 100).toFixed(1)}%`
      }
    }

    const manifestPath = path.join(this.options.outputDir, 'images-manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

    this.logger.info(`图片清单已生成: ${manifestPath}`)
  }

  /**
   * 显示优化统计
   */
  private showOptimizationStats(optimizedInfos: OptimizedImageInfo[]): void {
    const totalOriginalSize = optimizedInfos.reduce((sum, info) => sum + info.originalSize, 0)
    const totalOptimizedSize = optimizedInfos.reduce((sum, info) =>
      sum + info.optimizedFiles.reduce((fileSum, file) => fileSum + file.size, 0), 0
    )

    const totalSavings = totalOriginalSize - totalOptimizedSize
    const averageCompressionRatio = optimizedInfos.reduce((sum, info) =>
      sum + info.compressionRatio, 0
    ) / optimizedInfos.length

    console.log('\n📊 图片优化统计:')
    console.log(`   处理文件: ${optimizedInfos.length} 个`)
    console.log(`   原始大小: ${(totalOriginalSize / 1024).toFixed(2)}KB`)
    console.log(`   优化后大小: ${(totalOptimizedSize / 1024).toFixed(2)}KB`)
    console.log(`   节省空间: ${(totalSavings / 1024).toFixed(2)}KB`)
    console.log(`   平均压缩率: ${(averageCompressionRatio * 100).toFixed(1)}%`)
  }

  /**
   * 生成响应式图片 HTML
   */
  generateResponsiveHTML(imageName: string, alt: string = ''): string {
    const baseName = path.basename(imageName, path.extname(imageName))

    let html = '<picture>\n'

    // 为每种格式生成 source 标签
    for (const format of this.options.outputFormats) {
      if (format === 'avif' || format === 'webp') {
        const srcset = this.options.responsiveSizes
          .map(size => `  /images/${baseName}_${size}w.${format} ${size}w`)
          .join(',\n')

        html += `  <source\n    type="image/${format}"\n    srcset="\n${srcset}\n    "\n    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"\n  />\n`
      }
    }

    // 添加 fallback img 标签
    html += `  <img\n    src="/images/${baseName}.jpeg"\n    alt="${alt}"\n    loading="lazy"\n    decoding="async"\n  />\n`
    html += '</picture>'

    return html
  }
}

/**
 * 创建图片优化插件
 */
export function createImageOptimizerPlugin(options: ImageOptimizerOptions = {}): Plugin {
  const optimizer = new ImageOptimizer(options)

  return {
    name: 'image-optimizer',

    async buildStart() {
      if (process.env.NODE_ENV === 'production' || process.env.OPTIMIZE_IMAGES === 'true') {
        await optimizer.optimizeImages()
      }
    },

    configureServer(server) {
      // 在开发模式下监听图片文件变化
      const imageDir = options.sourceDir || './src/assets/images'

      server.watcher.add(imageDir)
      server.watcher.on('change', async (file) => {
        const inputFormats = options.inputFormats || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff']
        if (inputFormats.some(format => file.toLowerCase().endsWith(`.${format}`))) {
          console.log('图片文件变更，重新优化...')
          await optimizer.optimizeImages()
        }
      })
    },

    generateBundle() {
      // 在构建时执行最终的图片优化
      // 响应式图片生成方法可以通过 optimizer 实例直接访问
    }
  }
}
