/**
 * 选择性 I18n 创建函数测试
 *
 * 测试便捷创建函数的功能
 */

import { describe, expect, it } from 'vitest'
import { ExtensionStrategy } from '../src/core/extension-loader'
import {
  type ConfigurableI18nOptions,
  createConfigurableI18n,
  createExtensibleI18n,
  createSelectiveI18n,
} from '../src/core/selective-i18n'

describe('createSelectiveI18n', () => {
  it('应该创建选择性 I18n 实例', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      languageConfig: {
        enabled: ['zh-CN', 'en'],
      },
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
      },
    }

    const i18n = createSelectiveI18n(options)
    expect(i18n).toBeDefined()

    // 等待初始化完成
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
    expect(i18n.t('hello')).toBe('你好')
  })

  it('应该只加载启用的语言', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      languageConfig: {
        enabled: ['zh-CN', 'en'],
      },
      strictMode: true,
      autoDetect: false, // 禁用自动检测避免检测到未启用的语言
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
        'ja': { hello: 'こんにちは' },
      },
    }

    const i18n = createSelectiveI18n(options)
    await i18n.init()

    // 应该能够切换到启用的语言
    await i18n.changeLanguage('en')
    expect(i18n.t('hello')).toBe('Hello')

    // 严格模式下不应该能够切换到未启用的语言
    await expect(i18n.changeLanguage('ja')).rejects.toThrow()
  })

  it('应该支持语言过滤器', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      languageConfig: {
        enabled: {
          regions: ['CN', 'US'],
        },
      },
      strictMode: true,
    }

    const i18n = createSelectiveI18n(options)
    await i18n.init()

    // 应该能够访问中国和美国地区的语言
    expect(i18n.currentLocale).toBe('zh-CN')
  })

  it('应该使用默认配置', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
    }

    const i18n = createSelectiveI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
    expect(i18n.options.fallbackLocale).toBe('zh-CN')
  })
})

describe('createExtensibleI18n', () => {
  it('应该创建可扩展 I18n 实例', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
      },
      globalExtensions: [
        {
          name: 'global-test',
          translations: {
            common: { welcome: '欢迎' },
          },
        },
      ],
    }

    const i18n = createExtensibleI18n(options)
    await i18n.init()

    expect(i18n.t('hello')).toBe('你好')
    expect(i18n.t('common.welcome')).toBe('欢迎')
  })

  it('应该支持语言特定扩展', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
      },
      languageExtensions: {
        'zh-CN': [
          {
            name: 'zh-extension',
            translations: {
              ui: { button: '按钮' },
            },
          },
        ],
        'en': [
          {
            name: 'en-extension',
            translations: {
              ui: { button: 'Button' },
            },
          },
        ],
      },
    }

    const i18n = createExtensibleI18n(options)
    await i18n.init()

    expect(i18n.t('ui.button')).toBe('按钮')

    await i18n.changeLanguage('en')
    expect(i18n.t('ui.button')).toBe('Button')
  })

  it('应该支持不同的扩展策略', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      messages: {
        'zh-CN': { hello: '你好' },
      },
      globalExtensions: [
        {
          name: 'override-test',
          strategy: ExtensionStrategy.OVERRIDE,
          translations: {
            hello: '覆盖的你好',
          },
        },
      ],
    }

    const i18n = createExtensibleI18n(options)
    await i18n.init()

    expect(i18n.t('hello')).toBe('覆盖的你好')
  })

  it('应该按优先级应用扩展', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      messages: {
        'zh-CN': { test: '原始' },
      },
      globalExtensions: [
        {
          name: 'low-priority',
          priority: 1,
          translations: { test: '低优先级' },
        },
        {
          name: 'high-priority',
          priority: 10,
          translations: { test: '高优先级' },
        },
      ],
    }

    const i18n = createExtensibleI18n(options)
    await i18n.init()

    expect(i18n.t('test')).toBe('高优先级')
  })
})

describe('createConfigurableI18n', () => {
  it('应该根据配置选择合适的创建方式', async () => {
    // 有扩展配置时应该使用扩展加载器
    const extensibleOptions: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      globalExtensions: [
        {
          name: 'test',
          translations: { test: 'value' },
        },
      ],
    }

    const extensibleI18n = createConfigurableI18n(extensibleOptions)
    await extensibleI18n.init()
    expect(extensibleI18n.t('test')).toBe('value')

    // 有语言配置时应该使用选择性加载器
    const selectiveOptions: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      languageConfig: {
        enabled: ['zh-CN', 'en'],
      },
    }

    const selectiveI18n = createConfigurableI18n(selectiveOptions)
    await selectiveI18n.init()
    expect(selectiveI18n.currentLocale).toBe('zh-CN')

    // 普通配置应该使用标准方式
    const standardOptions: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      messages: {
        'zh-CN': { hello: '你好' },
      },
    }

    const standardI18n = createConfigurableI18n(standardOptions)
    await standardI18n.init()
    expect(standardI18n.t('hello')).toBe('你好')
  })

  it('应该支持完整功能配置', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      fallbackLocale: 'en',
      languageConfig: {
        enabled: ['zh-CN', 'en', 'ja'],
        defaultLocale: 'zh-CN',
        fallbackLocale: 'en',
      },
      messages: {
        'zh-CN': { hello: '你好' },
        'en': { hello: 'Hello' },
        'ja': { hello: 'こんにちは' },
      },
      globalExtensions: [
        {
          name: 'global',
          translations: {
            common: { welcome: '欢迎' },
          },
        },
      ],
      languageExtensions: {
        'zh-CN': [
          {
            name: 'zh-specific',
            translations: {
              ui: { button: '按钮' },
            },
          },
        ],
      },
      strictMode: true,
      loadingStrategy: 'lazy',
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
    expect(i18n.options.fallbackLocale).toBe('en')
    expect(i18n.t('hello')).toBe('你好')
    expect(i18n.t('common.welcome')).toBe('欢迎')
    expect(i18n.t('ui.button')).toBe('按钮')
  })

  it('应该正确处理缓存配置', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      cache: {
        enabled: true,
        maxSize: 100,
        maxMemory: 1024 * 1024,
        defaultTTL: 30000,
      },
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
  })

  it('应该正确处理存储配置', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
      storage: 'sessionStorage',
      storageKey: 'test-locale',
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
  })

  it('应该支持生命周期回调', async () => {
    let languageChanged = false
    let loadError: Error | null = null

    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      onLanguageChanged: (locale: string) => {
        languageChanged = true
      },
      onLoadError: (error: Error) => {
        loadError = error
      },
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    await i18n.changeLanguage('en')
    expect(languageChanged).toBe(true)
  })
})

describe('配置验证', () => {
  it('应该要求必需的 locale 参数', () => {
    expect(() => {
      createConfigurableI18n({} as any)
    }).toThrow()
  })

  it('应该使用合理的默认值', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      autoDetect: false, // 禁用自动检测
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
    expect(i18n.options.fallbackLocale).toBe('zh-CN') // 默认与 locale 相同
  })

  it('应该正确处理空的扩展配置', async () => {
    const options: ConfigurableI18nOptions = {
      locale: 'zh-CN',
      globalExtensions: [],
      languageExtensions: {},
    }

    const i18n = createConfigurableI18n(options)
    await i18n.init()

    expect(i18n.currentLocale).toBe('zh-CN')
  })
})
