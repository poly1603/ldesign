/**
 * 可访问性检查功能测试
 */

import { describe, expect, it } from 'vitest'
import {
  checkAccessibility,
  checkColorBlindnessAccessibility,
  getAccessibleColorSuggestions,
  simulateColorBlindness,
} from '../src/utils/accessibility'

describe('accessibility', () => {
  describe('可访问性检查', () => {
    it('应该正确检查WCAG AA标准', () => {
      // 黑白组合应该符合AA标准
      const result = checkAccessibility('#000000', '#ffffff')
      expect(result.isAccessible).toBe(true)
      expect(result.level).toBe('AAA') // 黑白对比度很高，应该达到AAA
      expect(result.contrastRatio).toBeCloseTo(21, 1)
    })

    it('应该正确检查WCAG AAA标准', () => {
      // 测试中等对比度的颜色
      const result = checkAccessibility('#666666', '#ffffff')
      expect(result.contrastRatio).toBeGreaterThan(1)

      if (result.contrastRatio >= 7) {
        expect(result.level).toBe('AAA')
      } else if (result.contrastRatio >= 4.5) {
        expect(result.level).toBe('AA')
      } else {
        expect(result.level).toBeNull()
      }
    })

    it('应该为大文本提供不同的标准', () => {
      const normalResult = checkAccessibility('#666666', '#ffffff', 'normal')
      const largeResult = checkAccessibility('#666666', '#ffffff', 'large')

      // 大文本的要求更宽松
      if (!normalResult.isAccessible && largeResult.isAccessible) {
        expect(largeResult.contrastRatio).toBeGreaterThanOrEqual(3)
      }
    })

    it('应该提供改进建议', () => {
      const result = checkAccessibility('#cccccc', '#ffffff')

      if (!result.isAccessible) {
        expect(result.recommendations.length).toBeGreaterThan(0)
        expect(result.recommendations[0]).toContain('对比度')
      }
    })
  })

  describe('颜色盲模拟', () => {
    it('应该模拟红色盲', () => {
      const result = simulateColorBlindness('#ff0000', 'protanopia')
      expect(result.original).toBe('#ff0000')
      expect(result.simulated).toMatch(/^#[0-9a-f]{6}$/i)
      expect(result.type).toBe('protanopia')
      expect(result.severity).toBe(1)
    })

    it('应该模拟绿色盲', () => {
      const result = simulateColorBlindness('#00ff00', 'deuteranopia')
      expect(result.original).toBe('#00ff00')
      expect(result.simulated).toMatch(/^#[0-9a-f]{6}$/i)
      expect(result.type).toBe('deuteranopia')
    })

    it('应该模拟蓝色盲', () => {
      const result = simulateColorBlindness('#0000ff', 'tritanopia')
      expect(result.original).toBe('#0000ff')
      expect(result.simulated).toMatch(/^#[0-9a-f]{6}$/i)
      expect(result.type).toBe('tritanopia')
    })

    it('应该模拟全色盲', () => {
      const result = simulateColorBlindness('#ff0000', 'achromatopsia')
      expect(result.original).toBe('#ff0000')
      expect(result.simulated).toMatch(/^#[0-9a-f]{6}$/i)
      expect(result.type).toBe('achromatopsia')

      // 全色盲应该产生灰色
      const simulated = result.simulated
      const r = Number.parseInt(simulated.slice(1, 3), 16)
      const g = Number.parseInt(simulated.slice(3, 5), 16)
      const b = Number.parseInt(simulated.slice(5, 7), 16)

      // RGB值应该相近（灰色）
      expect(Math.abs(r - g)).toBeLessThan(5)
      expect(Math.abs(g - b)).toBeLessThan(5)
      expect(Math.abs(r - b)).toBeLessThan(5)
    })

    it('应该支持严重程度调节', () => {
      const mild = simulateColorBlindness('#ff0000', 'protanopia', 0.3)
      const severe = simulateColorBlindness('#ff0000', 'protanopia', 1.0)

      expect(mild.severity).toBe(0.3)
      expect(severe.severity).toBe(1.0)
      expect(mild.simulated).not.toBe(severe.simulated)
    })
  })

  describe('颜色盲可访问性检查', () => {
    it('应该检查颜色组合对颜色盲用户的影响', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff']
      const results = checkColorBlindnessAccessibility(colors)

      expect(results).toHaveLength(3) // 默认检查3种颜色盲类型

      results.forEach(result => {
        expect(['protanopia', 'deuteranopia', 'tritanopia']).toContain(result.type)
        expect(Array.isArray(result.issues)).toBe(true)
      })
    })

    it('应该识别问题颜色组合', () => {
      // 红绿组合对红绿色盲用户来说可能有问题
      const colors = ['#ff0000', '#00ff00']
      const results = checkColorBlindnessAccessibility(colors, ['protanopia', 'deuteranopia'])

      // 应该检测到一些问题
      const hasIssues = results.some(result => result.issues.length > 0)
      expect(hasIssues).toBe(true)
    })
  })

  describe('可访问颜色建议', () => {
    it('应该生成符合WCAG标准的颜色建议', () => {
      const suggestions = getAccessibleColorSuggestions('#1890ff', 'AA', 'normal')

      expect(Array.isArray(suggestions)).toBe(true)

      // 验证建议的颜色确实符合标准
      suggestions.slice(0, 3).forEach(suggestion => {
        const result = checkAccessibility(suggestion.foreground, suggestion.background, 'normal')
        expect(result.isAccessible).toBe(true)
        expect(result.level).toBeTruthy()
      })
    })

    it('应该为不同WCAG等级生成不同建议', () => {
      const aaSuggestions = getAccessibleColorSuggestions('#1890ff', 'AA')
      const aaaSuggestions = getAccessibleColorSuggestions('#1890ff', 'AAA')

      expect(Array.isArray(aaSuggestions)).toBe(true)
      expect(Array.isArray(aaaSuggestions)).toBe(true)

      // AAA标准更严格，建议数量可能更少
      if (aaaSuggestions.length > 0) {
        aaaSuggestions.slice(0, 2).forEach(suggestion => {
          const result = checkAccessibility(suggestion.foreground, suggestion.background)
          expect(result.contrastRatio).toBeGreaterThanOrEqual(7)
        })
      }
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的hex颜色', () => {
      expect(() => checkAccessibility('invalid', '#ffffff')).toThrow()
      expect(() => simulateColorBlindness('invalid', 'protanopia')).toThrow()
    })

    it('应该处理边界值', () => {
      // 严重程度边界值
      expect(() => simulateColorBlindness('#ff0000', 'protanopia', -1)).not.toThrow()
      expect(() => simulateColorBlindness('#ff0000', 'protanopia', 2)).not.toThrow()

      const result1 = simulateColorBlindness('#ff0000', 'protanopia', -1)
      const result2 = simulateColorBlindness('#ff0000', 'protanopia', 2)

      expect(result1.severity).toBe(0)
      expect(result2.severity).toBe(1)
    })
  })

  describe('实际使用场景', () => {
    it('应该能检查常见的UI颜色组合', () => {
      const uiColors = [
        { fg: '#ffffff', bg: '#1890ff' }, // 主按钮
        { fg: '#000000', bg: '#f0f0f0' }, // 次要按钮
        { fg: '#ff4d4f', bg: '#ffffff' }, // 错误文本
        { fg: '#52c41a', bg: '#ffffff' }, // 成功文本
      ]

      uiColors.forEach(({ fg, bg }) => {
        const result = checkAccessibility(fg, bg)
        expect(typeof result.isAccessible).toBe('boolean')
        expect(typeof result.contrastRatio).toBe('number')
      })
    })

    it('应该能为品牌色生成可访问的配色方案', () => {
      const brandColor = '#1890ff'
      const suggestions = getAccessibleColorSuggestions(brandColor, 'AA')

      expect(suggestions.length).toBeGreaterThan(0)

      // 验证建议的颜色确实符合可访问性标准
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0]
        const result = checkAccessibility(firstSuggestion.foreground, firstSuggestion.background)
        expect(result.isAccessible).toBe(true)
      }
    })
  })
})
