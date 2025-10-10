# 快速启动指南

这是@ldesign/pdf的快速启动指南，帮助你在5分钟内开始使用。

## 安装

```bash
npm install @ldesign/pdf pdfjs-dist
# 或
yarn add @ldesign/pdf pdfjs-dist
# 或
pnpm add @ldesign/pdf pdfjs-dist
```

## 使用方式

### 1. Vue 3 (推荐)

**最简单的方式 - 使用组件：**

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

**完全控制 - 使用Composable：**

```vue
<template>
  <div>
    <div class="toolbar">
      <button @click="previousPage">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
    </div>
    <div ref="containerRef"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('https://example.com/sample.pdf');

const {
  containerRef,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
} = usePDFViewer(pdfUrl, {
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});
</script>
```

### 2. 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer</title>
</head>
<body>
  <div id="pdf-container" style="width: 100%; height: 600px;"></div>

  <script type="module">
    import { PDFViewer } from '@ldesign/pdf';

    const viewer = new PDFViewer({
      container: '#pdf-container',
      workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
    });

    viewer.load('https://example.com/sample.pdf');
  </script>
</body>
</html>
```

## 常用功能

### 页面导航

```javascript
viewer.goToPage(5);      // 跳转到第5页
viewer.nextPage();       // 下一页
viewer.previousPage();   // 上一页
```

### 缩放控制

```javascript
viewer.setScale(1.5);         // 150%
viewer.setScale('page-fit');  // 适应页面
viewer.zoomIn();              // 放大
viewer.zoomOut();             // 缩小
```

### 搜索

```javascript
const results = await viewer.search('关键词');
console.log(`找到 ${results.length} 个匹配项`);
```

### 打印和下载

```javascript
await viewer.print();
viewer.download('document.pdf');
```

## 配置选项

```javascript
const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: '...',

  // 显示配置
  scale: 'auto',           // 缩放模式
  quality: 'high',         // 渲染质量
  layout: 'continuous',    // 布局模式

  // 性能优化
  cache: {
    enabled: true,
    maxPages: 100,
    strategy: 'lru',
  },

  // 事件监听
  on: {
    loadComplete: (info) => console.log('加载完成', info),
    pageChange: (page) => console.log('页面切换', page),
  },
});
```

## 事件监听

```javascript
viewer.on('loadComplete', (info) => {
  console.log(`文档加载完成: ${info.numPages}页`);
});

viewer.on('pageChange', (page) => {
  console.log(`当前页: ${page}`);
});

viewer.on('scaleChange', (scale) => {
  console.log(`缩放比例: ${Math.round(scale * 100)}%`);
});
```

## Worker配置

**必须配置Worker路径，有两种方式：**

### 方式1: 使用CDN (推荐)

```javascript
workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
```

### 方式2: 本地文件

```javascript
// 1. 从node_modules复制worker文件到public目录
// 2. 引用本地路径
workerSrc: '/pdf.worker.min.js'
```

## 加载PDF

支持多种来源：

```javascript
// URL
await viewer.load('https://example.com/document.pdf');

// 本地文件
const file = document.querySelector('input[type=file]').files[0];
const url = URL.createObjectURL(file);
await viewer.load(url);

// ArrayBuffer
const response = await fetch('https://example.com/document.pdf');
const buffer = await response.arrayBuffer();
await viewer.load(buffer);
```

## 运行示例

### Vue 3 示例

```bash
cd examples/vue3-demo
pnpm install
pnpm dev
```

### 原生JS示例

```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

## 完整示例

### HTML + JavaScript

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer Demo</title>
  <style>
    #pdf-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ccc;
    }

    .controls {
      margin-bottom: 10px;
    }

    .controls button {
      padding: 8px 16px;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <h1>PDF Viewer Demo</h1>

  <div class="controls">
    <button id="prev-btn">上一页</button>
    <span id="page-info">1 / 1</span>
    <button id="next-btn">下一页</button>

    <button id="zoom-out-btn">缩小</button>
    <span id="scale-info">100%</span>
    <button id="zoom-in-btn">放大</button>

    <button id="print-btn">打印</button>
    <button id="download-btn">下载</button>
  </div>

  <div id="pdf-container"></div>

  <script type="module">
    import { PDFViewer } from 'https://cdn.jsdelivr.net/npm/@ldesign/pdf/+esm';

    const viewer = new PDFViewer({
      container: '#pdf-container',
      workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
      on: {
        loadComplete: (info) => {
          updateUI();
        },
        pageChange: (page) => {
          updateUI();
        },
        scaleChange: (scale) => {
          document.getElementById('scale-info').textContent =
            Math.round(scale * 100) + '%';
        },
      },
    });

    // 加载PDF
    viewer.load('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf');

    // 绑定按钮
    document.getElementById('prev-btn').onclick = () => viewer.previousPage();
    document.getElementById('next-btn').onclick = () => viewer.nextPage();
    document.getElementById('zoom-out-btn').onclick = () => viewer.zoomOut();
    document.getElementById('zoom-in-btn').onclick = () => viewer.zoomIn();
    document.getElementById('print-btn').onclick = () => viewer.print();
    document.getElementById('download-btn').onclick = () => viewer.download('document.pdf');

    function updateUI() {
      document.getElementById('page-info').textContent =
        `${viewer.currentPage} / ${viewer.totalPages}`;

      document.getElementById('prev-btn').disabled = viewer.currentPage <= 1;
      document.getElementById('next-btn').disabled = viewer.currentPage >= viewer.totalPages;
    }
  </script>
</body>
</html>
```

## 常见问题

### Worker加载失败

**问题**: 控制台报错 "Setting up fake worker failed"

**解决方案**: 确保正确配置了`workerSrc`：

```javascript
new PDFViewer({
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});
```

### PDF加载失败

**问题**: PDF无法加载

**解决方案**:
1. 检查PDF URL是否正确
2. 检查CORS配置（跨域问题）
3. 检查PDF文件是否损坏

### 性能问题

**问题**: 大型PDF加载缓慢

**解决方案**: 启用缓存和虚拟滚动：

```javascript
new PDFViewer({
  virtualScroll: true,
  cache: {
    enabled: true,
    maxPages: 100,
  },
});
```

## 下一步

- 📖 [完整文档](./docs/guide/index.md)
- 🎯 [API参考](./docs/api/index.md)
- 💡 [更多示例](./examples/)
- 🐛 [问题反馈](https://github.com/ldesign/pdf/issues)

## 获取帮助

- [GitHub Issues](https://github.com/ldesign/pdf/issues)
- [文档](https://ldesign.github.io/pdf)

---

现在你已经准备好开始使用 @ldesign/pdf 了！🎉
