<template>
  <div class="demo">
    <div class="demo-header">
      <h2>Composable API</h2>
      <p>Using usePDFViewer composable for full control</p>
    </div>

    <div class="demo-content">
      <aside class="sidebar">
        <div class="controls">
          <button @click="loadSample">Load Sample PDF</button>

          <div class="control-group">
            <h4>Navigation</h4>
            <button @click="previousPage" :disabled="currentPage <= 1">
              Previous Page
            </button>
            <button @click="nextPage" :disabled="currentPage >= totalPages">
              Next Page
            </button>
          </div>

          <div class="control-group">
            <h4>Zoom</h4>
            <button @click="setZoom('in')">Zoom In</button>
            <button @click="setZoom('out')">Zoom Out</button>
            <button @click="setZoom('fit-width')">Fit Width</button>
          </div>

          <div class="control-group">
            <h4>Rotate</h4>
            <button @click="rotate(90)">Rotate 90°</button>
          </div>

          <div class="stats">
            <h4>Stats</h4>
            <div>Page: {{ currentPage }} / {{ totalPages }}</div>
            <div>Zoom: {{ Math.round(currentZoom * 100) }}%</div>
            <div v-if="loading" class="loading">Loading...</div>
            <div v-if="error" class="error">{{ error.message }}</div>
          </div>
        </div>
      </aside>

      <div ref="containerRef" class="viewer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePDFViewer } from '@ldesign/pdf-viewer/vue'

const containerRef = ref<HTMLElement>()

const {
  currentPage,
  totalPages,
  currentZoom,
  loading,
  error,
  init,
  loadDocument,
  nextPage,
  previousPage,
  setZoom,
  rotate
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs',
  enableToolbar: true
})

const loadSample = () => {
  const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
  loadDocument(url)
}

onMounted(async () => {
  if (containerRef.value) {
    await init(containerRef.value)
    setTimeout(loadSample, 500)
  }
})
</script>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.demo-header {
  padding: 20px;
  background: #f6f8fa;
  border-bottom: 1px solid #d0d7de;
}

.demo-header h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #24292f;
}

.demo-header p {
  font-size: 14px;
  color: #57606a;
}

.demo-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: #f6f8fa;
  border-right: 1px solid #d0d7de;
  overflow-y: auto;
}

.controls {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #57606a;
  margin-bottom: 4px;
}

button {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #0969da;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats {
  padding: 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 14px;
}

.stats h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #57606a;
  margin-bottom: 8px;
}

.stats div {
  margin: 4px 0;
}

.loading {
  color: #0969da;
  font-weight: 600;
}

.error {
  color: #d73a49;
  font-size: 12px;
  word-wrap: break-word;
}

.viewer {
  flex: 1;
  overflow: hidden;
}
</style>
