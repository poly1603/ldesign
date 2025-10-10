# PDFViewer API

PDFViewer 是核心查看器类，提供完整的PDF查看功能。

## 构造函数

```typescript
new PDFViewer(config?: PDFViewerConfig)
```

### 参数

- `config` - 配置对象，详见[配置选项](/api/config)

### 示例

```typescript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
});
```

## 方法

### load()

加载PDF文档。

```typescript
load(source: PDFSource): Promise<void>
```

**参数:**
- `source` - PDF来源，支持URL、ArrayBuffer、Uint8Array

**返回:**
- `Promise<void>`

**示例:**

```typescript
// 从URL加载
await viewer.load('https://example.com/document.pdf');

// 从ArrayBuffer加载
const buffer = await fetch('/document.pdf').then(r => r.arrayBuffer());
await viewer.load(buffer);

// 从文件加载
const file = document.querySelector('input[type=file]').files[0];
const url = URL.createObjectURL(file);
await viewer.load(url);
```

### goToPage()

跳转到指定页面。

```typescript
goToPage(pageNumber: number): void
```

**参数:**
- `pageNumber` - 页码（从1开始）

**示例:**

```typescript
viewer.goToPage(5); // 跳转到第5页
```

### nextPage()

跳转到下一页。

```typescript
nextPage(): void
```

**示例:**

```typescript
viewer.nextPage();
```

### previousPage()

跳转到上一页。

```typescript
previousPage(): void
```

**示例:**

```typescript
viewer.previousPage();
```

### setScale()

设置缩放比例。

```typescript
setScale(scale: ScaleMode): void
```

**参数:**
- `scale` - 缩放模式或数值
  - `'auto'` - 自动缩放
  - `'page-fit'` - 适应页面
  - `'page-width'` - 适应宽度
  - `'page-height'` - 适应高度
  - `number` - 具体数值（1 = 100%）

**示例:**

```typescript
viewer.setScale(1.5);           // 150%
viewer.setScale('auto');        // 自动
viewer.setScale('page-fit');    // 适应页面
```

### zoomIn()

放大视图。

```typescript
zoomIn(step?: number): void
```

**参数:**
- `step` - 缩放步长，默认0.1

**示例:**

```typescript
viewer.zoomIn();      // 放大10%
viewer.zoomIn(0.2);   // 放大20%
```

### zoomOut()

缩小视图。

```typescript
zoomOut(step?: number): void
```

**参数:**
- `step` - 缩放步长，默认0.1

**示例:**

```typescript
viewer.zoomOut();     // 缩小10%
viewer.zoomOut(0.2);  // 缩小20%
```

### rotate()

旋转页面。

```typescript
rotate(angle: number): void
```

**参数:**
- `angle` - 旋转角度（度）

**示例:**

```typescript
viewer.rotate(90);    // 顺时针旋转90度
viewer.rotate(-90);   // 逆时针旋转90度
```

### search()

搜索文本。

```typescript
search(query: string, options?: Partial<SearchConfig>): Promise<SearchResult[]>
```

**参数:**
- `query` - 搜索关键词
- `options` - 搜索选项
  - `caseSensitive` - 是否区分大小写
  - `wholeWords` - 是否全词匹配
  - `regex` - 是否使用正则表达式

**返回:**
- `Promise<SearchResult[]>` - 搜索结果数组

**示例:**

```typescript
// 基础搜索
const results = await viewer.search('关键词');

// 高级搜索
const results = await viewer.search('关键词', {
  caseSensitive: true,
  wholeWords: true,
});

console.log(`找到 ${results.length} 个匹配项`);
results.forEach(result => {
  console.log(`页码: ${result.pageNumber}, 文本: ${result.text}`);
});
```

### getDocumentInfo()

获取文档信息。

```typescript
getDocumentInfo(): DocumentInfo | null
```

**返回:**
- `DocumentInfo | null` - 文档信息对象

**示例:**

```typescript
const info = viewer.getDocumentInfo();
if (info) {
  console.log('标题:', info.title);
  console.log('作者:', info.author);
  console.log('页数:', info.numPages);
}
```

### getPageInfo()

获取页面信息。

```typescript
getPageInfo(pageNumber?: number): PageInfo | null
```

**参数:**
- `pageNumber` - 页码，默认当前页

**返回:**
- `PageInfo | null` - 页面信息对象

**示例:**

```typescript
const pageInfo = viewer.getPageInfo(1);
if (pageInfo) {
  console.log('宽度:', pageInfo.width);
  console.log('高度:', pageInfo.height);
}
```

### getOutline()

获取文档大纲。

```typescript
getOutline(): Promise<OutlineItem[]>
```

**返回:**
- `Promise<OutlineItem[]>` - 大纲项数组

**示例:**

