# 开始使用 Word Viewer

欢迎使用 Word Viewer！本指南将帮助你在 5 分钟内开始使用这个插件。

## 🚀 第一步：安装依赖

在项目目录中运行：

```bash
npm install
```

这将安装所有必要的依赖包。

## 🔨 第二步：构建项目

```bash
npm run build
```

构建完成后，你会在 `dist/` 目录中看到以下文件：

```
dist/
├── index.esm.js         # ESM 格式（推荐）
├── index.cjs.js         # CommonJS 格式
├── index.umd.js         # UMD 格式（浏览器直接使用）
├── index.d.ts           # TypeScript 类型声明
├── vue.esm.js           # Vue 组件
├── react.esm.js         # React 组件
└── lit.esm.js           # Lit Web Component
```

## 📖 第三步：选择使用方式

### 方式 1: 在浏览器中直接使用（最简单）

1. 打开项目根目录的 `index.html` 文件
2. 这是一个完整的演示页面，展示了所有功能
3. 在浏览器中打开即可使用

### 方式 2: 在你的项目中使用

#### A. 原生 JavaScript/TypeScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Word Viewer Demo</title>
</head>
<body>
  <div id="viewer" style="height: 600px;"></div>
  
  <script type="module">
    import { WordViewer } from './dist/index.esm.js';
    
    const viewer = new WordViewer('#viewer');
    
    // 从文件加载
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      await viewer.loadFile(e.target.files[0]);
    };
    document.body.prepend(input);
  </script>
</body>
</html>
```

#### B. Vue 3 项目

```vue
<template>
  <div>
    <input type="file" @change="handleFile" />
    <WordViewer :source="file" :zoom="1.0" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from './dist/vue.esm.js';

const file = ref(null);

function handleFile(e) {
  file.value = e.target.files[0];
}
</script>
```

#### C. React 项目

```tsx
import React, { useState } from 'react';
import { WordViewerComponent } from './dist/react.esm.js';

function App() {
  const [file, setFile] = useState(null);
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <WordViewerComponent source={file} />
    </div>
  );
}
```

#### D. Lit Web Component

```html
<script type="module">
  import './dist/lit.esm.js';
</script>

<word-viewer src="document.docx"></word-viewer>
```

## 🎯 第四步：探索功能

### 基本功能

```javascript
const viewer = new WordViewer('#container');

// 加载文档
await viewer.loadFile(file);              // 从 File 对象
await viewer.loadUrl('path/to/doc.docx'); // 从 URL
await viewer.loadBuffer(arrayBuffer);     // 从 ArrayBuffer

// 缩放
viewer.setZoom(1.5);                      // 设置为 150%
const zoom = viewer.getZoom();            // 获取当前缩放

// 搜索
const results = viewer.search('关键词');
console.log(`找到 ${results.length} 个结果`);

// 页面导航
viewer.goToPage(3);                       // 跳转到第 3 页
const info = viewer.getPageInfo();        // 获取页面信息
```

### 编辑功能

```javascript
// 启用编辑
viewer.enableEdit();

// 插入文本
viewer.insertText('Hello World');

// 应用格式
viewer.applyFormat({
  bold: true,
  fontSize: 16,
  color: '#ff0000',
});

// 插入图片
viewer.insertImage(imageFile, {
  width: 300,
  alignment: 'center',
});

// 撤销/重做
viewer.undo();
viewer.redo();
```

### 导出功能

```javascript
// 导出为 PDF
const pdfBlob = await viewer.exportToPDF();
downloadFile(pdfBlob, 'document.pdf');

// 导出为 HTML
const html = viewer.exportToHTML();

// 导出为 DOCX
const docxBlob = await viewer.exportToDocx();
```

### 事件监听

```javascript
// 文档加载完成
viewer.on('loaded', (data) => {
  console.log('文档已加载', data);
});

// 错误处理
viewer.on('error', (error) => {
  console.error('错误:', error);
});

// 加载进度
viewer.on('progress', (progress) => {
  console.log(`进度: ${progress.percentage}%`);
});

// 文档修改
viewer.on('changed', () => {
  console.log('文档已修改');
});
```

## 📚 第五步：查看示例

项目包含了完整的示例：

### 1. 原生 JavaScript 示例

打开 `examples/vanilla/index.html`

### 2. Vue 3 示例

查看 `examples/vue/App.vue`

### 3. React 示例

查看 `examples/react/App.tsx`

## 🎨 自定义配置

```javascript
const viewer = new WordViewer('#container', {
  // 主题
  theme: 'light',              // 'light' | 'dark' | 'auto'
  
  // 编辑模式
  editable: false,             // 是否可编辑
  
  // 工具栏
  showToolbar: true,           // 显示工具栏
  
  // 缩放
  initialZoom: 1.0,            // 初始缩放级别
  
  // 只读模式
  readOnly: false,             // 只读模式
  
  // 页码
  showPageNumbers: true,       // 显示页码
  
  // 搜索
  enableSearch: true,          // 启用搜索
  
  // 渲染引擎
  renderEngine: 'auto',        // 'docx-preview' | 'mammoth' | 'auto'
  
  // 语言
  language: 'zh-CN',           // 'zh-CN' | 'en-US'
});
```

## 🔧 开发模式

如果你要修改源代码：

```bash
# 启动 watch 模式
npm run dev
```

这将监听文件变化并自动重新构建。

## 💡 常见问题

### Q: 文档没有显示？

**A:** 确保：
1. 已运行 `npm run build` 构建项目
2. 容器元素有足够的高度（至少 400px）
3. 文件路径正确
4. 查看浏览器控制台的错误信息

### Q: 如何处理大文件？

**A:** 监听 `progress` 事件显示加载进度：

```javascript
viewer.on('progress', (progress) => {
  updateProgressBar(progress.percentage);
});
```

### Q: 支持哪些浏览器？

**A:** 
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### Q: 如何切换主题？

**A:** 

```javascript
// 创建时指定
const viewer = new WordViewer('#app', { theme: 'dark' });

// 或动态切换
viewer.updateOptions({ theme: 'dark' });
```

### Q: 导出的 PDF 质量如何？

**A:** 导出功能会尽可能保留原始格式和样式。对于复杂文档，建议使用原始的 DOCX 格式。

## 📖 进一步学习

- **完整文档**: 查看 [README.md](./README.md)
- **API 参考**: 查看 [API.md](./API.md)
- **贡献指南**: 查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🎉 完成！

现在你已经掌握了 Word Viewer 的基本使用方法。开始创建你的应用吧！

如有问题，欢迎：
- 查看文档
- 提交 Issue
- 参与讨论

祝你使用愉快！ 🚀



