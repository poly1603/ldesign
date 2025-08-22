<template>
  <div class="pdf-demo-app">
    <!-- 头部导航 -->
    <header class="app-header">
      <h1>🎭 @ldesign/pdf Vue 3 示例</h1>
      <p>体验最优雅的PDF预览解决方案</p>
    </header>

    <!-- 主要内容区 -->
    <main class="app-main">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="upload-section">
          <label class="file-input-label">
            📁 选择PDF文件
            <input
              type="file"
              accept=".pdf"
              @change="handleFileSelect"
              class="file-input"
            />
          </label>
          
          <div class="url-input-section">
            <input
              v-model="pdfUrl"
              type="url"
              placeholder="或输入PDF文件URL..."
              class="url-input"
              @keyup.enter="loadFromUrl"
            />
            <button @click="loadFromUrl" class="load-btn">加载</button>
          </div>
        </div>

        <!-- 文档信息 -->
        <div v-if="documentInfo" class="document-info">
          <h3>📊 文档信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">页数：</span>
              <span class="value">{{ documentInfo.numPages }}</span>
            </div>
            <div class="info-item">
              <span class="label">标题：</span>
              <span class="value">{{ documentInfo.title || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="label">作者：</span>
              <span class="value">{{ documentInfo.author || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 控制选项 -->
        <div v-if="currentDocument" class="controls">
          <h3>🎛️ 控制选项</h3>
          
          <!-- 页面导航 -->
          <div class="page-controls">
            <button 
              @click="previousPage" 
              :disabled="currentPage <= 1"
              class="nav-btn"
            >
              ⬅️ 上一页
            </button>
            
            <div class="page-info">
              <input
                v-model.number="currentPage"
                type="number"
                :min="1"
                :max="documentInfo?.numPages || 1"
                @change="goToPage"
                class="page-input"
              />
              <span>/ {{ documentInfo?.numPages || 0 }}</span>
            </div>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage >= (documentInfo?.numPages || 0)"
              class="nav-btn"
            >
              下一页 ➡️
            </button>
          </div>

          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <label>🔍 缩放：{{ Math.round(scale * 100) }}%</label>
            <input
              v-model.number="scale"
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              @input="updateScale"
              class="zoom-slider"
            />
            <div class="zoom-buttons">
              <button @click="zoomOut" class="zoom-btn">🔍-</button>
              <button @click="resetZoom" class="zoom-btn">📐</button>
              <button @click="zoomIn" class="zoom-btn">🔍+</button>
            </div>
          </div>

          <!-- 旋转控制 -->
          <div class="rotation-controls">
            <label>🔄 旋转：{{ rotation }}°</label>
            <div class="rotation-buttons">
              <button @click="rotateLeft" class="rotate-btn">↺ 左转</button>
              <button @click="resetRotation" class="rotate-btn">📐 重置</button>
              <button @click="rotateRight" class="rotate-btn">↻ 右转</button>
            </div>
          </div>
        </div>

        <!-- 性能监控 -->
        <div v-if="performanceMetrics" class="performance-panel">
          <h3>📈 性能监控</h3>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">加载时间：</span>
              <span class="metric-value">{{ performanceMetrics.loadTime.toFixed(1) }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">渲染时间：</span>
              <span class="metric-value">{{ performanceMetrics.renderTime.toFixed(1) }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">缓存命中率：</span>
              <span class="metric-value">{{ (performanceMetrics.cacheHitRate * 100).toFixed(1) }}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">内存使用：</span>
              <span class="metric-value">{{ formatFileSize(performanceMetrics.memoryUsage) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF 渲染区域 -->
      <div class="pdf-viewer">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>🔄 {{ loadingMessage }}</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <div class="error-icon">❌</div>
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="retryLoad" class="retry-btn">🔄 重试</button>
        </div>
        
        <div v-else-if="!currentDocument" class="empty-state">
          <div class="empty-icon">📄</div>
          <h3>选择PDF文件开始预览</h3>
          <p>支持本地文件上传或URL链接</p>
        </div>
        
        <div v-else class="pdf-canvas-container">
          <canvas 
            ref="pdfCanvas" 
            class="pdf-canvas"
            @wheel="handleWheel"
          ></canvas>
        </div>
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <p>
        由 <strong>@ldesign/pdf</strong> 强力驱动 ⚡ 
        <a href="https://github.com/ldesign-team/ldesign" target="_blank">
          在 GitHub 上查看源码
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { createPdfEngine, formatUtils } from '@ldesign/pdf'
import * as pdfjs from 'pdfjs-dist'
import type { PdfDocument, PdfEngine, PerformanceMetrics } from '@ldesign/pdf'

// 响应式数据
const pdfCanvas = ref<HTMLCanvasElement>()
const pdfUrl = ref('https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')
const currentDocument = ref<PdfDocument>()
const currentPage = ref(1)
const scale = ref(1.0)
const rotation = ref(0)
const isLoading = ref(false)
const loadingMessage = ref('')
const error = ref('')
const engine = ref<PdfEngine>()
const performanceMetrics = ref<PerformanceMetrics>()

// 文档信息
const documentInfo = ref<{
  numPages: number
  title?: string
  author?: string
}>()

// 初始化
onMounted(async () => {
  try {
    loadingMessage.value = '初始化PDF引擎...'
    isLoading.value = true
    
    // 创建并初始化PDF引擎
    engine.value = createPdfEngine({
      enablePerformanceMonitoring: true,
      debug: import.meta.env.DEV,
      maxConcurrentDocuments: 3,
      pageCacheSize: 20,
    })
    
    await engine.value.initialize(pdfjs)
    
    // 监听性能更新
    setInterval(() => {
      if (engine.value) {
        performanceMetrics.value = engine.value.metrics
      }
    }, 1000)
    
    isLoading.value = false
    
    // 加载默认PDF
    if (pdfUrl.value) {
      await loadFromUrl()
    }
  } catch (err) {
    error.value = `初始化失败: ${err instanceof Error ? err.message : String(err)}`
    isLoading.value = false
  }
})

// 文件选择处理
const handleFileSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && file.type === 'application/pdf') {
    await loadDocument(file)
  }
}

// 从URL加载
const loadFromUrl = async () => {
  if (!pdfUrl.value.trim()) return
  await loadDocument(pdfUrl.value.trim())
}

// 加载PDF文档
const loadDocument = async (source: string | File) => {
  if (!engine.value) return
  
  try {
    isLoading.value = true
    error.value = ''
    loadingMessage.value = '加载PDF文档...'
    
    const document = await engine.value.loadDocument(source)
    currentDocument.value = document
    currentPage.value = 1
    
    // 获取文档信息
    const metadata = await document.getMetadata()
    documentInfo.value = {
      numPages: document.numPages,
      title: metadata.info.Title,
      author: metadata.info.Author,
    }
    
    loadingMessage.value = '渲染页面...'
    await renderCurrentPage()
    
    isLoading.value = false
  } catch (err) {
    error.value = `加载失败: ${err instanceof Error ? err.message : String(err)}`
    isLoading.value = false
  }
}

// 渲染当前页面
const renderCurrentPage = async () => {
  if (!currentDocument.value || !pdfCanvas.value) return
  
  try {
    const page = await currentDocument.value.getPage(currentPage.value)
    const viewport = page.getViewport({ scale: scale.value, rotation: rotation.value })
    
    const context = pdfCanvas.value.getContext('2d')!
    pdfCanvas.value.width = viewport.width
    pdfCanvas.value.height = viewport.height
    
    // 清空画布
    context.clearRect(0, 0, viewport.width, viewport.height)
    
    await page.render({
      canvasContext: context,
      viewport,
      background: '#ffffff',
    })
  } catch (err) {
    error.value = `渲染失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 页面导航
const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--
    await renderCurrentPage()
  }
}

const nextPage = async () => {
  if (currentDocument.value && currentPage.value < currentDocument.value.numPages) {
    currentPage.value++
    await renderCurrentPage()
  }
}

const goToPage = async () => {
  if (currentDocument.value) {
    const pageNum = Math.max(1, Math.min(currentPage.value, currentDocument.value.numPages))
    currentPage.value = pageNum
    await renderCurrentPage()
  }
}

// 缩放控制
const updateScale = async () => {
  await renderCurrentPage()
}

const zoomIn = async () => {
  scale.value = Math.min(3.0, scale.value + 0.2)
  await renderCurrentPage()
}

const zoomOut = async () => {
  scale.value = Math.max(0.5, scale.value - 0.2)
  await renderCurrentPage()
}

const resetZoom = async () => {
  scale.value = 1.0
  await renderCurrentPage()
}

// 旋转控制
const rotateLeft = async () => {
  rotation.value = (rotation.value - 90) % 360
  await renderCurrentPage()
}

const rotateRight = async () => {
  rotation.value = (rotation.value + 90) % 360
  await renderCurrentPage()
}

const resetRotation = async () => {
  rotation.value = 0
  await renderCurrentPage()
}

// 鼠标滚轮缩放
const handleWheel = async (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    scale.value = Math.max(0.5, Math.min(3.0, scale.value + delta))
    await renderCurrentPage()
  }
}

// 重试加载
const retryLoad = async () => {
  error.value = ''
  if (pdfUrl.value) {
    await loadFromUrl()
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  return formatUtils.formatFileSize(bytes)
}
</script>

<style scoped>
.pdf-demo-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.control-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.upload-section {
  margin-bottom: 2rem;
}

.file-input-label {
  display: block;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 1rem;
}

.file-input-label:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.file-input {
  display: none;
}

.url-input-section {
  display: flex;
  gap: 0.5rem;
}

.url-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
}

.load-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.load-btn:hover {
  background: #5a6fd8;
}

.controls h3,
.document-info h3,
.performance-panel h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.document-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #333;
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  text-align: center;
}

.zoom-controls,
.rotation-controls {
  margin-bottom: 1.5rem;
}

.zoom-controls label,
.rotation-controls label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.zoom-slider {
  width: 100%;
  margin-bottom: 0.5rem;
}

.zoom-buttons,
.rotation-buttons {
  display: flex;
  gap: 0.5rem;
}

.zoom-btn,
.rotate-btn {
  flex: 1;
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.zoom-btn:hover,
.rotate-btn:hover {
  background: #e9ecef;
}

.performance-panel {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.metrics-grid {
  display: grid;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.metric-label {
  color: #666;
  font-size: 0.9rem;
}

.metric-value {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.pdf-viewer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #c82333;
}

.pdf-canvas-container {
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.pdf-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.app-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  text-align: center;
  color: #666;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.app-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 0.5rem;
}

.app-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .control-panel {
    order: 2;
  }
  
  .pdf-viewer {
    order: 1;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .pdf-viewer {
    padding: 1rem;
    min-height: 400px;
  }
}
</style>