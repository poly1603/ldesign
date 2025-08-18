/**
 * 主题管理器测试用例
 *
 * 测试主题管理器的核心功能，包括：
 * - 初始化
 * - 主题切换
 * - 模式切换
 * - 事件系统
 * - 错误处理
 *
 * @version 0.1.0
 * @author ldesign
 */

import type { ThemeConfig } from '../src/core/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'

// ==================== 测试数据 ====================

const mockThemeConfig: ThemeConfig = {
  name: 'test-theme',
  displayName: 'Test Theme',
  description: 'A test theme for unit testing',
  light: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
    gray: '#8c8c8c',
  },
  dark: {
    primary: '#177ddc',
    success: '#49aa19',
    warning: '#d89614',
    danger: '#d32029',
    gray: '#434343',
  },
}

const mockThemeConfig2: ThemeConfig = {
  name: 'test-theme-2',
  displayName: 'Test Theme 2',
  description: 'Another test theme',
  light: {
    primary: '#52c41a',
    success: '#1890ff',
    warning: '#ff4d4f',
    danger: '#faad14',
    gray: '#595959',
  },
  dark: {
    primary: '#49aa19',
    success: '#177ddc',
    warning: '#d32029',
    danger: '#d89614',
    gray: '#262626',
  },
}

// ==================== 测试套件 ====================

