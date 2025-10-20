# 使用指南

## 目录

- [安装](#安装)
- [快速开始](#快速开始)
- [高级用法](#高级用法)
- [性能优化](#性能优化)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 安装

### NPM 安装

根据你使用的框架选择对应的包：

```bash
# 原生 JavaScript
npm install @ldesign/excel-viewer-core

# Vue 3
npm install @ldesign/excel-viewer-vue

# React
npm install @ldesign/excel-viewer-react

# Lit Web Component
npm install @ldesign/excel-viewer-lit
```

### CDN 引入

```html
<!-- 引入 Luckysheet 依赖 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>

<!-- 引入 Excel Viewer -->
<script src="https://unpkg.com/@ldesign/excel-viewer-core/dist/index.umd.js"></script>
```

## 快速开始

### 1. 创建容器

```html
<div id="excel-viewer" style="width: 100%; height: 600px;"></div>
```

### 2. 初始化查看器

```javascript
import { ExcelViewer } from '@ldesign/excel-viewer-core';

const viewer = new ExcelViewer({
  container: '#excel-viewer',
  showToolbar: true,
  showFormulaBar: true,
  allowEdit: true
});
```

### 3. 加载文件

#### 从文件输入框加载

```javascript
document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  await viewer.loadFile(file);
});
```

#### 从 URL 加载

```javascript
await viewer.loadFile('https://example.com/data.xlsx');
```

#### 从 ArrayBuffer 加载

```javascript
const response = await fetch('https://example.com/data.xlsx');
const arrayBuffer = await response.arrayBuffer();
await viewer.loadFile(arrayBuffer);
```

## 高级用法

### 事件处理

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  hooks: {
    // 加载前钩子
    beforeLoad: async (file) => {
      console.log('准备加载文件:', file);
      return true; // 返回 false 可以取消加载
    },
    
    // 加载后钩子
    afterLoad: (sheets) => {
      console.log('文件加载完成:', sheets);
    },
    
    // 单元格变化前
    beforeCellChange: (sheetIndex, row, col, oldValue, newValue) => {
      console.log('单元格即将变化:', { sheetIndex, row, col, oldValue, newValue });
      return true; // 返回 false 可以阻止变化
    },
    
    // 单元格变化后
    afterCellChange: (sheetIndex, row, col, oldValue, newValue) => {
      console.log('单元格已变化:', { sheetIndex, row, col, oldValue, newValue });
    },
    
    // 单元格点击
    onCellClick: (sheetIndex, row, col, value) => {
      console.log('单元格点击:', { sheetIndex, row, col, value });
    },
    
    // 单元格双击
    onCellDoubleClick: (sheetIndex, row, col, value) => {
      console.log('单元格双击:', { sheetIndex, row, col, value });
    },
    
    // 选择变化
    onSelectionChange: (range) => {
      console.log('选择区域变化:', range);
    },
    
    // 错误处理
    onError: (error) => {
      console.error('发生错误:', error);
    }
  }
});

// 也可以使用 on/off 方法监听事件
viewer.on('cellChange', (data) => {
  console.log('单元格变化:', data);
});
```

### 数据操作

#### 获取数据

```javascript
// 获取所有工作表数据
const allSheets = viewer.getData();

// 获取当前工作表数据
const currentSheet = viewer.getCurrentSheetData();

// 获取特定单元格值
const value = viewer.getCellValue(0, 0); // 第 1 行第 1 列
```

#### 修改数据

```javascript
// 设置单元格值
viewer.setCellValue(0, 0, 'Hello World');

// 批量设置（需要遍历）
const data = [
  ['A1', 'B1', 'C1'],
  ['A2', 'B2', 'C2'],
  ['A3', 'B3', 'C3']
];

data.forEach((row, rowIndex) => {
  row.forEach((value, colIndex) => {
    viewer.setCellValue(rowIndex, colIndex, value);
  });
});
```

### 搜索功能

```javascript
// 基础搜索
const results = viewer.search({
  keyword: 'Apple'
});

// 高级搜索
const advancedResults = viewer.search({
  keyword: 'Apple',
  caseSensitive: true,        // 区分大小写
  matchWholeWord: true,       // 全字匹配
  scope: 'all',               // 搜索范围: 'current' | 'all'
  searchFormulas: true        // 搜索公式
});

// 处理搜索结果
results.forEach(result => {
  console.log(`找到匹配: 工作表"${result.sheetName}", 位置(${result.row}, ${result.col}), 值: ${result.value}`);
});
```

### 导出功能

#### 导出 Excel

```javascript
// 导出为 Blob
const blob = viewer.exportFile({
  format: 'xlsx',
  includeStyles: true,
  includeFormulas: true
});

// 直接下载
viewer.downloadFile({
  format: 'xlsx',
  filename: 'my-export.xlsx',
  includeStyles: true,
  includeFormulas: true
});

// 导出指定工作表
viewer.downloadFile({
  format: 'xlsx',
  filename: 'selected-sheets.xlsx',
  sheets: [0, 2] // 只导出第 1 和第 3 个工作表
});

// 也可以使用工作表名称
viewer.downloadFile({
  format: 'xlsx',
  filename: 'selected-sheets.xlsx',
  sheets: ['Sheet1', 'Sheet3']
});
```

#### 导出 CSV

```javascript
viewer.downloadFile({
  format: 'csv',
  filename: 'data.csv'
});
```

#### 导出 HTML

```javascript
viewer.downloadFile({
  format: 'html',
  filename: 'table.html',
  includeStyles: true
});
```

#### 导出 JSON

```javascript
viewer.downloadFile({
  format: 'json',
  filename: 'data.json'
});
```

#### 导出截图

```javascript
// 导出为 Blob
const imageBlob = await viewer.exportScreenshot();

// 直接下载
await viewer.downloadScreenshot('screenshot.png');
```

### 工作表操作

```javascript
// 获取所有工作表
const sheets = viewer.getData();
console.log('工作表列表:', sheets.map(s => s.name));

// 切换工作表
viewer.setActiveSheet(1); // 切换到第 2 个工作表

// 获取当前工作表索引
const currentIndex = viewer.getCurrentSheetIndex();
```

### 编辑操作

```javascript
// 撤销
viewer.undo();

// 重做
viewer.redo();

// 刷新视图
viewer.refresh();
```

### 冻结窗格

```javascript
// 冻结前 3 行
viewer.setFreeze('row', 3);

// 冻结前 2 列
viewer.setFreeze('column', undefined, 2);

// 冻结前 3 行和前 2 列
viewer.setFreeze('both', 3, 2);
```

## 性能优化

### 大文件处理

对于大文件（10 万+ 行），启用虚拟滚动：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  enableVirtualScroll: true,
  virtualScrollThreshold: 100000, // 超过 10 万行启用虚拟滚动
  performance: {
    useWebWorker: true,   // 使用 Web Worker 解析文件
    chunkSize: 10000,     // 分块大小
    lazyLoad: true        // 懒加载
  }
});
```

### 内存优化

```javascript
// 使用完毕后销毁实例
viewer.destroy();

// 如果只需要查看，禁用编辑功能以减少内存占用
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  allowEdit: false,
  allowCopy: false,
  allowPaste: false
});
```

## Vue 3 使用指南

### 基础用法

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" accept=".xlsx,.xls,.csv">
    
    <ExcelViewer
      ref="viewerRef"
      :file="currentFile"
      :show-toolbar="true"
      :allow-edit="true"
      lang="zh"
      height="600px"
      @load="handleLoad"
      @cell-change="handleCellChange"
    />
    
    <button @click="exportData">导出 Excel</button>
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

const handleCellChange = (data) => {
  console.log('单元格变化', data);
};

const exportData = () => {
  viewerRef.value?.downloadFile({
    format: 'xlsx',
    filename: 'export.xlsx'
  });
};
</script>
```

### 使用 Composition API

```vue
<script setup>
import { ref, watch } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-vue';

const viewerRef = ref();
const fileUrl = ref('');

// 监听 URL 变化自动加载
watch(fileUrl, (newUrl) => {
  if (newUrl && viewerRef.value) {
    viewerRef.value.loadFile(newUrl);
  }
});

// 搜索功能
const searchKeyword = ref('');
const searchResults = ref([]);

const search = () => {
  if (viewerRef.value && searchKeyword.value) {
    searchResults.value = viewerRef.value.search({
      keyword: searchKeyword.value
    });
  }
};
</script>
```

## React 使用指南

### 使用组件

```tsx
import { useRef, useState } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-react';
import type { ExcelViewerRef } from '@ldesign/excel-viewer-react';

function App() {
  const viewerRef = useRef<ExcelViewerRef>(null);
  const [currentFile, setCurrentFile] = useState<File>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCurrentFile(file);
  };

  const exportData = () => {
    viewerRef.current?.downloadFile({
      format: 'xlsx',
      filename: 'export.xlsx'
    });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
      
      <ExcelViewer
        ref={viewerRef}
        file={currentFile}
        showToolbar={true}
        allowEdit={true}
        lang="zh"
        height="600px"
        onLoad={(data) => console.log('加载成功', data)}
        onCellChange={(data) => console.log('单元格变化', data)}
      />
      
      <button onClick={exportData}>导出 Excel</button>
    </div>
  );
}
```

### 使用 Hook

```tsx
import { useExcelViewer } from '@ldesign/excel-viewer-react';

function App() {
  const {
    containerRef,
    loadFile,
    getData,
    downloadFile,
    search
  } = useExcelViewer({
    showToolbar: true,
    allowEdit: true,
    onLoad: (data) => console.log('加载成功', data),
    onCellChange: (data) => console.log('单元格变化', data)
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await loadFile(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <div ref={containerRef} style={{ height: '600px' }} />
      <button onClick={() => downloadFile({ format: 'xlsx' })}>
        导出
      </button>
    </div>
  );
}
```

## Lit Web Component 使用指南

### HTML 使用

```html
<excel-viewer
  id="viewer"
  show-toolbar="true"
  allow-edit="true"
  lang="zh"
  height="600px"
></excel-viewer>

<script type="module">
  import '@ldesign/excel-viewer-lit';

  const viewer = document.getElementById('viewer');
  
  // 监听事件
  viewer.addEventListener('load', (e) => {
    console.log('加载成功', e.detail);
  });
  
  viewer.addEventListener('cell-change', (e) => {
    console.log('单元格变化', e.detail);
  });
  
  // 加载文件
  document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    await viewer.loadFile(file);
  });
  
  // 导出
  document.querySelector('#export-btn').addEventListener('click', () => {
    viewer.downloadFile({
      format: 'xlsx',
      filename: 'export.xlsx'
    });
  });
</script>
```

### 在其他框架中使用

由于是标准 Web Component，可以在任何框架中使用：

```vue
<!-- Vue -->
<template>
  <excel-viewer ref="viewerRef" show-toolbar="true"></excel-viewer>
</template>
```

```jsx
// React
function App() {
  return <excel-viewer show-toolbar="true"></excel-viewer>;
}
```

## 最佳实践

### 1. 错误处理

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  hooks: {
    onError: (error) => {
      // 统一错误处理
      console.error('Excel Viewer 错误:', error);
      alert(`发生错误: ${error.message}`);
    }
  }
});

// 加载文件时处理错误
try {
  await viewer.loadFile(file);
} catch (error) {
  console.error('文件加载失败:', error);
}
```

### 2. 加载状态提示

```javascript
const loadingEl = document.getElementById('loading');

viewer.on('load', (data) => {
  if (data.status === 'loading') {
    loadingEl.style.display = 'block';
  } else {
    loadingEl.style.display = 'none';
  }
});
```

### 3. 文件大小限制

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  
  if (file.size > MAX_FILE_SIZE) {
    alert('文件太大，请选择小于 10MB 的文件');
    return;
  }
  
  await viewer.loadFile(file);
});
```

### 4. 自动保存

```javascript
let autoSaveTimer;

