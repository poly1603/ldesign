<template>
  <div id="app" :class="appClasses">
    <!-- 错误边界 -->
    <ErrorBoundary>
      <!-- 应用头部 -->
      <header class="app-header">
        <div class="header-content">
          <!-- Logo和标题 -->
          <div class="header-brand">
            <div class="brand-logo">
              <svg class="logo-icon" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <div class="brand-text">
              <h1 class="brand-title">PDF Viewer</h1>
              <p class="brand-subtitle">Vue 3 Integration Example</p>
            </div>
          </div>
          
          <!-- 头部操作 -->
          <div class="header-actions">
            <!-- 主题切换 -->
            <button 
              class="btn-icon btn-theme"
              @click="toggleTheme"
              :title="currentTheme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
            >
              <svg v-if="currentTheme === 'dark'" class="icon" viewBox="0 0 24 24">
                <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
              </svg>
              <svg v-else class="icon" viewBox="0 0 24 24">
                <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z" />
              </svg>
            </button>
            
            <!-- 帮助按钮 -->
            <button 
              class="btn-icon btn-help"
              @click="showHelp = !showHelp"
              title="帮助"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C7.59,4 4,12A10,10 0 0,0 12,2M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <!-- 主要内容 -->
      <main class="app-main">
        <!-- 文件上传区域 -->
        <section class="upload-section" v-if="!currentFile">
          <div class="upload-container">
            <FileUpload
              :multiple="false"
              :max-size="50 * 1024 * 1024"
              accept=".pdf"
              :theme="currentTheme"
              :show-history="true"
              upload-text="选择PDF文件或拖拽到此处"
              upload-description="支持最大50MB的PDF文件"
              @file-select="handleFileSelect"
              @upload-success="handleUploadSuccess"
              @upload-error="handleUploadError"
            />
            
            <!-- 功能特性展示 -->
            <div class="features-showcase">
              <h2 class="features-title">功能特性</h2>
              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">PDF查看</h3>
                  <p class="feature-description">高质量PDF文档渲染和显示</p>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M15.5,14H20.5L15.5,19V14M8,2H16L20,6V10.5L19,9.5V8H15V4H8V20H12.5L14,21.5V22H8A2,2 0 0,1 6,20V4A2,2 0 0,1 8,2M11,4H13V6H11V4M11,8H17V10H11V8M11,12H15V14H11V12M11,16H13V18H11V16Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">页面导航</h3>
                  <p class="feature-description">便捷的页面跳转和导航控制</p>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M15.5,14L20.5,19L15.5,24V19H1V14H15.5M9.5,10L4.5,5L9.5,0V5H24V10H9.5Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">缩放控制</h3>
                  <p class="feature-description">灵活的文档缩放和适应选项</p>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">文本搜索</h3>
                  <p class="feature-description">快速查找文档中的文本内容</p>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">缩略图</h3>
                  <p class="feature-description">页面缩略图预览和快速跳转</p>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                    </svg>
                  </div>
                  <h3 class="feature-title">响应式设计</h3>
                  <p class="feature-description">适配各种设备和屏幕尺寸</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- PDF查看器区域 -->
        <section class="viewer-section" v-if="currentFile">
          <div class="viewer-container">
            <!-- 返回按钮 -->
            <div class="viewer-header">
              <button 
                class="btn btn-back"
                @click="handleBackToUpload"
                title="返回文件选择"
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                </svg>
                返回
              </button>
              
              <div class="file-info">
                <h2 class="file-name">{{ currentFile.name }}</h2>
                <p class="file-details">
                  {{ formatFileSize(currentFile.size) }} • 
                  {{ new Date(currentFile.lastModified).toLocaleDateString() }}
                </p>
              </div>
            </div>
            
            <!-- PDF查看器组件 -->
            <PdfViewer
              :file="currentFile"
              :theme="currentTheme"
              :show-thumbnails="true"
              :show-search="true"
              :show-toolbar="true"
              :enable-download="true"
              :enable-print="true"
              @error="handleViewerError"
              @page-change="handlePageChange"
              @zoom-change="handleZoomChange"
              @search="handleSearch"
            />
          </div>
        </section>
      </main>
      
      <!-- 帮助面板 -->
      <aside class="help-panel" v-if="showHelp" @click.self="showHelp = false">
        <div class="help-content">
          <div class="help-header">
            <h3 class="help-title">使用帮助</h3>
            <button 
              class="btn-icon btn-close"
              @click="showHelp = false"
              title="关闭帮助"
            >
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>
          
          <div class="help-body">
            <div class="help-section">
              <h4 class="help-section-title">文件上传</h4>
              <ul class="help-list">
                <li>点击上传区域选择PDF文件</li>
                <li>或直接拖拽PDF文件到上传区域</li>
                <li>支持最大50MB的PDF文件</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4 class="help-section-title">查看器操作</h4>
              <ul class="help-list">
                <li><kbd>←</kbd> <kbd>→</kbd> 或点击按钮切换页面</li>
                <li><kbd>+</kbd> <kbd>-</kbd> 或滚轮缩放文档</li>
                <li><kbd>Ctrl</kbd> + <kbd>F</kbd> 打开搜索功能</li>
                <li><kbd>Escape</kbd> 关闭搜索或全屏</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4 class="help-section-title">快捷键</h4>
              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <kbd class="shortcut-key">Space</kbd>
                  <span class="shortcut-desc">下一页</span>
                </div>
                <div class="shortcut-item">
                  <kbd class="shortcut-key">Shift + Space</kbd>
                  <span class="shortcut-desc">上一页</span>
                </div>
                <div class="shortcut-item">
                  <kbd class="shortcut-key">Home</kbd>
                  <span class="shortcut-desc">首页</span>
                </div>
                <div class="shortcut-item">
                  <kbd class="shortcut-key">End</kbd>
                  <span class="shortcut-desc">末页</span>
                </div>
                <div class="shortcut-item">
                  <kbd class="shortcut-key">F11</kbd>
                  <span class="shortcut-desc">全屏</span>
                </div>
                <div class="shortcut-item">
                  <kbd class="shortcut-key">Ctrl + P</kbd>
                  <span class="shortcut-desc">打印</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- 应用底部 -->
      <footer class="app-footer" v-if="!currentFile">
        <div class="footer-content">
          <div class="footer-info">
            <p class="footer-text">
              基于 <strong>@ldesign/pdf</strong> 构建的Vue 3集成示例
            </p>
            <p class="footer-links">
              <a href="#" class="footer-link">文档</a>
              <span class="footer-separator">•</span>
              <a href="#" class="footer-link">GitHub</a>
              <span class="footer-separator">•</span>
              <a href="#" class="footer-link">问题反馈</a>
            </p>
          </div>
          
          <div class="footer-stats" v-if="performanceMetrics">
            <div class="stat-item">
              <span class="stat-label">渲染时间:</span>
              <span class="stat-value">{{ performanceMetrics.renderTime }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">内存使用:</span>
              <span class="stat-value">{{ formatMemoryUsage(performanceMetrics.memoryUsage) }}</span>
            </div>
          </div>
        </div>
      </footer>
    </ErrorBoundary>
    
    <!-- 全局加载指示器 -->
    <LoadingIndicator
      v-if="globalLoading"
      :loading="true"
      :progress="loadingProgress"
      :stage="loadingStage"
      class="global-loading"
    />
    
    <!-- Toast通知 -->
    <div class="toast-container">
      <Transition
        v-for="toast in toasts"
        :key="toast.id"
        name="toast"
        appear
      >
        <div 
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" class="icon" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
            </svg>
            <svg v-else-if="toast.type === 'error'" class="icon" viewBox="0 0 24 24">
              <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19.27L5.82,22L7,14L2,9L10.91,8.26L12,2Z" />
            </svg>
            <svg v-else-if="toast.type === 'warning'" class="icon" viewBox="0 0 24 24">
              <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
            <svg v-else class="icon" viewBox="0 0 24 24">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message" v-if="toast.message">{{ toast.message }}</div>
          </div>
          <button 
            class="toast-close"
            @click="removeToast(toast.id)"
            title="关闭"
          >
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from './composables/useTheme'
import PdfViewer from './components/PdfViewer.vue'
import FileUpload from './components/FileUpload.vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import type { PerformanceMetrics } from './types'

// 响应式状态
const currentFile = ref<File | null>(null)
const showHelp = ref(false)
const globalLoading = ref(false)
const loadingProgress = ref(0)
const loadingStage = ref('idle')
const performanceMetrics = ref<PerformanceMetrics | null>(null)
const toasts = ref<Array<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}>>[])