describe('themeManager', () => {
  let themeManager: ThemeManager

  beforeEach(() => {
    // 创建新的主题管理器实例
    themeManager = new ThemeManager({
      defaultTheme: 'test-theme',
      themes: [mockThemeConfig, mockThemeConfig2],
    })
  })

  afterEach(() => {
    // 清理资源
    themeManager.destroy()
  })

  // ==================== 初始化测试 ====================

  describe('初始化', () => {
    it('应该正确初始化主题管理器', async () => {
      await expect(themeManager.initialize()).resolves.not.toThrow()
      expect(themeManager.getCurrentTheme()).toBe('test-theme')
      expect(themeManager.getCurrentMode()).toBe('light')
    })

    it('应该注册提供的主题配置', () => {
      const themes = themeManager.getThemeNames()
      expect(themes).toContain('test-theme')
      expect(themes).toContain('test-theme-2')
      expect(themes).toHaveLength(2)
    })

    it('应该获取正确的主题配置', () => {
      const config = themeManager.getThemeConfig('test-theme')
      expect(config).toEqual(mockThemeConfig)
    })

    it('应该返回undefined对于不存在的主题', () => {
      const config = themeManager.getThemeConfig('non-existent-theme')
      expect(config).toBeUndefined()
    })
  })

  // ==================== 主题切换测试 ====================

  describe('主题切换', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该成功切换到新主题', async () => {
      await expect(themeManager.setTheme('test-theme-2')).resolves.not.toThrow()
      expect(themeManager.getCurrentTheme()).toBe('test-theme-2')
    })

    it('应该保持当前模式当只切换主题时', async () => {
      const originalMode = themeManager.getCurrentMode()
      await themeManager.setTheme('test-theme-2')
      expect(themeManager.getCurrentMode()).toBe(originalMode)
    })

    it('应该同时切换主题和模式', async () => {
      await themeManager.setTheme('test-theme-2', 'dark')
      expect(themeManager.getCurrentTheme()).toBe('test-theme-2')
      expect(themeManager.getCurrentMode()).toBe('dark')
    })

    it('应该抛出错误当主题不存在时', async () => {
      await expect(themeManager.setTheme('non-existent-theme')).rejects.toThrow(
        'Theme "non-existent-theme" not found'
      )
    })

    it('应该防止并发主题切换', async () => {
      const promise1 = themeManager.setTheme('test-theme-2')
      const promise2 = themeManager.setTheme('test-theme')

      await expect(promise1).resolves.not.toThrow()
      await expect(promise2).rejects.toThrow(
        'Theme switching is already in progress'
      )
    })
  })

  // ==================== 模式切换测试 ====================

  describe('模式切换', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该成功切换模式', async () => {
      await expect(themeManager.setMode('dark')).resolves.not.toThrow()
      expect(themeManager.getCurrentMode()).toBe('dark')
    })

    it('应该成功切换模式', async () => {
      await expect(themeManager.toggleMode()).resolves.not.toThrow()
      expect(themeManager.getCurrentMode()).toBe('dark')

      await expect(themeManager.toggleMode()).resolves.not.toThrow()
      expect(themeManager.getCurrentMode()).toBe('light')
    })

    it('应该在切换模式时保持当前主题', async () => {
      const originalTheme = themeManager.getCurrentTheme()
      await themeManager.setMode('dark')
      expect(themeManager.getCurrentTheme()).toBe(originalTheme)
    })
  })

  // ==================== 主题注册测试 ====================

  describe('主题注册', () => {
    it('应该成功注册新主题', () => {
      const newTheme: ThemeConfig = {
        name: 'new-theme',
        displayName: 'New Theme',
        light: { primary: '#ff0000' },
        dark: { primary: '#cc0000' },
      }

      themeManager.registerTheme(newTheme)

      const themes = themeManager.getThemeNames()
      expect(themes).toContain('new-theme')

      const config = themeManager.getThemeConfig('new-theme')
      expect(config).toEqual(newTheme)
    })

    it('应该成功注册多个主题', () => {
      const newThemes: ThemeConfig[] = [
        {
          name: 'theme-1',
          displayName: 'Theme 1',
          light: { primary: '#ff0000' },
          dark: { primary: '#cc0000' },
        },
        {
          name: 'theme-2',
          displayName: 'Theme 2',
          light: { primary: '#00ff00' },
          dark: { primary: '#00cc00' },
        },
      ]

      themeManager.registerThemes(newThemes)

      const themes = themeManager.getThemeNames()
      expect(themes).toContain('theme-1')
      expect(themes).toContain('theme-2')
    })
  })

  // ==================== 事件系统测试 ====================

  describe('事件系统', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该触发主题变更事件', async () => {
      const eventSpy = vi.fn()
      themeManager.on('theme-changed', eventSpy)

      await themeManager.setTheme('test-theme-2')

      expect(eventSpy).toHaveBeenCalledWith({
        theme: 'test-theme-2',
        mode: 'light',
        previousTheme: 'test-theme',
        previousMode: 'light',
      })
    })

    it('应该触发主题注册事件', () => {
      const eventSpy = vi.fn()
      themeManager.on('theme-registered', eventSpy)

      const newTheme: ThemeConfig = {
        name: 'event-test-theme',
        displayName: 'Event Test Theme',
        light: { primary: '#ff0000' },
        dark: { primary: '#cc0000' },
      }

      themeManager.registerTheme(newTheme)

      expect(eventSpy).toHaveBeenCalledWith({
        theme: 'event-test-theme',
      })
    })

    it('应该正确移除事件监听器', () => {
      const eventSpy = vi.fn()
      themeManager.on('theme-changed', eventSpy)
      themeManager.off('theme-changed', eventSpy)

      themeManager.setTheme('test-theme-2')

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  // ==================== 错误处理测试 ====================

  describe('错误处理', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该正确处理主题不存在的错误', async () => {
      const errorSpy = vi.fn()
      themeManager.on('error', errorSpy)

      await expect(
        themeManager.setTheme('non-existent-theme')
      ).rejects.toThrow()

      expect(errorSpy).toHaveBeenCalledWith({
        error: expect.any(Error),
      })
    })

    it('应该调用用户提供的错误回调', async () => {
      const errorCallback = vi.fn()
      const errorThemeManager = new ThemeManager({
        defaultTheme: 'test-theme',
        themes: [mockThemeConfig],
        onError: errorCallback,
      })

      await errorThemeManager.initialize()

      await expect(
        errorThemeManager.setTheme('non-existent-theme')
      ).rejects.toThrow()

      expect(errorCallback).toHaveBeenCalledWith(expect.any(Error))

      errorThemeManager.destroy()
    })
  })

  // ==================== 生命周期测试 ====================

  describe('生命周期', () => {
    it('应该正确销毁主题管理器', () => {
      const eventSpy = vi.fn()
      themeManager.on('theme-changed', eventSpy)

      themeManager.destroy()

      // 销毁后不应该再触发事件
      themeManager.setTheme('test-theme-2')
      expect(eventSpy).not.toHaveBeenCalled()
    })

    it('应该防止重复初始化', async () => {
      await themeManager.initialize()

      // 第二次初始化应该直接返回
      await expect(themeManager.initialize()).resolves.not.toThrow()
    })
  })

  // ==================== 性能测试 ====================

  describe('性能', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该快速切换主题', async () => {
      const startTime = performance.now()

      await themeManager.setTheme('test-theme-2')

      const endTime = performance.now()
      const duration = endTime - startTime

      // 主题切换应该在50ms内完成
      expect(duration).toBeLessThan(50)
    })

    it('应该快速切换模式', async () => {
      const startTime = performance.now()

      await themeManager.toggleMode()

      const endTime = performance.now()
      const duration = endTime - startTime

      // 模式切换应该在50ms内完成
      expect(duration).toBeLessThan(50)
    })
  })

  // ==================== 边界条件测试 ====================

  describe('边界条件', () => {
    beforeEach(async () => {
      await themeManager.initialize()
    })

    it('应该处理空主题配置', () => {
      const emptyThemeManager = new ThemeManager({
        defaultTheme: 'default',
        themes: [],
      })

      expect(emptyThemeManager.getThemeNames()).toHaveLength(0)

      emptyThemeManager.destroy()
    })

    it('应该处理无效的主题配置', () => {
      const invalidTheme: ThemeConfig = {
        name: 'invalid-theme',
        displayName: 'Invalid Theme',
        light: { primary: '#ff0000' },
        // 缺少dark配置
      }

      expect(() => {
        themeManager.registerTheme(invalidTheme)
      }).not.toThrow()
    })
  })
})
