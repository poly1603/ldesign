# @ldesign/i18n

🌍 一个现代化、高性能的国际化解决方案，专为 LDesign 生态系统设计。经过全面优化，提供企业级的性能和可
靠性。

## ✨ 特性

### 🚀 性能优化

- **智能缓存系统**：基于 LRU 算法的多层缓存，支持缓存预热和统计分析
- **懒加载机制**：按需加载语言包，减少初始加载时间
- **批量操作优化**：支持批量翻译和并行处理，提升大量翻译场景的性能
- **内存管理**：自动内存清理和对象池优化，防止内存泄漏
- **性能监控**：实时性能指标收集、分析和优化建议

### 🛡️ 可靠性保障

- **错误处理系统**：统一的错误管理、分类和优雅降级
- **类型安全**：完整的 TypeScript 支持，编译时错误检查
- **测试覆盖**：全面的单元测试、性能测试和 E2E 测试
- **管理器架构**：模块化设计，支持依赖注入和生命周期管理

### 🔧 开发体验

- **Vue 3 深度集成**：完整的 Vue 3 插件和组合式 API
- **Engine 集成**：与 @ldesign/engine 深度集成，支持插件化架构
- **开发工具**：性能分析、错误统计、调试支持和热重载
- **零依赖**：轻量级设计，无外部依赖

### 🌐 国际化功能

- **多语言支持**：支持任意数量的语言和地区
- **智能检测**：自动检测浏览器语言偏好
- **复数规则**：智能复数处理和格式化
- **插值和格式化**：灵活的参数插值和字符串处理
- **回退机制**：多级语言回退策略
- **嵌套键支持**：点分隔的嵌套翻译键
- **持久化存储**：支持多种存储方式

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/i18n

# 使用 npm
npm install @ldesign/i18n

# 使用 yarn
yarn add @ldesign/i18n
```

## 🚀 快速开始

### 基础用法

```typescript
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

// 创建 I18n 实例
const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  autoDetect: true,
})

// 基础翻译
console.log(i18n.t('common.ok')) // "OK"

// 插值翻译
console.log(i18n.t('common.pageOf', { current: 1, total: 10 }))
// "Page 1 of 10"

// 批量翻译（性能优化）
const batchResult = i18n.batchTranslate(['common.ok', 'common.cancel'])
console.log(batchResult.translations) // { 'common.ok': 'OK', 'common.cancel': 'Cancel' }
console.log(batchResult.successCount) // 2

// 切换语言
await i18n.changeLanguage('zh-CN')
console.log(i18n.t('common.ok')) // "确定"
```

### 性能监控

```typescript
// 获取性能指标
const metrics = i18n.getPerformanceMetrics()
console.log(metrics.translationCalls) // 翻译调用次数
console.log(metrics.averageTranslationTime) // 平均翻译时间
console.log(metrics.cacheHitRate) // 缓存命中率

// 生成性能报告
const report = i18n.generatePerformanceReport()
console.log(report)

// 获取优化建议
const suggestions = i18n.getOptimizationSuggestions()
console.log(suggestions)

// 预热缓存（提升性能）
i18n.warmUpCache(['common.ok', 'common.cancel', 'common.save'])
```

### 错误处理

```typescript
import { globalErrorManager, I18nError } from '@ldesign/i18n'

// 自定义错误处理器
globalErrorManager.addHandler({
  canHandle: error => error instanceof I18nError,
  handle: error => {
    console.error('I18n Error:', error.getDetails())
    // 发送到错误监控服务
  },
})

// 获取错误统计
const errorStats = i18n.getErrorStats()
console.log(errorStats)
```

### Vue 3 集成

```typescript
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

async function bootstrap() {
  // 创建 I18n 实例
  const i18nInstance = await createI18nWithBuiltinLocales({
    defaultLocale: 'en',
    fallbackLocale: 'en',
  })

  // 创建 Vue 插件
  const vueI18nPlugin = createI18n(i18nInstance)

  // 创建应用并安装插件
  const app = createApp(App)
  app.use(vueI18nPlugin)
  app.mount('#app')
}

bootstrap()
```

```vue
<!-- App.vue -->
<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t, availableLanguages, changeLanguage } = useI18n()
</script>

<template>
  <div>
    <!-- 使用组合式 API -->
    <h1>{{ t('common.welcome') }}</h1>

    <!-- 使用指令 -->
    <button v-t="'common.save'" />

    <!-- 语言切换 -->
    <select @change="changeLanguage($event.target.value)">
      <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
        {{ lang.nativeName }}
      </option>
    </select>
  </div>
</template>
```

### Engine 集成

```typescript
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'

// 创建 Engine 实例
const engine = createEngine()

// 创建 I18n 插件
const i18nPlugin = createI18nEnginePlugin({
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  preloadLanguages: ['en', 'zh-CN'],
})

// 安装插件
await engine.use(i18nPlugin)

// 监听 I18n 事件
engine.events.on('i18n:languageChanged', ({ locale }) => {
  console.log('Language changed to:', locale)
})

