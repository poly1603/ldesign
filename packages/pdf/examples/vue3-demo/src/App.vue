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

          <!-- 高度模式选择 -->
          <div class="height-mode-selector">
            <h3>📐 高度模式选择</h3>
            <div class="mode-options">
              <label class="mode-option">
                <input
                  type="radio"
                  v-model="heightMode"
                  value="auto"
                />
                <span>自适应高度（单页模式）</span>
                <small>容器高度自适应一页内容，通过缩略图/上下页切换</small>
              </label>
              <label class="mode-option">
                <input
                  type="radio"
                  v-model="heightMode"
                  value="custom"
                />
                <span>自定义高度（滚动模式）</span>
                <small>固定容器高度，内容区可上下滚动，缩略图自动跟随</small>
              </label>
            </div>
            <div v-if="heightMode === 'custom'" class="custom-height-input">
              <label>
                自定义高度：
                <input
                  type="text"
                  v-model="customHeight"
                  placeholder="如：600px 或 70vh"
                />
              </label>
            </div>
          </div>

          <!-- 滚动状态显示 -->
          <div v-if="heightMode === 'custom' && currentPdfSource" class="scroll-status">
            <h4>滚动联动状态</h4>
            <div class="status-info">
              <span>当前页面: {{ currentPageNumber }}</span>
              <span>可见页面: {{ visiblePageNumbers.join(', ') || '无' }}</span>
              <span>总页数: {{ totalPages }}</span>
            </div>
          </div>

          <div :class="['pdf-viewer-container', { 'auto-height-mode': heightMode === 'auto' }]">
            <PdfViewer
              v-if="currentPdfSource"
              :src="currentPdfSource"
              :height-mode="heightMode"
              :height="heightMode === 'custom' ? customHeight : undefined"
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
              @visible-pages-changed="onVisiblePagesChanged"
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

          <!-- Hook渲染区域包裹，与组件样式保持一致 -->
          <div class="ldesign-pdf-viewer-wrapper">
            <!-- 与组件一致的工具栏 -->
            <div v-if="hookLoaded" class="pdf-toolbar">
            <div class="toolbar-group">
              <button class="toolbar-btn" :disabled="!canGoPrevious" @click="previousPage" title="上一页">←</button>
              <div class="page-info">
                <input type="number" class="page-input" :value="state.currentPage" :min="1" :max="state.totalPages" @change="handlePageInput" />
                <span class="page-total">/ {{ state.totalPages }}</span>
              </div>
              <button class="toolbar-btn" :disabled="!canGoNext" @click="nextPage" title="下一页">→</button>
            </div>

            <div class="toolbar-group">
              <button class="toolbar-btn" @click="zoomOut" title="缩小">-</button>
              <select class="zoom-select" @change="handleZoomModeChange">
                <option value="fit-width">适应宽度</option>
                <option value="fit-page">适应页面</option>
                <option value="auto">自动</option>
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.25">125%</option>
                <option value="1.5">150%</option>
                <option value="2">200%</option>
              </select>
              <button class="toolbar-btn" @click="zoomIn" title="放大">+</button>
            </div>

            <div class="toolbar-group">
              <button class="toolbar-btn" @click="rotateClockwise" title="旋转">↻</button>
              <button class="toolbar-btn" @click="toggleFullscreen" title="全屏">{{ state.isFullscreen ? '⤓' : '⤢' }}</button>
              <button class="toolbar-btn" @click="downloadFile" title="下载" :disabled="!hookLoaded">↓</button>
              <button class="toolbar-btn" @click="printFile" title="打印" :disabled="!hookLoaded">🖨</button>
              <button class="toolbar-btn" :class="{ active: showSearch }" @click="toggleSearch" title="搜索">🔍</button>
              <button class="toolbar-btn" :class="{ active: showSidebar }" @click="toggleSidebar" title="侧边栏">☰</button>
            </div>
          </div>

          <!-- 与组件一致的搜索栏 -->
          <div v-if="showSearch && hookLoaded" class="pdf-search-bar">
            <input ref="searchInputRef" v-model="searchQuery" type="text" class="search-input" placeholder="搜索文档..." @keydown.enter.prevent="onSearchEnter" @keydown.escape.prevent="closeSearch" />
            <div class="search-controls">
              <button class="search-btn" @click="onFindPrev" :disabled="!hasResults" title="上一个">↑</button>
              <button class="search-btn" @click="onFindNext" :disabled="!hasResults" title="下一个">↓</button>
              <span class="search-results">{{ hasResults ? `${currentMatchIndex + 1} / ${searchResults.length}` : '' }}</span>
              <button class="search-btn" @click="closeSearch" title="关闭">×</button>
            </div>
          </div>

          <!-- 高度模式选择（Hook） -->
          <div class="height-mode-selector">
            <h3>📐 高度模式选择</h3>
            <div class="mode-options">
              <label class="mode-option">
                <input type="radio" value="auto" v-model="hookHeightMode" />
                <span>自适应高度（单页模式）</span>
                <small>容器高度自适应一页内容，通过缩略图/上下页切换</small>
              </label>
              <label class="mode-option">
                <input type="radio" value="custom" v-model="hookHeightMode" />
                <span>自定义高度（滚动模式）</span>
                <small>固定容器高度，内容区可上下滚动，缩略图自动跟随</small>
              </label>
            </div>
            <div v-if="hookHeightMode === 'custom'" class="custom-height-input">
              <label>
                自定义高度：
                <input type="text" v-model="hookCustomHeight" placeholder="如：600px 或 70vh" />
              </label>
            </div>
          </div>

          <!-- 与组件一致的内容区（侧边栏 + 主体） -->
          <div class="pdf-content">
            <div v-show="showSidebar" class="pdf-sidebar">
              <div class="sidebar-content">
                <div class="thumbnails-section">
                  <h3>页面缩略图</h3>
                  <div class="thumbnails-container" ref="thumbnailsContainerRef">
                    <div v-if="thumbnailsLoading" class="thumbnail-placeholder">缩略图加载中...</div>
                    <template v-else>
                      <div
                        v-for="thumb in sortedThumbnails"
                        :key="thumb.pageNumber"
                        class="pdf-thumbnail"
                        :class="{ active: state.currentPage === thumb.pageNumber }"
                        :data-page-number="thumb.pageNumber"
                        :title="`第 ${thumb.pageNumber} 页`"
                        @click="handleThumbnailClick(thumb.pageNumber)"
                      >
                        <div class="thumbnail-image">
                          <div :ref="el => attachCanvas(el, thumb.canvas)"></div>
                        </div>
                        <div class="thumbnail-label">{{ thumb.pageNumber }}</div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="pdf-main" :class="{ 'auto-height-mode': hookHeightMode === 'auto' }">
              <div
                ref="containerRef"
                class="pdf-container"
                :class="[hookHeightMode === 'auto' ? 'single-page auto-height' : 'custom-height', hookHeightMode === 'auto' && animateNextPage ? 'page-animate' : '']"
                :style="containerStyle"
              />
            </div>
          </div>
          </div>

          <!-- 状态信息（可选展示） -->
          <div v-if="hookLoaded" class="status-info" style="margin-top:12px;">
            <h3>当前状态</h3>
            <div class="status-grid">
              <div class="status-item"><label>文档已加载:</label><span>{{ state.isDocumentLoaded ? '是' : '否' }}</span></div>
              <div class="status-item"><label>当前页面:</label><span>{{ state.currentPage }}</span></div>
              <div class="status-item"><label>总页数:</label><span>{{ state.totalPages }}</span></div>
              <div class="status-item"><label>缩放比例:</label><span>{{ Math.round(state.currentScale * 100) }}%</span></div>
              <div class="status-item"><label>缩放模式:</label><span>{{ state.currentZoomMode }}</span></div>
              <div class="status-item"><label>旋转角度:</label><span>{{ state.currentRotation }}°</span></div>
              <div class="status-item"><label>进度:</label><span>{{ Math.round(progress) }}%</span></div>
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
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { PdfViewer, usePdfViewer, usePdfSearch } from '@ldesign/pdf/adapt/vue'
import '@ldesign/pdf/adapt/vue/PdfViewer.less'
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
    id: 'mozilla-test',
    title: 'TraceMonkey 研究论文',
    description: 'Mozilla的JavaScript JIT编译器研究论文（14页）',
    icon: '🔥',
    size: '1MB',
    url: '/mozilla-test.pdf'
  },
  {
    id: 'mozilla-guide',
    title: 'PDF.js 开发指南',
    description: 'Mozilla PDF.js库的完整开发文档（14页）',
    icon: '📚',
    size: '1MB',
    url: '/pdfs/mozilla-guide.pdf'
  },
  {
    id: 'learning-sample',
    title: '学习容器示例文档',
    description: '包含丰富内容的多页PDF示例（5页）',
    icon: '📖',
    size: '146KB',
    url: '/pdfs/learning-sample.pdf'
  },
  {
    id: 'sample-pdf',
    title: '简单测试文档',
    description: '基础PDF功能测试文档（1页）',
    icon: '📄',
    size: '13KB',
    url: '/sample.pdf'
  }
]

