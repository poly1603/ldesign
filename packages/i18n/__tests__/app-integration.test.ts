/**
 * 应用集成测试
 * 
 * 测试多语言包在应用中的集成功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createConfigurableI18n } from '../src/core/selective-i18n'
import type { ConfigurableI18nOptions } from '../src/core/types'

describe('应用集成测试', () => {
  let i18n: any

  beforeEach(() => {
    // 清理可能的缓存
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('应该支持应用级语言配置', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en'],
        defaultLocale: 'zh-CN',
        fallbackLocale: 'en'
      },
      messages: {
        'zh-CN': {
          app: { name: 'LDesign 应用' },
          navigation: { home: '首页' }
        },
        'en': {
          app: { name: 'LDesign App' },
          navigation: { home: 'Home' }
        }
      },
      strictMode: true
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
    expect(i18n.t('app.name')).toBe('LDesign 应用')
    expect(i18n.t('navigation.home')).toBe('首页')

    // 切换语言
    await i18n.changeLanguage('en')
    expect(i18n.t('app.name')).toBe('LDesign App')
    expect(i18n.t('navigation.home')).toBe('Home')
  })

  it('应该支持应用级翻译扩展', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      globalExtensions: [
        {
          name: 'app-common',
          translations: {
            common: {
              save: 'Save',
              cancel: 'Cancel'
            }
          }
        }
      ],
      languageExtensions: {
        'zh-CN': [
          {
            name: 'zh-app',
            translations: {
              common: {
                save: '保存',
                cancel: '取消'
              }
            }
          }
        ]
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    expect(i18n.t('common.save')).toBe('保存')
    expect(i18n.t('common.cancel')).toBe('取消')
  })

  it('应该支持存储配置持久化', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      storage: 'none', // 先测试无存储的情况
      languageConfig: {
        enabled: ['zh-CN', 'en']
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    // 切换语言
    await i18n.changeLanguage('en')
    expect(i18n.currentLocale).toBe('en')

    // 无存储时，新实例应该使用默认语言
    const i18n2 = createConfigurableI18n(appConfig)
    await i18n2.init()
    expect(i18n2.currentLocale).toBe('zh-CN') // 应该是默认语言
  })

  it('应该支持缓存配置优化', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      cache: {
        enabled: true,
        maxSize: 100,
        defaultTTL: 30000
      },
      messages: {
        'zh-CN': {
          test: { key: '测试值' }
        }
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    // 第一次翻译
    const result1 = i18n.t('test.key')
    expect(result1).toBe('测试值')

    // 第二次翻译应该使用缓存
    const result2 = i18n.t('test.key')
    expect(result2).toBe('测试值')
  })

  it('应该支持严格模式语言控制', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en']
      },
      strictMode: true,
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
        'ja': { hello: 'こんにちは' }
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    // 应该能切换到启用的语言
    await i18n.changeLanguage('en')
    expect(i18n.currentLocale).toBe('en')

    // 不应该能切换到未启用的语言
    await expect(i18n.changeLanguage('ja')).rejects.toThrow()
  })

  it('应该支持动态语言管理', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en']
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    const registry = i18n.getLanguageRegistry()

    // 初始状态
    expect(registry.getEnabledLanguages()).toEqual(['zh-CN', 'en'])

    // 动态启用日语
    registry.enableLanguage('ja')
    expect(registry.isLanguageEnabled('ja')).toBe(true)

    // 动态禁用英语
    registry.disableLanguage('en')
    expect(registry.isLanguageEnabled('en')).toBe(false)
  })

  it('应该支持扩展统计和监控', async () => {
    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      globalExtensions: [
        {
          name: 'extension-1',
          translations: { key1: 'value1' }
        },
        {
          name: 'extension-2',
          translations: { key2: 'value2' }
        }
      ]
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    const loader = i18n.getExtensionLoader()
    const stats = loader.getExtensionStats()

    expect(stats.totalExtensions).toBeGreaterThan(0)
    expect(stats.globalExtensions).toBe(2)
  })

  it('应该支持生命周期回调', async () => {
    let initCalled = false
    let languageChanged = false

    const appConfig: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false,
      languageConfig: {
        enabled: ['zh-CN', 'en']
      },
      onInit: () => {
        initCalled = true
      },
      onLanguageChanged: () => {
        languageChanged = true
      }
    }

    i18n = createConfigurableI18n(appConfig)
    await i18n.init()

    expect(initCalled).toBe(true)

    await i18n.changeLanguage('en')
    expect(languageChanged).toBe(true)
  })
})
