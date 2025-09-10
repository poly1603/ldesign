/**
 * ColorUtils 测试用例
 */

import { describe, expect, it } from 'vitest'
import { ColorUtils } from '../../src/utils/color-utils'

describe('ColorUtils', () => {
  describe('hexToRgb', () => {
    it('应该正确转换6位十六进制颜色', () => {
      expect(ColorUtils.hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(ColorUtils.hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(ColorUtils.hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(ColorUtils.hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('应该正确转换3位十六进制颜色', () => {
      expect(ColorUtils.hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 })
      expect(ColorUtils.hexToRgb('#00f')).toEqual({ r: 0, g: 0, b: 255 })
      expect(ColorUtils.hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(ColorUtils.hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('应该处理不带#前缀的颜色', () => {
      expect(ColorUtils.hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hexToRgb('f00')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('应该抛出错误对于无效的十六进制颜色', () => {
      expect(() => ColorUtils.hexToRgb('#gggggg')).toThrow('Invalid hex color')
      expect(() => ColorUtils.hexToRgb('#12345')).toThrow('Invalid hex color')
      expect(() => ColorUtils.hexToRgb('invalid')).toThrow('Invalid hex color')
    })
  })

  describe('rgbToHex', () => {
    it('应该正确转换RGB颜色为十六进制', () => {
      expect(ColorUtils.rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(ColorUtils.rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(ColorUtils.rgbToHex(0, 0, 255)).toBe('#0000ff')
      expect(ColorUtils.rgbToHex(255, 255, 255)).toBe('#ffffff')
      expect(ColorUtils.rgbToHex(0, 0, 0)).toBe('#000000')
    })

    it('应该处理边界值', () => {
      expect(ColorUtils.rgbToHex(-10, 300, 128)).toBe('#00ff80')
      expect(ColorUtils.rgbToHex(255.7, 0.3, 127.9)).toBe('#ff0080')
    })
  })

  describe('hslToRgb', () => {
    it('应该正确转换HSL颜色为RGB', () => {
      expect(ColorUtils.hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 })
      expect(ColorUtils.hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
      expect(ColorUtils.hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 })
      expect(ColorUtils.hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('应该处理边界值', () => {
      expect(ColorUtils.hslToRgb(360, 100, 50)).toEqual({ r: 255, g: 0, b: 0 })
      expect(ColorUtils.hslToRgb(-120, 100, 50)).toEqual({ r: 0, g: 0, b: 255 })
    })
  })

  describe('rgbToHsl', () => {
    it('应该正确转换RGB颜色为HSL', () => {
      expect(ColorUtils.rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 })
      expect(ColorUtils.rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 })
      expect(ColorUtils.rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 })
      expect(ColorUtils.rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 })
      expect(ColorUtils.rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 })
    })
  })

  describe('lighten', () => {
    it('应该正确使颜色变亮', () => {
      const result = ColorUtils.lighten('#ff0000', 0.2)
      expect(result).toMatch(/^#[0-9a-f]{6}$/)

      // 黑色变亮应该变成灰色
      const lightenedBlack = ColorUtils.lighten('#000000', 0.5)
      expect(lightenedBlack).not.toBe('#000000')
    })

    it('应该处理边界情况', () => {
      expect(ColorUtils.lighten('#ffffff', 0.5)).toBe('#ffffff') // 白色不能再变亮
      expect(ColorUtils.lighten('#000000', 0)).toBe('#000000') // 不变亮
    })
  })

  describe('darken', () => {
    it('应该正确使颜色变暗', () => {
      const result = ColorUtils.darken('#ff0000', 0.2)
      expect(result).toMatch(/^#[0-9a-f]{6}$/)

      // 白色变暗应该变成灰色
      const darkenedWhite = ColorUtils.darken('#ffffff', 0.5)
      expect(darkenedWhite).not.toBe('#ffffff')
    })

    it('应该处理边界情况', () => {
      expect(ColorUtils.darken('#000000', 0.5)).toBe('#000000') // 黑色不能再变暗
      expect(ColorUtils.darken('#ffffff', 0)).toBe('#ffffff') // 不变暗
    })
  })

  describe('mix', () => {
    it('应该正确混合两种颜色', () => {
      // 红色和蓝色混合应该产生紫色
      const mixed = ColorUtils.mix('#ff0000', '#0000ff', 0.5)
      expect(mixed).toMatch(/^#[0-9a-f]{6}$/)

      // 权重为1应该返回第一种颜色
      expect(ColorUtils.mix('#ff0000', '#0000ff', 1)).toBe('#ff0000')

      // 权重为0应该返回第二种颜色
      expect(ColorUtils.mix('#ff0000', '#0000ff', 0)).toBe('#0000ff')
    })

    it('应该处理边界值', () => {
      expect(ColorUtils.mix('#ff0000', '#0000ff', -0.5)).toBe('#0000ff')
      expect(ColorUtils.mix('#ff0000', '#0000ff', 1.5)).toBe('#ff0000')
    })
  })

  describe('getContrast', () => {
    it('应该正确计算颜色对比度', () => {
      // 黑白对比度应该是21
      expect(ColorUtils.getContrast('#000000', '#ffffff')).toBeCloseTo(21, 1)

      // 相同颜色对比度应该是1
      expect(ColorUtils.getContrast('#ffffff', '#ffffff')).toBeCloseTo(1, 1)
      expect(ColorUtils.getContrast('#000000', '#000000')).toBeCloseTo(1, 1)
    })
  })

  describe('isLight', () => {
    it('应该正确判断浅色', () => {
      expect(ColorUtils.isLight('#ffffff')).toBe(true)
      expect(ColorUtils.isLight('#000000')).toBe(false)
      expect(ColorUtils.isLight('#c0c0c0')).toBe(true) // 更亮的灰色
      expect(ColorUtils.isLight('#404040')).toBe(false)
    })
  })

  describe('isDark', () => {
    it('应该正确判断深色', () => {
      expect(ColorUtils.isDark('#000000')).toBe(true)
      expect(ColorUtils.isDark('#ffffff')).toBe(false)
      expect(ColorUtils.isDark('#404040')).toBe(true)
      expect(ColorUtils.isDark('#c0c0c0')).toBe(false)
    })
  })

  describe('getComplement', () => {
    it('应该正确获取互补色', () => {
      // 红色的互补色应该是青色
      const complement = ColorUtils.getComplement('#ff0000')
      expect(complement).toMatch(/^#[0-9a-f]{6}$/)

      // 互补色的互补色应该回到原色（允许一定误差）
      const doubleComplement = ColorUtils.getComplement(complement)
      expect(doubleComplement.toLowerCase()).toBe('#ff0000')
    })
  })

  describe('generatePalette', () => {
    it('应该生成正确数量的颜色', () => {
      const palette = ColorUtils.generatePalette('#ff0000', 5)
      expect(palette).toHaveLength(5)
      expect(palette.every(color => /^#[0-9a-f]{6}$/.test(color))).toBe(true)
    })

    it('应该包含从暗到亮的颜色变化', () => {
      const palette = ColorUtils.generatePalette('#ff0000', 3)
      expect(palette[0]).toBe('#000000') // 最暗
      expect(palette[2]).toBe('#ffffff') // 最亮
    })
  })
})

