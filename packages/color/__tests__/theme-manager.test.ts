/**
 * 主题管理器测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeManager } from '../src/core/theme-manager'
import { defaultTheme, greenTheme } from '../src/themes/presets'

describe('themeManager', () => {
  let themeManager: ThemeManager

  beforeEach(() => {
    themeManager = new ThemeManager({
      themes: [defaultTheme, greenTheme],
      defaultTheme: 'default',
    })
  })

  afterEach(() => {
    themeManager.destroy()
  })

  describe('初始化', () => {
    it('应该正确初始化', async () => {
      await themeManager.init()
      expect(themeManager.getCurrentTheme()).toBe('default')
      expect(themeManager.getCurrentMode()).toBe('light')
    })

    it('应该注册预设主题', () => {
      const themeNames = themeManager.getThemeNames()
      expect(themeNames).toContain('default')
      expect(themeNames).toContain('green')
    })

    it('应该获取主题配置', () => {
      const config = themeManager.getThemeConfig('default')
      expect(config).toBeDefined()
      expect(config?.name).toBe('default')
    })
  })

  describe('主题切换', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该切换主题', async () => {
      await themeManager.setTheme('green')
      expect(themeManager.getCurrentTheme()).toBe('green')
    })

    it('应该切换模式', async () => {
      await themeManager.setMode('dark')
      expect(themeManager.getCurrentMode()).toBe('dark')
    })

    it('应该切换模式（toggle）', async () => {
      expect(themeManager.getCurrentMode()).toBe('light')
      await themeManager.toggleMode()
      expect(themeManager.getCurrentMode()).toBe('dark')
      await themeManager.toggleMode()
      expect(themeManager.getCurrentMode()).toBe('light')
    })

    it('应该抛出错误当主题不存在时', async () => {
      await expect(themeManager.setTheme('nonexistent')).rejects.toThrow(
        'Theme "nonexistent" not found',
      )
    })
  })

  describe('主题注册', () => {
    it('应该注册新主题', () => {
      const customTheme = {
        name: 'custom',
        displayName: '自定义主题',
        light: { primary: '#ff6b00' },
      }

      themeManager.registerTheme(customTheme)
      expect(themeManager.getThemeNames()).toContain('custom')
      expect(themeManager.getThemeConfig('custom')).toEqual(customTheme)
    })

    it('应该更新已存在的主题', () => {
      const updatedTheme = {
        name: 'default',
        displayName: '更新的默认主题',
        light: { primary: '#ff0000' },
      }

      themeManager.registerTheme(updatedTheme)
      const config = themeManager.getThemeConfig('default')
      expect(config?.displayName).toBe('更新的默认主题')
    })

    it('应该批量注册主题', () => {
      const customThemes = [
        { name: 'theme1', light: { primary: '#ff0000' } },
        { name: 'theme2', light: { primary: '#00ff00' } },
      ]

      themeManager.registerThemes(customThemes)
      expect(themeManager.getThemeNames()).toContain('theme1')
      expect(themeManager.getThemeNames()).toContain('theme2')
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该触发主题变更事件', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)

      await themeManager.setTheme('green')
      expect(mockListener).toHaveBeenCalledWith({
        theme: 'green',
        mode: 'light',
        oldTheme: 'default',
        oldMode: 'light',
      })
    })

    it('应该支持一次性监听器', async () => {
      const mockListener = vi.fn()
      themeManager.once('theme-changed', mockListener)

      await themeManager.setTheme('green')
      await themeManager.setTheme('default')

      expect(mockListener).toHaveBeenCalledTimes(1)
    })

    it('应该移除事件监听器', async () => {
      const mockListener = vi.fn()
      themeManager.on('theme-changed', mockListener)
      themeManager.off('theme-changed', mockListener)

      await themeManager.setTheme('green')
      expect(mockListener).not.toHaveBeenCalled()
    })

    it('应该获取监听器数量', () => {
      const mockListener1 = vi.fn()
      const mockListener2 = vi.fn()

      themeManager.on('theme-changed', mockListener1)
      themeManager.on('theme-changed', mockListener2)

      expect(themeManager.listenerCount('theme-changed')).toBe(2)
    })
  })

  describe('缓存和预生成', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该预生成主题数据', async () => {
      await themeManager.preGenerateTheme('default')
      const generatedTheme = themeManager.getGeneratedTheme('default')
      expect(generatedTheme).toBeDefined()
      expect(generatedTheme?.name).toBe('default')
    })

    it('应该预生成所有主题', async () => {
      await themeManager.preGenerateAllThemes()

      // 先等待一段时间让预生成完成
      await new Promise(resolve => setTimeout(resolve, 50))

      const defaultGenerated = themeManager.getGeneratedTheme('default')
      const greenGenerated = themeManager.getGeneratedTheme('green')

      expect(defaultGenerated).toBeDefined()
      expect(greenGenerated).toBeDefined()
    })

    it('应该使用缓存避免重复生成', async () => {
      // 首先生成一次主题数据
      await themeManager.preGenerateTheme('default')
      const firstGenerated = themeManager.getGeneratedTheme('default')

      // 再次生成同一主题
      await themeManager.preGenerateTheme('default')
      const secondGenerated = themeManager.getGeneratedTheme('default')

      // 应该返回相同的缓存对象
      expect(firstGenerated).toBe(secondGenerated)
    })
  })

  describe('错误处理', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该处理无效的主题配置', async () => {
      const invalidTheme = {
        name: 'invalid',
        light: {}, // 缺少 primary 颜色
      } as any

      themeManager.registerTheme(invalidTheme)

      await expect(themeManager.preGenerateTheme('invalid')).rejects.toThrow(
        'Theme "invalid" is missing light.primary color',
      )
    })

    it('应该触发错误事件', async () => {
      const mockErrorListener = vi.fn()
      themeManager.on('error', mockErrorListener)

      const invalidTheme = {
        name: 'invalid',
        light: {},
      } as any

      themeManager.registerTheme(invalidTheme)

      try {
        await themeManager.preGenerateTheme('invalid')
      }
      catch {
        // 忽略错误，我们只关心事件
      }

      expect(mockErrorListener).toHaveBeenCalled()
    })
  })

  describe('存储功能', () => {
    it('应该保存和恢复主题设置', async () => {
      const mockStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify({ theme: 'green', mode: 'dark' })),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }

      const manager = new ThemeManager({
        themes: [defaultTheme, greenTheme],
        storage: mockStorage,
      })

      await manager.init()

      expect(manager.getCurrentTheme()).toBe('green')
      expect(manager.getCurrentMode()).toBe('dark')

      manager.destroy()
    })
  })

  describe('销毁功能', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该正确销毁实例', () => {
      expect(() => themeManager.destroy()).not.toThrow()
    })

    it('销毁后应该清空缓存', () => {
      themeManager.destroy()
      const generatedTheme = themeManager.getGeneratedTheme('default')
      expect(generatedTheme).toBeUndefined()
    })
  })

  describe('回调函数', () => {
    it('应该调用主题变更回调', async () => {
      const mockCallback = vi.fn()
      const manager = new ThemeManager({
        themes: [defaultTheme, greenTheme],
        onThemeChanged: mockCallback,
      })

      await manager.init()
      await manager.setTheme('green')

      expect(mockCallback).toHaveBeenCalledWith('green', 'light')

      manager.destroy()
    })

    it('应该调用错误回调', async () => {
      const mockErrorCallback = vi.fn()
      const manager = new ThemeManager({
        themes: [defaultTheme],
        onError: mockErrorCallback,
      })

      await manager.init()

      try {
        await manager.setTheme('nonexistent')
      }
      catch {
        // 忽略错误
      }

      expect(mockErrorCallback).toHaveBeenCalled()

      manager.destroy()
    })
  })

  describe('高级功能', () => {
    beforeEach(async () => {
      await themeManager.init()
    })

    it('应该支持自定义缓存配置', () => {
      const manager = new ThemeManager({
        themes: [defaultTheme],
        cache: { maxSize: 10, defaultTTL: 1000 },
      })

      expect(manager).toBeDefined()
      manager.destroy()
    })

    it('应该支持禁用缓存', () => {
      const manager = new ThemeManager({
        themes: [defaultTheme],
        cache: false,
      })

      expect(manager).toBeDefined()
      manager.destroy()
    })

    it('应该支持自定义CSS前缀', async () => {
      const manager = new ThemeManager({
        themes: [defaultTheme],
        cssPrefix: '--my-color',
      })

      await manager.init()
      await manager.setTheme('default')

      const generatedTheme = manager.getGeneratedTheme('default')
      expect(generatedTheme).toBeDefined()

      manager.destroy()
    })
  })
})
