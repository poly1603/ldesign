/**
 * CSS 样式生成器
 * 负责生成 IconFont 的 CSS/SCSS/Less 样式文件
 */

import type { IconFontOptions, SvgIcon } from './svg-to-iconfont'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { basename, resolve } from 'node:path'
import { FileSystem } from '../filesystem'

/**
 * CSS 生成结果
 */
export interface CssGenerationResult {
  type: 'css' | 'scss' | 'less' | 'stylus' | 'html'
  filePath: string
  content: string
  size: number
}

/**
 * CSS 生成器类
 */
export class CssGenerator extends EventEmitter {
  private options: Required<IconFontOptions>

  constructor(options: Required<IconFontOptions>) {
    super()
    this.options = options
  }

  /**
   * 生成所有样式文件
   */
  async generateCss(icons: SvgIcon[], fontFiles: string[]): Promise<string[]> {
    const generatedFiles: string[] = []

    try {
      // 确保输出目录存在
      await FileSystem.ensureDir(this.options.outputDir)

      // 生成基础 CSS
      const cssResult = await this.generateBaseCss(icons, fontFiles)
      generatedFiles.push(cssResult.filePath)
      this.emit('cssGenerated', cssResult)

      // 根据配置生成其他格式
      if (this.options.cssOptions.generateScss) {
        const scssResult = await this.generateScss(icons, fontFiles)
        generatedFiles.push(scssResult.filePath)
        this.emit('cssGenerated', scssResult)
      }

      if (this.options.cssOptions.generateLess) {
        const lessResult = await this.generateLess(icons, fontFiles)
        generatedFiles.push(lessResult.filePath)
        this.emit('cssGenerated', lessResult)
      }

      if (this.options.cssOptions.generateStylus) {
        const stylusResult = await this.generateStylus(icons, fontFiles)
        generatedFiles.push(stylusResult.filePath)
        this.emit('cssGenerated', stylusResult)
      }
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }

    return generatedFiles
  }

  /**
   * 生成基础 CSS
   */
  private async generateBaseCss(
    icons: SvgIcon[],
    fontFiles: string[],
  ): Promise<CssGenerationResult> {
    const content = this.buildCssContent(icons, fontFiles)
    const fileName = `${this.options.fontName}.css`
    const filePath = resolve(this.options.outputDir, fileName)

    await fs.writeFile(filePath, content, 'utf8')

    return {
      type: 'css',
      filePath,
      content,
      size: Buffer.byteLength(content, 'utf8'),
    }
  }

  /**
   * 生成 SCSS
   */
  private async generateScss(icons: SvgIcon[], fontFiles: string[]): Promise<CssGenerationResult> {
    const content = this.buildScssContent(icons, fontFiles)
    const fileName = `${this.options.fontName}.scss`
    const filePath = resolve(this.options.outputDir, fileName)

    await fs.writeFile(filePath, content, 'utf8')

    return {
      type: 'scss',
      filePath,
      content,
      size: Buffer.byteLength(content, 'utf8'),
    }
  }

  /**
   * 生成 Less
   */
  private async generateLess(icons: SvgIcon[], fontFiles: string[]): Promise<CssGenerationResult> {
    const content = this.buildLessContent(icons, fontFiles)
    const fileName = `${this.options.fontName}.less`
    const filePath = resolve(this.options.outputDir, fileName)

    await fs.writeFile(filePath, content, 'utf8')

    return {
      type: 'less',
      filePath,
      content,
      size: Buffer.byteLength(content, 'utf8'),
    }
  }

  /**
   * 生成 Stylus
   */
  private async generateStylus(
    icons: SvgIcon[],
    fontFiles: string[],
  ): Promise<CssGenerationResult> {
    const content = this.buildStylusContent(icons, fontFiles)
    const fileName = `${this.options.fontName}.styl`
    const filePath = resolve(this.options.outputDir, fileName)

    await fs.writeFile(filePath, content, 'utf8')

    return {
      type: 'stylus',
      filePath,
      content,
      size: Buffer.byteLength(content, 'utf8'),
    }
  }

  /**
   * 生成预览 HTML
   */
  async generatePreviewHtml(icons: SvgIcon[]): Promise<string> {
    const htmlContent = this.buildPreviewHtml(icons)
    const fileName = `${this.options.fontName}-preview.html`
    const filePath = resolve(this.options.outputDir, fileName)

    await fs.writeFile(filePath, htmlContent, 'utf8')

    return filePath
  }

  /**
   * 构建 CSS 内容
   */
  private buildCssContent(icons: SvgIcon[], fontFiles: string[]): string {
    const fontFace = this.buildFontFace(fontFiles)
    const baseClass = this.buildBaseClass()
    const iconClasses = this.buildIconClasses(icons)

    return `${fontFace}\n\n${baseClass}\n\n${iconClasses}`
  }

  /**
   * 构建 SCSS 内容
   */
  private buildScssContent(icons: SvgIcon[], fontFiles: string[]): string {
    const variables = this.buildScssVariables()
    const fontFace = this.buildFontFace(fontFiles)
    const baseClass = this.buildBaseClass()
    const iconClasses = this.buildIconClasses(icons)

    return `${variables}\n\n${fontFace}\n\n${baseClass}\n\n${iconClasses}`
  }

  /**
   * 构建 Less 内容
   */
  private buildLessContent(icons: SvgIcon[], fontFiles: string[]): string {
    const variables = this.buildLessVariables()
    const fontFace = this.buildFontFace(fontFiles)
    const baseClass = this.buildBaseClass()
    const iconClasses = this.buildIconClasses(icons)

    return `${variables}\n\n${fontFace}\n\n${baseClass}\n\n${iconClasses}`
  }

