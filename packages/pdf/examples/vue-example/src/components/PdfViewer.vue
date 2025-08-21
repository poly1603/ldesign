<script setup lang="ts">
import type { PdfViewerProps, SearchResult } from '../types'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { usePdfViewer } from '../composables/usePdfViewer'
import { useTheme } from '../composables/useTheme'
import LoadingIndicator from './LoadingIndicator.vue'

// Props
const props = withDefaults(defineProps<PdfViewerProps>(), {
  initialZoom: 1,
  enableSearch: true,
  enableThumbnails: true,
  enableDownload: true,
  enablePrint: true,
  theme: 'auto',
})

// Emits
const emit = defineEmits<{
  pageChange: [page: number]
  zoomChange: [zoom: number]
  documentLoad: [info: any]
  error: [error: Error]
  search: [query: string, results: SearchResult[]]
}>()

// 主题管理
const { isDark, toggleTheme } = useTheme(props.theme)

// PDF查看器
const {
  // 状态
  loading,
  error,
  pdfLoaded,
  currentPage,
  totalPages,
  zoom,
  pdfInfo,
  searchResults,
  currentSearchIndex,
  thumbnails,
  loadingProgress,
  loadingMessage,
  loadingStage,
  performanceMetrics,

  // 方法
  loadPdf,
  goToPage,
  nextPage,
  previousPage,
  zoomIn,
  zoomOut,
  setZoom,
  search,
  clearSearch,
  downloadPdf,
  printPdf,
  renderPage,
  generateThumbnails,
} = usePdfViewer({
  enableSearch: props.enableSearch,
  enableThumbnails: props.enableThumbnails,
  initialZoom: props.initialZoom,
})

// 本地状态
const showSearch = ref(false)
const showThumbnails = ref(false)
const searchQuery = ref('')
const inputPage = ref(1)
const selectedZoom = ref(1)
const fileInput = ref<HTMLInputElement>()
const pageCanvas = ref<HTMLCanvasElement>()
const documentContainer = ref<HTMLDivElement>()

// 鼠标交互状态
const isDragging = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// 计算属性
const canGoPrevious = computed(() => currentPage.value > 1)
const canGoNext = computed(() => currentPage.value < totalPages.value)
const canZoomIn = computed(() => zoom.value < 3)
const canZoomOut = computed(() => zoom.value > 0.25)

const themeClasses = computed(() => ({
  'pdf-viewer--dark': isDark.value,
  'pdf-viewer--light': !isDark.value,
}))

const performanceInfo = computed(() => {
  if (!performanceMetrics.value)
    return ''
  const { renderTime, memoryUsage } = performanceMetrics.value
  return `渲染: ${renderTime}ms | 内存: ${memoryUsage}MB`
})

// 缩放选项
const zoomOptions = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
  { value: 2, label: '200%' },
  { value: 3, label: '300%' },
]

// 方法
function openFile() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && file.type === 'application/pdf') {
    try {
      await loadPdf(file)
      emit('documentLoad', pdfInfo.value)
    }
    catch (err) {
      emit('error', err as Error)
    }
  }
}

function retryLoad() {
  if (fileInput.value?.files?.[0]) {
    onFileSelected({ target: fileInput.value } as any)
  }
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSearch()
    searchQuery.value = ''
  }
}

function toggleThumbnails() {
  showThumbnails.value = !showThumbnails.value
  if (showThumbnails.value && thumbnails.value.length === 0) {
    generateThumbnails()
  }
}

async function performSearch() {
  if (searchQuery.value.trim()) {
    const results = await search(searchQuery.value)
    emit('search', searchQuery.value, results)
  }
}

function onSearchInput() {
  if (!searchQuery.value.trim()) {
    clearSearch()
  }
}

function getHighlightStyle(result: SearchResult) {
  return {
    left: `${result.x}px`,
    top: `${result.y}px`,
    width: `${result.width}px`,
    height: `${result.height}px`,
  }
}

