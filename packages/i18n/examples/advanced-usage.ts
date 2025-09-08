/**
 * LDesign I18n 高级功能使用示例
 * 
 * 演示语言选择配置、翻译内容扩展和动态管理功能
 */

import {
  createSelectiveI18n,
  createExtensibleI18n,
  createConfigurableI18n,
  ExtensionStrategy,
  type ConfigurableI18nOptions,
  type LanguageConfig,
  type TranslationExtension
} from '@ldesign/i18n'

// ==================== 示例 1: 语言选择配置 ====================

/**
 * 示例 1.1: 基础语言选择
 */
async function basicLanguageSelection() {
  console.log('=== 示例 1.1: 基础语言选择 ===')
  
  const i18n = createSelectiveI18n({
    locale: 'zh-CN',
    languageConfig: {
      enabled: ['zh-CN', 'en'] // 只启用中文和英文
    },
    strictMode: true, // 严格模式
    autoDetect: false,
    messages: {
      'zh-CN': { hello: '你好' },
      'en': { hello: 'Hello' },
      'ja': { hello: 'こんにちは' } // 这个不会被加载
    }
  })
  
  await i18n.init()
  
  console.log('当前语言:', i18n.currentLocale)
  console.log('翻译结果:', i18n.t('hello'))
  
  // 切换到启用的语言
  await i18n.changeLanguage('en')
  console.log('切换后:', i18n.t('hello'))
  
  // 尝试切换到未启用的语言（会失败）
  try {
    await i18n.changeLanguage('ja')
  } catch (error) {
    console.log('预期的错误:', error.message)
  }
}

/**
 * 示例 1.2: 高级语言过滤
 */
async function advancedLanguageFiltering() {
  console.log('\n=== 示例 1.2: 高级语言过滤 ===')
  
  const i18n = createSelectiveI18n({
    locale: 'zh-CN',
    languageConfig: {
      enabled: {
        regions: ['CN', 'US'], // 只启用中国和美国地区的语言
        exclude: ['en-GB'] // 排除英式英语
      }
    },
    autoDetect: false
  })
  
  await i18n.init()
  
  const registry = i18n.getLanguageRegistry()
  console.log('启用的语言:', registry.getEnabledLanguages())
  console.log('可用的语言:', registry.getAvailableLanguages().map(lang => lang.code))
}

// ==================== 示例 2: 翻译内容扩展 ====================

/**
 * 示例 2.1: 基础翻译扩展
 */
async function basicTranslationExtension() {
  console.log('\n=== 示例 2.1: 基础翻译扩展 ===')
  
  const i18n = createExtensibleI18n({
    locale: 'zh-CN',
    autoDetect: false,
    globalExtensions: [
      {
        name: 'app-common',
        translations: {
          app: {
            name: 'My App',
            version: '1.0.0'
          },
          navigation: {
            home: 'Home',
            about: 'About'
          }
        }
      }
    ]
  })
  
  await i18n.init()
  
  console.log('应用名称:', i18n.t('app.name'))
  console.log('导航首页:', i18n.t('navigation.home'))
}

/**
 * 示例 2.2: 语言特定扩展
 */
async function languageSpecificExtensions() {
  console.log('\n=== 示例 2.2: 语言特定扩展 ===')
  
  const i18n = createExtensibleI18n({
    locale: 'zh-CN',
    autoDetect: false,
    languageExtensions: {
      'zh-CN': [
        {
          name: 'zh-custom',
          translations: {
            ui: {
              button: '按钮',
              input: '输入框'
            }
          }
        }
      ],
      'en': [
        {
          name: 'en-custom',
          translations: {
            ui: {
              button: 'Button',
              input: 'Input'
            }
          }
        }
      ]
    }
  })
  
  await i18n.init()
  
  console.log('中文按钮:', i18n.t('ui.button'))
  
  await i18n.changeLanguage('en')
  console.log('英文按钮:', i18n.t('ui.button'))
}

/**
 * 示例 2.3: 不同扩展策略
 */
async function extensionStrategies() {
  console.log('\n=== 示例 2.3: 不同扩展策略 ===')
  
  const i18n = createExtensibleI18n({
    locale: 'zh-CN',
    autoDetect: false,
    messages: {
      'zh-CN': {
        common: {
          hello: '你好',
          world: '世界'
        }
      }
    },
    globalExtensions: [
      {
        name: 'override-extension',
        strategy: ExtensionStrategy.OVERRIDE,
        translations: {
          common: {
            hello: '覆盖的问候语'
          }
        }
      },
      {
        name: 'merge-extension',
        strategy: ExtensionStrategy.MERGE,
        translations: {
          common: {
            goodbye: '再见'
          }
        }
      },
      {
        name: 'append-extension',
        strategy: ExtensionStrategy.APPEND,
        translations: {
          common: {
            world: '！'
          }
        }
      }
    ]
  })
  
  await i18n.init()
  
  console.log('覆盖策略:', i18n.t('common.hello'))
  console.log('合并策略:', i18n.t('common.goodbye'))
  console.log('追加策略:', i18n.t('common.world'))
}