  /**
   * 构建 Stylus 内容
   */
  private buildStylusContent(icons: SvgIcon[], fontFiles: string[]): string {
    const variables = this.buildStylusVariables()
    const fontFace = this.buildStylusFontFace(fontFiles)
    const baseClass = this.buildStylusBaseClass()
    const iconClasses = this.buildStylusIconClasses(icons)

    return `${variables}\n\n${fontFace}\n\n${baseClass}\n\n${iconClasses}`
  }

  /**
   * 构建字体声明
   */
  private buildFontFace(fontFiles: string[]): string {
    const fontUrls = fontFiles
      .map((file) => {
        const fileName = basename(file)
        const format = this.getFontFormat(fileName)
        return `url('./${fileName}') format('${format}')`
      })
      .join(',\n    ')

    return `@font-face {
  font-family: '${this.options.fontFamily}';
  src: ${fontUrls};
  font-weight: normal;
  font-style: normal;
  font-display: block;
}`
  }

  /**
   * 构建基础类
   */
  private buildBaseClass(): string {
    return `${this.options.cssOptions.baseSelector} {
  font-family: '${this.options.fontFamily}' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
  }

  /**
   * 构建图标类
   */
  private buildIconClasses(icons: SvgIcon[]): string {
    return icons
      .map((icon) => {
        const className = `${this.options.cssOptions.classPrefix}${icon.name}`
        const unicode = `\\${icon.unicode.charCodeAt(0).toString(16)}`

        return `${this.options.cssOptions.baseSelector}.${className}:before {
  content: "${unicode}";
}`
      })
      .join('\n\n')
  }

  /**
   * 构建 SCSS 变量
   */
  private buildScssVariables(): string {
    return `$${this.options.fontName}-font-family: '${this.options.fontFamily}';
$${this.options.fontName}-prefix: '${this.options.cssOptions.classPrefix}';`
  }

  /**
   * 构建 Less 变量
   */
  private buildLessVariables(): string {
    return `@${this.options.fontName}-font-family: '${this.options.fontFamily}';
@${this.options.fontName}-prefix: '${this.options.cssOptions.classPrefix}';`
  }

  /**
   * 构建 Stylus 变量
   */
  private buildStylusVariables(): string {
    return `${this.options.fontName}-font-family = '${this.options.fontFamily}'
${this.options.fontName}-prefix = '${this.options.cssOptions.classPrefix}'`
  }

  /**
   * 构建 Stylus 字体声明
   */
  private buildStylusFontFace(fontFiles: string[]): string {
    const fontUrls = fontFiles
      .map((file) => {
        const fileName = basename(file)
        const format = this.getFontFormat(fileName)
        return `url('./${fileName}') format('${format}')`
      })
      .join(',\n    ')

    return `@font-face
  font-family: ${this.options.fontName}-font-family
  src: ${fontUrls}
  font-weight: normal
  font-style: normal
  font-display: block`
  }

  /**
   * 构建 Stylus 基础类
   */
  private buildStylusBaseClass(): string {
    const baseSel = (this.options.cssOptions?.baseSelector ?? '').replace('.', '')
    return `${baseSel}
  font-family: ${this.options.fontName}-font-family !important
  speak: never
  font-style: normal
  font-weight: normal
  font-variant: normal
  text-transform: none
  line-height: 1
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale`
  }

  /**
   * 构建 Stylus 图标类
   */
  private buildStylusIconClasses(icons: SvgIcon[]): string {
    return icons
      .map((icon) => {
        const className = `${this.options.cssOptions.classPrefix}${icon.name}`
        const unicode = `\\${icon.unicode.charCodeAt(0).toString(16)}`

        const baseSel = (this.options.cssOptions?.baseSelector ?? '').replace('.', '')
        return `${baseSel}.${className}:before
  content: "${unicode}"`
      })
      .join('\n\n')
  }

  /**
   * 构建预览 HTML
   */
  private buildPreviewHtml(icons: SvgIcon[]): string {
    const iconItems = icons
      .map((icon) => {
        const className = `${this.options.cssOptions.classPrefix}${icon.name}`
        return `    <div class="icon-item">
      <i class="${this.options.className} ${className}"></i>
      <span class="icon-name">${icon.name}</span>
      <span class="icon-unicode">\\${icon.unicode.charCodeAt(0).toString(16)}</span>
    </div>`
      })
      .join('\n')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.options.fontName} Icon Font Preview</title>
  <link rel="stylesheet" href="./${this.options.fontName}.css">
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { margin-bottom: 30px; }
    .icon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .icon-item { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .icon-item i { font-size: 32px; display: block; margin-bottom: 10px; }
    .icon-name { display: block; font-weight: bold; margin-bottom: 5px; }
    .icon-unicode { display: block; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.options.fontName} Icon Font</h1>
    <p>Total icons: ${icons.length}</p>
  </div>
  <div class="icon-grid">
${iconItems}
  </div>
</body>
</html>`
  }

  /**
   * 获取字体格式
   */
  private getFontFormat(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'woff2':
        return 'woff2'
      case 'woff':
        return 'woff'
      case 'ttf':
        return 'truetype'
      case 'eot':
        return 'embedded-opentype'
      case 'svg':
        return 'svg'
      default:
        return 'truetype'
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
   * 创建 CSS 生成器实例
   */
  static create(options: Required<IconFontOptions>): CssGenerator {
    return new CssGenerator(options)
  }
}
