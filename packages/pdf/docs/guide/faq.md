# 常见问题

本页面收集了使用 @ldesign/pdf 时的常见问题和解决方案。

## 安装和配置

### Q: 安装后提示找不到模块？

**A:** 确保正确导入模块和样式文件：

```javascript
// 正确的导入方式
import { createPdfViewer } from '@ldesign/pdf'
import '@ldesign/pdf/style.css'

// Vue 3
import { PdfViewer } from '@ldesign/pdf/vue'
```

如果仍然报错，检查：
1. 是否正确安装了依赖：`pnpm add @ldesign/pdf`
2. 构建工具是否支持 ES 模块
3. TypeScript 配置是否正确

### Q: 样式显示不正确？

**A:** 确保导入了 CSS 文件：

```javascript
import '@ldesign/pdf/style.css'
```

或在 HTML 中引入：
```html
<link rel="stylesheet" href="node_modules/@ldesign/pdf/dist/style.css">
```

### Q: TypeScript 类型错误？

**A:** 确保安装了类型定义：

```bash
pnpm add -D @types/pdfjs-dist
```

在 `tsconfig.json` 中添加类型声明：
```json
{
  "compilerOptions": {
    "types": ["@ldesign/pdf"]
  }
}
```

## PDF 加载问题

### Q: PDF 文件加载失败？

**A:** 检查以下几点：

1. **文件路径是否正确**
```javascript
// 确保路径正确
await viewer.loadDocument('/path/to/document.pdf')
```

2. **CORS 问题**
```javascript
// 如果是跨域文件，确保服务器设置了正确的 CORS 头
// 或使用代理
await viewer.loadDocument('/api/proxy/document.pdf')
```

3. **文件格式是否支持**
```javascript
// 只支持 PDF 格式
const file = event.target.files[0]
if (file.type !== 'application/pdf') {
  console.error('不支持的文件格式')
  return
}
```

4. **文件是否损坏**
```javascript
viewer.on('error', ({ error, context }) => {
  if (context === 'load') {
    console.error('PDF 文件可能已损坏:', error)
  }
})
```

### Q: 大文件加载很慢？

**A:** 优化加载性能：

```javascript
const viewer = createPdfViewer({
  container,
  // 减少预加载页面
  preloadPages: 1,
  // 减少缓存大小
  cacheSize: 5,
  // 启用流式加载
  streamingLoad: true
})
```

### Q: Worker 相关错误？

**A:** 确保 PDF.js Worker 文件可访问：

```javascript
// 方法1: 使用 CDN
import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

// 方法2: 本地文件
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

// 方法3: 使用 webpack
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()
```

## 显示和渲染问题

### Q: PDF 显示模糊？

**A:** 调整设备像素比和缩放：

```javascript
const viewer = createPdfViewer({
  container,
  // 启用高 DPI 支持
  enableHighDPI: true,
  // 设置合适的初始缩放
  scale: window.devicePixelRatio || 1
})
```

### Q: 页面渲染不完整？

**A:** 检查容器大小和样式：

```css
.pdf-container {
  width: 100%;
  height: 600px; /* 确保有明确的高度 */
  overflow: hidden;
}
```

```javascript
// 确保容器已渲染
await new Promise(resolve => setTimeout(resolve, 100))
const viewer = createPdfViewer({ container })
```

### Q: 文本选择不工作？

**A:** 确保启用了文本选择：

```javascript
const viewer = createPdfViewer({
  container,
  enableTextSelection: true,
  textSelectionOptions: {
    enableCopy: true,
    enableContextMenu: true
  }
})
```

## Vue 集成问题

### Q: Vue 组件不显示？

**A:** 检查组件注册和使用：

```javascript
// main.js
import { createApp } from 'vue'
import PdfPlugin from '@ldesign/pdf/vue'

const app = createApp(App)
app.use(PdfPlugin)
```

```vue
<!-- 确保容器有大小 -->
<template>
  <div class="pdf-wrapper">
    <PdfViewer :src="pdfUrl" />
  </div>
</template>

<style scoped>
.pdf-wrapper {
  width: 100%;
  height: 600px;
}
</style>
```

### Q: Hook 返回的状态不更新？

**A:** 确保正确使用响应式：

