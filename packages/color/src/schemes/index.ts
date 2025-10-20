/**
 * 智能颜色方案生成�?
 * 提供多种配色方案生成算法
 */

import { Color } from '../core/Color'

/**
 * 配色方案类型
 */
export type ColorSchemeType = 
  | 'monochromatic'   // 单色�?
  | 'analogous'       // 类似�?
  | 'complementary'   // 互补�?
  | 'split-complementary' // 分裂互补
  | 'triadic'         // 三角�?
  | 'tetradic'        // 四角�?
  | 'square'          // 正方�?
  | 'compound'        // 复合�?

/**
 * 配色方案选项
 */
export interface ColorSchemeOptions {
  count?: number              // 生成颜色数量
  includeBase?: boolean      // 是否包含基色
  variation?: number         // 变化程度 (0-100)
  preserveLightness?: boolean // 保持明度
  preserveSaturation?: boolean // 保持饱和度
  enhanceHarmony?: boolean    // 增强和谐度
}

/**
 * 配色方案结果
 */
export interface ColorScheme {
  type: ColorSchemeType
  base: Color
  colors: Color[]
  description: string
  harmony?: number
}

/**
 * 智能颜色方案生成�?
 */
export class ColorSchemeGenerator {
  
  /**
   * 生成配色方案
   */
  static generate(
    baseColor: Color,
    type: ColorSchemeType,
    options: ColorSchemeOptions = {}
  ): ColorScheme {
    const {
      count = 5,
      variation = 20,
      preserveLightness = false,
      preserveSaturation = false
    } = options
    
    let colors: Color[] = []
    let description = ''
    
    switch (type) {
      case 'monochromatic':
        colors = this.generateMonochromatic(baseColor, count, variation)
        description = '单色系方案：使用同一色相的不同明度和饱和度'
        break
        
      case 'analogous':
        colors = this.generateAnalogous(baseColor, count)
        description = '类似色方案：使用色轮上相邻的颜色'
        break
        
      case 'complementary':
        colors = this.generateComplementary(baseColor)
        description = '互补色方案：使用色轮上相对的颜色'
        break
        
      case 'split-complementary':
        colors = this.generateSplitComplementary(baseColor)
        description = '分裂互补方案：使用基色和其互补色的邻近色'
        break
        
      case 'triadic':
        colors = this.generateTriadic(baseColor)
        description = '三角色方案：使用色轮上等距的三个颜色'
        break
        
      case 'tetradic':
        colors = this.generateTetradic(baseColor)
        description = '四角色方案：使用两对互补色'
        break
        
      case 'square':
        colors = this.generateSquare(baseColor)
        description = '正方形方案：使用色轮上形成正方形的四个颜色'
        break
        
      case 'compound':
        colors = this.generateCompound(baseColor, count)
        description = '复合色方案：结合互补色和类似色'
        break
    }
    
    // 后处理：保持明度或饱和度
    if (preserveLightness || preserveSaturation) {
      const hsl = baseColor.toHSL()
      colors = colors.map(color => {
        const colorHsl = color.toHSL()
        if (preserveLightness) {
          colorHsl.l = hsl.l
        }
        if (preserveSaturation) {
          colorHsl.s = hsl.s
        }
        return new Color(colorHsl)
      })
    }
    
    // 如果需要增强和谐度，进行颜色调整
    if (options.enhanceHarmony && type !== 'monochromatic') {
      colors = this.adjustHarmony(colors, baseColor)
    }
    
    return {
      type,
      colors,
      base: baseColor,
      description,
      harmony: this.evaluateHarmony({ type, colors, base: baseColor, description })
    }
  }
  
  /**
   * 自动选择配色方案
   */
  static generateAdaptive(
    baseColor: Color,
    options: ColorSchemeOptions = {}
  ): ColorScheme {
    let type: ColorSchemeType = 'analogous'
    const hsl = baseColor.toHSL()
    
    if (hsl.s < 20) {
      // 低饱和度：使用单色系
      type = 'monochromatic'
    } else if (hsl.s > 80 && hsl.l > 40 && hsl.l < 60) {
      // 高饱和度，中等明度：使用互补色
      type = 'complementary'
    } else if (hsl.l < 30 || hsl.l > 70) {
      // 极端明度：使用类似色
      type = 'analogous'
    } else {
      // 一般情况：使用三角色
      type = 'triadic'
    }
    
    return this.generate(baseColor, type, options)
  }
  
  /**
   * 批量生成多种配色方案
   */
  static generateAll(
    baseColor: Color,
    options: ColorSchemeOptions = {}
  ): ColorScheme[] {
    const types: ColorSchemeType[] = [
      'monochromatic',
      'analogous',
      'complementary',
      'split-complementary',
      'triadic',
      'tetradic',
      'square',
      'compound'
    ]
    
    return types.map(type => this.generate(baseColor, type, options))
  }
  
