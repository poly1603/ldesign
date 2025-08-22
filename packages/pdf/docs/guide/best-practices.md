# 最佳实践

## 🚀 性能优化

### 1. 启用多线程处理

Worker多线程是提升PDF处理性能的关键。PDF解析和渲染是CPU密集型任务，使用Web Worker可以避免阻塞主线程。

```typescript
const api = new PdfApi({
  enableWorker: true,
  workerPoolSize: navigator.hardwareConcurrency || 4,
  workerScript: '/pdf.worker.js'
})
```

::: tip 提示
Worker池大小建议设置为CPU核心数，但不要超过8个，避免过多的上下文切换开销。
:::

### 2. 智能缓存策略

合理的缓存配置可以显著减少重复加载时间：

```typescript
const api = new PdfApi({
  cacheOptions: {
    maxSize: 100 * 1024 * 1024,  // 100MB
    maxItems: 1000,              // 最多1000个缓存项
    ttl: 30 * 60 * 1000,        // 30分钟过期
    strategy: 'lru'              // LRU淘汰策略
  }
})
```

#### 缓存层级策略

```typescript
// 文档级缓存
const documentCache = {
  maxSize: 50 * 1024 * 1024,   // 50MB存储文档结构
  ttl: 60 * 60 * 1000          // 1小时有效期
}

// 页面级缓存
const pageCache = {
  maxSize: 100 * 1024 * 1024,  // 100MB存储渲染结果
  ttl: 30 * 60 * 1000          // 30分钟有效期
}

// 缩略图缓存
const thumbnailCache = {
  maxSize: 20 * 1024 * 1024,   // 20MB存储缩略图
  ttl: 2 * 60 * 60 * 1000      // 2小时有效期
}
```

### 3. 渐进式加载

大型PDF文档应该采用渐进式加载策略：

```typescript
// 预加载策略
class PdfViewerOptimized {
  private preloadQueue: number[] = []
  
  async loadPage(pageNumber: number) {
    // 立即加载当前页
    const currentPage = await this.renderPage(pageNumber)
    
    // 预加载相邻页面
    this.preloadAdjacentPages(pageNumber)
    
    return currentPage
  }
  
  private preloadAdjacentPages(current: number) {
    const preloadPages = [
      current - 1, // 前一页
      current + 1, // 后一页
      current + 2  // 后两页
    ].filter(page => page >= 1 && page <= this.totalPages)
    
    // 低优先级预加载
    preloadPages.forEach(page => {
      this.preloadQueue.push(page)
    })
    
    this.processPreloadQueue()
  }
}
```

### 4. 视口优化

只渲染用户可见的内容，减少不必要的计算：

```typescript
class VirtualizedPdfViewer {
  private visiblePages: Set<number> = new Set()
  
  onScroll(scrollTop: number, containerHeight: number) {
    const pageHeight = 800 // 假设页面高度
    const buffer = 200     // 缓冲区
    
    const startPage = Math.floor((scrollTop - buffer) / pageHeight) + 1
    const endPage = Math.ceil((scrollTop + containerHeight + buffer) / pageHeight)
    
    // 计算可见页面
    const newVisiblePages = new Set()
    for (let page = Math.max(1, startPage); page <= Math.min(this.totalPages, endPage); page++) {
      newVisiblePages.add(page)
    }
    
    // 卸载不可见页面
    this.visiblePages.forEach(page => {
      if (!newVisiblePages.has(page)) {
        this.unloadPage(page)
      }
    })
    
    // 加载新可见页面
    newVisiblePages.forEach(page => {
      if (!this.visiblePages.has(page)) {
        this.loadPage(page)
      }
    })
    
    this.visiblePages = newVisiblePages
  }
}
```

---

## 🛡️ 错误处理

### 1. 分层错误处理

建立完善的错误处理机制：

