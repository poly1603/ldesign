# Word Viewer

一个功能强大的 Word 文档查看和编辑插件，支持 .docx 和 .doc 格式，可在任意框架中使用。

## 特性

✨ **功能丰富**
- 📄 支持 .docx 和 .doc 格式
- 👁️ 高质量文档渲染
- ✏️ 文档编辑功能
- 🔍 文本搜索和高亮
- 📤 多格式导出（PDF、HTML、DOCX、TXT）
- 🎨 深色/浅色主题
- 🔄 缩放和分页

🚀 **易于集成**
- 原生 JavaScript/TypeScript
- Vue 3 组件
- React 组件
- Lit Web Component
- 完整的 TypeScript 类型定义

📦 **灵活的打包**
- ESM、CJS、UMD 多种格式
- Tree-shaking 支持
- 按需加载

## 安装

```bash
npm install @word-viewer/core
# 或
yarn add @word-viewer/core
# 或
pnpm add @word-viewer/core
```

## 使用方法

### 原生 JavaScript/TypeScript

```typescript
import { WordViewer } from '@word-viewer/core';

const viewer = new WordViewer('#container', {
  theme: 'light',
  editable: false,
  showToolbar: true,
});

// 从文件加载
const file = document.querySelector('input[type="file"]').files[0];
await viewer.loadFile(file);

// 从 URL 加载
await viewer.loadUrl('https://example.com/document.docx');

// 设置缩放
viewer.setZoom(1.5);

// 搜索文本
const results = viewer.search('关键词');

// 启用编辑
viewer.enableEdit();

// 导出文档
const pdfBlob = await viewer.exportToPDF();
const html = viewer.exportToHTML();
```

### Vue 3

```vue
<template>
  <WordViewer
    :source="documentFile"
    :zoom="1.2"
    :editable="true"
    theme="light"
    @loaded="onLoaded"
    @error="onError"
    @changed="onChanged"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '@word-viewer/core/vue';

const documentFile = ref<File | null>(null);

function onLoaded(data: any) {
  console.log('文档已加载', data);
}

function onError(error: any) {
  console.error('加载错误', error);
}

function onChanged() {
  console.log('文档已修改');
}
</script>
```

### React

```tsx
import React, { useRef } from 'react';
import { WordViewerComponent, WordViewerRef } from '@word-viewer/core/react';

function App() {
  const viewerRef = useRef<WordViewerRef>(null);
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleExport = async () => {
    const viewer = viewerRef.current?.getViewer();
    if (viewer) {
      const pdf = await viewer.exportToPDF();
      // 处理导出的 PDF
    }
  };

  return (
    <div>
      <input type="file" accept=".docx,.doc" onChange={handleFileChange} />
      <button onClick={handleExport}>导出 PDF</button>
      
      <WordViewerComponent
        ref={viewerRef}
        source={file}
        zoom={1.0}
        editable={false}
        theme="light"
        onLoaded={(data) => console.log('已加载', data)}
        onError={(error) => console.error('错误', error)}
      />
    </div>
  );
}
```

### Lit Web Component

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@word-viewer/core/lit';
  </script>
</head>
<body>
  <word-viewer
    src="https://example.com/document.docx"
    zoom="1.2"
    theme="light"
    editable
  ></word-viewer>

  <script type="module">
    const viewer = document.querySelector('word-viewer');
    
    viewer.addEventListener('loaded', (e) => {
      console.log('文档已加载', e.detail);
    });

    // 从文件加载
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      viewer.source = file;
    };
  </script>
</body>
</html>
```

## API 文档

### WordViewer 类

#### 构造函数

```typescript
new WordViewer(container: HTMLElement | string, options?: ViewerOptions)
```

#### 选项 (ViewerOptions)

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
}
```

#### 方法

**文档加载**
- `loadFile(file: File): Promise<void>` - 从文件加载
- `loadUrl(url: string): Promise<void>` - 从 URL 加载
- `loadBuffer(buffer: ArrayBuffer): Promise<void>` - 从 ArrayBuffer 加载

**查看功能**
- `setZoom(level: number): void` - 设置缩放级别（0.5 - 3.0）
- `getZoom(): number` - 获取当前缩放级别
- `goToPage(page: number): void` - 跳转到指定页
- `getPageInfo(): PageInfo` - 获取页面信息
- `search(keyword: string): SearchResult[]` - 搜索文本

**编辑功能**
- `enableEdit(): void` - 启用编辑模式
- `disableEdit(): void` - 禁用编辑模式
- `insertText(text: string, position?: number): void` - 插入文本
- `insertImage(image: File | Blob, options?: InsertImageOptions): void` - 插入图片
- `applyFormat(format: TextFormat): void` - 应用文本格式
- `undo(): void` - 撤销
- `redo(): void` - 重做
- `getEditState(): EditState` - 获取编辑状态

**导出功能**
- `exportToPDF(): Promise<Blob>` - 导出为 PDF
- `exportToHTML(): string` - 导出为 HTML
- `exportToDocx(): Promise<Blob>` - 导出为 DOCX
- `export(options: ExportOptions): Promise<Blob | string>` - 通用导出方法

**其他**
- `getDocumentInfo(): DocumentInfo | null` - 获取文档信息
- `updateOptions(options: Partial<ViewerOptions>): void` - 更新配置
- `destroy(): void` - 销毁实例

#### 事件

```typescript
viewer.on('loaded', (data) => {});      // 文档加载完成
viewer.on('error', (error) => {});      // 加载或渲染错误
viewer.on('progress', (progress) => {}); // 加载进度
viewer.on('changed', () => {});         // 文档内容改变
viewer.on('zoom', (level) => {});       // 缩放改变
viewer.on('page-change', (info) => {}); // 页面改变
viewer.on('edit-start', () => {});      // 开始编辑
viewer.on('edit-end', () => {});        // 结束编辑
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 常见问题

### 1. 文档渲染不正确？

尝试切换渲染引擎：
```typescript
const viewer = new WordViewer('#container', {
  renderEngine: 'mammoth' // 或 'docx-preview'
});
```

### 2. 如何处理大文件？

启用进度监听：
```typescript
viewer.on('progress', (progress) => {
  console.log(`${progress.percentage}%`);
});
```

### 3. 支持哪些文本格式？

支持加粗、斜体、下划线、删除线、字体、颜色、对齐等常见格式。

## 示例项目

查看 `examples` 目录获取完整示例：
- `examples/vanilla` - 原生 JavaScript 示例
- `examples/vue` - Vue 3 示例
- `examples/react` - React 示例
- `examples/lit` - Lit 示例



