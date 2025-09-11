/**
 * ThemeManager 类单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeManager } from '../../src/themes/ThemeManager'
import type { ThemeConfig } from '../../src/core/types'

describe('ThemeManager', () => {
  let themeManager: ThemeManager

  beforeEach(() => {
    themeManager = new ThemeManager()
  })

  describe('预设主题', () => {
    it('应该包含预设主题', () => {
      const themeNames = themeManager.getThemeNames()

      expect(themeNames).toContain('light')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('colorful')
    })

    it('应该能够获取预设主题', () => {
      const lightTheme = themeManager.getTheme('light')
      const darkTheme = themeManager.getTheme('dark')
      const colorfulTheme = themeManager.getTheme('colorful')

      expect(lightTheme).toBeDefined()
      expect(lightTheme?.name).toBe('light')
      expect(darkTheme).toBeDefined()
      expect(darkTheme?.name).toBe('dark')
      expect(colorfulTheme).toBeDefined()
      expect(colorfulTheme?.name).toBe('colorful')
    })

    it('应该默认使用浅色主题', () => {
      const currentTheme = themeManager.getCurrentTheme()

      expect(currentTheme.name).toBe('light')
    })
  })

  describe('主题注册', () => {
    it('应该能够注册自定义主题', () => {
      const customTheme: ThemeConfig = {
        name: 'custom',
        colors: {
          primary: '#ff0000',
          background: '#ffffff',
          text: '#333333',
          palette: ['#ff0000', '#00ff00', '#0000ff'],
        },
        font: {
          family: 'Arial',
          size: 14,
        },
      }

      themeManager.registerTheme(customTheme)

      expect(themeManager.hasTheme('custom')).toBe(true)
      expect(themeManager.getTheme('custom')).toEqual(customTheme)
    })

    it('应该在注册无效主题时抛出错误', () => {
      expect(() => {
        themeManager.registerTheme({} as ThemeConfig)
      }).toThrow('主题必须有有效的名称')

      expect(() => {
        themeManager.registerTheme({
          name: 'invalid',
        } as ThemeConfig)
      }).toThrow('主题必须包含颜色配置')

      expect(() => {
        themeManager.registerTheme({
          name: 'invalid',
          colors: {},
        } as ThemeConfig)
      }).toThrow('主题缺少必需的颜色配置')
    })
  })

  describe('主题切换', () => {
    it('应该能够切换到已注册的主题', () => {
      themeManager.setCurrentTheme('dark')

      expect(themeManager.getCurrentTheme().name).toBe('dark')
    })

    it('应该在切换到不存在的主题时抛出错误', () => {
      expect(() => {
        themeManager.setCurrentTheme('non-existent')
      }).toThrow('主题 "non-existent" 不存在')
    })
  })

  describe('主题管理', () => {
    it('应该能够检查主题是否存在', () => {
      expect(themeManager.hasTheme('light')).toBe(true)
      expect(themeManager.hasTheme('dark')).toBe(true)
      expect(themeManager.hasTheme('non-existent')).toBe(false)
    })

    it('应该能够移除自定义主题', () => {
      const customTheme: ThemeConfig = {
        name: 'removable',
        colors: {
          primary: '#ff0000',
          background: '#ffffff',
          text: '#333333',
        },
      }

      themeManager.registerTheme(customTheme)
      expect(themeManager.hasTheme('removable')).toBe(true)

      themeManager.removeTheme('removable')
      expect(themeManager.hasTheme('removable')).toBe(false)
    })

    it('应该阻止移除预设主题', () => {
      expect(() => {
        themeManager.removeTheme('light')
      }).toThrow('不能移除预设主题')

      expect(() => {
        themeManager.removeTheme('dark')
      }).toThrow('不能移除预设主题')
    })
  })

  describe('自定义主题创建', () => {
    it('应该能够基于现有主题创建自定义主题', () => {
      const customTheme = themeManager.createCustomTheme(
        'custom-light',
        'light',
        {
          colors: {
            primary: '#ff0000',
          },
        }
      )

      expect(customTheme.name).toBe('custom-light')
      expect(customTheme.colors.primary).toBe('#ff0000')
      expect(customTheme.colors.background).toBeDefined() // 继承自基础主题
      expect(themeManager.hasTheme('custom-light')).toBe(true)
    })

    it('应该在基础主题不存在时抛出错误', () => {
      expect(() => {
        themeManager.createCustomTheme('custom', 'non-existent')
      }).toThrow('基础主题 "non-existent" 不存在')
    })
  })

  describe('ECharts 主题配置', () => {
    it('应该能够获取 ECharts 主题配置', () => {
      const echartsTheme = themeManager.getEChartsTheme('light')

      expect(echartsTheme).toBeDefined()
      expect(echartsTheme).toHaveProperty('color')
      expect(echartsTheme).toHaveProperty('backgroundColor')
      expect(echartsTheme).toHaveProperty('textStyle')
      expect(echartsTheme).toHaveProperty('title')
      expect(echartsTheme).toHaveProperty('legend')
    })

    it('应该在主题不存在时抛出错误', () => {
      expect(() => {
        themeManager.getEChartsTheme('non-existent')
      }).toThrow('主题 "non-existent" 不存在')
    })

    it('应该能够获取当前主题的 ECharts 配置', () => {
      themeManager.setCurrentTheme('dark')
      const echartsTheme = themeManager.getEChartsTheme()

      expect(echartsTheme).toBeDefined()
      // 应该反映深色主题的特征
      expect(echartsTheme.textStyle.color).toBe('#ffffff') // 深色主题使用白色文字
    })
  })

  describe('DOM 主题应用', () => {
    it('应该能够应用主题到 DOM', () => {
      const testElement = document.createElement('div')
      document.body.appendChild(testElement)

      themeManager.applyThemeToDOM(testElement)

      // 检查是否设置了 CSS 变量
      const style = testElement.style
      expect(style.getPropertyValue('--ldesign-brand-color')).toBeTruthy()

      document.body.removeChild(testElement)
    })

    it('应该能够从 CSS 变量创建主题', () => {
      const testElement = document.createElement('div')
      testElement.style.setProperty('--ldesign-brand-color', '#ff0000')
      testElement.style.setProperty('--ldesign-bg-color-page', '#ffffff')
      testElement.style.setProperty('--ldesign-text-color-primary', '#333333')
      testElement.style.setProperty('--ldesign-border-color', '#cccccc')
      document.body.appendChild(testElement)

      // 在测试环境中，模拟 getComputedStyle 的行为
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = vi.fn().mockReturnValue({
        getPropertyValue: (prop: string) => {
          return testElement.style.getPropertyValue(prop)
        }
      } as any)

      try {
        const theme = themeManager.createThemeFromCSS('css-theme', testElement)

        expect(theme.name).toBe('css-theme')
        expect(theme.colors.primary).toBe('#ff0000')
        expect(themeManager.hasTheme('css-theme')).toBe(true)
      } finally {
        // 恢复原始的 getComputedStyle
        window.getComputedStyle = originalGetComputedStyle
      }

      document.body.removeChild(testElement)
    })
  })

  describe('主题验证', () => {
    it('应该验证主题配置的完整性', () => {
      const validTheme: ThemeConfig = {
        name: 'valid',
        colors: {
          primary: '#ff0000',
          background: '#ffffff',
          text: '#333333',
        },
      }

      expect(() => {
        themeManager.registerTheme(validTheme)
      }).not.toThrow()
    })

    it('应该检测缺少必需颜色的主题', () => {
      const incompleteTheme = {
        name: 'incomplete',
        colors: {
          primary: '#ff0000',
          // 缺少 background 和 text
        },
      } as ThemeConfig

      expect(() => {
        themeManager.registerTheme(incompleteTheme)
      }).toThrow('主题缺少必需的颜色配置')
    })
  })

  describe('主题克隆和合并', () => {
    it('应该深度克隆主题配置', () => {
      const originalTheme = themeManager.getTheme('light')!
      const customTheme = themeManager.createCustomTheme('cloned', 'light', {
        colors: { primary: '#ff0000' },
      })

      // 修改自定义主题不应影响原主题
      expect(originalTheme.colors.primary).not.toBe('#ff0000')
      expect(customTheme.colors.primary).toBe('#ff0000')
    })
  })
})
