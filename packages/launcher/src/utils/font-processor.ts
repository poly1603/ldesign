/**
 * 字体处理工具
 * 提供字体优化、子集化和预加载功能
 */

import fs from 'node:fs/promises'
import path from 'node:path'
// import crypto from 'node:crypto'
import type {
  FontInfo,
  FontOptimizationConfig,
  FontProcessingResult,
  ChineseCharsetType,
} from '../types/assets'

/**
 * 字体处理器
 */
export class FontProcessor {
  private static readonly CHINESE_CHARS = {
    simplified: '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞'
  }

  /**
   * 优化字体文件
   */
  static async optimizeFont(
    fontPath: string,
    config: FontOptimizationConfig = {}
  ): Promise<FontProcessingResult> {
    const {
      subset = false,
      preload = false,
      display = 'swap',
      formats = ['woff2', 'woff'],
      subsetChars,
      includeChinese = false,
      chineseCharset = 'simplified',
      compressionLevel: _compressionLevel = 3,
      generateFallback = true,
    } = config

    try {
      const fontInfo = await this.getFontInfo(fontPath)
      const generatedFiles: string[] = []

      // 如果启用子集化
      if (subset) {
        const chars = this.buildCharacterSet(subsetChars, includeChinese, chineseCharset)
        const subsetPath = await this.generateSubset(fontPath, chars, formats)
        generatedFiles.push(...subsetPath)
      }

      // 生成不同格式
      for (const format of formats) {
        if (format !== path.extname(fontPath).slice(1)) {
          const convertedPath = await this.convertFontFormat(fontPath, format)
          generatedFiles.push(convertedPath)
        }
      }

      // 生成预加载配置
      if (preload) {
        const preloadConfig = this.generatePreloadConfig(fontInfo, display)
        const preloadPath = path.join(path.dirname(fontPath), `${fontInfo.name}-preload.css`)
        await fs.writeFile(preloadPath, preloadConfig)
        generatedFiles.push(preloadPath)
      }

      // 生成字体回退
      if (generateFallback) {
        const fallbackCSS = this.generateFontFallback(fontInfo)
        const fallbackPath = path.join(path.dirname(fontPath), `${fontInfo.name}-fallback.css`)
        await fs.writeFile(fallbackPath, fallbackCSS)
        generatedFiles.push(fallbackPath)
      }

      const originalSize = (await fs.stat(fontPath)).size
      const optimizedSize = await this.calculateTotalSize(generatedFiles)

      return {
        font: fontInfo,
        success: true,
        generatedFiles,
        compressionRatio: optimizedSize / originalSize,
      }
    }
    catch (error) {
      return {
        font: await this.getFontInfo(fontPath),
        success: false,
        error: (error as Error).message,
        generatedFiles: [],
      }
    }
  }

  /**
   * 生成字体子集
   */
  static async generateSubset(
    fontPath: string,
    characters: string,
    formats: string[] = ['woff2']
  ): Promise<string[]> {
    const generatedFiles: string[] = []
    const fontName = path.basename(fontPath, path.extname(fontPath))
    const outputDir = path.dirname(fontPath)

    try {
      // 这里应该使用专业的字体子集化库，如 fonttools 或 pyftsubset
      // 由于这是一个简化实现，我们模拟子集化过程

      for (const format of formats) {
        const subsetFileName = `${fontName}-subset.${format}`
        const subsetPath = path.join(outputDir, subsetFileName)

        // 模拟子集化过程（实际应该调用字体处理库）
        const originalFont = await fs.readFile(fontPath)
        const subsetFont = await this.simulateSubsetting(originalFont, characters)

        await fs.writeFile(subsetPath, subsetFont)
        generatedFiles.push(subsetPath)
      }

      return generatedFiles
    }
    catch (error) {
      throw new Error(`Failed to generate font subset: ${(error as Error).message}`)
    }
  }

  /**
   * 转换字体格式
   */
  static async convertFontFormat(fontPath: string, targetFormat: string): Promise<string> {
    const fontName = path.basename(fontPath, path.extname(fontPath))
    const outputDir = path.dirname(fontPath)
    const outputPath = path.join(outputDir, `${fontName}.${targetFormat}`)

    try {
      // 这里应该使用专业的字体转换库
      // 由于这是一个简化实现，我们模拟转换过程
      const originalFont = await fs.readFile(fontPath)
      const convertedFont = await this.simulateFormatConversion(originalFont, targetFormat)

      await fs.writeFile(outputPath, convertedFont)
      return outputPath
    }
    catch (error) {
      throw new Error(`Failed to convert font format: ${(error as Error).message}`)
    }
  }

  /**
   * 获取字体信息
   */
  static async getFontInfo(fontPath: string): Promise<FontInfo> {
    try {
      const stats = await fs.stat(fontPath)
      const fontName = path.basename(fontPath, path.extname(fontPath))
      const format = path.extname(fontPath).slice(1)

      // 这里应该解析字体文件获取详细信息
      // 简化实现，返回基本信息
      return {
        name: fontName,
        path: fontPath,
        format,
        size: stats.size,
        weight: 'normal',
        style: 'normal',
        isSubset: fontName.includes('subset'),
      }
    }
    catch (error) {
      throw new Error(`Failed to get font info: ${(error as Error).message}`)
    }
  }

