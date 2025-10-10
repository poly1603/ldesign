---
layout: home

hero:
  name: "@ldesign/pdf"
  text: "功能强大的PDF阅读器"
  tagline: 高性能、可扩展、易用的PDF阅读器插件，支持Vue、React和原生JavaScript
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/pdf

features:
  - icon: ⚡️
    title: 高性能渲染
    details: 基于PDF.js，支持虚拟滚动、页面缓存和Web Worker，确保流畅的阅读体验

  - icon: 🎨
    title: 丰富配置
    details: 提供大量配置选项，包括缩放模式、渲染质量、布局模式等，满足各种需求

  - icon: 🔌
    title: 插件系统
    details: 强大的插件系统，轻松扩展功能，满足定制化需求

  - icon: 🛠️
    title: 框架无关
    details: 核心功能独立于框架，提供Vue、React等框架的官方适配器

  - icon: 📦
    title: 开箱即用
    details: 内置工具栏、搜索、缩略图、打印下载等常用功能，无需额外开发

  - icon: 🎯
    title: TypeScript
    details: 完整的TypeScript类型定义，提供优秀的开发体验和类型安全

  - icon: 🔍
    title: 全文搜索
    details: 支持全文搜索、正则表达式、大小写敏感等高级搜索功能

  - icon: 📱
    title: 响应式设计
    details: 自适应各种屏幕尺寸，在桌面端和移动端都有良好的表现

  - icon: 🎨
    title: 可定制UI
    details: 灵活的UI定制能力，可以完全自定义工具栏和控制面板
---

## 快速开始

### 安装

::: code-group

```bash [npm]
npm install @ldesign/pdf pdfjs-dist
```

```bash [yarn]
yarn add @ldesign/pdf pdfjs-dist
```

```bash [pnpm]
pnpm add @ldesign/pdf pdfjs-dist
```

:::

### Vue 3 使用

```vue
<template>
  <PDFViewer
    source="https://example.com/sample.pdf"
    :workerSrc="workerSrc"
  />
</template>

<script setup>
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
</script>
```

### 原生 JavaScript 使用

```javascript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});

viewer.load('https://example.com/sample.pdf');
```

## 核心特性

### 🚀 高性能

- **虚拟滚动**: 只渲染可见页面，大幅提升性能
- **智能缓存**: LRU/FIFO/LFU多种缓存策略可选
- **Web Worker**: 后台处理PDF解析，不阻塞主线程
- **页面预加载**: 预加载相邻页面，提升翻页体验

### 🎯 功能完善

- **多种缩放模式**: 自动、适应页面、适应宽度等
- **全文搜索**: 支持正则表达式、大小写敏感
- **缩略图导航**: 快速预览和跳转
- **打印和下载**: 一键打印和下载PDF文档
- **文本选择**: 支持文本选择和复制
- **书签/大纲**: 显示文档大纲结构

### 🔧 高度可配置

```typescript
const viewer = new PDFViewer({
  scale: 'auto',
  quality: 'high',
  layout: 'continuous',
  cache: {
    enabled: true,
    maxPages: 100,
    strategy: 'lru',
  },
  render: {
    dpi: 150,
    useWorker: true,
    maxConcurrent: 5,
  },
});
```

### 🎨 易于定制

```vue
<template>
  <PDFViewer :show-toolbar="false">
    <!-- 自定义工具栏 -->
    <template #toolbar>
      <CustomToolbar />
    </template>
  </PDFViewer>
</template>
```

## 为什么选择 @ldesign/pdf？

- ✅ **可靠**: 基于成熟的PDF.js库
- ✅ **现代**: 使用最新的Web技术和最佳实践
- ✅ **灵活**: 框架无关，支持多种使用方式
- ✅ **完善**: 详细的文档和丰富的示例
- ✅ **开源**: MIT协议，免费使用

## 浏览器支持

支持所有现代浏览器：

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Opera (最新版本)

## 社区

- [GitHub Issues](https://github.com/ldesign/pdf/issues)
- [讨论区](https://github.com/ldesign/pdf/discussions)

## 许可证

[MIT License](https://github.com/ldesign/pdf/blob/main/LICENSE)
