# API 参考

## 🎯 核心 API

### PdfApi

PDF API是整个库的核心入口，提供了所有PDF处理的基础功能。

```typescript
import { PdfApi } from '@ldesign/pdf'

const api = new PdfApi({
  pdfjs: pdfJsLib,
  enableWorker: true,
  debug: false
})
```

#### 构造选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `pdfjs` | `object` | `undefined` | PDF.js库实例 |
| `enableWorker` | `boolean` | `true` | 是否启用Worker多线程 |
| `debug` | `boolean` | `false` | 是否启用调试模式 |
| `workerPoolSize` | `number` | `4` | Worker池大小 |
| `cacheOptions` | `CacheOptions` | 默认配置 | 缓存配置 |

#### 方法

##### `createPreview(source, options)`

创建PDF预览组件。

```typescript
const preview = await api.createPreview('document.pdf', {
  container: document.getElementById('pdf-container'),
  scale: 1.0,
  enableNavigation: true,
  enableZoom: true
})
```

**参数：**
- `source: PdfSource` - PDF数据源（URL、ArrayBuffer、File等）
- `options: PdfPreviewOptions` - 预览配置选项

**返回：** `Promise<PdfPreview>`

##### `renderPage(options)`

渲染单个PDF页面到Canvas。

```typescript
const result = await api.renderPage({
  source: 'document.pdf',
  pageNumber: 1,
  canvas: canvasElement,
  scale: 2.0,
  rotation: 90
})
```

**参数：**
- `options: RenderPageOptions` - 渲染配置

**返回：** `Promise<RenderResult>`

##### `getDocumentInfo(source)`

获取PDF文档基本信息。

```typescript
const info = await api.getDocumentInfo('document.pdf')
console.log(`文档共有 ${info.numPages} 页`)
```

**返回：** `Promise<DocumentInfo>`

##### `extractText(source, pages)`

提取PDF文本内容。

```typescript
// 提取单页文本
const textContent = await api.extractText('document.pdf', 1)

// 提取多页文本
const textContents = await api.extractText('document.pdf', [1, 2, 3])
```

**参数：**
- `source: PdfSource` - PDF数据源
- `pages: number | number[]` - 页码或页码数组

**返回：** `Promise<TextContent | TextContent[]>`

---

## 🎨 预览组件

### PdfPreview

PDF预览组件提供完整的文档浏览功能。

```typescript
interface PdfPreview {
  // 属性
  totalPages: number
  currentPage: number
  scale: number
  rotation: number
  
  // 方法
  nextPage(): Promise<void>
  prevPage(): Promise<void>
  goToPage(page: number): Promise<void>
  zoomIn(): void
  zoomOut(): void
  resetZoom(): void
  rotate(angle: number): void
  destroy(): void
  
  // 事件
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}
```

#### 导航方法

```typescript
// 翻页
await preview.nextPage()
await preview.prevPage()
await preview.goToPage(5)

// 缩放
preview.zoomIn()     // 放大
preview.zoomOut()    // 缩小
preview.resetZoom()  // 重置缩放

// 旋转
preview.rotate(90)   // 顺时针旋转90度
```

#### 事件监听

```typescript
preview.on('pageChange', (page) => {
  console.log(`当前页: ${page}`)
})

preview.on('zoomChange', (scale) => {
  console.log(`缩放比例: ${scale}`)
})

preview.on('error', (error) => {
  console.error('预览错误:', error)
})
```

---

## 🧩 Vue 3 集成

### 组合式 API

#### `usePdfViewer(options)`

Vue 3 组合式 API，提供响应式的PDF查看功能。

```vue
<script setup>
import { usePdfViewer } from '@ldesign/pdf/vue'

const container = ref()
const { 
  loading, 
  error, 
  totalPages, 
  currentPage,
  nextPage,
  prevPage,
  zoomIn,
  zoomOut 
} = usePdfViewer({
  source: 'document.pdf',
  container
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }}</div>
    <div v-else>
      <div ref="container"></div>
      <div class="controls">
        <button @click="prevPage" :disabled="currentPage <= 1">
          上一页
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage >= totalPages">
          下一页
        </button>
        <button @click="zoomIn">放大</button>
        <button @click="zoomOut">缩小</button>
      </div>
    </div>
  </div>
</template>
```

#### `usePdfRenderer()`

专门用于PDF页面渲染的组合函数。

```vue
<script setup>
import { usePdfRenderer } from '@ldesign/pdf/vue'

const canvas = ref()
const { renderPage, renderProgress, isRendering } = usePdfRenderer()

const handleRender = async () => {
  await renderPage({
    source: 'document.pdf',
    pageNumber: 1,
    canvas: canvas.value,
    scale: 1.5
  })
}
</script>

<template>
  <div>
    <canvas ref="canvas"></canvas>
    <div v-if="isRendering">
      渲染进度: {{ renderProgress }}%
    </div>
    <button @click="handleRender">渲染页面</button>
  </div>
</template>
```

### 组件

#### `<PdfViewer>`

Vue 3 PDF查看器组件。