  /**
   * 生成单色系方案
   */
  private static generateMonochromatic(baseColor: Color, count: number, variation: number): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    
    for (let i = 1; i < count; i++) {
      const newHsl = { ...hsl }
      // 变化明度和饱和度
      newHsl.l = Math.max(0, Math.min(100, hsl.l + (i - count / 2) * (variation / count) * 2))
      newHsl.s = Math.max(0, Math.min(100, hsl.s + (i - count / 2) * (variation / count)))
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 生成类似色方案
   */
  private static generateAnalogous(baseColor: Color, count: number): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    const step = 30 / (count - 1) // 类似色通常在30度范围内
    
    for (let i = 1; i < count; i++) {
      const newHsl = { ...hsl }
      newHsl.h = (hsl.h + i * step - 15 + 360) % 360
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 生成互补色方案
   */
  private static generateComplementary(baseColor: Color): Color[] {
    const hsl = baseColor.toHSL()
    const complement = { ...hsl }
    complement.h = (hsl.h + 180) % 360
    
    return [baseColor, new Color(complement)]
  }
  
  /**
   * 生成分裂互补方案
   */
  private static generateSplitComplementary(baseColor: Color): Color[] {
    const hsl = baseColor.toHSL()
    const split1 = { ...hsl }
    const split2 = { ...hsl }
    
    split1.h = (hsl.h + 150) % 360
    split2.h = (hsl.h + 210) % 360
    
    return [baseColor, new Color(split1), new Color(split2)]
  }
  
  /**
   * 生成三角色方案
   */
  private static generateTriadic(baseColor: Color): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    
    for (let i = 1; i < 3; i++) {
      const newHsl = { ...hsl }
      newHsl.h = (hsl.h + i * 120) % 360
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 生成四角色方案
   */
  private static generateTetradic(baseColor: Color): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    
    const angles = [60, 180, 240]
    for (const angle of angles) {
      const newHsl = { ...hsl }
      newHsl.h = (hsl.h + angle) % 360
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 生成正方形方案
   */
  private static generateSquare(baseColor: Color): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    
    for (let i = 1; i < 4; i++) {
      const newHsl = { ...hsl }
      newHsl.h = (hsl.h + i * 90) % 360
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 生成复合色方案
   */
  private static generateCompound(baseColor: Color, count: number): Color[] {
    const hsl = baseColor.toHSL()
    const colors: Color[] = [baseColor]
    
    // 添加互补色
    const complement = { ...hsl }
    complement.h = (hsl.h + 180) % 360
    colors.push(new Color(complement))
    
    // 添加类似色
    for (let i = 2; i < count; i++) {
      const newHsl = { ...hsl }
      const offset = (i - 1) * 15 * (i % 2 === 0 ? 1 : -1)
      newHsl.h = (hsl.h + offset + 360) % 360
      colors.push(new Color(newHsl))
    }
    
    return colors
  }
  
  /**
   * 调整颜色以增强和谐度
   */
  private static adjustHarmony(colors: Color[], baseColor: Color): Color[] {
    const baseHsl = baseColor.toHSL()
    return colors.map(color => {
      const hsl = color.toHSL()
      // 微调色相使其更接近黄金角度
      const hueDiff = Math.abs(hsl.h - baseHsl.h)
      if (hueDiff > 0 && hueDiff < 180) {
        // 向黄金角度靠拢
        const goldenAngles = [30, 60, 90, 120, 150, 180]
        const closest = goldenAngles.reduce((prev, curr) => 
          Math.abs(curr - hueDiff) < Math.abs(prev - hueDiff) ? curr : prev
        )
        const adjustment = (closest - hueDiff) * 0.3 // 30%调整
        hsl.h = (hsl.h + adjustment + 360) % 360
      }
      // 微调饱和度和明度
      hsl.s = hsl.s * 0.9 + baseHsl.s * 0.1
      hsl.l = hsl.l * 0.95 + baseHsl.l * 0.05
      return new Color(hsl)
    })
  }
  
  /**
   * 评估配色方案的和谐度
   */
  static evaluateHarmony(scheme: ColorScheme): number {
    const { colors } = scheme
    if (colors.length < 2) return 100
    
    let totalHarmony = 0
    let comparisons = 0
    
    // 比较所有颜色对
    for (let i = 0; i < colors.length - 1; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const hsl1 = colors[i].toHSL()
        const hsl2 = colors[j].toHSL()
        
        // 计算色相差异
        const hueDiff = Math.abs(hsl1.h - hsl2.h)
        const minHueDiff = Math.min(hueDiff, 360 - hueDiff)
        
        // 计算饱和度和明度差异
        const satDiff = Math.abs(hsl1.s - hsl2.s)
        const lightDiff = Math.abs(hsl1.l - hsl2.l)
        
        // 和谐度评分（0-100�?
        let harmony = 100
        
        // 色相评分（互补色、三角色等获得高分）
        if (minHueDiff === 180 || minHueDiff === 120 || minHueDiff === 90) {
          harmony *= 1.2
        } else if (minHueDiff < 30) {
          harmony *= 1.1 // 类似�?
        } else if (minHueDiff > 150 && minHueDiff < 210) {
          harmony *= 1.15 // 接近互补
        }
        
        // 饱和度和明度的适度差异增加和谐�?
        if (satDiff > 20 && satDiff < 50) {
          harmony *= 1.1
        }
        if (lightDiff > 20 && lightDiff < 50) {
          harmony *= 1.1
        }
        
        totalHarmony += Math.min(100, harmony)
        comparisons++
      }
    }
    
    return Math.round(totalHarmony / comparisons)
  }
}

// 导出便捷函数
export const generateColorScheme = ColorSchemeGenerator.generate
export const generateAdaptiveScheme = ColorSchemeGenerator.generateAdaptive
export const generateAllSchemes = ColorSchemeGenerator.generateAll
export const evaluateHarmony = ColorSchemeGenerator.evaluateHarmony