---
layout: home

hero:
  name: "@ldesign/i18n"
  text: "多语言管理系统"
  tagline: 功能完整的框架无关国际化解决方案
  image:
    src: /logo.svg
    alt: ldesign i18n
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/vanilla

features:
  - icon: 🌍
    title: 框架无关
    details: 可在任何 JavaScript 环境中使用，不依赖特定框架
  - icon: 🎯
    title: Vue 3 集成
    details: 提供完整的 Vue 3 插件和组合式 API 支持
  - icon: 🔒
    title: TypeScript 支持
    details: 完整的类型定义，提供类型安全的翻译功能
  - icon: ⚡
    title: 高性能缓存
    details: 内置 LRU 缓存机制，优化翻译性能
  - icon: 🔄
    title: 动态加载
    details: 支持语言包的懒加载和预加载策略
  - icon: 🌐
    title: 自动检测
    details: 智能检测浏览器语言偏好设置
  - icon: 💾
    title: 持久化存储
    details: 支持 localStorage、sessionStorage、Cookie 等多种存储方式
  - icon: 🔤
    title: 插值支持
    details: 强大的字符串插值功能，支持 HTML 转义
  - icon: 📊
    title: 复数处理
    details: 支持多语言复数规则和 ICU 语法
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/i18n
```

```bash [npm]
npm install @ldesign/i18n
```

```bash [yarn]
yarn add @ldesign/i18n
```

:::

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
// main.ts
import { createApp } from 'vue'
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
import App from './App.vue'

async function bootstrap() {
  const i18nInstance = await createI18nWithBuiltinLocales({
    defaultLocale: 'en'
  })

  const vueI18nPlugin = createI18n(i18nInstance)
  
  const app = createApp(App)
  app.use(vueI18nPlugin)
  app.mount('#app')
}

bootstrap()
```

```vue
<!-- App.vue -->
<template>
  <div>
    <!-- 使用组合式 API -->
    <h1>{{ t('common.welcome') }}</h1>
    
    <!-- 使用指令 -->
    <button v-t="'common.save'"></button>
    
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

<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t, availableLanguages, changeLanguage } = useI18n()
</script>
```

## 为什么选择 @ldesign/i18n？

### 🚀 现代化设计

采用现代 JavaScript/TypeScript 技术栈，支持 ES modules、Tree-shaking 和按需导入。

### 🎨 灵活的架构

模块化设计，可以根据需要选择使用的功能，支持自定义加载器、存储和检测器。

### 📦 开箱即用

内置英语、中文、日语三种语言包，包含常用的界面文本和验证信息。

### 🔧 易于扩展

提供丰富的 API 和插件机制，可以轻松扩展功能和集成到现有项目中。

---

<div style="text-align: center; margin-top: 2rem;">
  <a href="/guide/getting-started" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
    开始使用 →
  </a>
</div>
