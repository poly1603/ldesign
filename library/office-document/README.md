# @ldesign/office-viewer

一个功能强大、框架无关的 Office 文档阅读器，支持在浏览器中查看 Word、Excel 和 PowerPoint 文件。

## ✨ 特性

- 📄 **支持多种文档格式**：Word (.docx)、Excel (.xlsx)、PowerPoint (.pptx)
- 🎨 **框架无关**：可在原生 JS、Vue、React 等任何框架中使用
- 🚀 **使用简单**：通过 `new OfficeViewer()` 即可创建实例
- 💪 **功能强大**：
 - 缩放控制
 - 下载文档
 - 打印文档
 - 全屏模式
 - 工具栏自定义
 - 主题切换（明亮/暗黑）
 - Excel 多表格切换
 - PowerPoint 幻灯片导航
- ⚡ **性能优越**：优化的渲染引擎，快速加载和显示
- 🎯 **TypeScript 支持**：完整的类型定义
- 📱 **响应式设计**：适配各种屏幕尺寸

## 📦 安装

```bash
npm install @ldesign/office-viewer
```

或使用 yarn：

```bash
yarn add @ldesign/office-viewer
```

## 🚀 快速开始

### 基础用法

```typescript
import { OfficeViewer } from '@ldesign/office-viewer';

// 创建查看器实例
const viewer = new OfficeViewer({
 container: '#viewer', // 容器元素或选择器
 source: 'document.docx', // 文档源（URL、File、ArrayBuffer 或 Blob）
 enableZoom: true,
 enableDownload: true,
 showToolbar: true
});
```

### 从文件上传加载

```typescript
const fileInput = document.querySelector('#fileInput');

fileInput.addEventListener('change', (e) => {
 const file = e.target.files[0];

 const viewer = new OfficeViewer({
  container: '#viewer',
  source: file,
  onLoad: () => {
   console.log('文档加载成功');
  },
  onError: (error) => {
   console.error('加载失败:', error);
  }
 });
});
```

### Excel 特定配置

```typescript
const viewer = new OfficeViewer({
 container: '#viewer',
 source: 'spreadsheet.xlsx',
 type: 'excel',
 excel: {
  defaultSheet: 0, // 默认显示第一个表格
  showSheetTabs: true, // 显示表格标签
  showFormulaBar: true, // 显示公式栏
  showGridLines: true, // 显示网格线
  enableEditing: false // 禁用编辑
 }
});
```

### PowerPoint 特定配置

```typescript
const viewer = new OfficeViewer({
 container: '#viewer',
 source: 'presentation.pptx',
 type: 'powerpoint',
 powerpoint: {
  autoPlay: true, // 自动播放
  autoPlayInterval: 3000, // 自动播放间隔（毫秒）
  showNavigation: true, // 显示导航按钮
  showThumbnails: true // 显示缩略图
 }
});
```

## 📖 API 文档

### 构造函数选项

```typescript
interface ViewerOptions {
 // 必需
 container: HTMLElement | string; // 容器元素或选择器
 source: string | File | ArrayBuffer | Blob; // 文档源

 // 可选
 type?: 'word' | 'excel' | 'powerpoint'; // 文档类型（自动检测）
 width?: string | number; // 宽度（默认：'100%'）
 height?: string | number; // 高度（默认：'600px'）
 enableZoom?: boolean; // 启用缩放（默认：true）
 enableDownload?: boolean; // 启用下载（默认：true）
 enablePrint?: boolean; // 启用打印（默认：true）
 enableFullscreen?: boolean; // 启用全屏（默认：true）
 showToolbar?: boolean; // 显示工具栏（默认：true）
 theme?: 'light' | 'dark'; // 主题（默认：'light'）
 className?: string; // 自定义 CSS 类名

 // 回调函数
 onLoad?: () => void; // 加载成功回调
 onError?: (error: Error) => void; // 错误回调
 onProgress?: (progress: number) => void; // 加载进度回调

 // Excel 选项
 excel?: {
  defaultSheet?: number;
  showSheetTabs?: boolean;
  showFormulaBar?: boolean;
  showGridLines?: boolean;
  enableEditing?: boolean;
 };

 // PowerPoint 选项
 powerpoint?: {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showThumbnails?: boolean;
 };

 // Word 选项
 word?: {
  showOutline?: boolean;
  pageView?: 'single' | 'continuous';
 };
}
```

### 实例方法

```typescript
class OfficeViewer {
 // 加载新文档
 load(source: string | File | ArrayBuffer | Blob, type?: DocumentType): Promise<void>;

 // 重新加载当前文档
 reload(): Promise<void>;

 // 获取文档元数据
 getMetadata(): Promise<DocumentMetadata>;

 // 缩放控制
 zoomIn(): void;
 zoomOut(): void;
 setZoom(level: number): void;
 getZoom(): number;

 // 下载文档
 download(filename?: string): void;

 // 打印文档
 print(): void;

 // 全屏控制
 fullscreen(): void;
 exitFullscreen(): void;

 // 页面导航（Word/PowerPoint）
 goToPage(page: number): void;

 // 表格切换（Excel）
 switchSheet(sheetIndex: number): void;

 // 事件监听
 on(event: ViewerEventType, handler: EventHandler): void;
 off(event: ViewerEventType, handler: EventHandler): void;

 // 销毁查看器
 destroy(): void;
}
```

