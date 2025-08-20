# 基础使用示例

这个示例展示了如何使用PDF预览组件的基本功能。

## 功能特性

- PDF文档加载和显示
- 页面导航（上一页/下一页）
- 基础缩放控制
- 简单的错误处理

## 文件说明

- `index.html` - 主页面文件
- `main.js` - 主要的JavaScript逻辑
- `styles.css` - 样式文件
- `sample.pdf` - 示例PDF文件（需要自行提供）

## 运行方式

1. 确保已安装PDF预览组件包
2. 将示例PDF文件放置在当前目录
3. 在浏览器中打开 `index.html`

## 代码说明

### 基本初始化

```javascript
import { createPdfViewer } from '@ldesign/pdf';

const viewer = createPdfViewer({
  container: document.getElementById('pdf-container'),
  enableCache: true,
  cacheSize: 50
});
```

### 加载PDF文档

```javascript
viewer.loadPdf('sample.pdf')
  .then(() => {
    console.log('PDF加载成功');
  })
  .catch(error => {
    console.error('PDF加载失败:', error);
  });
```

### 页面导航

```javascript
// 下一页
viewer.nextPage();

// 上一页
viewer.previousPage();

// 跳转到指定页面
viewer.goToPage(3);
```

### 缩放控制

```javascript
// 放大
viewer.zoomIn();

// 缩小
viewer.zoomOut();

// 设置特定缩放比例
viewer.setZoom(1.5);
```