/**
 * 语言配置功能测试
 *
 * 测试语言选择配置、过滤器和注册表功能
 */

import { beforeEach, describe, expect, it } from 'vitest'
import {
  createLanguageRegistry,
  type LanguageConfig,
  type LanguageFilterConfig,
  LanguageRegistry,
} from '../src/core/language-config'

describe('languageRegistry', () => {
  let registry: LanguageRegistry

  beforeEach(() => {
    registry = new LanguageRegistry()
  })

  describe('基础功能', () => {
    it('应该初始化所有可用语言', () => {
      const available = registry.getAvailableLanguages()
      expect(available).toContain('zh-CN')
      expect(available).toContain('en')
      expect(available).toContain('ja')
      expect(available).toContain('ko')
      expect(available.length).toBeGreaterThan(8)
    })

    it('应该默认启用所有语言', () => {
      const enabled = registry.getEnabledLanguages()
      const available = registry.getAvailableLanguages()
      expect(enabled.length).toBe(available.length)
    })

    it('应该正确检查语言可用性', () => {
      expect(registry.isLanguageAvailable('zh-CN')).toBe(true)
      expect(registry.isLanguageAvailable('en')).toBe(true)
      expect(registry.isLanguageAvailable('invalid')).toBe(false)
    })

    it('应该正确检查语言启用状态', () => {
      expect(registry.isLanguageEnabled('zh-CN')).toBe(true)
      expect(registry.isLanguageEnabled('en')).toBe(true)
    })
  })

  describe('语言过滤器', () => {
    it('应该支持数组过滤器', () => {
      const config: LanguageConfig = {
        enabled: ['zh-CN', 'en'],
      }
      registry = new LanguageRegistry(config)

      const enabled = registry.getEnabledLanguages()
      expect(enabled).toEqual(['zh-CN', 'en'])
    })

    it('应该支持函数过滤器', () => {
      const config: LanguageConfig = {
        enabled: (locale, info) => {
          return info?.direction === 'ltr'
        },
      }
      registry = new LanguageRegistry(config)

      const enabled = registry.getEnabledLanguages()
      expect(enabled.length).toBeGreaterThan(0)
      // 所有启用的语言都应该是 ltr
      enabled.forEach((locale) => {
        const info = registry.getLanguageInfo(locale)
        expect(info?.direction).toBe('ltr')
      })
    })

    it('应该支持配置对象过滤器', () => {
      const filterConfig: LanguageFilterConfig = {
        include: ['zh-CN', 'en', 'ja', 'ko'],
        exclude: ['ko'],
        regions: ['CN', 'US'],
      }

      const config: LanguageConfig = {
        enabled: filterConfig,
      }
      registry = new LanguageRegistry(config)

      const enabled = registry.getEnabledLanguages()
      expect(enabled).toContain('zh-CN')
      expect(enabled).not.toContain('ko') // 被排除
    })

    it('应该支持自定义过滤函数', () => {
      const filterConfig: LanguageFilterConfig = {
        custom: (locale, info) => {
          return locale.startsWith('zh') || locale.startsWith('en')
        },
      }

      const config: LanguageConfig = {
        enabled: filterConfig,
      }
      registry = new LanguageRegistry(config)

      const enabled = registry.getEnabledLanguages()
      enabled.forEach((locale) => {
        expect(locale.startsWith('zh') || locale.startsWith('en')).toBe(true)
      })
    })
  })

  describe('语言管理', () => {
    beforeEach(() => {
      const config: LanguageConfig = {
        enabled: ['zh-CN', 'en', 'ja'],
      }
      registry = new LanguageRegistry(config)
    })

    it('应该能够启用语言', () => {
      expect(registry.enableLanguage('ko')).toBe(true)
      expect(registry.isLanguageEnabled('ko')).toBe(true)
    })

    it('应该能够禁用语言', () => {
      expect(registry.disableLanguage('ja')).toBe(true)
      expect(registry.isLanguageEnabled('ja')).toBe(false)
    })

    it('不应该启用不存在的语言', () => {
      expect(registry.enableLanguage('invalid')).toBe(false)
    })

    it('不应该禁用不存在的语言', () => {
      expect(registry.disableLanguage('invalid')).toBe(false)
    })

    it('应该正确获取语言信息', () => {
      const info = registry.getLanguageInfo('zh-CN')
      expect(info).toBeDefined()
      expect(info?.code).toBe('zh-CN')
      expect(info?.name).toBe('Chinese (Simplified)')
      expect(info?.nativeName).toBe('中文（简体）')
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      registry.updateConfig({
        enabled: ['zh-CN', 'en'],
        defaultLocale: 'zh-CN',
      })

      const enabled = registry.getEnabledLanguages()
      expect(enabled).toEqual(['zh-CN', 'en'])
    })

    it('应该确保默认语言被启用', () => {
      registry.updateConfig({
        enabled: ['en'],
        defaultLocale: 'zh-CN',
      })

      expect(registry.isLanguageEnabled('zh-CN')).toBe(true)
      expect(registry.isLanguageEnabled('en')).toBe(true)
    })

    it('应该确保回退语言被启用', () => {
      registry.updateConfig({
        enabled: ['zh-CN'],
        fallbackLocale: 'en',
      })

      expect(registry.isLanguageEnabled('zh-CN')).toBe(true)
      expect(registry.isLanguageEnabled('en')).toBe(true)
    })
  })

  describe('禁用列表处理', () => {
    it('应该正确处理禁用列表', () => {
      const config: LanguageConfig = {
        enabled: ['zh-CN', 'en', 'ja', 'ko'],
        disabled: ['ko'],
      }
      registry = new LanguageRegistry(config)

      expect(registry.isLanguageEnabled('zh-CN')).toBe(true)
      expect(registry.isLanguageEnabled('en')).toBe(true)
      expect(registry.isLanguageEnabled('ja')).toBe(true)
      expect(registry.isLanguageEnabled('ko')).toBe(false)
    })

    it('禁用列表应该优先于启用列表', () => {
      const config: LanguageConfig = {
        enabled: ['zh-CN', 'en', 'ja'],
        disabled: ['ja'],
      }
      registry = new LanguageRegistry(config)

      expect(registry.isLanguageEnabled('ja')).toBe(false)
    })
  })

  describe('别名支持', () => {
    it('应该支持语言别名', () => {
      expect(registry.isLanguageAvailable('zh')).toBe(true)
      expect(registry.isLanguageAvailable('en-US')).toBe(true)
      expect(registry.isLanguageAvailable('ja-JP')).toBe(true)
    })

    it('别名应该指向正确的主语言', () => {
      const zhInfo = registry.getLanguageInfo('zh')
      const zhCNInfo = registry.getLanguageInfo('zh-CN')

      expect(zhInfo?.name).toBe(zhCNInfo?.name)
      expect(zhInfo?.nativeName).toBe(zhCNInfo?.nativeName)
    })
  })
})

