<template>
  <div ref="containerRef" class="vue-pdf-viewer">
    <div v-if="loading" class="pdf-loading">
      <div class="pdf-loading-spinner"></div>
      <div v-if="loadingProgress" class="pdf-loading-text">
        Loading: {{ Math.round((loadingProgress.loaded / loadingProgress.total) * 100) }}%
      </div>
    </div>
    <div v-if="error" class="pdf-error">
      <div class="pdf-error-icon">⚠️</div>
      <div class="pdf-error-message">{{ error.message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePDFViewer } from './usePDFViewer'
import type { PDFViewerConfig } from '../../types'

/**
 * Vue PDF查看��组件Props
 */
export interface PDFViewerProps extends Omit<PDFViewerConfig, 'container'> {}

const props = withDefaults(defineProps<PDFViewerProps>(), {
  scale: 1.0,
  page: 1,
  enableTextSelection: true,
  enableToolbar: true,
  enableThumbnails: false,
  enableSearch: true,
  renderMode: 'canvas',
  maxCachePages: 20,
  enableVirtualScroll: false,
  cMapPacked: true
})

/**
 * 组件Emits
 */
const emit = defineEmits<{
  'document-loaded': [pages: number]
  'page-changed': [page: number]
  'zoom-changed': [zoom: number]
  'error': [error: Error]
}>()

const containerRef = ref<HTMLElement>()

const {
  viewer,
  currentPage,
  totalPages,
  currentZoom,
  loading,
  loadingProgress,
  error,
  searchResults,
  init,
  loadDocument,
  goToPage,
  nextPage,
  previousPage,
  setZoom,
  rotate,
  search,
  download,
  print
} = usePDFViewer({
  ...props
})

// 初始化
onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
  }
})

// 监听URL变化
watch(() => props.url, (newUrl) => {
  if (newUrl && viewer.value) {
    loadDocument(newUrl)
  }
}, { immediate: true })

// 监听页码变化
watch(currentPage, (page) => {
  emit('page-changed', page)
})

// 监听缩放变化
watch(currentZoom, (zoom) => {
  emit('zoom-changed', zoom)
})

// 监听总页数变化
watch(totalPages, (pages) => {
  if (pages > 0) {
    emit('document-loaded', pages)
  }
})

// 监听错误
watch(error, (err) => {
  if (err) {
    emit('error', err)
  }
})

// 暴露方法给父组件
defineExpose({
  viewer,
  currentPage,
  totalPages,
  currentZoom,
  loading,
  error,
  searchResults,
  loadDocument,
  goToPage,
  nextPage,
  previousPage,
  setZoom,
  rotate,
  search,
  download,
  print
})
</script>

<style scoped>
.vue-pdf-viewer {
  position: relative;
  width: 100%;
  height: 100%;
}

.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
}

.pdf-loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 16px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0969da;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-loading-text {
  font-size: 14px;
}

.pdf-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #d73a49;
}

.pdf-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pdf-error-message {
  font-size: 14px;
}
</style>
