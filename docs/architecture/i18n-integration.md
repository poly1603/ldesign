# LDesign 多语言集成架构

## 概览

LDesign 生态系统提供了统一的多语言支持架构，确保所有包都能无缝集成国际化功能。

## 核心包

### @ldesign/i18n

核心国际化解决方案，提供：
- 框架无关的 i18n 引擎
- Vue 3 适配器
- Engine 插件集成
- 高性能缓存和懒加载
- 插值、复数、格式化等完整功能

### @ldesign/engine

应用引擎，提供：
- LocaleManager - 统一的语言管理中心
- createLocaleAwarePlugin - 插件语言同步包装器
- 语言状态管理和事件系统

## 架构设计

### 三层架构

```
┌─────────────────────────────────────────┐
│        应用层 (Application)              │
│  - 设置初始语言                          │
│  - 切换语言                              │
│  - 监听语言变化                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     引擎层 (@ldesign/engine)             │
│  - LocaleManager (deprecated)           │
│  - createLocaleAwarePlugin              │
│  - 语言状态同步                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    国际化层 (@ldesign/i18n)              │
│  - 核心 i18n 引擎                        │
│  - 消息加载和缓存                        │
│  - 格式化和插值                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   功能包 (color, size, etc.)             │
│  - 使用 createLocaleAwarePlugin 包装    │
│  - 接收 locale 参数                      │
│  - 自动同步语言                          │
└─────────────────────────────────────────┘
```

## 新架构（推荐）

### 单一数据源模式

使用 i18n 插件的 `localeRef` 作为唯一的语言状态源：

```typescript
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createSizeEnginePlugin } from '@ldesign/size'
import { createColorEnginePlugin } from '@ldesign/color'

// 1. 创建 i18n 插件（提供 localeRef）
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  messages: { ... }
})

// 2. 其他插件接收 localeRef
const sizePlugin = createSizeEnginePlugin({
  locale: i18nPlugin.localeRef  // 共享同一个 ref
})

const colorPlugin = createColorEnginePlugin({
  locale: i18nPlugin.localeRef  // 共享同一个 ref
})

// 3. 在应用中使用
const engine = await createEngineApp({
  plugins: [i18nPlugin, sizePlugin, colorPlugin]
})

// 4. 切换语言（自动同步到所有插件）
await i18nPlugin.api.changeLocale('en-US')
```

### 旧架构（向后兼容）

使用 LocaleManager 集中管理（已 deprecated）：

```typescript
import { createLocaleManager } from '@ldesign/engine'

const engine = await createEngineApp({
  plugins: [...]
})

// 使用 LocaleManager
const localeManager = createLocaleManager(engine, {
  initialLocale: 'zh-CN'
})

// 注册插件
localeManager.register('size', sizePlugin)
localeManager.register('color', colorPlugin)

// 切换语言（自动同步）
await localeManager.setLocale('en-US')
```

## 各包的多语言实现

### 包含完整翻译的包

这些包使用 @ldesign/i18n 管理完整的翻译内容：

- **@ldesign/i18n** - 核心国际化包
- **@ldesign/engine** - 引擎核心消息

### 包含内置 Locale 的包

这些包有少量 UI 文本，使用内置的轻量级 locale：

- **@ldesign/size** - 尺寸选择器的 UI 文本
  - 保留内置 locales 作为默认值
  - 可选集成 @ldesign/i18n
  
- **@ldesign/color** - 颜色选择器的 UI 文本（未来）

### 无需翻译的包

这些包不包含用户可见文本：

- **@ldesign/shared** - 工具函数
- **@ldesign/builder** - 构建工具

## 最佳实践

### 1. 新项目

```typescript
// main.ts
import { createEngineApp } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createSizeEnginePlugin } from '@ldesign/size'

const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en-US': () => import('./locales/en-US.json')
  }
})

const engine = await createEngineApp({
  plugins: [
    i18nPlugin,
    createSizeEnginePlugin({
      locale: i18nPlugin.localeRef  // 共享语言状态
    })
  ]
})

// 切换语言
await i18nPlugin.api.changeLocale('en-US')
```

### 2. 创建支持多语言的插件

```typescript
import { createLocaleAwarePlugin } from '@ldesign/engine'

// 1. 创建原始插件
const myPlugin = {
  setLocale(locale: string) {
    // 实现语言切换逻辑
  },
  // 其他方法...
}

// 2. 包装成 Engine 插件（自动同步语言）
export const createMyEnginePlugin = (options) => {
  const plugin = createMyPlugin(options)
  
  return createLocaleAwarePlugin(plugin, {
    name: 'my-plugin',
    syncLocale: true  // 自动同步语言
  })
}
```

### 3. 在组件中使用

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n'

const { t, locale, setLocale } = useI18n()

// 使用翻译
const title = t('app.title')

// 切换语言
const changeLanguage = () => {
  setLocale('en-US')
}
</script>
```

## 迁移指南

### 从 LocaleManager 迁移到新架构

**旧代码：**
```typescript
const engine = await createEngineApp({ ... })

const localeManager = createLocaleManager(engine)
localeManager.register('size', sizePlugin)
await localeManager.setLocale('en-US')
```

**新代码：**
```typescript
const i18nPlugin = createI18nEnginePlugin({ locale: 'zh-CN' })

const engine = await createEngineApp({
  plugins: [
    i18nPlugin,
    createSizeEnginePlugin({
      locale: i18nPlugin.localeRef
    })
  ]
})

await i18nPlugin.api.changeLocale('en-US')
```

## 性能优化

### 1. 懒加载消息

```typescript
const i18nPlugin = createI18nEnginePlugin({
  messages: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en-US': () => import('./locales/en-US.json')
  }
})
```

### 2. 预加载常用语言

```typescript
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  preload: ['zh-CN', 'en-US']  // 预加载常用语言
})
```

### 3. 缓存优化

```typescript
const i18nPlugin = createI18nEnginePlugin({
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 3600000  // 1 hour
  }
})
```

## 常见问题

### Q: 我应该使用哪种方式管理多语言？

A: 对于新项目，推荐使用新架构（i18n插件的 localeRef）。旧项目可以继续使用 LocaleManager，但建议逐步迁移。

### Q: Size/Color 包为什么有自己的 locales？

A: 这些包的 UI 文本很少（通常只有几个按钮标签），使用内置的轻量级 locale 可以：
- 减少依赖
- 提高性能
- 保持包的独立性

如果需要完整的国际化功能，可以选择集成 @ldesign/i18n。

### Q: 如何添加新语言？

A: 
1. 在 @ldesign/i18n 中添加消息文件
2. 在各功能包的内置 locales 中添加对应翻译
3. 更新类型定义

### Q: 语言切换后如何通知所有组件？

A: 使用响应式 ref，所有组件会自动更新。或者监听 engine 的 `i18n:locale-changed` 事件。

## 参考资料

- [@ldesign/i18n 文档](../../packages/i18n/README.md)
- [@ldesign/engine Locale 模块](../../packages/engine/src/locale/README.md)
- [多语言最佳实践](./best-practices/i18n.md)
