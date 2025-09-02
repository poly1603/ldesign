# Vue 3 集成 - 安装配置

@ldesign/i18n 为 Vue 3 提供了深度集成支持，提供类似 vue-i18n 的 API 和开发体验。

## 安装

确保您已经安装了 Vue 3 和 @ldesign/i18n：

::: code-group

```bash [npm]
npm install vue@^3.0.0 @ldesign/i18n
```

```bash [yarn]
yarn add vue@^3.0.0 @ldesign/i18n
```

```bash [pnpm]
pnpm add vue@^3.0.0 @ldesign/i18n
```

:::

## 基础配置

### 方式一：使用插件（推荐）

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

// 安装 I18n 插件
app.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！',
      nav: {
        home: '首页',
        about: '关于我们'
      }
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      nav: {
        home: 'Home',
        about: 'About Us'
      }
    }
  }
}))

app.mount('#app')
```

### 方式二：完整安装

如果您需要同时注册所有组件和指令：

```typescript
// main.ts
import { createApp } from 'vue'
import { installI18n } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

// 安装所有 I18n 功能
installI18n(app, {
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    // ... 语言包
  }
})

app.mount('#app')
```

## 配置选项

### CreateI18nOptions

```typescript
interface CreateI18nOptions {
  /** 默认语言 */
  locale: string
  
  /** 降级语言 */
  fallbackLocale?: string
  
  /** 语言包 */
  messages?: Record<string, Record<string, unknown>>
  
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | 'none'
  
  /** 存储键名 */
  storageKey?: string
  
  /** 是否自动检测语言 */
  autoDetect?: boolean
  
  /** 预加载的语言列表 */
  preload?: string[]
  
  /** 缓存配置 */
  cache?: {
    enabled: boolean
    maxSize: number
    maxMemory: number
    defaultTTL: number
    enableTTL: boolean
    cleanupInterval: number
    memoryPressureThreshold: number
  }
  
  /** 语言变化回调 */
  onLanguageChanged?: (locale: string) => void
  
  /** 加载错误回调 */
  onLoadError?: (error: Error) => void
}
```

## 高级配置

### 异步加载配置

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

app.use(createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 异步加载配置
  preload: ['zh-CN', 'en'], // 预加载语言
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 60 * 60 * 1000, // 1小时
    enableTTL: true
  },
  
  // 存储配置
  storage: 'localStorage',
  storageKey: 'app-locale',
  
  // 自动检测用户语言
  autoDetect: true,
  
  // 回调函数
  onLanguageChanged: (locale) => {
    console.log('语言已切换到:', locale)
    document.documentElement.lang = locale
  },
  
  onLoadError: (error) => {
    console.error('语言包加载失败:', error)
  }
}))

app.mount('#app')
```

### 多实例配置

如果您需要在同一个应用中使用多个 I18n 实例：

```typescript
// main.ts
import { createApp } from 'vue'
import { createVueI18n } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

// 创建主实例
const mainI18n = createVueI18n({
  locale: 'zh-CN',
  messages: {
    // 主应用语言包
  }
})

// 创建模块实例
const moduleI18n = createVueI18n({
  locale: 'zh-CN',
  messages: {
    // 模块语言包
  }
})

// 手动提供实例
app.provide('mainI18n', mainI18n)
app.provide('moduleI18n', moduleI18n)

app.mount('#app')
```

## TypeScript 支持

### 类型定义

```typescript
// types/i18n.d.ts
declare module '@ldesign/i18n/vue' {
  interface VueI18n {
    // 扩展 VueI18n 接口
  }
}

// 全局属性类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $i18n: VueI18n
    $t: (key: string, params?: Record<string, unknown>) => string
    $te: (key: string, locale?: string) => boolean
  }
}
```

### 强类型语言包

```typescript
// types/messages.ts
interface Messages {
  hello: string
  welcome: string
  nav: {
    home: string
    about: string
  }
}

// 使用强类型
const messages: Record<string, Messages> = {
  'zh-CN': {
    hello: '你好',
    welcome: '欢迎 {name}！',
    nav: {
      home: '首页',
      about: '关于我们'
    }
  },
  'en': {
    hello: 'Hello',
    welcome: 'Welcome {name}!',
    nav: {
      home: 'Home',
      about: 'About Us'
    }
  }
}
```

## 环境变量配置

您可以通过环境变量来配置 I18n：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __I18N_DEFAULT_LOCALE__: JSON.stringify(process.env.I18N_DEFAULT_LOCALE || 'zh-CN'),
    __I18N_FALLBACK_LOCALE__: JSON.stringify(process.env.I18N_FALLBACK_LOCALE || 'en'),
    __I18N_DEBUG__: process.env.NODE_ENV === 'development'
  }
})
```

```typescript
// main.ts
app.use(createI18nPlugin({
  locale: __I18N_DEFAULT_LOCALE__,
  fallbackLocale: __I18N_FALLBACK_LOCALE__,
  debug: __I18N_DEBUG__,
  // ...
}))
```

## 下一步

现在您已经完成了基础配置，可以继续学习：

- [组合式 API](/vue/composition-api) - 学习如何在组件中使用 I18n
- [组件](/vue/components) - 了解声明式 I18n 组件
- [指令](/vue/directives) - 使用 I18n 指令
- [最佳实践](/vue/best-practices) - Vue 项目中的 I18n 最佳实践