// 使用主题组合式函数
const {
  currentTheme,
  toggleTheme,
  applyTheme
} = useTheme()

// 计算属性
const appClasses = computed(() => ({
  'app--dark': currentTheme.value === 'dark',
  'app--light': currentTheme.value === 'light',
  'app--loading': globalLoading.value,
  'app--viewer-mode': !!currentFile.value
}))

// 方法
const handleFileSelect = (file: File) => {
  console.log('File selected:', file.name)
  currentFile.value = file
  
  // 显示加载状态
  globalLoading.value = true
  loadingProgress.value = 0
  loadingStage.value = 'parsing'
  
  // 模拟加载过程
  simulateLoading()
  
  // 显示成功提示
  showToast({
    type: 'success',
    title: '文件加载成功',
    message: `已加载文件: ${file.name}`
  })
}

const handleUploadSuccess = (file: File, result?: any) => {
  console.log('Upload success:', file.name, result)
  
  // 记录性能指标
  performanceMetrics.value = {
    renderTime: Math.random() * 1000 + 500,
    memoryUsage: Math.random() * 50 + 20,
    pageCount: Math.floor(Math.random() * 100) + 1,
    fileSize: file.size,
    loadTime: Math.random() * 2000 + 1000
  }
  
  showToast({
    type: 'success',
    title: '上传完成',
    message: '文件已成功上传并准备查看'
  })
}

