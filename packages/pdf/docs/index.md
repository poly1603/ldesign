---
layout: home

hero:
  name: "@ldesign/pdf"
  text: "功能完整的PDF预览器"
  tagline: 高性能、跨框架、TypeScript支持的PDF预览解决方案
  image:
    src: /logo.svg
    alt: ldesign PDF
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: https://ldesign-pdf-demo.vercel.app
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/pdf

features:
  - icon: 🚀
    title: 高性能
    details: 智能缓存、懒加载、虚拟滚动，确保流畅的用户体验
  - icon: 🎯
    title: 框架无关
    details: 支持原生JavaScript、Vue3等多种框架，轻松集成到任何项目
  - icon: 🔧
    title: TypeScript支持
    details: 完整的类型定义，提供出色的开发体验和类型安全
  - icon: 📱
    title: 响应式设计
    details: 完美适配桌面端和移动端，提供一致的用户体验
  - icon: 🎨
    title: 高度可定制
    details: 丰富的配置选项、主题支持和插件系统
  - icon: 🔍
    title: 功能丰富
    details: 页面导航、缩放、旋转、搜索、缩略图、全屏等完整功能
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/pdf
```

```bash [npm]
npm install @ldesign/pdf
```

```bash [yarn]
yarn add @ldesign/pdf
```

:::

### 基础使用

::: code-group

```javascript [原生JavaScript]
import { createPdfViewer } from '@ldesign/pdf'

const container = document.getElementById('pdf-container')
const viewer = createPdfViewer({
  container,
  enableToolbar: true,
  enableSearch: true,
})

await viewer.loadDocument('path/to/document.pdf')
```

```vue [Vue 3 组件]
<template>
  <PdfViewer
    :src="pdfUrl"
    :enable-toolbar="true"
    :enable-search="true"
    @document-loaded="onDocumentLoaded"
  />
</template>

<script setup>
import { PdfViewer } from '@ldesign/pdf/vue'

const pdfUrl = 'path/to/document.pdf'
const onDocumentLoaded = (info) => {
  console.log('文档已加载:', info)
}
</script>
```

```vue [Vue 3 Hook]
<template>
  <div ref="containerRef" class="pdf-container"></div>
</template>

<script setup>
import { ref } from 'vue'
import { usePdfViewer } from '@ldesign/pdf/vue'

const containerRef = ref()
const { loadDocument } = usePdfViewer(containerRef)

await loadDocument('path/to/document.pdf')
</script>
```

:::

## 为什么选择 @ldesign/pdf？

### 🎯 专业级功能

提供企业级PDF预览所需的所有功能：页面导航、智能缩放、文本搜索、缩略图导航、全屏预览、下载打印等。

### ⚡ 卓越性能

- **智能缓存**：页面级缓存，避免重复渲染
- **懒加载**：按需加载页面内容
- **虚拟滚动**：处理大型文档时保持流畅
- **内存优化**：自动清理不需要的资源

### 🔧 开发友好

- **完整TypeScript支持**：类型安全，智能提示
- **框架无关设计**：可集成到任何前端框架
- **丰富的API**：满足各种定制需求
- **详细的文档**：快速上手，深入了解

### 🎨 高度可定制

- **主题系统**：支持亮色/暗色主题
- **自定义样式**：CSS变量，轻松定制外观
- **插件架构**：扩展功能，满足特殊需求
- **事件系统**：监听各种状态变化

## 浏览器支持

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) |
| --- | --- | --- | --- |
| Chrome ≥ 88 | Firefox ≥ 78 | Safari ≥ 14 | Edge ≥ 88 |

## 社区与支持

- 📖 [完整文档](/guide/)
- 🐛 [问题反馈](https://github.com/ldesign/pdf/issues)
- 💬 [讨论区](https://github.com/ldesign/pdf/discussions)
- 📧 [邮件支持](mailto:support@ldesign.com)

## 开源协议

[MIT License](https://github.com/ldesign/pdf/blob/main/LICENSE) © 2024 ldesign

---

<div style="text-align: center; margin-top: 40px;">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️</p>
  <a href="https://github.com/ldesign/pdf" target="_blank">
    <img src="https://img.shields.io/github/stars/ldesign/pdf?style=social" alt="GitHub stars">
  </a>
</div>
