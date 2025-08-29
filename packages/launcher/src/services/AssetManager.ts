/**
 * 资源管理器
 * 负责处理字体优化、SVG转换和图片处理
 */

import path from 'node:path'
import fs from 'node:fs/promises'
import type {
  AssetConfig,
  AssetProcessingResult,
  AssetStats,
  FontOptimizationConfig,
  FontProcessingResult,
  IAssetManager,
  ImageOptimizationConfig,
  ImageProcessingResult,
  SVGOptimizationOptions,
  SVGProcessingResult,
  SVGSpriteOptions,
} from '../types/assets'
import { ErrorHandler } from './ErrorHandler'
import { FontProcessor } from '../utils/font-processor'

export class AssetManager implements IAssetManager {
  private errorHandler: ErrorHandler
  private stats: AssetStats = {
    fonts: {
      total: 0,
      optimized: 0,
      totalSize: 0,
      optimizedSize: 0,
    },
    svgs: {
      total: 0,
      optimized: 0,
      componentized: 0,
      sprites: 0,
    },
    images: {
      total: 0,
      optimized: 0,
      totalSize: 0,
      optimizedSize: 0,
    },
  }

  constructor() {
    this.errorHandler = new ErrorHandler()
  }

  /**
   * 优化字体
   */
  async optimizeFonts(config: FontOptimizationConfig): Promise<FontProcessingResult[]> {
    try {
      const results: FontProcessingResult[] = []

      // 这里应该扫描字体文件，简化实现
      const fontPaths = await this.findFontFiles()

      for (const fontPath of fontPaths) {
        const result = await FontProcessor.optimizeFont(fontPath, config)
        results.push(result)

        if (result.success) {
          this.stats.fonts.optimized++
        }
      }

      this.stats.fonts.total = fontPaths.length
      return results
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'optimize fonts',
      )
      throw launcherError
    }
  }

  /**
   * 生成字体子集
   */
  async generateFontSubsets(fontPath: string, chars: string): Promise<string> {
    try {
      const subsetPaths = await FontProcessor.generateSubset(fontPath, chars)
      return subsetPaths[0] || fontPath
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'generate font subsets',
      )
      throw launcherError
    }
  }

  /**
   * 预加载字体
   */
  preloadFonts(fonts: string[]): void {
    // 生成字体预加载配置
    console.log(`Preloading ${fonts.length} fonts:`, fonts)
  }

  /**
   * 转换 SVG 为组件
   */
  async convertSVGToComponent(svgPath: string, framework: string): Promise<string> {
    try {
      // 简化的 SVG 转组件实现
      const svgContent = await fs.readFile(svgPath, 'utf8')
      const componentName = this.generateComponentName(path.basename(svgPath, '.svg'))

      let componentCode = ''

      switch (framework) {
        case 'react':
          componentCode = this.generateReactComponent(svgContent, componentName)
          break
        case 'vue':
          componentCode = this.generateVueComponent(svgContent, componentName)
          break
        case 'lit':
          componentCode = this.generateLitComponent(svgContent, componentName)
          break
        default:
          throw new Error(`Unsupported framework: ${framework}`)
      }

      const outputPath = svgPath.replace('.svg', `.${framework}.tsx`)
      await fs.writeFile(outputPath, componentCode)

      this.stats.svgs.componentized++
      return outputPath
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'convert SVG to component',
      )
      throw launcherError
    }
  }

  /**
   * 优化 SVG
   */
  async optimizeSVG(svgPath: string, _options?: SVGOptimizationOptions): Promise<string> {
    try {
      const svgContent = await fs.readFile(svgPath, 'utf8')
      let optimizedSVG = svgContent

      // 基本的 SVG 优化
      optimizedSVG = optimizedSVG
        .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
        .replace(/<metadata[\s\S]*?<\/metadata>/gi, '') // 移除元数据
        .replace(/\s+/g, ' ') // 压缩空白
        .replace(/>\s+</g, '><') // 移除标签间空白
        .trim()

      const optimizedPath = svgPath.replace('.svg', '.optimized.svg')
      await fs.writeFile(optimizedPath, optimizedSVG)

      this.stats.svgs.optimized++
      return optimizedPath
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'optimize SVG',
      )
      throw launcherError
    }
  }

  /**
   * 生成 SVG 精灵图
   */
  async generateSVGSprite(svgPaths: string[], _options?: SVGSpriteOptions): Promise<string> {
    try {
      const sprites: string[] = []

      for (const svgPath of svgPaths) {
        const svgContent = await fs.readFile(svgPath, 'utf8')
        const iconId = path.basename(svgPath, '.svg').toLowerCase()

        // 简化的精灵图生成
        const symbolContent = svgContent
          .replace(/<svg[^>]*>/, `<symbol id="${iconId}">`)
          .replace(/<\/svg>/, '</symbol>')

        sprites.push(symbolContent)
      }

      const spriteContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
${sprites.join('\n')}
</svg>`

      const spritePath = path.join(path.dirname(svgPaths[0]), 'sprite.svg')
      await fs.writeFile(spritePath, spriteContent)

      this.stats.svgs.sprites++
      return spritePath
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'generate SVG sprite',
      )
      throw launcherError
    }
  }

  /**
   * 优化图片
   */
  async optimizeImages(_config: ImageOptimizationConfig): Promise<ImageProcessingResult[]> {
    try {
      const results: ImageProcessingResult[] = []

      // 这里应该扫描图片文件，简化实现
      const imagePaths = await this.findImageFiles()

      for (const imagePath of imagePaths) {
        // 简化的图片优化实现
        const result: ImageProcessingResult = {
          originalPath: imagePath,
          success: true,
          generatedFiles: [imagePath],
          compressionRatio: 0.8, // 模拟80%的压缩率
        }

        results.push(result)
        this.stats.images.optimized++
      }

      this.stats.images.total = imagePaths.length
      return results
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'optimize images',
      )
      throw launcherError
    }
  }

  /**
   * 处理所有资源
   */
  async processAssets(config: AssetConfig): Promise<AssetProcessingResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    let processedFiles = 0

    try {
      const result: AssetProcessingResult = {
        success: true,
        processedFiles: 0,
        errors,
        warnings,
        details: {},
        stats: {
          originalSize: 0,
          optimizedSize: 0,
          compressionRatio: 0,
          processingTime: 0,
        },
      }

      // 处理字体
      if (config.fonts) {
        try {
          const fontResults = await this.optimizeFonts(config.fonts)
          result.details.fonts = fontResults
          processedFiles += fontResults.length
        }
        catch (error) {
          errors.push(`Font processing failed: ${(error as Error).message}`)
        }
      }

      // 处理 SVG
      if (config.svg) {
        try {
          const svgPaths = await this.findSVGFiles()
          const svgResults: SVGProcessingResult[] = []

          for (const svgPath of svgPaths) {
            const svgResult: SVGProcessingResult = {
              svg: {
                name: path.basename(svgPath, '.svg'),
                path: svgPath,
                content: await fs.readFile(svgPath, 'utf8'),
                dimensions: { width: 24, height: 24 },
                optimized: false,
                originalSize: (await fs.stat(svgPath)).size,
              },
              success: true,
            }

            if (config.svg.optimization) {
              await this.optimizeSVG(svgPath)
              svgResult.svg.optimized = true
            }

            if (config.svg.componentGeneration) {
              svgResult.componentFile = await this.convertSVGToComponent(svgPath, 'react')
            }

            svgResults.push(svgResult)
          }

          result.details.svgs = svgResults
          processedFiles += svgResults.length
        }
        catch (error) {
          errors.push(`SVG processing failed: ${(error as Error).message}`)
        }
      }

      // 处理图片
      if (config.images) {
        try {
          const imageResults = await this.optimizeImages(config.images)
          result.details.images = imageResults
          processedFiles += imageResults.length
        }
        catch (error) {
          errors.push(`Image processing failed: ${(error as Error).message}`)
        }
      }

      result.processedFiles = processedFiles
      result.success = errors.length === 0
      result.stats.processingTime = Date.now() - startTime

      return result
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'process assets',
      )
      throw launcherError
    }
  }

  /**
   * 验证资源配置
   */
  validateConfig(config: AssetConfig): boolean {
    try {
      // 基本的配置验证
      if (config.fonts && config.fonts.formats) {
        const validFormats = ['woff2', 'woff', 'ttf', 'otf', 'eot']
        for (const format of config.fonts.formats) {
          if (!validFormats.includes(format)) {
            return false
          }
        }
      }

      return true
    }
    catch {
      return false
    }
  }

  /**
   * 获取资源统计
   */
  getStats(): AssetStats {
    return { ...this.stats }
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.stats = {
      fonts: { total: 0, optimized: 0, totalSize: 0, optimizedSize: 0 },
      svgs: { total: 0, optimized: 0, componentized: 0, sprites: 0 },
      images: { total: 0, optimized: 0, totalSize: 0, optimizedSize: 0 },
    }
  }

  /**
   * 查找字体文件
   */
  private async findFontFiles(): Promise<string[]> {
    // 简化实现，实际应该递归扫描目录
    return []
  }

  /**
   * 查找 SVG 文件
   */
  private async findSVGFiles(): Promise<string[]> {
    // 简化实现，实际应该递归扫描目录
    return []
  }

  /**
   * 查找图片文件
   */
  private async findImageFiles(): Promise<string[]> {
    // 简化实现，实际应该递归扫描目录
    return []
  }

  /**
   * 生成组件名称
   */
  private generateComponentName(name: string): string {
    return name
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Icon'
  }

  /**
   * 生成 React 组件
   */
  private generateReactComponent(svgContent: string, componentName: string): string {
    const cleanSVG = svgContent
      .replace(/<svg[^>]*>/, '<svg {...props}>')
      .replace(/class=/g, 'className=')

    return `import React from 'react'

interface Props extends React.SVGProps<SVGSVGElement> {}

const ${componentName} = (props: Props) => (
  ${cleanSVG}
)

export default ${componentName}
`
  }

  /**
   * 生成 Vue 组件
   */
  private generateVueComponent(svgContent: string, componentName: string): string {
    return `<template>
  ${svgContent}
</template>

<script lang="ts">
export default {
  name: '${componentName}'
}
</script>
`
  }

  /**
   * 生成 Lit 组件
   */
  private generateLitComponent(svgContent: string, componentName: string): string {
    return `import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('${componentName.toLowerCase()}')
export class ${componentName} extends LitElement {
  render() {
    return html\`${svgContent}\`
  }
}
`
  }
}

/**
 * 默认资源管理器实例
 */
export const assetManager = new AssetManager()
