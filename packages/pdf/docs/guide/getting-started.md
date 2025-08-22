# 快速开始

欢迎使用 @ldesign/pdf! 这是一个让PDF预览变得简单而高效的TypeScript库。无论你是在构建Web应用、移动应用还是桌面应用，这个库都能帮你轻松处理PDF文档。

## 🚀 5分钟快速体验

### 第一步：安装

```bash
# 使用 npm
npm install @ldesign/pdf pdfjs-dist

# 使用 pnpm (推荐)
pnpm add @ldesign/pdf pdfjs-dist

# 使用 yarn
yarn add @ldesign/pdf pdfjs-dist
```

::: tip 为什么需要 pdfjs-dist？
@ldesign/pdf 基于 PDF.js 构建，需要 pdfjs-dist 作为底层PDF处理引擎。这样的设计让你可以灵活选择PDF.js的版本。
:::

### 第二步：基础使用

```javascript
import { PdfApi } from '@ldesign/pdf'
import * as pdfjs from 'pdfjs-dist'

// 创建PDF API实例
const pdfApi = new PdfApi({
  pdfjs: pdfjs
})

// 加载并预览PDF
async function showPdf() {
  const container = document.getElementById('pdf-container')
  
  const preview = await pdfApi.createPreview('path/to/your.pdf', {
    container: container,
    scale: 1.0,
    enableNavigation: true,
    enableZoom: true
  })
  
  console.log(`PDF加载成功，共${preview.totalPages}页`)
}

showPdf()
```

### 第三步：添加样式

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #pdf-container {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div id="pdf-container"></div>
  <script src="your-script.js"></script>
</body>
</html>
```

🎉 **恭喜！** 你已经成功创建了第一个PDF预览器！

## 🎯 Vue 3 快速开始

如果你在使用Vue 3，我们提供了更简单的集成方式：

```vue
<template>
  <div class="pdf-demo">
    <h1>我的PDF查看器</h1>
    
    <!-- 文件选择 -->
    <input 
      type="file" 
      @change="handleFileChange" 
      accept=".pdf"
    />
    
    <!-- PDF预览区域 -->
    <div 
      v-if="pdfSource" 
      ref="pdfContainer" 
      class="pdf-container"
    >
      <div v-if="loading" class="loading">
        正在加载PDF... {{ Math.round(loadProgress) }}%
      </div>
      
      <div v-if="error" class="error">
        加载失败: {{ error.message }}
      </div>
      
      <!-- 导航控件 -->
      <div v-if="!loading && !error" class="controls">
        <button @click="prevPage" :disabled="currentPage <= 1">
          上一页
        </button>
        
        <span>{{ currentPage }} / {{ totalPages }}</span>
        
        <button @click="nextPage" :disabled="currentPage >= totalPages">
          下一页
        </button>
        
        <button @click="zoomIn">放大</button>
        <button @click="zoomOut">缩小</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePdfViewer } from '@ldesign/pdf/vue'

// 响应式数据
const pdfContainer = ref()
const pdfSource = ref(null)

// 使用PDF查看器组合函数
const {
  loading,
  error,
  loadProgress,
  totalPages,
  currentPage,
  nextPage,
  prevPage,
  zoomIn,
  zoomOut
} = usePdfViewer({
  source: pdfSource,
  container: pdfContainer
})

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    pdfSource.value = file
  }
}
</script>

<style scoped>
.pdf-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.loading, .error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.error {
  color: #e74c3c;
}

