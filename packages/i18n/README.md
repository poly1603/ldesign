# @ldesign/i18n

一个功能完整的框架无关多语言管理系统，提供 Vue 3 集成支持。

## ✨ 特性

- 🌍 **框架无关**：可在任何 JavaScript 环境中使用
- 🎯 **Vue 3 集成**：提供完整的 Vue 3 插件和组合式 API
- 🔒 **TypeScript 支持**：完整的类型定义和类型安全
- ⚡ **高性能缓存**：内置 LRU 缓存机制
- 🔄 **动态加载**：支持语言包的懒加载和预加载
- 🌐 **自动检测**：智能检测浏览器语言偏好
- 💾 **持久化存储**：支持多种存储方式
- 🔤 **插值支持**：强大的字符串插值功能
- 📊 **复数处理**：支持多语言复数规则
- 🎨 **嵌套键**：支持点分隔的嵌套翻译键

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
  autoDetect: true
})

// 基础翻译
console.log(i18n.t('common.ok')) // "OK"

// 插值翻译
console.log(i18n.t('common.pageOf', { current: 1, total: 10 }))
// "Page 1 of 10"

// 切换语言
await i18n.changeLanguage('zh-CN')
console.log(i18n.t('common.ok')) // "确定"
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
    fallbackLocale: 'en'
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
      <option
        v-for="lang in availableLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.nativeName }}
      </option>
    </select>
  </div>
</template>
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
  isLanguageLoaded(locale: string): boolean

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
  cache?: { // 缓存配置
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
  secure: true
})

const i18n = new I18n()
i18n.setStorage(cookieStorage)
```

### 复数处理

```typescript
// 支持 ICU 复数语法
i18n.t('items', {
  count: 0
}) // "no items"

i18n.t('items', {
  count: 1
}) // "1 item"

i18n.t('items', {
  count: 5
}) // "5 items"
```

### 插值和转义

```typescript
// HTML 转义（默认开启）
i18n.t('message', {
  content: '<script>alert("xss")</script>'
})

// 禁用转义
i18n.t('message', {
  content: '<strong>Bold</strong>'
}, {
  escapeValue: false
})
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
