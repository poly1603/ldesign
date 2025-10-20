# 📊 Excel Viewer - 功能强大的 Excel 文件预览编辑插件

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Lit](https://img.shields.io/badge/Lit-3.x-orange.svg)](https://lit.dev/)

一个功能完善、强大的 Excel 文件预览编辑插件，支持在浏览器中查看和编辑 Excel 文件。提供原生 JavaScript、Vue 3、React 和 Lit Web Components 多种使用方式。

## ✨ 特性

- 📁 **多格式支持** - 支持 `.xlsx`、`.xls`、`.csv` 等格式
- 🎨 **样式保留** - 完整保留 Excel 原始样式（字体、颜色、边框、对齐等）
- ✏️ **完整编辑** - 单元格编辑、公式计算、复制粘贴、撤销重做
- 📊 **多工作表** - 支持多个工作表切换和管理
- 🔍 **搜索筛选** - 强大的搜索、筛选、排序功能
- 💾 **多种导出** - 导出为 Excel、CSV、HTML、JSON、截图
- 🚀 **大文件支持** - 虚拟滚动技术，轻松处理 10 万+ 行数据
- ⚡ **性能优化** - Web Worker、懒加载、内存优化
- 🎯 **框架无关** - 提供原生 JS、Vue、React、Lit 多种封装
- 🌍 **国际化** - 支持中文、英文
- 🎨 **主题支持** - 亮色、暗色主题
- 📱 **响应式** - 自适应各种屏幕尺寸

## 📦 安装

### NPM

```bash
# 核心库
npm install @ldesign/excel-viewer-core

# Vue 3 组件
npm install @ldesign/excel-viewer-vue

# React 组件
npm install @ldesign/excel-viewer-react

# Lit Web Component
npm install @ldesign/excel-viewer-lit
```

### CDN

```html
<!-- Luckysheet 依赖 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>

<!-- Excel Viewer Core -->
<script src="https://unpkg.com/@ldesign/excel-viewer-core/dist/index.umd.js"></script>
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { ExcelViewer } from '@ldesign/excel-viewer-core';

const viewer = new ExcelViewer({
  container: '#excel-viewer',
  showToolbar: true,
  showFormulaBar: true,
  allowEdit: true,
  lang: 'zh'
});

// 加载文件
await viewer.loadFile(file);

// 导出文件
viewer.downloadFile({
  format: 'xlsx',
  filename: 'export.xlsx'
});
```

### Vue 3

```vue
<template>
  <ExcelViewer
    ref="viewerRef"
    :file="excelFile"
    :show-toolbar="true"
    :allow-edit="true"
    lang="zh"
    @load="handleLoad"
    @cell-change="handleCellChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-vue';

const viewerRef = ref();
const excelFile = ref(null);

const handleLoad = (data) => {
  console.log('加载成功', data);
};

const handleCellChange = (data) => {
  console.log('单元格变化', data);
};
</script>
```

### React

```tsx
import { useRef } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-react';

function App() {
  const viewerRef = useRef(null);

  return (
    <ExcelViewer
      ref={viewerRef}
      file={excelFile}
      showToolbar={true}
      allowEdit={true}
      lang="zh"
      onLoad={(data) => console.log('加载成功', data)}
      onCellChange={(data) => console.log('单元格变化', data)}
    />
  );
}
```

### Lit Web Component

```html
<excel-viewer
  id="viewer"
  show-toolbar="true"
  allow-edit="true"
  lang="zh"
></excel-viewer>

<script type="module">
  import '@ldesign/excel-viewer-lit';

  const viewer = document.getElementById('viewer');
  
  viewer.addEventListener('load', (e) => {
    console.log('加载成功', e.detail);
  });
  
  await viewer.loadFile(file);
</script>
```

## 📚 文档

### 核心 API

#### ExcelViewer 类

```typescript
class ExcelViewer {
  // 构造函数
  constructor(options: ExcelViewerOptions)
  
  // 加载文件
  loadFile(file: File | ArrayBuffer | string): Promise<void>
  
  // 获取数据
  getData(): SheetData[]
  getCurrentSheetData(): any
  
  // 导出功能
  exportFile(options: ExportOptions): Blob
  downloadFile(options: ExportOptions): void
  exportScreenshot(filename?: string): Promise<Blob>
  
  // 编辑操作
  setCellValue(row: number, col: number, value: any): void
  getCellValue(row: number, col: number): any
  undo(): void
  redo(): void
  
  // 工作表操作
  setActiveSheet(index: number): void
  getCurrentSheetIndex(): number
  
  // 搜索功能
  search(options: SearchOptions): SearchResult[]
  
  // 选择操作
  getSelection(): SelectionRange | null
  
  // 冻结窗格
  setFreeze(type: 'row' | 'column' | 'both', row?: number, column?: number): void
  
  // 刷新和销毁
  refresh(): void
  destroy(): void
  
  // 事件监听
  on(event: EventType, listener: EventListener): void
  off(event: EventType, listener: EventListener): void
}
```

#### 配置选项

```typescript
interface ExcelViewerOptions {
  // 容器
  container: string | HTMLElement;
  
  // UI 选项
  showToolbar?: boolean;        // 显示工具栏，默认 true
  showFormulaBar?: boolean;     // 显示公式栏，默认 true
  showSheetTabs?: boolean;      // 显示工作表标签，默认 true
  
  // 功能选项
  allowEdit?: boolean;          // 允许编辑，默认 true
  allowCopy?: boolean;          // 允许复制，默认 true
  allowPaste?: boolean;         // 允许粘贴，默认 true
  
  // 性能选项
  enableVirtualScroll?: boolean;    // 启用虚拟滚动，默认 true
  virtualScrollThreshold?: number;  // 虚拟滚动阈值，默认 100000
  
  // 其他选项
  lang?: 'zh' | 'en';          // 语言，默认 'zh'
  theme?: 'light' | 'dark';    // 主题，默认 'light'
  customStyle?: string;         // 自定义 CSS
  
  // 事件钩子
  hooks?: ExcelViewerHooks;
  
  // 性能配置
  performance?: {
    useWebWorker?: boolean;
    chunkSize?: number;
    lazyLoad?: boolean;
  };
}
```

#### 导出选项

```typescript
interface ExportOptions {
  format: 'xlsx' | 'csv' | 'html' | 'json';
  filename?: string;
  includeStyles?: boolean;
  includeFormulas?: boolean;
  sheets?: number[] | string[];  // 要导出的工作表
}
```

### 事件系统

```typescript
// 可用事件
type EventType =
  | 'load'              // 文件加载完成
  | 'loadError'         // 加载错误
  | 'cellChange'        // 单元格变化
  | 'cellClick'         // 单元格点击
  | 'cellDoubleClick'   // 单元格双击
  | 'selectionChange'   // 选择变化
  | 'sheetChange'       // 工作表切换
  | 'export'            // 导出
  | 'error'             // 错误
  | 'destroy';          // 销毁

// 使用示例
viewer.on('cellChange', (data) => {
  console.log('单元格变化:', data);
});
```

## 🎯 使用场景

- 📊 **数据展示** - 在 Web 应用中展示 Excel 报表
- ✏️ **在线编辑** - 提供 Excel 文件的在线编辑功能
- 📈 **数据分析** - 加载和分析 Excel 数据
- 💾 **格式转换** - Excel 与其他格式的相互转换
- 📱 **移动端查看** - 在移动设备上查看 Excel 文件
- 🔍 **数据搜索** - 在大型 Excel 文件中快速搜索数据

## 🏗️ 项目结构

```
excel/
├── packages/
│   ├── core/              # 核心功能包
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── viewer.ts
│   │   │   ├── parser.ts
│   │   │   ├── renderer.ts
│   │   │   ├── exporter.ts
│   │   │   └── types.ts
│   │   └── package.json
│   ├── vue/               # Vue 3 封装
│   ├── react/             # React 封装
│   └── lit/               # Lit 封装
├── examples/              # 示例项目
│   ├── vanilla/
│   ├── vue-demo/
│   ├── react-demo/
│   └── lit-demo/
├── docs/                  # 文档
├── rollup.config.js
├── tsconfig.json
└── package.json
```

## 🔧 开发

### 安装依赖

```bash
npm install
```

### 构建

```bash
# 构建所有包
npm run build

# 构建单个包
npm run build:core
npm run build:vue
npm run build:react
npm run build:lit
```

### 开发模式

```bash
npm run dev
```

### 代码检查

```bash
npm run lint
```

### 类型检查

```bash
npm run type-check
```

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

本项目基于以下优秀的开源项目：

- [SheetJS](https://github.com/SheetJS/sheetjs) - Excel 文件解析
- [Luckysheet](https://github.com/mengshukeji/Luckysheet) - 在线表格渲染引擎
- [html2canvas](https://github.com/niklasvh/html2canvas) - 截图功能

## 📮 联系方式

- 作者: ldesign
- 问题反馈: [GitHub Issues](https://github.com/ldesign/excel-viewer/issues)

---

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**


