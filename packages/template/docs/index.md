---
layout: home

hero:
  name: "LDesign Template"
  text: "多模板管理系统"
  tagline: "为 Vue 3 而生的智能模板管理及动态渲染解决方案"
  image:
    src: /logo.svg
    alt: LDesign Template
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/

features:
  - icon: 🚀
    title: 开箱即用
    details: 零配置启动，智能模板扫描，让你专注于业务逻辑而非配置
  - icon: 📱
    title: 响应式设计
    details: 自动设备检测，完美适配桌面、平板、移动端各种屏幕尺寸
  - icon: ⚡
    title: 性能优化
    details: 懒加载、智能缓存、预加载支持，确保最佳用户体验
  - icon: 🎯
    title: 类型安全
    details: 完整的 TypeScript 支持，提供强类型检查和智能提示
  - icon: 🔧
    title: 灵活配置
    details: 支持自定义配置和扩展，满足各种复杂业务场景需求
  - icon: 🎪
    title: 多种用法
    details: 提供 Composable、组件、指令、插件等多种使用方式
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/template
```

```bash [npm]
npm install @ldesign/template
```

```bash [yarn]
yarn add @ldesign/template
```

:::

### 基础用法

```typescript
import TemplatePlugin from '@ldesign/template'
import { createApp } from 'vue'

const app = createApp(App)
app.use(TemplatePlugin)
```

### 使用组件

```vue
<template>
  <LTemplateRenderer
    category="login"
    device="desktop"
    template="classic"
  />
</template>
```

## 为什么选择 LDesign Template？

LDesign Template 是一个专为现代 Vue 3 应用设计的模板管理系统。它解决了在复杂应用中管理多套模板、适配不同设备、优化加载性能等常见问题。

### 🎨 设计理念

- **简单易用**：API 设计直观，学习成本低
- **性能优先**：内置多种优化策略，确保最佳性能
- **扩展性强**：插件化架构，支持自定义扩展
- **开发友好**：完整的 TypeScript 支持和开发工具
