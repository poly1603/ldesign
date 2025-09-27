<template>
  <div
    ref="containerRef"
    :class="[
      'ldesign-vue-document-viewer',
      props.class
    ]"
    :style="containerStyle"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">正在加载文档...</div>
    </div>
    
    <div v-if="error" class="error-overlay">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ error.message }}</div>
      <button @click="retry" class="retry-button">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useDocumentViewer } from './composables'
import type { DocumentViewerProps, DocumentViewerEmits } from './types'

// Props
const props = withDefaults(defineProps<DocumentViewerProps>(), {
  editable: false,
  height: '600px',
  width: '100%'
})

// Emits
const emit = defineEmits<DocumentViewerEmits>()

// Refs
const containerRef = ref<HTMLElement>()

// 计算样式
const containerStyle = computed(() => {
  const style: Record<string, any> = {
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (typeof props.style === 'string') {
    return `${props.style}; ${Object.entries(style).map(([k, v]) => `${k}: ${v}`).join('; ')}`
  } else if (props.style) {
    return { ...style, ...props.style }
  }

  return style
})

// 使用 composable
const {
  viewer,
  documentInfo,
  loading,
  error,
  loadDocument,
  getContent,
  save,
  setEditable,
  getDocumentInfo,
  destroy
} = useDocumentViewer(containerRef, {
  editable: props.editable,
  toolbar: props.toolbar,
  theme: props.theme,
  callbacks: {
    onLoad: (info) => {
      emit('load', info)
    },
    onError: (err) => {
      emit('error', err)
    },
    onChange: (content) => {
      emit('change', content)
    },
    onSave: (content) => {
      emit('save', content)
    }
  }
})

// 监听文件变化
watch(() => props.file, async (newFile) => {
  if (newFile) {
    await loadDocument(newFile)
  }
}, { immediate: true })

// 监听编辑模式变化
watch(() => props.editable, (newEditable) => {
  setEditable(newEditable)
})

// 重试加载
const retry = async () => {
  if (props.file) {
    await loadDocument(props.file)
  }
}

// 组件挂载后发出 ready 事件
onMounted(async () => {
  await nextTick()
  emit('ready')
})

// 暴露方法给父组件
defineExpose({
  loadDocument,
  getContent,
  save,
  setEditable,
  getDocumentInfo,
  destroy,
  viewer,
  documentInfo,
  loading,
  error
})
</script>

<style scoped>
.ldesign-vue-document-viewer {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

.error-overlay {
  color: #e74c3c;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
  max-width: 300px;
}

.retry-button {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background: #2980b9;
}

/* 全局样式 */
:global(.ldesign-docview-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:global(.ldesign-docview-toolbar) {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:global(.ldesign-docview-content) {
  flex: 1;
  overflow: auto;
  background: #fff;
}

:global(.ldesign-docview-btn) {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #495057;
}

:global(.ldesign-docview-btn:hover) {
  background: #e9ecef;
}

:global(.ldesign-word-viewer .word-viewer-content) {
  padding: 20px;
  background: white;
  min-height: 100%;
}

:global(.ldesign-excel-viewer) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:global(.ldesign-excel-viewer .excel-viewer-toolbar) {
  background: #f8f9fa;
  padding: 8px 16px;
  border-bottom: 1px solid #dee2e6;
}

:global(.ldesign-excel-viewer .excel-viewer-content) {
  flex: 1;
  overflow: hidden;
}

:global(.ldesign-powerpoint-viewer) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:global(.ldesign-powerpoint-viewer .ppt-viewer-toolbar) {
  background: #f8f9fa;
  padding: 8px 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 12px;
}

:global(.ldesign-powerpoint-viewer .ppt-viewer-content) {
  flex: 1;
  display: flex;
  overflow: hidden;
}

:global(.ldesign-powerpoint-viewer .slide-container) {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: white;
}

:global(.ldesign-powerpoint-viewer .ppt-viewer-thumbnails) {
  width: 200px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  overflow-y: auto;
}

:global(.ldesign-powerpoint-viewer .slide-thumbnail) {
  padding: 8px;
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
  font-size: 12px;
}

:global(.ldesign-powerpoint-viewer .slide-thumbnail:hover) {
  background: #e9ecef;
}

:global(.ldesign-powerpoint-viewer .slide-thumbnail.active) {
  background: #007bff;
  color: white;
}
</style>
