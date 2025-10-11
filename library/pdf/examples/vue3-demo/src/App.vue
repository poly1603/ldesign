<template>
  <div class="app">
    <header class="header">
      <h1>PDF Viewer - Vue3 Demo</h1>
      <div class="controls">
        <input type="file" @change="handleFileChange" accept=".pdf" />
        <button @click="loadSample">Load Sample PDF</button>
      </div>
    </header>

    <main class="main">
      <aside class="sidebar">
        <h3>Features</h3>
        <div class="feature-list">
          <button @click="fitWidth">Fit Width</button>
          <button @click="fitPage">Fit Page</button>
          <button @click="rotate90">Rotate 90°</button>
        </div>

        <div class="info">
          <h4>Status</h4>
          <div>{{ status }}</div>

          <h4>Stats</h4>
          <div>
            <p>Current Page: {{ currentPage }}</p>
            <p>Total Pages: {{ totalPages }}</p>
            <p>Zoom: {{ Math.round(zoom * 100) }}%</p>
          </div>
        </div>
      </aside>

      <div ref="viewerContainer" class="viewer-container"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { PDFViewer } from '@ldesign/pdf-viewer'
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  ArrowLeftRight, RotateCw, FileDown, Printer,
  List, ArrowUpDown
} from 'lucide-vue-next'
import { createIcons, icons } from 'lucide'

const viewerContainer = ref<HTMLElement | null>(null)
const status = ref('Ready')
const currentPage = ref(0)
const totalPages = ref(0)
const zoom = ref(1.0)
const continuousMode = ref(true)

let viewer: PDFViewer | null = null

const loadSample = async () => {
  if (!viewer) return
  try {
    status.value = 'Loading...'
    const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
    await viewer.loadDocument(url)
    status.value = 'Loaded'
    totalPages.value = viewer.getTotalPages()
    currentPage.value = viewer.getCurrentPage()
  } catch (err) {
    status.value = `Error: ${err}`
  }
}

const handleFileChange = async (event: Event) => {
  if (!viewer) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      status.value = 'Loading...'
      const arrayBuffer = await file.arrayBuffer()
      await viewer.loadDocument(new Uint8Array(arrayBuffer))
      status.value = 'Loaded'
      totalPages.value = viewer.getTotalPages()
      currentPage.value = viewer.getCurrentPage()
    } catch (err) {
      status.value = `Error: ${err}`
    }
  }
}

const fitWidth = () => {
  if (viewer) {
    viewer.setZoom('fit-width')
    zoom.value = viewer.getZoom()
  }
}

const fitPage = () => {
  if (viewer) {
    viewer.setZoom('fit-page')
    zoom.value = viewer.getZoom()
  }
}

const rotate90 = () => {
  if (viewer) {
    viewer.rotate(90)
  }
}

const toggleMode = () => {
  continuousMode.value = !continuousMode.value
  if (viewer) {
    viewer.setRenderMode(continuousMode.value)
  }
}

onMounted(async () => {
  if (viewerContainer.value) {
    viewer = new PDFViewer({
      container: viewerContainer.value,
      workerSrc: '/pdf.worker.min.mjs',
      enableToolbar: true,
      enableThumbnails: true
    })
    
    // 设置为连续模式
    if (continuousMode.value) {
      viewer.setRenderMode(true)
    }
    
    viewer.on('document-loaded', (data: any) => {
      totalPages.value = data.totalPages
      currentPage.value = 1
      
      // 初始化 lucide 图标
      nextTick(() => {
        initLucideIcons()
      })
    })
    
    viewer.on('page-changed', (data: any) => {
      currentPage.value = data.pageNumber
    })
    
    // Auto-load sample
    setTimeout(loadSample, 500)
  }
})

// 初始化 lucide 图标
function initLucideIcons() {
  const container = viewerContainer.value?.parentElement
  if (!container) return
  
  // 替换所有 data-icon 属性为相应的 lucide 图标
  const iconElements = container.querySelectorAll('[data-icon]')
  iconElements.forEach((el) => {
    const iconName = el.getAttribute('data-icon')
    if (iconName && icons[iconName as keyof typeof icons]) {
      el.innerHTML = ''
      const icon = document.createElement('i')
      icon.setAttribute('data-lucide', iconName)
      el.appendChild(icon)
    }
  })
  
  // 初始化所有 lucide 图标
  createIcons({ icons })
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  padding: 16px 24px;
  background: #24292f;
  color: white;
  border-bottom: 1px solid #e1e4e8;
}

.header h1 {
  font-size: 24px;
  margin: 0 0 12px 0;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.controls input[type="file"] {
  padding: 6px;
  border: 1px solid #444c56;
  border-radius: 6px;
  background: #373e47;
  color: white;
}

.controls button {
  padding: 8px 16px;
  background: #0969da;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.controls button:hover {
  background: #0856ba;
}

.main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  background: #f6f8fa;
  border-right: 1px solid #d0d7de;
  padding: 20px;
  overflow-y: auto;
}

.sidebar h3 {
  font-size: 16px;
  margin: 0 0 12px 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.feature-list button {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.feature-list button:hover {
  background: #f3f4f6;
  border-color: #0969da;
}

.info {
  padding: 12px;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 6px;
}

.info h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #57606a;
  margin: 0 0 8px 0;
}

.info p {
  margin: 4px 0;
  font-size: 14px;
}

.viewer-container {
  flex: 1;
  overflow: hidden;
  background: #e5e7eb;
}
</style>
