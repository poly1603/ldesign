# @ldesign/pdf

> 功能强大、高性能的PDF阅读器插件，支持Vue、React和原生JavaScript

[![npm version](https://img.shields.io/npm/v/@ldesign/pdf.svg)](https://www.npmjs.com/package/@ldesign/pdf)
[![license](https://img.shields.io/npm/l/@ldesign/pdf.svg)](https://github.com/ldesign/pdf/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@ldesign/pdf.svg)](https://www.npmjs.com/package/@ldesign/pdf)

## ✨ 特性

- ⚡️ **高性能渲染** - 虚拟滚动、智能缓存、Web Worker
- 🎨 **丰富配置** - 缩放、质量、布局等多种配置选项
- 🔌 **插件系统** - 强大的插件系统，轻松扩展功能
- 🛠️ **框架无关** - 支持Vue、React和原生JavaScript
- 📦 **开箱即用** - 内置工具栏、搜索、缩略图、打印下载等功能
- 🎯 **TypeScript** - 完整的TypeScript类型定义
- 🔍 **全文搜索** - 支持正则表达式、大小写敏感等高级搜索
- 📱 **响应式设计** - 自适应各种屏幕尺寸

## 📦 安装

```bash
# npm
npm install @ldesign/pdf pdfjs-dist

# yarn
yarn add @ldesign/pdf pdfjs-dist

# pnpm
pnpm add @ldesign/pdf pdfjs-dist
```

## ⚙️ Worker配置（重要！）

PDF.js需要Worker文件才能正常工作。有两种配置方式：

### 方式1：使用CDN（推荐，无需额外配置）

```javascript
workerSrc: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
```

### 方式2：使用本地文件

```bash
# 1. 复制worker文件到public目录
cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/

# 2. 在代码中引用
workerSrc: '/pdf.worker.min.js'
```

## 🚀 快速开始

### Vue 3

```vue
<template>
  <PDFViewer
    source="https://example.com/sample.pdf"
    :workerSrc="workerSrc"
  />
</template>

<script setup>
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

// 使用CDN Worker（推荐）
const workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
// 或使用本地文件: const workerSrc = '/pdf.worker.min.js';
</script>
```

### 原生 JavaScript

```javascript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  // 使用CDN Worker（推荐）
  workerSrc: 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  // 或使用本地文件: workerSrc: '/pdf.worker.min.js',
});

viewer.load('https://example.com/sample.pdf');
```

### 使用 Composable (Vue 3)

```vue
<template>
  <div>
    <div class="toolbar">
      <button @click="previousPage">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
    </div>
    <div ref="containerRef"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePDFViewer } from '@ldesign/pdf/vue';

const pdfSource = ref('https://example.com/sample.pdf');

const {
  containerRef,
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

## 📖 核心功能

### 页面导航

```javascript
viewer.goToPage(5);      // 跳转到第5页
viewer.nextPage();       // 下一页
viewer.previousPage();   // 上一页
```

### 缩放控制

```javascript
viewer.setScale(1.5);           // 设置缩放比例为150%
viewer.setScale('auto');        // 自动缩放
viewer.setScale('page-fit');    // 适应页面
viewer.setScale('page-width');  // 适应宽度
viewer.zoomIn();                // 放大
viewer.zoomOut();               // 缩小
```

### 页面旋转

```javascript
viewer.rotate(90);    // 旋转90度
viewer.rotate(-90);   // 逆时针旋转90度
```

### 搜索

```javascript
const results = await viewer.search('关键词', {
  caseSensitive: false,
  wholeWords: false,
});

console.log(`找到 ${results.length} 个匹配项`);
```

### 打印和下载

```javascript
// 打印
await viewer.print();

// 下载
viewer.download('my-document.pdf');
```

### 获取信息

```javascript
// 文档信息
const info = viewer.getDocumentInfo();
console.log(info.title, info.author, info.numPages);

// 页面信息
const pageInfo = viewer.getPageInfo(1);
console.log(pageInfo.width, pageInfo.height);

// 大纲
const outline = await viewer.getOutline();
```

### 缩略图

```javascript
const thumbnail = await viewer.getThumbnail(1);
document.body.appendChild(thumbnail);
```

## ⚙️ 配置选项

```javascript
const viewer = new PDFViewer({
  // 基础配置
  container: '#pdf-container',
  workerSrc: '...',
  scale: 'auto',              // 缩放模式
  quality: 'high',            // 渲染质量
  layout: 'continuous',       // 布局模式
  initialPage: 1,             // 初始页码

  // 缓存配置
  cache: {
    enabled: true,
    maxPages: 50,
    strategy: 'lru',          // 缓存策略: lru, fifo, lfu
    preloadPages: 3,
  },

  // 渲染配置
  render: {
    dpi: 150,
    useWorker: true,
    maxConcurrent: 5,
  },

  // 搜索配置
  search: {
    caseSensitive: false,
    wholeWords: false,
    regex: false,
  },

  // 缩略图配置
  thumbnail: {
    enabled: true,
    width: 150,
    height: 200,
    lazyLoad: true,
  },

  // 事件监听
  on: {
    loadComplete: (info) => console.log('加载完成', info),
    pageChange: (page) => console.log('页面切换', page),
    scaleChange: (scale) => console.log('缩放改变', scale),
  },
});
```

## 🔌 插件系统

```javascript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(viewer) {
    console.log('插件安装');
  },
  hooks: {
    beforeLoad: async (source) => {
      console.log('加载前');
    },
    afterLoad: async (doc) => {
      console.log('加载后');
    },
    beforeRender: async (page) => {
      console.log('渲染前');
    },
    afterRender: async (page, canvas) => {
      console.log('渲染后');
    },
  },
};

viewer.use(myPlugin);
```

## 🎯 事件系统

```javascript
// 监听事件
viewer.on('loadComplete', (info) => {
  console.log('文档加载完成', info);
});

viewer.on('pageChange', (page) => {
  console.log('当前页:', page);
});

viewer.on('scaleChange', (scale) => {
  console.log('缩放比例:', scale);
});

// 取消监听
viewer.off('pageChange', handler);
```

## 🎨 UI定制

### 隐藏默认工具栏

```vue
<PDFViewer
  :source="pdfUrl"
  :show-toolbar="false"
  :show-search="false"
/>
```

### 完全自定义

```vue
<template>
  <div>
    <!-- 自定义工具栏 -->
    <div class="my-toolbar">
      <button @click="previousPage">◀</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage">▶</button>
    </div>

    <!-- PDF容器 -->
    <div ref="containerRef"></div>
  </div>
</template>

<script setup>
import { usePDFViewer } from '@ldesign/pdf/vue';

const {
  containerRef,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
} = usePDFViewer(pdfSource);
</script>
```

## 📚 文档

完整文档请访问：[https://ldesign.github.io/pdf](https://ldesign.github.io/pdf)

- [快速开始](https://ldesign.github.io/pdf/guide/getting-started)
- [配置选项](https://ldesign.github.io/pdf/guide/configuration)
- [API参考](https://ldesign.github.io/pdf/api/)
- [示例](https://ldesign.github.io/pdf/examples/)

## 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/ldesign/pdf.git
cd pdf

# 安装依赖
pnpm install

# 运行Vue3示例
cd examples/vue3-demo
pnpm dev

# 构建库
pnpm build

# 运行文档
pnpm docs:dev

# 构建文档
pnpm docs:build
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md)。

## 📝 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [PDF.js](https://github.com/mozilla/pdf.js) - Mozilla的PDF渲染库
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [VitePress](https://vitepress.dev/) - 静态站点生成器

## 📊 浏览器支持

| Chrome | Edge | Firefox | Safari | Opera |
|--------|------|---------|--------|-------|
| 最新   | 最新 | 最新    | 最新   | 最新  |

## 🔗 相关链接

- [GitHub](https://github.com/ldesign/pdf)
- [npm](https://www.npmjs.com/package/@ldesign/pdf)
- [文档](https://ldesign.github.io/pdf)
- [Issues](https://github.com/ldesign/pdf/issues)
- [讨论区](https://github.com/ldesign/pdf/discussions)

## ⭐ Star History

如果这个项目对你有帮助，请给一个 ⭐️ Star！

---

Made with ❤️ by [ldesign](https://github.com/ldesign)
