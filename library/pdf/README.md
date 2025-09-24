# @ldesign/pdf-reader

基于PDF.js的现代化PDF阅读器插件，使用TypeScript开发，提供完整的PDF查看、导航、缩放等功能。

## 特性

- 🚀 **现代化架构** - 基于TypeScript，提供完整的类型支持
- 📱 **响应式设计** - 支持各种屏幕尺寸和设备
- 🔍 **强大搜索** - 支持全文搜索，高亮显示结果
- 🎨 **主题支持** - 内置明暗主题，支持自定义样式
- ⚡ **高性能** - 虚拟滚动，按需渲染页面
- 🛠️ **易于集成** - 简单的API，灵活的配置选项
- 📝 **注释支持** - 支持PDF注释的显示和交互
- 🔧 **工具栏** - 完整的工具栏，支持自定义按钮

## 安装

```bash
# 使用 npm
npm install @ldesign/pdf-reader pdfjs-dist

# 使用 yarn
yarn add @ldesign/pdf-reader pdfjs-dist

# 使用 pnpm
pnpm add @ldesign/pdf-reader pdfjs-dist
```

> **注意**: 需要同时安装 `pdfjs-dist` 作为对等依赖

## 快速开始

### ESM/TypeScript 用法

```typescript
import { createPDFReader } from '@ldesign/pdf-reader'

// 创建PDF阅读器实例
const pdfReader = createPDFReader({
  container: document.getElementById('pdf-container'),
  showToolbar: true,
  showThumbnails: true,
  theme: 'light'
})

// 加载PDF文件
await pdfReader.loadDocument('/path/to/document.pdf')

// 监听事件
pdfReader.on('document-loaded', (info) => {
  console.log('文档已加载:', info)
})

pdfReader.on('page-changed', (pageNumber) => {
  console.log('当前页面:', pageNumber)
})
```

### UMD/HTML 用法

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDF阅读器示例</title>
</head>
<body>
  <div id="pdf-container" style="width: 100%; height: 600px;"></div>

  <!-- 加载PDF.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js"></script>

  <!-- 加载PDF阅读器 -->
  <script src="path/to/@ldesign/pdf-reader/dist/index.umd.js"></script>

  <script>
    // 配置PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';

    // 创建PDF阅读器
    const pdfReader = LDesignPDFReader.createPDFReader({
      container: document.getElementById('pdf-container')
    });

    // 加载PDF文件
    pdfReader.loadDocument('/path/to/document.pdf');
  </script>
</body>
</html>
```

## 🎯 示例项目

我们提供了一个完整的示例项目，展示了PDF阅读器的各种功能：

```bash
# 进入示例目录
cd examples

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

示例项目包含：
- 📁 文件上传和加载
- 🔄 页面导航控制
- 🔍 缩放功能演示
- ⌨️ 键盘快捷键支持
- 📱 响应式界面设计
- 🎨 现代化UI样式

访问 [http://localhost:3001](http://localhost:3001) 查看示例。

## 📚 API文档

### PDFReader类

#### 构造函数

```typescript
new PDFReader(options: PDFReaderOptions)
```

#### 配置选项

```typescript
interface PDFReaderOptions {
  container: HTMLElement | string    // 容器元素或选择器
  src?: string | ArrayBuffer         // PDF文件URL或数据
  initialPage?: number              // 初始页码（默认：1）
  initialScale?: number             // 初始缩放比例（默认：1.0）
  showToolbar?: boolean             // 是否显示工具栏（默认：true）
  showThumbnails?: boolean          // 是否显示缩略图（默认：true）
  enableSearch?: boolean            // 是否启用搜索（默认：true）
  enableAnnotations?: boolean       // 是否启用注释（默认：true）
  theme?: 'light' | 'dark' | 'auto' // 主题（默认：'auto'）
  className?: string                // 自定义样式类名
  workerSrc?: string               // 工作线程URL
}
```

#### 主要方法

```typescript
// 加载PDF文档
loadDocument(src?: string | ArrayBuffer): Promise<void>

// 跳转到指定页面
goToPage(pageNumber: number): Promise<void>

// 上一页
previousPage(): Promise<void>

// 下一页
nextPage(): Promise<void>

// 设置缩放比例
setScale(scale: number): void

// 放大
zoomIn(): void

// 缩小
zoomOut(): void

// 适合宽度
fitWidth(): void

// 适合页面
fitPage(): void

// 搜索文本
search(query: string, options?: PDFSearchOptions): Promise<PDFSearchResult[]>

// 获取文档信息
getDocumentInfo(): PDFDocumentInfo | null

// 获取当前状态
getState(): PDFReaderState

// 销毁实例
destroy(): void
```

#### 事件监听

```typescript
// 监听事件
pdfReader.on('document-loaded', (info) => {
  console.log('文档已加载:', info)
})

pdfReader.on('page-changed', (pageNumber) => {
  console.log('当前页面:', pageNumber)
})

pdfReader.on('scale-changed', (scale) => {
  console.log('缩放比例:', scale)
})

pdfReader.on('search-results', (results) => {
  console.log('搜索结果:', results)
})

pdfReader.on('error', (error) => {
  console.error('发生错误:', error)
})
```

## 示例

### 完整示例

```typescript
import { PDFReader } from '@ldesign/pdf-reader'

const pdfReader = new PDFReader({
  container: '#pdf-container',
  showToolbar: true,
  showThumbnails: true,
  enableSearch: true,
  theme: 'light'
})

// 监听事件
pdfReader.on('document-loaded', (info) => {
  console.log(`文档已加载: ${info.title}, 共${info.numPages}页`)
})

pdfReader.on('page-changed', (pageNumber) => {
  console.log(`当前页面: ${pageNumber}`)
})

// 加载PDF文档
pdfReader.loadDocument('/path/to/document.pdf')
  .then(() => {
    console.log('PDF加载成功')
  })
  .catch((error) => {
    console.error('PDF加载失败:', error)
  })
```

### 自定义工具栏

```typescript
const pdfReader = new PDFReader({
  container: '#pdf-container',
  showToolbar: false // 隐藏默认工具栏
})

// 创建自定义工具栏
const toolbar = document.createElement('div')
toolbar.innerHTML = `
  <button id="prev-page">上一页</button>
  <span id="page-info">1 / 1</span>
  <button id="next-page">下一页</button>
  <button id="zoom-in">放大</button>
  <button id="zoom-out">缩小</button>
`

// 绑定事件
document.getElementById('prev-page').onclick = () => pdfReader.previousPage()
document.getElementById('next-page').onclick = () => pdfReader.nextPage()
document.getElementById('zoom-in').onclick = () => pdfReader.zoomIn()
document.getElementById('zoom-out').onclick = () => pdfReader.zoomOut()

// 更新页面信息
pdfReader.on('page-changed', (pageNumber) => {
  const state = pdfReader.getState()
  document.getElementById('page-info').textContent = `${pageNumber} / ${state.totalPages}`
})
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test

# 运行示例
pnpm example:dev
```

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)。
