<template>
  <div class="app">
    <header class="app-header">
      <h1>@ldesign/pdf Vue3 示例</h1>
      <p>功能完整的PDF预览器演示</p>
    </header>

    <main class="app-main">
      <div class="demo-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="demo-content">
        <!-- 组件方式示例 -->
        <div v-if="activeTab === 'component'" class="demo-section">
          <h2>组件方式使用</h2>
          <p>使用 PdfViewer 组件，开箱即用的完整功能</p>

          <!-- 示例PDF选择 -->
          <div class="pdf-selection-section">
            <h3>📚 选择示例PDF</h3>
            <div class="pdf-grid">
              <div
                v-for="pdf in samplePdfs"
                :key="pdf.id"
                :class="['pdf-card', { active: selectedPdfId === pdf.id }]"
                @click="selectSamplePdf(pdf.id)"
              >
                <div class="pdf-icon">{{ pdf.icon }}</div>
                <div class="pdf-info">
                  <h4>{{ pdf.title }}</h4>
                  <p>{{ pdf.description }}</p>
                  <span class="pdf-size">{{ pdf.size }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 或者上传本地文件 -->
          <div class="file-input-section">
            <h3>📁 或上传本地PDF</h3>
            <input
              type="file"
              accept=".pdf"
              @change="handleFileChange"
              class="file-input"
            />
            <span class="file-hint">选择一个PDF文件进行预览</span>
          </div>

          <div class="pdf-viewer-container">
            <PdfViewer
              v-if="currentPdfSource"
              :src="currentPdfSource"
              :enable-toolbar="true"
              :enable-sidebar="true"
              :enable-search="true"
              :enable-thumbnails="true"
              :enable-fullscreen="true"
              :enable-download="true"
              :enable-print="true"
              :initial-scale="1"
              :zoom-mode="'fit-width'"
              @document-loaded="onDocumentLoaded"
              @page-changed="onPageChanged"
              @zoom-changed="onZoomChanged"
              @error="onError"
            />
            <div v-else class="placeholder">
              <div class="placeholder-icon">📄</div>
              <p>请选择一个PDF文件开始预览</p>
            </div>
          </div>
        </div>

        <!-- Hook方式示例 -->
        <div v-if="activeTab === 'hooks'" class="demo-section">
          <h2>Hook方式使用</h2>
          <p>使用 usePdfViewer Hook，更灵活的自定义控制</p>

          <!-- 示例PDF选择 -->
          <div class="pdf-selection-section">
            <h3>📚 选择示例PDF</h3>
            <div class="pdf-grid">
              <div
                v-for="pdf in samplePdfs"
                :key="pdf.id"
                :class="['pdf-card', { active: selectedHookPdfId === pdf.id }]"
                @click="selectHookSamplePdf(pdf.id)"
              >
                <div class="pdf-icon">{{ pdf.icon }}</div>
                <div class="pdf-info">
                  <h4>{{ pdf.title }}</h4>
                  <p>{{ pdf.description }}</p>
                  <span class="pdf-size">{{ pdf.size }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 或者上传本地文件 -->
          <div class="file-input-section">
            <h3>📁 或上传本地PDF</h3>
            <input
              type="file"
              accept=".pdf"
              @change="handleHookFileChange"
              class="file-input"
            />
            <span class="file-hint">选择一个PDF文件进行预览</span>
          </div>

          <!-- 自定义工具栏 -->
          <div v-if="hookFile" class="custom-toolbar">
            <div class="toolbar-group">
              <button @click="previousPage" :disabled="!canGoPrevious" class="toolbar-btn">
                ← 上一页
              </button>
              <div class="page-info">
                <input
                  type="number"
                  :value="state.currentPage"
                  :min="1"
                  :max="state.totalPages"
                  @change="handlePageInput"
                  class="page-input"
                />
                <span>/ {{ state.totalPages }}</span>
              </div>
              <button @click="nextPage" :disabled="!canGoNext" class="toolbar-btn">
                下一页 →
              </button>
            </div>

            <div class="toolbar-group">
              <button @click="zoomOut" class="toolbar-btn">缩小</button>
              <span class="zoom-info">{{ Math.round(state.currentScale * 100) }}%</span>
              <button @click="zoomIn" class="toolbar-btn">放大</button>
              <select @change="handleZoomModeChange" class="zoom-select">
                <option value="fit-width">适应宽度</option>
                <option value="fit-page">适应页面</option>
                <option value="auto">自动</option>
              </select>
            </div>

            <div class="toolbar-group">
              <button @click="rotateClockwise" class="toolbar-btn">旋转</button>
              <button @click="toggleFullscreen" class="toolbar-btn">
                {{ state.isFullscreen ? '退出全屏' : '全屏' }}
              </button>
            </div>

            <!-- 搜索功能 -->
            <div class="toolbar-group">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文档..."
                @keyup.enter="performSearch"
                class="search-input"
              />
              <button @click="performSearch" :disabled="!searchQuery.trim()" class="toolbar-btn">
                搜索
              </button>
              <button @click="findPrevious" :disabled="!hasResults" class="toolbar-btn">
                ↑
              </button>
              <button @click="findNext" :disabled="!hasResults" class="toolbar-btn">
                ↓
              </button>
              <span v-if="hasResults" class="search-results">
                {{ currentMatchIndex + 1 }} / {{ searchResults.length }}
              </span>
            </div>
          </div>

          <div class="pdf-container-wrapper">
            <div ref="containerRef" class="pdf-container"></div>
            <div v-if="!hookFile" class="placeholder">
              <div class="placeholder-icon">📄</div>
              <p>请选择一个PDF文件开始预览</p>
            </div>
          </div>

          <!-- 状态信息 -->
          <div v-if="hookFile" class="status-info">
            <h3>当前状态</h3>
            <div class="status-grid">
              <div class="status-item">
                <label>文档已加载:</label>
                <span>{{ state.isDocumentLoaded ? '是' : '否' }}</span>
              </div>
              <div class="status-item">
                <label>当前页面:</label>
                <span>{{ state.currentPage }}</span>
              </div>
              <div class="status-item">
                <label>总页数:</label>
                <span>{{ state.totalPages }}</span>
              </div>
              <div class="status-item">
                <label>缩放比例:</label>
                <span>{{ Math.round(state.currentScale * 100) }}%</span>
              </div>
              <div class="status-item">
                <label>缩放模式:</label>
                <span>{{ state.currentZoomMode }}</span>
              </div>
              <div class="status-item">
                <label>旋转角度:</label>
                <span>{{ state.currentRotation }}°</span>
              </div>
              <div class="status-item">
                <label>全屏模式:</label>
                <span>{{ state.isFullscreen ? '是' : '否' }}</span>
              </div>
              <div class="status-item">
                <label>进度:</label>
                <span>{{ Math.round(progress) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- API示例 -->
        <div v-if="activeTab === 'api'" class="demo-section">
          <h2>API 使用示例</h2>
          <p>展示各种API的使用方法</p>
          
          <div class="api-examples">
            <div class="api-section">
              <h3>文档加载</h3>
              <div class="code-example">
                <pre><code>// 从URL加载
await viewer.loadDocument('https://example.com/doc.pdf')

// 从File对象加载
const file = document.querySelector('input').files[0]
await viewer.loadDocument(file)

// 从ArrayBuffer加载
const buffer = await fetch('doc.pdf').then(r => r.arrayBuffer())
await viewer.loadDocument(buffer)</code></pre>
              </div>
            </div>

            <div class="api-section">
              <h3>页面导航</h3>
              <div class="code-example">
                <pre><code>// 跳转到指定页面
await viewer.goToPage(5)

// 上一页/下一页
await viewer.previousPage()
await viewer.nextPage()

// 获取当前状态
const state = viewer.getState()
console.log(`当前页面: ${state.currentPage}/${state.totalPages}`)</code></pre>
              </div>
            </div>

            <div class="api-section">
              <h3>缩放控制</h3>
              <div class="code-example">
                <pre><code>// 设置缩放比例
viewer.setZoom(1.5)

// 设置缩放模式
viewer.setZoomMode('fit-width')
viewer.setZoomMode('fit-page')
viewer.setZoomMode('auto')

// 放大/缩小
viewer.zoomIn()
viewer.zoomOut()</code></pre>
              </div>
            </div>

            <div class="api-section">
              <h3>文本搜索</h3>
              <div class="code-example">
                <pre><code>// 搜索文本
const results = await viewer.search({
  query: '搜索关键词',
  caseSensitive: false,
  wholeWords: false,
  highlightAll: true,
})

console.log(`找到 ${results.length} 个匹配项`)</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { PdfViewer, usePdfViewer, usePdfSearch } from '../../../esm/adapt/vue/index.js'
import '../../../esm/index.css'
import type { PdfDocumentInfo, PdfPageInfo, ZoomMode } from '@ldesign/pdf'

// 标签页状态
const activeTab = ref<'component' | 'hooks' | 'api'>('component')
const tabs = [
  { key: 'component', label: '组件方式' },
  { key: 'hooks', label: 'Hook方式' },
  { key: 'api', label: 'API示例' },
] as const

// 示例PDF数据
const samplePdfs = [
  {
    id: 'sample-pdf',
    title: '标准示例文档',
    description: '通用PDF测试文档',
    icon: '📄',
    size: '156KB',
    url: '/sample.pdf'
  },
  {
    id: 'lorem-ipsum',
    title: 'Lorem Ipsum 文档',
    description: '经典排版测试文档',
    icon: '📝',
    size: '245KB',
    url: '/pdfs/lorem-ipsum.pdf'
  },
  {
    id: 'sample-copy',
    title: '示例文档副本',
    description: '另一个测试PDF文档',
    icon: '📋',
    size: '156KB',
    url: '/pdfs/sample.pdf'
  },
  {
    id: 'test-doc-1',
    title: '测试文档 A',
    description: '第一个本地测试文档',
    icon: '🎓',
    size: '156KB',
    url: '/sample.pdf'
  },
  {
    id: 'test-doc-2',
    title: '测试文档 B',
    description: '第二个本地测试文档',
    icon: '⚙️',
    size: '245KB',
    url: '/pdfs/lorem-ipsum.pdf'
  },
  {
    id: 'test-doc-3',
    title: '测试文档 C',
    description: '第三个本地测试文档',
    icon: '📊',
    size: '156KB',
    url: '/pdfs/sample.pdf'
  }
]

// 组件方式状态
const selectedFile = ref<File | null>(null)
const selectedPdfId = ref<string>('')
const currentPdfSource = ref<string | File | null>(null)

// Hook方式状态
const containerRef = ref<HTMLElement>()
const hookFile = ref<File | null>(null)
const selectedHookPdfId = ref<string>('')

// 使用PDF预览器Hook
const {
  state,
  documentInfo,
  isLoading,
  error,
  canGoPrevious,
  canGoNext,
  progress,
  loadDocument,
  goToPage,
  previousPage,
  nextPage,
  setZoom,
  setZoomMode,
  zoomIn,
  zoomOut,
  rotate,
  enterFullscreen,
  exitFullscreen,
} = usePdfViewer(containerRef, {
  enableToolbar: false, // 使用自定义工具栏
  enableSidebar: false,
})

// 使用搜索Hook
const {
  searchQuery,
  searchResults,
  currentMatchIndex,
  hasResults,
  search: performSearch,
  findNext,
  findPrevious,
  clearSearch,
} = usePdfSearch(ref(null)) // 这里需要传入viewer ref，但为了简化示例暂时传null

// 事件处理
const selectSamplePdf = (pdfId: string) => {
  selectedPdfId.value = pdfId
  selectedFile.value = null // 清除本地文件选择
  const pdf = samplePdfs.find(p => p.id === pdfId)
  if (pdf) {
    currentPdfSource.value = pdf.url
  }
}

const selectHookSamplePdf = async (pdfId: string) => {
  selectedHookPdfId.value = pdfId
  hookFile.value = null // 清除本地文件选择
  const pdf = samplePdfs.find(p => p.id === pdfId)
  if (pdf) {
    try {
      await loadDocument(pdf.url)
    } catch (err) {
      console.error('加载示例PDF失败:', err)
    }
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    selectedPdfId.value = '' // 清除示例PDF选择
    currentPdfSource.value = file
  }
}

const handleHookFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    hookFile.value = file
    selectedHookPdfId.value = '' // 清除示例PDF选择
    try {
      await loadDocument(file)
    } catch (err) {
      console.error('加载文档失败:', err)
    }
  }
}

const handlePageInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const pageNumber = parseInt(target.value, 10)
  if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= state.value.totalPages) {
    goToPage(pageNumber)
  }
}

const handleZoomModeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setZoomMode(target.value as ZoomMode)
}

const rotateClockwise = () => {
  const newRotation = (state.value.currentRotation + 90) % 360
  rotate(newRotation as 0 | 90 | 180 | 270)
}

const toggleFullscreen = () => {
  if (state.value.isFullscreen) {
    exitFullscreen()
  } else {
    enterFullscreen()
  }
}

// 组件事件处理
const onDocumentLoaded = (info: PdfDocumentInfo) => {
  console.log('文档已加载:', info)
}

const onPageChanged = (pageNumber: number, pageInfo: PdfPageInfo) => {
  console.log('页面变化:', pageNumber, pageInfo)
}

const onZoomChanged = (scale: number, zoomMode: ZoomMode) => {
  console.log('缩放变化:', scale, zoomMode)
}

const onError = (err: Error) => {
  console.error('PDF错误:', err)
}
</script>

<style scoped>
/* PDF选择区域样式 */
.pdf-selection-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.pdf-selection-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.pdf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.pdf-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pdf-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  transform: translateY(-1px);
}

.pdf-card.active {
  border-color: #007bff;
  background: #f8f9ff;
  box-shadow: 0 2px 12px rgba(0, 123, 255, 0.2);
}

.pdf-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.pdf-info {
  flex: 1;
  min-width: 0;
}

.pdf-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
}

.pdf-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.3;
}

.pdf-size {
  font-size: 0.75rem;
  color: #868e96;
  font-weight: 500;
}

/* 文件输入区域样式调整 */
.file-input-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  text-align: center;
  transition: border-color 0.2s ease;
}

.file-input-section:hover {
  border-color: #007bff;
}

.file-input-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.file-input {
  margin-bottom: 0.5rem;
}

.file-hint {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
}
</style>