// ==================== 示例 3: 完整配置功能 ====================

/**
 * 示例 3.1: 完整配置示例
 */
async function completeConfiguration() {
  console.log('\n=== 示例 3.1: 完整配置示例 ===')
  
  const options: ConfigurableI18nOptions = {
    // 基础配置
    locale: 'zh-CN',
    fallbackLocale: 'en',
    
    // 语言选择配置
    languageConfig: {
      enabled: ['zh-CN', 'en'],
      priority: {
        'zh-CN': 100,
        'en': 90
      }
    },
    
    // 用户自定义翻译
    messages: {
      'zh-CN': { hello: '你好' },
      'en': { hello: 'Hello' }
    },
    
    // 全局扩展
    globalExtensions: [
      {
        name: 'app-global',
        translations: {
          app: { name: 'Complete App' }
        }
      }
    ],
    
    // 语言特定扩展
    languageExtensions: {
      'zh-CN': [
        {
          name: 'zh-specific',
          translations: {
            ui: { button: '按钮' }
          }
        }
      ]
    },
    
    // 其他配置
    strictMode: true,
    autoDetect: false,
    storage: 'localStorage',
    storageKey: 'example-locale'
  }
  
  const i18n = createConfigurableI18n(options)
  await i18n.init()
  
  console.log('应用名称:', i18n.t('app.name'))
  console.log('问候语:', i18n.t('hello'))
  console.log('按钮:', i18n.t('ui.button'))
}

// ==================== 示例 4: 动态管理 ====================

/**
 * 示例 4.1: 动态语言管理
 */
async function dynamicLanguageManagement() {
  console.log('\n=== 示例 4.1: 动态语言管理 ===')
  
  const i18n = createConfigurableI18n({
    locale: 'zh-CN',
    languageConfig: {
      enabled: ['zh-CN', 'en']
    },
    autoDetect: false
  })
  
  await i18n.init()
  
  const registry = i18n.getLanguageRegistry()
  
  console.log('初始启用语言:', registry.getEnabledLanguages())
  
  // 动态启用日语
  registry.enableLanguage('ja')
  console.log('启用日语后:', registry.getEnabledLanguages())
  
  // 动态禁用英语
  registry.disableLanguage('en')
  console.log('禁用英语后:', registry.getEnabledLanguages())
  
  // 检查语言状态
  console.log('日语是否启用:', registry.isLanguageEnabled('ja'))
  console.log('英语是否启用:', registry.isLanguageEnabled('en'))
}

/**
 * 示例 4.2: 动态扩展管理
 */
async function dynamicExtensionManagement() {
  console.log('\n=== 示例 4.2: 动态扩展管理 ===')
  
  const i18n = createExtensibleI18n({
    locale: 'zh-CN',
    autoDetect: false
  })
  
  await i18n.init()
  
  const loader = i18n.getExtensionLoader()
  
  // 动态添加扩展
  loader.addTranslationExtension(
    'zh-CN',
    { dynamic: { message: '动态添加的消息' } },
    ExtensionStrategy.MERGE,
    10,
    'runtime-extension'
  )
  
  console.log('动态扩展:', i18n.t('dynamic.message'))
  
  // 覆盖翻译
  loader.overrideTranslations(
    'zh-CN',
    { dynamic: { message: '覆盖的消息' } },
    'override-extension'
  )
  
  console.log('覆盖后:', i18n.t('dynamic.message'))
  
  // 移除扩展
  loader.removeExtension('zh-CN', 'override-extension')
  console.log('移除覆盖后:', i18n.t('dynamic.message'))
  
  // 获取统计信息
  const stats = loader.getExtensionStats()
  console.log('扩展统计:', stats)
}

// ==================== 运行所有示例 ====================

/**
 * 运行所有示例
 */
async function runAllExamples() {
  try {
    await basicLanguageSelection()
    await advancedLanguageFiltering()
    await basicTranslationExtension()
    await languageSpecificExtensions()
    await extensionStrategies()
    await completeConfiguration()
    await dynamicLanguageManagement()
    await dynamicExtensionManagement()
    
    console.log('\n✅ 所有示例运行完成！')
  } catch (error) {
    console.error('❌ 示例运行失败:', error)
  }
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples()
}

export {
  basicLanguageSelection,
  advancedLanguageFiltering,
  basicTranslationExtension,
  languageSpecificExtensions,
  extensionStrategies,
  completeConfiguration,
  dynamicLanguageManagement,
  dynamicExtensionManagement,
  runAllExamples
}
