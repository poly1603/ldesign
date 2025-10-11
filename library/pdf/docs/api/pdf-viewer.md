# PDFViewer 类

主要的PDF查看器类。

## 构造函数

```typescript
constructor(config: PDFViewerConfig)
```

创建一个新的PDF查看器实例。

**参数**:
- `config` - 配置对象

**示例**:
```javascript
const viewer = new PDFViewer({
  container: '#viewer',
  url: 'document.pdf',
  workerSrc: '/pdf.worker.min.mjs'
})
```

## 方法

### loadDocument()

加载PDF文档。

```typescript
loadDocument(url: string | Uint8Array): Promise<PDFDocumentProxy>
```

**参数**:
- `url` - PDF文件URL或Uint8Array数据

**返回值**: Promise<PDFDocumentProxy>

**示例**:
```javascript
// 加载URL
await viewer.loadDocument('https://example.com/doc.pdf')

// 加载本地文件
const file = document.querySelector('input').files[0]
const buffer = await file.arrayBuffer()
await viewer.loadDocument(new Uint8Array(buffer))
```

### goToPage()

跳转到指定页码。

```typescript
goToPage(pageNumber: number): Promise<void>
```

**参数**:
- `pageNumber` - 目标页码（从1开始）

**示例**:
```javascript
await viewer.goToPage(5)
```

### nextPage()

跳转到下一页。

```typescript
nextPage(): Promise<void>
```

**示例**:
```javascript
await viewer.nextPage()
```

### previousPage()

跳转到上一页。

```typescript
previousPage(): Promise<void>
```

**示例**:
```javascript
await viewer.previousPage()
```

### setZoom()

设置缩放级别。

```typescript
setZoom(zoom: ZoomType): void
```

**参数**:
- `zoom` - 缩放类型或数值

**ZoomType**:
- `'in'` - 放大
- `'out'` - 缩小
- `'fit-width'` - 适应宽度
- `'fit-height'` - 适应高度
- `'fit-page'` - 适应页面
- `'auto'` - 自动（100%）
- `number` - 具体数值（0.1-5.0）

**示例**:
```javascript
viewer.setZoom('in')
viewer.setZoom(1.5)
viewer.setZoom('fit-width')
```

### rotate()

旋转PDF页面。

```typescript
rotate(angle: RotationAngle): void
```

**参数**:
- `angle` - 旋转角度：`0 | 90 | 180 | 270`

**示例**:
```javascript
viewer.rotate(90)   // 顺时针旋转90度
viewer.rotate(180)  // 旋转180度
viewer.rotate(0)    // 恢复原始方向
```

### search()

搜索文本。

```typescript
search(text: string): Promise<SearchResult[]>
```

**参数**:
- `text` - 搜索文本

**返回值**: Promise<SearchResult[]>

**SearchResult**:
```typescript
interface SearchResult {
  pageNumber: number
  text: string
  index: number
}
```

**示例**:
```javascript
const results = await viewer.search('keyword')
console.log(`Found ${results.length} matches`)
```

### download()

下载PDF文件。

```typescript
download(filename?: string): void
```

**参数**:
- `filename` - 可选的文件名

**示例**:
```javascript
viewer.download('my-document.pdf')
```

### print()

打印PDF。

```typescript
print(): void
```

**示例**:
```javascript
viewer.print()
```

### getCurrentPage()

获取当前页码。

```typescript
getCurrentPage(): number
```

**返回值**: 当前页码（从1开始）

**示例**:
```javascript
const page = viewer.getCurrentPage()
```

### getTotalPages()

获取总页数。

```typescript
getTotalPages(): number
```

**返回值**: 总页数

**示例**:
```javascript
const total = viewer.getTotalPages()
```

### getCurrentZoom()

获取当前缩放比例。

```typescript
getCurrentZoom(): number
```

**返回值**: 缩放比例

**示例**:
```javascript
const zoom = viewer.getCurrentZoom()
console.log(`Current zoom: ${Math.round(zoom * 100)}%`)
```

### on()

添加事件监听器。

```typescript
on<K extends keyof PDFViewerEvents>(
  event: K,
  handler: PDFViewerEvents[K]
): void
```

**参数**:
- `event` - 事件名称
- `handler` - 事件处理函数

**示例**:
```javascript
viewer.on('document-loaded', (doc) => {
  console.log('Loaded', doc.numPages, 'pages')
})

viewer.on('page-changed', (pageNumber) => {
  console.log('Current page:', pageNumber)
})
```

### off()

移除事件监听器。

```typescript
off<K extends keyof PDFViewerEvents>(
  event: K,
  handler: PDFViewerEvents[K]
): void
```

**参数**:
- `event` - 事件名称
- `handler` - 事件处理函数

**示例**:
```javascript
const handler = (pageNumber) => {
  console.log('Page changed:', pageNumber)
}

viewer.on('page-changed', handler)
// ... later
viewer.off('page-changed', handler)
```

### destroy()

销毁查看器实例并释放资源。

```typescript
destroy(): Promise<void>
```

**示例**:
```javascript
await viewer.destroy()
```

## 事件

### document-loaded

文档加载完成时触发。

```typescript
(doc: PDFDocumentProxy) => void
```

### document-error

文档加载错误时触发。

```typescript
(error: Error) => void
```

### page-rendered

页面渲染完成时触发。

```typescript
(info: PageRenderInfo) => void
```

### page-changed

当前页码改变时触发。

```typescript
(pageNumber: number) => void
```

### zoom-changed

缩放比例改变时触发。

```typescript
(scale: number) => void
```

### rotation-changed

旋转角度改变时触发。

```typescript
(rotation: RotationAngle) => void
```

### loading-progress

加载进度更新时触发。

```typescript
(progress: LoadProgress) => void
```

### search-results

搜索完成时触发。

```typescript
(results: SearchResult[]) => void
```

## 完整示例

```javascript
import { PDFViewer } from '@ldesign/pdf-viewer'

// 创建实例
const viewer = new PDFViewer({
  container: '#viewer',
  workerSrc: '/pdf.worker.min.mjs',
  enableToolbar: true,
  scale: 1.0
})

// 监听事件
viewer.on('document-loaded', (doc) => {
  console.log(`Loaded ${doc.numPages} pages`)
})

viewer.on('page-changed', (page) => {
  console.log(`Page: ${page}/${viewer.getTotalPages()}`)
})

viewer.on('error', (error) => {
  console.error('Error:', error)
})

// 加载文档
await viewer.loadDocument('document.pdf')

// 页面操作
await viewer.goToPage(5)
await viewer.nextPage()
await viewer.previousPage()

// 缩放操作
viewer.setZoom('in')
viewer.setZoom('out')
viewer.setZoom(1.5)
viewer.setZoom('fit-width')

// 旋转
viewer.rotate(90)

// 搜索
const results = await viewer.search('keyword')

// 下载和打印
viewer.download('my-file.pdf')
viewer.print()

// 清理
await viewer.destroy()
```
