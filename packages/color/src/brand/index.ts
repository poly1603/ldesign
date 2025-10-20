/**
 * 品牌色管理器
 * 管理品牌色系统、生成品牌调色板、导出品牌指南
 */

import type { ColorInput } from '../types'
import { generateSemanticColors, generateTailwindPalette } from '../core'
import { Color } from '../core/Color'

/**
 * 品牌色定义
 */
export interface BrandColors {
  primary: Color
  secondary?: Color
  accent?: Color
  success?: Color
  warning?: Color
  danger?: Color
  info?: Color
  neutral?: Color
}

/**
 * 品牌色调色板
 */
export interface BrandPalette {
  colors: BrandColors
  shades: {
    [key in keyof BrandColors]?: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      950?: string
    }
  }
  semantics: {
    text: {
      primary: string
      secondary: string
      tertiary: string
      disabled: string
      inverse: string
    }
    background: {
      primary: string
      secondary: string
      tertiary: string
      overlay: string
      elevated: string
    }
    border: {
      light: string
      medium: string
      heavy: string
      focus: string
    }
    status: {
      success: string
      warning: string
      danger: string
      info: string
    }
  }
}

/**
 * 品牌指南选项
 */
export interface BrandGuideOptions {
  format?: 'json' | 'css' | 'scss' | 'less' | 'stylus'
  includeUsageExamples?: boolean
  includeAccessibilityInfo?: boolean
  includeColorTheory?: boolean
}

/**
 * 品牌色配置
 */
export interface BrandConfig {
  name: string
  description?: string
  colors: Partial<BrandColors>
  metadata?: {
    industry?: string
    target?: string
    mood?: string[]
    keywords?: string[]
  }
  constraints?: {
    minContrast?: number
    maxColors?: number
    colorSpace?: 'rgb' | 'hsl' | 'lab'
  }
}

/**
 * 品牌色管理器
 */
export class BrandColorManager {
  private config: BrandConfig
  private palette?: BrandPalette
  
  constructor(config: BrandConfig) {
    this.config = config
    this.initializeColors()
  }
  
  /**
   * 初始化品牌色
   */
  private initializeColors(): void {
    // 确保至少有主色
    if (!this.config.colors.primary) {
      throw new Error('Primary color is required for brand')
    }
    
    // 生成缺失的语义色
    if (!this.config.colors.success || !this.config.colors.warning || 
        !this.config.colors.danger || !this.config.colors.info) {
      const semantics = generateSemanticColors(this.config.colors.primary as Color)
      
      this.config.colors.success = this.config.colors.success || new Color(semantics.success)
      this.config.colors.warning = this.config.colors.warning || new Color(semantics.warning)
      this.config.colors.danger = this.config.colors.danger || new Color(semantics.danger)
      this.config.colors.info = this.config.colors.info || new Color(semantics.info)
    }
    
    // 生成中性色
    if (!this.config.colors.neutral) {
      const primaryHsl = (this.config.colors.primary as Color).toHSL()
      this.config.colors.neutral = Color.fromHSL(primaryHsl.h, 10, 50)
    }
  }
  
  /**
   * 设置品牌色
   */
  setBrandColors(colors: Partial<BrandColors>): void {
    this.config.colors = { ...this.config.colors, ...colors }
    this.initializeColors()
    this.palette = undefined // 清除缓存的调色板
  }
  
  /**
   * 生成品牌调色板
   */
  generateBrandPalette(): BrandPalette {
    if (this.palette) return this.palette
    
    const colors = this.config.colors as BrandColors
    const shades: BrandPalette['shades'] = {}
    
    // 为每个品牌色生成色阶
    for (const [key, color] of Object.entries(colors)) {
      if (color) {
        const palette = generateTailwindPalette(color as Color)
        shades[key as keyof BrandColors] = palette as any
      }
    }
    
    // 生成语义色
    const semantics = this.generateSemantics(colors)
    
    this.palette = {
      colors,
      shades,
      semantics
    }
    
    return this.palette
  }
  
