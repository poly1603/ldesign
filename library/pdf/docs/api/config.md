# 配置选项

PDFViewer 支持丰富的配置选项，满足各种使用场景。

## 基础配置

### container

- **类型**: `HTMLElement | string`
- **默认值**: `undefined`
- **说明**: PDF容器元素或选择器

```typescript
// 使用元素
const container = document.getElementById('pdf-container');
new PDFViewer({ container });

// 使用选择器
new PDFViewer({ container: '#pdf-container' });
```

### workerSrc

- **类型**: `string`
- **默认值**: `undefined`
- **必填**: 是
- **说明**: PDF.js Worker文件路径

```typescript
new PDFViewer({
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});
```

### scale

- **类型**: `ScaleMode`
- **默认值**: `'auto'`
- **说明**: 初始缩放模式
- **可选值**: `'auto'` | `'page-fit'` | `'page-width'` | `'page-height'` | `number`

```typescript
new PDFViewer({
  scale: 'auto',      // 自动
  scale: 'page-fit',  // 适应页面
  scale: 'page-width',// 适应宽度
  scale: 1.5,         // 150%
});
```

### quality

- **类型**: `RenderQuality`
- **默认值**: `'medium'`
- **说明**: 渲染质量
- **可选值**: `'low'` | `'medium'` | `'high'` | `'ultra'`

```typescript
new PDFViewer({
  quality: 'high',
});
```

### layout

- **类型**: `LayoutMode`
- **默认值**: `'continuous'`
- **说明**: 页面布局模式
- **可选值**: `'single'` | `'continuous'` | `'double'` | `'book'`

```typescript
new PDFViewer({
  layout: 'continuous',  // 连续滚动
  layout: 'single',      // 单页
  layout: 'double',      // 双页
});
```

### initialPage

- **类型**: `number`
- **默认值**: `1`
- **说明**: 初始页码

```typescript
new PDFViewer({
  initialPage: 5, // 从第5页开始
});
```

### virtualScroll

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用虚拟滚动

```typescript
new PDFViewer({
  virtualScroll: true,
});
```

### enableTextSelection

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用文本选择

```typescript
new PDFViewer({
  enableTextSelection: true,
});
```

### enableAnnotations

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用注释

```typescript
new PDFViewer({
  enableAnnotations: true,
});
```

## 缓存配置

### cache

缓存相关配置。

```typescript
interface CacheConfig {
  enabled?: boolean;
  maxPages?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
  preloadPages?: number;
}
```

#### enabled

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用缓存

#### maxPages

- **类型**: `number`
- **默认值**: `50`
- **说明**: 最大缓存页面数

#### strategy

- **类型**: `'lru' | 'fifo' | 'lfu'`
- **默认值**: `'lru'`
- **说明**: 缓存策略
  - `lru`: Least Recently Used（最近最少使用）
  - `fifo`: First In First Out（先进先出）
  - `lfu`: Least Frequently Used（最不经常使用）

#### preloadPages

- **类型**: `number`
- **默认值**: `3`
- **说明**: 预加载页面数量

**示例:**

```typescript
new PDFViewer({
  cache: {
    enabled: true,
    maxPages: 100,
    strategy: 'lru',
    preloadPages: 5,
  },
});
```

## 渲染配置

### render

渲染相关配置。

```typescript
interface RenderConfig {
  dpi?: number;
  canvasOptimization?: boolean;
  useWorker?: boolean;
  timeout?: number;
  maxConcurrent?: number;
}
```

#### dpi

- **类型**: `number`
- **默认值**: `96`
- **说明**: 渲染DPI

#### canvasOptimization

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用Canvas优化

#### useWorker

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否使用Web Worker

#### timeout

- **类型**: `number`
- **默认值**: `30000`
- **说明**: 渲染超时时间（毫秒）

#### maxConcurrent

- **类型**: `number`
- **默认值**: `3`
- **说明**: 最大并发渲染数

**示例:**

```typescript
new PDFViewer({
  render: {
    dpi: 150,
    useWorker: true,
    maxConcurrent: 5,
  },
});
```

## 搜索配置

### search

搜索相关配置。

```typescript
interface SearchConfig {
  caseSensitive?: boolean;
  wholeWords?: boolean;
  regex?: boolean;
  highlightColor?: string;
  currentMatchColor?: string;
}
```

#### caseSensitive

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否区分大小写

#### wholeWords

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否全词匹配

#### regex

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否支持正则表达式

#### highlightColor

