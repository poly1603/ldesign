# PDF查看器 Vue示例

这是一个完整的Vue 3集成示例，展示了如何在Vue应用中使用`@ldesign/pdf`组件包。

## 功能特性

### 🎯 Vue 3集成
- **Composition API**: 使用Vue 3的Composition API进行状态管理
- **TypeScript支持**: 完整的TypeScript类型定义
- **组件化设计**: 模块化的Vue组件架构
- **响应式数据**: Vue的响应式系统集成
- **生命周期管理**: 正确的组件生命周期处理

### 📄 PDF功能
- **文档加载**: 支持本地文件和URL加载
- **页面导航**: 上一页/下一页/跳转到指定页
- **缩放控制**: 放大/缩小/适应宽度/适应页面
- **文本搜索**: 全文搜索和高亮显示
- **缩略图**: 页面缩略图预览
- **下载打印**: 文档下载和打印功能

### 🎨 用户界面
- **现代设计**: 简洁美观的用户界面
- **响应式布局**: 适配不同屏幕尺寸
- **主题切换**: 支持浅色/深色主题
- **无障碍访问**: 键盘导航和屏幕阅读器支持
- **加载状态**: 优雅的加载和错误处理

### ⚡ 性能优化
- **懒加载**: 按需加载PDF页面
- **虚拟滚动**: 大文档的性能优化
- **缓存机制**: 智能的页面缓存
- **内存管理**: 自动的内存清理

## 文件结构

```
vue-example/
├── public/
│   └── favicon.ico          # 网站图标
├── src/
│   ├── components/          # Vue组件
│   │   ├── PdfViewer.vue   # 主PDF查看器组件
│   │   ├── PdfControls.vue # PDF控制组件
│   │   ├── FileUpload.vue  # 文件上传组件
│   │   ├── LoadingIndicator.vue # 加载指示器
│   │   └── ErrorBoundary.vue    # 错误边界组件
│   ├── composables/         # Vue组合式函数
│   │   ├── usePdfViewer.ts # PDF查看器逻辑
│   │   ├── useFileUpload.ts # 文件上传逻辑
│   │   └── useTheme.ts     # 主题管理逻辑
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 类型导出
│   ├── styles/             # 样式文件
│   │   ├── main.css        # 主样式
│   │   └── components.css  # 组件样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
└── README.md               # 说明文档
```

## 安装和运行

### 1. 安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install

# 或使用yarn
yarn install
```

### 2. 启动开发服务器

```bash
# 使用pnpm
pnpm dev

# 或使用npm
npm run dev

# 或使用yarn
yarn dev
```

### 3. 构建生产版本

```bash
# 使用pnpm
pnpm build

# 或使用npm
npm run build

# 或使用yarn
yarn build
```

### 4. 预览生产版本

```bash
# 使用pnpm
pnpm preview

# 或使用npm
npm run preview

# 或使用yarn
yarn preview
```

## 核心用法

### 基础组件使用

```vue
<template>
  <div class="app">
    <PdfViewer
      :file="pdfFile"
      :config="viewerConfig"
      @load-success="handleLoadSuccess"
      @load-error="handleLoadError"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PdfViewer } from './components/PdfViewer.vue'
import type { PdfViewerConfig } from './types'

const pdfFile = ref<File | null>(null)
const viewerConfig = ref<PdfViewerConfig>({
  enableSearch: true,
  enableThumbnails: true,
  initialZoom: 'fit-width'
})

const handleLoadSuccess = (info: any) => {
  console.log('PDF加载成功:', info)
}

const handleLoadError = (error: Error) => {
  console.error('PDF加载失败:', error)
}

const handlePageChange = (page: number) => {
  console.log('当前页面:', page)
}
</script>
```

### 使用Composition API

```vue
<script setup lang="ts">
import { usePdfViewer } from './composables/usePdfViewer'
import { useFileUpload } from './composables/useFileUpload'
import { useTheme } from './composables/useTheme'

// PDF查看器逻辑
const {
  isLoading,
  currentPage,
  totalPages,
  zoomLevel,
  loadPdf,
  nextPage,
  prevPage,
  setZoom
} = usePdfViewer()