// 组件方式状态
const selectedFile = ref<File | null>(null)
const selectedPdfId = ref<string>('')
const currentPdfSource = ref<string | File | null>(null)
const heightMode = ref<'auto' | 'custom'>('auto')
const customHeight = ref<string>('600px')

// 滚动状态
const currentPageNumber = ref<number>(1)
const visiblePageNumbers = ref<number[]>([])
const totalPages = ref<number>(0)

// Hook方式状态
const containerRef = ref<HTMLElement>()
const thumbnailsContainerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const hookFile = ref<File | null>(null)
const selectedHookPdfId = ref<string>('')
// hook viewer 局部UI状态
const hookHeightMode = ref<'auto' | 'custom'>('auto')
const hookCustomHeight = ref<string>('600px')
const showSidebar = ref(true)
const showSearch = ref(false)
const thumbnails = ref<Array<{ pageNumber: number; canvas: HTMLCanvasElement }>>([])
const thumbnailsLoading = ref(false)
const animateNextPage = ref(false)
let lastThumbClick = false
let scrollTimeout: number | null = null

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
  // 新增（来自 hooks.ts 的高级能力）
  setHeightMode,
  getPageRenderInfos,
  calculateVisiblePages,
  getPageScrollPosition,
  viewer,
} = usePdfViewer(containerRef, {
  enableToolbar: false,
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
} = usePdfSearch(viewer)

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
    void goToPage(pageNumber)
  }
}

const handleZoomModeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (['fit-width', 'fit-page', 'auto'].includes(value)) {
    setZoomMode(value as ZoomMode)
  } else {
    const s = parseFloat(value)
    if (!isNaN(s)) setZoom(s)
  }
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

// Hook 版与组件版一致的缩略图/搜索/高度逻辑
const thumbnailsContainerStyleTopAdjust = 8

const attachCanvas = (host: Element | null, canvas: HTMLCanvasElement) => {
  const el = host as HTMLElement | null
  if (el && !el.querySelector('canvas')) {
    el.appendChild(canvas)
  }
}

const generateHookThumbnails = async () => {
  if (!state.value.isDocumentLoaded) return
  thumbnailsLoading.value = true
  thumbnails.value = []
  try {
    const doc = await viewer.value?.getDocument()
    if (!doc) return
    for (let pageNum = 1; pageNum <= state.value.totalPages; pageNum++) {
      const page = await doc.getPage(pageNum)
      const viewport = page.getViewport({ scale: 0.2 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
      thumbnails.value.push({ pageNumber: pageNum, canvas })
    }
  } catch (e) {
    console.error('生成缩略图失败:', e)
  } finally {
    thumbnailsLoading.value = false
  }
}

const sortedThumbnails = computed(() => thumbnails.value.slice().sort((a, b) => a.pageNumber - b.pageNumber))

const updateThumbnailActiveState = () => {
  const container = thumbnailsContainerRef.value
  if (!container) return
  const currentPage = state.value.currentPage
  container.querySelectorAll('.pdf-thumbnail').forEach(el => el.classList.remove('active'))
  const active = container.querySelector(`.pdf-thumbnail[data-page-number="${currentPage}"]`)
  if (active) active.classList.add('active')
}

const scrollActiveThumbnailToTop = () => {
  const container = thumbnailsContainerRef.value
  if (!container) return
  const currentPage = state.value.currentPage
  const active = container.querySelector(`.pdf-thumbnail[data-page-number="${currentPage}"]`) as HTMLElement | null
  if (active) {
    // 确保选中的缩略图滚动到容器顶部，留出少量边距
    const targetScrollTop = Math.max(0, active.offsetTop - thumbnailsContainerStyleTopAdjust)
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
  }
}

const handleThumbnailClick = (pageNumber: number) => {
  lastThumbClick = true
  if (hookHeightMode.value === 'custom') {
    const pos = getPageScrollPosition(pageNumber)
    if (containerRef.value) containerRef.value.scrollTo({ top: pos, behavior: 'smooth' })
    state.value.currentPage = pageNumber
    updateThumbnailActiveState()
    scrollActiveThumbnailToTop()
  } else {
    animateNextPage.value = true
    void goToPage(pageNumber)
  }
}

const onSearchEnter = async () => {
  if (searchQuery.value.trim()) await performSearch(searchQuery.value)
}
const onFindNext = () => {
  findNext()
  nextTick(() => {
    const m = (searchResults.value || [])[currentMatchIndex.value]
    if (!m || !containerRef.value) return
    if (hookHeightMode.value === 'custom') {
      const pageTop = getPageScrollPosition(m.pageNumber)
      const targetTop = Math.max(0, pageTop + m.position.y - 40)
      containerRef.value.scrollTo({ top: targetTop, behavior: 'smooth' })
    } else {
      animateNextPage.value = true
      void goToPage(m.pageNumber)
    }
  })
}
const onFindPrev = () => {
  findPrevious()
  nextTick(() => {
    const m = (searchResults.value || [])[currentMatchIndex.value]
    if (!m || !containerRef.value) return
    if (hookHeightMode.value === 'custom') {
      const pageTop = getPageScrollPosition(m.pageNumber)
      const targetTop = Math.max(0, pageTop + m.position.y - 40)
      containerRef.value.scrollTo({ top: targetTop, behavior: 'smooth' })
    } else {
      animateNextPage.value = true
      void goToPage(m.pageNumber)
    }
  })
}
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) setTimeout(() => searchInputRef.value?.focus(), 100)
}
const closeSearch = () => {
  showSearch.value = false
  clearSearch()
}
const toggleSidebar = () => { showSidebar.value = !showSidebar.value }