### 事件

```typescript
// 监听文档加载完成
viewer.on('load', () => {
 console.log('文档已加载');
});

// 监听错误
viewer.on('error', (error) => {
 console.error('错误:', error);
});

// 监听缩放变化
viewer.on('zoom', (level) => {
 console.log('缩放级别:', level);
});

// 监听页面切换
viewer.on('page-change', (page) => {
 console.log('当前页:', page);
});

// 监听表格切换
viewer.on('sheet-change', (sheet) => {
 console.log('当前表格:', sheet);
});
```

## 🎨 在不同框架中使用

### 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
 <title>Office Viewer</title>
</head>
<body>
 <div id="viewer"></div>

 <script type="module">
  import { OfficeViewer } from '@ldesign/office-viewer';

  const viewer = new OfficeViewer({
   container: '#viewer',
   source: 'document.docx'
  });
 </script>
</body>
</html>
```

### Vue 3

```vue
<template>
 <div ref="viewerContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { OfficeViewer } from '@ldesign/office-viewer';

const viewerContainer = ref<HTMLDivElement>();
let viewer: OfficeViewer | null = null;

onMounted(() => {
 if (viewerContainer.value) {
  viewer = new OfficeViewer({
   container: viewerContainer.value,
   source: 'document.docx',
   enableZoom: true,
   showToolbar: true
  });
 }
});

onUnmounted(() => {
 viewer?.destroy();
});
</script>
```

### React

```tsx
import { useEffect, useRef } from 'react';
import { OfficeViewer } from '@ldesign/office-viewer';

function OfficeViewerComponent() {
 const containerRef = useRef<HTMLDivElement>(null);
 const viewerRef = useRef<OfficeViewer | null>(null);

 useEffect(() => {
  if (containerRef.current) {
   viewerRef.current = new OfficeViewer({
    container: containerRef.current,
    source: 'document.docx',
    enableZoom: true,
    showToolbar: true
   });
  }

  return () => {
   viewerRef.current?.destroy();
  };
 }, []);

 return <div ref={containerRef} />;
}

export default OfficeViewerComponent;
```

## 🔧 开发

```bash
# 安装依赖
pnpm install  # 在项目根目录运行

# 开发模式（监听文件变化并自动构建）
npm run dev

# 构建生产版本
npm run build
```

### 运行示例

```bash
# 1. 进入示例目录
cd example

# 2. 安装示例项目的依赖
npm install

# 3. 添加示例文件（可选）
# 在 example/samples/ 目录下放置以下文件：
# - sample.docx  (Word 文档)
# - sample.xlsx  (Excel 表格)
# - sample.pptx  (PowerPoint 演示文稿)
# 
# 或者，直接使用页面上的文件上传功能上传您自己的文档

# 4. 启动开发服务器
npm run dev
```

**注意**：示例项目需要示例文件才能使用"加载示例文件"功能。请参考 `example/samples/README.md` 了解如何添加示例文件。

## 📝 技术栈

- **Word 渲染**：[mammoth.js](https://github.com/mwilliamson/mammoth.js) - 将 DOCX 转换为 HTML
- **Excel 渲染**：[SheetJS](https://sheetjs.com/) - 解析和渲染 Excel 文件
- **PowerPoint 渲染**：自定义实现，使用 JSZip 解析 PPTX 结构
- **JSZip**：解析 ZIP 格式文件（.docx, .xlsx, .pptx 都是 ZIP 格式）
- **TypeScript**：完整的类型支持
- **Rollup**：模块打包

## 🔧 故障排除

### 错误："Failed to resolve import 'jszip'"

**解决方案**：
1. 确保已安装 `jszip` 依赖：
   ```bash
   pnpm install
   ```
2. `jszip` 已添加到 `package.json` 的 `dependencies` 中

### 错误："Can't find end of central directory"

这个错误通常表示：
1. **示例文件不存在**：请在 `example/samples/` 目录下添加正确的 Office 文档
2. **文件损坏**：尝试使用其他 Office 文档
3. **文件格式不正确**：确保文件是正确的 .docx/.xlsx/.pptx 格式，而不是旧版的 .doc/.xls/.ppt

**推荐操作**：
- 直接使用页面上的文件上传功能测试您自己的文档
- 参考 `example/samples/README.md` 创建示例文件

### Rollup 构建错误

如果遇到构建错误，尝试：
```bash
# 清理构建缓存
rm -rf dist

# 重新安装依赖
pnpm install

# 重新构建
npm run build
```

## 🌟 特性路线图

- [x] 基础 Word 文档查看
- [x] 基础 Excel 表格查看
- [x] 基础 PowerPoint 幻灯片查看
- [x] 缩放、下载、打印功能
- [x] 主题切换
- [x] 事件系统
- [ ] 完整的 PowerPoint 渲染（动画、转场效果）
- [ ] PDF 导出
- [ ] 文档批注支持
- [ ] 协同编辑
- [ ] Vue/React 组件封装

## 📄 许可证

MIT License © ldesign

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系

如有问题或建议，请提交 Issue 或联系维护者。

---

**由 ldesign 用心打造** ❤️
