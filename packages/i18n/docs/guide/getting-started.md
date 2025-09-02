# 快速开始

本指南将帮助您在几分钟内开始使用 @ldesign/i18n。

## 安装

::: code-group

```bash [npm]
npm install @ldesign/i18n
```

```bash [yarn]
yarn add @ldesign/i18n
```

```bash [pnpm]
pnpm add @ldesign/i18n
```

:::

## 基础用法

### 1. 创建 I18n 实例

```typescript
import { I18n } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！',
      user: {
        profile: '用户资料',
        settings: '设置'
      }
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      user: {
        profile: 'User Profile',
        settings: 'Settings'
      }
    }
  }
})

// 初始化
await i18n.init()
```

### 2. 基础翻译

```typescript
// 简单翻译
console.log(i18n.t('hello')) // "你好"

// 带参数的翻译
console.log(i18n.t('welcome', { name: '张三' })) // "欢迎 张三！"

// 嵌套键翻译
console.log(i18n.t('user.profile')) // "用户资料"
```

### 3. 语言切换

```typescript
// 切换到英文
await i18n.changeLanguage('en')
console.log(i18n.t('hello')) // "Hello"

// 获取当前语言
console.log(i18n.getCurrentLanguage()) // "en"

// 检查键是否存在
console.log(i18n.exists('hello')) // true
console.log(i18n.exists('nonexistent')) // false
```

## Vue 3 集成

如果您使用 Vue 3，可以使用我们提供的深度集成支持：

### 1. 安装插件

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
      welcome: '欢迎 {name}！'
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!'
    }
  }
}))

app.mount('#app')
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 使用组合式 API -->
    <h1>{{ t('hello') }}</h1>
    <p>{{ t('welcome', { name: 'Vue' }) }}</p>
    
    <!-- 使用组件 -->
    <I18nT keypath="hello" />
    <I18nT keypath="welcome" :params="{ name: 'Vue' }" />
    
    <!-- 使用指令 -->
    <button v-t="'hello'"></button>
    
    <!-- 语言切换器 -->
    <select :value="locale" @change="setLocale($event.target.value)">
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

## 高级功能预览

### 异步加载

```typescript
import { I18n, HttpLoader } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  loader: new HttpLoader('/locales') // 从 /locales/zh-CN.json 加载
})

await i18n.init()
```

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

### 语言检测

```typescript
import { createDetector } from '@ldesign/i18n'

const detector = createDetector('browser')
const detectedLanguages = detector.detect() // ['zh-CN', 'zh', 'en-US', 'en']

const i18n = new I18n({
  defaultLocale: detectedLanguages[0] || 'en',
  autoDetect: true
})
```

## 下一步

现在您已经了解了基础用法，可以继续学习：

- [配置选项](/guide/configuration) - 了解所有可用的配置选项
- [翻译功能](/guide/translation) - 深入了解翻译功能
- [Vue 集成](/vue/installation) - 完整的 Vue 3 集成指南
- [API 参考](/api/core) - 完整的 API 文档

## 常见问题

### Q: 如何处理复数形式？

```typescript
const messages = {
  'en': {
    item: 'item | items'
  }
}

console.log(i18n.t('item', { count: 1 })) // "item"
console.log(i18n.t('item', { count: 2 })) // "items"
```

### Q: 如何处理日期和数字格式化？

```typescript
// 在 Vue 组件中
<I18nN :value="1234.56" format="currency" currency="USD" />
<I18nD :value="new Date()" format="long" />
```

### Q: 如何实现命名空间？

```typescript
const messages = {
  'zh-CN': {
    common: {
      save: '保存',
      cancel: '取消'
    },
    user: {
      title: '用户管理',
      create: '创建用户'
    }
  }
}

console.log(i18n.t('common.save')) // "保存"
console.log(i18n.t('user.title')) // "用户管理"
```

### Q: 如何在非 Vue 环境中使用？

@ldesign/i18n 的核心是框架无关的，可以在任何 JavaScript 环境中使用：

```typescript
// Node.js
import { I18n } from '@ldesign/i18n'

// React
import { I18n } from '@ldesign/i18n'
// 可以结合 React Context 使用

// 原生 JavaScript
import { I18n } from '@ldesign/i18n'
```