function onThumbnailLoad(pageNumber: number) {
  console.log(`缩略图 ${pageNumber} 加载完成`)
}

function onThumbnailError(pageNumber: number) {
  console.error(`缩略图 ${pageNumber} 加载失败`)
}

// 鼠标事件处理
function onWheel(event: WheelEvent) {
  if (event.ctrlKey) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.25, Math.min(3, zoom.value + delta))
    setZoom(newZoom)
  }
}

function onMouseDown(event: MouseEvent) {
  isDragging.value = true
  lastMousePos.value = { x: event.clientX, y: event.clientY }
  event.preventDefault()
}

function onMouseMove(event: MouseEvent) {
  if (!isDragging.value)
    return

  const deltaX = event.clientX - lastMousePos.value.x
  const deltaY = event.clientY - lastMousePos.value.y

  if (documentContainer.value) {
    documentContainer.value.scrollLeft -= deltaX
    documentContainer.value.scrollTop -= deltaY
  }

  lastMousePos.value = { x: event.clientX, y: event.clientY }
}

function onMouseUp() {
  isDragging.value = false
}

function onMouseLeave() {
  isDragging.value = false
}

// 监听器
watch(currentPage, (newPage) => {
  inputPage.value = newPage
  emit('pageChange', newPage)
  if (pdfLoaded.value) {
    nextTick(() => {
      renderPage(newPage)
    })
  }
})

watch(zoom, (newZoom) => {
  selectedZoom.value = newZoom
  emit('zoomChange', newZoom)
})

watch(error, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})