engine.events.on('i18n:performanceReport', ({ metrics }) => {
  console.log('Performance metrics:', metrics)
})
```

## 📚 API 文档

### 核心 API

#### I18n 类

```typescript
class I18n {
  constructor(options?: I18nOptions)

  // 初始化
  async init(): Promise<void>

  // 翻译
  t<T = string>(key: string, params?: TranslationParams, options?: TranslationOptions): T

  // 批量翻译
  batchTranslate(keys: string[], params?: TranslationParams): BatchTranslationResult

  // 语言管理
  async changeLanguage(locale: string): Promise<void>
  getCurrentLanguage(): string
  getAvailableLanguages(): LanguageInfo[]

  // 预加载
  async preloadLanguage(locale: string): Promise<void>
  async batchPreloadLanguages(locales: string[]): Promise<void>
  isLanguageLoaded(locale: string): boolean

  // 性能监控
  getPerformanceMetrics(): PerformanceMetrics
  generatePerformanceReport(): string
  getOptimizationSuggestions(): string[]
  warmUpCache(keys: string[]): void
  cleanupCache(): void

  // 错误处理
  getErrorStats(): Record<string, number>
  resetErrorStats(): void

  // 工具方法
  exists(key: string, locale?: string): boolean
  getKeys(locale?: string): string[]
  getSuggestions(partialKey: string, limit?: number): string[]
  hasInterpolation(key: string): boolean
  hasPlural(key: string): boolean

  // 工具方法
  exists(key: string, locale?: string): boolean
  getKeys(locale?: string): string[]

  // 事件
  on(event: I18nEventType, listener: I18nEventListener): void
  off(event: I18nEventType, listener: I18nEventListener): void
}
```

#### 配置选项

```typescript
interface I18nOptions {
  defaultLocale: string // 默认语言
  fallbackLocale?: string // 降级语言
  storage?: 'localStorage' | 'sessionStorage' | 'none' // 存储方式
  storageKey?: string // 存储键名
  autoDetect?: boolean // 自动检测浏览器语言
  preload?: string[] // 预加载的语言列表
  cache?: {
    // 缓存配置
    enabled: boolean
    maxSize: number
  }
  onLanguageChanged?: (locale: string) => void // 语言切换回调
  onLoadError?: (locale: string, error: Error) => void // 加载错误回调
}
```

### Vue 3 API

#### 组合式 API

```typescript
// 主要的 I18n 钩子
function useI18n(): UseI18nReturn

// 语言切换钩子
function useLanguageSwitcher(): {
  locale: Ref<string>
  availableLanguages: ComputedRef<LanguageInfo[]>
  isChanging: Ref<boolean>
  switchLanguage: (locale: string) => Promise<void>
}

// 批量翻译钩子
function useBatchTranslation(keys: string[]): ComputedRef<Record<string, string>>

// 条件翻译钩子
function useConditionalTranslation(
  condition: (() => boolean) | Ref<boolean>,
  trueKey: string,
  falseKey: string
): ComputedRef<string>
```

#### 插件选项

```typescript
interface VueI18nOptions extends I18nOptions {
  globalInjection?: boolean // 是否注入全局属性
  globalPropertyName?: string // 全局属性名称
}
```

#### 指令

```vue
<!-- 基础用法 -->
<div v-t="'common.save'"></div>

<!-- 带参数 -->
<div v-t="{ key: 'common.welcome', params: { name: 'John' } }"></div>

<!-- 输入框占位符 -->
<input v-t="'common.searchPlaceholder'" />
```

## 🌍 内置语言包

库内置了三种语言的完整翻译：

- **English (en)** - 英语
- **中文简体 (zh-CN)** - 简体中文
- **日本語 (ja)** - 日语

每种语言包含以下模块：

- `common` - 通用文本（按钮、状态、导航等）
- `validation` - 表单验证信息
- `menu` - 菜单相关文本
- `date` - 日期时间格式

## 🔧 高级用法

### 自定义加载器

```typescript
import { HttpLoader } from '@ldesign/i18n'

const httpLoader = new HttpLoader('https://api.example.com/locales')
const i18n = new I18n()
i18n.setLoader(httpLoader)
```

### 自定义存储

```typescript
import { CookieStorage } from '@ldesign/i18n'

const cookieStorage = new CookieStorage('my-locale', {
  expires: 30, // 30天
  path: '/',
  secure: true,
})

const i18n = new I18n()
i18n.setStorage(cookieStorage)
```

### 复数处理

```typescript
// 支持 ICU 复数语法
i18n.t('items', {
  count: 0,
}) // "no items"

i18n.t('items', {
  count: 1,
}) // "1 item"

i18n.t('items', {
  count: 5,
}) // "5 items"
```

### 插值和转义

```typescript
// HTML 转义（默认开启）
i18n.t('message', {
  content: '<script>alert("xss")</script>',
})

// 禁用转义
i18n.t(
  'message',
  {
    content: '<strong>Bold</strong>',
  },
  {
    escapeValue: false,
  }
)
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm coverage

# 运行测试 UI
pnpm test:ui
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [示例代码](./examples/)
2. 提交 [Issue](https://github.com/ldesign/i18n/issues)
3. 查看 [API 文档](#-api-文档)
