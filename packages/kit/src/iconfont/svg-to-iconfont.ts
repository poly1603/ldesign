/**
 * SVG 到 IconFont 转换器
 * 主要的转换逻辑和配置管理
 */

import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { CssGenerator } from './css-generator'
import { IconFontGenerator } from './iconfont-generator'

/**
 * SVG 图标信息
 */
export interface SvgIcon {
  name: string
  path: string
  content: string
  unicode: string
  metadata?: Record<string, any>
}

/**
 * IconFont 配置选项
 */
export interface IconFontOptions {
  fontName: string
  fontFamily?: string
  className?: string
  cssPrefix?: string
  outputDir: string
  formats?: ('ttf' | 'woff' | 'woff2' | 'eot' | 'svg')[]
  startUnicode?: number
  normalize?: boolean
  fontHeight?: number
  descent?: number
  metadata?: {
    title?: string
    description?: string
    url?: string
    author?: string
    license?: string
    version?: string
  }
  cssOptions?: {
    generateScss?: boolean
    generateLess?: boolean
    generateStylus?: boolean
    baseSelector?: string
    classPrefix?: string
  }
}

/**
 * 转换结果
 */
export interface ConversionResult {
  success: boolean
  fontFiles: string[]
  cssFiles: string[]
  icons: SvgIcon[]
  errors: Error[]
  duration: number
  timestamp: Date
}

/**
 * SVG 到 IconFont 转换器类
 */
export class SvgToIconFont extends EventEmitter {
  private options: Required<IconFontOptions>
  private generator: IconFontGenerator
  private cssGenerator: CssGenerator

  constructor(options: IconFontOptions) {
    super()

    this.options = {
      fontName: options.fontName,
      fontFamily: options.fontFamily || options.fontName,
      className: options.className || options.fontName.toLowerCase(),
      cssPrefix: options.cssPrefix || 'icon-',
      outputDir: options.outputDir,
      formats: options.formats || ['ttf', 'woff', 'woff2', 'eot', 'svg'],
      startUnicode: options.startUnicode || 0xE001,
      normalize: options.normalize !== false,
      fontHeight: options.fontHeight || 1000,
      descent: options.descent || 200,
      metadata: options.metadata || {},
      cssOptions: {
        generateScss: options.cssOptions?.generateScss !== false,
        generateLess: options.cssOptions?.generateLess !== false,
        generateStylus: options.cssOptions?.generateStylus !== false,
        baseSelector:
          options.cssOptions?.baseSelector
          || `.${options.className || options.fontName.toLowerCase()}`,
        classPrefix: options.cssOptions?.classPrefix || options.cssPrefix || 'icon-',
      },
    }

    this.generator = new IconFontGenerator(this.options)
    this.cssGenerator = new CssGenerator(this.options)

    this.setupEventListeners()
  }

  /**
   * 从目录转换 SVG 文件
   */
  async convertFromDirectory(svgDir: string): Promise<ConversionResult> {
    const startTime = Date.now()
    const result: ConversionResult = {
      success: false,
      fontFiles: [],
      cssFiles: [],
      icons: [],
      errors: [],
      duration: 0,
      timestamp: new Date(),
    }

    try {
      this.emit('conversionStarted', { source: svgDir })

      // 扫描 SVG 文件
      const svgFiles = await this.scanSvgFiles(svgDir)
      this.emit('svgFilesScanned', { count: svgFiles.length, files: svgFiles })

      // 加载 SVG 图标
      result.icons = await this.loadSvgIcons(svgFiles)
      this.emit('iconsLoaded', { count: result.icons.length })

      // 生成字体文件
      result.fontFiles = await this.generator.generateFonts(result.icons)
      this.emit('fontsGenerated', { files: result.fontFiles })

      // 生成 CSS 文件
      result.cssFiles = await this.cssGenerator.generateCss(result.icons, result.fontFiles)
      this.emit('cssGenerated', { files: result.cssFiles })

      result.success = true
    }
    catch (error) {
      result.errors.push(error as Error)
      this.emit('conversionError', error)
    }

    result.duration = Date.now() - startTime
    this.emit('conversionCompleted', result)

    return result
  }

