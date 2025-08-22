---
layout: home

hero:
  name: 'LDesign Router'
  text: '下一代 Vue 路由器'
  tagline: '极致性能 · 类型安全 · 智能预加载 · 开箱即用'
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
  - icon: ⚡
    title: 极致性能
    details: LRU缓存 + Trie树匹配 + 路径预编译，路由匹配速度提升3-5倍，内存使用减少30%
  - icon: 🔒
    title: 类型安全
    details: 完整的TypeScript支持，路径参数自动推导，编译时类型检查，零运行时错误
  - icon: 🧠
    title: 智能预加载
    details: 鼠标悬停、可见性检测、空闲时间预加载，支持错误重试和指数退避策略
  - icon: 🎯
    title: 开箱即用
    details: SPA、移动端、管理后台等多种预设配置，一行代码创建路由器，零配置启动
  - icon: 💾
    title: 内存管理
    details: 自动内存监控、弱引用管理、垃圾回收优化，告别内存泄漏和性能问题
  - icon: 🔌
    title: Engine集成
    details: 深度集成LDesign Engine，状态管理同步，插件化架构，统一的开发体验
  - icon: 📱
    title: 设备适配
    details: 自动检测设备类型，智能路由重定向，响应式组件，一套代码多端运行
  - icon: 🎨
    title: 动画效果
    details: 内置fade、slide、scale等过渡动画，支持自定义动画，流畅的页面切换体验
  - icon: 🛡️
    title: 错误恢复
    details: 智能错误处理、自动重试机制、降级策略，确保应用稳定性和用户体验
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
