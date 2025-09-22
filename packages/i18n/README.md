# @ldesign/i18n

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n.svg)](https://badge.fury.io/js/@ldesign%2Fi18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

企业级国际化解决方案 - 功能强大、类型安全、高性能的多语言库，支持 Vue 3 深度集成。

## ✨ 特性

- 🚀 **高性能** - 智能缓存机制、异步加载、内存优化
- 🔒 **类型安全** - 完整的 TypeScript 支持，编译时类型检查
- 🎯 **框架无关** - 核心库独立于任何框架，同时提供 Vue 3 深度集成
- 🔄 **异步加载** - 支持动态加载语言包，减少初始包体积
- 🧠 **智能缓存** - 多层缓存策略，内存管理，TTL 支持
- 🌐 **语言检测** - 自动检测用户语言偏好
- 📦 **多种格式** - 支持 ESM、CJS、UMD 多种模块格式
- 🛠️ **丰富工具** - 插值、复数化、格式化、验证等完整工具链
- ⚡ **Vue 集成** - 类似 vue-i18n 的 API，组合式 API、组件、指令全面支持
- 🎛️ **语言选择** - 灵活配置启用的语言，支持过滤器和严格模式
- 🔄 **内容扩展** - 动态扩展和修改翻译内容，支持多种扩展策略
- 📋 **动态管理** - 运行时语言管理和配置，支持优先级和推荐机制

### 🆕 增强功能 (参考 vue-i18n)

- 🔍 **智能键名提示** - 键名不存在时自动显示建议和错误信息，开发模式下提供详细调试信息
- 🏷️ **作用域翻译** - 支持命名空间前缀，简化键名管理，支持嵌套作用域和全局降级
- 🔢 **复数化支持** - 完整的复数形式处理，支持多种语言规则和管道分隔语法
- ⏰ **格式化组件** - 相对时间、列表格式化等实用组件，支持自定义格式和本地化
- 🛠️ **开发工具** - Vue DevTools 集成，翻译追踪和性能监控，缺失翻译自动收集
- ⚡ **性能优化** - 缓存、批量翻译、预加载等性能优化功能，响应式优化

## 📦 安装

```bash
# npm
npm install @ldesign/i18n

# yarn
yarn add @ldesign/i18n

# pnpm
pnpm add @ldesign/i18n
```

## 🚀 快速开始

### 基础用法

```typescript
import { I18n } from '@ldesign/i18n'

// 创建 I18n 实例
const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！'
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!'
    }
  }
})

// 初始化
await i18n.init()

// 翻译
console.log(i18n.t('hello')) // "你好"
console.log(i18n.t('welcome', { name: '张三' })) // "欢迎 张三！"

// 切换语言
await i18n.changeLanguage('en')
console.log(i18n.t('hello')) // "Hello"
```

### Vue 3 集成

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
}))

app.mount('#app')
```

```vue
<template>
  <div>
    <!-- 组合式 API -->
    <h1>{{ t('hello') }}</h1>
    
    <!-- 组件 -->
    <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
    
    <!-- 指令 -->
    <button v-t="'hello'"></button>
    
    <!-- 语言切换 -->
    <select @change="setLocale($event.target.value)">
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t, locale, setLocale } = useI18n()
</script>
```

#### 🔍 增强功能示例

```vue
<template>
  <div>
    <!-- 智能键名提示 - 开发模式下显示详细错误信息 -->
    <TranslationMissing
      keypath="missing.key"
      :suggestions="['correct.key']"
      show-similar-keys
    />

    <!-- 作用域翻译 -->
    <h1>{{ userScope.t('profile.title') }}</h1>
    <p>{{ profileScope.t('settings.description') }}</p>

    <!-- 复数化支持 -->
    <I18nP keypath="item" :count="itemCount" />
    <p v-t-plural="{ key: 'message', count: 5 }"></p>

    <!-- 格式化组件 -->
    <I18nR :value="pastDate" format="short" />
    <I18nL :items="['Apple', 'Banana', 'Orange']" type="conjunction" />

    <!-- 增强的翻译组件 -->
    <I18nT keypath="rich.content" html />
    <I18nT
      keypath="message.with.component"
      :components="{ Button }"
      enable-component-interpolation
    />
  </div>
</template>

<script setup>
import {
  useI18n,
  useI18nEnhanced,
  useI18nScope,
  TranslationMissing,
  I18nP, I18nR, I18nL, I18nT
} from '@ldesign/i18n/vue'
import { ref } from 'vue'

const { t, locale, setLocale } = useI18n()
const { tSafe, tBatch } = useI18nEnhanced()

// 作用域翻译
const userScope = useI18nScope({ namespace: 'user' })
const profileScope = userScope.createSubScope('profile')

const itemCount = ref(5)
const pastDate = ref(new Date(Date.now() - 60000))

// 安全翻译
const safeTranslation = tSafe('maybe.missing.key', {
  fallback: '默认文本',
  showMissingWarning: true
})
</script>
```

### 🆕 高级功能（v2.0+）

#### 语言选择配置

```typescript
import { createSelectiveI18n } from '@ldesign/i18n'