  /**
   * 生成语义色
   */
  private generateSemantics(colors: BrandColors): BrandPalette['semantics'] {
    const primary = colors.primary
    const isDark = primary.isDark()
    
    return {
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
        tertiary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        disabled: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
        inverse: isDark ? '#000000' : '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        tertiary: '#eeeeee',
        overlay: 'rgba(0,0,0,0.5)',
        elevated: '#ffffff'
      },
      border: {
        light: 'rgba(0,0,0,0.08)',
        medium: 'rgba(0,0,0,0.12)',
        heavy: 'rgba(0,0,0,0.24)',
        focus: primary.toHex()
      },
      status: {
        success: colors.success?.toHex() || '#4caf50',
        warning: colors.warning?.toHex() || '#ff9800',
        danger: colors.danger?.toHex() || '#f44336',
        info: colors.info?.toHex() || '#2196f3'
      }
    }
  }
  
  /**
   * 确保品牌一致性
   */
  ensureBrandConsistency(): {
    consistent: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    const palette = this.generateBrandPalette()
    
    // 检查对比度
    if (this.config.constraints?.minContrast) {
      const minContrast = this.config.constraints.minContrast
      const bg = new Color('#ffffff')
      
      for (const [key, color] of Object.entries(palette.colors)) {
        if (color) {
          const contrast = color.contrast(bg)
          if (contrast < minContrast) {
            issues.push(`${key} color has insufficient contrast (${contrast.toFixed(2)})`)
            suggestions.push(`Consider darkening ${key} color to improve contrast`)
          }
        }
      }
    }
    
    // 检查色彩和谐
    const colors = Object.values(palette.colors).filter(Boolean) as Color[]
    const harmony = this.checkColorHarmony(colors)
    
    if (harmony < 0.7) {
      issues.push(`Color harmony is low (${(harmony * 100).toFixed(0)}%)`)
      suggestions.push('Consider using colors from the same color scheme')
    }
    
    // 检查色彩数量
    if (this.config.constraints?.maxColors) {
      const colorCount = Object.values(palette.colors).filter(Boolean).length
      if (colorCount > this.config.constraints.maxColors) {
        issues.push(`Too many brand colors (${colorCount} > ${this.config.constraints.maxColors})`)
        suggestions.push('Consider reducing the number of brand colors for simplicity')
      }
    }
    
    return {
      consistent: issues.length === 0,
      issues,
      suggestions
    }
  }
  
  /**
   * 检查色彩和谐度
   */
  private checkColorHarmony(colors: Color[]): number {
    if (colors.length < 2) return 1
    
    let totalHarmony = 0
    let comparisons = 0
    
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const hsl1 = colors[i].toHSL()
        const hsl2 = colors[j].toHSL()
        
        const hueDiff = Math.abs(hsl1.h - hsl2.h)
        const minHueDiff = Math.min(hueDiff, 360 - hueDiff)
        
        // 和谐的角度关系
        const harmonicAngles = [0, 30, 60, 90, 120, 150, 180]
        const closestHarmonic = harmonicAngles.reduce((closest, angle) => {
          const diff = Math.abs(minHueDiff - angle)
          return diff < Math.abs(minHueDiff - closest) ? angle : closest
        }, 0)
        
        const angleScore = 1 - Math.abs(minHueDiff - closestHarmonic) / 30
        totalHarmony += angleScore
        comparisons++
      }
    }
    
    return totalHarmony / comparisons
  }
  
  /**
   * 导出品牌指南
   */
  exportBrandGuidelines(options: BrandGuideOptions = {}): string {
    const {
      format = 'json',
      includeUsageExamples = true,
      includeAccessibilityInfo = true,
      includeColorTheory = false
    } = options
    
    const palette = this.generateBrandPalette()
    const consistency = this.ensureBrandConsistency()
    
    const guidelines: any = {
      brand: this.config.name,
      description: this.config.description,
      metadata: this.config.metadata,
      palette,
      consistency
    }
    
    if (includeUsageExamples) {
      guidelines.usageExamples = this.generateUsageExamples()
    }
    
    if (includeAccessibilityInfo) {
      guidelines.accessibility = this.generateAccessibilityInfo()
    }
    
    if (includeColorTheory) {
      guidelines.colorTheory = this.generateColorTheory()
    }
    
    return this.formatOutput(guidelines, format)
  }
  
  /**
   * 生成使用示例
   */
  private generateUsageExamples(): any {
    const palette = this.generateBrandPalette()
    
    return {
      buttons: {
        primary: {
          background: palette.colors.primary.toHex(),
          text: palette.semantics.text.inverse,
          hover: palette.colors.primary.darken(10).toHex()
        },
        secondary: {
          background: palette.colors.secondary?.toHex() || palette.colors.primary.lighten(40).toHex(),
          text: palette.semantics.text.primary,
          hover: palette.colors.secondary?.darken(10).toHex()
        }
      },
      cards: {
        background: palette.semantics.background.elevated,
        border: palette.semantics.border.light,
        shadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      forms: {
        input: {
          border: palette.semantics.border.medium,
          focusBorder: palette.semantics.border.focus,
          background: palette.semantics.background.primary
        }
      }
    }
  }
  
  /**
   * 生成无障碍信息
   */
  private generateAccessibilityInfo(): any {
    const palette = this.generateBrandPalette()
    const info: any = {
      contrastRatios: {},
      wcagCompliance: {}
    }
    
    const white = new Color('#ffffff')
    const black = new Color('#000000')
    
    for (const [key, color] of Object.entries(palette.colors)) {
      if (color) {
        info.contrastRatios[key] = {
          onWhite: color.contrast(white),
          onBlack: color.contrast(black)
        }
        
        info.wcagCompliance[key] = {
          AA: {
            normalText: color.contrast(white) >= 4.5,
            largeText: color.contrast(white) >= 3
          },
          AAA: {
            normalText: color.contrast(white) >= 7,
            largeText: color.contrast(white) >= 4.5
          }
        }
      }
    }
    
    return info
  }
  
  /**
   * 生成色彩理论信息
   */
  private generateColorTheory(): any {
    const palette = this.generateBrandPalette()
    const primary = palette.colors.primary
    const hsl = primary.toHSL()
    
    return {
      primaryHue: hsl.h,
      colorScheme: this.detectColorScheme(),
      psychology: this.getColorPsychology(hsl.h),
      temperature: hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300 ? 'warm' : 'cool'
    }
  }
  
  /**
   * 检测色彩方案
   */
  private detectColorScheme(): string {
    const colors = Object.values(this.config.colors).filter(Boolean) as Color[]
    if (colors.length < 2) return 'monochromatic'
    
    const hues = colors.map(c => c.toHSL().h)
    const hueDiffs = []
    
    for (let i = 0; i < hues.length - 1; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        const diff = Math.abs(hues[i] - hues[j])
        hueDiffs.push(Math.min(diff, 360 - diff))
      }
    }
    
    const avgDiff = hueDiffs.reduce((a, b) => a + b, 0) / hueDiffs.length
    
    if (avgDiff < 30) return 'analogous'
    if (avgDiff > 150 && avgDiff < 210) return 'complementary'
    if (avgDiff > 110 && avgDiff < 130) return 'triadic'
    return 'custom'
  }
  
  /**
   * 获取色彩心理学
   */
  private getColorPsychology(hue: number): string {
    if (hue >= 0 && hue < 30) return '热情、活力、激情'
    if (hue >= 30 && hue < 60) return '温暖、友好、创造力'
    if (hue >= 60 && hue < 120) return '自然、成长、和谐'
    if (hue >= 120 && hue < 180) return '清新、平静、信任'
    if (hue >= 180 && hue < 240) return '专业、稳定、智慧'
    if (hue >= 240 && hue < 300) return '神秘、创新、奢华'
    return '浪漫、温柔、梦幻'
  }
  
  /**
   * 格式化输出
   */
  private formatOutput(data: any, format: string): string {
    switch (format) {
      case 'css':
        return this.toCSS(data)
      case 'scss':
        return this.toSCSS(data)
      case 'less':
        return this.toLESS(data)
      case 'stylus':
        return this.toStylus(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }
  
  /**
   * 转换为CSS
   */
  private toCSS(data: any): string {
    const palette = data.palette
    let css = ':root {\n'
    
    // 品牌色
    for (const [key, color] of Object.entries(palette.colors)) {
      if (color) {
        css += `  --brand-${key}: ${(color as Color).toHex()};\n`
      }
    }
    
    // 色阶
    for (const [key, shades] of Object.entries(palette.shades)) {
      for (const [shade, value] of Object.entries(shades as any)) {
        css += `  --brand-${key}-${shade}: ${value};\n`
      }
    }
    
    css += '}\n'
    return css
  }
  
  /**
   * 转换为SCSS
   */
  private toSCSS(data: any): string {
    const palette = data.palette
    let scss = '// Brand Colors\n'
    
    for (const [key, color] of Object.entries(palette.colors)) {
      if (color) {
        scss += `$brand-${key}: ${(color as Color).toHex()};\n`
      }
    }
    
    scss += '\n// Color Shades\n'
    for (const [key, shades] of Object.entries(palette.shades)) {
      scss += `$brand-${key}-shades: (\n`
      for (const [shade, value] of Object.entries(shades as any)) {
        scss += `  ${shade}: ${value},\n`
      }
      scss += ');\n'
    }
    
    return scss
  }
  
  /**
   * 转换为LESS
   */
  private toLESS(data: any): string {
    const palette = data.palette
    let less = '// Brand Colors\n'
    
    for (const [key, color] of Object.entries(palette.colors)) {
      if (color) {
        less += `@brand-${key}: ${(color as Color).toHex()};\n`
      }
    }
    
    return less
  }
  
  /**
   * 转换为Stylus
   */
  private toStylus(data: any): string {
    const palette = data.palette
    let stylus = '// Brand Colors\n'
    
    for (const [key, color] of Object.entries(palette.colors)) {
      if (color) {
        stylus += `brand-${key} = ${(color as Color).toHex()}\n`
      }
    }
    
    return stylus
  }
}

// 创建便捷函数
export function createBrandManager(
  name: string,
  primary: ColorInput,
  options: Partial<BrandConfig> = {}
): BrandColorManager {
  return new BrandColorManager({
    name,
    colors: { primary: new Color(primary) },
    ...options
  })
}