- **类型**: `string`
- **默认值**: `'rgba(255, 255, 0, 0.3)'`
- **说明**: 高亮颜色

#### currentMatchColor

- **类型**: `string`
- **默认值**: `'rgba(255, 165, 0, 0.5)'`
- **说明**: 当前匹配项颜色

**示例:**

```typescript
new PDFViewer({
  search: {
    caseSensitive: false,
    wholeWords: false,
    regex: true,
    highlightColor: 'rgba(255, 255, 0, 0.3)',
  },
});
```

## 缩略图配置

### thumbnail

缩略图相关配置。

```typescript
interface ThumbnailConfig {
  enabled?: boolean;
  width?: number;
  height?: number;
  quality?: RenderQuality;
  lazyLoad?: boolean;
}
```

#### enabled

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用缩略图

#### width

- **类型**: `number`
- **默认值**: `150`
- **说明**: 缩略图宽度

#### height

- **类型**: `number`
- **默认值**: `200`
- **说明**: 缩略图高度

#### quality

- **类型**: `RenderQuality`
- **默认值**: `'low'`
- **说明**: 缩略图质量

#### lazyLoad

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否懒加载

**示例:**

```typescript
new PDFViewer({
  thumbnail: {
    enabled: true,
    width: 200,
    height: 280,
    quality: 'medium',
    lazyLoad: true,
  },
});
```

## 打印配置

### print

打印相关配置。

```typescript
interface PrintConfig {
  dpi?: number;
  showDialog?: boolean;
  orientation?: 'portrait' | 'landscape';
}
```

#### dpi

- **类型**: `number`
- **默认值**: `300`
- **说明**: 打印DPI

#### showDialog

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示打印对话框

#### orientation

- **类型**: `'portrait' | 'landscape'`
- **默认值**: `'portrait'`
- **说明**: 打印方向

**示例:**

```typescript
new PDFViewer({
  print: {
    dpi: 300,
    showDialog: true,
    orientation: 'portrait',
  },
});
```

## 插件配置

### plugins

- **类型**: `PDFPlugin[]`
- **默认值**: `[]`
- **说明**: 插件列表

```typescript
new PDFViewer({
  plugins: [myPlugin1, myPlugin2],
});
```

## 事件监听

### on

事件监听器配置。

```typescript
new PDFViewer({
  on: {
    loadComplete: (info) => {
      console.log('加载完成', info);
    },
    pageChange: (page) => {
      console.log('页面切换', page);
    },
    scaleChange: (scale) => {
      console.log('缩放改变', scale);
    },
  },
});
```

详见[事件系统](/api/events)。

## 完整配置示例

```typescript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  // 基础配置
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
  scale: 'auto',
  quality: 'high',
  layout: 'continuous',
  initialPage: 1,
  virtualScroll: true,
  enableTextSelection: true,
  enableAnnotations: true,

  // 缓存配置
  cache: {
    enabled: true,
    maxPages: 100,
    strategy: 'lru',
    preloadPages: 5,
  },

  // 渲染配置
  render: {
    dpi: 150,
    canvasOptimization: true,
    useWorker: true,
    timeout: 30000,
    maxConcurrent: 5,
  },

  // 搜索配置
  search: {
    caseSensitive: false,
    wholeWords: false,
    regex: false,
    highlightColor: 'rgba(255, 255, 0, 0.3)',
    currentMatchColor: 'rgba(255, 165, 0, 0.5)',
  },

  // 缩略图配置
  thumbnail: {
    enabled: true,
    width: 150,
    height: 200,
    quality: 'low',
    lazyLoad: true,
  },

  // 打印配置
  print: {
    dpi: 300,
    showDialog: true,
    orientation: 'portrait',
  },

  // 插件
  plugins: [],

  // 事件监听
  on: {
    loadStart: (source) => console.log('开始加载', source),
    loadProgress: (progress) => console.log('加载进度', progress),
    loadComplete: (info) => console.log('加载完成', info),
    loadError: (error) => console.error('加载错误', error),
    pageChange: (page) => console.log('页面切换', page),
    scaleChange: (scale) => console.log('缩放改变', scale),
    renderStart: (page) => console.log('渲染开始', page),
    renderComplete: (page) => console.log('渲染完成', page),
    renderError: (page, error) => console.error('渲染错误', page, error),
    searchComplete: (results) => console.log('搜索完成', results),
    textSelect: (text) => console.log('文本选择', text),
    destroy: () => console.log('销毁'),
  },
});
```
