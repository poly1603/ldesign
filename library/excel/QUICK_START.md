# 快速开始指南

## 🚀 5分钟上手 Excel Viewer

### 步骤 1: 安装依赖

```bash
# 进入项目目录
cd excel

# 安装所有依赖
npm install
```

### 步骤 2: 构建项目

```bash
# 构建所有包
npm run build

# 或者构建单个包
npm run build:core    # 只构建核心包
npm run build:vue     # 只构建 Vue 组件
npm run build:react   # 只构建 React 组件
npm run build:lit     # 只构建 Lit 组件
```

### 步骤 3: 查看示例

#### 原生 JavaScript 示例

```bash
# 直接在浏览器打开
open examples/vanilla/index.html
```

或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (需要先安装 http-server)
npx http-server -p 8000

# 然后访问
http://localhost:8000/examples/vanilla/
```

#### Vue 示例

```bash
# 创建 Vue 项目（如果还没有）
npm create vue@latest excel-viewer-vue-demo

cd excel-viewer-vue-demo
npm install

# 安装 Excel Viewer Vue 组件
npm install @ldesign/excel-viewer-vue

# 将 examples/vue-demo/App.vue 复制到项目中
# 然后运行
npm run dev
```

#### React 示例

```bash
# 创建 React 项目（如果还没有）
npx create-react-app excel-viewer-react-demo --template typescript

cd excel-viewer-react-demo
npm install

# 安装 Excel Viewer React 组件
npm install @ldesign/excel-viewer-react

# 将 examples/react-demo/App.tsx 和 App.css 复制到项目中
# 然后运行
npm start
```

#### Lit 示例

```bash
# 直接在浏览器打开
open examples/lit-demo/index.html
```

## 📝 基础使用

### 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">
</head>
<body>
  <div id="excel-viewer" style="width: 100%; height: 600px;"></div>

  <script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>
  <script src="./packages/core/dist/index.umd.js"></script>
  
  <script>
    const viewer = new ExcelViewerCore.ExcelViewer({
      container: '#excel-viewer',
      showToolbar: true,
      allowEdit: true
    });

    // 加载文件
    document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      await viewer.loadFile(file);
    });
  </script>
</body>
</html>
```

### Vue 3

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" accept=".xlsx,.xls,.csv">
    <ExcelViewer
      ref="viewerRef"
      :file="currentFile"
      :show-toolbar="true"
      :allow-edit="true"
      @load="handleLoad"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-vue';

const viewerRef = ref();
const currentFile = ref(null);

const handleFileChange = (e) => {
  currentFile.value = e.target.files[0];
};

const handleLoad = (data) => {
  console.log('加载成功', data);
};
</script>
```

### React

```tsx
import { useRef } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-react';

function App() {
  const viewerRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // 文件会通过 file prop 传递给组件
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
      <ExcelViewer
        ref={viewerRef}
        showToolbar={true}
        allowEdit={true}
        onLoad={(data) => console.log('加载成功', data)}
      />
    </div>
  );
}
```

### Lit Web Component

```html
<excel-viewer
  id="viewer"
  show-toolbar="true"
  allow-edit="true"
></excel-viewer>

<script type="module">
  import '@ldesign/excel-viewer-lit';

  const viewer = document.getElementById('viewer');
  
  viewer.addEventListener('load', (e) => {
    console.log('加载成功', e.detail);
  });

  // 加载文件
  document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    await viewer.loadFile(file);
  });
</script>
```

## 🎯 常用功能

### 导出文件

```javascript
// 导出 Excel
viewer.downloadFile({
  format: 'xlsx',
  filename: 'export.xlsx'
});

// 导出 CSV
viewer.downloadFile({
  format: 'csv',
  filename: 'data.csv'
});
```

### 搜索内容

```javascript
const results = viewer.search({
  keyword: 'Apple',
  caseSensitive: false
});

console.log(`找到 ${results.length} 个匹配项`);
```

### 编辑单元格

```javascript
// 设置单元格值
viewer.setCellValue(0, 0, 'Hello World');

// 获取单元格值
const value = viewer.getCellValue(0, 0);

// 撤销/重做
viewer.undo();
viewer.redo();
```

### 切换工作表

```javascript
// 获取所有工作表
const sheets = viewer.getData();
console.log('工作表:', sheets.map(s => s.name));

// 切换到指定工作表
viewer.setActiveSheet(1); // 切换到第 2 个工作表
```

## 📚 下一步

- 📖 阅读 [完整文档](docs/GUIDE.md)
- 🔧 查看 [API 文档](docs/API.md)
- ❓ 查看 [常见问题](docs/FAQ.md)
- 💡 查看 [项目概述](docs/OVERVIEW.md)

## 🐛 遇到问题？

1. 查看 [FAQ](docs/FAQ.md)
2. 查看 [GitHub Issues](https://github.com/ldesign/excel-viewer/issues)
3. 提交新的 Issue

## 🤝 参与贡献

查看 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

---

**祝你使用愉快！** 🎉


