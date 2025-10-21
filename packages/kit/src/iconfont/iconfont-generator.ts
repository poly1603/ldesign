/**
 * IconFont 字体生成器
 * 负责将 SVG 图标转换为各种字体格式
 */

import type { IconFontOptions, SvgIcon } from './svg-to-iconfont'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { Readable } from 'node:stream'
import svg2ttf from 'svg2ttf'
import * as svgicons2svgfont from 'svgicons2svgfont'
import ttf2eot from 'ttf2eot'
import ttf2woff from 'ttf2woff'
import ttf2woff2 from 'ttf2woff2'
import { FileSystem } from '../filesystem'

// 兼容 CommonJS 和 ESM 导入
const SVGIcons2SVGFontStream = (svgicons2svgfont as any).SVGIcons2SVGFontStream || (svgicons2svgfont as any).default?.SVGIcons2SVGFontStream || svgicons2svgfont

/**
 * 字体生成结果
 */
export interface FontGenerationResult {
  format: string
  filePath: string
  buffer: Buffer
  size: number
}

/**
 * IconFont 生成器类
 */
export class IconFontGenerator extends EventEmitter {
  private options: Required<IconFontOptions>

  constructor(options: Required<IconFontOptions>) {
    super()
    this.options = options
  }

  /**
   * 生成所有格式的字体文件
   */
  async generateFonts(icons: SvgIcon[]): Promise<string[]> {
    const generatedFiles: string[] = []

    try {
      // 确保输出目录存在
      await FileSystem.ensureDir(this.options.outputDir)

      // 生成 SVG 字体
      const svgBuffer = await this.generateSvgFont(icons)

      // 生成 TTF 字体
      const ttfBuffer = this.generateTtfFont(svgBuffer)

      // 根据配置生成其他格式
      for (const format of this.options.formats) {
        const result = await this.generateFontFormat(format, svgBuffer, ttfBuffer)
        if (result) {
          generatedFiles.push(result.filePath)
          this.emit('fontGenerated', result)
        }
      }
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }

    return generatedFiles
  }

  /**
   * 生成 SVG 字体
   */
  private async generateSvgFont(icons: SvgIcon[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const fontStream = new SVGIcons2SVGFontStream({
        fontName: this.options.fontName,
        fontHeight: this.options.fontHeight,
        descent: this.options.descent,
        normalize: this.options.normalize,
        metadata: JSON.stringify(this.options.metadata),
      })

      const chunks: Buffer[] = []

      fontStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      fontStream.on('end', () => {
        resolve(Buffer.concat(chunks))
      })

      fontStream.on('error', reject)

      // 添加图标到字体流
      icons.forEach((icon) => {
        const glyph = new Readable()
        glyph.push(icon.content)
        glyph.push(null)

          // 设置字形属性
          ; (glyph as any).metadata = {
            unicode: [icon.unicode],
            name: icon.name,
          }

        fontStream.write(glyph)
      })

      fontStream.end()
    })
  }

  /**
   * 生成 TTF 字体
   */
  private generateTtfFont(svgBuffer: Buffer): Buffer {
    const ttf = svg2ttf(svgBuffer.toString(), {
      ts: Date.now(),
      description: this.options.metadata.description || '',
      url: this.options.metadata.url || '',
      version: this.options.metadata.version || '1.0.0',
    })

    return Buffer.from(ttf.buffer)
  }

  /**
   * 生成指定格式的字体文件
   */
  private async generateFontFormat(
    format: string,
    svgBuffer: Buffer,
    ttfBuffer: Buffer,
  ): Promise<FontGenerationResult | null> {
    let buffer: Buffer
    let fileName: string

    switch (format) {
      case 'svg':
        buffer = svgBuffer
        fileName = `${this.options.fontName}.svg`
        break

      case 'ttf':
        buffer = ttfBuffer
        fileName = `${this.options.fontName}.ttf`
        break

      case 'eot':
        buffer = Buffer.from(ttf2eot(ttfBuffer).buffer)
        fileName = `${this.options.fontName}.eot`
        break

      case 'woff':
        buffer = Buffer.from(ttf2woff(ttfBuffer).buffer)
        fileName = `${this.options.fontName}.woff`
        break

      case 'woff2':
        buffer = ttf2woff2(ttfBuffer)
        fileName = `${this.options.fontName}.woff2`
        break

      default:
        this.emit('error', new Error(`Unsupported font format: ${format}`))
        return null
    }

    const filePath = resolve(this.options.outputDir, fileName)
    await fs.writeFile(filePath, buffer)

    return {
      format,
      filePath,
      buffer,
      size: buffer.length,
    }
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Required<IconFontOptions>): void {
    this.options = options
    this.emit('optionsUpdated', options)
  }

  /**
   * 获取字体信息
   */
  async getFontInfo(fontPath: string): Promise<{
    format: string
    size: number
    glyphCount?: number
  }> {
    const stats = await fs.stat(fontPath)
    const format = fontPath.split('.').pop() || 'unknown'

    return {
      format,
      size: stats.size,
    }
  }

  /**
   * 验证 SVG 内容
   */
  validateSvgContent(content: string): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
    }

    // 基本 SVG 格式检查
    if (!content.includes('<svg')) {
      result.valid = false
      result.errors.push('Invalid SVG format: missing <svg> tag')
    }

    if (!content.includes('</svg>')) {
      result.valid = false
      result.errors.push('Invalid SVG format: missing closing </svg> tag')
    }

    // 检查是否包含路径或形状
    const hasPath
      = content.includes('<path')
      || content.includes('<circle')
      || content.includes('<rect')
      || content.includes('<polygon')
      || content.includes('<polyline')
      || content.includes('<ellipse')
      || content.includes('<line')

    if (!hasPath) {
      result.warnings.push('SVG does not contain any visible shapes')
    }

    // 检查是否有填充色
    if (content.includes('fill=') && !content.includes('fill="currentColor"')) {
      result.warnings.push(
        'SVG contains fill colors, consider using currentColor for better icon font compatibility',
      )
    }

    return result
  }

  /**
   * 优化 SVG 内容
   */
  optimizeSvgContent(content: string): string {
    // 移除不必要的属性和元素
    let optimized = content
      .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
      .replace(/\s+/g, ' ') // 压缩空白字符
      .replace(/>\s+</g, '><') // 移除标签间的空白
      .trim()

    // 移除不必要的属性
    const unnecessaryAttrs = ['id=', 'class=', 'style=', 'xmlns:', 'xml:', 'data-']

    unnecessaryAttrs.forEach((attr) => {
      const regex = new RegExp(`\\s${attr}[^\\s>]*`, 'g')
      optimized = optimized.replace(regex, '')
    })

    return optimized
  }

  /**
   * 获取字体生成统计信息
   */
  getGenerationStats(): {
    supportedFormats: string[]
    lastGeneration?: {
      iconCount: number
      fileCount: number
      totalSize: number
      duration: number
    }
  } {
    return {
      supportedFormats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
    }
  }

  /**
   * 创建字体生成器实例
   */
  static create(options: Required<IconFontOptions>): IconFontGenerator {
    return new IconFontGenerator(options)
  }
}
