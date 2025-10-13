# SimplePDFViewer - 简单 PDF 查看器

SimplePDFViewer 是一个功能完整、易于使用的 PDF 查看器组件，提供了开箱即用的 PDF 查看体验。

## 特性

- 📄 **完整的 PDF 查看功能** - 支持加载、渲染、导航
- 🎨 **主题支持** - 内置浅色、深色、护眼三种主题
- 📱 **响应式设计** - 自适应不同屏幕尺寸
- 🔍 **缩放控制** - 支持放大、缩小、适应宽度、适应页面
- 📑 **缩略图导航** - 可切换的缩略图面板
- ⌨️ **键盘快捷键** - 箭头键翻页，Ctrl+/- 缩放
- 🖨️ **打印和下载** - 支持打印和下载 PDF
- 📢 **事件系统** - 丰富的事件回调

## 安装

```bash
npm install universal-pdf-viewer
```

## 快速开始

### 最简单的使用方式

```javascript
import { SimplePDFViewer } from 'universal-pdf-viewer/core/SimplePDFViewer';

// 创建查看器实例
const viewer = new SimplePDFViewer('#container', {
  theme: 'light'
});

// 加载 PDF
viewer.loadPDF('path/to/document.pdf');
```

### HTML 结构

只需要提供一个容器元素：

```html
<div id="container" style="width: 100%; height: 600px;"></div>
```

SimplePDFViewer 会自动在容器内创建完整的 UI 结构。

## 配置选项

```javascript
const viewer = new SimplePDFViewer('#container', {
  theme: 'light',           // 主题: 'light' | 'dark' | 'sepia'
  showToolbar: true,         // 显示工具栏
  showThumbnails: true,      // 显示缩略图面板
  enableSearch: true,        // 启用搜索功能（预留）
  enablePrint: true,         // 启用打印
  enableDownload: true,      // 启用下载
  defaultScale: 1.0         // 默认缩放比例
});
```

## API 方法

### 加载 PDF

```javascript
// 从 URL 加载
viewer.loadPDF('https://example.com/document.pdf');

// 从 ArrayBuffer 加载
const arrayBuffer = await fetch('document.pdf').then(r => r.arrayBuffer());
viewer.loadPDF(arrayBuffer);

// 从 Uint8Array 加载
const uint8Array = new Uint8Array(arrayBuffer);
viewer.loadPDF(uint8Array);
```

### 页面导航

```javascript
viewer.nextPage();              // 下一页
viewer.previousPage();          // 上一页
viewer.goToPage(5);            // 跳转到第 5 页
```

### 缩放控制

```javascript
viewer.zoomIn();               // 放大
viewer.zoomOut();              // 缩小
viewer.fitToWidth();           // 适应宽度
viewer.fitToPage();            // 适应页面
```

### 其他功能

```javascript
viewer.print();                // 打印
viewer.download();             // 下载
viewer.setTheme('dark');       // 切换主题
viewer.destroy();              // 销毁实例
```

## 事件

SimplePDFViewer 继承自 EventEmitter，支持丰富的事件监听：

```javascript
// PDF 加载中
viewer.on('loading', ({ source }) => {
  console.log('正在加载 PDF...');
});

// PDF 加载完成
viewer.on('loaded', ({ totalPages }) => {
  console.log(`PDF 已加载，共 ${totalPages} 页`);
});

// 页面切换
viewer.on('pageChanged', ({ currentPage, totalPages }) => {
  console.log(`当前页: ${currentPage}/${totalPages}`);
});

// 主题切换
viewer.on('themeChanged', ({ theme }) => {
  console.log(`主题切换到: ${theme}`);
});

// 缩略图切换
viewer.on('thumbnailsToggled', ({ visible }) => {
  console.log(`缩略图 ${visible ? '显示' : '隐藏'}`);
});

// 错误处理
viewer.on('error', (error) => {
  console.error('PDF 错误:', error);
});

// 打印事件
viewer.on('print', () => {
  console.log('用户打印 PDF');
});

// 下载事件
viewer.on('download', () => {
  console.log('用户下载 PDF');
});
```

## 键盘快捷键

- `←` / `→` - 上一页 / 下一页
- `Ctrl` + `+` / `-` - 放大 / 缩小

## 完整示例

```javascript
import { SimplePDFViewer } from 'universal-pdf-viewer/core/SimplePDFViewer';

// 创建查看器
const viewer = new SimplePDFViewer('#pdf-container', {
  theme: 'light',
  showToolbar: true,
  showThumbnails: true,
  enablePrint: true,
  enableDownload: true,
  defaultScale: 1.0
});

// 监听事件
viewer.on('loaded', (data) => {
  console.log('PDF 加载完成:', data);
  // 可以在这里执行其他操作，如跳转到特定页
  // viewer.goToPage(3);
});

viewer.on('error', (error) => {
  alert('加载 PDF 失败: ' + error.message);
});

// 加载 PDF
viewer.loadPDF('path/to/document.pdf');

// 稍后切换主题
document.getElementById('theme-switcher').addEventListener('change', (e) => {
  viewer.setTheme(e.target.value);
});

// 清理（当不再需要时）
// viewer.destroy();
```

## 从文件输入加载

```javascript
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = (event) => {
      const typedArray = new Uint8Array(event.target.result);
      viewer.loadPDF(typedArray);
    };
    reader.readAsArrayBuffer(file);
  }
});
```

## 样式定制

SimplePDFViewer 使用 CSS 变量，可以通过覆盖这些变量来定制样式：

```css
.spv-wrapper {
  --spv-bg: #f5f5f5;              /* 背景色 */
  --spv-toolbar-bg: #ffffff;      /* 工具栏背景 */
  --spv-toolbar-border: #e0e0e0;  /* 工具栏边框 */
  --spv-btn-hover: #f0f0f0;       /* 按钮悬停背景 */
  --spv-text: #333333;             /* 文本颜色 */
  --spv-border: #ddd;              /* 边框颜色 */
  --spv-thumbnails-bg: #fafafa;    /* 缩略图背景 */
  --spv-thumbnail-active: #646cff; /* 活动缩略图边框 */
}
```

## 注意事项

1. **容器尺寸** - 确保容器元素有明确的宽度和高度
2. **CORS** - 从 URL 加载 PDF 时注意跨域问题
3. **性能** - 大文件可能需要更长的加载时间
4. **浏览器兼容性** - 需要支持 Canvas API 的现代浏览器

## 依赖

- `pdfjs-dist` - Mozilla 的 PDF.js 库
- 内置的 EventEmitter 类

## License

MIT