# @ldesign/pdf 项目总结

## 项目概述

@ldesign/pdf 是一个功能强大、高性能的PDF阅读器插件，基于Mozilla的PDF.js构建，提供丰富的功能和优秀的开发体验。

## 核心特性

### ⚡️ 高性能
- **虚拟滚动**: 只渲染可见区域的页面
- **智能缓存**: 支持LRU、FIFO、LFU等多种缓存策略
- **Web Worker**: 后台线程处理PDF解析
- **页面预加载**: 智能预加载相邻页面

### 🎯 功能完善
- **多种缩放模式**: 自动、适应页面、适应宽度等
- **全文搜索**: 支持正则表达式、大小写敏感
- **缩略图导航**: 快速预览和跳转
- **打印和下载**: 一键打印和下载
- **文本选择**: 支持文本选择和复制
- **书签/大纲**: 显示文档大纲结构

### 🛠️ 框架无关
- **Vue 3**: 提供组件和Composable
- **React**: (开发中)
- **原生JS**: 直接使用核心API

### 🎨 高度可配置
- 渲染质量配置
- 缓存策略配置
- 搜索选项配置
- 打印选项配置
- 插件系统支持

## 项目结构

```
pdf/
├── src/                          # 源代码
│   ├── core/                     # 核心类
│   │   ├── PDFViewer.ts         # 主查看器类
│   │   ├── DocumentManager.ts   # 文档管理器
│   │   └── PageRenderer.ts      # 页面渲染器
│   ├── types/                    # 类型定义
│   │   └── index.ts             # 完整的TypeScript类型
│   ├── utils/                    # 工具类
│   │   ├── EventEmitter.ts      # 事件发射器
│   │   └── CacheManager.ts      # 缓存管理器
│   ├── adapters/                 # 框架适配器
│   │   └── vue/                 # Vue 3适配器
│   │       ├── PDFViewer.vue    # Vue组件
│   │       ├── usePDFViewer.ts  # Composable
│   │       └── index.ts         # 导出
│   └── index.ts                 # 主入口
├── examples/                     # 示例项目
│   ├── vue3-demo/               # Vue 3示例
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── demos/           # 各种示例
│   │   │       ├── BasicDemo.vue
│   │   │       ├── AdvancedDemo.vue
│   │   │       ├── ComposableDemo.vue
│   │   │       └── CustomToolbarDemo.vue
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── vanilla-demo/            # 原生JS示例
│       ├── index.html
│       ├── main.js
│       ├── style.css
│       ├── package.json
│       └── vite.config.js
├── docs/                        # VitePress文档
│   ├── .vitepress/
│   │   └── config.ts           # VitePress配置
│   ├── index.md                # 首页
│   ├── guide/                  # 指南
│   │   ├── index.md           # 介绍
│   │   ├── getting-started.md # 快速开始
│   │   ├── basic-usage.md     # 基础用法
│   │   ├── configuration.md   # 配置选项
│   │   └── vue.md             # Vue集成
│   └── api/                    # API文档
│       ├── index.md           # API概览
│       ├── pdf-viewer.md      # PDFViewer API
│       └── config.md          # 配置API
├── package.json                # 包配置
├── vite.config.ts              # 构建配置
├── tsconfig.json               # TypeScript配置
├── README.md                   # 项目说明
└── LICENSE                     # 许可证

```

## 技术栈

### 核心技术
- **TypeScript**: 提供完整的类型安全
- **PDF.js**: Mozilla的PDF渲染库
- **Vite**: 构建工具

### Vue生态
- **Vue 3**: 前端框架
- **Composition API**: Vue 3的组合式API
- **VitePress**: 文档站点生成器

## 核心架构

### 1. PDFViewer (核心类)
负责整体协调和API暴露。

主要方法：
- `load()` - 加载PDF
- `goToPage()` - 页面导航
- `setScale()` - 缩放控制
- `search()` - 文本搜索
- `print()` / `download()` - 打印下载

### 2. DocumentManager (文档管理)
负责PDF文档的加载和管理。

