# API 参考

本文档详细介绍了 @ldesign/pdf 的所有 API 接口。

## 核心 API

### createPdfViewer

创建PDF查看器实例。

```typescript
function createPdfViewer(config: IPdfViewerConfig): IPdfViewer
```

**参数：**
- `config`: 查看器配置对象

**返回值：**
- `IPdfViewer`: PDF查看器实例

**示例：**
```javascript
import { createPdfViewer } from '@ldesign/pdf'

const viewer = createPdfViewer({
  container: document.getElementById('pdf-container'),
  enableToolbar: true,
  theme: 'light'
})
```

## IPdfViewer 接口

### 文档操作

#### loadDocument

加载PDF文档。

```typescript
loadDocument(source: string | File | ArrayBuffer | Uint8Array): Promise<void>
```

**参数：**
- `source`: PDF文档源，支持URL字符串、File对象、ArrayBuffer或Uint8Array

**示例：**
```javascript
// 从URL加载
await viewer.loadDocument('https://example.com/document.pdf')

// 从File对象加载
const file = document.getElementById('file-input').files[0]
await viewer.loadDocument(file)

// 从ArrayBuffer加载
const response = await fetch('document.pdf')
const buffer = await response.arrayBuffer()
await viewer.loadDocument(buffer)
```

#### hasDocument

检查是否已加载文档。

```typescript
hasDocument(): boolean
```

**返回值：**
- `boolean`: 是否已加载文档

#### getDocumentInfo

获取文档信息。

```typescript
getDocumentInfo(): Promise<IPdfDocumentInfo>
```

**返回值：**
- `Promise<IPdfDocumentInfo>`: 文档信息对象

```typescript
interface IPdfDocumentInfo {
  numPages: number          // 总页数
  title?: string           // 标题
  author?: string          // 作者
  subject?: string         // 主题
  creator?: string         // 创建者
  producer?: string        // 生成器
  creationDate?: Date      // 创建日期
  modificationDate?: Date  // 修改日期
  pdfVersion?: string      // PDF版本
}
```

### 页面导航

#### getCurrentPage

获取当前页码。

```typescript
getCurrentPage(): number
```

#### getTotalPages

获取总页数。

```typescript
getTotalPages(): number
```

#### goToPage

跳转到指定页面。

```typescript
goToPage(pageNumber: number): Promise<void>
```

**参数：**
- `pageNumber`: 目标页码（1-based）

#### nextPage

跳转到下一页。

```typescript
nextPage(): Promise<void>
```

#### previousPage

跳转到上一页。

```typescript
previousPage(): Promise<void>
```

#### canGoNext

检查是否可以跳转到下一页。

```typescript
canGoNext(): boolean
```

#### canGoPrevious

检查是否可以跳转到上一页。

```typescript
canGoPrevious(): boolean
```

### 缩放控制

#### getScale

获取当前缩放比例。

```typescript
getScale(): number
```

#### setScale

设置缩放比例。

```typescript
setScale(scale: number): Promise<void>
```

**参数：**
- `scale`: 缩放比例（0.25-5.0）

#### zoomIn

放大。

```typescript
zoomIn(): Promise<void>
```

#### zoomOut

缩小。

```typescript
zoomOut(): Promise<void>
```

#### fitToWidth

适应宽度。

```typescript
fitToWidth(): Promise<void>
```

#### fitToPage

适应页面。

```typescript
fitToPage(): Promise<void>
```

### 旋转控制

#### getRotation

获取当前旋转角度。

```typescript
getRotation(): number
```

#### setRotation

设置旋转角度。

```typescript
setRotation(rotation: number): Promise<void>
```

**参数：**
- `rotation`: 旋转角度（0, 90, 180, 270）

#### rotateClockwise

顺时针旋转90度。

```typescript
rotateClockwise(): Promise<void>
```

#### rotateCounterClockwise

逆时针旋转90度。

```typescript
rotateCounterClockwise(): Promise<void>
```

### 搜索功能

#### search

搜索文本。

```typescript
search(query: string, options?: ISearchOptions): Promise<ISearchResult[]>
```

**参数：**
- `query`: 搜索关键词
- `options`: 搜索选项（可选）

```typescript
interface ISearchOptions {
  caseSensitive?: boolean    // 区分大小写
  wholeWords?: boolean       // 全词匹配
  highlightAll?: boolean     // 高亮所有结果
}

interface ISearchResult {
  pageNumber: number         // 页码
  text: string              // 匹配文本
  matchIndex: number        // 匹配索引
  rect: number[]            // 位置矩形
}
```

#### findNext

查找下一个搜索结果。

```typescript
findNext(): Promise<ISearchResult | null>
```

#### findPrevious

查找上一个搜索结果。

```typescript
findPrevious(): Promise<ISearchResult | null>
```

#### clearSearch

清除搜索结果。

```typescript
clearSearch(): void
```

#### getSearchResults

获取所有搜索结果。

```typescript
getSearchResults(): ISearchResult[]
```

### 事件系统

#### on

监听事件。

```typescript
on(event: string, listener: Function): void
```

#### off

移除事件监听器。