describe('createLanguageRegistry', () => {
  it('应该创建语言注册表实例', () => {
    const registry = createLanguageRegistry()
    expect(registry).toBeInstanceOf(LanguageRegistry)
  })

  it('应该使用提供的配置', () => {
    const config: LanguageConfig = {
      enabled: ['zh-CN', 'en'],
      defaultLocale: 'zh-CN',
    }

    const registry = createLanguageRegistry(config)
    const enabled = registry.getEnabledLanguages()
    expect(enabled).toEqual(['zh-CN', 'en'])
  })
})

describe('复杂场景测试', () => {
  it('应该正确处理复杂的过滤配置', () => {
    const config: LanguageConfig = {
      enabled: {
        include: ['zh-CN', 'en', 'ja', 'ko', 'es', 'fr'],
        exclude: ['es', 'fr'],
        custom: locale => !locale.includes('-'),
      },
      defaultLocale: 'zh-CN',
      fallbackLocale: 'en',
    }

    const registry = createLanguageRegistry(config)
    const enabled = registry.getEnabledLanguages()

    // 应该包含默认语言和回退语言
    expect(enabled).toContain('zh-CN')
    expect(enabled).toContain('en')

    // 应该排除 es 和 fr
    expect(enabled).not.toContain('es')
    expect(enabled).not.toContain('fr')

    // 自定义函数：不包含 '-' 的语言
    expect(enabled).toContain('ja')
    expect(enabled).toContain('ko')
  })

  it('应该正确处理空配置', () => {
    const registry = createLanguageRegistry({})
    const enabled = registry.getEnabledLanguages()
    const available = registry.getAvailableLanguages()

    // 空配置应该启用所有可用语言
    expect(enabled.length).toBe(available.length)
  })

  it('应该正确处理优先级配置', () => {
    const config: LanguageConfig = {
      enabled: ['zh-CN', 'en', 'ja'],
      priority: {
        'zh-CN': 100,
        'en': 90,
        'ja': 80,
      },
    }

    const registry = createLanguageRegistry(config)
    expect(registry.getConfig().priority).toEqual(config.priority)
  })
})
