---
layout: home

hero:
  name: PDF Viewer
  text: 功能强大的PDF预览库
  tagline: 简单易用、配置丰富、支持任意框架
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: API文档
      link: /api/

features:
  - icon: 🚀
    title: 开箱即用
    details: 简单的API设计，5分钟即可集成到你的项目中
  - icon: 🎨
    title: 高度可定制
    details: 支持自定义工具栏、主题和UI样式
  - icon: 🔌
    title: 框架无关
    details: 支持Vanilla JS、Vue、React等任意框架
  - icon: ⚡️
    title: 性能优越
    details: 智能缓存、虚拟滚动、按需渲染
  - icon: 📱
    title: 响应式设计
    details: 完美支持桌面端和移动端
  - icon: 🔍
    title: 功能丰富
    details: 支持搜索、缩放、旋转、下载、打印等功能
---

## 快速开始

### 安装

::: code-group
```bash [pnpm]
pnpm add @ldesign/pdf-viewer
```

```bash [npm]
npm install @ldesign/pdf-viewer
```

```bash [yarn]
yarn add @ldesign/pdf-viewer
```
:::

### 基础用法

#### Vanilla JavaScript

```javascript
import { PDFViewer } from '@ldesign/pdf-viewer'

const viewer = new PDFViewer({
  container: '#viewer',
  url: 'path/to/your.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})
```

#### Vue 3

```vue
<template>
  <PDFViewer
    url="path/to/your.pdf"
    :worker-src="'/pdf.worker.min.mjs'"
  />
</template>

<script setup>
import { PDFViewer } from '@ldesign/pdf-viewer/vue'
</script>
```

## 特性一览

### 核心功能

- ✅ PDF文档加载和渲染
- ✅ 页面导航（上一页、下一页、跳转）
- ✅ 缩放控制（放大、缩小、自适应）
- ✅ 页面旋转
- ✅ 全文搜索
- ✅ 文本选择
- ✅ 下载和打印
- ✅ 自定义工具栏
- ✅ 主题定制

### 性能优化

- ✅ 页面缓存管理
- ✅ 智能预渲染
- ✅ 虚拟滚动（可选）
- ✅ 渲染任务管理

### 框架支持

- ✅ Vanilla JavaScript
- ✅ Vue 3（组件 + Composable）
- ⏳ React（计划中）
- ⏳ Angular（计划中）

## 为什么选择我们？

### 简单易用

只需几行代码即可实现一个功能完整的PDF查看器。

### 配置丰富

提供丰富的配置选项，满足各种定制需求。

### 性能优越

采用先进的缓存策略和渲染优化，确保流畅的用户体验。

### 框架无关

基于原生JavaScript实现，可以在任何前端框架中使用。

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开源协议

[MIT License](https://opensource.org/licenses/MIT)
