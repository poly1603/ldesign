/**
 * 字体转换插件
 * 
 * 将特殊字体转换为 WebFont，支持字体子集化和优化
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

export interface FontConverterOptions {
  /** 字体源目录 */
  sourceDir?: string
  /** 输出目录 */
  outputDir?: string
  /** 支持的字体格式 */
  formats?: ('woff' | 'woff2' | 'ttf' | 'eot')[]
  /** 是否启用字体子集化 */
  subset?: boolean
  /** 子集化文本（如果不指定，会自动分析项目中使用的字符） */
  subsetText?: string
  /** 是否生成 CSS 文件 */
  generateCSS?: boolean
  /** CSS 文件名 */
  cssFileName?: string
  /** 字体显示策略 */
  fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  /** 是否启用字体压缩 */
  compress?: boolean
  /** 字体族名称映射 */
  fontFamilyMap?: Record<string, string>
}

export interface FontInfo {
  /** 原始文件名 */
  originalName: string
  /** 字体族名称 */
  familyName: string
  /** 字体样式 */
  style: 'normal' | 'italic'
  /** 字体粗细 */
  weight: number
  /** 生成的文件 */
  generatedFiles: Array<{
    format: string
    path: string
    size: number
  }>
}

export class FontConverter {
  private logger: Logger
  private options: Required<FontConverterOptions>

  constructor(options: FontConverterOptions = {}) {
    this.logger = new Logger('FontConverter')
    this.options = {
      sourceDir: './src/assets/fonts',
      outputDir: './public/fonts',
      formats: ['woff2', 'woff'],
      subset: true,
      subsetText: '',
      generateCSS: true,
      cssFileName: 'fonts.css',
      fontDisplay: 'swap',
      compress: true,
      fontFamilyMap: {},
      ...options
    }
  }

  /**
   * 转换字体
   */
  async convertFonts(): Promise<FontInfo[]> {
    this.logger.info('开始字体转换...')

    try {
      // 确保输出目录存在
      await fs.mkdir(this.options.outputDir, { recursive: true })

      // 扫描字体文件
      const fontFiles = await this.scanFontFiles()
      
      if (fontFiles.length === 0) {
        this.logger.warn('未找到字体文件')
        return []
      }

      this.logger.info(`找到 ${fontFiles.length} 个字体文件`)

      // 分析项目中使用的字符（如果启用子集化）
      let subsetText = this.options.subsetText
      if (this.options.subset && !subsetText) {
        subsetText = await this.analyzeUsedCharacters()
      }

      // 转换每个字体文件
      const fontInfos: FontInfo[] = []
      for (const fontFile of fontFiles) {
        const fontInfo = await this.convertSingleFont(fontFile, subsetText)
        if (fontInfo) {
          fontInfos.push(fontInfo)
        }
      }

      // 生成 CSS 文件
      if (this.options.generateCSS) {
        await this.generateCSSFile(fontInfos)
      }

      this.logger.success(`字体转换完成，共处理 ${fontInfos.length} 个字体`)
      return fontInfos

    } catch (error) {
      this.logger.error('字体转换失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 扫描字体文件
   */
  private async scanFontFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.options.sourceDir)
      return files.filter(file => 
        /\.(ttf|otf|woff|woff2)$/i.test(file)
      ).map(file => path.join(this.options.sourceDir, file))
    } catch {
      return []
    }
  }

  /**
   * 转换单个字体文件
   */
  private async convertSingleFont(fontPath: string, subsetText: string): Promise<FontInfo | null> {
    try {
      const fontName = path.basename(fontPath, path.extname(fontPath))
      const fontInfo = await this.extractFontInfo(fontPath)
      
      this.logger.debug(`转换字体: ${fontName}`)

      const generatedFiles: Array<{ format: string; path: string; size: number }> = []

      // 为每种格式生成字体文件
      for (const format of this.options.formats) {
        const outputPath = path.join(this.options.outputDir, `${fontName}.${format}`)
        
        try {
          await this.convertToFormat(fontPath, outputPath, format, subsetText)
          const stats = await fs.stat(outputPath)
          
          generatedFiles.push({
            format,
            path: outputPath,
            size: stats.size
          })

          this.logger.debug(`生成 ${format} 格式: ${(stats.size / 1024).toFixed(2)}KB`)
        } catch (error) {
          this.logger.warn(`转换 ${format} 格式失败`, { error: (error as Error).message })
        }
      }

      return {
        originalName: fontName,
        familyName: this.options.fontFamilyMap[fontName] || fontInfo.familyName,
        style: fontInfo.style,
        weight: fontInfo.weight,
        generatedFiles
      }

    } catch (error) {
      this.logger.error(`转换字体失败: ${fontPath}`, { error: (error as Error).message })
      return null
    }
  }

  /**
   * 转换为指定格式
   */
  private async convertToFormat(
    inputPath: string, 
    outputPath: string, 
    format: string, 
    subsetText: string
  ): Promise<void> {
    // 这里使用 fonttools 或类似工具进行转换
    // 实际项目中需要安装相应的字体处理工具
    
    let command = ''
    
    if (this.options.subset && subsetText) {
      // 使用 pyftsubset 进行子集化
      command = `pyftsubset "${inputPath}" --text="${subsetText}" --output-file="${outputPath}" --flavor=${format}`
    } else {
      // 简单格式转换
      switch (format) {
        case 'woff2':
          command = `woff2_compress "${inputPath}"`
          break
        case 'woff':
          command = `ttf2woff "${inputPath}" "${outputPath}"`
          break
        default:
          // 直接复制
          await fs.copyFile(inputPath, outputPath)
          return
      }
    }

    if (command) {
      try {
        execSync(command, { stdio: 'pipe' })
      } catch (error) {
        // 如果命令行工具不可用，使用备用方案
        await this.fallbackConversion(inputPath, outputPath, format)
      }
    }
  }

