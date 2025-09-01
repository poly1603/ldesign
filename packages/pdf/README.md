# @ldesign/pdf

🚀 功能完整、高性能的 PDF 预览器库，支持多种框架集成！

[![npm version](https://badge.fury.io/js/@ldesign%2Fpdf.svg)](https://badge.fury.io/js/@ldesign%2Fpdf)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue%203-Supported-green.svg)](https://vuejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🎯 **框架无关**：支持原生 JavaScript、Vue 3 等多种框架
- 🔧 **TypeScript 支持**：完整的类型定义，确保类型安全
- 📱 **响应式设计**：完美适配桌面端和移动端
- ⚡ **高性能**：智能缓存、懒加载、页面预取
- 🎨 **高度可定制**：丰富的配置选项和主题支持
- 🔍 **功能丰富**：页面导航、缩放、旋转、搜索、缩略图、全屏等
- 🛡️ **稳定可靠**：基于 PDF.js，经过大量测试验证

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm
pnpm add @ldesign/pdf

# 使用 npm
npm install @ldesign/pdf

# 使用 yarn
yarn add @ldesign/pdf
```

### 基础使用

#### 原生 JavaScript

```javascript
import { createPdfViewer } from '@ldesign/pdf'
import '@ldesign/pdf/style.css'

const container = document.getElementById('pdf-container')
const viewer = createPdfViewer({
  container,
  enableToolbar: true,
  enableSearch: true,
  theme: 'light'
})

// 加载 PDF 文档
await viewer.loadDocument('path/to/document.pdf')

// 监听事件
viewer.on('documentLoaded', (info) => {
  console.log('文档已加载:', info)
})
```

#### Vue 3 组件方式

```vue
<template>
  <PdfViewer
    :src="pdfUrl"
    :enable-toolbar="true"
    :enable-search="true"
    :enable-thumbnails="true"
    :theme="'light'"
    @document-loaded="onDocumentLoaded"
    @page-changed="onPageChanged"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { PdfViewer } from '@ldesign/pdf/vue'
import '@ldesign/pdf/style.css'

const pdfUrl = 'path/to/document.pdf'

const onDocumentLoaded = (info) => {
  console.log('文档已加载:', info)
}

const onPageChanged = ({ currentPage, totalPages }) => {
  console.log(`当前页: ${currentPage}/${totalPages}`)
}

const onError = (error) => {
  console.error('PDF 加载错误:', error)
}
</script>
```

#### Vue 3 Hook 方式

```vue
<template>
  <div class="pdf-demo">
    <div class="toolbar">
      <button @click="previousPage" :disabled="!canGoPrevious">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="!canGoNext">下一页</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <button @click="rotate">旋转</button>
    </div>
    <div ref="containerRef" class="pdf-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePdfViewer } from '@ldesign/pdf/vue'
import '@ldesign/pdf/style.css'

const containerRef = ref<HTMLElement>()

const {
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  loadDocument,
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
    console.error('加载 PDF 失败:', err)
  }
})
</script>

