/**
 * @ldesign/theme - 主题切换器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeSwitcher } from '@ldesign/theme'
import type { ThemeSwitcherOptions, SupportedThemeId } from '@ldesign/theme'

// Mock DOM
const mockDocument = {
  createElement: vi.fn(() => ({
    id: '',
    className: '',
    style: { cssText: '' },
    appendChild: vi.fn(),
  })),
  head: {
    appendChild: vi.fn(),
  },
  documentElement: {
    setAttribute: vi.fn(),
    style: {
      setProperty: vi.fn(),
    },
  },
  body: {
    className: '',
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    appendChild: vi.fn(),
  },
  dispatchEvent: vi.fn(),
}

Object.defineProperty(global, 'document', {
  value: mockDocument,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
})

// Mock window
Object.defineProperty(global, 'window', {
  value: {
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    setTimeout: vi.fn(),
  },
})

describe('ThemeSwitcher', () => {
  let themeSwitcher: ThemeSwitcher
  let options: ThemeSwitcherOptions

  beforeEach(() => {
    options = {
      defaultTheme: 'default',
      autoSwitch: false,
      enableTransitions: true,
      transitionDuration: 300,
      persistTheme: true,
      storageKey: 'test-theme',
      onThemeChange: vi.fn(),
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    if (themeSwitcher) {
      themeSwitcher.destroy()
    }
  })

  describe('constructor', () => {
    it('应该使用默认选项创建实例', () => {
      themeSwitcher = new ThemeSwitcher()
      expect(themeSwitcher).toBeInstanceOf(ThemeSwitcher)
    })

    it('应该使用自定义选项创建实例', () => {
      themeSwitcher = new ThemeSwitcher(options)
      expect(themeSwitcher).toBeInstanceOf(ThemeSwitcher)
    })
  })

  describe('switchTheme', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
    })

    it('应该成功切换到春节主题', async () => {
      await themeSwitcher.switchTheme('spring-festival')
      expect(themeSwitcher.getCurrentTheme()).toBe('spring-festival')
    })

    it('应该成功切换到圣诞主题', async () => {
      await themeSwitcher.switchTheme('christmas')
      expect(themeSwitcher.getCurrentTheme()).toBe('christmas')
    })

    it('应该成功切换到默认主题', async () => {
      await themeSwitcher.switchTheme('default')
      expect(themeSwitcher.getCurrentTheme()).toBe('default')
    })

    it('应该触发主题切换回调', async () => {
      const onThemeChange = vi.fn()
      themeSwitcher = new ThemeSwitcher({ ...options, onThemeChange })

      await themeSwitcher.switchTheme('spring-festival')
      expect(onThemeChange).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'spring-festival',
          previousTheme: 'default',
          source: 'manual',
        })
      )
    })

    it('应该更新文档属性', async () => {
      await themeSwitcher.switchTheme('spring-festival')

      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'spring-festival'
      )
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-festival-theme',
        'spring-festival'
      )
    })

    it('应该保存主题到本地存储', async () => {
      await themeSwitcher.switchTheme('spring-festival')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-theme',
        'spring-festival'
      )
    })

    it('应该跳过相同主题的切换', async () => {
      const onThemeChange = vi.fn()
      themeSwitcher = new ThemeSwitcher({ ...options, onThemeChange })

      await themeSwitcher.switchTheme('default')
      expect(onThemeChange).not.toHaveBeenCalled()
    })
  })

  describe('getCurrentTheme', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
    })

    it('应该返回当前主题', () => {
      expect(themeSwitcher.getCurrentTheme()).toBe('default')
    })

    it('应该在切换后返回新主题', async () => {
      await themeSwitcher.switchTheme('spring-festival')
      expect(themeSwitcher.getCurrentTheme()).toBe('spring-festival')
    })
  })

  describe('getAvailableThemes', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
    })

    it('应该返回可用主题列表', () => {
      const themes = themeSwitcher.getAvailableThemes()
      expect(themes).toContain('default')
      expect(themes).toContain('spring-festival')
      expect(themes).toContain('christmas')
    })
  })

  describe('enableAutoSwitch', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
    })

    it('应该启用自动主题切换', () => {
      expect(() => {
        themeSwitcher.enableAutoSwitch()
      }).not.toThrow()
    })

    it('应该设置定时器', () => {
      themeSwitcher.enableAutoSwitch()
      expect(window.setInterval).toHaveBeenCalled()
    })
  })

  describe('disableAutoSwitch', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
      themeSwitcher.enableAutoSwitch()
    })

    it('应该禁用自动主题切换', () => {
      expect(() => {
        themeSwitcher.disableAutoSwitch()
      }).not.toThrow()
    })

    it('应该清除定时器', () => {
      themeSwitcher.disableAutoSwitch()
      expect(window.clearInterval).toHaveBeenCalled()
    })
  })

  describe('destroy', () => {
    beforeEach(() => {
      themeSwitcher = new ThemeSwitcher(options)
      themeSwitcher.enableAutoSwitch()
    })

    it('应该成功销毁实例', () => {
      expect(() => {
        themeSwitcher.destroy()
      }).not.toThrow()
    })

    it('应该清理定时器', () => {
      themeSwitcher.destroy()
      expect(window.clearInterval).toHaveBeenCalled()
    })
  })

  describe('persistence', () => {
    it('应该从本地存储恢复主题', () => {
      mockLocalStorage.getItem.mockReturnValue('spring-festival')
      themeSwitcher = new ThemeSwitcher({ ...options, persistTheme: true })

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-theme')
    })

    it('应该在禁用持久化时不保存主题', async () => {
      themeSwitcher = new ThemeSwitcher({ ...options, persistTheme: false })
      await themeSwitcher.switchTheme('spring-festival')

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('transitions', () => {
    it('应该在启用过渡时创建过渡元素', () => {
      themeSwitcher = new ThemeSwitcher({ ...options, enableTransitions: true })
      expect(mockDocument.createElement).toHaveBeenCalled()
    })

    it('应该在禁用过渡时不创建过渡元素', () => {
      themeSwitcher = new ThemeSwitcher({
        ...options,
        enableTransitions: false,
      })
      // 验证没有为过渡创建额外元素
    })
  })
})

describe('Theme Recommendation', () => {
  describe('getRecommendedTheme', () => {
    it('应该在春节期间推荐春节主题', async () => {
      // Mock 春节期间的日期
      const mockDate = new Date('2024-02-10') // 春节期间
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const { getRecommendedTheme } = await import('@ldesign/theme')
      const recommended = getRecommendedTheme()

      expect(recommended).toBe('spring-festival')
    })

    it('应该在圣诞期间推荐圣诞主题', async () => {
      // Mock 圣诞期间的日期
      const mockDate = new Date('2024-12-25') // 圣诞节
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const { getRecommendedTheme } = await import('@ldesign/theme')
      const recommended = getRecommendedTheme()

      expect(recommended).toBe('christmas')
    })

    it('应该在平时推荐默认主题', async () => {
      // Mock 平时的日期
      const mockDate = new Date('2024-06-15') // 普通日期
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const { getRecommendedTheme } = await import('@ldesign/theme')
      const recommended = getRecommendedTheme()

      expect(recommended).toBe('default')
    })
  })
})
