/**
 * @ldesign/theme - 主题管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createThemeManager } from '@/core/theme-manager'
import { createMockThemeConfig, cleanup } from '@tests/setup'
import type { ThemeManagerInstance, ThemeConfig } from '@/core/types'

describe('ThemeManager', () => {
  let themeManager: ThemeManagerInstance
  let mockTheme1: ThemeConfig
  let mockTheme2: ThemeConfig

  beforeEach(() => {
    mockTheme1 = createMockThemeConfig({
      name: 'theme1',
      displayName: '主题1',
    })

    mockTheme2 = createMockThemeConfig({
      name: 'theme2',
      displayName: '主题2',
    })

    themeManager = createThemeManager({
      themes: [mockTheme1, mockTheme2],
      defaultTheme: 'theme1',
      autoActivate: false,
      debug: false,
    })
  })

  afterEach(() => {
    themeManager?.destroy()
    cleanup()
  })

  describe('初始化', () => {
    it('应该正确创建主题管理器实例', () => {
      expect(themeManager).toBeDefined()
      expect(typeof themeManager.init).toBe('function')
      expect(typeof themeManager.setTheme).toBe('function')
      expect(typeof themeManager.getTheme).toBe('function')
    })

    it('应该正确初始化主题列表', async () => {
      await themeManager.init()

      const availableThemes = themeManager.getAvailableThemes()
      expect(availableThemes).toContain('theme1')
      expect(availableThemes).toContain('theme2')
      expect(availableThemes).toHaveLength(2)
    })

    it('应该设置默认主题', async () => {
      await themeManager.init()

      const currentTheme = themeManager.getCurrentTheme()
      expect(currentTheme).toBe('theme1')
    })
  })

  describe('主题操作', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够切换主题', async () => {
      await themeManager.setTheme('theme2')

      const currentTheme = themeManager.getCurrentTheme()
      expect(currentTheme).toBe('theme2')
    })

    it('应该能够获取主题配置', () => {
      const theme = themeManager.getTheme('theme1')
      expect(theme).toEqual(mockTheme1)
    })

    it('应该能够添加新主题', () => {
      const newTheme = createMockThemeConfig({
        name: 'theme3',
        displayName: '主题3',
      })

      themeManager.addTheme(newTheme)

      const availableThemes = themeManager.getAvailableThemes()
      expect(availableThemes).toContain('theme3')

      const theme = themeManager.getTheme('theme3')
      expect(theme).toEqual(newTheme)
    })

    it('应该能够移除主题', () => {
      themeManager.removeTheme('theme2')

      const availableThemes = themeManager.getAvailableThemes()
      expect(availableThemes).not.toContain('theme2')

      const theme = themeManager.getTheme('theme2')
      expect(theme).toBeUndefined()
    })

    it('切换到不存在的主题时应该抛出错误', async () => {
      await expect(themeManager.setTheme('nonexistent')).rejects.toThrow()
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该在主题变化时触发事件', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)

      await themeManager.setTheme('theme2')

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'theme-changed',
          theme: 'theme2',
        })
      )
    })

    it('应该能够移除事件监听器', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)
      themeManager.off('theme-changed', mockListener)

      await themeManager.setTheme('theme2')

      expect(mockListener).not.toHaveBeenCalled()
    })

    it('应该在发生错误时触发错误事件', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-error', mockListener)

      try {
        await themeManager.setTheme('nonexistent')
      } catch {
        // 忽略错误
      }

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'theme-error',
          error: expect.any(Error),
        })
      )
    })
  })

  describe('装饰管理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够添加装饰元素', () => {
      const decoration = {
        id: 'test-decoration',
        name: '测试装饰',
        type: 'icon' as const,
        src: '/test.svg',
        position: {
          type: 'fixed' as const,
          position: { x: '10px', y: '10px' },
          anchor: 'top-left' as const,
        },
        style: {
          size: { width: '20px', height: '20px' },
          opacity: 1,
          zIndex: 1000,
        },
        interactive: false,
        responsive: true,
      }

      themeManager.addDecoration(decoration)

      const decorations = themeManager.getDecorations()
      expect(decorations).toContainEqual(decoration)
    })

    it('应该能够移除装饰元素', () => {
      const decoration = {
        id: 'test-decoration',
        name: '测试装饰',
        type: 'icon' as const,
        src: '/test.svg',
        position: {
          type: 'fixed' as const,
          position: { x: '10px', y: '10px' },
          anchor: 'top-left' as const,
        },
        style: {
          size: { width: '20px', height: '20px' },
          opacity: 1,
          zIndex: 1000,
        },
        interactive: false,
        responsive: true,
      }

      themeManager.addDecoration(decoration)
      themeManager.removeDecoration('test-decoration')

      const decorations = themeManager.getDecorations()
      expect(decorations).not.toContainEqual(decoration)
    })
  })

  describe('动画管理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够开始动画', () => {
      expect(() => {
        themeManager.startAnimation('test-animation')
      }).not.toThrow()
    })

    it('应该能够停止动画', () => {
      expect(() => {
        themeManager.stopAnimation('test-animation')
      }).not.toThrow()
    })

    it('应该能够暂停和恢复动画', () => {
      expect(() => {
        themeManager.pauseAnimation('test-animation')
        themeManager.resumeAnimation('test-animation')
      }).not.toThrow()
    })
  })

  describe('资源管理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够预加载主题资源', async () => {
      // 模拟 fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<svg></svg>'),
        json: () => Promise.resolve({}),
        blob: () => Promise.resolve(new Blob()),
      })

      await expect(
        themeManager.preloadResources('theme1')
      ).resolves.not.toThrow()
    })

    it('应该能够清理资源', () => {
      expect(() => {
        themeManager.clearResources('theme1')
      }).not.toThrow()
    })
  })

  describe('销毁', () => {
    it('应该能够正确销毁管理器', async () => {
      await themeManager.init()

      expect(() => {
        themeManager.destroy()
      }).not.toThrow()

      // 销毁后应该无法使用
      expect(() => {
        themeManager.getCurrentTheme()
      }).not.toThrow() // 可能返回 undefined 但不应该抛出错误
    })
  })
})
