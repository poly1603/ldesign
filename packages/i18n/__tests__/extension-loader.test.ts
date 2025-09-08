/**
 * 扩展加载器功能测试
 * 
 * 测试翻译内容扩展功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  ExtensionLoader, 
  createExtensionLoader,
  ExtensionStrategy,
  type TranslationExtension,
  type ExtensionLoaderOptions
} from '../src/core/extension-loader'
import type { Loader, LanguagePackage } from '../src/core/types'

// 模拟基础加载器
const createMockLoader = (packages: Record<string, LanguagePackage>): Loader => ({
  async load(locale: string): Promise<LanguagePackage> {
    const pkg = packages[locale]
    if (!pkg) {
      throw new Error(`Package not found for locale: ${locale}`)
    }
    return pkg
  },
  async preload(locale: string): Promise<void> {
    await this.load(locale)
  },
  isLoaded: vi.fn(),
  getLoadedPackage: vi.fn()
})

// 测试用的语言包
const mockPackages: Record<string, LanguagePackage> = {
  'zh-CN': {
    info: {
      name: 'Chinese (Simplified)',
      nativeName: '中文（简体）',
      code: 'zh-CN',
      region: 'CN',
      direction: 'ltr',
      dateFormat: 'YYYY年MM月DD日',
      flag: '🇨🇳'
    },
    translations: {
      common: {
        hello: '你好',
        goodbye: '再见'
      },
      ui: {
        button: '按钮',
        input: '输入框'
      }
    }
  },
  'en': {
    info: {
      name: 'English',
      nativeName: 'English',
      code: 'en',
      region: 'US',
      direction: 'ltr',
      dateFormat: 'YYYY-MM-DD',
      flag: '🇺🇸'
    },
    translations: {
      common: {
        hello: 'Hello',
        goodbye: 'Goodbye'
      },
      ui: {
        button: 'Button',
        input: 'Input'
      }
    }
  }
}

describe('ExtensionLoader', () => {
  let baseLoader: Loader
  let extensionLoader: ExtensionLoader

  beforeEach(() => {
    baseLoader = createMockLoader(mockPackages)
    extensionLoader = new ExtensionLoader({ baseLoader })
  })

  describe('基础功能', () => {
    it('应该能够加载基础语言包', async () => {
      const pkg = await extensionLoader.load('zh-CN')
      expect(pkg).toBeDefined()
      expect(pkg.info.code).toBe('zh-CN')
      expect(pkg.translations.common.hello).toBe('你好')
    })

    it('应该缓存已加载的语言包', async () => {
      await extensionLoader.load('zh-CN')
      expect(extensionLoader.isLoaded('zh-CN')).toBe(true)
      
      const cached = extensionLoader.getLoadedPackage('zh-CN')
      expect(cached).toBeDefined()
    })

    it('应该支持预加载', async () => {
      await extensionLoader.preload('en')
      expect(extensionLoader.isLoaded('en')).toBe(true)
    })
  })

  describe('全局扩展', () => {
    it('应该应用全局扩展', async () => {
      const globalExtensions: TranslationExtension[] = [
        {
          name: 'global-test',
          translations: {
            common: {
              welcome: '欢迎'
            }
          }
        }
      ]

      extensionLoader.addGlobalExtensions(globalExtensions)
      const pkg = await extensionLoader.load('zh-CN')
      
      expect(pkg.translations.common.welcome).toBe('欢迎')
      expect(pkg.translations.common.hello).toBe('你好') // 原有翻译保持
    })

    it('应该按优先级应用全局扩展', async () => {
      const extensions: TranslationExtension[] = [
        {
          name: 'low-priority',
          priority: 1,
          translations: {
            common: { test: 'low' }
          }
        },
        {
          name: 'high-priority',
          priority: 10,
          translations: {
            common: { test: 'high' }
          }
        }
      ]

      extensionLoader.addGlobalExtensions(extensions)
      const pkg = await extensionLoader.load('zh-CN')
      
      // 高优先级的扩展应该覆盖低优先级的
      expect(pkg.translations.common.test).toBe('high')
    })
  })

  describe('语言特定扩展', () => {
    it('应该应用语言特定扩展', async () => {
      const zhExtensions: TranslationExtension[] = [
        {
          name: 'zh-specific',
          translations: {
            ui: {
              customButton: '自定义按钮'
            }
          }
        }
      ]

      extensionLoader.addLanguageExtensions('zh-CN', zhExtensions)
      
      const zhPkg = await extensionLoader.load('zh-CN')
      const enPkg = await extensionLoader.load('en')
      
      expect(zhPkg.translations.ui.customButton).toBe('自定义按钮')
      expect(enPkg.translations.ui.customButton).toBeUndefined()
    })

    it('应该同时应用全局和语言特定扩展', async () => {
      const globalExtensions: TranslationExtension[] = [
        {
          name: 'global',
          translations: {
            common: { global: '全局' }
          }
        }
      ]

      const zhExtensions: TranslationExtension[] = [
        {
          name: 'zh-specific',
          translations: {
            common: { specific: '特定' }
          }
        }
      ]

      extensionLoader.addGlobalExtensions(globalExtensions)
      extensionLoader.addLanguageExtensions('zh-CN', zhExtensions)
      
      const pkg = await extensionLoader.load('zh-CN')
      
      expect(pkg.translations.common.global).toBe('全局')
      expect(pkg.translations.common.specific).toBe('特定')
    })
  })

  describe('扩展策略', () => {
    beforeEach(() => {
      extensionLoader = new ExtensionLoader({
        baseLoader,
        defaultStrategy: ExtensionStrategy.MERGE
      })
    })

    it('应该支持覆盖策略', async () => {
      const extension: TranslationExtension = {
        name: 'override-test',
        strategy: ExtensionStrategy.OVERRIDE,
        translations: {
          common: {
            hello: '覆盖的你好'
          }
        }
      }

      extensionLoader.addGlobalExtensions([extension])
      const pkg = await extensionLoader.load('zh-CN')
      
      expect(pkg.translations.common.hello).toBe('覆盖的你好')
    })

    it('应该支持仅添加策略', async () => {
      const extension: TranslationExtension = {
        name: 'add-only-test',
        strategy: ExtensionStrategy.ADD_ONLY,
        translations: {
          common: {
            hello: '不应该覆盖',
            newKey: '新键值'
          }
        }
      }

      extensionLoader.addGlobalExtensions([extension])
      const pkg = await extensionLoader.load('zh-CN')
      
      expect(pkg.translations.common.hello).toBe('你好') // 不应该被覆盖
      expect(pkg.translations.common.newKey).toBe('新键值') // 新键应该被添加
    })

    it('应该支持追加策略', async () => {
      const extension: TranslationExtension = {
        name: 'append-test',
        strategy: ExtensionStrategy.APPEND,
        translations: {
          common: {
            hello: '世界'
          }
        }
      }

      extensionLoader.addGlobalExtensions([extension])
      const pkg = await extensionLoader.load('zh-CN')
      
      expect(pkg.translations.common.hello).toBe('你好 世界')
    })
  })

  describe('扩展管理', () => {
    it('应该能够添加单个翻译扩展', () => {
      extensionLoader.addTranslationExtension(
        'zh-CN',
        { test: { key: 'value' } },
        ExtensionStrategy.MERGE,
        5,
        'test-extension'
      )

      const extensions = extensionLoader.getExtensions('zh-CN')
      expect(extensions).toHaveLength(1)
      expect(extensions[0].name).toBe('test-extension')
    })

    it('应该能够覆盖翻译内容', () => {
      extensionLoader.overrideTranslations(
        'zh-CN',
        { common: { hello: '覆盖' } },
        'override-test'
      )

      const extensions = extensionLoader.getExtensions('zh-CN')
      expect(extensions).toHaveLength(1)
      expect(extensions[0].strategy).toBe(ExtensionStrategy.OVERRIDE)
      expect(extensions[0].priority).toBe(1000) // 高优先级
    })

    it('应该能够移除扩展', () => {
      extensionLoader.addTranslationExtension(
        'zh-CN',
        { test: 'value' },
        ExtensionStrategy.MERGE,
        0,
        'removable'
      )

      expect(extensionLoader.getExtensions('zh-CN')).toHaveLength(1)
      
      const removed = extensionLoader.removeExtension('zh-CN', 'removable')
      expect(removed).toBe(true)
      expect(extensionLoader.getExtensions('zh-CN')).toHaveLength(0)
    })

    it('应该能够清除所有扩展', () => {
      extensionLoader.addGlobalExtensions([
        { name: 'global1', translations: { test: 'value1' } }
      ])
      extensionLoader.addLanguageExtensions('zh-CN', [
        { name: 'zh1', translations: { test: 'value2' } }
      ])

      extensionLoader.clearExtensions()
      expect(extensionLoader.getExtensions()).toHaveLength(0)
      
      extensionLoader.clearExtensions('zh-CN')
      expect(extensionLoader.getExtensions('zh-CN')).toHaveLength(0)
    })
  })

  describe('统计信息', () => {
    it('应该提供扩展统计信息', () => {
      extensionLoader.addGlobalExtensions([
        { name: 'global1', translations: { test: 'value1' } },
        { name: 'global2', translations: { test: 'value2' } }
      ])
      
      extensionLoader.addLanguageExtensions('zh-CN', [
        { name: 'zh1', translations: { test: 'value3' } }
      ])

      const stats = extensionLoader.getExtensionStats()
      expect(stats.globalExtensions).toBe(2)
      expect(stats.languageExtensions).toBe(1)
      expect(stats.totalExtensions).toBe(3)
    })
  })

  describe('错误处理', () => {
    it('应该在没有基础包和扩展时抛出错误', async () => {
      const emptyLoader = new ExtensionLoader()
      
      await expect(emptyLoader.load('invalid')).rejects.toThrow('No translation found')
    })

    it('应该验证扩展格式', () => {
      expect(() => {
        extensionLoader.addGlobalExtensions([
          { name: 'invalid', translations: null as any }
        ])
      }).toThrow('Extension must have valid translations object')
    })

    it('应该限制扩展数量', () => {
      const loader = new ExtensionLoader({
        baseLoader,
        maxExtensions: 2
      })

      expect(() => {
        loader.addGlobalExtensions([
          { name: 'ext1', translations: { test: 'value1' } },
          { name: 'ext2', translations: { test: 'value2' } },
          { name: 'ext3', translations: { test: 'value3' } }
        ])
      }).toThrow('Too many extensions')
    })
  })
})

describe('createExtensionLoader', () => {
  it('应该创建扩展加载器实例', () => {
    const loader = createExtensionLoader()
    expect(loader).toBeInstanceOf(ExtensionLoader)
  })

  it('应该使用提供的配置', () => {
    const options: ExtensionLoaderOptions = {
      defaultStrategy: ExtensionStrategy.OVERRIDE,
      maxExtensions: 50
    }
    
    const loader = createExtensionLoader(options)
    expect(loader).toBeInstanceOf(ExtensionLoader)
  })
})
