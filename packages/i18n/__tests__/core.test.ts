/**
 * 核心功能测试
 * 测试 I18n 类的基础功能
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { createI18n } from '../src/core/createI18n'
import { I18n } from '../src/core/i18n'

describe('i18n 核心功能', () => {
  let i18n: I18n

  beforeEach(() => {
    i18n = new I18n({
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en',
      autoDetect: false, // 禁用自动检测，避免测试环境影响
      storage: 'none', // 禁用存储，避免测试间相互影响
      messages: {
        'zh-CN': {
          hello: '你好',
          welcome: '欢迎使用 {name}',
          count: '{count, plural, =0{没有项目} =1{一个项目} other{# 个项目}}',
          nested: {
            deep: {
              value: '深层嵌套值',
            },
          },
        },
        'en': {
          hello: 'Hello',
          welcome: 'Welcome to {name}',
          count: '{count, plural, =0{no items} =1{one item} other{# items}}',
          missing: 'This key only exists in English',
          nested: {
            deep: {
              value: 'Deep nested value',
            },
          },
        },
      },
    })
  })

  describe('基础实例化', () => {
    it('应该正确创建 I18n 实例', () => {
      expect(i18n).toBeInstanceOf(I18n)
      expect(i18n.getCurrentLanguage()).toBe('zh-CN')
    })

    it('应该使用默认配置', () => {
      const defaultI18n = new I18n()
      expect(defaultI18n.getCurrentLanguage()).toBe('en')
    })
  })

  describe('基础翻译功能', () => {
    it('应该正确翻译简单文本', async () => {
      // 调试信息
      console.log('测试开始 - 当前语言:', i18n.getCurrentLanguage())
      console.log('测试开始 - Loader 类型:', i18n.loader.constructor.name)
      console.log('测试开始 - 可用语言:', i18n.loader.getAvailableLocales())

      await i18n.init()

      console.log('初始化后 - 当前语言:', i18n.getCurrentLanguage())
      console.log('初始化后 - 是否已初始化:', (i18n as any).isInitialized)

      const result = i18n.t('hello')
      console.log('翻译结果:', result)

      expect(result).toBe('你好')
    })

    it('应该正确处理插值', async () => {
      await i18n.init()
      const result = i18n.t('welcome', { name: 'LDesign I18n' })
      expect(result).toBe('欢迎使用 LDesign I18n')
    })

    it('应该正确处理嵌套键', async () => {
      await i18n.init()
      const result = i18n.t('nested.deep.value')
      expect(result).toBe('深层嵌套值')
    })

    it('应该在翻译缺失时返回键名', async () => {
      await i18n.init()
      const result = i18n.t('nonexistent.key')
      expect(result).toBe('nonexistent.key')
    })
  })

  describe('语言切换功能', () => {
    it('应该正确切换语言', async () => {
      await i18n.init()

      // 初始中文
      expect(i18n.t('hello')).toBe('你好')

      // 切换到英文
      await i18n.changeLanguage('en')
      expect(i18n.getCurrentLanguage()).toBe('en')
      expect(i18n.t('hello')).toBe('Hello')
    })

    it('应该在切换到相同语言时不执行操作', async () => {
      await i18n.init()
      const currentLang = i18n.getCurrentLanguage()

      await i18n.changeLanguage(currentLang)
      expect(i18n.getCurrentLanguage()).toBe(currentLang)
    })
  })

  describe('降级语言功能', () => {
    it('应该在当前语言缺失翻译时使用降级语言', async () => {
      await i18n.init()

      // 确保降级语言包已加载
      await i18n.loader.load('en')

      // 这个键只在英文中存在
      const result = i18n.t('missing')
      expect(result).toBe('This key only exists in English')
    })

    it('应该优先使用当前语言的翻译', async () => {
      await i18n.init()

      // 这个键在两种语言中都存在，应该使用中文
      const result = i18n.t('hello')
      expect(result).toBe('你好')
    })
  })

  describe('翻译键存在性检查', () => {
    it('应该正确检查键是否存在', async () => {
      await i18n.init()

      expect(i18n.exists('hello')).toBe(true)
      expect(i18n.exists('nonexistent')).toBe(false)
      expect(i18n.exists('nested.deep.value')).toBe(true)
    })

    it('应该检查指定语言中的键', async () => {
      await i18n.init()

      // 确保英文语言包已加载
      await i18n.loader.load('en')

      expect(i18n.exists('missing', 'en')).toBe(true)
      expect(i18n.exists('missing', 'zh-CN')).toBe(false)
    })
  })

  describe('批量翻译功能', () => {
    it('应该正确执行批量翻译', async () => {
      await i18n.init()

      const result = await i18n.batchTranslate(['hello', 'welcome'])

      expect(result.successCount).toBe(2)
      expect(result.translations.hello).toBe('你好')
      expect(result.translations.welcome).toBe('欢迎使用 ') // 没有参数时替换为空字符串
    })

    it('应该处理批量翻译中的缺失键', async () => {
      await i18n.init()

      const result = await i18n.batchTranslate(['hello', 'nonexistent'])

      expect(result.successCount).toBe(1)
      expect(result.translations.hello).toBe('你好')
      expect(result.translations.nonexistent).toBe('nonexistent')
    })
  })
})

describe('createI18n 便捷函数', () => {
  it('应该正确创建 I18n 实例', () => {
    const i18n = createI18n({
      locale: 'zh-CN',
      messages: {
        'zh-CN': { test: '测试' },
      },
    })

    expect(i18n).toBeInstanceOf(I18n)
    expect(i18n.getCurrentLanguage()).toBe('zh-CN')
  })
})

describe('全局 I18n 管理', () => {
  it('应该正确管理全局实例', async () => {
    const { createGlobalI18n, getGlobalI18n, hasGlobalI18n, destroyGlobalI18n } = await import('../src/core/createI18n')

    // 初始状态
    expect(hasGlobalI18n()).toBe(false)

    // 创建全局实例
    const globalI18n = createGlobalI18n({
      locale: 'zh-CN',
      messages: { 'zh-CN': { test: '全局测试' } },
    })

    expect(hasGlobalI18n()).toBe(true)
    expect(getGlobalI18n()).toBe(globalI18n)

    // 销毁全局实例
    await destroyGlobalI18n()
    expect(hasGlobalI18n()).toBe(false)
  })
})
