# 快速开始

5 分钟快速上手 Word Viewer 插件。

## 📦 安装

```bash
npm install @word-viewer/core
```

## 🚀 使用

### 1. 原生 JavaScript

最简单的使用方式：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Word Viewer</title>
</head>
<body>
  <div id="viewer" style="height: 600px;"></div>
  
  <script type="module">
    import { WordViewer } from '@word-viewer/core';
    
    const viewer = new WordViewer('#viewer');
    viewer.loadUrl('document.docx');
  </script>
</body>
</html>
```

### 2. Vue 3

```vue
<template>
  <WordViewer :source="file" />
</template>

<script setup>
import { ref } from 'vue';
import { WordViewerComponent as WordViewer } from '@word-viewer/core/vue';

const file = ref(null);

// 从文件输入加载
function handleFile(event) {
  file.value = event.target.files[0];
}
</script>
```

### 3. React

```tsx
import React, { useState } from 'react';
import { WordViewerComponent } from '@word-viewer/core/react';

function App() {
  const [file, setFile] = useState(null);
  
  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <WordViewerComponent 
        source={file} 
        style={{ height: '600px' }} 
      />
    </div>
  );
}
```

### 4. Lit Web Component

```html
<script type="module">
  import '@word-viewer/core/lit';
</script>

<word-viewer src="document.docx"></word-viewer>
```

## 🎯 常用功能

### 缩放

```javascript
viewer.setZoom(1.5);  // 150%
```

### 搜索

```javascript
const results = viewer.search('关键词');
console.log(`找到 ${results.length} 个结果`);
```

### 编辑

```javascript
viewer.enableEdit();
viewer.insertText('Hello World');
viewer.applyFormat({ bold: true, fontSize: 16 });
```

### 导出

```javascript
// 导出为 PDF
const pdf = await viewer.exportToPDF();

// 导出为 HTML
const html = viewer.exportToHTML();
```

### 事件监听

```javascript
viewer.on('loaded', () => {
  console.log('文档加载完成');
});

viewer.on('error', (error) => {
  console.error('出错了:', error);
});

viewer.on('changed', () => {
  console.log('文档已修改');
});
```

## 🎨 自定义主题

```javascript
const viewer = new WordViewer('#viewer', {
  theme: 'dark',  // 'light' | 'dark' | 'auto'
});

// 动态切换
viewer.updateOptions({ theme: 'light' });
```

## 📝 完整示例

```javascript
import { WordViewer } from '@word-viewer/core';

// 创建实例
const viewer = new WordViewer('#container', {
  theme: 'light',
  editable: true,
  showToolbar: true,
  initialZoom: 1.0,
});

// 加载文档
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await viewer.loadFile(file);
});

// 工具栏功能
document.getElementById('zoomIn').onclick = () => {
  viewer.setZoom(viewer.getZoom() + 0.1);
};

document.getElementById('zoomOut').onclick = () => {
  viewer.setZoom(viewer.getZoom() - 0.1);
};

document.getElementById('export').onclick = async () => {
  const blob = await viewer.exportToPDF();
  // 下载文件
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.pdf';
  a.click();
};

// 监听事件
viewer.on('loaded', () => {
  console.log('文档信息:', viewer.getDocumentInfo());
  console.log('页面信息:', viewer.getPageInfo());
});
```

## 🔧 配置选项

```typescript
interface ViewerOptions {
  readOnly?: boolean;           // 只读模式
  showToolbar?: boolean;        // 显示工具栏
  initialZoom?: number;         // 初始缩放 (0.5-3.0)
  theme?: 'light' | 'dark';     // 主题
  editable?: boolean;           // 可编辑
  showPageNumbers?: boolean;    // 显示页码
  enableSearch?: boolean;       // 启用搜索
  language?: 'zh-CN' | 'en-US'; // 语言
}
```

## 💡 提示

1. **大文件处理**：监听 `progress` 事件显示加载进度
2. **错误处理**：始终监听 `error` 事件
3. **内存管理**：使用完毕后调用 `viewer.destroy()`
4. **编辑模式**：启用编辑前确保文档已加载

## 📚 更多资源

- [完整 API 文档](./README.md#api-文档)
- [示例项目](./examples/)
- [更新日志](./CHANGELOG.md)

## ❓ 常见问题

**Q: 支持哪些文件格式？**
A: 目前支持 .docx 和 .doc 格式。

**Q: 可以在移动端使用吗？**
A: 可以，插件支持响应式设计。

**Q: 如何处理加载失败？**
A: 监听 `error` 事件并提供友好的错误提示。

**Q: 导出的 PDF 质量如何？**
A: 导出功能会尽可能保留原始格式和样式。

## 🤝 需要帮助？

遇到问题？欢迎：
- 查看 [README](./README.md)
- 提交 [Issue](https://github.com/your-repo/issues)
- 加入讨论