```typescript
class PdfErrorHandler {
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3
  
  async handleError(error: PdfError, context: string): Promise<void> {
    console.error(`PDF错误 [${context}]:`, error)
    
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        await this.handleNetworkError(error, context)
        break
        
      case ErrorCode.PASSWORD_REQUIRED:
        await this.handlePasswordError(error, context)
        break
        
      case ErrorCode.MEMORY_ERROR:
        await this.handleMemoryError(error, context)
        break
        
      case ErrorCode.RENDER_FAILED:
        await this.handleRenderError(error, context)
        break
        
      default:
        this.handleUnknownError(error, context)
    }
  }
  
  private async handleNetworkError(error: PdfError, context: string) {
    const attempts = this.retryAttempts.get(context) || 0
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(context, attempts + 1)
      
      // 指数退避重试
      const delay = Math.pow(2, attempts) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // 重试操作
      return this.retryOperation(context)
    } else {
      // 超过重试次数，显示用户友好的错误信息
      this.showUserError('网络连接异常，请检查网络后重试')
    }
  }
  
  private async handlePasswordError(error: PdfError, context: string) {
    const password = await this.promptForPassword()
    if (password) {
      return this.retryWithPassword(context, password)
    } else {
      this.showUserError('该PDF文档需要密码才能打开')
    }
  }
  
  private async handleMemoryError(error: PdfError, context: string) {
    // 清理缓存释放内存
    await this.clearCache()
    
    // 降低渲染质量
    const lowQualityOptions = {
      scale: 0.5,
      enableWebGL: false,
      renderTextLayer: false
    }
    
    return this.retryWithOptions(context, lowQualityOptions)
  }
}
```

### 2. 用户体验优化

提供友好的错误提示和恢复选项：

```vue
<template>
  <div class="pdf-viewer">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载PDF文档...</p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${loadProgress}%` }"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ getErrorTitle(error) }}</h3>
      <p>{{ getErrorMessage(error) }}</p>
      
      <div class="error-actions">
        <button v-if="error.recoverable" @click="retry">
          重试
        </button>
        <button v-if="error.code === 'PASSWORD_REQUIRED'" @click="showPasswordDialog">
          输入密码
        </button>
        <button @click="reportError">
          报告问题
        </button>
      </div>
    </div>
    
    <div v-else class="pdf-content">
      <!-- PDF内容 -->
    </div>
  </div>
</template>

<script setup>
const getErrorTitle = (error) => {
  const titles = {
    [ErrorCode.NETWORK_ERROR]: '网络连接失败',
    [ErrorCode.INVALID_PDF]: '文件格式错误',
    [ErrorCode.PASSWORD_REQUIRED]: '需要密码',
    [ErrorCode.MEMORY_ERROR]: '内存不足',
    [ErrorCode.LOAD_FAILED]: '加载失败'
  }
  return titles[error.code] || '未知错误'
}

const getErrorMessage = (error) => {
  const messages = {
    [ErrorCode.NETWORK_ERROR]: '请检查网络连接后重试',
    [ErrorCode.INVALID_PDF]: '这不是一个有效的PDF文件',
    [ErrorCode.PASSWORD_REQUIRED]: '该PDF文档受密码保护',
    [ErrorCode.MEMORY_ERROR]: '文档过大，建议使用较新的浏览器',
    [ErrorCode.LOAD_FAILED]: '文档加载失败，请稍后重试'
  }
  return messages[error.code] || error.message
}
</script>
```

---

## 🎨 界面设计

### 1. 响应式布局

确保PDF查看器在不同设备上都有良好的体验：

```css
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
}

