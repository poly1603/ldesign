# PDF阅读器示例项目

这是一个使用 `@ldesign/pdf-reader` 的完整示例项目，展示了PDF阅读器的各种功能和使用方法。

## 功能特性

### 🔧 核心功能
- ✅ PDF文件加载和显示
- ✅ 页面导航（上一页/下一页）
- ✅ 缩放控制（放大/缩小/适合宽度/适合页面）
- ✅ 页面信息显示
- ✅ 键盘快捷键支持
- ✅ 加载进度显示
- ✅ 错误处理和状态提示

### 🎨 用户界面
- 现代化的响应式设计
- 直观的工具栏控制
- 实时状态反馈
- 优雅的错误提示

### ⌨️ 键盘快捷键
- `←` / `PageUp`: 上一页
- `→` / `PageDown`: 下一页
- `Ctrl + +`: 放大
- `Ctrl + -`: 缩小

## 📄 示例PDF文件

项目提供了多个示例PDF文件供测试：

### 在线示例
- **技术论文** - Mozilla的TraceMonkey论文（14页）
- **WCAG指南** - W3C无障碍指南（多页文档）
- **Hello World** - PDF.js简单示例
- **PDF规范** - Adobe PDF格式规范

### 本地示例
- `assets/sample.html` - 可转换为PDF的测试文档
- 包含多页内容、不同格式、表格等
- 用于测试完整的PDF阅读器功能

#### 转换本地示例
1. 在浏览器中打开 `assets/sample.html`
2. 按 `Ctrl+P` 打开打印对话框
3. 选择"保存为PDF"
4. 保存为 `assets/sample.pdf`
5. 在示例项目中点击"本地示例"按钮测试

## 快速开始

### 1. 安装依赖
```bash
cd examples
pnpm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```

### 3. 构建生产版本
```bash
pnpm build
```

### 4. 预览构建结果
```bash
pnpm preview
```

## 使用方法

### 基本用法

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

### 高级配置

```typescript
const pdfReader = createPDFReader({
  container: document.getElementById('pdf-container'),
  
  // 工具栏配置
  showToolbar: true,
  toolbarPosition: 'top',
  
  // 缩略图配置
  showThumbnails: true,
  thumbnailsPosition: 'left',
  
  // 主题配置
  theme: 'light', // 'light' | 'dark' | 'auto'
  
  // 初始缩放
  initialScale: 1.0,
  
  // 最小/最大缩放
  minScale: 0.25,
  maxScale: 5.0,
  
  // 搜索配置
  enableSearch: true,
  searchHighlightColor: '#ffff00',
  
  // 性能配置
  enableTextSelection: true,
  renderTextLayer: true,
  renderAnnotationLayer: true
})
```

## API文档

### 主要方法

- `loadDocument(src)`: 加载PDF文档
- `goToPage(pageNumber)`: 跳转到指定页面
- `nextPage()`: 下一页
- `previousPage()`: 上一页
- `zoomIn()`: 放大
- `zoomOut()`: 缩小
- `setScale(scale)`: 设置缩放比例
- `fitWidth()`: 适合宽度
- `fitPage()`: 适合页面
- `search(query)`: 搜索文本
- `getState()`: 获取当前状态

### 事件系统

- `document-loaded`: 文档加载完成
- `page-changed`: 页面切换
- `scale-changed`: 缩放改变
- `search-results`: 搜索结果
- `loading-progress`: 加载进度
- `error`: 错误事件

## 项目结构

```
examples/
├── src/
│   └── main.ts          # 主要逻辑文件
├── index.html           # HTML模板
├── package.json         # 项目配置
├── launcher.config.ts   # 启动器配置
├── tsconfig.json        # TypeScript配置
└── README.md           # 说明文档
```

## 技术栈

- **构建工具**: @ldesign/launcher (基于Vite)
- **语言**: TypeScript
- **PDF引擎**: PDF.js
- **样式**: 原生CSS + CSS变量
- **模块系统**: ESM

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 开发说明

### 调试模式

在浏览器控制台中，可以访问以下全局变量进行调试：

```javascript
// PDF阅读器实例
window.pdfReader

// PDF阅读器类
window.PDFReader
```

### 自定义样式

项目使用LDESIGN设计系统的CSS变量，可以通过覆盖这些变量来自定义样式：

```css
:root {
  --ldesign-brand-color: #your-color;
  --ldesign-text-color-primary: #your-text-color;
}
```

## 常见问题

### Q: PDF文件加载失败？
A: 请确保PDF文件格式正确，且浏览器支持PDF.js。检查控制台错误信息。

### Q: 如何自定义工具栏？
A: 设置 `showToolbar: false`，然后使用API方法创建自定义控制界面。

### Q: 如何处理大文件？
A: PDF.js会自动进行分页加载和内存管理，但建议对超大文件进行预处理。

## 许可证

MIT License
