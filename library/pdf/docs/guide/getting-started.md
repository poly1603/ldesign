# 快速开始

## 安装

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

## 基础使用

### Vue 3

#### 使用组件

```vue
<template>
  <div class="pdf-container">
    <PDFViewer
      :source="pdfUrl"
      :workerSrc="workerSrc"
      @pageChange="handlePageChange"
      @loadComplete="handleLoadComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('https://example.com/sample.pdf');
const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

const handlePageChange = (page: number) => {
  console.log('当前页:', page);
};

const handleLoadComplete = (info: any) => {
  console.log('文档加载完成:', info);
};
</script>

<style>
.pdf-container {
  width: 100%;
  height: 100vh;
}
</style>
```

#### 使用 Composable

```vue
<template>
  <div class="pdf-viewer">
    <div class="toolbar">
      <button @click="previousPage" :disabled="currentPage <= 1">
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">
        下一页
      </button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
    </div>

    <div v-if="loading">加载中... {{ Math.round(progress * 100) }}%</div>
    <div v-if="error">错误: {{ error.message }}</div>
    <div ref="containerRef" class="pdf-content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfSource = ref('https://example.com/sample.pdf');

const {
  containerRef,
  loading,
  progress,
  error,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
  zoomIn,
  zoomOut,
} = usePDFViewer(pdfSource, {
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});
</script>
```

#### 全局注册

```typescript
// main.ts
import { createApp } from 'vue';
import { PDFViewerPlugin } from '@ldesign/pdf/vue';
import App from './App.vue';

const app = createApp(App);

app.use(PDFViewerPlugin);

app.mount('#app');
```

```vue
<!-- App.vue -->
<template>
  <PDFViewer :source="pdfUrl" :workerSrc="workerSrc" />
</template>
```

### 原生 JavaScript

```javascript
import { PDFViewer } from '@ldesign/pdf';

// 创建实例
const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
  on: {
    loadComplete: (info) => {
      console.log('文档加载完成:', info);
    },
    pageChange: (page) => {
      console.log('当前页:', page);
    },
  },
});

// 加载PDF
viewer.load('https://example.com/sample.pdf');

// 控制方法
viewer.nextPage();
viewer.previousPage();
viewer.setScale(1.5);
viewer.zoomIn();
viewer.zoomOut();

// 销毁
viewer.destroy();
```

### TypeScript

```typescript
import { PDFViewer, type PDFViewerConfig } from '@ldesign/pdf';

const config: PDFViewerConfig = {
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 1.2,
  quality: 'high',
  cache: {
    enabled: true,
    maxPages: 50,
    strategy: 'lru',
  },
};

const viewer = new PDFViewer(config);
viewer.load('https://example.com/sample.pdf');
```

## Worker配置

PDF.js需要一个worker文件来处理PDF解析。有两种方式配置：

### CDN方式（推荐）

```javascript
const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

// 或者使用unpkg
const workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
```

### 本地文件方式

```javascript
// 从node_modules复制worker文件到public目录
// 然后引用
const workerSrc = '/pdf.worker.min.js';
```

## 加载PDF

支持多种PDF来源：

### URL

```javascript
viewer.load('https://example.com/sample.pdf');
```

### 本地文件

```javascript
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  viewer.load(url);
});
```

### ArrayBuffer

```javascript
fetch('https://example.com/sample.pdf')
  .then(res => res.arrayBuffer())
  .then(buffer => viewer.load(buffer));
```

### Uint8Array

```javascript
const data = new Uint8Array([...]); // PDF数据
viewer.load(data);
```

## 下一步

- [基础用法](/guide/basic-usage) - 学习基本使用方法
- [配置选项](/guide/configuration) - 了解所有配置选项
- [事件系统](/guide/events) - 了解如何使用事件
- [API 参考](/api/) - 查看完整的API文档
