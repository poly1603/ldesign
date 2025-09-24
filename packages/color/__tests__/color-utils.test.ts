/**
 * 颜色工具函数测试
 */

import { describe, expect, it } from 'vitest'
import {
  adjustBrightness,
  adjustHue,
  adjustSaturation,
  blendColors,
  generateAnalogousPalette,
  generateColorGradient,
  generateComplementaryPalette,
  generateLinearGradient,
  generateMonochromaticPalette,
  generateRadialGradient,
  generateTetradicPalette,
  generateTriadicPalette,
  getBestTextColor,
  getContrastRatio,
  getPerceivedBrightness,
  interpolateColors,
  isAccessible,
  isDark,
  isLight,
} from '../src/utils/color-utils'

describe('color-utils', () => {
  describe('对比度计算', () => {
    it('应该正确计算对比度', () => {
      // 黑白对比度应该是21
      expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)

      // 相同颜色对比度应该是1
      expect(getContrastRatio('#ff0000', '#ff0000')).toBe(1)

      // 测试一些常见的颜色组合
      expect(getContrastRatio('#1890ff', '#ffffff')).toBeGreaterThan(3)
    })

    it('应该正确检查可访问性', () => {
      // 黑白组合应该符合AAA标准
      expect(isAccessible('#000000', '#ffffff', 'AAA')).toBe(true)

      // 低对比度组合应该不符合标准
      expect(isAccessible('#cccccc', '#ffffff', 'AA')).toBe(false)
    })
  })

  describe('颜色混合', () => {
    it('应该正确混合颜色', () => {
      // 正常混合模式
      const result = blendColors('#ff0000', '#0000ff', 'normal', 0.5)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('应该支持不同的混合模式', () => {
      const base = '#ff0000'
      const overlay = '#0000ff'

      const modes = ['multiply', 'screen', 'overlay', 'soft-light', 'hard-light']

      modes.forEach(mode => {
        const result = blendColors(base, overlay, mode as any, 0.5)
        expect(result).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })

  describe('颜色调整', () => {
    it('应该正确调整亮度', () => {
      const color = '#808080'

      // 增加亮度
      const brighter = adjustBrightness(color, 50)
      expect(getPerceivedBrightness(brighter)).toBeGreaterThan(getPerceivedBrightness(color))

      // 减少亮度
      const darker = adjustBrightness(color, -50)
      expect(getPerceivedBrightness(darker)).toBeLessThan(getPerceivedBrightness(color))
    })

    it('应该正确调整饱和度', () => {
      const result = adjustSaturation('#ff0000', 50)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('应该正确调整色相', () => {
      const result = adjustHue('#ff0000', 120)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('渐变生成', () => {
    it('应该生成线性渐变CSS', () => {
      const config = {
        direction: 'to-right' as const,
        stops: [
          { color: '#ff0000', position: 0 },
          { color: '#0000ff', position: 100 },
        ],
      }

      const result = generateLinearGradient(config)
      expect(result).toContain('linear-gradient')
      expect(result).toContain('to right')
      expect(result).toContain('#ff0000')
      expect(result).toContain('#0000ff')
    })

    it('应该生成径向渐变CSS', () => {
      const stops = [
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 },
      ]

      const result = generateRadialGradient(stops)
      expect(result).toContain('radial-gradient')
      expect(result).toContain('#ff0000')
      expect(result).toContain('#0000ff')
    })
  })

  describe('颜色插值', () => {
    it('应该正确插值颜色', () => {
      const result = interpolateColors('#ff0000', '#0000ff', 0.5)
      expect(result).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('应该生成颜色渐变序列', () => {
      const colors = generateColorGradient('#ff0000', '#0000ff', 5)
      expect(colors).toHaveLength(5)
      expect(colors[0]).toBe('#ff0000')
      expect(colors[4]).toBe('#0000ff')
    })
  })

  describe('调色板生成', () => {
    it('应该生成单色调色板', () => {
      const palette = generateMonochromaticPalette('#1890ff', 5)
      expect(palette).toHaveLength(5)
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('应该生成类似色调色板', () => {
      const palette = generateAnalogousPalette('#1890ff', 5)
      expect(palette).toHaveLength(5)
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('应该生成互补色调色板', () => {
      const palette = generateComplementaryPalette('#1890ff')
      expect(palette).toHaveLength(2)
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('应该生成三元色调色板', () => {
      const palette = generateTriadicPalette('#1890ff')
      expect(palette).toHaveLength(3)
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    it('应该生成四元色调色板', () => {
      const palette = generateTetradicPalette('#1890ff')
      expect(palette).toHaveLength(4)
      palette.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })
  })

  describe('颜色感知', () => {
    it('应该正确计算感知亮度', () => {
      expect(getPerceivedBrightness('#ffffff')).toBe(255)
      expect(getPerceivedBrightness('#000000')).toBe(0)
      expect(getPerceivedBrightness('#ff0000')).toBeGreaterThan(0)
      expect(getPerceivedBrightness('#ff0000')).toBeLessThan(255)
    })

    it('应该正确判断深色和浅色', () => {
      expect(isDark('#000000')).toBe(true)
      expect(isDark('#ffffff')).toBe(false)
      expect(isLight('#ffffff')).toBe(true)
      expect(isLight('#000000')).toBe(false)
    })

    it('应该返回最佳文本颜色', () => {
      expect(getBestTextColor('#000000')).toBe('#ffffff')
      expect(getBestTextColor('#ffffff')).toBe('#000000')
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的hex颜色', () => {
      expect(() => getContrastRatio('invalid', '#ffffff')).toThrow()
      expect(() => blendColors('invalid', '#ffffff')).toThrow()
      expect(() => adjustBrightness('invalid', 50)).toThrow()
    })

    it('应该处理边界值', () => {
      // 亮度调整边界
      expect(() => adjustBrightness('#ffffff', 200)).not.toThrow()
      expect(() => adjustBrightness('#000000', -200)).not.toThrow()

      // 插值因子边界
      expect(() => interpolateColors('#ff0000', '#0000ff', -1)).not.toThrow()
      expect(() => interpolateColors('#ff0000', '#0000ff', 2)).not.toThrow()
    })
  })
})
