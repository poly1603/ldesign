---
layout: home

hero:
  name: "LDesign"
  text: "Vue3 现代化开发引擎"
  tagline: "基于Vue3的插件化前端开发解决方案，提供完整的开发生态系统"
  image:
    src: /logo.svg
    alt: LDesign
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: 在线演示
      link: /demo/

features:
  - icon: 🚀
    title: 高性能引擎
    details: 基于Vue3构建的高性能核心引擎，提供插件化架构和中间件系统，支持热插拔和动态加载。
  - icon: 🔧
    title: 完整工具链
    details: 包含路由、HTTP请求、加密、设备检测、模板系统等8个核心包，覆盖前端开发的各个方面。
  - icon: 📱
    title: 跨平台支持
    details: 支持桌面端、移动端、小程序等多种平台，提供统一的开发体验和API接口。
  - icon: 🎨
    title: 主题系统
    details: 内置强大的颜色和主题管理系统，支持动态主题切换、暗色模式和自定义主题。
  - icon: 🌍
    title: 国际化支持
    details: 完整的多语言支持，包含翻译管理、语言切换、本地化格式等功能。
  - icon: 🔒
    title: 安全可靠
    details: 内置加密工具包，提供AES、RSA等加密算法，以及XSS防护、CSRF保护等安全机制。
  - icon: 📊
    title: 性能监控
    details: 内置性能监控系统，实时收集和分析应用性能指标，帮助优化应用性能。
  - icon: 🛠️
    title: 开发者友好
    details: 完整的TypeScript支持、详细的文档、丰富的示例和优秀的开发者体验。
---

## 🎯 为什么选择 LDesign？

LDesign 是一个专为现代前端开发而设计的Vue3引擎，它不仅仅是一个框架，更是一个完整的开发生态系统。

### 🏗️ 企业级架构

- **插件化设计**：模块化的插件系统，支持按需加载和热插拔
- **中间件支持**：灵活的中间件机制，轻松扩展功能
- **事件驱动**：完整的事件系统，支持组件间通信
- **状态管理**：内置状态管理，支持响应式数据流

### 🚀 开箱即用

```typescript
import { createEngine } from '@ldesign/engine'
import { createRouter } from '@ldesign/router'
import { createHttpClient } from '@ldesign/http'

// 创建引擎实例
const engine = createEngine({
  plugins: [
    // 路由插件
    createRouter({
      routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
      ]
    }),
    // HTTP客户端
    createHttpClient({
      baseURL: 'https://api.example.com'
    })
  ]
})

// 创建Vue应用
const app = engine.createApp()
app.mount('#app')
```

### 📦 核心包概览

| 包名 | 描述 | 版本 | 状态 |
|------|------|------|------|
| [@ldesign/engine](./packages/engine/) | 核心引擎和插件系统 | ![npm](https://img.shields.io/npm/v/@ldesign/engine) | ✅ 稳定 |
| [@ldesign/router](./packages/router/) | Vue路由增强版 | ![npm](https://img.shields.io/npm/v/@ldesign/router) | ✅ 稳定 |
| [@ldesign/http](./packages/http/) | HTTP请求库 | ![npm](https://img.shields.io/npm/v/@ldesign/http) | ✅ 稳定 |
| [@ldesign/crypto](./packages/crypto/) | 加密工具包 | ![npm](https://img.shields.io/npm/v/@ldesign/crypto) | ✅ 稳定 |
| [@ldesign/device](./packages/device/) | 设备检测和适配 | ![npm](https://img.shields.io/npm/v/@ldesign/device) | ✅ 稳定 |
| [@ldesign/template](./packages/template/) | 模板管理系统 | ![npm](https://img.shields.io/npm/v/@ldesign/template) | ✅ 稳定 |
| [@ldesign/color](./packages/color/) | 颜色和主题工具 | ![npm](https://img.shields.io/npm/v/@ldesign/color) | ✅ 稳定 |
| [@ldesign/i18n](./packages/i18n/) | 国际化解决方案 | ![npm](https://img.shields.io/npm/v/@ldesign/i18n) | ✅ 稳定 |

### 🌟 特色功能

::: tip 智能缓存
内置多级缓存系统，支持LRU、LFU、FIFO等缓存策略，自动优化应用性能。
:::

::: tip 安全防护
集成XSS防护、CSRF保护、内容安全策略等安全机制，保障应用安全。
:::

::: tip 性能监控
实时性能监控，包括FPS、内存使用、网络请求等关键指标的收集和分析。
:::

::: tip 设备适配
智能设备检测和适配，支持桌面端、移动端、平板等多种设备类型。
:::

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine

# 使用 npm
npm install @ldesign/engine

# 使用 yarn
yarn add @ldesign/engine
```

### 基础使用

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { createEngine } from '@ldesign/engine'
import { createRouter } from '@ldesign/router'

// 创建引擎
const engine = createEngine()

// 配置路由
const router = createRouter({
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/about', component: () => import('./views/About.vue') }
  ]
})

// 安装插件
engine.use(router)

// 创建应用
const app = engine.createApp()
app.mount('#app')
</script>
```

## 📚 学习资源

- [📖 完整文档](./guide/) - 详细的使用指南和API参考
- [🎯 示例项目](./examples/) - 丰富的示例代码和最佳实践
- [🎮 在线演示](./demo/) - 交互式功能演示
- [🤝 贡献指南](./contributing) - 如何参与项目开发

## 🤝 社区支持

- [GitHub Issues](https://github.com/ldesign-org/ldesign/issues) - 问题反馈和功能建议
- [GitHub Discussions](https://github.com/ldesign-org/ldesign/discussions) - 社区讨论
- [Discord](https://discord.gg/ldesign) - 实时交流

## 📄 许可证

[MIT License](https://github.com/ldesign-org/ldesign/blob/main/LICENSE) © 2024 LDesign Team