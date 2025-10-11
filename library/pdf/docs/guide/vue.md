# Vue 3 集成指南

本指南详细介绍如何在 Vue 3 项目中使用 @ldesign/pdf-viewer。

## 安装

```bash
pnpm add @ldesign/pdf-viewer
```

## 两种使用方式

### 方式一：PDF Viewer 组件

最简单的方式是直接使用 Vue 组件。

#### 基础用法

```vue
<template>
  <PDFViewer
    :url="pdfUrl"
    :worker-src="'/pdf.worker.min.mjs'"
  />
</template>

<script setup>
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = ref('/sample.pdf')
</script>
```

#### 完整配置

```vue
<template>
  <PDFViewer
    :url="pdfUrl"
    :scale="1.2"
    :page="1"
    :enable-toolbar="true"
    :enable-search="true"
    :enable-text-selection="true"
    :worker-src="'/pdf.worker.min.mjs'"
    :toolbar="{
      showZoom: true,
      showPageNav: true,
      showDownload: true,
      showPrint: true,
      showRotate: true
    }"
    :theme="{
      primaryColor: '#0969da',
      backgroundColor: '#525659'
    }"
    @document-loaded="onDocumentLoaded"
    @page-changed="onPageChanged"
    @zoom-changed="onZoomChanged"
    @error="onError"
  />
</template>

<script setup>
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const pdfUrl = ref('/sample.pdf')

const onDocumentLoaded = (totalPages) => {
  console.log('文档已加载，总页数:', totalPages)
}

const onPageChanged = (pageNumber) => {
  console.log('当前页:', pageNumber)
}

const onZoomChanged = (zoom) => {
  console.log('缩放比例:', zoom)
}

const onError = (error) => {
  console.error('PDF错误:', error)
}
</script>
```

#### Props

| Prop | ���型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string \| Uint8Array` | - | PDF文件URL或数据 |
| `scale` | `number` | `1.0` | 初始缩放比例 |
| `page` | `number` | `1` | 初始页码 |
| `enableToolbar` | `boolean` | `true` | 是否显示工具栏 |
| `enableSearch` | `boolean` | `true` | 是否启用搜索 |
| `enableTextSelection` | `boolean` | `true` | 是否启用文本选择 |
| `workerSrc` | `string` | - | Worker文件路径 |
| `toolbar` | `ToolbarConfig` | - | 工具栏配置 |
| `theme` | `ThemeConfig` | - | 主题配置 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `document-loaded` | `(totalPages: number)` | 文档加载完成 |
| `page-changed` | `(pageNumber: number)` | 页码改变 |
| `zoom-changed` | `(zoom: number)` | 缩放改变 |
| `error` | `(error: Error)` | 发生错误 |

#### 方法暴露

通过 `ref` 可以访问组件暴露的方法：

```vue
<template>
  <div>
    <button @click="handleZoomIn">放大</button>
    <button @click="handleNextPage">下一页</button>

    <PDFViewer
      ref="viewerRef"
      :url="pdfUrl"
      :worker-src="'/pdf.worker.min.mjs'"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const viewerRef = ref()
const pdfUrl = ref('/sample.pdf')

const handleZoomIn = () => {
  viewerRef.value?.setZoom('in')
}

const handleNextPage = () => {
  viewerRef.value?.nextPage()
}
</script>
```

### 方式二：usePDFViewer Composable

如果需要更灵活的控制，可以使用 `usePDFViewer` Composable。

#### 基础用法

```vue
<template>
  <div>
    <div class="controls">
      <button @click="previousPage" :disabled="currentPage <= 1">
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">
        下一页
      </button>
      <button @click="setZoom('in')">放大</button>
      <button @click="setZoom('out')">缩小</button>
    </div>

    <div v-if="loading">加载中...</div>
    <div v-if="error" class="error">{{ error.message }}</div>

    <div ref="containerRef" class="viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePDFViewer } from '@ldesign/pdf-viewer/vue'

const containerRef = ref()

