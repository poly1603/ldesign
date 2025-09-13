/**
 * ThemeManager 测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeManager, type ThemeConfig } from '../../src/managers/ThemeManager'
import { EventManager } from '../../src/managers/EventManager'

describe('ThemeManager', () => {
  let container: HTMLElement
  let eventManager: EventManager
  let themeManager: ThemeManager

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.className = 'ldesign-table'
    document.body.appendChild(container)

    // 创建事件管理器
    eventManager = new EventManager()

    // 创建主题管理器
    themeManager = new ThemeManager(container, eventManager)
  })

  afterEach(() => {
    // 清理
    themeManager.destroy()
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该正确初始化默认主题', () => {
      const theme = themeManager.getTheme()
      
      expect(theme.type).toBe('light')
      expect(theme.responsive).toBe('auto')
      expect(theme.animations).toBe(true)
      expect(theme.shadows).toBe(true)
      expect(theme.rounded).toBe(true)
    })

    it('应该正确应用主题类', () => {
      expect(container.classList.contains('ldesign-table--theme-light')).toBe(true)
    })

    it('应该正确设置主题', () => {
      const newTheme: Partial<ThemeConfig> = {
        type: 'dark',
        animations: false
      }

      themeManager.setTheme(newTheme)
      const theme = themeManager.getTheme()

      expect(theme.type).toBe('dark')
      expect(theme.animations).toBe(false)
      expect(container.classList.contains('ldesign-table--theme-dark')).toBe(true)
      expect(container.classList.contains('ldesign-table--no-animations')).toBe(true)
    })
  })

  describe('主题切换', () => {
    it('应该正确切换明亮/暗黑主题', () => {
      // 初始为明亮主题
      expect(themeManager.getTheme().type).toBe('light')

      // 切换到暗黑主题
      themeManager.toggleTheme()
      expect(themeManager.getTheme().type).toBe('dark')
      expect(container.classList.contains('ldesign-table--theme-dark')).toBe(true)

      // 再次切换回明亮主题
      themeManager.toggleTheme()
      expect(themeManager.getTheme().type).toBe('light')
      expect(container.classList.contains('ldesign-table--theme-light')).toBe(true)
    })

    it('应该正确切换响应式模式', () => {
      // 初始为auto模式
      expect(themeManager.getTheme().responsive).toBe('auto')

      // 切换响应式模式
      themeManager.toggleResponsiveMode()
      expect(themeManager.getTheme().responsive).toBe('desktop')

      themeManager.toggleResponsiveMode()
      expect(themeManager.getTheme().responsive).toBe('tablet')

      themeManager.toggleResponsiveMode()
      expect(themeManager.getTheme().responsive).toBe('mobile')

      themeManager.toggleResponsiveMode()
      expect(themeManager.getTheme().responsive).toBe('card')

      themeManager.toggleResponsiveMode()
      expect(themeManager.getTheme().responsive).toBe('auto')
    })
  })

  describe('响应式功能', () => {
    it('应该正确应用响应式类', () => {
      // 设置为桌面模式
      themeManager.setTheme({ responsive: 'desktop' })
      expect(container.classList.contains('ldesign-table--desktop')).toBe(true)

      // 设置为平板模式
      themeManager.setTheme({ responsive: 'tablet' })
      expect(container.classList.contains('ldesign-table--tablet')).toBe(true)
      expect(container.classList.contains('ldesign-table--desktop')).toBe(false)

      // 设置为移动模式
      themeManager.setTheme({ responsive: 'mobile' })
      expect(container.classList.contains('ldesign-table--mobile')).toBe(true)
      expect(container.classList.contains('ldesign-table--tablet')).toBe(false)

      // 设置为卡片模式
      themeManager.setTheme({ responsive: 'card' })
      expect(container.classList.contains('ldesign-table--mobile-card')).toBe(true)
      expect(container.classList.contains('ldesign-table--mobile')).toBe(false)
    })
  })

  describe('特性开关', () => {
    it('应该正确应用动画开关', () => {
      // 禁用动画
      themeManager.setTheme({ animations: false })
      expect(container.classList.contains('ldesign-table--no-animations')).toBe(true)

      // 启用动画
      themeManager.setTheme({ animations: true })
      expect(container.classList.contains('ldesign-table--no-animations')).toBe(false)
    })

    it('应该正确应用阴影开关', () => {
      // 禁用阴影
      themeManager.setTheme({ shadows: false })
      expect(container.classList.contains('ldesign-table--no-shadows')).toBe(true)

      // 启用阴影
      themeManager.setTheme({ shadows: true })
      expect(container.classList.contains('ldesign-table--no-shadows')).toBe(false)
    })

    it('应该正确应用圆角开关', () => {
      // 禁用圆角
      themeManager.setTheme({ rounded: false })
      expect(container.classList.contains('ldesign-table--no-rounded')).toBe(true)

      // 启用圆角
      themeManager.setTheme({ rounded: true })
      expect(container.classList.contains('ldesign-table--no-rounded')).toBe(false)
    })
  })

  describe('自定义变量', () => {
    it('应该正确应用自定义CSS变量', () => {
      const customVars = {
        '--custom-color': '#ff0000',
        '--custom-size': '20px'
      }

      themeManager.setTheme({ customVars })

      expect(container.style.getPropertyValue('--custom-color')).toBe('#ff0000')
      expect(container.style.getPropertyValue('--custom-size')).toBe('20px')
    })
  })

  describe('事件系统', () => {
    it('应该触发主题变更事件', () => {
      const mockHandler = vi.fn()
      eventManager.on('theme-change', mockHandler)

      const newTheme = { type: 'dark' as const }
      themeManager.setTheme(newTheme)

      expect(mockHandler).toHaveBeenCalledWith({
        oldTheme: expect.objectContaining({ type: 'light' }),
        newTheme: expect.objectContaining({ type: 'dark' })
      })
    })
  })

  describe('销毁功能', () => {
    it('应该正确清理资源', () => {
      // 设置一些自定义样式
      themeManager.setTheme({
        type: 'dark',
        customVars: { '--test-var': 'test-value' }
      })

      // 销毁
      themeManager.destroy()

      // 检查清理结果
      expect(container.style.getPropertyValue('--test-var')).toBe('')
      
      // 检查类名清理
      const hasThemeClasses = Array.from(container.classList)
        .some(cls => cls.startsWith('ldesign-table--'))
      expect(hasThemeClasses).toBe(false)
    })
  })

  describe('无障碍功能', () => {
    it('应该支持减少动画偏好', () => {
      // 模拟用户偏好减少动画
      const mockMediaQuery = {
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }
      
      vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return mockMediaQuery as any
        }
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() } as any
      })

      // 重新创建主题管理器以应用模拟
      themeManager.destroy()
      themeManager = new ThemeManager(container, eventManager)

      // 检查是否应用了减少动画类
      expect(container.classList.contains('ldesign-table--reduced-motion')).toBe(true)
    })
  })
})
