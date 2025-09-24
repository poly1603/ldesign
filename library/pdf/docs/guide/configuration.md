# 配置选项

@ldesign/pdf 提供了丰富的配置选项，让你可以根据需求定制PDF预览器的行为和外观。

## 基础配置

### IPdfViewerConfig

```typescript
interface IPdfViewerConfig {
  // 必需配置
  container: HTMLElement              // PDF容器元素
  
  // 显示选项
  enableToolbar?: boolean            // 显示工具栏 (默认: true)
  enableSearch?: boolean             // 启用搜索功能 (默认: true)
  enableThumbnails?: boolean         // 显示缩略图 (默认: true)
  enableTextSelection?: boolean      // 启用文本选择 (默认: true)
  enableAnnotations?: boolean        // 显示注释 (默认: true)
  
  // 外观设置
  theme?: 'light' | 'dark'          // 主题 (默认: 'light')
  scale?: number                     // 初始缩放比例 (默认: 1.0)
  rotation?: number                  // 初始旋转角度 (默认: 0)
  
  // 性能选项
  cacheSize?: number                 // 页面缓存数量 (默认: 10)
  preloadPages?: number              // 预加载页面数 (默认: 2)
  
  // 自定义样式
  className?: string                 // 自定义CSS类名
  style?: Partial<CSSStyleDeclaration>
}
```

## 详细配置说明

### 显示选项

#### enableToolbar
控制是否显示内置工具栏。

```javascript
const viewer = createPdfViewer({
  container,
  enableToolbar: true  // 显示工具栏
})
```

工具栏包含以下功能：
- 页面导航（上一页/下一页）
- 页码输入框
- 缩放控制（放大/缩小/适应）
- 旋转按钮
- 搜索框
- 全屏按钮
- 下载/打印按钮

#### enableSearch
启用或禁用搜索功能。

```javascript
const viewer = createPdfViewer({
  container,
  enableSearch: true,  // 启用搜索
  searchOptions: {
    caseSensitive: false,     // 区分大小写
    wholeWords: false,        // 全词匹配
    highlightAll: true,       // 高亮所有匹配项
    findTimeout: 1000         // 搜索超时时间(ms)
  }
})
```

#### enableThumbnails
控制缩略图面板的显示。

```javascript
const viewer = createPdfViewer({
  container,
  enableThumbnails: true,
  thumbnailOptions: {
    width: 120,              // 缩略图宽度
    height: 160,             // 缩略图高度
    position: 'left',        // 位置: 'left' | 'right'
    collapsible: true        // 是否可折叠
  }
})
```

#### enableTextSelection
控制是否允许选择PDF中的文本。

```javascript
const viewer = createPdfViewer({
  container,
  enableTextSelection: true,
  textSelectionOptions: {
    enableCopy: true,        // 允许复制
    enableContextMenu: true  // 显示右键菜单
  }
})
```

#### enableAnnotations
控制是否显示PDF中的注释。

```javascript
const viewer = createPdfViewer({
  container,
  enableAnnotations: true,
  annotationOptions: {
    showPopups: true,        // 显示注释弹窗
    enableInteraction: true  // 允许交互
  }
})
```

### 外观设置

#### theme
设置预览器主题。

```javascript
const viewer = createPdfViewer({
  container,
  theme: 'dark',  // 'light' | 'dark'
  customTheme: {
    // 自定义主题变量
    '--pdf-bg-color': '#1a1a1a',
    '--pdf-text-color': '#ffffff',
    '--pdf-border-color': '#333333'
  }
})
```

#### scale
设置初始缩放比例。

```javascript
const viewer = createPdfViewer({
  container,
  scale: 1.25,     // 125% 缩放
  scaleOptions: {
    min: 0.25,     // 最小缩放 25%
    max: 5.0,      // 最大缩放 500%
    step: 0.25     // 缩放步长
  }
})
```

#### rotation
设置初始旋转角度。

```javascript
const viewer = createPdfViewer({
  container,
  rotation: 90,    // 顺时针旋转90度
  rotationOptions: {
    step: 90       // 旋转步长（度）
  }
})
```

### 性能选项

#### cacheSize
设置页面缓存数量，影响内存使用和性能。

```javascript
const viewer = createPdfViewer({
  container,
  cacheSize: 20,   // 缓存20个页面
  cacheOptions: {
    strategy: 'lru',        // 缓存策略: 'lru' | 'fifo'
    maxMemoryUsage: 100     // 最大内存使用(MB)
  }
})
```

#### preloadPages
设置预加载页面数量，提升翻页体验。

```javascript
const viewer = createPdfViewer({
  container,
  preloadPages: 3,  // 预加载前后3页
  preloadOptions: {
    direction: 'both',      // 预加载方向: 'forward' | 'backward' | 'both'
    priority: 'visible'     // 优先级: 'visible' | 'sequential'
  }
})
```

### 自定义样式

#### className
添加自定义CSS类名。

```javascript
const viewer = createPdfViewer({
  container,
  className: 'my-pdf-viewer custom-theme'
})
```

