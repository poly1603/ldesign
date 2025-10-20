/**
 * 颜色无障碍工具
 * 提供色盲模拟、对比度检查和自动调整等功能
 */

import type { TextSize, WCAGLevel } from '../types'
import { getContrast, isWCAGCompliant } from '../core/analysis'
import { Color } from '../core/Color'

/**
 * 色盲类型
 */
export type ColorBlindnessType = 
  | 'protanopia'    // 红色盲
  | 'deuteranopia'  // 绿色盲
  | 'tritanopia'    // 蓝色盲
  | 'protanomaly'   // 红色弱
  | 'deuteranomaly' // 绿色弱
  | 'tritanomaly'   // 蓝色弱
  | 'achromatopsia' // 全色盲
  | 'achromatomaly' // 全色弱

/**
 * 色盲模拟矩阵
 */
const COLOR_BLIND_MATRICES: Record<ColorBlindnessType, number[][]> = {
  // 红色盲
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  // 绿色盲
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  // 蓝色盲
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  // 红色弱
  protanomaly: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875]
  ],
  // 绿色弱
  deuteranomaly: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858]
  ],
  // 蓝色弱
  tritanomaly: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817]
  ],
  // 全色盲
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ],
  // 全色弱
  achromatomaly: [
    [0.618, 0.320, 0.062],
    [0.163, 0.775, 0.062],
    [0.163, 0.320, 0.516]
  ]
}

/**
 * 颜色无障碍工具类
 */
export class ColorAccessibility {
  /**
   * 模拟色盲视觉
   */
  static simulateColorBlindness(color: Color, type: ColorBlindnessType): Color {
    const rgb = color.toRGB()
    const matrix = COLOR_BLIND_MATRICES[type]
    
    const r = Math.round(rgb.r * matrix[0][0] + rgb.g * matrix[0][1] + rgb.b * matrix[0][2])
    const g = Math.round(rgb.r * matrix[1][0] + rgb.g * matrix[1][1] + rgb.b * matrix[1][2])
    const b = Math.round(rgb.r * matrix[2][0] + rgb.g * matrix[2][1] + rgb.b * matrix[2][2])
    
    return Color.fromRGB(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b)),
      rgb.a
    )
  }
  
  /**
   * 自动调整颜色以满足WCAG标准
   */
  static autoAdjustForWCAG(
    foreground: Color,
    background: Color,
    level: WCAGLevel = 'AA',
    textSize: TextSize = 'normal'
  ): Color {
    let adjusted = foreground
    let attempts = 0
    const maxAttempts = 20
    
    // 如果已经满足要求，直接返回
    if (isWCAGCompliant(foreground.toRGB(), background.toRGB(), level, textSize)) {
      return foreground
    }
    
    // 决定是调亮还是调暗
    const shouldLighten = background.lightness > 50
    
    while (attempts < maxAttempts) {
      if (shouldLighten) {
        adjusted = adjusted.darken(5)
      } else {
        adjusted = adjusted.lighten(5)
      }
      
      if (isWCAGCompliant(adjusted.toRGB(), background.toRGB(), level, textSize)) {
        return adjusted
      }
      
      attempts++
    }
    
    // 如果还不满足，尝试反转方向
    adjusted = foreground
    attempts = 0
    
    while (attempts < maxAttempts) {
      if (!shouldLighten) {
        adjusted = adjusted.darken(5)
      } else {
        adjusted = adjusted.lighten(5)
      }
      
      if (isWCAGCompliant(adjusted.toRGB(), background.toRGB(), level, textSize)) {
        return adjusted
      }
      
      attempts++
    }
    
    // 最后的手段：使用黑色或白色
    const blackContrast = getContrast({ r: 0, g: 0, b: 0 }, background.toRGB())
    const whiteContrast = getContrast({ r: 255, g: 255, b: 255 }, background.toRGB())
    
    return blackContrast > whiteContrast 
      ? new Color('#000000')
      : new Color('#ffffff')
  }
  
  /**
   * 生成无障碍颜色组合建议
   */
  static suggestAccessiblePairs(
    baseColor: Color,
    count = 5
  ): Array<{ color: Color; contrast: number; wcagAA: boolean; wcagAAA: boolean }> {
    const suggestions: Array<{ color: Color; contrast: number; wcagAA: boolean; wcagAAA: boolean }> = []
    
    // 尝试不同的调整策略
    const strategies = [
      () => baseColor.lighten(30),
      () => baseColor.darken(30),
      () => baseColor.lighten(50),
      () => baseColor.darken(50),
      () => baseColor.rotate(180),
      () => baseColor.rotate(180).lighten(20),
      () => baseColor.rotate(180).darken(20),
      () => new Color('#000000'),
      () => new Color('#ffffff')
    ]
    
    for (const strategy of strategies) {
      if (suggestions.length >= count) break
      
      const color = strategy()
      const contrast = getContrast(color.toRGB(), baseColor.toRGB())
      
      suggestions.push({
        color,
        contrast,
        wcagAA: contrast >= 4.5,
        wcagAAA: contrast >= 7
      })
    }
    
    // 按对比度排序
    suggestions.sort((a, b) => b.contrast - a.contrast)
    
    return suggestions.slice(0, count)
  }
  
  /**
   * 检查颜色组合的可访问性报告
   */
  static getAccessibilityReport(
    foreground: Color,
    background: Color
  ) {
    const contrast = getContrast(foreground.toRGB(), background.toRGB())
    
    return {
      contrast,
      wcagAA: {
        normal: contrast >= 4.5,
        large: contrast >= 3
      },
      wcagAAA: {
        normal: contrast >= 7,
        large: contrast >= 4.5
      },
      recommendation: this.getRecommendation(contrast)
    }
  }
  
  private static getRecommendation(contrast: number): string {
    if (contrast >= 7) {
      return '极佳 - 满足所有WCAG标准'
    } else if (contrast >= 4.5) {
      return '良好 - 满足WCAG AA标准'
    } else if (contrast >= 3) {
      return '可接受 - 仅适用于大文本'
    } else {
      return '差 - 不满足WCAG标准，建议调整'
    }
  }
}

// 导出便捷函数
export const simulateColorBlindness = ColorAccessibility.simulateColorBlindness
export const autoAdjustForWCAG = ColorAccessibility.autoAdjustForWCAG
export const suggestAccessiblePairs = ColorAccessibility.suggestAccessiblePairs
export const getAccessibilityReport = ColorAccessibility.getAccessibilityReport