const calculateAutoHeightHook = async () => {
  if (!viewer.value || !state.value.isDocumentLoaded || hookHeightMode.value !== 'auto') return
  try {
    const doc = await viewer.value.getDocument()
    if (!doc) return
    const page = await doc.getPage(state.value.currentPage)
    const viewport = page.getViewport({ scale: state.value.currentScale, rotation: state.value.currentRotation })
    // 说明：.pdf-container 本身有上下各 20px 的 padding（共 40px）
    // CSS 中 height 指的是内容区高度，不包含 padding。
    // 因此此处应使用页面的 CSS 高度 viewport.height，避免重复叠加 40px。
    const contentHeight = viewport.height
    if (containerRef.value) {
      containerRef.value.style.height = `${contentHeight}px`
      containerRef.value.style.minHeight = 'auto'
      containerRef.value.style.maxHeight = 'none'
      containerRef.value.style.overflow = 'visible'
    }
    // 同步左侧缩略图容器高度（去除固定值以避免布局拉伸，交给 flex 自适应）
    if (thumbnailsContainerRef.value) {
      thumbnailsContainerRef.value.style.height = ''
      thumbnailsContainerRef.value.style.overflowY = 'auto'
    }
  } catch (e) { console.error('计算自适应高度失败:', e) }
}

const containerStyle = computed(() => ({
  display: isLoading.value || error.value ? 'none' : 'block',
  height: hookHeightMode.value === 'custom' ? String(hookCustomHeight.value) : 'auto',
  overflow: hookHeightMode.value === 'custom' ? 'auto' as const : 'visible' as const,
}))

const onContainerScroll = () => {
  if (!containerRef.value || !viewer.value || hookHeightMode.value !== 'custom') return
  const container = containerRef.value
  const scrollTop = container.scrollTop
  const ch = container.clientHeight
  if (scrollTimeout) window.clearTimeout(scrollTimeout)
  scrollTimeout = window.setTimeout(() => {
    const vis = calculateVisiblePages(scrollTop, ch)
    viewer.value!.updateVisiblePages(scrollTop, ch)
    if (vis.currentPage !== state.value.currentPage) {
      state.value.currentPage = vis.currentPage
      updateThumbnailActiveState()
      // 只有在页面真正改变时才滚动缩略图，避免频繁滚动
      scrollActiveThumbnailToTop()
    }
  }, 100)
}

