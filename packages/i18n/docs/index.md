---
layout: home

hero:
  name: "@ldesign/i18n"
  text: "企业级国际化解决方案"
  tagline: "功能强大、类型安全、高性能的多语言库，支持 Vue 3 深度集成"
  image:
    src: /logo.svg
    alt: LDesign I18n
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/i18n

features:
  - icon: 🚀
    title: 高性能
    details: 智能缓存机制、异步加载、内存优化，确保最佳性能表现
  
  - icon: 🔒
    title: 类型安全
    details: 完整的 TypeScript 支持，编译时类型检查，避免运行时错误
  
  - icon: 🎯
    title: 框架无关
    details: 核心库独立于任何框架，同时提供 Vue 3 深度集成支持
  
  - icon: 🔄
    title: 异步加载
    details: 支持动态加载语言包，减少初始包体积，提升用户体验
  
  - icon: 🧠
    title: 智能缓存
    details: 多层缓存策略，内存管理，TTL 支持，确保数据新鲜度
  
  - icon: 🌐
    title: 语言检测
    details: 自动检测用户语言偏好，支持浏览器、URL、存储等多种检测方式
  
  - icon: 📦
    title: 多种格式
    details: 支持 ESM、CJS、UMD 多种模块格式，适配各种构建工具
  
  - icon: 🛠️
    title: 丰富工具
    details: 插值、复数化、格式化、验证等完整工具链支持
  
  - icon: ⚡
    title: Vue 集成
    details: 类似 vue-i18n 的 API，组合式 API、组件、指令全面支持
---

## 快速体验

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
    <span v-t="{ key: 'welcome', params: { name: 'Vue' } }"></span>
    
    <!-- 语言切换 -->
    <select @change="setLocale($event.target.value)">
      <option v-for="locale in availableLocales" :key="locale" :value="locale">
        {{ locale }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from '@ldesign/i18n/vue'

const { t, locale, availableLocales, setLocale } = useI18n()
</script>
```

### 安装

```bash
# npm
npm install @ldesign/i18n

# yarn
yarn add @ldesign/i18n

# pnpm
pnpm add @ldesign/i18n
```

## 核心特性

### 🎯 企业级功能

- **多层缓存**：内存缓存 + 持久化存储，智能缓存策略
- **异步加载**：按需加载语言包，支持 HTTP、静态文件等多种加载方式
- **语言检测**：自动检测用户语言偏好，支持多种检测策略
- **降级机制**：翻译缺失时自动使用降级语言
- **性能监控**：内置性能监控，帮助优化应用性能

### 🔧 开发体验

- **TypeScript 优先**：完整的类型定义，优秀的开发体验
- **热重载支持**：开发时语言包变更自动重载
- **调试工具**：详细的错误信息和调试日志
- **插件系统**：可扩展的插件架构
- **测试友好**：提供测试工具和 Mock 支持

### 🌟 Vue 生态

- **组合式 API**：`useI18n` Hook，完美融入 Vue 3
- **组件支持**：`I18nT`、`I18nN`、`I18nD` 声明式组件
- **指令支持**：`v-t`、`v-t-html`、`v-t-title` 指令
- **响应式**：语言切换自动更新所有相关组件
- **SSR 支持**：完整的服务端渲染支持

## 为什么选择 @ldesign/i18n？

### 🆚 对比其他方案

| 特性 | @ldesign/i18n | vue-i18n | react-i18next | i18next |
|------|---------------|-----------|---------------|---------|
| TypeScript 支持 | ✅ 完整 | ✅ 良好 | ✅ 良好 | ✅ 基础 |
| 框架无关 | ✅ 是 | ❌ Vue 专用 | ❌ React 专用 | ✅ 是 |
| Vue 3 集成 | ✅ 深度集成 | ✅ 原生 | ❌ 无 | ⚠️ 需配置 |
| 异步加载 | ✅ 内置 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 智能缓存 | ✅ 多层缓存 | ⚠️ 基础 | ⚠️ 基础 | ⚠️ 基础 |
| 性能监控 | ✅ 内置 | ❌ 无 | ❌ 无 | ❌ 无 |
| 包体积 | 🎯 优化 | 📦 中等 | 📦 较大 | 📦 较大 |

### 🎨 设计理念

- **性能优先**：每个功能都经过性能优化，确保生产环境的最佳表现
- **开发体验**：提供优秀的 TypeScript 支持和调试工具
- **渐进增强**：从简单的翻译到复杂的企业级需求，逐步增强
- **生态友好**：与现有工具链无缝集成，不破坏现有架构

---

<div style="text-align: center; margin-top: 2rem;">
  <a href="/guide/getting-started" style="background: #007acc; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
    开始使用 →
  </a>
</div>