```vue
<template>
  <PdfViewer
    :source="pdfSource"
    :scale="1.2"
    :page="currentPage"
    @load="onPdfLoad"
    @error="onPdfError"
    @page-change="onPageChange"
  />
</template>

<script setup>
import { PdfViewer } from '@ldesign/pdf/vue'

const pdfSource = ref('document.pdf')
const currentPage = ref(1)

const onPdfLoad = (info) => {
  console.log(`PDF加载完成，共 ${info.numPages} 页`)
}

const onPdfError = (error) => {
  console.error('PDF加载失败:', error)
}

const onPageChange = (page) => {
  currentPage.value = page
}
</script>
```

#### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `source` | `PdfSource` | - | PDF数据源 |
| `scale` | `number` | `1.0` | 缩放比例 |
| `page` | `number` | `1` | 当前页码 |
| `rotation` | `number` | `0` | 旋转角度 |
| `enableNavigation` | `boolean` | `true` | 是否启用导航 |
| `enableZoom` | `boolean` | `true` | 是否启用缩放 |

#### 事件

| 事件 | 参数 | 描述 |
|------|------|------|
| `load` | `DocumentInfo` | 文档加载完成 |
| `error` | `Error` | 加载或渲染错误 |
| `page-change` | `number` | 页码变化 |
| `zoom-change` | `number` | 缩放变化 |

### 指令

#### `v-pdf`

PDF指令，可以直接在元素上应用PDF功能。

```vue
<template>
  <div v-pdf="{ source: 'document.pdf', page: 1 }"></div>
</template>
```

---

## ⚡ 高级功能

### 缓存管理

```typescript
// 获取缓存统计
const stats = api.getCacheStats()
console.log(`缓存命中率: ${stats.hitRate}%`)

// 清理缓存
api.clearCache()

// 调整缓存大小
api.resizeCache(200 * 1024 * 1024, 2000) // 200MB, 2000项
```

### 性能监控

```typescript
// 启用性能监控
const api = new PdfApi({
  enablePerformanceMonitoring: true
})

// 获取性能指标
const metrics = api.getPerformanceMetrics()
console.log('加载时间:', metrics.loadTime)
console.log('渲染时间:', metrics.renderTime)
console.log('内存使用:', metrics.memoryUsage)
```

### Worker 管理

```typescript
// 配置Worker池
const api = new PdfApi({
  enableWorker: true,
  workerPoolSize: 8,
  workerScript: '/custom-pdf.worker.js'
})

// 获取Worker统计
const workerStats = api.getWorkerStatistics()
console.log('活跃Worker数:', workerStats.activeWorkers)
console.log('队列任务数:', workerStats.queuedTasks)
```

---

## 🎯 类型定义

### 核心类型

```typescript
// PDF数据源
type PdfSource = string | ArrayBuffer | Uint8Array | File

// 渲染选项
interface RenderOptions {
  scale?: number
  rotation?: number
  background?: string
  enableWebGL?: boolean
  renderTextLayer?: boolean
  renderAnnotations?: boolean
}

// 文档信息
interface DocumentInfo {
  numPages: number
  fingerprint: string
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}

// 文本内容
interface TextContent {
  items: TextItem[]
  styles: Record<string, TextStyle>
}

interface TextItem {
  str: string
  dir: string
  width: number
  height: number
  transform: number[]
  fontName: string
}
```

### 错误类型

```typescript
// PDF错误
interface PdfError extends Error {
  code: ErrorCode
  details?: any
  recoverable?: boolean
}

// 错误代码
enum ErrorCode {
  LOAD_ERROR = 'LOAD_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  INVALID_PDF = 'INVALID_PDF'
}
```

---

## 🚀 最佳实践

### 性能优化

1. **启用Worker多线程处理**
```typescript
const api = new PdfApi({
  enableWorker: true,
  workerPoolSize: navigator.hardwareConcurrency || 4
})
```

2. **合理配置缓存**
```typescript
const api = new PdfApi({
  cacheOptions: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxItems: 1000,
    ttl: 30 * 60 * 1000 // 30分钟
  }
})
```

3. **预加载关键页面**
```typescript
// 预加载第一页和下一页
await Promise.all([
  api.renderPage({ source, pageNumber: 1, canvas: canvas1 }),
  api.renderPage({ source, pageNumber: 2, canvas: canvas2 })
])
```

### 错误处理

```typescript
try {
  const preview = await api.createPreview(source, options)
} catch (error) {
  if (error.code === ErrorCode.PASSWORD_REQUIRED) {
    // 处理密码保护的PDF
    const password = await promptForPassword()
    const preview = await api.createPreview(source, { 
      ...options, 
      password 
    })
  } else if (error.recoverable) {
    // 可恢复的错误，尝试重试
    setTimeout(() => retry(), 1000)
  } else {
    // 不可恢复的错误
    showError(error.message)
  }
}
```

### 内存管理

```typescript
// 及时销毁不需要的预览
preview.destroy()

// 定期清理缓存
setInterval(() => {
  api.clearCache()
}, 10 * 60 * 1000) // 每10分钟清理一次

// 监控内存使用
const metrics = api.getPerformanceMetrics()
if (metrics.memoryUsage > 200 * 1024 * 1024) { // 200MB
  api.clearCache()
}
```
}, 10 * 60 * 1000) // 每10分钟清理一次

// 监控内存使用
const metrics = api.getPerformanceMetrics()
if (metrics.memoryUsage > 200 * 1024 * 1024) { // 200MB
  api.clearCache()
}
```