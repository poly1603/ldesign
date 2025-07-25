---
layout: home

hero:
  name: "LDesign"
  text: "现代化的 Vue3 组件库"
  tagline: "🚀 高性能 · 🎨 美观 · 🛠️ 易用 · 📱 响应式"
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
      text: GitHub
      link: https://github.com/poly1603/ldesign

features:
  - icon: ⚡️
    title: 高性能
    details: 基于 Vue3 Composition API，提供卓越的性能表现和更小的包体积
  - icon: 🎨
    title: 精美设计
    details: 遵循现代设计原则，提供美观且一致的用户界面体验
  - icon: 🛠️
    title: 开发友好
    details: 完整的 TypeScript 支持，丰富的 API 文档和示例代码
  - icon: 📱
    title: 响应式设计
    details: 完美适配各种屏幕尺寸，提供一致的移动端体验
  - icon: 🔧
    title: 高度可定制
    details: 灵活的主题系统和丰富的配置选项，满足各种定制需求
  - icon: 🌍
    title: 国际化支持
    details: 内置国际化解决方案，轻松支持多语言应用
  - icon: 🧪
    title: 测试覆盖
    details: 完整的单元测试和 E2E 测试，确保组件质量和稳定性
  - icon: 📦
    title: 模块化设计
    details: 支持按需引入，优化打包体积，提升应用性能
  - icon: 🔒
    title: 类型安全
    details: 完整的 TypeScript 类型定义，提供更好的开发体验
---

## 快速体验

```bash
# 安装
pnpm add @ldesign/core

# 使用
import { createApp } from 'vue'
import LDesign from '@ldesign/core'
import '@ldesign/core/dist/style.css'

const app = createApp(App)
app.use(LDesign)
```

## 生态系统

LDesign 不仅仅是一个组件库，更是一个完整的前端开发生态系统：

- **@ldesign/core** - 核心组件库
- **@ldesign/utils** - 实用工具集
- **@ldesign/icons** - 图标库
- **@ldesign/theme** - 主题系统
- **@ldesign/cli** - 开发工具

## 谁在使用

LDesign 已被众多企业和开发者采用，为各种规模的项目提供可靠的 UI 解决方案。

<div class="vp-doc" style="margin-top: 32px;">
  <p style="text-align: center; color: var(--vp-c-text-2);">
    如果你的项目正在使用 LDesign，欢迎
    <a href="https://github.com/poly1603/ldesign/issues" target="_blank">告诉我们</a>
  </p>
</div>