```typescript
const outline = await viewer.getOutline();
outline.forEach(item => {
  console.log(item.title, '-> 第', item.pageNumber, '页');
  if (item.children) {
    // 处理子项
  }
});
```

### getThumbnail()

获取页面缩略图。

```typescript
getThumbnail(pageNumber: number): Promise<HTMLCanvasElement>
```

**参数:**
- `pageNumber` - 页码

**返回:**
- `Promise<HTMLCanvasElement>` - Canvas元素

**示例:**

```typescript
const thumbnail = await viewer.getThumbnail(1);
document.body.appendChild(thumbnail);
```

### print()

打印文档。

```typescript
print(options?: Partial<PrintConfig>): Promise<void>
```

**参数:**
- `options` - 打印选项

**示例:**

```typescript
await viewer.print({
  dpi: 300,
  showDialog: true,
});
```

### download()

下载文档。

```typescript
download(filename?: string): void
```

**参数:**
- `filename` - 文件名

**示例:**

```typescript
viewer.download('my-document.pdf');
```

### export()

导出文档。

```typescript
export(options?: ExportOptions): Promise<Blob>
```

**参数:**
- `options` - 导出选项

**返回:**
- `Promise<Blob>` - Blob对象

**示例:**

```typescript
const blob = await viewer.export({
  format: 'pdf',
  quality: 1,
});
```

### getSelectedText()

获取选中的文本。

```typescript
getSelectedText(): string
```

**返回:**
- `string` - 选中的文本

**示例:**

```typescript
const text = viewer.getSelectedText();
console.log('选中文本:', text);
```

### refresh()

刷新当前页面渲染。

```typescript
refresh(): void
```

**示例:**

```typescript
viewer.refresh();
```

### destroy()

销毁查看器实例。

```typescript
destroy(): void
```

**示例:**

```typescript
viewer.destroy();
```

### use()

注册插件。

```typescript
use(plugin: PDFPlugin): void
```

**参数:**
- `plugin` - 插件对象

**示例:**

```typescript
const myPlugin = {
  name: 'my-plugin',
  install(viewer) {
    console.log('插件已安装');
  },
};

viewer.use(myPlugin);
```

### on()

监听事件。

```typescript
on<K extends keyof PDFEventHandlers>(
  event: K,
  handler: PDFEventHandlers[K]
): void
```

**参数:**
- `event` - 事件名称
- `handler` - 事件处理函数

**示例:**

```typescript
viewer.on('pageChange', (page) => {
  console.log('当前页:', page);
});
```

### off()

取消监听事件。

```typescript
off<K extends keyof PDFEventHandlers>(
  event: K,
  handler: PDFEventHandlers[K]
): void
```

**参数:**
- `event` - 事件名称
- `handler` - 事件处理函数

**示例:**

```typescript
const handler = (page) => console.log(page);
viewer.on('pageChange', handler);
viewer.off('pageChange', handler);
```

### emit()

触发事件（通常由内部使用）。

```typescript
emit<K extends keyof PDFEventHandlers>(
  event: K,
  ...args: Parameters<PDFEventHandlers[K]>
): void
```

## 属性

### config (只读)

获取当前配置。

```typescript
readonly config: PDFViewerConfig
```

**示例:**

```typescript
console.log(viewer.config.scale);
```

### currentPage (只读)

获取当前页码。

```typescript
readonly currentPage: number
```

**示例:**

```typescript
console.log('当前页:', viewer.currentPage);
```

### totalPages (只读)

获取总页数。

```typescript
readonly totalPages: number
```

**示例:**

```typescript
console.log('总页数:', viewer.totalPages);
```

### scale (只读)

获取当前缩放比例。

```typescript
readonly scale: number
```

**示例:**

```typescript
console.log('缩放比例:', viewer.scale * 100 + '%');
```

### document (只读)

获取PDF文档对象。

```typescript
readonly document: PDFDocumentProxy | null
```

**示例:**

```typescript
if (viewer.document) {
  console.log('文档已加载');
}
```

## 完整示例

```typescript
import { PDFViewer } from '@ldesign/pdf';

// 创建实例
const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
  on: {
    loadComplete: (info) => {
      console.log(`文档加载完成: ${info.numPages}页`);
    },
    pageChange: (page) => {
      console.log(`当前页: ${page}`);
    },
  },
});

// 加载PDF
await viewer.load('https://example.com/document.pdf');

// 页面导航
viewer.nextPage();
viewer.previousPage();
viewer.goToPage(5);

// 缩放控制
viewer.zoomIn();
viewer.zoomOut();
viewer.setScale(1.5);

// 搜索
const results = await viewer.search('关键词');
console.log(`找到 ${results.length} 个匹配项`);

// 打印下载
await viewer.print();
viewer.download('document.pdf');

// 销毁
viewer.destroy();
```
