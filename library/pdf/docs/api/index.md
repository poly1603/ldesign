# API 参考

本节提供完整的 API 参考文档。

## 核心类

- [PDFViewer](./pdf-viewer) - 主要的查看器类
- [DocumentManager](./document-manager) - 文档管理类
- [PageRenderer](./page-renderer) - 页面渲染类

## Vue 适配器

- [PDFViewer 组件](./vue) - Vue 3 组件
- [usePDFViewer](./vue#usepdfviewer) - Composable API

## 类型定义

- [Types](./types) - TypeScript 类型定义

## 快速链接

### 常用方法

- [loadDocument](./pdf-viewer#loaddocument) - 加载PDF文档
- [goToPage](./pdf-viewer#gotopage) - 跳转到指定页
- [setZoom](./pdf-viewer#setzoom) - 设置缩放
- [search](./pdf-viewer#search) - 搜索文本

### 常用事件

- [document-loaded](./pdf-viewer#document-loaded) - 文档加载完成
- [page-changed](./pdf-viewer#page-changed) - 页码改变
- [zoom-changed](./pdf-viewer#zoom-changed) - 缩放改变

## 示例代码

```typescript
import { PDFViewer } from '@ldesign/pdf-viewer'

const viewer = new PDFViewer({
  container: '#viewer',
  url: 'document.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})

// 监听事件
viewer.on('document-loaded', (doc) => {
  console.log('Loaded', doc.numPages, 'pages')
})

// 页面导航
await viewer.goToPage(5)
await viewer.nextPage()

// 缩放控制
viewer.setZoom('in')
viewer.setZoom(1.5)

// 搜索
const results = await viewer.search('keyword')

// 清理
await viewer.destroy()
```