```vue
<script setup>
import { watch } from 'vue'
import { usePdfViewer } from '@ldesign/pdf/vue'

const containerRef = ref()
const { currentPage, totalPages, loadDocument } = usePdfViewer(containerRef)

// 监听状态变化
watch([currentPage, totalPages], ([current, total]) => {
  console.log(`页面: ${current}/${total}`)
})
</script>
```

## 性能问题

### Q: 内存使用过高？

**A:** 优化内存使用：

```javascript
const viewer = createPdfViewer({
  container,
  // 减少缓存
  cacheSize: 3,
  // 减少预加载
  preloadPages: 1,
  // 启用内存清理
  enableMemoryCleanup: true,
  // 设置内存限制
  maxMemoryUsage: 50 // MB
})

// 定期清理
setInterval(() => {
  viewer.clearCache()
}, 60000) // 每分钟清理一次
```

### Q: 滚动卡顿？

**A:** 启用虚拟滚动：

```javascript
const viewer = createPdfViewer({
  container,
  // 启用虚拟滚动（适用于大文档）
  virtualScrolling: {
    enabled: true,
    itemHeight: 800,
    overscan: 2
  },
  // 优化渲染
  renderingOptions: {
    enableWebGL: true,
    useOffscreenCanvas: true
  }
})
```

## 功能问题

### Q: 搜索功能不工作？

**A:** 确保启用搜索并正确使用：

```javascript
const viewer = createPdfViewer({
  container,
  enableSearch: true
})

// 等待文档加载完成
viewer.on('documentLoaded', async () => {
  const results = await viewer.search('关键词')
  console.log('搜索结果:', results)
})
```

### Q: 打印功能异常？

**A:** 检查浏览器兼容性和权限：

```javascript
viewer.print({
  pageRange: '1-5',
  quality: 'high'
}).catch(error => {
  if (error.name === 'NotAllowedError') {
    console.error('用户拒绝了打印权限')
  } else {
    console.error('打印失败:', error)
  }
})
```

### Q: 全屏模式不工作？

**A:** 检查浏览器支持和用户交互：

```javascript
// 必须在用户交互中调用
button.addEventListener('click', async () => {
  try {
    await viewer.enterFullscreen()
  } catch (error) {
    console.error('全屏失败:', error)
    // 可能是浏览器不支持或用户拒绝
  }
})
```

## 移动端问题

### Q: 移动端显示异常？

**A:** 使用移动端优化配置：

```javascript
const isMobile = window.innerWidth <= 768

const viewer = createPdfViewer({
  container,
  // 移动端配置
  enableThumbnails: !isMobile,
  toolbarPosition: isMobile ? 'bottom' : 'top',
  touchGestures: {
    pinchZoom: true,
    doubleTapZoom: true,
    swipeNavigation: true
  },
  mobileConfig: {
    scale: 'fit-width',
    enableTextSelection: false
  }
})
```

### Q: 触摸手势不响应？

**A:** 确保启用触摸支持：

```javascript
const viewer = createPdfViewer({
  container,
  touchGestures: {
    pinchZoom: true,      // 捏合缩放
    doubleTapZoom: true,  // 双击缩放
    swipeNavigation: true, // 滑动翻页
    longPressMenu: true   // 长按菜单
  }
})
```

## 构建和部署问题

### Q: Webpack 构建错误？

**A:** 配置 Webpack：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "canvas": false,
      "fs": false
    }
  },
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
}
```

### Q: Vite 构建问题？

**A:** 配置 Vite：

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      external: ['canvas']
    }
  }
}
```

### Q: 部署后 Worker 404？

**A:** 确保 Worker 文件正确部署：

```javascript
// 复制 Worker 文件到 public 目录
// 或使用构建工具自动处理
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'copy-pdf-worker',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'pdf.worker.min.js',
          source: fs.readFileSync(
            'node_modules/pdfjs-dist/build/pdf.worker.min.js'
          )
        })
      }
    }
  ]
})
```

## 获取帮助

如果以上解决方案都无法解决你的问题，可以通过以下方式获取帮助：

1. **查看示例代码**：[GitHub Examples](https://github.com/ldesign/pdf/tree/main/examples)
2. **提交 Issue**：[GitHub Issues](https://github.com/ldesign/pdf/issues)
3. **参与讨论**：[GitHub Discussions](https://github.com/ldesign/pdf/discussions)
4. **邮件支持**：support@ldesign.com

提交问题时，请包含：
- 使用的版本号
- 完整的错误信息
- 最小复现代码
- 浏览器和操作系统信息