const handleUploadError = (error: Error, file?: File) => {
  console.error('Upload error:', error, file)
  
  showToast({
    type: 'error',
    title: '上传失败',
    message: error.message || '文件上传过程中发生错误'
  })
}

const handleBackToUpload = () => {
  currentFile.value = null
  globalLoading.value = false
  loadingProgress.value = 0
  loadingStage.value = 'idle'
  performanceMetrics.value = null
  
  showToast({
    type: 'info',
    title: '已返回',
    message: '返回到文件选择界面'
  })
}

const handleViewerError = (error: Error) => {
  console.error('Viewer error:', error)
  
  showToast({
    type: 'error',
    title: 'PDF查看器错误',
    message: error.message || 'PDF文档加载或显示时发生错误'
  })
}

const handlePageChange = (page: number) => {
  console.log('Page changed:', page)
}

const handleZoomChange = (zoom: number) => {
  console.log('Zoom changed:', zoom)
}

const handleSearch = (query: string, results: any[]) => {
  console.log('Search:', query, results)
  
  if (results.length > 0) {
    showToast({
      type: 'success',
      title: '搜索完成',
      message: `找到 ${results.length} 个匹配结果`
    })
  } else {
    showToast({
      type: 'warning',
      title: '未找到结果',
      message: '没有找到匹配的内容'
    })
  }
}

const simulateLoading = () => {
  const stages = ['parsing', 'initializing', 'rendering', 'complete']
  let currentStageIndex = 0
  let progress = 0
  
  const updateProgress = () => {
    progress += Math.random() * 15 + 5
    
    if (progress >= 100) {
      progress = 100
      loadingProgress.value = progress
      loadingStage.value = 'complete'
      
      setTimeout(() => {
        globalLoading.value = false
        loadingProgress.value = 0
        loadingStage.value = 'idle'
      }, 500)
      
      return
    }
    
    loadingProgress.value = progress
    
    // 更新阶段
    const stageProgress = progress / 25
    const newStageIndex = Math.min(Math.floor(stageProgress), stages.length - 1)
    if (newStageIndex > currentStageIndex) {
      currentStageIndex = newStageIndex
      loadingStage.value = stages[currentStageIndex]
    }
    
    setTimeout(updateProgress, Math.random() * 200 + 100)
  }
  
  updateProgress()
}