<style scoped>
.pdf-demo {
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

.pdf-container {
  flex: 1;
}
</style>
```

## 📖 核心功能

### 文档加载

支持多种输入方式：

```javascript
// 从 URL 加载
await viewer.loadDocument('https://example.com/document.pdf')

// 从 File 对象加载
const file = document.querySelector('input[type="file"]').files[0]
await viewer.loadDocument(file)

// 从 ArrayBuffer 加载
const buffer = await fetch('document.pdf').then(r => r.arrayBuffer())
await viewer.loadDocument(buffer)

// 从 Uint8Array 加载
const uint8Array = new Uint8Array(buffer)
await viewer.loadDocument(uint8Array)
```

### 页面导航

```javascript
// 跳转到指定页面
await viewer.goToPage(5)

// 上一页
await viewer.previousPage()

// 下一页
await viewer.nextPage()

// 获取当前状态
const currentPage = viewer.getCurrentPage()
const totalPages = viewer.getTotalPages()
console.log(`当前页面: ${currentPage}/${totalPages}`)
```

### 缩放控制

```javascript
// 设置缩放比例
await viewer.setScale(1.5)

// 适应宽度
await viewer.fitToWidth()

// 适应页面
await viewer.fitToPage()

// 放大/缩小
await viewer.zoomIn()
await viewer.zoomOut()

// 获取当前缩放
const scale = viewer.getScale()
```

### 页面旋转

```javascript
// 顺时针旋转 90 度
await viewer.rotateClockwise()

// 逆时针旋转 90 度
await viewer.rotateCounterClockwise()

// 设置特定角度
await viewer.setRotation(180)

// 获取当前旋转角度
const rotation = viewer.getRotation()
```

### 文本搜索

```javascript
// 搜索文本
const results = await viewer.search('搜索关键词', {
  caseSensitive: false,
  wholeWords: false,
  highlightAll: true,
})

console.log(`找到 ${results.length} 个匹配项`)

// 查找下一个/上一个
const nextResult = await viewer.findNext()
const prevResult = await viewer.findPrevious()

// 清除搜索结果
viewer.clearSearch()
```

### 全屏模式

```javascript
// 进入全屏
await viewer.enterFullscreen()

// 退出全屏
await viewer.exitFullscreen()

// 检查全屏状态
const isFullscreen = viewer.isFullscreen()
```

### 下载和打印

```javascript
// 下载 PDF
viewer.download('my-document.pdf')

// 打印 PDF
viewer.print({
  pageRange: '1-5',
  quality: 'high'
})
```

## 🎨 配置选项

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

## 📱 响应式支持

PDF预览器完全支持响应式设计，在不同设备上都能完美显示：

```css
.pdf-container {
  width: 100%;
  height: 100vh;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .pdf-container {
    height: calc(100vh - 60px); /* 减去工具栏高度 */
  }
}
```

## 🎯 事件监听

```javascript
// 监听文档加载完成
viewer.on('documentLoaded', (info) => {
  console.log('文档信息:', info)
  // info: { numPages, title, author, subject, ... }
})

// 监听页面变化
viewer.on('pageChanged', ({ currentPage, totalPages }) => {
  console.log(`切换到页面: ${currentPage}/${totalPages}`)
})

// 监听缩放变化
viewer.on('scaleChanged', ({ scale, scaleMode }) => {
  console.log(`缩放变化: ${scale} (${scaleMode})`)
})

// 监听旋转变化
viewer.on('rotationChanged', ({ rotation }) => {
  console.log(`旋转变化: ${rotation}度`)
})

// 监听搜索完成
viewer.on('searchCompleted', ({ query, results, totalMatches }) => {
  console.log(`搜索"${query}"找到${totalMatches}个结果`)
})

// 监听错误
viewer.on('error', ({ error, context }) => {
  console.error(`${context}错误:`, error)
})
```

## 🔧 高级用法

### 自定义渲染

```javascript
import { PdfPageRenderer } from '@ldesign/pdf'

const renderer = new PdfPageRenderer()

// 自定义渲染选项
await renderer.renderPage(page, canvas, {
  scale: 2,
  rotation: 90,
  backgroundColor: '#f0f0f0',
  enableTextLayer: true,
  enableAnnotations: true
})
```

### 文档管理

```javascript
import { PdfDocumentManager } from '@ldesign/pdf'

const documentManager = new PdfDocumentManager()

// 加载文档
const document = await documentManager.loadDocument('path/to/document.pdf')

// 获取页面
const page = await documentManager.getPage(1)

// 预加载页面
await documentManager.preloadPages(1, 5)

// 获取文档信息
const info = await documentManager.getDocumentInfo()
```

## 🌟 最佳实践

### 1. 性能优化

```javascript
// 大文档优化配置
const viewer = createPdfViewer({
  container,
  cacheSize: 5,        // 减少缓存以节省内存
  preloadPages: 1,     // 减少预加载页面
  enableThumbnails: false,  // 禁用缩略图以提升性能
})

// 预加载相邻页面
viewer.on('pageChanged', async ({ currentPage }) => {
  const documentManager = viewer.getDocumentManager()
  await documentManager.preloadPages(currentPage - 1, currentPage + 1)
})
```

### 2. 错误处理

```javascript
try {
  await viewer.loadDocument(pdfUrl)
} catch (error) {
  if (error.message.includes('Invalid PDF')) {
    console.error('无效的 PDF 文件')
  } else if (error.message.includes('Network')) {
    console.error('网络错误，请检查连接')
  } else {
    console.error('加载失败:', error.message)
  }
}

// 监听运行时错误
viewer.on('error', ({ error, context }) => {
  console.error(`${context} 错误:`, error)
  // 根据错误类型进行相应处理
})
```

### 3. 内存管理

```javascript
// 组件销毁时清理资源
onUnmounted(async () => {
  await viewer.destroy()
})

// 定期清理缓存
setInterval(() => {
  viewer.clearPageCache()
}, 300000) // 每 5 分钟清理一次
```

## 📚 文档

- [📖 完整文档](./docs/index.md) - 详细的使用指南和 API 参考
- [🚀 快速开始](./docs/guide/getting-started.md) - 快速上手指南
- [⚙️ 配置选项](./docs/guide/configuration.md) - 所有配置选项说明
- [🔧 API 参考](./docs/guide/api.md) - 完整的 API 文档
- [❓ 常见问题](./docs/guide/faq.md) - 常见问题解答
- [📝 更新日志](./CHANGELOG.md) - 版本更新记录

## 📄 许可证

MIT License © 2024 ldesign

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 💖 支持

如果这个项目对你有帮助，请给我们一个 ⭐️！