```css
.my-pdf-viewer {
  border: 2px solid #007acc;
  border-radius: 8px;
}

.my-pdf-viewer.custom-theme {
  --pdf-toolbar-bg: #f0f0f0;
  --pdf-page-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
```

#### style
直接设置内联样式。

```javascript
const viewer = createPdfViewer({
  container,
  style: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px'
  }
})
```

## Vue 组件配置

### 组件属性

```vue
<PdfViewer
  :src="pdfUrl"
  :config="viewerConfig"
  :enable-toolbar="true"
  :enable-search="true"
  :enable-thumbnails="true"
  :enable-text-selection="true"
  :enable-annotations="true"
  :theme="'light'"
  :scale="1.0"
  :rotation="0"
  :cache-size="10"
  :preload-pages="2"
  :class-name="'my-pdf-viewer'"
  :loading-text="'加载中...'"
  :error-text="'加载失败'"
/>
```

### Hook 配置

```javascript
const {
  loadDocument,
  // ... 其他方法
} = usePdfViewer(containerRef, {
  enableToolbar: false,
  enableSearch: true,
  theme: 'dark',
  scale: 1.25,
  cacheSize: 15,
  preloadPages: 3,
  
  // Hook 特有选项
  autoLoad: true,          // 自动加载文档
  destroyOnUnmount: true,  // 组件卸载时销毁
  
  // 事件回调
  onDocumentLoaded: (info) => {
    console.log('文档已加载:', info)
  },
  onPageChanged: ({ currentPage, totalPages }) => {
    console.log(`页面变化: ${currentPage}/${totalPages}`)
  },
  onError: (error) => {
    console.error('错误:', error)
  }
})
```

## 高级配置

### 自定义工具栏

```javascript
const viewer = createPdfViewer({
  container,
  enableToolbar: false,  // 禁用默认工具栏
  customToolbar: {
    container: document.getElementById('custom-toolbar'),
    buttons: [
      'navigation',    // 页面导航
      'zoom',         // 缩放控制
      'rotation',     // 旋转按钮
      'search',       // 搜索框
      'fullscreen',   // 全屏按钮
      'download'      // 下载按钮
    ]
  }
})
```

### 自定义快捷键

```javascript
const viewer = createPdfViewer({
  container,
  shortcuts: {
    nextPage: ['ArrowRight', 'PageDown'],
    previousPage: ['ArrowLeft', 'PageUp'],
    zoomIn: ['Ctrl+=', 'Ctrl+Plus'],
    zoomOut: ['Ctrl+-', 'Ctrl+Minus'],
    fitToWidth: ['Ctrl+1'],
    fitToPage: ['Ctrl+0'],
    search: ['Ctrl+F'],
    fullscreen: ['F11']
  }
})
```

### 国际化配置

```javascript
const viewer = createPdfViewer({
  container,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      loading: '加载中...',
      error: '加载失败',
      noDocument: '未选择文档',
      pageOf: '第 {current} 页，共 {total} 页',
      search: '搜索',
      searchPlaceholder: '输入搜索内容',
      noResults: '未找到结果',
      download: '下载',
      print: '打印',
      fullscreen: '全屏',
      exitFullscreen: '退出全屏'
    }
  }
})
```

## 配置验证

@ldesign/pdf 会自动验证配置选项，并在控制台输出警告信息：

```javascript
const viewer = createPdfViewer({
  container,
  scale: 10,        // 警告: 缩放值过大，将使用最大值 5.0
  cacheSize: -1,    // 警告: 缓存大小无效，将使用默认值 10
  theme: 'invalid'  // 警告: 无效主题，将使用默认主题 'light'
})
```

## 动态配置更新

```javascript
// 创建后更新配置
await viewer.updateConfig({
  theme: 'dark',
  enableSearch: false,
  scale: 1.5
})

// 批量更新
await viewer.updateConfig({
  theme: 'dark',
  enableThumbnails: false,
  cacheSize: 20,
  preloadPages: 5
})
```

## 配置最佳实践

### 性能优化

```javascript
// 大文档优化配置
const viewer = createPdfViewer({
  container,
  cacheSize: 5,        // 减少缓存以节省内存
  preloadPages: 1,     // 减少预加载页面
  enableThumbnails: false,  // 禁用缩略图以提升性能
  
  // 启用虚拟滚动（大文档）
  virtualScrolling: {
    enabled: true,
    itemHeight: 800,
    overscan: 2
  }
})
```

### 移动端优化

```javascript
// 移动端配置
const viewer = createPdfViewer({
  container,
  enableToolbar: true,
  toolbarPosition: 'bottom',  // 工具栏置底
  enableThumbnails: false,    // 移动端禁用缩略图
  touchGestures: {
    pinchZoom: true,          // 启用捏合缩放
    doubleTapZoom: true,      // 启用双击缩放
    swipeNavigation: true     // 启用滑动翻页
  },
  
  // 移动端样式
  mobileBreakpoint: 768,
  mobileConfig: {
    scale: 'fit-width',       // 移动端适应宽度
    enableTextSelection: false // 移动端禁用文本选择
  }
})
```