// 生命周期
onMounted(() => {
  // 键盘快捷键
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault()
          toggleSearch()
          break
        case '=':
        case '+':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case '0':
          event.preventDefault()
          setZoom(1)
          break
      }
    }
    else {
      switch (event.key) {
        case 'ArrowLeft':
          if (!showSearch.value) {
            event.preventDefault()
            previousPage()
          }
          break
        case 'ArrowRight':
          if (!showSearch.value) {
            event.preventDefault()
            nextPage()
          }
          break
        case 'Escape':
          if (showSearch.value) {
            toggleSearch()
          }
          break
      }
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<template>
  <div class="pdf-viewer" :class="themeClasses">
    <!-- 工具栏 -->
    <div class="pdf-toolbar">
      <div class="toolbar-left">
        <button
          class="toolbar-btn"
          :disabled="loading"
          title="打开PDF文件"
          @click="openFile"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          打开文件
        </button>

        <div class="toolbar-divider" />

        <button
          class="toolbar-btn"
          :disabled="!canGoPrevious"
          title="上一页"
          @click="previousPage"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M15.41,16.58L10.83,12L15.41,7.42L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </button>

        <div class="page-info">
          <input
            v-model.number="inputPage"
            class="page-input"
            type="number"
            :min="1"
            :max="totalPages"
            @keyup.enter="goToPage(inputPage)"
            @blur="inputPage = currentPage"
          >
          <span class="page-total">/ {{ totalPages }}</span>
        </div>

        <button
          class="toolbar-btn"
          :disabled="!canGoNext"
          title="下一页"
          @click="nextPage"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M8.59,16.58L13.17,12L8.59,7.42L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </button>

        <div class="toolbar-divider" />

        <button
          class="toolbar-btn"
          :disabled="!canZoomOut"
          title="缩小"
          @click="zoomOut"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M19,13H5V11H19V13Z" />
          </svg>
        </button>

        <div class="zoom-info">
          <select v-model="selectedZoom" class="zoom-select" @change="setZoom(selectedZoom)">
            <option v-for="option in zoomOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button
          class="toolbar-btn"
          :disabled="!canZoomIn"
          title="放大"
          @click="zoomIn"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
        </button>
      </div>

      <div class="toolbar-center">
        <div v-if="showSearch" class="search-container">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="搜索文档内容..."
            @keyup.enter="performSearch"
            @input="onSearchInput"
          >
          <button
            class="search-btn"
            :disabled="!searchQuery.trim()"
            title="搜索"
            @click="performSearch"
          >
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
          </button>
          <button
            v-if="searchResults.length > 0"
            class="search-btn"
            title="清除搜索"
            @click="clearSearch"
          >
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
          <div v-if="searchResults.length > 0" class="search-results">
            {{ currentSearchIndex + 1 }} / {{ searchResults.length }}
          </div>
        </div>
      </div>

      <div class="toolbar-right">
        <button
          class="toolbar-btn"
          :class="{ active: showSearch }"
          title="搜索"
          @click="toggleSearch"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :class="{ active: showThumbnails }"
          title="缩略图"
          @click="toggleThumbnails"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,12H7V14H5V12M3,13H9V19H3V13M5,15V17H7V15H5Z" />
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :disabled="!pdfLoaded"
          title="下载"
          @click="downloadPdf"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :disabled="!pdfLoaded"
          title="打印"
          @click="printPdf"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
          </svg>
        </button>

        <div class="toolbar-divider" />

        <button
          class="toolbar-btn"
          :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
          @click="toggleTheme"
        >
          <svg v-if="isDark" class="icon" viewBox="0 0 24 24">
            <path d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24">
            <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="pdf-content">
      <!-- 侧边栏 -->
      <div v-if="showThumbnails" class="pdf-sidebar">
        <div class="sidebar-header">
          <h3>缩略图</h3>
          <button class="close-btn" @click="showThumbnails = false">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
        <div class="thumbnails-container">
          <div
            v-for="page in thumbnails"
            :key="page.pageNumber"
            class="thumbnail-item"
            :class="{ active: page.pageNumber === currentPage }"
            @click="goToPage(page.pageNumber)"
          >
            <div class="thumbnail-image">
              <img
                v-if="page.imageUrl"
                :src="page.imageUrl"
                :alt="`第 ${page.pageNumber} 页`"
                @load="onThumbnailLoad(page.pageNumber)"
                @error="onThumbnailError(page.pageNumber)"
              >
              <div v-else class="thumbnail-placeholder">
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
            </div>
            <div class="thumbnail-label">
              {{ page.pageNumber }}
            </div>
          </div>
        </div>
      </div>

      <!-- 文档显示区域 -->
      <div ref="documentContainer" class="pdf-document">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <LoadingIndicator
            :progress="loadingProgress"
            :message="loadingMessage"
            :stage="loadingStage"
          />
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <div class="error-content">
            <svg class="error-icon" viewBox="0 0 24 24">
              <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
            </svg>
            <h3>加载失败</h3>
            <p>{{ error.message }}</p>
            <div class="error-actions">
              <button class="btn btn-primary" @click="retryLoad">
                重试
              </button>
              <button class="btn btn-secondary" @click="openFile">
                选择其他文件
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!pdfLoaded" class="empty-container">
          <div class="empty-content">
            <svg class="empty-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h3>选择PDF文件</h3>
            <p>点击"打开文件"按钮选择要查看的PDF文档</p>
            <button class="btn btn-primary" @click="openFile">
              打开文件
            </button>
          </div>
        </div>

        <!-- PDF页面 -->
        <div v-else class="pdf-pages">
          <div
            class="pdf-page"
            :style="{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }"
          >
            <canvas
              ref="pageCanvas"
              class="page-canvas"
              @wheel="onWheel"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseLeave"
            />

            <!-- 搜索高亮 -->
            <div
              v-for="(result, index) in searchResults"
              :key="index"
              class="search-highlight"
              :class="{ active: index === currentSearchIndex }"
              :style="getHighlightStyle(result)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div v-if="pdfLoaded" class="pdf-statusbar">
      <div class="status-left">
        <span class="status-item">文档: {{ pdfInfo?.title || '未知' }}</span>
        <span class="status-item">页数: {{ totalPages }}</span>
        <span class="status-item">缩放: {{ Math.round(zoom * 100) }}%</span>
      </div>
      <div class="status-right">
        <span v-if="searchResults.length > 0" class="status-item">
          搜索结果: {{ searchResults.length }}
        </span>
        <span class="status-item">{{ performanceInfo }}</span>
      </div>
    </div>

    <!-- 文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".pdf"
      style="display: none"
      @change="onFileSelected"
    >
  </div>
</template>

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--pdf-color-background);
  color: var(--pdf-color-text);
  font-family: var(--pdf-font-family);
}

