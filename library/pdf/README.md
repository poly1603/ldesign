# @ldesign/pdf-viewer

<p align="center">
  <img src="https://img.shields.io/npm/v/@ldesign/pdf-viewer" alt="npm version">
  <img src="https://img.shields.io/npm/l/@ldesign/pdf-viewer" alt="license">
  <img src="https://img.shields.io/npm/dt/@ldesign/pdf-viewer" alt="downloads">
</p>

一个功能强大、易于使用的 PDF 查看器库，支持在任何前端框架中使用。

## ✨ 特性

- 🚀 **开箱即用** - 简单的 API 设计，快速集成
- 🎨 **高度可定制** - 丰富的配置选项，支持自定义工具栏和主题
- 🔌 **框架无关** - 支持 Vanilla JS、Vue、React 等任意框架
- ⚡️ **性能优越** - 智能缓存、虚拟滚动、按需渲染
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🔍 **功能丰富** - 页面导航、缩放、旋转、搜索、下载、打印

## 📦 安装

```bash
# pnpm
pnpm add @ldesign/pdf-viewer

# npm
npm install @ldesign/pdf-viewer

# yarn
yarn add @ldesign/pdf-viewer
```

## 🚀 快速开始

### Vanilla JavaScript

```javascript
import { PDFViewer } from '@ldesign/pdf-viewer'

const viewer = new PDFViewer({
  container: '#viewer',
  url: 'path/to/your.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})

viewer.on('document-loaded', (doc) => {
  console.log('Loaded', doc.numPages, 'pages')
})
```

### Vue 3

```vue
<template>
  <PDFViewer
    url="path/to/your.pdf"
    :worker-src="'/pdf.worker.min.mjs'"
    @document-loaded="onLoaded"
  />
</template>

<script setup>
import { PDFViewer } from '@ldesign/pdf-viewer/vue'

const onLoaded = (totalPages) => {
  console.log('Total pages:', totalPages)
}
</script>
```

## 📖 文档

完整文档请访问：[https://ldesign.github.io/pdf-viewer](https://ldesign.github.io/pdf-viewer)

- [快速开始](./docs/guide/quick-start.md)
- [API 参考](./docs/api/)
- [Vue 集成](./docs/guide/vue.md)
- [配置选项](./docs/guide/configuration.md)

## 🎯 核心功能

### 基础功能

- ✅ PDF 文档加载和渲染
- ✅ 页面导航（上一页、下一页、跳转）
- ✅ 缩放控制（放大、缩小、自适应）
- ✅ 页面旋转（90°、180°、270°）
- ✅ 文本选择和复制
- ✅ 全文搜索
- ✅ 下载和打印

### 高级功能

- ✅ 自定义工具栏
- ✅ 主题定制
- ✅ 事件系统
- ✅ 页面缓存管理
- ✅ 智能预渲染
- ✅ 加载进度显示

### 性能优化

- ✅ LRU 缓存策略
- ✅ 渲染任务管理
- ✅ 按需加载
- ⏳ 虚拟滚动（开发中）

## 💡 使用示例

### 加载不同来源的 PDF

```javascript
// 从 URL 加载
viewer.loadDocument('https://example.com/document.pdf')

// 从本地文件加载
const file = event.target.files[0]
const buffer = await file.arrayBuffer()
viewer.loadDocument(new Uint8Array(buffer))

// 从 Base64 加载
const base64 = 'JVBERi0xLjcKCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9n...'
const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
viewer.loadDocument(bytes)
```

### 页面操作

```javascript
// 跳转到指定页
await viewer.goToPage(5)

// 下一页
await viewer.nextPage()

// 上一页
await viewer.previousPage()

// 获取当前页码
const page = viewer.getCurrentPage()

// 获取总页数
const total = viewer.getTotalPages()
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
```

### 文本搜索

```javascript
const results = await viewer.search('keyword')

viewer.on('search-results', (results) => {
  console.log(`Found ${results.length} matches`)
  results.forEach(result => {
    console.log(`Page ${result.pageNumber}: ${result.text}`)
  })
})
```

### 自定义工具栏和主题

```javascript
const viewer = new PDFViewer({
  container: '#viewer',
  url: 'document.pdf',

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
    primaryColor: '#7c3aed',
    backgroundColor: '#1e293b',
    toolbarBackground: '#0f172a',
    textColor: '#f1f5f9'
  }
})
```

## 🔧 开发

### 克隆仓库

```bash
git clone https://github.com/ldesign/pdf-viewer.git
cd pdf-viewer
```

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 运行 vanilla-demo
pnpm dev

# 运行 vue3-demo
pnpm dev vue3-demo

# 运行文档
pnpm docs:dev
```

### 构建

```bash
# 构建库
pnpm build

# 构建所有（库 + 示例）
pnpm build:all

# 构建文档
pnpm docs:build
```

## 📁 项目结构

```
pdf-viewer/
├── src/                    # 源代码
│   ├── core/              # 核心功能
│   │   ├── DocumentManager.ts
│   │   ├── PageRenderer.ts
│   │   └── PDFViewer.ts
│   ├── adapters/          # 框架适配器
│   │   └── vue/           # Vue 3 适配器
│   ├── utils/             # 工具类
│   └── types/             # TypeScript 类型定义
├── examples/              # 示例项目
│   ├── vanilla-demo/      # Vanilla JS 示例
│   └── vue3-demo/         # Vue 3 示例
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

- 基于 [PDF.js](https://github.com/mozilla/pdf.js) 构建
- 灵感来自各种优秀的 PDF 查看器库

## 📮 联系方式

- 提交 Issue: [GitHub Issues](https://github.com/ldesign/pdf-viewer/issues)
- 邮箱: support@ldesign.com

---

<p align="center">Made with ❤️ by ldesign</p>