const showToast = (toast: {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const duration = toast.duration || 3000
  
  toasts.value.push({
    id,
    ...toast
  })
  
  // 自动移除
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatMemoryUsage = (mb: number): string => {
  return `${mb.toFixed(1)} MB`
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // 全局快捷键
  if (event.key === 'Escape') {
    if (showHelp.value) {
      showHelp.value = false
      event.preventDefault()
    }
  }
  
  if (event.key === 'F1') {
    showHelp.value = !showHelp.value
    event.preventDefault()
  }
}

// 生命周期
onMounted(() => {
  // 应用主题
  applyTheme()
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
  
  // 显示欢迎提示
  setTimeout(() => {
    showToast({
      type: 'info',
      title: '欢迎使用PDF查看器',
      message: '选择或拖拽PDF文件开始使用，按F1查看帮助',
      duration: 5000
    })
  }, 1000)
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 应用根样式 */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--pdf-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  background: var(--pdf-color-background, #ffffff);
  color: var(--pdf-color-text, #212121);
  transition: all 0.3s ease;
}

/* 应用头部 */
.app-header {
  background: var(--pdf-color-surface, #f5f5f5);
  border-bottom: 1px solid var(--pdf-color-border, #e0e0e0);
  padding: var(--pdf-spacing-medium, 16px) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--pdf-spacing-medium, 16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-medium, 16px);
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--pdf-color-primary, #1976d2), var(--pdf-color-accent, #2196f3));
  border-radius: var(--pdf-border-radius-large, 8px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.logo-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  margin: 0;
  font-size: var(--pdf-font-size-large, 20px);
  font-weight: 700;
  color: var(--pdf-color-text, #212121);
  line-height: 1.2;
}

.brand-subtitle {
  margin: 0;
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--pdf-color-secondary, #757575);
}

.btn-icon:hover {
  background: var(--pdf-color-border, #e0e0e0);
  color: var(--pdf-color-primary, #1976d2);
  transform: scale(1.05);
}

.btn-icon .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* 主要内容 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 上传区域 */
.upload-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--pdf-spacing-large, 24px);
  min-height: calc(100vh - 200px);
}

.upload-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 功能特性展示 */
.features-showcase {
  margin-top: var(--pdf-spacing-extra-large, 48px);
  text-align: center;
}

.features-title {
  margin: 0 0 var(--pdf-spacing-large, 24px) 0;
  font-size: var(--pdf-font-size-extra-large, 24px);
  font-weight: 700;
  color: var(--pdf-color-text, #212121);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--pdf-spacing-large, 24px);
  margin-top: var(--pdf-spacing-large, 24px);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--pdf-spacing-large, 24px);
  background: var(--pdf-color-surface, #f5f5f5);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius-large, 8px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: var(--pdf-color-background, #ffffff);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--pdf-color-primary, #1976d2), var(--pdf-color-accent, #2196f3));
  border-radius: 50%;
  margin-bottom: var(--pdf-spacing-medium, 16px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.feature-icon .icon {
  width: 32px;
  height: 32px;
  fill: white;
}

.feature-title {
  margin: 0 0 var(--pdf-spacing-small, 8px) 0;
  font-size: var(--pdf-font-size-medium, 16px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.feature-description {
  margin: 0;
  font-size: var(--pdf-font-size-small, 14px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.5;
}

/* 查看器区域 */
.viewer-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.viewer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.viewer-header {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-medium, 16px);
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-surface, #f5f5f5);
  border-bottom: 1px solid var(--pdf-color-border, #e0e0e0);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  padding: 8px 16px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  font-size: var(--pdf-font-size-small, 14px);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-back {
  background: var(--pdf-color-border, #e0e0e0);
  color: var(--pdf-color-text, #212121);
}

.btn-back:hover {
  background: var(--pdf-color-secondary, #757575);
  color: white;
  transform: translateX(-2px);
}

.btn-back .icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0 0 4px 0;
  font-size: var(--pdf-font-size-medium, 16px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
  word-break: break-all;
}

.file-details {
  margin: 0;
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
}

/* 帮助面板 */
.help-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--pdf-spacing-medium, 16px);
}

.help-content {
  background: var(--pdf-color-background, #ffffff);
  border-radius: var(--pdf-border-radius-large, 8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pdf-spacing-medium, 16px) var(--pdf-spacing-large, 24px);
  border-bottom: 1px solid var(--pdf-color-border, #e0e0e0);
}

.help-title {
  margin: 0;
  font-size: var(--pdf-font-size-large, 18px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.btn-close {
  color: var(--pdf-color-secondary, #757575);
}

.btn-close:hover {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.help-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--pdf-spacing-large, 24px);
}

.help-section {
  margin-bottom: var(--pdf-spacing-large, 24px);
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section-title {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-medium, 16px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.help-list {
  margin: 0;
  padding-left: var(--pdf-spacing-medium, 16px);
  list-style: none;
}

.help-list li {
  position: relative;
  margin-bottom: var(--pdf-spacing-small, 8px);
  font-size: var(--pdf-font-size-small, 14px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.5;
}

.help-list li::before {
  content: '•';
  position: absolute;
  left: -12px;
  color: var(--pdf-color-primary, #1976d2);
  font-weight: bold;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--pdf-spacing-small, 8px);
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  padding: var(--pdf-spacing-small, 8px);
  background: var(--pdf-color-surface, #f5f5f5);
  border-radius: var(--pdf-border-radius, 4px);
}

.shortcut-key {
  display: inline-block;
  padding: 2px 6px;
  background: var(--pdf-color-border, #e0e0e0);
  border: 1px solid var(--pdf-color-secondary, #757575);
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
  color: var(--pdf-color-text, #212121);
  white-space: nowrap;
}

.shortcut-desc {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
}

/* 应用底部 */
.app-footer {
  background: var(--pdf-color-surface, #f5f5f5);
  border-top: 1px solid var(--pdf-color-border, #e0e0e0);
  padding: var(--pdf-spacing-large, 24px) 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--pdf-spacing-medium, 16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--pdf-spacing-medium, 16px);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-small, 8px);
}

.footer-text {
  margin: 0;
  font-size: var(--pdf-font-size-small, 14px);
  color: var(--pdf-color-secondary, #757575);
}

.footer-links {
  margin: 0;
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
}

.footer-link {
  color: var(--pdf-color-primary, #1976d2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--pdf-color-accent, #2196f3);
  text-decoration: underline;
}

.footer-separator {
  margin: 0 var(--pdf-spacing-small, 8px);
}

.footer-stats {
  display: flex;
  gap: var(--pdf-spacing-medium, 16px);
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: var(--pdf-color-secondary, #757575);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.stat-value {
  font-size: var(--pdf-font-size-small, 12px);
  font-weight: 600;
  color: var(--pdf-color-primary, #1976d2);
}

/* 全局加载指示器 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Toast通知 */
.toast-container {
  position: fixed;
  top: var(--pdf-spacing-large, 24px);
  right: var(--pdf-spacing-large, 24px);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-small, 8px);
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--pdf-spacing-small, 8px);
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-background, #ffffff);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
  border-radius: var(--pdf-border-radius, 4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.toast--success {
  border-left: 4px solid #4caf50;
}

.toast--error {
  border-left: 4px solid #f44336;
}

.toast--warning {
  border-left: 4px solid #ff9800;
}

.toast--info {
  border-left: 4px solid var(--pdf-color-primary, #1976d2);
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-icon .icon {
  width: 16px;
  height: 16px;
}

.toast--success .toast-icon .icon {
  fill: #4caf50;
}

.toast--error .toast-icon .icon {
  fill: #f44336;
}

.toast--warning .toast-icon .icon {
  fill: #ff9800;
}

.toast--info .toast-icon .icon {
  fill: var(--pdf-color-primary, #1976d2);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--pdf-font-size-small, 14px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
  margin-bottom: 2px;
}

.toast-message {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--pdf-color-secondary, #757575);
  transition: color 0.2s ease;
  margin-top: 2px;
}

.toast-close:hover {
  color: var(--pdf-color-text, #212121);
}

.toast-close .icon {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

/* Toast动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 主题样式 */
.app--dark {
  --pdf-color-background: #121212;
  --pdf-color-surface: #1e1e1e;
  --pdf-color-text: #ffffff;
  --pdf-color-secondary: #b0bec5;
  --pdf-color-border: #333333;
  --pdf-color-primary: #90caf9;
  --pdf-color-accent: #64b5f6;
}

.app--light {
  --pdf-color-background: #ffffff;
  --pdf-color-surface: #f5f5f5;
  --pdf-color-text: #212121;
  --pdf-color-secondary: #757575;
  --pdf-color-border: #e0e0e0;
  --pdf-color-primary: #1976d2;
  --pdf-color-accent: #2196f3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 var(--pdf-spacing-small, 8px);
  }

  .brand-text {
    display: none;
  }

  .upload-section {
    padding: var(--pdf-spacing-medium, 16px);
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: var(--pdf-spacing-medium, 16px);
  }

  .feature-item {
    padding: var(--pdf-spacing-medium, 16px);
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-stats {
    justify-content: center;
  }

  .toast-container {
    top: var(--pdf-spacing-medium, 16px);
    right: var(--pdf-spacing-medium, 16px);
    left: var(--pdf-spacing-medium, 16px);
    max-width: none;
  }

  .help-panel {
    padding: var(--pdf-spacing-small, 8px);
  }

  .help-content {
    max-height: 90vh;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--pdf-spacing-small, 8px);
  }

  .file-info {
    width: 100%;
  }

  .feature-icon {
    width: 48px;
    height: 48px;
  }

  .feature-icon .icon {
    width: 24px;
    height: 24px;
  }
}

/* 加载状态 */
.app--loading {
  overflow: hidden;
}

.app--loading * {
  pointer-events: none;
}

/* 查看器模式 */
.app--viewer-mode .app-footer {
  display: none;
}

/* 打印样式 */
@media print {
  .app-header,
  .help-panel,
  .toast-container,
  .global-loading {
    display: none !important;
  }

  .app-main {
    height: auto !important;
  }

  .viewer-section {
    height: auto !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .app {
    --pdf-color-border: #000000;
    --pdf-color-secondary: #000000;
  }

  .app--dark {
    --pdf-color-border: #ffffff;
    --pdf-color-secondary: #ffffff;
  }
}

/* 减少动画模式 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>