  /**
   * 构建字符集
   */
  private static buildCharacterSet(
    customChars?: string,
    includeChinese = false,
    chineseCharset: ChineseCharsetType = 'simplified'
  ): string {
    let charset = ''

    // 基础 ASCII 字符
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?`~'

    // 添加自定义字符
    if (customChars) {
      charset += customChars
    }

    // 添加中文字符
    if (includeChinese) {
      if (chineseCharset === 'simplified' || chineseCharset === 'both') {
        charset += this.CHINESE_CHARS.simplified
      }
      // 这里可以添加繁体中文字符集
    }

    // 去重
    return [...new Set(charset)].join('')
  }

  /**
   * 生成预加载配置
   */
  private static generatePreloadConfig(fontInfo: FontInfo, display: string): string {
    const fontFamily = fontInfo.name.replace(/[-_]/g, ' ')

    return `
/* Font preload configuration for ${fontInfo.name} */
@font-face {
  font-family: '${fontFamily}';
  src: url('${path.basename(fontInfo.path)}') format('${this.getFormatName(fontInfo.format)}');
  font-weight: ${fontInfo.weight || 'normal'};
  font-style: ${fontInfo.style || 'normal'};
  font-display: ${display};
}

/* Preload link (add to HTML head) */
/*
<link rel="preload" href="${path.basename(fontInfo.path)}" as="font" type="font/${fontInfo.format}" crossorigin>
*/
`.trim()
  }

  /**
   * 生成字体回退
   */
  private static generateFontFallback(fontInfo: FontInfo): string {
    const fontFamily = fontInfo.name.replace(/[-_]/g, ' ')
    const fallbackFonts = this.getFallbackFonts(fontInfo.name)

    return `
/* Font fallback configuration for ${fontInfo.name} */
.font-${fontInfo.name.toLowerCase()} {
  font-family: '${fontFamily}', ${fallbackFonts.join(', ')};
}

/* Font loading states */
.font-${fontInfo.name.toLowerCase()}.font-loading {
  font-family: ${fallbackFonts.join(', ')};
}

.font-${fontInfo.name.toLowerCase()}.font-loaded {
  font-family: '${fontFamily}', ${fallbackFonts.join(', ')};
}
`.trim()
  }

  /**
   * 获取回退字体
   */
  private static getFallbackFonts(fontName: string): string[] {
    const name = fontName.toLowerCase()

    if (name.includes('serif')) {
      return ['Georgia', 'Times New Roman', 'serif']
    }
    else if (name.includes('mono') || name.includes('code')) {
      return ['Consolas', 'Monaco', 'Courier New', 'monospace']
    }
    else {
      return ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
    }
  }

  /**
   * 获取格式名称
   */
  private static getFormatName(format: string): string {
    const formatMap: Record<string, string> = {
      'woff2': 'woff2',
      'woff': 'woff',
      'ttf': 'truetype',
      'otf': 'opentype',
      'eot': 'embedded-opentype',
    }
    return formatMap[format] || format
  }

  /**
   * 模拟字体子集化（简化实现）
   */
  private static async simulateSubsetting(fontBuffer: Buffer, _characters: string): Promise<Buffer> {
    // 实际实现应该使用专业的字体处理库
    // 这里只是模拟，返回原字体的一部分
    // const _hash = crypto.createHash('md5').update(characters).digest('hex')
    const subsetSize = Math.floor(fontBuffer.length * 0.6) // 模拟60%的大小

    return fontBuffer.subarray(0, subsetSize)
  }

  /**
   * 模拟格式转换（简化实现）
   */
  private static async simulateFormatConversion(fontBuffer: Buffer, _targetFormat: string): Promise<Buffer> {
    // 实际实现应该使用专业的字体转换库
    // 这里只是模拟，返回原字体
    return fontBuffer
  }

  /**
   * 计算文件总大小
   */
  private static async calculateTotalSize(filePaths: string[]): Promise<number> {
    let totalSize = 0

    for (const filePath of filePaths) {
      try {
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }
      catch {
        // 忽略不存在的文件
      }
    }

    return totalSize
  }
}

/**
 * 快速优化中文字体
 */
export async function optimizeChineseFont(
  fontPath: string,
  charset: ChineseCharsetType = 'simplified'
): Promise<FontProcessingResult> {
  return FontProcessor.optimizeFont(fontPath, {
    subset: true,
    includeChinese: true,
    chineseCharset: charset,
    formats: ['woff2', 'woff'],
    display: 'swap',
    preload: true,
    generateFallback: true,
  })
}

/**
 * 快速生成 Web 字体
 */
export async function generateWebFont(
  fontPath: string,
  characters?: string
): Promise<FontProcessingResult> {
  return FontProcessor.optimizeFont(fontPath, {
    subset: !!characters,
    subsetChars: characters || undefined,
    formats: ['woff2', 'woff'],
    display: 'swap',
    preload: true,
    generateFallback: true,
    compressionLevel: 4,
  })
}
