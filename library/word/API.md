# API 文档

Word Viewer 完整 API 参考文档。

## 目录

- [核心类](#核心类)
  - [WordViewer](#wordviewer)
- [类型定义](#类型定义)
- [常量](#常量)
- [框架组件](#框架组件)

---

## 核心类

### WordViewer

主查看器类，用于创建和管理 Word 文档查看器实例。

#### 构造函数

```typescript
new WordViewer(container: HTMLElement | string, options?: ViewerOptions)
```

**参数：**
- `container`: 容器元素或选择器字符串
- `options`: 可选的配置选项

**示例：**
```typescript
const viewer = new WordViewer('#app', {
  theme: 'light',
  editable: false,
  initialZoom: 1.0,
});
```

---

### 文档加载方法

#### loadFile()

从 File 对象加载文档。

```typescript
async loadFile(file: File): Promise<void>
```

**参数：**
- `file`: File 对象

**返回：** Promise

**示例：**
```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
await viewer.loadFile(file);
```

#### loadUrl()

从 URL 加载文档。

```typescript
async loadUrl(url: string): Promise<void>
```

**参数：**
- `url`: 文档的 URL 地址

**返回：** Promise

**示例：**
```typescript
await viewer.loadUrl('https://example.com/document.docx');
```

#### loadBuffer()

从 ArrayBuffer 加载文档。

```typescript
async loadBuffer(buffer: ArrayBuffer): Promise<void>
```

**参数：**
- `buffer`: ArrayBuffer 数据

**返回：** Promise

**示例：**
```typescript
const response = await fetch('document.docx');
const buffer = await response.arrayBuffer();
await viewer.loadBuffer(buffer);
```

---

### 查看功能方法

#### setZoom()

设置缩放级别。

```typescript
setZoom(level: number): void
```

**参数：**
- `level`: 缩放级别 (0.5 - 3.0)

**示例：**
```typescript
viewer.setZoom(1.5); // 150%
```

#### getZoom()

获取当前缩放级别。

```typescript
getZoom(): number
```

**返回：** 当前缩放级别

**示例：**
```typescript
const currentZoom = viewer.getZoom();
console.log(`当前缩放: ${currentZoom * 100}%`);
```

#### goToPage()

跳转到指定页面。

```typescript
goToPage(page: number): void
```

**参数：**
- `page`: 页码（从 1 开始）

**示例：**
```typescript
viewer.goToPage(3); // 跳转到第 3 页
```

#### getPageInfo()

获取页面信息。

```typescript
getPageInfo(): PageInfo
```

**返回：** 页面信息对象

**示例：**
```typescript
const pageInfo = viewer.getPageInfo();
console.log(`第 ${pageInfo.current} 页，共 ${pageInfo.total} 页`);
```

#### search()

搜索文本。

```typescript
search(keyword: string): SearchResult[]
```

**参数：**
- `keyword`: 搜索关键词

**返回：** 搜索结果数组

**示例：**
```typescript
const results = viewer.search('重要');
console.log(`找到 ${results.length} 个结果`);
results.forEach(result => {
  console.log(`页 ${result.pageNumber}: ${result.context}`);
});
```

---

### 编辑功能方法

#### enableEdit()

启用编辑模式。

```typescript
enableEdit(): void
```

**示例：**
```typescript
viewer.enableEdit();
```

#### disableEdit()

禁用编辑模式。

```typescript
disableEdit(): void
```

**示例：**
```typescript
viewer.disableEdit();
```

#### insertText()

插入文本。

```typescript
insertText(text: string, position?: number): void
```

**参数：**
- `text`: 要插入的文本
- `position`: 可选的插入位置

**示例：**
```typescript
viewer.insertText('Hello World');
```

#### insertImage()

插入图片。

```typescript
insertImage(image: File | Blob, options?: InsertImageOptions): void
```

**参数：**
- `image`: 图片文件或 Blob
- `options`: 可选的插入选项

**示例：**
```typescript
const imageFile = document.querySelector('input[type="file"]').files[0];
viewer.insertImage(imageFile, {
  width: 300,
  alignment: 'center',
});
```

#### applyFormat()

应用文本格式。

```typescript
applyFormat(format: TextFormat): void
```

**参数：**
- `format`: 文本格式对象

**示例：**
```typescript
viewer.applyFormat({
  bold: true,
  fontSize: 16,
  color: '#ff0000',
});
```

#### getSelection()

获取当前选中的文本。

```typescript
getSelection(): SelectionRange | null
```

**返回：** 选择范围对象或 null

**示例：**
```typescript
const selection = viewer.getSelection();
if (selection) {
  console.log(`选中文本: ${selection.text}`);
}
```

#### undo()

撤销上一步操作。

```typescript
undo(): void
```

**示例：**
```typescript
viewer.undo();
```

#### redo()

重做。

```typescript
redo(): void
```

**示例：**
```typescript
viewer.redo();
```

#### getEditState()

获取编辑状态。

```typescript
getEditState(): EditState
```

**返回：** 编辑状态对象

**示例：**
```typescript
const state = viewer.getEditState();
console.log(`编辑中: ${state.isEditing}`);
console.log(`已修改: ${state.isDirty}`);
console.log(`可撤销: ${state.canUndo}`);
console.log(`可重做: ${state.canRedo}`);
```

---

### 导出功能方法

#### exportToPDF()

导出为 PDF。

```typescript
async exportToPDF(): Promise<Blob>
```

**返回：** Promise<Blob>

**示例：**
```typescript
const pdfBlob = await viewer.exportToPDF();
// 下载文件
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'document.pdf';
a.click();
```

#### exportToHTML()

导出为 HTML。

```typescript
exportToHTML(): string
```

**返回：** HTML 字符串

**示例：**
```typescript
const html = viewer.exportToHTML();
console.log(html);
```

#### exportToDocx()

导出为 DOCX。

```typescript
async exportToDocx(): Promise<Blob>
```

**返回：** Promise<Blob>

**示例：**
```typescript
const docxBlob = await viewer.exportToDocx();
```

#### export()

通用导出方法。

```typescript
async export(options: ExportOptions): Promise<Blob | string>
```

**参数：**
- `options`: 导出选项

**返回：** Promise<Blob | string>

**示例：**
```typescript
const result = await viewer.export({
  format: 'pdf',
  includeImages: true,
  pageSize: 'A4',
});
```

---

### 其他方法

#### getDocumentInfo()

获取文档信息。

```typescript
getDocumentInfo(): DocumentInfo | null
```

**返回：** 文档信息对象或 null

**示例：**
```typescript
const info = viewer.getDocumentInfo();
if (info) {
  console.log(`标题: ${info.title}`);
  console.log(`作者: ${info.author}`);
  console.log(`页数: ${info.pageCount}`);
}
```

#### getOptions()

获取当前配置选项。

```typescript
getOptions(): Readonly<Required<ViewerOptions>>
```

**返回：** 只读的配置对象

**示例：**
```typescript
const options = viewer.getOptions();
console.log(`主题: ${options.theme}`);
```

#### updateOptions()

更新配置选项。

```typescript
updateOptions(options: Partial<ViewerOptions>): void
```

**参数：**
- `options`: 要更新的选项

**示例：**
```typescript
viewer.updateOptions({
  theme: 'dark',
  editable: true,
});
```

#### getContainer()

获取容器元素。

```typescript
getContainer(): HTMLElement
```

**返回：** 容器 DOM 元素

**示例：**
```typescript
const container = viewer.getContainer();
console.log(container.clientWidth);
```

#### destroy()

销毁查看器实例。

```typescript
destroy(): void
```

**示例：**
```typescript
viewer.destroy();
```

---

### 事件系统

#### on()

注册事件监听器。

```typescript
on(event: EventType | string, callback: EventCallback): void
```

**参数：**
- `event`: 事件名称
- `callback`: 回调函数

**事件列表：**
- `loaded`: 文档加载完成
- `error`: 发生错误
- `progress`: 加载进度更新
- `changed`: 文档内容改变
- `zoom`: 缩放级别改变
- `page-change`: 页面改变
- `edit-start`: 开始编辑
- `edit-end`: 结束编辑

**示例：**
```typescript
viewer.on('loaded', (data) => {
  console.log('文档已加载', data);
});

viewer.on('error', (error) => {
  console.error('错误:', error);
});

viewer.on('progress', (progress) => {
  console.log(`进度: ${progress.percentage}%`);
});
```

#### off()

移除事件监听器。

```typescript
off(event: EventType | string, callback?: EventCallback): void
```

**参数：**
- `event`: 事件名称
- `callback`: 可选的回调函数，不传则移除所有该事件的监听器

**示例：**
```typescript
const handler = () => console.log('loaded');
viewer.on('loaded', handler);
viewer.off('loaded', handler);
```

#### once()

注册一次性事件监听器。

```typescript
once(event: EventType | string, callback: EventCallback): void
```

**参数：**
- `event`: 事件名称
- `callback`: 回调函数

**示例：**
```typescript
viewer.once('loaded', () => {
  console.log('首次加载完成');
});
```

---

## 类型定义

### ViewerOptions

查看器配置选项。

```typescript
interface ViewerOptions {
  readOnly?: boolean;           // 只读模式，默认 false
  showToolbar?: boolean;        // 显示工具栏，默认 true
  initialZoom?: number;         // 初始缩放级别，默认 1.0
  theme?: 'light' | 'dark' | 'auto'; // 主题，默认 'light'
  renderEngine?: 'docx-preview' | 'mammoth' | 'auto'; // 渲染引擎
  editable?: boolean;           // 可编辑，默认 false
  showPageNumbers?: boolean;    // 显示页码，默认 true
  enableSearch?: boolean;       // 启用搜索，默认 true
  language?: 'zh-CN' | 'en-US'; // 语言，默认 'zh-CN'
  debug?: boolean;              // 调试模式，默认 false
}
```

### TextFormat

文本格式。

```typescript
interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}
```

### SearchResult

搜索结果。

```typescript
interface SearchResult {
  pageNumber: number;    // 页码
  position: number;      // 位置
  text: string;          // 匹配文本
  context: string;       // 上下文
}
```

### DocumentInfo

文档信息。

```typescript
interface DocumentInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  description?: string;
  created?: Date;
  modified?: Date;
  pageCount?: number;
  wordCount?: number;
}
```

### PageInfo

页面信息。

```typescript
interface PageInfo {
  current: number;  // 当前页
  total: number;    // 总页数
}
```

### EditState

编辑状态。

```typescript
interface EditState {
  isEditing: boolean;  // 是否正在编辑
  isDirty: boolean;    // 是否有未保存的更改
  canUndo: boolean;    // 是否可以撤销
  canRedo: boolean;    // 是否可以重做
}
```

### ExportOptions

导出选项。

```typescript
interface ExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'txt';
  includeImages?: boolean;
  includeStyles?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

---

## 常量

### DEFAULT_OPTIONS

默认配置选项。

```typescript
const DEFAULT_OPTIONS = {
  readOnly: false,
  showToolbar: true,
  initialZoom: 1.0,
  theme: 'light',
  renderEngine: 'auto',
  editable: false,
  showPageNumbers: true,
  enableSearch: true,
  language: 'zh-CN',
  debug: false,
};
```

### ZOOM_RANGE

缩放范围。

```typescript
const ZOOM_RANGE = {
  MIN: 0.5,    // 最小缩放 50%
  MAX: 3.0,    // 最大缩放 300%
  STEP: 0.1,   // 缩放步进 10%
};
```

### SUPPORTED_FILE_TYPES

支持的文件类型。

```typescript
const SUPPORTED_FILE_TYPES = {
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
};
```

---

## 框架组件

### Vue 组件

```vue
<template>
  <WordViewer
    :source="file"
    :zoom="1.2"
    :editable="true"
    theme="light"
    @loaded="onLoaded"
    @error="onError"
  />
</template>

<script setup>
import { WordViewerComponent as WordViewer } from '@word-viewer/core/vue';
</script>
```

**Props:**
- `source`: DocumentSource - 文档源
- `options`: ViewerOptions - 配置选项
- `zoom`: number - 缩放级别
- `editable`: boolean - 是否可编辑
- `theme`: 'light' | 'dark' - 主题

**Events:**
- `@loaded`: 文档加载完成
- `@error`: 发生错误
- `@changed`: 文档改变
- `@zoom`: 缩放改变
- `@page-change`: 页面改变

### React 组件

```tsx
import { WordViewerComponent, WordViewerRef } from '@word-viewer/core/react';

<WordViewerComponent
  ref={viewerRef}
  source={file}
  zoom={1.2}
  editable={true}
  theme="light"
  onLoaded={handleLoaded}
  onError={handleError}
/>
```

**Props:**
- `source`: DocumentSource
- `options`: ViewerOptions
- `zoom`: number
- `editable`: boolean
- `theme`: 'light' | 'dark'
- `onLoaded`: (data: any) => void
- `onError`: (error: any) => void
- `onChanged`: () => void
- `onZoom`: (level: number) => void
- `onPageChange`: (pageInfo: any) => void

### Lit Web Component

```html
<word-viewer
  src="document.docx"
  zoom="1.2"
  editable
  theme="light"
></word-viewer>
```

**Attributes:**
- `src`: string - 文档 URL
- `zoom`: number - 缩放级别
- `editable`: boolean - 是否可编辑
- `theme`: 'light' | 'dark' - 主题

**Properties:**
- `source`: DocumentSource - 文档源

**Methods:**
- `getViewer()`: WordViewer | null
- `setZoom(level: number): void`
- `enableEdit(): void`
- `disableEdit(): void`
- `exportToPDF(): Promise<Blob | null>`
- `exportToHTML(): string | null`

**Events:**
- `loaded`
- `error`
- `changed`
- `zoom`
- `page-change`

---

## 最佳实践

### 错误处理

```typescript
viewer.on('error', (error) => {
  console.error('错误码:', error.code);
  console.error('错误信息:', error.message);
  // 向用户显示友好的错误提示
});
```

### 性能优化

```typescript
// 监听加载进度
viewer.on('progress', (progress) => {
  updateProgressBar(progress.percentage);
});

// 销毁不再使用的实例
viewer.destroy();
```

### 内存管理

```typescript
// 组件卸载时销毁
onUnmounted(() => {
  if (viewer) {
    viewer.destroy();
  }
});
```