功能：
- 加载不同格式的PDF源
- 管理PDF文档生命周期
- 处理加载进度

### 3. PageRenderer (页面渲染)
负责PDF页面的渲染。

功能：
- Canvas渲染
- 渲染任务管理
- 渲染优化

### 4. CacheManager (缓存管理)
负责页面缓存。

支持策略：
- LRU (Least Recently Used)
- FIFO (First In First Out)
- LFU (Least Frequently Used)

### 5. EventEmitter (事件系统)
提供事件发布订阅功能。

支持事件：
- `loadStart` / `loadComplete` / `loadError`
- `pageChange`
- `scaleChange`
- `renderStart` / `renderComplete`
- 等等...

## Vue适配器

### 组件方式
```vue
<PDFViewer
  :source="pdfUrl"
  :workerSrc="workerSrc"
  @pageChange="handlePageChange"
/>
```

### Composable方式
```typescript
const {
  containerRef,
  loading,
  currentPage,
  totalPages,
  nextPage,
  previousPage,
} = usePDFViewer(pdfUrl, options);
```

## 使用示例

### 原生JavaScript
```javascript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: '...',
  scale: 'auto',
});

await viewer.load('document.pdf');
```

### Vue 3
```vue
<template>
  <PDFViewer :source="pdfUrl" :workerSrc="workerSrc" />
</template>

<script setup>
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = ref('document.pdf');
const workerSrc = '...';
</script>
```

## 插件系统

支持自定义插件扩展功能：

```javascript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(viewer) {
    console.log('插件安装');
  },
  hooks: {
    beforeLoad: async (source) => {
      // 加载前钩子
    },
    afterLoad: async (doc) => {
      // 加载后钩子
    },
    beforeRender: async (page) => {
      // 渲染前钩子
    },
    afterRender: async (page, canvas) => {
      // 渲染后钩子
    },
  },
};

viewer.use(myPlugin);
```

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 构建库
```bash
pnpm build
```

### 运行Vue3示例
```bash
cd examples/vue3-demo
pnpm install
pnpm dev
```

### 运行原生JS示例
```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

### 运行文档
```bash
pnpm docs:dev
```

### 构建文档
```bash
pnpm docs:build
```

## 配置选项

### 基础配置
- `container` - 容器元素
- `workerSrc` - Worker路径
- `scale` - 缩放模式
- `quality` - 渲染质量
- `layout` - 布局模式

### 性能配置
- `cache` - 缓存配置
- `render` - 渲染配置
- `virtualScroll` - 虚拟滚动

### 功能配置
- `search` - 搜索配置
- `thumbnail` - 缩略图配置
- `print` - 打印配置

详见[配置文档](/docs/api/config.md)。

## API文档

### 核心API
- [PDFViewer](/docs/api/pdf-viewer.md) - 主类API
- [配置选项](/docs/api/config.md) - 完整配置
- [类型定义](/src/types/index.ts) - TypeScript类型

### Vue API
- [PDFViewer组件](/docs/api/vue-component.md) - Vue组件
- [usePDFViewer](/docs/api/use-pdf-viewer.md) - Composable

## 性能优化

### 虚拟滚动
只渲染可见页面，减少DOM节点和内存占用。

### 智能缓存
根据策略缓存已渲染页面，避免重复渲染。

### Web Worker
在后台线程处理PDF解析，不阻塞UI。

### 页面预加载
预加载相邻页面，提升翻页体验。

### Canvas优化
优化Canvas渲染，支持高DPI显示。

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Opera (最新版本)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 相关链接

- [GitHub仓库](https://github.com/ldesign/pdf)
- [npm包](https://www.npmjs.com/package/@ldesign/pdf)
- [在线文档](https://ldesign.github.io/pdf)
- [问题反馈](https://github.com/ldesign/pdf/issues)

## 致谢

- [PDF.js](https://github.com/mozilla/pdf.js) - Mozilla的PDF渲染库
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [VitePress](https://vitepress.dev/) - 静态站点生成器

---

Made with ❤️ by ldesign
