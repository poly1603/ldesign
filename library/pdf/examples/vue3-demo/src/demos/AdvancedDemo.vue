<template>
  <div class="demo">
    <div class="demo-header">
      <h2>Advanced Features</h2>
      <p>Text search, file upload, and more advanced features</p>
    </div>

    <div class="demo-content">
      <aside class="sidebar">
        <div class="controls">
          <div class="control-group">
            <h4>Load PDF</h4>
            <input
              type="file"
              accept=".pdf"
              @change="handleFileUpload"
              class="file-input"
            />
            <button @click="loadSample">Load Sample</button>
          </div>

          <div class="control-group">
            <h4>Search</h4>
            <input
              v-model="searchText"
              type="text"
              placeholder="Enter search text"
              @keyup.enter="performSearch"
              class="search-input"
            />
            <button @click="performSearch">Search</button>
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <h4>Results ({{ searchResults.length }})</h4>
            <div class="results-list">
              <div
                v-for="(result, index) in searchResults.slice(0, 10)"
                :key="index"
                class="result-item"
              >
                <div>Page {{ result.pageNumber }}</div>
                <button @click="goToPage(result.pageNumber)">Go</button>
              </div>
            </div>
          </div>

          <div class="stats">
            <h4>Info</h4>
            <div>Page: {{ currentPage }} / {{ totalPages }}</div>
            <div>Zoom: {{ Math.round(currentZoom * 100) }}%</div>
            <div v-if="loadingProgress">
              Progress: {{ Math.round((loadingProgress.loaded / loadingProgress.total) * 100) }}%
            </div>
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
const searchText = ref('')

const {
  currentPage,
  totalPages,
  currentZoom,
  loadingProgress,
  searchResults,
  init,
  loadDocument,
  goToPage,
  search
} = usePDFViewer({
  workerSrc: '/pdf.worker.min.mjs',
  enableToolbar: true,
  enableSearch: true
})

const loadSample = () => {
  const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
  loadDocument(url)
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    await loadDocument(uint8Array)
  }
}

const performSearch = async () => {
  if (searchText.value.trim()) {
    await search(searchText.value.trim())
  }
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
  width: 300px;
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

.file-input {
  padding: 8px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.search-input {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 14px;
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

button:hover {
  background: #f3f4f6;
  border-color: #0969da;
}

.search-results {
  padding: 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
}

.search-results h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #57606a;
  margin-bottom: 8px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f6f8fa;
  border-radius: 4px;
  font-size: 13px;
}

.result-item button {
  padding: 4px 8px;
  font-size: 12px;
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

.viewer {
  flex: 1;
  overflow: hidden;
}
</style>