.pdf-toolbar {
  flex-shrink: 0;
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.pdf-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.pdf-page {
  margin: 16px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  background: white;
  border-radius: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .pdf-toolbar {
    padding: 4px 8px;
  }
  
  .pdf-page {
    margin: 8px;
    border-radius: 0;
  }
  
  .pdf-controls {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    position: fixed;
    z-index: 100;
  }
}
```

### 2. 交互体验

提供直观的交互控件：

```vue
<template>
  <div class="pdf-viewer">
    <!-- 工具栏 -->
    <div class="pdf-toolbar">
      <div class="toolbar-group">
        <button @click="prevPage" :disabled="currentPage <= 1">
          <svg><!-- 上一页图标 --></svg>
        </button>
        
        <div class="page-input">
          <input 
            v-model.number="pageInput" 
            @keydown.enter="goToPage(pageInput)"
            type="number" 
            :min="1" 
            :max="totalPages"
          />
          <span> / {{ totalPages }}</span>
        </div>
        
        <button @click="nextPage" :disabled="currentPage >= totalPages">
          <svg><!-- 下一页图标 --></svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button @click="zoomOut" :disabled="scale <= 0.25">
          <svg><!-- 缩小图标 --></svg>
        </button>
        
        <select v-model="scale" @change="onScaleChange">
          <option value="auto">自适应</option>
          <option value="page-width">适合宽度</option>
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
        </select>
        
        <button @click="zoomIn" :disabled="scale >= 4">
          <svg><!-- 放大图标 --></svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button @click="download" title="下载">
          <svg><!-- 下载图标 --></svg>
        </button>
        
        <button @click="print" title="打印">
          <svg><!-- 打印图标 --></svg>
        </button>
        
        <button @click="toggleFullscreen" title="全屏">
          <svg><!-- 全屏图标 --></svg>
        </button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="pdf-content" @wheel="onWheel" @scroll="onScroll">
      <div 
        v-for="page in visiblePages" 
        :key="page" 
        class="pdf-page"
        :class="{ active: page === currentPage }"
      >
        <canvas 
          :ref="`page-${page}`"
          @click="onPageClick(page)"
        ></canvas>
        
        <!-- 文本选择层 -->
        <div v-if="enableTextSelection" class="text-layer"></div>
        
        <!-- 注释层 -->
        <div v-if="showAnnotations" class="annotation-layer"></div>
      </div>
    </div>
    
    <!-- 缩略图侧边栏 -->
    <div v-if="showThumbnails" class="thumbnail-sidebar">
      <div class="thumbnail-header">
        <h3>页面缩略图</h3>
        <button @click="showThumbnails = false">×</button>
      </div>
      <div class="thumbnail-list">
        <div 
          v-for="page in totalPages" 
          :key="page"
          class="thumbnail-item"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          <canvas 
            :ref="`thumb-${page}`"
            class="thumbnail-canvas"
          ></canvas>
          <span class="thumbnail-label">{{ page }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 3. 键盘快捷键

实现常用的键盘快捷键：

```typescript
class PdfKeyboardHandler {
  constructor(viewer: PdfViewer) {
    this.viewer = viewer
    this.bindEvents()
  }
  
  private bindEvents() {
    document.addEventListener('keydown', this.handleKeydown.bind(this))
  }
  
  private handleKeydown(event: KeyboardEvent) {
    // 避免在输入框中触发快捷键
    if (event.target instanceof HTMLInputElement) return
    
    const { ctrlKey, metaKey, shiftKey, altKey, key } = event
    const isCtrlOrCmd = ctrlKey || metaKey
    
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        this.viewer.prevPage()
        event.preventDefault()
        break
        
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ': // 空格键
        this.viewer.nextPage()
        event.preventDefault()
        break
        
      case 'Home':
        this.viewer.goToPage(1)
        event.preventDefault()
        break
        
      case 'End':
        this.viewer.goToPage(this.viewer.totalPages)
        event.preventDefault()
        break
        
      case '+':
      case '=':
        if (isCtrlOrCmd) {
          this.viewer.zoomIn()
          event.preventDefault()
        }
        break
        
      case '-':
        if (isCtrlOrCmd) {
          this.viewer.zoomOut()
          event.preventDefault()
        }
        break
        
      case '0':
        if (isCtrlOrCmd) {
          this.viewer.resetZoom()
          event.preventDefault()
        }
        break
        
      case 'f':
        if (isCtrlOrCmd) {
          this.viewer.toggleSearch()
          event.preventDefault()
        }
        break
        
      case 'p':
        if (isCtrlOrCmd) {
          this.viewer.print()
          event.preventDefault()
        }
        break
        
      case 's':
        if (isCtrlOrCmd) {
          this.viewer.download()
          event.preventDefault()
        }
        break
    }
  }
}
```

---

## 🔍 调试技巧

### 1. 启用调试模式

```typescript
const api = new PdfApi({
  debug: true,
  enablePerformanceMonitoring: true
})

// 监听调试事件
api.on('debug', (info) => {
  console.log('PDF调试信息:', info)
})
```

### 2. 性能分析

```typescript
// 性能监控工具
class PdfPerformanceMonitor {
  private metrics = new Map<string, number[]>()
  
  startTiming(label: string) {
    performance.mark(`${label}-start`)
  }
  
  endTiming(label: string) {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label, 'measure')[0]
    const times = this.metrics.get(label) || []
    times.push(measure.duration)
    this.metrics.set(label, times)
    
    // 计算平均时间
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    console.log(`${label} 平均耗时: ${avgTime.toFixed(2)}ms`)
  }
  
  getReport() {
    const report = {}
    for (const [label, times] of this.metrics) {
      report[label] = {
        count: times.length,
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times)
      }
    }
    return report
  }
}
```

### 3. 内存监控

```typescript
// 内存使用监控
class MemoryMonitor {
  private checkInterval: number
  
  start() {
    this.checkInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        console.log('内存使用情况:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        })
        
        // 内存使用率过高时发出警告
        const usageRate = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        if (usageRate > 0.8) {
          console.warn('内存使用率过高，建议清理缓存')
        }
      }
    }, 5000)
  }
  
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
  }
}
```

---

## 📱 移动端优化

### 1. 触摸手势

```typescript
class TouchGestureHandler {
  private startDistance = 0
  private startScale = 1
  private startX = 0
  private startY = 0
  
  constructor(private viewer: PdfViewer) {
    this.bindEvents()
  }
  
  private bindEvents() {
    const container = this.viewer.container
    
    container.addEventListener('touchstart', this.handleTouchStart.bind(this))
    container.addEventListener('touchmove', this.handleTouchMove.bind(this))
    container.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }
  
  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      // 双指操作：记录初始距离
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      this.startDistance = this.getDistance(touch1, touch2)
      this.startScale = this.viewer.scale
    } else if (event.touches.length === 1) {
      // 单指操作：记录初始位置
      this.startX = event.touches[0].clientX
      this.startY = event.touches[0].clientY
    }
  }
  
  private handleTouchMove(event: TouchEvent) {
    event.preventDefault()
    
    if (event.touches.length === 2) {
      // 双指缩放
      const touch1 = event.touches[0]
      const touch2 = event.touches[1]
      const currentDistance = this.getDistance(touch1, touch2)
      const scale = this.startScale * (currentDistance / this.startDistance)
      
      this.viewer.setScale(Math.max(0.25, Math.min(4, scale)))
    } else if (event.touches.length === 1) {
      // 单指拖拽
      const deltaX = event.touches[0].clientX - this.startX
      const deltaY = event.touches[0].clientY - this.startY
      
      this.viewer.pan(deltaX, deltaY)
    }
  }
  
  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
}
```

### 2. 虚拟滚动

```typescript
// 移动端虚拟滚动优化
class MobileVirtualScroll {
  private visiblePages = new Set<number>()
  private pageHeight = 800
  private containerHeight = 0
  private scrollTop = 0
  
  constructor(private viewer: PdfViewer) {
    this.containerHeight = window.innerHeight
    this.bindEvents()
  }
  
  private bindEvents() {
    const container = this.viewer.container
    
    container.addEventListener('scroll', this.throttle(this.onScroll.bind(this), 16))
    window.addEventListener('resize', this.onResize.bind(this))
  }
  
  private onScroll(event: Event) {
    const target = event.target as HTMLElement
    this.scrollTop = target.scrollTop
    this.updateVisiblePages()
  }
  
  private updateVisiblePages() {
    const buffer = this.containerHeight // 一屏的缓冲区
    const start = Math.max(0, this.scrollTop - buffer)
    const end = this.scrollTop + this.containerHeight + buffer
    
    const startPage = Math.floor(start / this.pageHeight) + 1
    const endPage = Math.ceil(end / this.pageHeight)
    
    const newVisible = new Set<number>()
    for (let page = startPage; page <= Math.min(endPage, this.viewer.totalPages); page++) {
      newVisible.add(page)
    }
    
    // 卸载不可见页面
    this.visiblePages.forEach(page => {
      if (!newVisible.has(page)) {
        this.viewer.unloadPage(page)
      }
    })
    
    // 加载新可见页面
    newVisible.forEach(page => {
      if (!this.visiblePages.has(page)) {
        this.viewer.loadPage(page)
      }
    })
    
    this.visiblePages = newVisible
  }
  
  private throttle(func: Function, limit: number) {
    let inThrottle: boolean
    return function(this: any) {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}
```

---

这些最佳实践将帮助你构建高性能、用户友好的PDF查看器应用。记住，性能优化是一个持续的过程，需要根据实际使用情况不断调整和改进。