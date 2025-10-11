# 配置选项

完整的配置选项说明。

## PDFViewerConfig

```typescript
interface PDFViewerConfig {
  // 必需配置
  container: string | HTMLElement

  // 可选配置
  url?: string | Uint8Array
  scale?: number
  page?: number
  enableTextSelection?: boolean
  enableToolbar?: boolean
  enableThumbnails?: boolean
  enableSearch?: boolean
  renderMode?: 'canvas' | 'svg'
  maxCachePages?: number
  enableVirtualScroll?: boolean
  workerSrc?: string
  cMapUrl?: string
  cMapPacked?: boolean
  toolbar?: ToolbarConfig
  theme?: ThemeConfig
}
```

## 基础配置

### container
- **类型**: `string | HTMLElement`
- **必需**: 是
- **说明**: 容器元素或CSS选择器

```javascript
// 使用选择器
container: '#viewer'

// 使用元素
container: document.getElementById('viewer')
```

### url
- **类型**: `string | Uint8Array`
- **默认值**: `undefined`
- **说明**: PDF文件URL或二进制数据

```javascript
// URL
url: 'https://example.com/document.pdf'

// 本地文件
url: '/documents/sample.pdf'

// 二进制数据
url: new Uint8Array([...])
```

### scale
- **类型**: `number`
- **默认值**: `1.0`
- **范围**: `0.1 - 5.0`
- **说明**: 初始缩放比例

```javascript
scale: 1.5  // 150%
```

### page
- **类型**: `number`
- **默认值**: `1`
- **说明**: 初始显示的页码（从1开始）

```javascript
page: 5  // 从第5页开始
```

## 功能开关

### enableToolbar
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示工具栏

### enableTextSelection
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用文本选择

### enableSearch
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用搜索功能

### enableThumbnails
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用缩略图（开发中）

### enableVirtualScroll
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用虚拟滚动（开发中）

## 渲染配置

### renderMode
- **类型**: `'canvas' | 'svg'`
- **默认值**: `'canvas'`
- **说明**: 渲染模式

```javascript
renderMode: 'canvas'  // Canvas渲染（推荐）
renderMode: 'svg'     // SVG渲染（开发中）
```

### maxCachePages
- **类型**: `number`
- **默认值**: `20`
- **说明**: 最大缓存页数

```javascript
maxCachePages: 30  // 缓存30页
```

## Worker 配置

### workerSrc
- **类型**: `string`
- **必需**: 否（推荐配置）
- **说明**: PDF.js Worker文件路径

```javascript
workerSrc: '/pdf.worker.min.mjs'
```

### cMapUrl
- **类型**: `string`
- **默认值**: CDN地址
- **说明**: CMap文件URL（用于字符映射）

```javascript
cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/'
```

### cMapPacked
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否使用压缩的CMap

## 工具栏配置

### toolbar
- **类型**: `ToolbarConfig`
- **默认值**: 所有功能启用

```typescript
interface ToolbarConfig {
  showZoom?: boolean
  showPageNav?: boolean
  showDownload?: boolean
  showPrint?: boolean
  showRotate?: boolean
  customButtons?: CustomButton[]
}
```

**示例**:

```javascript
toolbar: {
  showZoom: true,
  showPageNav: true,
  showDownload: false,  // 隐藏下载按钮
  showPrint: true,
  showRotate: true,
  customButtons: [
    {
      id: 'bookmark',
      text: '书签',
      icon: '🔖',
      onClick: () => {
        console.log('Add bookmark')
      }
    }
  ]
}
```

## 主题配置

### theme
- **类型**: `ThemeConfig`
- **默认值**: 默认深色主题

```typescript
interface ThemeConfig {
  primaryColor?: string
  backgroundColor?: string
  toolbarBackground?: string
  textColor?: string
}
```

**示例**:

```javascript
theme: {
  primaryColor: '#0969da',
  backgroundColor: '#1e293b',
  toolbarBackground: '#0f172a',
  textColor: '#f1f5f9'
}
```

## 完整示例

```javascript
const viewer = new PDFViewer({
  // 必需配置
  container: '#viewer',

  // 文档配置
  url: 'document.pdf',
  scale: 1.2,
  page: 1,

  // 功能开关
  enableToolbar: true,
  enableSearch: true,
  enableTextSelection: true,
  enableThumbnails: false,
  enableVirtualScroll: false,

  // 渲染配置
  renderMode: 'canvas',
  maxCachePages: 30,

  // Worker配置
  workerSrc: '/pdf.worker.min.mjs',
  cMapUrl: '/cmaps/',
  cMapPacked: true,

  // 工具栏配置
  toolbar: {
    showZoom: true,
    showPageNav: true,
    showDownload: true,
    showPrint: true,
    showRotate: true
  },

  // 主题配置
  theme: {
    primaryColor: '#7c3aed',
    backgroundColor: '#1e293b',
    toolbarBackground: '#0f172a',
    textColor: '#f1f5f9'
  }
})
```

## 配置更新

大多数配置是初始化时设置的，但某些设置可以动态更新：

```javascript
// 动态更新缩放
viewer.setZoom(1.5)

// 动态更新页码
await viewer.goToPage(10)

// 动态旋转
viewer.rotate(90)
```
