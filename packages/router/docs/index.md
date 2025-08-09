---
layout: home

hero:
  name: 'LDesign Router'
  text: '强大的 Vue 路由库'
  tagline: '提供增强的组件和功能，让路由管理更简单、更强大'
  image:
    src: /logo.svg
    alt: LDesign Router
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/

features:
  - icon: 🚀
    title: 增强的组件
    details: 提供功能丰富的 RouterLink 和 RouterView 组件，支持预加载、权限控制、动画过渡等高级功能
  - icon: 🎯
    title: 权限控制
    details: 内置权限检查机制，支持路由级别和组件级别的权限控制，保护敏感页面和功能
  - icon: ⚡
    title: 智能预加载
    details: 支持多种预加载策略，包括鼠标悬停、可见时预加载等，提升用户体验
  - icon: 🎨
    title: 丰富的样式
    details: 提供多种内置样式变体，支持按钮、标签页、面包屑等不同场景的使用
  - icon: 📊
    title: 性能监控
    details: 内置性能监控功能，帮助开发者分析路由切换性能，优化应用体验
  - icon: 🔧
    title: 高度可配置
    details: 提供丰富的配置选项，支持自定义权限检查器、事件追踪器等，满足不同项目需求
  - icon: 🌙
    title: TypeScript 支持
    details: 完整的 TypeScript 类型定义，提供优秀的开发体验和类型安全
  - icon: 📱
    title: 响应式设计
    details: 支持移动端适配，提供响应式的组件样式和交互体验
  - icon: ♿
    title: 无障碍访问
    details: 遵循无障碍访问标准，支持键盘导航、屏幕阅读器等辅助功能
---

## 快速体验

```bash
# 安装
npm install @ldesign/router

# 或使用 pnpm
pnpm add @ldesign/router
```

```typescript
// 基础使用
import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'

const engine = createApp(App)

await engine.use(
  routerPlugin({
    routes: [
      { path: '/', component: Home },
      { path: '/about', component: About },
    ],
    mode: 'hash',
  })
)

await engine.mount('#app')
```

```vue
<!-- 增强的 RouterLink -->
<template>
  <RouterLink
    to="/products"
    variant="button"
    size="large"
    preload="hover"
    icon="icon-shopping"
    badge="5"
  >
    产品列表
  </RouterLink>

  <!-- 增强的 RouterView -->
  <RouterView transition="fade" keep-alive track-performance scroll-to-top />
</template>
```

## 为什么选择 LDesign Router？

### 🎯 **专为现代应用设计**

LDesign Router 不仅仅是一个路由库，它是一个完整的路由解决方案。我们在 Vue Router 的基础上，添加了现
代 Web 应用所需的各种功能。

### 🚀 **开箱即用的增强功能**

- **智能预加载**：自动预加载用户可能访问的页面
- **权限控制**：内置权限检查，保护敏感路由
- **性能监控**：实时监控路由性能，帮助优化应用
- **丰富样式**：多种内置样式，适应不同设计需求

### 💡 **简单而强大**

```typescript
// 启用所有增强功能只需要简单配置
await engine.use(
  routerPlugin({
    routes,
    enhancedComponents: {
      enabled: true,
      options: {
        enhancementConfig: {
          permissionChecker: permission => checkUserPermission(permission),
          eventTracker: (event, data) => analytics.track(event, data),
        },
      },
    },
  })
)
```

### 🔧 **高度可扩展**

通过插件系统，你可以轻松扩展路由功能，添加自定义的权限检查器、事件追踪器、布局解析器等。

## 社区与支持

- 📖 [完整文档](/guide/)
- 🐛 [问题反馈](https://github.com/ldesign/ldesign/issues)
- 💬 [讨论区](https://github.com/ldesign/ldesign/discussions)
- 📧 [邮件支持](mailto:support@ldesign.dev)

## 许可证

[MIT License](https://github.com/ldesign/ldesign/blob/main/LICENSE) © 2024 LDesign
