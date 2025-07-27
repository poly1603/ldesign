---
layout: home

hero:
  name: 'LDesign'
  text: '现代化的 Vue3 组件库和工具集'
  tagline: '🚀 高性能 · 🎨 智能主题 · 🧭 路由管理 · 📦 状态管理'
  image:
    src: /logo.svg
    alt: LDesign
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看组件
      link: /components/overview
    - theme: alt
      text: 演示应用
      link: /demo
    - theme: alt
      text: GitHub
      link: https://github.com/poly1603/ldesign

features:
  - icon: 🚀
    title: 现代化架构
    details: 基于 Vue 3 Composition API 和 TypeScript，提供完整的类型支持和最佳开发体验
  - icon: 🎨
    title: 智能主题系统
    details: 基于色彩科学的主题生成器，支持深色模式、自定义主题和动态主题切换
  - icon: 🧭
    title: 强大的路由管理
    details: 集成设备适配、权限管理、缓存策略、面包屑导航等企业级路由功能
  - icon: 📦
    title: 状态管理
    details: 基于 Pinia 的增强状态管理，支持装饰器、插件系统和时间旅行调试
  - icon: 🌍
    title: 国际化支持
    details: 内置多语言支持，自动检测浏览器语言，支持动态语言切换
  - icon: 🔐
    title: 安全加密
    details: 提供对称加密、非对称加密、哈希算法和国密算法的完整加密解决方案
  - icon: 📱
    title: 设备检测
    details: 智能设备检测和特性检测，支持响应式设计和设备适配
  - icon: ⚡
    title: 高性能
    details: 优化的构建配置、运行时性能和内存管理，确保最佳用户体验
  - icon: 🔧
    title: 开发友好
    details: 完善的开发工具、详细文档和丰富示例，大幅提升开发效率
---

## 🚀 快速体验

```bash
# 安装核心包
pnpm add @ldesign/engine @ldesign/router @ldesign/store

# 创建应用
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import { createLDesignRouter } from '@ldesign/router'

const engine = createEngine({
  name: 'my-app',
  version: '1.0.0'
})

const router = createLDesignRouter({
  routes: [
    { path: '/', component: Home }
  ],
  themeManager: { enabled: true },
  i18nManager: { enabled: true }
})

const app = createApp(App)
app.use(router)
```

## 🏗️ 生态系统

LDesign 提供完整的前端开发解决方案：

- **@ldesign/engine** - 核心引擎和插件系统
- **@ldesign/router** - 企业级路由管理
- **@ldesign/store** - 增强状态管理
- **@ldesign/color** - 智能主题生成器
- **@ldesign/crypto** - 安全加密工具
- **@ldesign/device** - 设备检测工具
- **@ldesign/http** - HTTP 请求库

## 谁在使用

LDesign 已被众多企业和开发者采用，为各种规模的项目提供可靠的 UI 解决方案。

<div class="vp-doc" style="margin-top: 32px;">
  <p style="text-align: center; color: var(--vp-c-text-2);">
    如果你的项目正在使用 LDesign，欢迎
    <a href="https://github.com/poly1603/ldesign/issues" target="_blank">告诉我们</a>
  </p>
</div>