viewer.on('cellChange', () => {
  // 防抖：延迟保存
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    const blob = viewer.exportFile({ format: 'xlsx' });
    // 保存到服务器或本地存储
    await saveToServer(blob);
  }, 2000); // 2 秒后保存
});
```

### 5. 资源清理

```javascript
// 在 Vue 组件中
onBeforeUnmount(() => {
  viewer.destroy();
});

// 在 React 组件中
useEffect(() => {
  return () => {
    viewer.destroy();
  };
}, []);

// 在原生 JS 中
window.addEventListener('beforeunload', () => {
  viewer.destroy();
});
```

## 常见问题

### Q: 如何处理超大文件？

A: 启用虚拟滚动和 Web Worker：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  enableVirtualScroll: true,
  performance: {
    useWebWorker: true,
    lazyLoad: true
  }
});
```

### Q: 如何自定义样式？

A: 使用 `customStyle` 选项：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  customStyle: `
    .luckysheet-toolbar {
      background-color: #f0f0f0;
    }
  `
});
```

### Q: 如何禁用某些功能？

A: 通过配置选项禁用：

```javascript
const viewer = new ExcelViewer({
  container: '#excel-viewer',
  allowEdit: false,      // 禁用编辑
  allowCopy: false,      // 禁用复制
  showToolbar: false,    // 隐藏工具栏
  showFormulaBar: false  // 隐藏公式栏
});
```

### Q: 如何与后端集成？

A: 示例代码：

```javascript
// 从后端加载
const response = await fetch('/api/excel/file/123');
const arrayBuffer = await response.arrayBuffer();
await viewer.loadFile(arrayBuffer);

// 保存到后端
viewer.on('cellChange', async () => {
  const blob = viewer.exportFile({ format: 'xlsx' });
  const formData = new FormData();
  formData.append('file', blob, 'file.xlsx');
  
  await fetch('/api/excel/save', {
    method: 'POST',
    body: formData
  });
});
```

### Q: 性能优化建议？

A: 
1. 对于只读场景，禁用编辑功能
2. 使用虚拟滚动处理大文件
3. 启用 Web Worker 进行文件解析
4. 及时调用 `destroy()` 释放资源
5. 避免频繁的全量数据获取

更多问题请查看 [FAQ](FAQ.md) 或提交 [Issue](https://github.com/ldesign/excel-viewer/issues)。