.controls {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px;
  border-radius: 6px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls button {
  background: #3498db;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.controls button:hover:not(:disabled) {
  background: #2980b9;
}
</style>
```

## 🔧 配置选项

### 基础配置

```javascript
const pdfApi = new PdfApi({
  // PDF.js库实例 (必需)
  pdfjs: pdfjs,
  
  // 是否启用Worker多线程处理 (推荐开启)
  enableWorker: true,
  
  // Worker池大小
  workerPoolSize: 4,
  
  // 是否启用调试模式
  debug: false,
  
  // 缓存配置
  cacheOptions: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxItems: 1000,
    ttl: 30 * 60 * 1000 // 30分钟
  }
})
```

### 预览配置

```javascript
const preview = await pdfApi.createPreview(source, {
  // 容器元素 (必需)
  container: document.getElementById('pdf-container'),
  
  // 初始缩放比例
  scale: 1.0,
  
  // 初始页码
  page: 1,
  
  // 是否启用导航控件
  enableNavigation: true,
  
  // 是否启用缩放控件
  enableZoom: true,
  
  // 是否启用全屏模式
  enableFullscreen: true,
  
  // 是否启用文本选择
  enableTextSelection: true,
  
  // 是否显示页面边框
  showPageBorders: true,
  
  // 背景颜色
  backgroundColor: '#f5f5f5'
})
```

## 🎨 样式定制

### CSS类名

@ldesign/pdf 使用标准的CSS类名，你可以轻松定制样式：

```css
/* PDF容器 */
.ldesign-pdf-container {
  background: #f8f9fa;
}

/* PDF页面 */
.ldesign-pdf-page {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: 20px auto;
  border-radius: 8px;
}

/* 导航控件 */
.ldesign-pdf-controls {
  background: rgba(0,0,0,0.8);
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

/* 加载状态 */
.ldesign-pdf-loading {
  color: #6c757d;
}

/* 错误状态 */
.ldesign-pdf-error {
  color: #dc3545;
}
```

### 主题变量

```css
:root {
  --ldesign-pdf-primary: #007bff;
  --ldesign-pdf-secondary: #6c757d;
  --ldesign-pdf-success: #28a745;
  --ldesign-pdf-danger: #dc3545;
  --ldesign-pdf-warning: #ffc107;
  --ldesign-pdf-info: #17a2b8;
  
  --ldesign-pdf-background: #ffffff;
  --ldesign-pdf-surface: #f8f9fa;
  --ldesign-pdf-border: #dee2e6;
  
  --ldesign-pdf-text: #212529;
  --ldesign-pdf-text-muted: #6c757d;
}
```

## 📱 响应式设计

@ldesign/pdf 内置响应式支持，在移动设备上自动适配：

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .ldesign-pdf-container {
    margin: 0;
    border-radius: 0;
  }
  
  .ldesign-pdf-controls {
    bottom: 20px;
    left: 20px;
    right: 20px;
    flex-direction: column;
    gap: 10px;
  }
}
```

## 🚨 常见问题

### 1. PDF.js Worker 配置

如果遇到Worker相关错误：

```javascript
import * as pdfjs from 'pdfjs-dist'

// 设置Worker路径
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// 或使用本地文件
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
```

### 2. 跨域问题

当加载外部PDF时，确保服务器允许跨域：

```javascript
const preview = await pdfApi.createPreview('https://example.com/doc.pdf', {
  container: container,
  // 添加跨域配置
  httpHeaders: {
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: false
})
```

### 3. 内存优化

对于大型PDF文档：

```javascript
const pdfApi = new PdfApi({
  pdfjs: pdfjs,
  enableWorker: true,
  cacheOptions: {
    maxSize: 50 * 1024 * 1024, // 减少缓存大小
    ttl: 10 * 60 * 1000        // 减少缓存时间
  }
})

// 及时清理
preview.destroy() // 不需要时立即销毁
```

## 🎯 下一步

- 📖 查看 [API 参考](/guide/api) 了解详细配置
- 🎨 学习 [Vue 集成](/guide/vue-integration) 深度集成
- ⚡ 阅读 [最佳实践](/guide/best-practices) 性能优化
- 💡 探索 [示例](/examples/) 获取灵感

---

**准备好了吗？** 让我们开始构建令人惊艳的PDF预览体验吧！ 🚀