// 只启用特定语言
const i18n = createSelectiveI18n({
  locale: 'zh-CN',
  languageConfig: {
    enabled: ['zh-CN', 'en', 'ja'], // 只启用这些语言
    priority: {
      'zh-CN': 100,
      'en': 90,
      'ja': 80
    }
  },
  strictMode: true // 严格模式，只允许切换到启用的语言
})
```

#### 翻译内容扩展

```typescript
import { createExtensibleI18n, ExtensionStrategy } from '@ldesign/i18n'

// 扩展内置翻译
const i18n = createExtensibleI18n({
  locale: 'zh-CN',
  globalExtensions: [
    {
      name: 'app-common',
      translations: {
        app: { name: 'My App', version: '1.0.0' }
      }
    }
  ],
  languageExtensions: {
    'zh-CN': [
      {
        name: 'zh-custom',
        strategy: ExtensionStrategy.MERGE,
        translations: {
          ui: { customButton: '自定义按钮' }
        }
      }
    ]
  }
})
```

#### 完整配置功能

```typescript
import { createConfigurableI18n } from '@ldesign/i18n'

// 整合所有新功能
const i18n = createConfigurableI18n({
  locale: 'zh-CN',
  languageConfig: {
    enabled: ['zh-CN', 'en'],
    priority: { 'zh-CN': 100, 'en': 90 }
  },
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  },
  globalExtensions: [
    { name: 'app', translations: { app: { name: 'My App' } } }
  ],
  strictMode: true,
  autoDetect: false
})
```

## 📚 文档

- [快速开始](./docs/guide/getting-started.md)
- [配置选项](./docs/guide/configuration.md)
- [Vue 集成](./docs/vue/installation.md)
- [API 参考](./docs/api/core.md)
- [🆕 高级功能指南](./docs/advanced-features.md) - 语言选择配置、翻译内容扩展、动态管理
- [示例](./docs/examples/vue.md)

## 🎯 核心功能

### 智能缓存

```typescript
const i18n = new I18n({
  defaultLocale: 'zh-CN',
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 60 * 60 * 1000, // 1小时
    enableTTL: true
  }
})
```

### 异步加载

```typescript
import { HttpLoader } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  loader: new HttpLoader('/locales') // 从 /locales/zh-CN.json 加载
})
```

### 语言检测

```typescript
import { createDetector } from '@ldesign/i18n'

const detector = createDetector('browser')
const detectedLanguages = detector.detect() // ['zh-CN', 'zh', 'en-US', 'en']
```

### 复数化支持

```typescript
const messages = {
  'en': {
    item: 'item | items'
  }
}

console.log(i18n.t('item', { count: 1 })) // "item"
console.log(i18n.t('item', { count: 2 })) // "items"
```

### 格式化支持

```vue
<template>
  <!-- 数字格式化 -->
  <I18nN :value="1234.56" format="currency" currency="USD" />
  
  <!-- 日期格式化 -->
  <I18nD :value="new Date()" format="long" />
</template>
```

## 🔧 高级配置

### 完整配置示例

```typescript
import { I18n, HttpLoader, createDetector, createStorage } from '@ldesign/i18n'

const i18n = new I18n({
  // 基础配置
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 加载器配置
  loader: new HttpLoader('/api/locales'),
  
  // 存储配置
  storage: createStorage('localStorage', 'app-locale'),
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    maxMemory: 50 * 1024 * 1024, // 50MB
    defaultTTL: 60 * 60 * 1000,
    enableTTL: true,
    cleanupInterval: 5 * 60 * 1000,
    memoryPressureThreshold: 0.8
  },
  
  // 自动检测
  autoDetect: true,
  
  // 预加载
  preload: ['zh-CN', 'en'],
  
  // 回调函数
  onLanguageChanged: (locale) => {
    document.documentElement.lang = locale
  },
  
  onLoadError: (error) => {
    console.error('Language pack load failed:', error)
  }
})
```

## 🆚 对比其他方案

| 特性 | @ldesign/i18n | vue-i18n | react-i18next | i18next |
|------|---------------|-----------|---------------|---------|
| TypeScript 支持 | ✅ 完整 | ✅ 良好 | ✅ 良好 | ✅ 基础 |
| 框架无关 | ✅ 是 | ❌ Vue 专用 | ❌ React 专用 | ✅ 是 |
| Vue 3 集成 | ✅ 深度集成 | ✅ 原生 | ❌ 无 | ⚠️ 需配置 |
| 异步加载 | ✅ 内置 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 智能缓存 | ✅ 多层缓存 | ⚠️ 基础 | ⚠️ 基础 | ⚠️ 基础 |
| 性能监控 | ✅ 内置 | ❌ 无 | ❌ 无 | ❌ 无 |
| 包体积 | 🎯 优化 | 📦 中等 | 📦 较大 | 📦 较大 |

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- core.test.ts

# 测试覆盖率
npm run test:coverage
```

## 🔨 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/i18n.git

# 安装依赖
cd i18n
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

## 📄 许可证

[MIT](./LICENSE) © 2024 LDesign Team

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

## 📞 支持

- [GitHub Issues](https://github.com/ldesign/i18n/issues)
- [讨论区](https://github.com/ldesign/i18n/discussions)
- [文档站点](https://ldesign.github.io/i18n/)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign">LDesign Team</a></sub>
</div>
