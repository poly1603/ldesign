/**
 * @file 配置系统测试
 * @description 测试配置管理、主题管理、国际化和预设功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConfigManager, ThemeManager, I18nManager, PresetManager, ConfigSystem } from '@/config'

describe('配置系统', () => {
  describe('ConfigManager', () => {
    let configManager: ConfigManager

    beforeEach(() => {
      configManager = new ConfigManager()
    })

    afterEach(() => {
      configManager.destroy()
    })

    it('应该能够创建配置管理器', () => {
      expect(configManager).toBeInstanceOf(ConfigManager)
    })

    it('应该能够获取和设置配置值', () => {
      configManager.set('aspectRatio', 16 / 9)
      expect(configManager.get('aspectRatio')).toBe(16 / 9)
    })

    it('应该能够获取嵌套配置值', () => {
      configManager.set('theme.primaryColor', '#ff0000')
      expect(configManager.get('theme.primaryColor')).toBe('#ff0000')
    })

    it('应该能够批量设置配置', () => {
      configManager.setMultiple({
        aspectRatio: 1,
        quality: 0.8,
        format: 'image/png'
      })

      expect(configManager.get('aspectRatio')).toBe(1)
      expect(configManager.get('quality')).toBe(0.8)
      expect(configManager.get('format')).toBe('image/png')
    })

    it('应该能够重置配置', () => {
      configManager.set('aspectRatio', 2)
      configManager.reset(['aspectRatio'])
      expect(configManager.get('aspectRatio')).toBeNull()
    })

    it('应该能够验证配置', () => {
      const result = configManager.validateConfig()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该在设置无效值时抛出错误', () => {
      expect(() => {
        configManager.set('aspectRatio', -1)
      }).toThrow()
    })

    it('应该能够触发配置变更事件', () => {
      const listener = vi.fn()
      configManager.on('configChange', listener)
      
      configManager.set('aspectRatio', 1.5)
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'aspectRatio',
          newValue: 1.5
        })
      )
    })

    it('应该能够获取变更历史', () => {
      configManager.set('aspectRatio', 1)
      configManager.set('quality', 0.9)
      
      const history = configManager.getChangeHistory()
      expect(history).toHaveLength(2)
      expect(history[0].key).toBe('aspectRatio')
      expect(history[1].key).toBe('quality')
    })
  })

  describe('ThemeManager', () => {
    let themeManager: ThemeManager

    beforeEach(() => {
      themeManager = new ThemeManager()
    })

    afterEach(() => {
      themeManager.destroy()
    })

    it('应该能够创建主题管理器', () => {
      expect(themeManager).toBeInstanceOf(ThemeManager)
    })

    it('应该能够设置主题模式', () => {
      themeManager.setMode('dark')
      expect(themeManager.getMode()).toBe('dark')
    })

    it('应该能够设置主题配置', () => {
      themeManager.setTheme({
        primaryColor: '#ff0000',
        backgroundColor: '#000000'
      })

      const theme = themeManager.getTheme()
      expect(theme.primaryColor).toBe('#ff0000')
      expect(theme.backgroundColor).toBe('#000000')
    })

    it('应该能够应用内置主题', () => {
      themeManager.applyBuiltinTheme('dark')
      const theme = themeManager.getTheme()
      expect(theme.backgroundColor).toBe('#1f1f1f')
    })

    it('应该能够获取可用主题列表', () => {
      const themes = themeManager.getAvailableThemes()
      expect(themes.length).toBeGreaterThan(0)
      expect(themes.some(t => t.name === 'light')).toBe(true)
      expect(themes.some(t => t.name === 'dark')).toBe(true)
    })

    it('应该能够注册自定义主题', () => {
      const customTheme = {
        name: 'custom',
        displayName: '自定义主题',
        description: '测试自定义主题',
        variables: {
          primaryColor: '#00ff00',
          borderColor: '#cccccc',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          successColor: '#52c41a',
          warningColor: '#faad14',
          errorColor: '#f5222d',
          disabledColor: '#d9d9d9',
          hoverColor: '#f5f5f5'
        }
      }

      themeManager.registerCustomTheme(customTheme)
      const themes = themeManager.getAvailableThemes()
      expect(themes.some(t => t.name === 'custom')).toBe(true)
    })

    it('应该能够导出和导入主题', () => {
      themeManager.setTheme({ primaryColor: '#ff0000' })
      const exported = themeManager.exportTheme()
      
      themeManager.setTheme({ primaryColor: '#00ff00' })
      themeManager.importTheme(exported)
      
      expect(themeManager.getTheme().primaryColor).toBe('#ff0000')
    })

    it('应该能够触发主题变更事件', () => {
      const listener = vi.fn()
      themeManager.on('themeChange', listener)
      
      themeManager.setMode('dark')
      
      expect(listener).toHaveBeenCalled()
    })
  })

  describe('I18nManager', () => {
    let i18nManager: I18nManager

    beforeEach(() => {
      i18nManager = new I18nManager()
    })

    afterEach(() => {
      i18nManager.destroy()
    })

    it('应该能够创建国际化管理器', () => {
      expect(i18nManager).toBeInstanceOf(I18nManager)
    })

    it('应该能够设置和获取当前语言', () => {
      i18nManager.setLocale('en-US')
      expect(i18nManager.getLocale()).toBe('en-US')
    })

    it('应该能够翻译文本', () => {
      const text = i18nManager.t('toolbar.zoomIn')
      expect(typeof text).toBe('string')
      expect(text.length).toBeGreaterThan(0)
    })

    it('应该能够处理插值参数', () => {
      i18nManager.addMessages('test', {
        greeting: 'Hello {name}!'
      })
      
      const text = i18nManager.t('greeting', { name: 'World' }, 'test')
      expect(text).toBe('Hello World!')
    })

    it('应该能够回退到默认语言', () => {
      i18nManager.setLocale('unknown')
      const text = i18nManager.t('toolbar.zoomIn')
      expect(typeof text).toBe('string')
    })

    it('应该能够添加语言包', () => {
      const languagePack = {
        locale: 'test',
        name: 'Test Language',
        messages: {
          hello: 'Hello'
        }
      }

      i18nManager.addLanguagePack(languagePack)
      expect(i18nManager.hasLocale('test')).toBe(true)
    })

    it('应该能够获取可用语言列表', () => {
      const locales = i18nManager.getAvailableLocales()
      expect(locales.length).toBeGreaterThan(0)
      expect(locales.some(l => l.locale === 'zh-CN')).toBe(true)
      expect(locales.some(l => l.locale === 'en-US')).toBe(true)
    })

    it('应该能够导出和导入语言包', () => {
      const exported = i18nManager.exportLanguagePack('zh-CN')
      expect(exported).toBeTruthy()
      
      expect(() => {
        i18nManager.importLanguagePack(exported!)
      }).not.toThrow()
    })

    it('应该能够记录缺失的翻译键', () => {
      i18nManager.t('nonexistent.key')
      const missingKeys = i18nManager.getMissingKeys()
      expect(missingKeys).toContain('nonexistent.key')
    })

    it('应该能够触发语言变更事件', () => {
      const listener = vi.fn()
      i18nManager.on('localeChange', listener)
      
      i18nManager.setLocale('en-US')
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          newLocale: 'en-US'
        })
      )
    })
  })

  describe('PresetManager', () => {
    let presetManager: PresetManager

    beforeEach(() => {
      presetManager = new PresetManager()
    })

    afterEach(() => {
      presetManager.destroy()
    })

    it('应该能够创建预设管理器', () => {
      expect(presetManager).toBeInstanceOf(PresetManager)
    })

    it('应该能够获取所有预设', () => {
      const presets = presetManager.getAllPresets()
      expect(presets.length).toBeGreaterThan(0)
    })

    it('应该能够根据分类获取预设', () => {
      const socialPresets = presetManager.getPresetsByCategory('social')
      expect(socialPresets.length).toBeGreaterThan(0)
      expect(socialPresets.every(p => p.category === 'social')).toBe(true)
    })

    it('应该能够获取特定预设', () => {
      const preset = presetManager.getPreset('instagram-square')
      expect(preset).toBeDefined()
      expect(preset?.name).toBe('instagram-square')
      expect(preset?.options.aspectRatio).toBe(1)
    })

    it('应该能够添加自定义预设', () => {
      const customPreset = {
        name: 'custom-test',
        displayName: '自定义测试',
        description: '测试自定义预设',
        category: 'test',
        options: {
          aspectRatio: 2,
          quality: 0.8
        }
      }

      presetManager.addPreset(customPreset)
      const preset = presetManager.getPreset('custom-test')
      expect(preset).toBeDefined()
      expect(preset?.builtin).toBe(false)
    })

    it('应该能够更新自定义预设', () => {
      const customPreset = {
        name: 'custom-update',
        displayName: '自定义更新',
        description: '测试更新',
        category: 'test',
        options: { aspectRatio: 1 }
      }

      presetManager.addPreset(customPreset)
      presetManager.updatePreset('custom-update', {
        displayName: '更新后的名称'
      })

      const preset = presetManager.getPreset('custom-update')
      expect(preset?.displayName).toBe('更新后的名称')
    })

    it('应该能够删除自定义预设', () => {
      const customPreset = {
        name: 'custom-delete',
        displayName: '自定义删除',
        description: '测试删除',
        category: 'test',
        options: { aspectRatio: 1 }
      }

      presetManager.addPreset(customPreset)
      presetManager.deletePreset('custom-delete')
      
      const preset = presetManager.getPreset('custom-delete')
      expect(preset).toBeUndefined()
    })

    it('应该不能更新或删除内置预设', () => {
      expect(() => {
        presetManager.updatePreset('instagram-square', { displayName: '新名称' })
      }).toThrow()

      expect(() => {
        presetManager.deletePreset('instagram-square')
      }).toThrow()
    })

    it('应该能够搜索预设', () => {
      const results = presetManager.searchPresets('instagram')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(p => 
        p.displayName.toLowerCase().includes('instagram') ||
        p.description.toLowerCase().includes('instagram')
      )).toBe(true)
    })

    it('应该能够获取所有分类', () => {
      const categories = presetManager.getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      expect(categories.some(c => c.name === 'social')).toBe(true)
    })

    it('应该能够导出和导入预设', () => {
      const customPreset = {
        name: 'export-test',
        displayName: '导出测试',
        description: '测试导出',
        category: 'test',
        options: { aspectRatio: 3 }
      }

      presetManager.addPreset(customPreset)
      const exported = presetManager.exportPreset('export-test')
      expect(exported).toBeTruthy()

      presetManager.deletePreset('export-test')
      presetManager.importPreset(exported!)
      
      const preset = presetManager.getPreset('export-test')
      expect(preset).toBeDefined()
    })
  })

  describe('ConfigSystem', () => {
    let configSystem: ConfigSystem

    beforeEach(() => {
      configSystem = new ConfigSystem()
    })

    afterEach(() => {
      configSystem.destroy()
    })

    it('应该能够创建配置系统', () => {
      expect(configSystem).toBeInstanceOf(ConfigSystem)
      expect(configSystem.config).toBeInstanceOf(ConfigManager)
      expect(configSystem.theme).toBeInstanceOf(ThemeManager)
      expect(configSystem.i18n).toBeInstanceOf(I18nManager)
      expect(configSystem.preset).toBeInstanceOf(PresetManager)
    })

    it('应该能够应用预设配置', () => {
      configSystem.applyPreset('instagram-square')
      expect(configSystem.config.get('aspectRatio')).toBe(1)
    })

    it('应该能够获取当前完整配置', () => {
      const config = configSystem.getCurrentConfig()
      expect(config).toHaveProperty('aspectRatio')
      expect(config).toHaveProperty('theme')
      expect(config).toHaveProperty('i18n')
    })

    it('应该能够重置所有配置', () => {
      configSystem.config.set('aspectRatio', 2)
      configSystem.theme.setMode('dark')
      configSystem.i18n.setLocale('en-US')
      
      configSystem.resetAll()
      
      expect(configSystem.config.get('aspectRatio')).toBeNull()
      expect(configSystem.theme.getMode()).toBe('light')
      expect(configSystem.i18n.getLocale()).toBe('zh-CN')
    })

    it('应该能够导出和导入所有配置', () => {
      configSystem.config.set('aspectRatio', 1.5)
      configSystem.theme.setMode('dark')
      
      const exported = configSystem.exportAll()
      
      configSystem.resetAll()
      configSystem.importAll(exported)
      
      expect(configSystem.config.get('aspectRatio')).toBe(1.5)
      expect(configSystem.theme.getMode()).toBe('dark')
    })
  })
})
