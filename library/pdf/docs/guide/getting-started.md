# 快速开始

本指南将帮助你快速上手 @ldesign/pdf，在几分钟内实现PDF预览功能。

## 安装

首先安装 @ldesign/pdf 包：

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

## 基础使用

### 原生 JavaScript

```javascript
import { createPdfViewer } from '@ldesign/pdf'
import '@ldesign/pdf/style.css'

// 创建PDF查看器
const container = document.getElementById('pdf-container')
const viewer = createPdfViewer({
  container,
  enableToolbar: true,
  enableSearch: true,
  theme: 'light'
})

// 加载PDF文档
await viewer.loadDocument('path/to/document.pdf')

// 监听事件
viewer.on('documentLoaded', (info) => {
  console.log('文档已加载:', info)
})

viewer.on('pageChanged', ({ currentPage, totalPages }) => {
  console.log(`当前页: ${currentPage}/${totalPages}`)
})
```

### Vue 3 组件方式

```vue
<template>
  <div class="pdf-demo">
    <PdfViewer
      :src="pdfUrl"
      :enable-toolbar="true"
      :enable-search="true"
      :enable-thumbnails="true"
      :theme="theme"
      @document-loaded="onDocumentLoaded"
      @page-changed="onPageChanged"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PdfViewer } from '@ldesign/pdf/vue'
import '@ldesign/pdf/style.css'

const pdfUrl = ref('path/to/document.pdf')
const theme = ref('light')

const onDocumentLoaded = (info) => {
  console.log('文档已加载:', info)
}

const onPageChanged = ({ currentPage, totalPages }) => {
  console.log(`当前页: ${currentPage}/${totalPages}`)
}

const onError = (error) => {
  console.error('PDF加载错误:', error)
}
</script>

<style scoped>
.pdf-demo {
  width: 100%;
  height: 600px;
}
</style>
```

### Vue 3 Hook 方式

```vue
<template>
  <div class="pdf-container">
    <div class="toolbar">
      <button @click="previousPage" :disabled="!canGoPrevious">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="!canGoNext">下一页</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <button @click="rotate">旋转</button>
    </div>
    <div ref="containerRef" class="viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePdfViewer } from '@ldesign/pdf/vue'
import '@ldesign/pdf/style.css'

const containerRef = ref()

const {
  loadDocument,
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  previousPage,
  nextPage,
  zoomIn,
  zoomOut,
  rotate,
  isLoading,
  error
} = usePdfViewer(containerRef, {
  enableToolbar: false, // 使用自定义工具栏
  enableSearch: true,
  theme: 'light'
})

onMounted(async () => {
  try {
    await loadDocument('path/to/document.pdf')
  } catch (err) {
    console.error('加载PDF失败:', err)
  }
})
</script>

<style scoped>
.pdf-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.viewer {
  flex: 1;
}
</style>
```

## 配置选项

### 基础配置

```javascript
const viewer = createPdfViewer({
  container: document.getElementById('pdf-container'),
  
  // 显示选项
  enableToolbar: true,        // 显示工具栏
  enableSearch: true,         // 启用搜索功能
  enableThumbnails: true,     // 显示缩略图
  enableTextSelection: true,  // 启用文本选择
  enableAnnotations: true,    // 显示注释
  
  // 外观设置
  theme: 'light',            // 主题: 'light' | 'dark'
  scale: 1.0,                // 初始缩放比例
  rotation: 0,               // 初始旋转角度
  
  // 性能选项
  cacheSize: 10,             // 页面缓存数量
  preloadPages: 2,           // 预加载页面数
  
  // 自定义样式
  className: 'my-pdf-viewer',
  style: {
    backgroundColor: '#f5f5f5'
  }
})
```

### Vue 组件属性

