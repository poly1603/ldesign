# API 参考

## 概览

@ldesign/pdf 提供了丰富的API接口，包括：

- **核心API**: PDFViewer类和相关方法
- **Vue API**: Vue组件和Composable
- **React API**: React组件和Hooks (开发中)
- **类型定义**: 完整的TypeScript类型

## 导入方式

### 核心库

```typescript
import { PDFViewer } from '@ldesign/pdf';
```

### Vue 3

```typescript
// 组件
import { PDFViewerComponent } from '@ldesign/pdf/vue';

// Composable
import { usePDFViewer } from '@ldesign/pdf/vue';

// 插件
import { PDFViewerPlugin } from '@ldesign/pdf/vue';
```

### 类型

```typescript
import type {
  PDFViewerConfig,
  PDFViewerAPI,
  DocumentInfo,
  PageInfo,
  SearchResult,
  // ... 更多类型
} from '@ldesign/pdf';
```

## 快速链接

- [PDFViewer 类](/api/pdf-viewer) - 核心PDF查看器类
- [配置选项](/api/config) - 完整的配置选项
- [事件系统](/api/events) - 所有可用事件
- [类型定义](/api/types) - TypeScript类型定义
- [Vue组件](/api/vue-component) - Vue组件API
- [usePDFViewer](/api/use-pdf-viewer) - Vue Composable API

## 基础示例

### 创建查看器实例

```typescript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
});
```

### 加载PDF

```typescript
// URL
await viewer.load('https://example.com/document.pdf');

// 本地文件
const file = await fetch('/local.pdf');
const buffer = await file.arrayBuffer();
await viewer.load(buffer);
```

### 页面导航

```typescript
viewer.goToPage(5);       // 跳转到第5页
viewer.nextPage();        // 下一页
viewer.previousPage();    // 上一页
```

### 缩放控制

```typescript
viewer.setScale(1.5);           // 150%
viewer.setScale('auto');        // 自动
viewer.setScale('page-fit');    // 适应页面
viewer.zoomIn();                // 放大
viewer.zoomOut();               // 缩小
```

### 事件监听

```typescript
viewer.on('loadComplete', (info) => {
  console.log(`文档加载完成: ${info.numPages}页`);
});

viewer.on('pageChange', (page) => {
  console.log(`当前页: ${page}`);
});
```

## 详细文档

请查看各个API页面以获取详细信息：

- [PDFViewer API](/api/pdf-viewer)
- [配置选项](/api/config)
- [事件列表](/api/events)
- [类型定义](/api/types)
