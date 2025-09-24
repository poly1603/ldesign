import { describe, it, expect } from 'vitest'
import {
  isHexColor,
  isRgbColor,
  isHslColor,
  isHsvColor,
  isNamedColor,
  isColorValue,
  isColorConfig,
  isThemeConfig,
  assertColorValue,
  assertColorConfig,
  assertThemeConfig,
} from '../src/utils/type-guards'

describe('类型守卫', () => {
  describe('颜色格式检查', () => {
    it('应该正确识别hex颜色', () => {
      expect(isHexColor('#ff0000')).toBe(true)
      expect(isHexColor('#000')).toBe(true)
      expect(isHexColor('#FFFFFF')).toBe(true)
      expect(isHexColor('invalid')).toBe(false)
      expect(isHexColor('#gg0000')).toBe(false)
      expect(isHexColor('#12345')).toBe(false)
    })

    it('应该正确识别RGB颜色', () => {
      expect(isRgbColor('rgb(255, 0, 0)')).toBe(true)
      expect(isRgbColor('rgba(255, 0, 0, 0.5)')).toBe(true)
      expect(isRgbColor('rgb(255,0,0)')).toBe(true)
      expect(isRgbColor('invalid')).toBe(false)
      expect(isRgbColor('rgb(256, 0, 0)')).toBe(true) // 格式正确，但值超范围
    })

    it('应该正确识别HSL颜色', () => {
      expect(isHslColor('hsl(0, 100%, 50%)')).toBe(true)
      expect(isHslColor('hsla(0, 100%, 50%, 0.5)')).toBe(true)
      expect(isHslColor('hsl(360,100%,50%)')).toBe(true)
      expect(isHslColor('invalid')).toBe(false)
      expect(isHslColor('hsl(361, 100%, 50%)')).toBe(true) // 格式正确，但值超范围
    })

    it('应该正确识别HSV颜色', () => {
      expect(isHsvColor('hsv(0, 100%, 50%)')).toBe(true)
      expect(isHsvColor('hsv(360, 100%, 100%)')).toBe(true)
      expect(isHsvColor('invalid')).toBe(false)
      expect(isHsvColor('hsv(361, 100%, 50%)')).toBe(true) // 格式正确，但值超范围
    })

    it('应该正确识别命名颜色', () => {
      expect(isNamedColor('red')).toBe(true)
      expect(isNamedColor('blue')).toBe(true)
      expect(isNamedColor('transparent')).toBe(true)
      expect(isNamedColor('invalid-color')).toBe(false)
    })

    it('应该正确识别颜色值', () => {
      expect(isColorValue('#ff0000')).toBe(true)
      expect(isColorValue('rgb(255, 0, 0)')).toBe(true)
      expect(isColorValue('hsl(0, 100%, 50%)')).toBe(true)
      expect(isColorValue('red')).toBe(true)
      expect(isColorValue('invalid')).toBe(false)
    })
  })

  describe('配置对象检查', () => {
    it('应该正确识别颜色配置', () => {
      const validConfig = {
        primary: '#1890ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#f5222d',
      }
      expect(isColorConfig(validConfig)).toBe(true)

      const invalidConfig = {
        primary: 'invalid-color',
      }
      expect(isColorConfig(invalidConfig)).toBe(false)

      expect(isColorConfig(null)).toBe(false)
      expect(isColorConfig('string')).toBe(false)
    })

    it('应该正确识别主题配置', () => {
      const validTheme = {
        name: 'test-theme',
        displayName: '测试主题',
        light: {
          primary: '#1890ff',
        },
        dark: {
          primary: '#177ddc',
        },
      }
      expect(isThemeConfig(validTheme)).toBe(true)

      const invalidTheme = {
        name: 'test-theme',
        // 缺少 light 配置
        dark: {
          primary: '#177ddc',
        },
      }
      expect(isThemeConfig(invalidTheme)).toBe(false)

      expect(isThemeConfig(null)).toBe(false)
      expect(isThemeConfig('string')).toBe(false)
    })
  })

  describe('断言函数', () => {
    it('应该通过有效颜色值的断言', () => {
      expect(() => assertColorValue('#ff0000')).not.toThrow()
      expect(() => assertColorValue('rgb(255, 0, 0)')).not.toThrow()
      expect(() => assertColorValue('red')).not.toThrow()
    })

    it('应该拒绝无效颜色值', () => {
      expect(() => assertColorValue('invalid')).toThrow()
      expect(() => assertColorValue(null as any)).toThrow()
      expect(() => assertColorValue(123 as any)).toThrow()
    })

    it('应该通过有效颜色配置的断言', () => {
      const validConfig = {
        primary: '#1890ff',
        success: '#52c41a',
      }
      expect(() => assertColorConfig(validConfig)).not.toThrow()
    })

    it('应该拒绝无效颜色配置', () => {
      const invalidConfig = {
        primary: 'invalid-color',
      }
      expect(() => assertColorConfig(invalidConfig)).toThrow()
      expect(() => assertColorConfig(null)).toThrow()
    })

    it('应该通过有效主题配置的断言', () => {
      const validTheme = {
        name: 'test-theme',
        displayName: '测试主题',
        light: {
          primary: '#1890ff',
        },
        dark: {
          primary: '#177ddc',
        },
      }
      expect(() => assertThemeConfig(validTheme)).not.toThrow()
    })

    it('应该拒绝无效主题配置', () => {
      const invalidTheme = {
        name: 'test-theme',
        light: {
          primary: 'invalid-color',
        },
      }
      expect(() => assertThemeConfig(invalidTheme)).toThrow()
      expect(() => assertThemeConfig(null)).toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串', () => {
      expect(isHexColor('')).toBe(false)
      expect(isRgbColor('')).toBe(false)
      expect(isHslColor('')).toBe(false)
      expect(isColorValue('')).toBe(false)
    })

    it('应该处理undefined和null', () => {
      expect(isColorValue(undefined as any)).toBe(false)
      expect(isColorValue(null as any)).toBe(false)
      expect(isColorConfig(undefined)).toBe(false)
      expect(isColorConfig(null)).toBe(false)
    })

    it('应该处理非字符串类型', () => {
      expect(isHexColor(123 as any)).toBe(false)
      expect(isRgbColor([] as any)).toBe(false)
      expect(isHslColor({} as any)).toBe(false)
    })
  })
})
