# LDesign I18n 高级功能指南

## 概述

LDesign I18n 2.0 版本新增了强大的高级功能，包括语言选择配置、翻译内容扩展和动态语言管理。这些功能让您能够更灵活地控制多语言应用的行为。

## 🎯 核心新功能

### 1. 语言选择配置

选择性启用特定语言，而不是加载所有内置语言。

#### 基础用法

```typescript
import { createSelectiveI18n } from '@ldesign/i18n'

// 只启用中文和英文
const i18n = createSelectiveI18n({
  locale: 'zh-CN',
  languageConfig: {
    enabled: ['zh-CN', 'en']
  },
  strictMode: true // 严格模式，只允许切换到启用的语言
})
```

#### 高级过滤器

```typescript
// 使用过滤器启用特定地区的语言
const i18n = createSelectiveI18n({
  locale: 'zh-CN',
  languageConfig: {
    enabled: {
      regions: ['CN', 'US', 'JP'], // 只启用中国、美国、日本的语言
      exclude: ['en-GB'] // 排除英式英语
    }
  }
})

// 使用自定义过滤函数
const i18n = createSelectiveI18n({
  locale: 'zh-CN',
  languageConfig: {
    enabled: (locale, info) => {
      // 只启用从左到右的语言
      return info?.direction === 'ltr'
    }
  }
})
```

### 2. 翻译内容扩展

动态扩展、修改或覆盖内置翻译内容。

#### 基础扩展

```typescript
import { createExtensibleI18n, ExtensionStrategy } from '@ldesign/i18n'

const i18n = createExtensibleI18n({
  locale: 'zh-CN',
  globalExtensions: [
    {
      name: 'app-common',
      translations: {
        app: {
          name: 'My App',
          version: '1.0.0'
        }
      }
    }
  ]
})
```

#### 语言特定扩展

```typescript
const i18n = createExtensibleI18n({
  locale: 'zh-CN',
  languageExtensions: {
    'zh-CN': [
      {
        name: 'zh-custom',
        translations: {
          ui: {
            customButton: '自定义按钮'
          }
        }
      }
    ],
    'en': [
      {
        name: 'en-custom',
        translations: {
          ui: {
            customButton: 'Custom Button'
          }
        }
      }
    ]
  }
})
```

#### 扩展策略

```typescript
// 覆盖策略 - 完全替换现有翻译
{
  strategy: ExtensionStrategy.OVERRIDE,
  translations: {
    common: { hello: '新的问候语' }
  }
}

// 合并策略 - 深度合并（默认）
{
  strategy: ExtensionStrategy.MERGE,
  translations: {
    common: { newKey: '新键值' }
  }
}

// 仅添加策略 - 只添加不存在的键
{
  strategy: ExtensionStrategy.ADD_ONLY,
  translations: {
    common: { hello: '不会覆盖', newKey: '会添加' }
  }
}

// 追加策略 - 将新内容追加到现有内容
{
  strategy: ExtensionStrategy.APPEND,
  translations: {
    common: { hello: ' 世界' } // 结果：'你好 世界'
  }
}
```

### 3. 完整配置功能

整合所有新功能的便捷创建函数。

```typescript
import { createConfigurableI18n } from '@ldesign/i18n'

const i18n = createConfigurableI18n({
  // 基础配置
  locale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 语言选择配置
  languageConfig: {
    enabled: ['zh-CN', 'en', 'ja'],
    priority: {
      'zh-CN': 100,
      'en': 90,
      'ja': 80
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
        app: { name: 'My App' }
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
  loadingStrategy: 'lazy',
  autoDetect: false
})
```

## 🔧 语言注册表

管理可用语言和启用状态的核心组件。

```typescript
import { LanguageRegistry, createLanguageRegistry } from '@ldesign/i18n'

// 创建语言注册表
const registry = createLanguageRegistry({
  enabled: ['zh-CN', 'en', 'ja'],
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en'
})

// 动态管理语言
registry.enableLanguage('ko')
registry.disableLanguage('ja')

// 查询语言状态
console.log(registry.getEnabledLanguages()) // ['zh-CN', 'en', 'ko']
console.log(registry.isLanguageEnabled('ja')) // false

// 获取语言信息
const info = registry.getLanguageInfo('zh-CN')
console.log(info?.nativeName) // '中文（简体）'
```

## 🚀 扩展加载器

专门处理翻译内容扩展的加载器。

