/**
 * 主题管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeManager, type ThemeDefinition } from '@/themes/theme-manager'
import { StyleManager } from '@/renderers/style-manager'
import { createMockElement } from '../setup'

describe('ThemeManager', () => {
  let container: HTMLElement
  let styleManager: StyleManager
  let themeManager: ThemeManager

  beforeEach(() => {
    container = createMockElement('div')
    document.body.appendChild(container)
    
    styleManager = new StyleManager(container)
    themeManager = new ThemeManager(styleManager)
  })

  afterEach(() => {
    if (themeManager) {
      themeManager.destroy()
    }
    if (styleManager) {
      styleManager.destroy()
    }
    document.body.innerHTML = ''
  })

  describe('内置主题', () => {
    it('应该注册内置主题', () => {
      const themes = themeManager.getAllThemes()
      const themeNames = themes.map(theme => theme.name)

      expect(themeNames).toContain('default')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('minimal')
    })

    it('应该能够获取内置主题', () => {
      const defaultTheme = themeManager.getTheme('default')

      expect(defaultTheme).toBeDefined()
      expect(defaultTheme?.name).toBe('default')
      expect(defaultTheme?.displayName).toBe('默认主题')
    })
  })

  describe('主题注册', () => {
    const customTheme: ThemeDefinition = {
      name: 'custom',
      displayName: '自定义主题',
      description: '测试用的自定义主题',
      variables: {
        '--test-color': '#ff0000'
      },
      className: 'custom-theme'
    }

    it('应该能够注册自定义主题', () => {
      themeManager.registerTheme(customTheme)

      expect(themeManager.isThemeRegistered('custom')).toBe(true)
      expect(themeManager.getTheme('custom')).toEqual(customTheme)
    })

    it('应该能够批量注册主题', () => {
      const themes: ThemeDefinition[] = [
        customTheme,
        {
          name: 'another',
          displayName: '另一个主题',
          variables: {}
        }
      ]

      themeManager.registerMultipleThemes(themes)

      expect(themeManager.isThemeRegistered('custom')).toBe(true)
      expect(themeManager.isThemeRegistered('another')).toBe(true)
    })

    it('重复注册主题应该发出警告', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      themeManager.registerTheme(customTheme)
      themeManager.registerTheme(customTheme)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Theme "custom" is already registered')
      )
      
      consoleSpy.mockRestore()
    })

    it('应该能够注销主题', () => {
      themeManager.registerTheme(customTheme)
      themeManager.unregisterTheme('custom')

      expect(themeManager.isThemeRegistered('custom')).toBe(false)
    })
  })

  describe('主题切换', () => {
    beforeEach(() => {
      const customTheme: ThemeDefinition = {
        name: 'custom',
        displayName: '自定义主题',
        variables: {
          '--test-color': '#ff0000'
        }
      }
      themeManager.registerTheme(customTheme)
    })

    it('应该能够设置主题', () => {
      themeManager.setTheme('custom')

      expect(themeManager.getCurrentTheme()).toBe('custom')
    })

    it('设置不存在的主题应该发出错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      themeManager.setTheme('nonexistent')

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Theme "nonexistent" is not registered')
      )
      
      consoleSpy.mockRestore()
    })

    it('应该能够通过样式管理器应用主题', () => {
      const setThemeSpy = vi.spyOn(styleManager, 'setTheme')
      
      themeManager.setTheme('custom')

      expect(setThemeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom',
          variables: { '--test-color': '#ff0000' }
        })
      )
      
      setThemeSpy.mockRestore()
    })
  })

  describe('主题变更监听', () => {
    it('应该能够监听主题变更', () => {
      const listener = vi.fn()
      themeManager.onThemeChange(listener)
      
      themeManager.setTheme('dark')

      expect(listener).toHaveBeenCalledWith('dark', null)
    })

    it('应该能够移除主题变更监听器', () => {
      const listener = vi.fn()
      themeManager.onThemeChange(listener)
      themeManager.offThemeChange(listener)
      
      themeManager.setTheme('dark')

      expect(listener).not.toHaveBeenCalled()
    })

    it('监听器错误应该被捕获', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      themeManager.onThemeChange(errorListener)
      themeManager.setTheme('dark')

      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('自定义主题创建', () => {
    it('应该能够创建自定义主题', () => {
      const customTheme = themeManager.createCustomTheme(
        'myTheme',
        'default',
        { '--custom-color': '#00ff00' }
      )

      expect(customTheme.name).toBe('myTheme')
      expect(customTheme.variables).toHaveProperty('--custom-color', '#00ff00')
      expect(themeManager.isThemeRegistered('myTheme')).toBe(true)
    })

    it('基于不存在的主题创建应该抛出错误', () => {
      expect(() => {
        themeManager.createCustomTheme('myTheme', 'nonexistent')
      }).toThrow('Base theme "nonexistent" is not registered')
    })
  })

  describe('主题导入导出', () => {
    const testTheme: ThemeDefinition = {
      name: 'export-test',
      displayName: '导出测试主题',
      variables: {
        '--export-color': '#123456'
      }
    }

    beforeEach(() => {
      themeManager.registerTheme(testTheme)
    })

    it('应该能够导出主题', () => {
      const exported = themeManager.exportTheme('export-test')

      expect(exported).toBeDefined()
      
      if (exported) {
        const parsed = JSON.parse(exported)
        expect(parsed.name).toBe('export-test')
        expect(parsed.variables).toEqual({ '--export-color': '#123456' })
      }
    })

    it('导出不存在的主题应该返回 null', () => {
      const exported = themeManager.exportTheme('nonexistent')

      expect(exported).toBeNull()
    })

    it('应该能够导入主题', () => {
      const themeJson = JSON.stringify({
        name: 'imported',
        displayName: '导入的主题',
        variables: {
          '--imported-color': '#abcdef'
        }
      })

      const result = themeManager.importTheme(themeJson)

      expect(result).toBe(true)
      expect(themeManager.isThemeRegistered('imported')).toBe(true)
    })

    it('导入无效的主题应该返回 false', () => {
      const invalidJson = '{ invalid json }'
      const result = themeManager.importTheme(invalidJson)

      expect(result).toBe(false)
    })

    it('导入不完整的主题定义应该返回 false', () => {
      const incompleteTheme = JSON.stringify({
        name: 'incomplete'
        // 缺少必要字段
      })

      const result = themeManager.importTheme(incompleteTheme)

      expect(result).toBe(false)
    })
  })

  describe('主题查询', () => {
    it('应该能够获取所有主题名称', () => {
      const themeNames = themeManager.getThemeNames()

      expect(Array.isArray(themeNames)).toBe(true)
      expect(themeNames).toContain('default')
      expect(themeNames).toContain('dark')
      expect(themeNames).toContain('minimal')
    })

    it('应该能够获取所有主题', () => {
      const themes = themeManager.getAllThemes()

      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
      
      const defaultTheme = themes.find(theme => theme.name === 'default')
      expect(defaultTheme).toBeDefined()
    })

    it('应该能够检查主题是否已注册', () => {
      expect(themeManager.isThemeRegistered('default')).toBe(true)
      expect(themeManager.isThemeRegistered('nonexistent')).toBe(false)
    })
  })

  describe('调试信息', () => {
    it('应该能够获取调试信息', () => {
      const debugInfo = themeManager.getDebugInfo()

      expect(debugInfo).toHaveProperty('totalThemes')
      expect(debugInfo).toHaveProperty('currentTheme')
      expect(debugInfo).toHaveProperty('registeredThemes')
      expect(debugInfo).toHaveProperty('themeChangeListeners')
      
      expect(typeof debugInfo.totalThemes).toBe('number')
      expect(Array.isArray(debugInfo.registeredThemes)).toBe(true)
    })
  })

  describe('销毁', () => {
    it('应该能够销毁主题管理器', () => {
      const listener = vi.fn()
      themeManager.onThemeChange(listener)
      
      themeManager.destroy()

      // 验证状态已清理
      expect(themeManager.getCurrentTheme()).toBeNull()
      expect(themeManager.getAllThemes()).toHaveLength(0)
      
      // 验证监听器已清理
      themeManager.setTheme('default') // 这应该不会触发监听器
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