const {
  viewer,
  currentPage,
  totalPages,
  currentZoom,
  loading,
  error,
  init,
  loadDocument,
  nextPage,
  previousPage,
  setZoom
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs',
  enableToolbar: true
})

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
    await loadDocument('/sample.pdf')
  }
})
</script>

<style scoped>
.viewer {
  width: 100%;
  height: 600px;
}

.error {
  color: red;
  padding: 16px;
}
</style>
```

#### 返回值

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `viewer` | `Ref<PDFViewer \| null>` | 查看器实例 |
| `currentPage` | `Ref<number>` | 当前页码 |
| `totalPages` | `Ref<number>` | 总页数 |
| `currentZoom` | `Ref<number>` | 当前缩放比例 |
| `loading` | `Ref<boolean>` | 是否正在加载 |
| `loadingProgress` | `Ref<LoadProgress \| null>` | 加载进度 |
| `error` | `Ref<Error \| null>` | 错误信息 |
| `searchResults` | `Ref<SearchResult[]>` | 搜索结果 |
| `init` | `(container: HTMLElement) => Promise<void>` | 初始化查看器 |
| `loadDocument` | `(url: string \| Uint8Array) => Promise<void>` | 加载文档 |
| `goToPage` | `(page: number) => Promise<void>` | 跳转到指定页 |
| `nextPage` | `() => Promise<void>` | 下一页 |
| `previousPage` | `() => Promise<void>` | 上一页 |
| `setZoom` | `(zoom: ZoomType) => void` | 设置缩放 |
| `rotate` | `(angle: RotationAngle) => void` | 旋转页面 |
| `search` | `(text: string) => Promise<void>` | 搜索文本 |
| `download` | `(filename?: string) => void` | 下载PDF |
| `print` | `() => void` | 打印PDF |
| `destroy` | `() => Promise<void>` | 销毁查看器 |

## 高级示例

### 文件上传

```vue
<template>
  <div>
    <input type="file" accept=".pdf" @change="handleFileUpload" />
    <div ref="containerRef" class="viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePDFViewer } from '@ldesign/pdf-viewer/vue'

const containerRef = ref()

const {
  init,
  loadDocument
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs'
})

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    await loadDocument(uint8Array)
  }
}

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
  }
})
</script>
```

### 搜索功能

```vue
<template>
  <div>
    <div class="search-box">
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索..."
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">搜索</button>
    </div>

    <div v-if="searchResults.length > 0" class="results">
      <h3>找到 {{ searchResults.length }} 个结果</h3>
      <ul>
        <li v-for="(result, index) in searchResults" :key="index">
          <span>第 {{ result.pageNumber }} 页</span>
          <button @click="goToPage(result.pageNumber)">跳转</button>
        </li>
      </ul>
    </div>

    <div ref="containerRef" class="viewer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePDFViewer } from '@ldesign/pdf-viewer/vue'

const containerRef = ref()
const searchText = ref('')

const {
  searchResults,
  init,
  loadDocument,
  goToPage,
  search
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs'
})

const handleSearch = async () => {
  if (searchText.value.trim()) {
    await search(searchText.value.trim())
  }
}

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
    await loadDocument('/sample.pdf')
  }
})
</script>
```

## TypeScript 支持

库完全支持 TypeScript：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  usePDFViewer,
  type UsePDFViewerOptions
} from '@ldesign/pdf-viewer/vue'

const containerRef = ref<HTMLElement>()

const options: UsePDFViewerOptions = {
  workerSrc: '/pdf.worker.min.mjs',
  enableToolbar: true,
  scale: 1.0
}

const {
  currentPage,
  totalPages,
  init,
  loadDocument
} = usePDFViewer(options)

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
    await loadDocument('/sample.pdf')
  }
})
</script>
```

## 注意事项

1. **Worker 文件**: 确保正确配置 worker 文件路径
2. **容器高度**: 确保容器有明确的高度，否则PDF可能无法显示
3. **响应式**: 组件会自动适应容器大小
4. **内存管理**: 组件卸载时会自动清理资源

## 更多示例

查看 [examples/vue3-demo](https://github.com/ldesign/pdf-viewer/tree/main/examples/vue3-demo) 获取更多完整示例。