```typescript
off(event: string, listener?: Function): void
```

#### emit

触发事件。

```typescript
emit(event: string, data?: any): void
```

### 其他功能

#### updateConfig

更新配置。

```typescript
updateConfig(config: Partial<IPdfViewerConfig>): Promise<void>
```

#### destroy

销毁查看器实例。

```typescript
destroy(): Promise<void>
```

#### download

下载PDF文档。

```typescript
download(filename?: string): void
```

#### print

打印PDF文档。

```typescript
print(options?: IPrintOptions): void
```

```typescript
interface IPrintOptions {
  pageRange?: string         // 页面范围，如 "1-5,8,10-12"
  quality?: 'draft' | 'normal' | 'high'  // 打印质量
}
```

#### enterFullscreen

进入全屏模式。

```typescript
enterFullscreen(): Promise<void>
```

#### exitFullscreen

退出全屏模式。

```typescript
exitFullscreen(): Promise<void>
```

#### isFullscreen

检查是否处于全屏模式。

```typescript
isFullscreen(): boolean
```

## Vue 3 API

### PdfViewer 组件

```vue
<PdfViewer
  :src="pdfUrl"
  :config="config"
  @document-loaded="onDocumentLoaded"
  @page-changed="onPageChanged"
  @scale-changed="onScaleChanged"
  @rotation-changed="onRotationChanged"
  @search-completed="onSearchCompleted"
  @error="onError"
/>
```

**属性：**
- `src`: PDF文档源
- `config`: 配置对象
- 其他配置属性...

**事件：**
- `document-loaded`: 文档加载完成
- `page-changed`: 页面变化
- `scale-changed`: 缩放变化
- `rotation-changed`: 旋转变化
- `search-completed`: 搜索完成
- `error`: 错误发生

### usePdfViewer Hook

```typescript
function usePdfViewer(
  containerRef: Ref<HTMLElement>,
  config?: IPdfViewerConfig
): IPdfViewerHook
```

**参数：**
- `containerRef`: 容器元素的ref
- `config`: 配置对象（可选）

**返回值：**
```typescript
interface IPdfViewerHook {
  // 状态
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  currentPage: Ref<number>
  totalPages: Ref<number>
  scale: Ref<number>
  rotation: Ref<number>
  canGoPrevious: Ref<boolean>
  canGoNext: Ref<boolean>
  
  // 方法
  loadDocument: (source: PdfSource) => Promise<void>
  goToPage: (page: number) => Promise<void>
  nextPage: () => Promise<void>
  previousPage: () => Promise<void>
  setScale: (scale: number) => Promise<void>
  zoomIn: () => Promise<void>
  zoomOut: () => Promise<void>
  fitToWidth: () => Promise<void>
  fitToPage: () => Promise<void>
  setRotation: (rotation: number) => Promise<void>
  rotateClockwise: () => Promise<void>
  rotateCounterClockwise: () => Promise<void>
  search: (query: string) => Promise<ISearchResult[]>
  findNext: () => Promise<ISearchResult | null>
  findPrevious: () => Promise<ISearchResult | null>
  clearSearch: () => void
  download: (filename?: string) => void
  print: (options?: IPrintOptions) => void
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  destroy: () => Promise<void>
}
```

## 事件列表

### documentLoaded

文档加载完成时触发。

```typescript
viewer.on('documentLoaded', (info: IPdfDocumentInfo) => {
  console.log('文档已加载:', info)
})
```

### pageChanged

页面变化时触发。

```typescript
viewer.on('pageChanged', (data: { currentPage: number, totalPages: number }) => {
  console.log(`当前页: ${data.currentPage}/${data.totalPages}`)
})
```

### scaleChanged

缩放变化时触发。

```typescript
viewer.on('scaleChanged', (data: { scale: number, scaleMode: string }) => {
  console.log(`缩放: ${data.scale} (${data.scaleMode})`)
})
```

### rotationChanged

旋转变化时触发。

```typescript
viewer.on('rotationChanged', (data: { rotation: number }) => {
  console.log(`旋转: ${data.rotation}度`)
})
```

### searchStarted

搜索开始时触发。

```typescript
viewer.on('searchStarted', (data: { query: string }) => {
  console.log(`开始搜索: ${data.query}`)
})
```

### searchCompleted

搜索完成时触发。

```typescript
viewer.on('searchCompleted', (data: {
  query: string
  results: ISearchResult[]
  totalMatches: number
}) => {
  console.log(`搜索完成: 找到${data.totalMatches}个结果`)
})
```

### error

错误发生时触发。

```typescript
viewer.on('error', (data: { error: Error, context: string }) => {
  console.error(`${data.context}错误:`, data.error)
})
```

## 类型定义

### PdfSource

```typescript
type PdfSource = string | File | ArrayBuffer | Uint8Array
```

### ScaleMode

```typescript
type ScaleMode = 'auto' | 'fit-width' | 'fit-page' | 'custom'
```

### Theme

```typescript
type Theme = 'light' | 'dark'
```

### ToolbarPosition

```typescript
type ToolbarPosition = 'top' | 'bottom'
```