  /**
   * 从文件列表转换 SVG
   */
  async convertFromFiles(svgFiles: string[]): Promise<ConversionResult> {
    const startTime = Date.now()
    const result: ConversionResult = {
      success: false,
      fontFiles: [],
      cssFiles: [],
      icons: [],
      errors: [],
      duration: 0,
      timestamp: new Date(),
    }

    try {
      this.emit('conversionStarted', { source: 'files', count: svgFiles.length })

      // 加载 SVG 图标
      result.icons = await this.loadSvgIcons(svgFiles)
      this.emit('iconsLoaded', { count: result.icons.length })

      // 生成字体文件
      result.fontFiles = await this.generator.generateFonts(result.icons)
      this.emit('fontsGenerated', { files: result.fontFiles })

      // 生成 CSS 文件
      result.cssFiles = await this.cssGenerator.generateCss(result.icons, result.fontFiles)
      this.emit('cssGenerated', { files: result.cssFiles })

      result.success = true
    }
    catch (error) {
      result.errors.push(error as Error)
      this.emit('conversionError', error)
    }

    result.duration = Date.now() - startTime
    this.emit('conversionCompleted', result)

    return result
  }

  /**
   * 添加单个 SVG 图标
   */
  async addIcon(iconPath: string, iconName?: string): Promise<SvgIcon> {
    const name = iconName || basename(iconPath, extname(iconPath))
    const content = await fs.readFile(iconPath, 'utf8')
    const unicode = String.fromCharCode(this.options.startUnicode + this.getNextUnicodeIndex())

    const icon: SvgIcon = {
      name,
      path: iconPath,
      content,
      unicode,
    }

    this.emit('iconAdded', icon)
    return icon
  }

  /**
   * 预览生成的图标
   */
  async generatePreview(icons: SvgIcon[]): Promise<string> {
    return this.cssGenerator.generatePreviewHtml(icons)
  }

  /**
   * 获取支持的字体格式
   */
  getSupportedFormats(): string[] {
    return ['ttf', 'woff', 'woff2', 'eot', 'svg']
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<IconFontOptions>): void {
    this.options = { ...this.options, ...options } as Required<IconFontOptions>
    this.generator.updateOptions(this.options)
    this.cssGenerator.updateOptions(this.options)
    this.emit('optionsUpdated', this.options)
  }

  /**
   * 获取当前配置
   */
  getOptions(): Required<IconFontOptions> {
    return { ...this.options }
  }

  // 私有方法

  private setupEventListeners(): void {
    this.generator.on('fontGenerated', (data) => {
      this.emit('fontGenerated', data)
    })

    this.generator.on('error', (error) => {
      this.emit('generatorError', error)
    })

    this.cssGenerator.on('cssGenerated', (data) => {
      this.emit('cssFileGenerated', data)
    })

    this.cssGenerator.on('error', (error) => {
      this.emit('cssGeneratorError', error)
    })
  }

  private async scanSvgFiles(dir: string): Promise<string[]> {
    const files: string[] = []

    const scan = async (currentDir: string): Promise<void> => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = resolve(currentDir, entry.name)

        if (entry.isDirectory()) {
          await scan(fullPath)
        }
        else if (entry.isFile() && extname(entry.name).toLowerCase() === '.svg') {
          files.push(fullPath)
        }
      }
    }

    await scan(dir)
    return files
  }

  private async loadSvgIcons(svgFiles: string[]): Promise<SvgIcon[]> {
    const icons: SvgIcon[] = []
    let unicodeIndex = 0

    for (const filePath of svgFiles) {
      try {
        const name = basename(filePath, extname(filePath))
        const content = await fs.readFile(filePath, 'utf8')
        const unicode = String.fromCharCode(this.options.startUnicode + unicodeIndex++)

        icons.push({
          name,
          path: filePath,
          content,
          unicode,
        })
      }
      catch (error) {
        this.emit('iconLoadError', { file: filePath, error })
      }
    }

    return icons
  }

  private getNextUnicodeIndex(): number {
    // 这里需要实现 Unicode 索引管理逻辑
    return 0
  }

  /**
   * 创建 SVG 到 IconFont 转换器实例
   */
  static create(options: IconFontOptions): SvgToIconFont {
    return new SvgToIconFont(options)
  }
}