```vue
<PdfViewer
  :src="pdfUrl"                    <!-- PDF文档URL或File对象 -->
  :enable-toolbar="true"           <!-- 显示工具栏 -->
  :enable-search="true"            <!-- 启用搜索 -->
  :enable-thumbnails="true"        <!-- 显示缩略图 -->
  :enable-text-selection="true"    <!-- 启用文本选择 -->
  :enable-annotations="true"       <!-- 显示注释 -->
  :theme="'light'"                 <!-- 主题 -->
  :scale="1.0"                     <!-- 缩放比例 -->
  :rotation="0"                    <!-- 旋转角度 -->
  :cache-size="10"                 <!-- 缓存大小 -->
  :preload-pages="2"               <!-- 预加载页面数 -->
  :class-name="'my-pdf-viewer'"    <!-- 自定义CSS类 -->
  @document-loaded="onDocumentLoaded"
  @page-changed="onPageChanged"
  @scale-changed="onScaleChanged"
  @rotation-changed="onRotationChanged"
  @search-completed="onSearchCompleted"
  @error="onError"
/>
```

## 加载不同类型的PDF

### 从URL加载

```javascript
await viewer.loadDocument('https://example.com/document.pdf')
```

### 从File对象加载

```javascript
const fileInput = document.getElementById('file-input')
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    await viewer.loadDocument(file)
  }
})
```

### 从ArrayBuffer加载

```javascript
const response = await fetch('path/to/document.pdf')
const arrayBuffer = await response.arrayBuffer()
await viewer.loadDocument(arrayBuffer)
```

### 从Uint8Array加载

```javascript
const uint8Array = new Uint8Array(arrayBuffer)
await viewer.loadDocument(uint8Array)
```

## 事件监听

```javascript
// 文档加载完成
viewer.on('documentLoaded', (info) => {
  console.log('文档信息:', info)
  // info: { numPages, title, author, subject, creator, producer, ... }
})

// 页面变化
viewer.on('pageChanged', ({ currentPage, totalPages }) => {
  console.log(`当前页: ${currentPage}/${totalPages}`)
})

// 缩放变化
viewer.on('scaleChanged', ({ scale, scaleMode }) => {
  console.log(`缩放: ${scale} (${scaleMode})`)
})

// 旋转变化
viewer.on('rotationChanged', ({ rotation }) => {
  console.log(`旋转: ${rotation}度`)
})

// 搜索完成
viewer.on('searchCompleted', ({ query, results, totalMatches }) => {
  console.log(`搜索"${query}"找到${totalMatches}个结果`)
})

// 错误处理
viewer.on('error', ({ error, context }) => {
  console.error(`${context}错误:`, error)
})
```

## 常用操作

### 页面导航

```javascript
// 跳转到指定页面
await viewer.goToPage(3)

// 下一页
await viewer.nextPage()

// 上一页
await viewer.previousPage()

// 获取当前页码
const currentPage = viewer.getCurrentPage()
const totalPages = viewer.getTotalPages()
```

### 缩放控制

```javascript
// 设置缩放比例
await viewer.setScale(1.5)

// 放大
await viewer.zoomIn()

// 缩小
await viewer.zoomOut()

// 适应宽度
await viewer.fitToWidth()

// 适应页面
await viewer.fitToPage()

// 获取当前缩放
const scale = viewer.getScale()
```

### 旋转控制

```javascript
// 顺时针旋转90度
await viewer.rotateClockwise()

// 逆时针旋转90度
await viewer.rotateCounterClockwise()

// 设置特定角度
await viewer.setRotation(180)

// 获取当前旋转角度
const rotation = viewer.getRotation()
```

### 搜索功能

```javascript
// 搜索文本
const results = await viewer.search('关键词')

// 查找下一个
const nextResult = await viewer.findNext()

// 查找上一个
const prevResult = await viewer.findPrevious()

// 清除搜索结果
viewer.clearSearch()

// 获取搜索结果
const searchResults = viewer.getSearchResults()
```

## 下一步

- [配置选项详解](/guide/configuration) - 了解所有配置选项
- [API 参考](/guide/api) - 查看完整的API文档
- [主题定制](/guide/theming) - 学习如何定制外观
- [插件开发](/guide/plugins) - 扩展功能
- [常见问题](/guide/faq) - 解决常见问题