const hookLoaded = computed(() => state.value.isDocumentLoaded)

watch(viewer, (v) => {
  if (!v) return
  v.on('documentLoaded', () => {
    setHeightMode(hookHeightMode.value)
    if (showSidebar.value) setTimeout(() => generateHookThumbnails(), 100)
    setTimeout(() => calculateAutoHeightHook(), 100)
  })
  v.on('pageChanged', () => {
    updateThumbnailActiveState()
    if (hookHeightMode.value === 'auto') {
      if (!lastThumbClick) scrollActiveThumbnailToTop()
      lastThumbClick = false
      setTimeout(() => calculateAutoHeightHook(), 100)
    } else {
      scrollActiveThumbnailToTop()
    }
  })
  v.on('zoomChanged', () => { if (hookHeightMode.value === 'auto') setTimeout(() => calculateAutoHeightHook(), 100) })
  v.on('rotationChanged', () => { if (hookHeightMode.value === 'auto') setTimeout(() => calculateAutoHeightHook(), 100) })
  v.on('renderComplete', () => {
    if (hookHeightMode.value === 'auto' && animateNextPage.value) setTimeout(() => { animateNextPage.value = false }, 260)
  })
})

watch(containerRef, (el, _, onCleanup) => {
  if (el && hookHeightMode.value === 'custom') el.addEventListener('scroll', onContainerScroll, { passive: true })
  onCleanup(() => el?.removeEventListener('scroll', onContainerScroll))
})

// 切换高度模式与自定义高度联动
watch(hookHeightMode, (mode) => {
  setHeightMode(mode, mode === 'custom' ? hookCustomHeight.value : undefined)
  if (mode === 'auto') {
    setTimeout(() => calculateAutoHeightHook(), 100)
  }
})

watch(hookCustomHeight, (h) => {
  if (hookHeightMode.value === 'custom') {
    setHeightMode('custom', h)
  }
})

const downloadFile = async () => { try { await viewer.value?.download() } catch (e) { console.error(e) } }
const printFile = async () => { try { await viewer.value?.print() } catch (e) { console.error(e) } }

// 组件事件处理
const onDocumentLoaded = (info: PdfDocumentInfo) => {
  console.log('文档已加载:', info)
  totalPages.value = info.numPages
}

const onPageChanged = (pageNumber: number, pageInfo: PdfPageInfo) => {
  console.log('页面变化:', pageNumber, pageInfo)
  currentPageNumber.value = pageNumber
}

const onZoomChanged = (scale: number, zoomMode: ZoomMode) => {
  console.log('缩放变化:', scale, zoomMode)
}

const onVisiblePagesChanged = (currentPage: number, visiblePages: number[]) => {
  console.log('可见页面变化:', { currentPage, visiblePages })
  currentPageNumber.value = currentPage
  visiblePageNumbers.value = visiblePages
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

/* 高度模式选择器样式 */
.height-mode-selector {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.height-mode-selector h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mode-option:hover {
  background-color: #e9ecef;
}

.mode-option input[type="radio"] {
  margin-right: 8px;
}

.mode-option span {
  font-weight: 500;
  color: #333;
}

.mode-option small {
  color: #666;
  font-size: 12px;
  margin-left: 20px;
}

.custom-height-input {
  margin-top: 12px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
}

.custom-height-input label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.custom-height-input input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 120px;
}

.custom-height-input input:focus {
  outline: none;
  border-color: #007bff;
}

/* 滚动状态显示 */
.scroll-status {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.scroll-status h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.status-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
}

.status-info span {
  padding: 4px 8px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  color: #6c757d;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.status-info span:first-child {
  color: #007bff;
  border-color: #b3d7ff;
  background: #f0f8ff;
}

/* PDF容器样式 */
.pdf-viewer-container {
  flex: 1;
  min-height: 0;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

/* 自适应高度模式下的容器样式 */
.pdf-viewer-container.auto-height-mode {
  overflow: visible;
  height: auto;
  min-height: auto;
  flex: none;
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
