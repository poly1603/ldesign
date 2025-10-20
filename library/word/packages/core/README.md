# @word-viewer/core

Word Viewer 核心库 - 无框架依赖的 Word 文档查看和编辑引擎。

## 📦 安装

```bash
npm install @word-viewer/core
```

## 🚀 快速开始

```typescript
import { WordViewer } from '@word-viewer/core';

// 创建实例
const viewer = new WordViewer('#container', {
  theme: 'light',
  editable: false,
});

// 加载文档
await viewer.loadFile(file);

// 缩放
viewer.setZoom(1.5);

// 搜索
const results = viewer.search('关键词');

// 导出
const pdf = await viewer.exportToPDF();
```

## ✨ 功能

- ✅ 文档加载（File、URL、ArrayBuffer、Blob）
- ✅ 高质量渲染（docx-preview + mammoth 双引擎）
- ✅ 缩放控制（50% - 300%）
- ✅ 分页导航
- ✅ 文本搜索和高亮
- ✅ 文档编辑和格式化
- ✅ 撤销/重做
- ✅ 多格式导出（PDF、HTML、DOCX、TXT）
- ✅ 深色/浅色主题
- ✅ 事件系统

## 📖 API

### 构造函数

```typescript
new WordViewer(container: HTMLElement | string, options?: ViewerOptions)
```

### 文档加载

```typescript
loadFile(file: File): Promise<void>
loadUrl(url: string): Promise<void>
loadBuffer(buffer: ArrayBuffer): Promise<void>
```

### 查看功能

```typescript
setZoom(level: number): void
getZoom(): number
goToPage(page: number): void
search(keyword: string): SearchResult[]
```

### 编辑功能

```typescript
enableEdit(): void
disableEdit(): void
insertText(text: string, position?: number): void
insertImage(image: File | Blob, options?: InsertImageOptions): void
applyFormat(format: TextFormat): void
undo(): void
redo(): void
```

### 导出功能

```typescript
exportToPDF(): Promise<Blob>
exportToHTML(): string
exportToDocx(): Promise<Blob>
```

### 事件系统

```typescript
on(event: EventType, callback: EventCallback): void
off(event: EventType, callback?: EventCallback): void
```

## 📝 配置选项

```typescript
interface ViewerOptions {
  readOnly?: boolean;
  showToolbar?: boolean;
  initialZoom?: number;
  theme?: 'light' | 'dark' | 'auto';
  renderEngine?: 'docx-preview' | 'mammoth' | 'auto';
  editable?: boolean;
  showPageNumbers?: boolean;
  enableSearch?: boolean;
  language?: 'zh-CN' | 'en-US';
}
```

## 🎯 示例

### 基本使用

```javascript
import { WordViewer } from '@word-viewer/core';

const viewer = new WordViewer('#app');

// 文件输入
document.querySelector('input').onchange = async (e) => {
  await viewer.loadFile(e.target.files[0]);
};
```

### 编辑模式

```javascript
viewer.enableEdit();
viewer.insertText('Hello World');
viewer.applyFormat({ bold: true, fontSize: 16 });
```

### 事件监听

```javascript
viewer.on('loaded', () => console.log('文档已加载'));
viewer.on('error', (error) => console.error('错误:', error));
viewer.on('changed', () => console.log('文档已修改'));
```

## 📦 依赖

- `docx-preview` - DOCX 文档预览
- `mammoth` - DOCX 转 HTML
- `docx` - 文档编辑
- `jszip` - ZIP 文件处理

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 📄 许可证

MIT