```typescript
import { ExtensionLoader, createExtensionLoader } from '@ldesign/i18n'

const loader = createExtensionLoader({
  baseLoader: builtInLoader, // 基础加载器
  defaultStrategy: ExtensionStrategy.MERGE,
  maxExtensions: 50
})

// 动态添加扩展
loader.addTranslationExtension(
  'zh-CN',
  { ui: { newButton: '新按钮' } },
  ExtensionStrategy.MERGE,
  10, // 优先级
  'runtime-extension'
)

// 覆盖翻译
loader.overrideTranslations(
  'zh-CN',
  { common: { hello: '覆盖的问候语' } },
  'override-hello'
)

// 移除扩展
loader.removeExtension('zh-CN', 'runtime-extension')

// 获取统计信息
const stats = loader.getExtensionStats()
console.log(stats.totalExtensions) // 总扩展数量
```

## 📱 应用集成示例

### Vue 3 应用集成

```typescript
// app/src/i18n/language-config.ts
export const appLanguageConfig = {
  enabled: ['zh-CN', 'en', 'ja'],
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  priority: {
    'zh-CN': 100,
    'en': 90,
    'ja': 80
  }
}

export const appTranslationExtensions = {
  global: [
    {
      name: 'app-common',
      translations: {
        app: {
          name: 'My Vue App',
          version: '1.0.0'
        }
      }
    }
  ],
  languages: {
    'zh-CN': [
      {
        name: 'zh-app',
        translations: {
          navigation: {
            home: '首页',
            about: '关于'
          }
        }
      }
    ]
  }
}

// app/src/i18n/index.ts
import { createConfigurableI18n } from '@ldesign/i18n'
import { createI18nEnginePlugin } from '@ldesign/i18n/vue'
import { appLanguageConfig, appTranslationExtensions } from './language-config'

const i18n = createConfigurableI18n({
  locale: 'zh-CN',
  languageConfig: appLanguageConfig,
  globalExtensions: appTranslationExtensions.global,
  languageExtensions: appTranslationExtensions.languages,
  strictMode: true,
  autoDetect: false
})

export const i18nPlugin = createI18nEnginePlugin(i18n)
```

### 动态语言管理

```typescript
// 语言管理 API
export const languageAPI = {
  // 获取启用的语言
  getEnabledLanguages: () => registry.getEnabledLanguages(),
  
  // 启用语言
  enableLanguage: async (locale: string) => {
    const success = registry.enableLanguage(locale)
    if (success) {
      await i18n.preload(locale)
    }
    return success
  },
  
  // 禁用语言
  disableLanguage: (locale: string) => registry.disableLanguage(locale),
  
  // 获取推荐语言
  getRecommendedLanguages: () => registry.getRecommendedLanguages()
}

// 在组件中使用
const enableJapanese = async () => {
  await languageAPI.enableLanguage('ja')
  await i18n.changeLanguage('ja')
}
```

## 🎨 最佳实践

### 1. 性能优化

```typescript
// 使用懒加载策略
const i18n = createConfigurableI18n({
  locale: 'zh-CN',
  loadingStrategy: 'lazy',
  languageConfig: {
    enabled: ['zh-CN', 'en'], // 只启用需要的语言
    lazyLoad: true
  }
})

// 预加载关键语言
await i18n.preload(['zh-CN', 'en'])
```

### 2. 扩展管理

```typescript
// 按优先级组织扩展
const extensions = [
  {
    name: 'base-extensions',
    priority: 1,
    translations: { /* 基础扩展 */ }
  },
  {
    name: 'feature-extensions',
    priority: 5,
    translations: { /* 功能扩展 */ }
  },
  {
    name: 'override-extensions',
    priority: 10,
    translations: { /* 覆盖扩展 */ }
  }
]
```

### 3. 错误处理

```typescript
const i18n = createConfigurableI18n({
  locale: 'zh-CN',
  strictMode: true,
  onLoadError: (error) => {
    console.error('Language load failed:', error)
    // 降级到默认语言
  },
  onLanguageChanged: (locale) => {
    console.log('Language changed to:', locale)
  }
})
```

## 🔍 调试和监控

```typescript
// 获取语言注册表状态
const registry = i18n.getLanguageRegistry()
console.log('Enabled languages:', registry.getEnabledLanguages())
console.log('Available languages:', registry.getAvailableLanguages())

// 获取扩展统计
const loader = i18n.getExtensionLoader()
const stats = loader.getExtensionStats()
console.log('Extension stats:', stats)

// 检查翻译键是否存在
console.log('Key exists:', i18n.exists('common.hello'))
console.log('All keys:', i18n.getKeys())
```

## 📚 更多资源

- [API 文档](./api/README.md)
- [Vue 集成指南](./vue/README.md)
- [示例项目](./examples/README.md)
- [迁移指南](./migration.md)