/* 工具栏样式 */
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pdf-spacing-small) var(--pdf-spacing-medium);
  background: var(--pdf-color-surface);
  border-bottom: 1px solid var(--pdf-color-border);
  box-shadow: var(--pdf-shadow-small);
  z-index: 10;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-small);
}

.toolbar-center {
  flex: 1;
  justify-content: center;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  color: var(--pdf-color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--pdf-font-size-small);
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--pdf-color-primary);
  color: white;
  border-color: var(--pdf-color-primary);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.active {
  background: var(--pdf-color-primary);
  color: white;
  border-color: var(--pdf-color-primary);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--pdf-color-border);
  margin: 0 var(--pdf-spacing-small);
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 页面信息 */
.page-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  background: var(--pdf-color-background);
  color: var(--pdf-color-text);
  text-align: center;
  font-size: var(--pdf-font-size-small);
}

.page-total {
  font-size: var(--pdf-font-size-small);
  color: var(--pdf-color-secondary);
}

/* 缩放信息 */
.zoom-info {
  display: flex;
  align-items: center;
}

.zoom-select {
  padding: 4px 8px;
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  background: var(--pdf-color-background);
  color: var(--pdf-color-text);
  font-size: var(--pdf-font-size-small);
  cursor: pointer;
}

/* 搜索容器 */
.search-container {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-small);
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  background: var(--pdf-color-background);
  color: var(--pdf-color-text);
  font-size: var(--pdf-font-size-small);
}

.search-btn {
  padding: 6px;
  background: transparent;
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  color: var(--pdf-color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--pdf-color-primary);
  color: white;
  border-color: var(--pdf-color-primary);
}

.search-results {
  font-size: var(--pdf-font-size-small);
  color: var(--pdf-color-secondary);
  white-space: nowrap;
}

/* 主要内容区域 */
.pdf-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.pdf-sidebar {
  width: 200px;
  background: var(--pdf-color-surface);
  border-right: 1px solid var(--pdf-color-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pdf-spacing-medium);
  border-bottom: 1px solid var(--pdf-color-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: var(--pdf-font-size-medium);
  font-weight: 500;
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--pdf-color-text);
  cursor: pointer;
  border-radius: var(--pdf-border-radius);
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: var(--pdf-color-border);
}

.thumbnails-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--pdf-spacing-small);
}

.thumbnail-item {
  margin-bottom: var(--pdf-spacing-small);
  cursor: pointer;
  border-radius: var(--pdf-border-radius);
  overflow: hidden;
  transition: all 0.2s ease;
}

.thumbnail-item:hover {
  box-shadow: var(--pdf-shadow-medium);
}

.thumbnail-item.active {
  box-shadow: 0 0 0 2px var(--pdf-color-primary);
}

.thumbnail-image {
  width: 100%;
  aspect-ratio: 3/4;
  background: var(--pdf-color-background);
  border: 1px solid var(--pdf-color-border);
  border-radius: var(--pdf-border-radius);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnail-placeholder {
  color: var(--pdf-color-secondary);
}

.thumbnail-label {
  text-align: center;
  padding: 4px;
  font-size: var(--pdf-font-size-small);
  color: var(--pdf-color-secondary);
}

/* 文档显示区域 */
.pdf-document {
  flex: 1;
  overflow: auto;
  position: relative;
  background: var(--pdf-color-background);
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 错误状态 */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--pdf-spacing-large);
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  width: 64px;
  height: 64px;
  fill: #f44336;
  margin-bottom: var(--pdf-spacing-medium);
}