  /**
   * 备用转换方案
   */
  private async fallbackConversion(inputPath: string, outputPath: string, format: string): Promise<void> {
    // 如果没有专业工具，至少复制文件
    if (format === path.extname(inputPath).slice(1)) {
      await fs.copyFile(inputPath, outputPath)
    } else {
      this.logger.warn(`无法转换为 ${format} 格式，需要安装字体转换工具`)
    }
  }

  /**
   * 提取字体信息
   */
  private async extractFontInfo(fontPath: string): Promise<{
    familyName: string
    style: 'normal' | 'italic'
    weight: number
  }> {
    // 简化版本，实际项目中可以使用 opentype.js 等库解析字体
    const fontName = path.basename(fontPath, path.extname(fontPath))
    
    return {
      familyName: fontName.replace(/[-_]/g, ' '),
      style: /italic/i.test(fontName) ? 'italic' : 'normal',
      weight: this.extractWeight(fontName)
    }
  }

  /**
   * 提取字体粗细
   */
  private extractWeight(fontName: string): number {
    const weightMap: Record<string, number> = {
      'thin': 100,
      'extralight': 200,
      'light': 300,
      'regular': 400,
      'medium': 500,
      'semibold': 600,
      'bold': 700,
      'extrabold': 800,
      'black': 900
    }

    const lowerName = fontName.toLowerCase()
    for (const [key, weight] of Object.entries(weightMap)) {
      if (lowerName.includes(key)) {
        return weight
      }
    }

    return 400 // 默认 regular
  }

  /**
   * 分析项目中使用的字符
   */
  private async analyzeUsedCharacters(): Promise<string> {
    try {
      const sourceFiles = await this.findSourceFiles()
      const characters = new Set<string>()

      for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf8')
        // 提取中文字符和常用字符
        const matches = content.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g)
        if (matches) {
          matches.forEach(char => characters.add(char))
        }
      }

      // 添加常用字符
      const commonChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:()[]{}"\'-+='
      commonChars.split('').forEach(char => characters.add(char))

      const result = Array.from(characters).join('')
      this.logger.debug(`分析到 ${characters.size} 个字符`)
      
      return result

    } catch (error) {
      this.logger.warn('分析字符失败，使用默认字符集', { error: (error as Error).message })
      return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    }
  }

  /**
   * 查找源文件
   */
  private async findSourceFiles(): Promise<string[]> {
    const extensions = ['.vue', '.jsx', '.tsx', '.js', '.ts', '.html']
    const files: string[] = []

    const scanDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanDir(fullPath)
          } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath)
          }
        }
      } catch {
        // 忽略无法访问的目录
      }
    }

    await scanDir('./src')
    return files
  }

  /**
   * 生成 CSS 文件
   */
  private async generateCSSFile(fontInfos: FontInfo[]): Promise<void> {
    let css = '/* Auto-generated font CSS */\n\n'

    for (const fontInfo of fontInfos) {
      css += this.generateFontFaceCSS(fontInfo)
      css += '\n'
    }

    // 添加字体族定义
    const fontFamilies = [...new Set(fontInfos.map(f => f.familyName))]
    if (fontFamilies.length > 0) {
      css += '/* Font family utilities */\n'
      fontFamilies.forEach(family => {
        const className = family.toLowerCase().replace(/\s+/g, '-')
        css += `.font-${className} {\n  font-family: "${family}", sans-serif;\n}\n\n`
      })
    }

    const cssPath = path.join(this.options.outputDir, this.options.cssFileName)
    await fs.writeFile(cssPath, css)
    
    this.logger.info(`CSS 文件已生成: ${cssPath}`)
  }

  /**
   * 生成 @font-face CSS
   */
  private generateFontFaceCSS(fontInfo: FontInfo): string {
    const { familyName, style, weight, generatedFiles } = fontInfo
    
    let css = `@font-face {\n`
    css += `  font-family: "${familyName}";\n`
    css += `  font-style: ${style};\n`
    css += `  font-weight: ${weight};\n`
    css += `  font-display: ${this.options.fontDisplay};\n`
    
    // 生成 src 属性
    const sources: string[] = []
    
    // 按优先级排序格式
    const formatPriority = ['woff2', 'woff', 'ttf', 'eot']
    const sortedFiles = generatedFiles.sort((a, b) => 
      formatPriority.indexOf(a.format) - formatPriority.indexOf(b.format)
    )
    
    for (const file of sortedFiles) {
      const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/')
      const format = file.format === 'ttf' ? 'truetype' : file.format
      sources.push(`url("/${relativePath}") format("${format}")`)
    }
    
    css += `  src: ${sources.join(',\n       ')};\n`
    css += `}`
    
    return css
  }
}

/**
 * 创建字体转换插件
 */
export function createFontConverterPlugin(options: FontConverterOptions = {}): Plugin {
  const converter = new FontConverter(options)
  
  return {
    name: 'font-converter',
    
    async buildStart() {
      if (process.env.NODE_ENV === 'development' || process.env.CONVERT_FONTS === 'true') {
        await converter.convertFonts()
      }
    },
    
    configureServer(server) {
      // 在开发模式下监听字体文件变化
      const fontDir = options.sourceDir || './src/assets/fonts'
      
      server.watcher.add(fontDir)
      server.watcher.on('change', async (file) => {
        if (/\.(ttf|otf|woff|woff2)$/i.test(file)) {
          console.log('字体文件变更，重新转换...')
          await converter.convertFonts()
        }
      })
    }
  }
}