// 文件上传逻辑
const {
  uploadFile,
  isUploading,
  uploadProgress
} = useFileUpload()

// 主题管理
const {
  theme,
  toggleTheme
} = useTheme()
</script>
```

### 高级配置

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PdfViewerConfig, RenderOptions } from './types'

const advancedConfig = computed<PdfViewerConfig>(() => ({
  // 基础配置
  enableSearch: true,
  enableThumbnails: true,
  enableDownload: true,
  enablePrint: true,
  
  // 渲染配置
  renderOptions: {
    scale: 1.5,
    enableWebGL: true,
    textLayerMode: 'enable'
  } as RenderOptions,
  
  // 缓存配置
  cacheSize: 50,
  preloadPages: 2,
  
  // 主题配置
  theme: 'auto',
  
  // 键盘快捷键
  enableKeyboardShortcuts: true,
  
  // 性能配置
  enableVirtualScrolling: true,
  maxCanvasSize: 4096
}))
</script>
```

## 组件API

### PdfViewer组件

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `file` | `File \| string \| null` | `null` | PDF文件或URL |
| `config` | `PdfViewerConfig` | `{}` | 查看器配置 |
| `className` | `string` | `''` | 自定义CSS类名 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `load-success` | `info: PdfInfo` | PDF加载成功 |
| `load-error` | `error: Error` | PDF加载失败 |
| `page-change` | `page: number` | 页面切换 |
| `zoom-change` | `zoom: number` | 缩放变化 |
| `search-result` | `results: SearchResult[]` | 搜索结果 |

#### Slots

| 插槽 | 说明 |
|------|------|
| `toolbar` | 自定义工具栏 |
| `sidebar` | 自定义侧边栏 |
| `loading` | 自定义加载状态 |
| `error` | 自定义错误状态 |

## 最佳实践

### 1. 错误处理

```vue
<template>
  <PdfViewer
    :file="pdfFile"
    @load-error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const handleError = (error: Error) => {
  console.error('PDF加载错误:', error)
  ElMessage.error(`PDF加载失败: ${error.message}`)
}
</script>
```

### 2. 性能优化

```vue
<script setup lang="ts">
import { ref, shallowRef, markRaw } from 'vue'

// 使用shallowRef避免深度响应式
const pdfFile = shallowRef<File | null>(null)

// 使用markRaw标记非响应式对象
const pdfInstance = ref(markRaw(null))
</script>
```

### 3. 响应式设计

```vue
<template>
  <div class="pdf-container" :class="containerClass">
    <PdfViewer :config="responsiveConfig" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const containerClass = computed(() => ({
  'mobile': width.value < 768,
  'tablet': width.value >= 768 && width.value < 1024,
  'desktop': width.value >= 1024
}))

const responsiveConfig = computed(() => ({
  enableThumbnails: width.value >= 1024,
  sidebarWidth: width.value < 768 ? '100%' : '300px'
}))
</script>
```

## 依赖说明

### 核心依赖
- `vue`: Vue 3框架
- `@ldesign/pdf`: PDF查看器核心包
- `typescript`: TypeScript支持

### 开发依赖
- `@vitejs/plugin-vue`: Vite Vue插件
- `vite`: 构建工具
- `@vue/tsconfig`: Vue TypeScript配置

## 浏览器兼容性

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 故障排除

### 常见问题

1. **PDF无法加载**
   - 检查文件格式是否为有效的PDF
   - 确认文件大小不超过限制
   - 检查网络连接（URL加载时）

2. **性能问题**
   - 启用虚拟滚动
   - 减少预加载页面数量
   - 调整缓存大小

3. **样式问题**
   - 检查CSS类名冲突
   - 确认主题配置正确
   - 验证响应式断点

### 调试技巧

```vue
<script setup lang="ts">
// 启用调试模式
const debugConfig = {
  enableDebug: true,
  logLevel: 'verbose'
}

// 监听所有事件
const handleAllEvents = (event: string, data: any) => {
  console.log(`PDF事件: ${event}`, data)
}
</script>
```

## 贡献指南

欢迎提交Issue和Pull Request来改进这个示例！

## 许可证

MIT License