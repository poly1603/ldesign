# 快速开始

本指南将帮助你在5分钟内快速上手使用 @ldesign/pdf-viewer。

## Vanilla JavaScript

### 1. 准备HTML

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
import { PDFViewer } from '@ldesign/pdf-viewer'

const viewer = new PDFViewer({
  container: '#viewer',
  url: 'path/to/your.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})
```

### 3. 监听事件

```javascript
viewer.on('document-loaded', (doc) => {
  console.log('PDF loaded, total pages:', doc.numPages)
})

viewer.on('page-changed', (pageNumber) => {
  console.log('Current page:', pageNumber)
})
```

## Vue 3

### 方式一：使用组件

```vue
<template>
  <PDFViewer
    :url="pdfUrl"
    :worker-src="'/pdf.worker.min.mjs'"
    @document-loaded="onLoaded"
    @page-changed="onPageChanged"
  />
</template>

<script setup>
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = ref('path/to/your.pdf')

const onLoaded = (totalPages) => {
  console.log('Total pages:', totalPages)
}

const onPageChanged = (page) => {
  console.log('Current page:', page)
}
</script>

<style scoped>
/* 组件会占满父容器 */
</style>
```

### 方式二：使用Composable

```vue
<template>
  <div>
    <div class="controls">
      <button @click="previousPage">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
    </div>
    <div ref="containerRef" class="viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePDFViewer } from '@ldesign/pdf-viewer/vue'

const containerRef = ref()

const {
  currentPage,
  totalPages,
  init,
  loadDocument,
  nextPage,
  previousPage
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs'
})

onMounted(async () => {
  await init(containerRef.value)
  await loadDocument('path/to/your.pdf')
})
</script>

<style scoped>
.viewer {
  width: 100%;
  height: 600px;
}
</style>
```

## 加载不同来源的PDF

### 从URL加载

```javascript
viewer.loadDocument('https://example.com/document.pdf')
```

### 从本地文件加载

```javascript
const fileInput = document.querySelector('input[type="file"]')

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  await viewer.loadDocument(uint8Array)
})
```

### 从Base64加载

```javascript
const base64 = 'JVBERi0xLjcKCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9n...'
const binaryString = atob(base64)
const bytes = new Uint8Array(binaryString.length)
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i)
}
await viewer.loadDocument(bytes)
```

## 基本操作

### 页面导航

```javascript
// 跳转到指定页
await viewer.goToPage(5)

// 下一页
await viewer.nextPage()

// 上一页
await viewer.previousPage()

// 获取当前页码
const currentPage = viewer.getCurrentPage()

// 获取总页数
const totalPages = viewer.getTotalPages()
```

### 缩放控制

```javascript
// 放大
viewer.setZoom('in')

// 缩小
viewer.setZoom('out')

// 设置具体缩放比例
viewer.setZoom(1.5)

// 自适应宽度
viewer.setZoom('fit-width')

// 自适应页面
viewer.setZoom('fit-page')

// 获取当前缩放比例
const zoom = viewer.getCurrentZoom()
```

### 旋转���面

```javascript
// 旋转90度
viewer.rotate(90)

// 旋转180度
viewer.rotate(180)

// 旋转270度
viewer.rotate(270)

// 恢复原始方向
viewer.rotate(0)
```

### 搜索文本

```javascript
const results = await viewer.search('keyword')

// 监听搜索结果
viewer.on('search-results', (results) => {
  console.log('Found', results.length, 'matches')
  results.forEach(result => {
    console.log(`Page ${result.pageNumber}: ${result.text}`)
  })
})
```

### 下载和打印

```javascript
// 下载PDF
viewer.download('my-document.pdf')

// 打印PDF
viewer.print()
```

## 配置选项

```javascript
const viewer = new PDFViewer({
  container: '#viewer',
  url: 'document.pdf',

  // 基础配置
  scale: 1.0,              // 初始缩放比例
  page: 1,                 // 初始页码

  // 功能开关
  enableToolbar: true,     // 显示工具栏
  enableSearch: true,      // 启用搜索
  enableTextSelection: true, // 启用文本选择

  // Worker配置
  workerSrc: '/pdf.worker.min.mjs',

  // 工具栏配置
  toolbar: {
    showZoom: true,
    showPageNav: true,
    showDownload: true,
    showPrint: true,
    showRotate: true
  },

  // 主题配置
  theme: {
    primaryColor: '#0969da',
    backgroundColor: '#525659',
    toolbarBackground: '#323639'
  }
})
```

## 销毁实例

使用完毕后记得销毁查看器实例：

```javascript
await viewer.destroy()
```

## 下一步

- [配置选项](./configuration) - 了解所有配置选项
- [事件系统](./events) - 掌握事件监听
- [Vue集成](./vue) - Vue 3深度集成指南
- [API文档](../api/) - 完整API参考
