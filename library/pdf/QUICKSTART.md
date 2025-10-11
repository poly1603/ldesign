# 快速开始指南

本指南将帮助你在 5 分钟内快速上手使用 @ldesign/pdf-viewer。

## 安装

首先，安装包：

```bash
pnpm add @ldesign/pdf-viewer
```

## 复制 Worker 文件

PDF.js 需要一个 worker 文件。将其复制到你的公共目录：

```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/
```

## Vanilla JavaScript 使用

### 1. 创建 HTML 文件

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF Viewer</title>
  <style>
    #viewer {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### 2. 初始化查看器

```javascript
// main.js
import { PDFViewer } from '@ldesign/pdf-viewer'

const viewer = new PDFViewer({
  container: '#viewer',
  url: 'path/to/your.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})

// 监听事件
viewer.on('document-loaded', (doc) => {
  console.log('PDF 加载完成，共', doc.numPages, '页')
})
```

## Vue 3 使用

### 1. 导入组件

```vue
<template>
  <div class="app">
    <PDFViewer
      :url="pdfUrl"
      :worker-src="'/pdf.worker.min.mjs'"
      @document-loaded="onLoaded"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = ref('path/to/your.pdf')

const onLoaded = (totalPages) => {
  console.log('加载完成，共', totalPages, '页')
}
</script>

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
}
</style>
```

## 常用操作

### 加载 PDF

```javascript
// 从 URL 加载
viewer.loadDocument('https://example.com/document.pdf')

// 从文件加载
const file = event.target.files[0]
const buffer = await file.arrayBuffer()
viewer.loadDocument(new Uint8Array(buffer))
```

### 页面导航

```javascript
// 跳转到第 5 页
await viewer.goToPage(5)

// 下一页
await viewer.nextPage()

// 上一页
await viewer.previousPage()
```

### 缩放控制

```javascript
// 放大
viewer.setZoom('in')

// 缩小
viewer.setZoom('out')

// 自适应宽度
viewer.setZoom('fit-width')

// 设置为 150%
viewer.setZoom(1.5)
```

### 搜索文本

```javascript
const results = await viewer.search('关键词')
console.log('找到', results.length, '个匹配')
```

## 下一步

- 查看 [完整文档](./docs/guide/)
- 浏览 [示例项目](./examples/)
- 了解 [API 参考](./docs/api/)

## 需要帮助？

- [GitHub Issues](https://github.com/ldesign/pdf-viewer/issues)
- [文档](https://ldesign.github.io/pdf-viewer)
