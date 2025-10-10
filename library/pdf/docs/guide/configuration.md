# 配置选项

本页面介绍如何配置PDFViewer以满足不同的使用需求。

## 基础配置

最简单的配置只需要指定容器和Worker路径：

```typescript
const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});
```

## 显示配置

### 缩放模式

控制PDF的显示大小：

```typescript
new PDFViewer({
  scale: 'auto',        // 自动缩放
  scale: 'page-fit',    // 适应整个页面
  scale: 'page-width',  // 适应宽度
  scale: 'page-height', // 适应高度
  scale: 1.5,           // 固定比例 (150%)
});
```

### 渲染质量

调整渲染质量以平衡性能和清晰度：

```typescript
new PDFViewer({
  quality: 'low',     // 低质量，高性能
  quality: 'medium',  // 中等质量（默认）
  quality: 'high',    // 高质量
  quality: 'ultra',   // 超高质量
});
```

### 布局模式

选择页面布局方式：

```typescript
new PDFViewer({
  layout: 'single',     // 单页显示
  layout: 'continuous', // 连续滚动（默认）
  layout: 'double',     // 双页显示
  layout: 'book',       // 书籍模式
});
```

## 性能优化

### 缓存设置

启用缓存可以大幅提升性能：

```typescript
new PDFViewer({
  cache: {
    enabled: true,      // 启用缓存
    maxPages: 100,      // 最多缓存100页
    strategy: 'lru',    // 使用LRU策略
    preloadPages: 5,    // 预加载5页
  },
});
```

**缓存策略说明：**

- `lru` (Least Recently Used): 淘汰最近最少使用的页面，适合顺序阅读
- `fifo` (First In First Out): 淘汰最早加载的页面，适合随机访问
- `lfu` (Least Frequently Used): 淘汰访问频率最低的页面，适合频繁跳转

### 渲染设置

调整渲染参数以优化性能：

```typescript
new PDFViewer({
  render: {
    dpi: 150,              // 渲染DPI（越高越清晰但越慢）
    useWorker: true,       // 使用Web Worker
    maxConcurrent: 5,      // 最多同时渲染5页
    canvasOptimization: true, // 启用Canvas优化
  },
});
```

### 虚拟滚动

对于大型PDF，启用虚拟滚动可以显著提升性能：

```typescript
new PDFViewer({
  virtualScroll: true, // 默认启用
});
```

## 功能配置

### 文本选择

启用或禁用文本选择功能：

```typescript
new PDFViewer({
  enableTextSelection: true, // 允许选择文本
});
```

### 注释

启用或禁用PDF注释显示：

```typescript
new PDFViewer({
  enableAnnotations: true, // 显示注释
});
```

### 搜索

配置搜索功能：

```typescript
new PDFViewer({
  search: {
    caseSensitive: false,  // 不区分大小写
    wholeWords: false,     // 不要求全词匹配
    regex: false,          // 不使用正则表达式
    highlightColor: 'rgba(255, 255, 0, 0.3)',     // 高亮颜色
    currentMatchColor: 'rgba(255, 165, 0, 0.5)',  // 当前匹配颜色
  },
});
```

### 缩略图

配置缩略图功能：

```typescript
new PDFViewer({
  thumbnail: {
    enabled: true,      // 启用缩略图
    width: 150,         // 宽度
    height: 200,        // 高度
    quality: 'low',     // 质量
    lazyLoad: true,     // 懒加载
  },
});
```

### 打印

配置打印选项：

```typescript
new PDFViewer({
  print: {
    dpi: 300,               // 打印DPI
    showDialog: true,       // 显示打印对话框
    orientation: 'portrait', // 纵向打印
  },
});
```

## 事件配置

在初始化时配置事件监听器：

```typescript
new PDFViewer({
  on: {
    loadComplete: (info) => {
      console.log(`文档加载完成: ${info.numPages}页`);
    },
    pageChange: (page) => {
      console.log(`切换到第${page}页`);
    },
    scaleChange: (scale) => {
      console.log(`缩放比例: ${Math.round(scale * 100)}%`);
    },
    loadError: (error) => {
      console.error('加载失败:', error.message);
    },
  },
});
```

详见[事件系统](/guide/events)。

## 插件配置

在初始化时加载插件：

```typescript
const myPlugin = {
  name: 'my-plugin',
  install(viewer) {
    // 插件逻辑
  },
};

new PDFViewer({
  plugins: [myPlugin],
});
```

详见[插件系统](/guide/plugins)。

## 使用场景配置

### 高性能场景

适合大型PDF或性能较差的设备：

```typescript
new PDFViewer({
  quality: 'low',
  virtualScroll: true,
  cache: {
    enabled: true,
    maxPages: 50,
    strategy: 'lru',
    preloadPages: 2,
  },
  render: {
    dpi: 96,
    maxConcurrent: 3,
  },
});
```

### 高质量场景

适合需要高清晰度显示的场景：

```typescript
new PDFViewer({
  quality: 'ultra',
  cache: {
    enabled: true,
    maxPages: 20,
    preloadPages: 1,
  },
  render: {
    dpi: 300,
    maxConcurrent: 1,
  },
});
```

### 移动端场景

适合移动设备：

```typescript
new PDFViewer({
  quality: 'medium',
  scale: 'page-width',
  virtualScroll: true,
  cache: {
    enabled: true,
    maxPages: 30,
    preloadPages: 2,
  },
  render: {
    dpi: 120,
    maxConcurrent: 2,
  },
});
```

## 动态配置

某些配置可以在运行时修改：

```typescript
const viewer = new PDFViewer(/* ... */);

// 修改缩放
viewer.setScale(1.5);

// 修改页面
viewer.goToPage(10);
```

## 配置验证

PDFViewer会自动验证配置并使用默认值替换无效配置：

```typescript
new PDFViewer({
  scale: -1,  // 无效，将使用默认值 'auto'
  quality: 'invalid', // 无效，将使用默认值 'medium'
});
```

## 完整配置模板

```typescript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  // === 基础配置 ===
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',

  // === 显示配置 ===
  scale: 'auto',
  quality: 'medium',
  layout: 'continuous',
  initialPage: 1,

  // === 功能开关 ===
  virtualScroll: true,
  enableTextSelection: true,
  enableAnnotations: true,

  // === 缓存配置 ===
  cache: {
    enabled: true,
    maxPages: 50,
    strategy: 'lru',
    preloadPages: 3,
  },

  // === 渲染配置 ===
  render: {
    dpi: 96,
    canvasOptimization: true,
    useWorker: true,
    timeout: 30000,
    maxConcurrent: 3,
  },

  // === 搜索配置 ===
  search: {
    caseSensitive: false,
    wholeWords: false,
    regex: false,
  },

  // === 缩略图配置 ===
  thumbnail: {
    enabled: true,
    width: 150,
    height: 200,
    quality: 'low',
    lazyLoad: true,
  },

  // === 打印配置 ===
  print: {
    dpi: 300,
    showDialog: true,
    orientation: 'portrait',
  },

  // === 插件配置 ===
  plugins: [],

  // === 事件配置 ===
  on: {
    loadComplete: (info) => console.log('加载完成', info),
    pageChange: (page) => console.log('页面切换', page),
    scaleChange: (scale) => console.log('缩放改变', scale),
  },
});
```

## 下一步

- [事件系统](/guide/events) - 了解如何监听事件
- [性能优化](/guide/performance) - 了解性能优化技巧
- [最佳实践](/guide/best-practices) - 了解使用最佳实践
