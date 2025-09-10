/**
 * @ldesign/theme - 主题管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createThemeManager, ThemeManager } from '../../src/core/theme-manager'
import { springFestivalTheme } from '../../src/themes/spring-festival'
import { christmasTheme } from '../../src/themes/christmas'
import { valentineTheme } from '../../src/themes/festivals/valentine'
import type { ThemeManagerOptions } from '../../src/core/types'

describe('ThemeManager', () => {
  let themeManager: ThemeManager
  let container: HTMLElement

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)

    // 创建主题管理器
    const options: ThemeManagerOptions = {
      container,
      autoActivate: false,
      performance: {
        enableGPU: false,
        maxDecorations: 10,
        animationQuality: 'low',
      },
    }
    themeManager = createThemeManager(options) as ThemeManager
  })

  afterEach(() => {
    // 清理
    if (themeManager) {
      themeManager.destroy()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('初始化', () => {
    it('应该正确创建主题管理器实例', () => {
      expect(themeManager).toBeInstanceOf(ThemeManager)
      expect(themeManager.isInitialized()).toBe(false)
    })

    it('应该能够初始化', async () => {
      await themeManager.init()
      expect(themeManager.isInitialized()).toBe(true)
    })

    it('应该能够重复初始化而不出错', async () => {
      await themeManager.init()
      await themeManager.init()
      expect(themeManager.isInitialized()).toBe(true)
    })
  })

  describe('主题管理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够添加主题', () => {
      themeManager.addTheme(springFestivalTheme)
      expect(themeManager.hasTheme('spring-festival')).toBe(true)
      expect(themeManager.getTheme('spring-festival')).toEqual(
        springFestivalTheme
      )
    })

    it('应该能够移除主题', () => {
      themeManager.addTheme(springFestivalTheme)
      expect(themeManager.hasTheme('spring-festival')).toBe(true)

      themeManager.removeTheme('spring-festival')
      expect(themeManager.hasTheme('spring-festival')).toBe(false)
    })

    it('应该能够获取所有主题名称', () => {
      themeManager.addTheme(springFestivalTheme)
      themeManager.addTheme(christmasTheme)

      const themeNames = themeManager.getThemeNames()
      expect(themeNames).toContain('spring-festival')
      expect(themeNames).toContain('christmas')
    })

    it('应该能够设置当前主题', async () => {
      themeManager.addTheme(springFestivalTheme)

      await themeManager.setTheme('spring-festival')
      expect(themeManager.getCurrentTheme()).toBe('spring-festival')
    })

    it('设置不存在的主题应该抛出错误', async () => {
      await expect(themeManager.setTheme('non-existent')).rejects.toThrow()
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够监听主题变化事件', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)

      themeManager.addTheme(springFestivalTheme)
      await themeManager.setTheme('spring-festival')

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'theme-changed',
          theme: 'spring-festival',
        })
      )
    })

    it('应该能够移除事件监听器', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)
      themeManager.off('theme-changed', mockListener)

      themeManager.addTheme(springFestivalTheme)
      await themeManager.setTheme('spring-festival')

      expect(mockListener).not.toHaveBeenCalled()
    })
  })

  describe('装饰元素管理', () => {
    beforeEach(async () => {
      await themeManager.init()
      themeManager.addTheme(springFestivalTheme)
      await themeManager.setTheme('spring-festival')
    })

    it('应该能够获取当前装饰元素', () => {
      const decorations = themeManager.getDecorations()
      expect(Array.isArray(decorations)).toBe(true)
    })

    it('应该能够添加装饰元素', () => {
      const decoration = {
        id: 'test-decoration',
        name: '测试装饰',
        type: 'image' as const,
        src: '/test.png',
        position: {
          type: 'absolute' as const,
          position: { x: '50%', y: '50%' },
        },
        style: {
          size: { width: '32px', height: '32px' },
        },
        conditions: {},
      }

      themeManager.addDecoration(decoration)
      const decorations = themeManager.getDecorations()
      expect(decorations.some(d => d.id === 'test-decoration')).toBe(true)
    })

    it('应该能够移除装饰元素', () => {
      const decoration = {
        id: 'test-decoration',
        name: '测试装饰',
        type: 'image' as const,
        src: '/test.png',
        position: {
          type: 'absolute' as const,
          position: { x: '50%', y: '50%' },
        },
        style: {
          size: { width: '32px', height: '32px' },
        },
        conditions: {},
      }

      themeManager.addDecoration(decoration)
      expect(
        themeManager.getDecorations().some(d => d.id === 'test-decoration')
      ).toBe(true)

      themeManager.removeDecoration('test-decoration')
      expect(
        themeManager.getDecorations().some(d => d.id === 'test-decoration')
      ).toBe(false)
    })
  })

  describe('动画管理', () => {
    beforeEach(async () => {
      await themeManager.init()
      themeManager.addTheme(springFestivalTheme)
      await themeManager.setTheme('spring-festival')
    })

    it('应该能够开始动画', () => {
      expect(() => themeManager.startAnimation('test-animation')).not.toThrow()
    })

    it('应该能够停止动画', () => {
      themeManager.startAnimation('test-animation')
      expect(() => themeManager.stopAnimation('test-animation')).not.toThrow()
    })

    it('应该能够暂停和恢复动画', () => {
      themeManager.startAnimation('test-animation')
      expect(() => themeManager.pauseAnimation('test-animation')).not.toThrow()
      expect(() => themeManager.resumeAnimation('test-animation')).not.toThrow()
    })
  })

  describe('资源管理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该能够预加载主题资源', async () => {
      themeManager.addTheme(springFestivalTheme)
      await expect(
        themeManager.preloadResources('spring-festival')
      ).resolves.not.toThrow()
    })

    it('应该能够清理资源', () => {
      expect(() => themeManager.clearResources()).not.toThrow()
    })

    it('应该能够清理特定主题的资源', () => {
      themeManager.addTheme(springFestivalTheme)
      expect(() => themeManager.clearResources('spring-festival')).not.toThrow()
    })
  })

  describe('性能优化', () => {
    it('应该能够设置性能选项', () => {
      const options: ThemeManagerOptions = {
        container,
        performance: {
          enableGPU: true,
          maxDecorations: 20,
          animationQuality: 'high',
          preloadStrategy: 'all',
          memoryLimit: 200 * 1024 * 1024,
        },
      }

      const manager = createThemeManager(options)
      expect(manager).toBeInstanceOf(ThemeManager)
    })

    it('应该能够获取性能统计', async () => {
      await themeManager.init()
      const stats = themeManager.getPerformanceStats()

      expect(stats).toHaveProperty('memoryUsage')
      expect(stats).toHaveProperty('decorationCount')
      expect(stats).toHaveProperty('animationCount')
    })
  })

  describe('错误处理', () => {
    it('应该在未初始化时抛出错误', async () => {
      const uninitializedManager = createThemeManager({ container })
      await expect(uninitializedManager.setTheme('test')).rejects.toThrow()
    })

    it('应该处理无效的主题配置', () => {
      const invalidTheme = {
        name: '',
        displayName: '',
        // 缺少必需字段
      } as any

      expect(() => themeManager.addTheme(invalidTheme)).toThrow()
    })
  })
})
