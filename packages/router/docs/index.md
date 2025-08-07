---
layout: home

hero:
  name: 'LDesign Router'
  text: '功能强大的 Vue 路由库'
  tagline: 简单易用，功能完善，性能卓越
  image:
    src: /logo.svg
    alt: LDesign Router
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🚀
    title: 简单易用
    details: 提供简洁的 API 和清晰的文档，让路由配置变得简单直观
  - icon: ⚡️
    title: 高性能
    details: 优化的路由匹配算法，确保应用快速响应
  - icon: 🛡️
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供更好的开发体验
  - icon: 🔧
    title: 功能丰富
    details: 支持嵌套路由、动态路由、路由守卫、懒加载、预加载、缓存等高级功能
  - icon: 📱
    title: 现代化
    details: 基于 Vue 3 Composition API，支持现代前端开发模式和最佳实践
  - icon: 🎨
    title: 灵活配置
    details: 支持多种路由模式、插件系统和自定义配置，满足各种复杂需求
  - icon: 📊
    title: 性能监控
    details: 内置性能监控工具，实时分析路由性能，帮助优化应用体验
  - icon: 🔄
    title: 智能缓存
    details: 智能路由缓存策略，减少重复加载，提升用户体验
---

## 快速安装

::: code-group

```bash [npm]
npm install @ldesign/router
```

```bash [yarn]
yarn add @ldesign/router
```

```bash [pnpm]
pnpm add @ldesign/router
```

:::

## 简单示例

```typescript
import { createRouter, createWebHistory } from '@ldesign/router'
import { createApp } from 'vue'
import App from './App.vue'

// 定义路由
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue'),
    meta: { title: '首页', cache: true },
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
    meta: { title: '关于我们' },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 启用高级功能
  preloadStrategy: 'visible',
  performance: true,
  cache: { max: 10, ttl: 5 * 60 * 1000 },
})

// 创建应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
```

## 为什么选择 LDesign Router？

### 🎯 专注开发体验

LDesign Router 专注于提供最佳的开发体验，从 API 设计到文档编写，每个细节都经过精心考虑。

### 🔄 无缝迁移

如果你熟悉 Vue Router，那么使用 LDesign Router 将非常容易。我们保持了相似的 API 设计，同时提供了更多
便利功能。

### 📚 完善文档

我们提供了详细的文档和丰富的示例，帮助你快速上手并掌握所有功能。

### 🧪 充分测试

每个功能都经过充分的单元测试和集成测试，确保代码质量和稳定性。

---

<div class="tip custom-block" style="padding-top: 8px">

只是想尝试一下？跳到[快速开始](/guide/getting-started)。

</div>
