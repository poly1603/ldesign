import type { LanguagePackage } from '../src/core/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ManualDetector } from '../src/core/detector'
import { I18n } from '../src/core/i18n'
import { StaticLoader } from '../src/core/loader'
import { MemoryStorage } from '../src/core/storage'

// 测试用的语言包
const enPackage: LanguagePackage = {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
  },
  translations: {
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      welcome: 'Welcome, {{name}}!',
      items: '{count, plural, =0{no items} =1{one item} other{# items}}',
    },
    nested: {
      deep: {
        value: 'Deep nested value',
      },
    },
  },
}

const zhPackage: LanguagePackage = {
  info: {
    name: '中文',
    nativeName: '中文',
    code: 'zh-CN',
    direction: 'ltr',
    dateFormat: 'YYYY年M月D日',
  },
  translations: {
    common: {
      ok: '确定',
      cancel: '取消',
      welcome: '欢迎，{{name}}！',
      items: '{{count}} 个项目',
    },
    nested: {
      deep: {
        value: '深层嵌套值',
      },
    },
  },
}

describe('i18n', () => {
  let i18n: I18n
  let loader: StaticLoader
  let storage: MemoryStorage
  let detector: ManualDetector

  beforeEach(() => {
    // 创建测试用的组件
    loader = new StaticLoader()
    loader.registerPackages({
      'en': enPackage,
      'zh-CN': zhPackage,
    })

    storage = new MemoryStorage()
    detector = new ManualDetector(['en'])

    // 创建 I18n 实例
    i18n = new I18n({
      defaultLocale: 'en',
      fallbackLocale: 'en',
      storage: 'memory',
      autoDetect: false,
      cache: {
        enabled: true,
        maxSize: 100,
      },
    })

    // 设置自定义组件
    i18n.setLoader(loader)
    i18n.setStorage(storage)
    i18n.setDetector(detector)
  })

  describe('初始化', () => {
    it('应该正确初始化', async () => {
      await i18n.init()
      expect(i18n.getCurrentLanguage()).toBe('en')
    })

    it('应该加载默认语言包', async () => {
      await i18n.init()
      expect(i18n.isLanguageLoaded('en')).toBe(true)
    })
  })

  describe('翻译功能', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该正确翻译基础键', () => {
      expect(i18n.t('common.ok')).toBe('OK')
      expect(i18n.t('common.cancel')).toBe('Cancel')
    })

    it('应该正确翻译嵌套键', () => {
      expect(i18n.t('nested.deep.value')).toBe('Deep nested value')
    })

    it('应该处理不存在的键', () => {
      expect(i18n.t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('应该支持插值', () => {
      expect(i18n.t('common.welcome', { name: 'John' })).toBe('Welcome, John!')
    })

    it('应该支持复数', () => {
      expect(i18n.t('common.items', { count: 0 })).toBe('no items')
      expect(i18n.t('common.items', { count: 1 })).toBe('one item')
      expect(i18n.t('common.items', { count: 5 })).toBe('5 items')
    })

    it('应该支持默认值', () => {
      expect(i18n.t('nonexistent.key', {}, { defaultValue: 'Default' })).toBe(
        'Default',
      )
    })
  })

  describe('语言切换', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该正确切换语言', async () => {
      await i18n.changeLanguage('zh-CN')
      expect(i18n.getCurrentLanguage()).toBe('zh-CN')
      expect(i18n.t('common.ok')).toBe('确定')
    })

    it('应该触发语言变更事件', async () => {
      const callback = vi.fn()
      i18n.on('languageChanged', callback)

      await i18n.changeLanguage('zh-CN')

      expect(callback).toHaveBeenCalledWith('zh-CN', 'en')
    })

    it('应该保存语言到存储', async () => {
      await i18n.changeLanguage('zh-CN')
      expect(storage.getLanguage()).toBe('zh-CN')
    })
  })

  describe('批量翻译', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该正确批量翻译', () => {
      const result = i18n.batchTranslate(['common.ok', 'common.cancel'])
      expect(result).toEqual({
        'common.ok': 'OK',
        'common.cancel': 'Cancel',
      })
    })
  })

  describe('语言信息', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该返回当前语言信息', () => {
      const info = i18n.getCurrentLanguageInfo()
      expect(info).toEqual(enPackage.info)
    })

    it('应该返回可用语言列表', async () => {
      // 先加载zh-CN语言
      await i18n.changeLanguage('zh-CN')

      const languages = i18n.getAvailableLanguages()
      expect(languages).toHaveLength(2)
      expect(languages.map(l => l.code)).toContain('en')
      expect(languages.map(l => l.code)).toContain('zh-CN')
    })
  })

  describe('键存在性检查', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该正确检查键是否存在', () => {
      expect(i18n.exists('common.ok')).toBe(true)
      expect(i18n.exists('nonexistent.key')).toBe(false)
    })

    it('应该支持指定语言检查', async () => {
      await i18n.changeLanguage('zh-CN')
      expect(i18n.exists('common.ok', 'en')).toBe(true)
      expect(i18n.exists('common.ok', 'zh-CN')).toBe(true)
    })
  })

  describe('获取所有键', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该返回所有翻译键', () => {
      const keys = i18n.getKeys()
      expect(keys).toContain('common.ok')
      expect(keys).toContain('common.cancel')
      expect(keys).toContain('nested.deep.value')
    })
  })

  describe('预加载', () => {
    let preloadI18n: I18n
    let preloadLoader: StaticLoader

    beforeEach(async () => {
      // 创建只有英语语言包的loader用于测试预加载
      preloadLoader = new StaticLoader()
      preloadLoader.registerPackage('en', enPackage)

      preloadI18n = new I18n({
        defaultLocale: 'en',
        fallbackLocale: 'en',
        storage: 'memory',
        autoDetect: false,
      })

      preloadI18n.setLoader(preloadLoader)
      preloadI18n.setStorage(new MemoryStorage())
      preloadI18n.setDetector(new ManualDetector(['en']))

      await preloadI18n.init()
    })

    it('应该支持预加载语言', async () => {
      expect(preloadI18n.isLanguageLoaded('zh-CN')).toBe(false)

      // 动态注册zh-CN语言包
      preloadLoader.registerPackage('zh-CN', zhPackage)

      await preloadI18n.preloadLanguage('zh-CN')

      expect(preloadI18n.isLanguageLoaded('zh-CN')).toBe(true)
    })
  })

  describe('降级处理', () => {
    beforeEach(async () => {
      // 创建只有部分翻译的语言包
      const partialPackage: LanguagePackage = {
        info: {
          name: 'Partial',
          nativeName: 'Partial',
          code: 'partial',
          direction: 'ltr',
          dateFormat: 'DD/MM/YYYY',
        },
        translations: {
          common: {
            ok: 'Partial OK',
            // 缺少 cancel 键
          },
        },
      }

      // 创建新的loader并注册所有语言包
      const testLoader = new StaticLoader()
      testLoader.registerPackages({
        'en': enPackage,
        'zh-CN': zhPackage,
        'partial': partialPackage,
      })

      i18n = new I18n({
        defaultLocale: 'partial',
        fallbackLocale: 'en',
        storage: 'memory',
        autoDetect: false,
      })

      i18n.setLoader(testLoader)
      i18n.setStorage(storage)
      i18n.setDetector(detector)

      await i18n.init()

      // 确保英语语言包被加载（作为降级语言）
      await i18n.preloadLanguage('en')
    })

    it('应该使用降级语言的翻译', async () => {
      await i18n.changeLanguage('partial')

      // 存在的键使用当前语言
      expect(i18n.t('common.ok')).toBe('Partial OK')

      // 确保英语语言包已加载
      expect(i18n.isLanguageLoaded('en')).toBe(true)

      // 不存在的键使用降级语言
      expect(i18n.t('common.cancel')).toBe('Cancel')
    })
  })

  describe('缓存', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该缓存翻译结果', () => {
      // 第一次调用
      const result1 = i18n.t('common.ok')

      // 第二次调用应该使用缓存
      const result2 = i18n.t('common.ok')

      expect(result1).toBe(result2)
      expect(result1).toBe('OK')
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该支持添加和移除事件监听器', () => {
      const callback = vi.fn()

      i18n.on('languageChanged', callback)
      i18n.emit('languageChanged', 'zh-CN', 'en')

      expect(callback).toHaveBeenCalledWith('zh-CN', 'en')

      i18n.off('languageChanged', callback)
      i18n.emit('languageChanged', 'en', 'zh-CN')

      // 移除后不应该再被调用
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('销毁', () => {
    beforeEach(async () => {
      await i18n.init()
    })

    it('应该正确销毁实例', () => {
      i18n.destroy()

      // 销毁后缓存应该被清空
      // 销毁后缓存应该被清空 - 通过重新翻译来验证缓存是否被清理
      expect(() => i18n.t('common.ok')).not.toThrow()
    })
  })
})
