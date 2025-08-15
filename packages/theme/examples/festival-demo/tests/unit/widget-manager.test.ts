/**
 * @ldesign/theme - 挂件管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createWidgetManager } from '@ldesign/theme'
import type { WidgetManager, FestivalThemeConfig } from '@ldesign/theme'

// Mock DOM
Object.defineProperty(window, 'document', {
  value: {
    createElement: vi.fn(() => ({
      id: '',
      className: '',
      style: { cssText: '' },
      appendChild: vi.fn(),
    })),
    head: {
      appendChild: vi.fn(),
    },
    querySelectorAll: vi.fn(() => []),
    body: {
      appendChild: vi.fn(),
    },
  },
})

describe('WidgetManager', () => {
  let widgetManager: WidgetManager
  let mockElement: HTMLElement
  let mockThemeConfig: FestivalThemeConfig

  beforeEach(() => {
    widgetManager = createWidgetManager()

    // 创建模拟元素
    mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
        position: '',
      },
      appendChild: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      getAttribute: vi.fn(),
      remove: vi.fn(),
    } as any

    // 创建模拟主题配置
    mockThemeConfig = {
      id: 'test-theme',
      name: '测试主题',
      description: '用于测试的主题',
      version: '1.0.0',
      colorConfig: {
        name: 'test-theme',
        displayName: '测试主题',
        description: '用于测试的主题',
        light: {
          primary: '#1890ff',
          secondary: '#722ed1',
          success: '#52c41a',
          warning: '#faad14',
          danger: '#f5222d',
          gray: '#8c8c8c',
        },
        dark: {
          primary: '#1890ff',
          secondary: '#722ed1',
          success: '#52c41a',
          warning: '#faad14',
          danger: '#f5222d',
          gray: '#8c8c8c',
        },
      },
      widgets: [
        {
          type: 'button',
          position: 'top-right',
          icon: {
            content: '<circle cx="50" cy="50" r="20" fill="currentColor"/>',
            viewBox: '0 0 100 100',
          },
          size: 'md',
          animation: 'glow',
          opacity: 0.8,
          zIndex: 1000,
          enabled: true,
        },
      ],
      cssVariables: {
        '--festival-primary': '#1890ff',
        '--festival-secondary': '#722ed1',
        '--festival-accent': '#52c41a',
        '--festival-background': '#ffffff',
        '--festival-text': '#000000',
        '--festival-border': '#d9d9d9',
        '--festival-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('registerThemeWidgets', () => {
    it('应该成功注册主题挂件', () => {
      expect(() => {
        widgetManager.registerThemeWidgets(mockThemeConfig)
      }).not.toThrow()
    })

    it('应该能够获取已注册的主题', () => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
      const themes = widgetManager.getAvailableThemes()
      expect(themes).toContain('test-theme')
    })
  })

  describe('applyWidget', () => {
    beforeEach(() => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
    })

    it('应该成功为元素应用挂件', () => {
      widgetManager.applyWidget(mockElement, 'button')

      expect(mockElement.classList.add).toHaveBeenCalled()
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-type',
        'button'
      )
    })

    it('应该设置正确的挂件属性', () => {
      widgetManager.applyWidget(mockElement, 'button')

      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-type',
        'button'
      )
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-theme',
        'default'
      )
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-position',
        'top-right'
      )
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-size',
        'md'
      )
      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'data-widget-animation',
        'glow'
      )
    })

    it('应该设置CSS自定义属性', () => {
      widgetManager.applyWidget(mockElement, 'button')

      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        '--widget-opacity',
        '0.8'
      )
      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        '--widget-z-index',
        '1000'
      )
    })
  })

  describe('removeWidget', () => {
    beforeEach(() => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
      widgetManager.applyWidget(mockElement, 'button')
    })

    it('应该成功移除元素的挂件', () => {
      widgetManager.removeWidget(mockElement, 'button')

      expect(mockElement.classList.remove).toHaveBeenCalled()
    })

    it('应该移除挂件相关的属性', () => {
      widgetManager.removeWidget(mockElement, 'button')

      expect(mockElement.removeAttribute).toHaveBeenCalledWith(
        'data-widget-type'
      )
      expect(mockElement.removeAttribute).toHaveBeenCalledWith(
        'data-widget-theme'
      )
    })

    it('应该移除CSS自定义属性', () => {
      widgetManager.removeWidget(mockElement, 'button')

      expect(mockElement.style.removeProperty).toHaveBeenCalledWith(
        '--widget-opacity'
      )
      expect(mockElement.style.removeProperty).toHaveBeenCalledWith(
        '--widget-z-index'
      )
    })
  })

  describe('switchTheme', () => {
    beforeEach(() => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
      widgetManager.applyWidget(mockElement, 'button')
    })

    it('应该成功切换主题', () => {
      expect(() => {
        widgetManager.switchTheme('test-theme')
      }).not.toThrow()
    })

    it('应该更新当前主题', () => {
      widgetManager.switchTheme('test-theme')
      expect(widgetManager.getCurrentTheme()).toBe('test-theme')
    })
  })

  describe('getCurrentTheme', () => {
    it('应该返回默认主题', () => {
      expect(widgetManager.getCurrentTheme()).toBe('default')
    })

    it('应该返回切换后的主题', () => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
      widgetManager.switchTheme('test-theme')
      expect(widgetManager.getCurrentTheme()).toBe('test-theme')
    })
  })

  describe('getAvailableThemes', () => {
    it('应该返回空数组当没有注册主题时', () => {
      expect(widgetManager.getAvailableThemes()).toEqual([])
    })

    it('应该返回已注册的主题列表', () => {
      widgetManager.registerThemeWidgets(mockThemeConfig)
      const themes = widgetManager.getAvailableThemes()
      expect(themes).toContain('test-theme')
    })
  })
})

describe('Widget Helper Functions', () => {
  describe('validateWidgetConfig', () => {
    it('应该验证有效的挂件配置', async () => {
      const { validateWidgetConfig } = await import('@ldesign/theme')

      const validConfig = {
        type: 'button' as const,
        position: 'top-right' as const,
        icon: {
          content: '<circle cx="50" cy="50" r="20"/>',
          viewBox: '0 0 100 100',
        },
        size: 'md' as const,
        animation: 'glow' as const,
        opacity: 0.8,
        zIndex: 1000,
        enabled: true,
      }

      expect(validateWidgetConfig(validConfig)).toBe(true)
    })

    it('应该拒绝无效的挂件配置', async () => {
      const { validateWidgetConfig } = await import('@ldesign/theme')

      const invalidConfig = {
        type: 'invalid-type' as any,
        position: 'top-right' as const,
        icon: {
          content: '<circle cx="50" cy="50" r="20"/>',
          viewBox: '0 0 100 100',
        },
        size: 'md' as const,
        animation: 'glow' as const,
      }

      expect(validateWidgetConfig(invalidConfig)).toBe(false)
    })
  })

  describe('generateWidgetClass', () => {
    it('应该生成正确的挂件类名', async () => {
      const { generateWidgetClass } = await import('@ldesign/theme')

      const className = generateWidgetClass('button', 'top-right', 'md')
      expect(className).toBe('ldesign-widget-button-top-right-md')
    })

    it('应该处理可选参数', async () => {
      const { generateWidgetClass } = await import('@ldesign/theme')

      const className = generateWidgetClass('button')
      expect(className).toBe('ldesign-widget-button')
    })
  })
})