.error-content h3 {
  margin: 0 0 var(--pdf-spacing-small) 0;
  color: var(--pdf-color-text);
}

.error-content p {
  margin: 0 0 var(--pdf-spacing-medium) 0;
  color: var(--pdf-color-secondary);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: var(--pdf-spacing-small);
  justify-content: center;
}

/* 空状态 */
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--pdf-spacing-large);
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  fill: var(--pdf-color-secondary);
  margin-bottom: var(--pdf-spacing-medium);
}

.empty-content h3 {
  margin: 0 0 var(--pdf-spacing-small) 0;
  color: var(--pdf-color-text);
}

.empty-content p {
  margin: 0 0 var(--pdf-spacing-medium) 0;
  color: var(--pdf-color-secondary);
  line-height: 1.5;
}

/* PDF页面 */
.pdf-pages {
  display: flex;
  justify-content: center;
  padding: var(--pdf-spacing-large);
  min-height: 100%;
}

.pdf-page {
  position: relative;
  box-shadow: var(--pdf-shadow-large);
  border-radius: var(--pdf-border-radius);
  overflow: hidden;
}

.page-canvas {
  display: block;
  max-width: 100%;
  height: auto;
  cursor: grab;
}

.page-canvas:active {
  cursor: grabbing;
}

/* 搜索高亮 */
.search-highlight {
  position: absolute;
  background: rgba(255, 255, 0, 0.3);
  border: 1px solid #ffeb3b;
  pointer-events: none;
  transition: all 0.2s ease;
}

.search-highlight.active {
  background: rgba(255, 152, 0, 0.5);
  border-color: #ff9800;
}

/* 状态栏 */
.pdf-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pdf-spacing-small) var(--pdf-spacing-medium);
  background: var(--pdf-color-surface);
  border-top: 1px solid var(--pdf-color-border);
  font-size: var(--pdf-font-size-small);
  color: var(--pdf-color-secondary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: var(--pdf-spacing-medium);
}

.status-item {
  white-space: nowrap;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--pdf-border-radius);
  cursor: pointer;
  font-size: var(--pdf-font-size-small);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-primary {
  background: var(--pdf-color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--pdf-color-accent);
}

.btn-secondary {
  background: var(--pdf-color-border);
  color: var(--pdf-color-text);
}

.btn-secondary:hover {
  background: var(--pdf-color-secondary);
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-toolbar {
    flex-wrap: wrap;
    gap: var(--pdf-spacing-small);
  }

  .toolbar-center {
    order: 3;
    flex-basis: 100%;
    margin-top: var(--pdf-spacing-small);
  }

  .pdf-sidebar {
    width: 150px;
  }

  .search-container {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .pdf-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 20;
    box-shadow: var(--pdf-shadow-large);
  }

  .toolbar-btn {
    padding: 4px 8px;
    font-size: 12px;
  }

  .toolbar-btn .icon {
    width: 14px;
    height: 14px;
  }
}

/* 滚动条样式 */
.pdf-document::-webkit-scrollbar,
.thumbnails-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.pdf-document::-webkit-scrollbar-track,
.thumbnails-container::-webkit-scrollbar-track {
  background: var(--pdf-color-surface);
}

.pdf-document::-webkit-scrollbar-thumb,
.thumbnails-container::-webkit-scrollbar-thumb {
  background: var(--pdf-color-border);
  border-radius: 4px;
}

.pdf-document::-webkit-scrollbar-thumb:hover,
.thumbnails-container::-webkit-scrollbar-thumb:hover {
  background: var(--pdf-color-secondary);
}

/* 深色主题特定样式 */
.pdf-viewer--dark {
  /* 深色主题下的特殊样式调整 */
}

.pdf-viewer--light {
  /* 浅色主题下的特殊样式调整 */
}
</style>
