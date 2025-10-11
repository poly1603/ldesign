import { PDFViewer } from '@ldesign/pdf-viewer'
import { createIcons, icons } from 'lucide'

// 示例PDF URL (使用Mozilla的示例PDF)
const SAMPLE_PDF = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'

// 创建查看器实例
let viewer
let continuousMode = true

function initViewer() {
  console.log('[INIT] Creating PDFViewer...')
  
  viewer = new PDFViewer({
    container: '#viewer',
    enableToolbar: true,
    enableSearch: true,
    enableThumbnails: true,
    scale: 1.0,
    workerSrc: '/pdf.worker.min.mjs'
  })

  console.log('[INIT] PDFViewer created:', viewer)

  // 设置为连续模式
  if (continuousMode) {
    console.log('[INIT] Setting continuous mode...')
    viewer.setRenderMode(true)
  }

  // 监听事件
  setupEventListeners()

  // 更新状态
  updateStatus('Viewer initialized. Please load a PDF.')
  console.log('[INIT] Initialization complete')
}

function setupEventListeners() {
  // 文档加载完成
  viewer.on('document-loaded', (doc) => {
    updateStatus('PDF loaded successfully')
    updateStats()
    
    // 初始化 lucide 图标
    setTimeout(() => initLucideIcons(), 100)
  })

  // 文档加载错误
  viewer.on('document-error', (error) => {
    updateStatus(`Error: ${error.message}`, true)
  })

  // 页面更改
  viewer.on('page-changed', () => {
    updateStats()
  })

  // 缩放更改
  viewer.on('zoom-changed', () => {
    updateStats()
  })

  // 加载进度
  viewer.on('loading-progress', (progress) => {
    const percent = Math.round((progress.loaded / progress.total) * 100)
    updateStatus(`Loading: ${percent}%`)
  })

  // 搜索结果
  viewer.on('search-results', (results) => {
    displaySearchResults(results)
  })

  // 页面渲染完成
  viewer.on('page-rendered', (info) => {
    console.log('Page rendered:', info.pageNumber)
  })
}

function updateStatus(message, isError = false) {
  const statusEl = document.getElementById('status')
  statusEl.textContent = message
  statusEl.style.color = isError ? '#d73a49' : '#24292f'
}

function updateStats() {
  document.getElementById('currentPage').textContent = viewer.getCurrentPage()
  document.getElementById('totalPages').textContent = viewer.getTotalPages()
  document.getElementById('zoomLevel').textContent =
    Math.round(viewer.getCurrentZoom() * 100) + '%'
}

function displaySearchResults(results) {
  const resultsEl = document.getElementById('searchResults')

  if (results.length === 0) {
    resultsEl.innerHTML = '<p>No results found</p>'
    return
  }

  resultsEl.innerHTML = `
    <h4>Search Results (${results.length})</h4>
    <ul>
      ${results.slice(0, 10).map(result => `
        <li>
          Page ${result.pageNumber}: "${result.text}"
          <button onclick="window.goToSearchResult(${result.pageNumber})">Go</button>
        </li>
      `).join('')}
    </ul>
  `
}

// 全局函数供HTML调用
window.goToSearchResult = (pageNumber) => {
  viewer.goToPage(pageNumber)
}

// UI事件处理
document.getElementById('fileInput')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0]
  if (file) {
    try {
      updateStatus('Loading file...')
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      await viewer.loadDocument(uint8Array)
    } catch (error) {
      updateStatus(`Failed to load file: ${error.message}`, true)
    }
  }
})

document.getElementById('loadSampleBtn')?.addEventListener('click', async () => {
  try {
    console.log('[LOAD] Starting to load sample PDF:', SAMPLE_PDF)
    updateStatus('Loading sample PDF...')
    const doc = await viewer.loadDocument(SAMPLE_PDF)
    console.log('[LOAD] PDF loaded successfully:', doc)
  } catch (error) {
    console.error('[LOAD] Failed to load:', error)
    updateStatus(`Failed to load sample: ${error.message}`, true)
  }
})

document.getElementById('fitWidthBtn')?.addEventListener('click', () => {
  viewer.setZoom('fit-width')
})

document.getElementById('fitPageBtn')?.addEventListener('click', () => {
  viewer.setZoom('fit-page')
})

document.getElementById('rotate90Btn')?.addEventListener('click', () => {
  const currentRotation = viewer.pageRenderer?.getRotation() || 0
  const newRotation = (currentRotation + 90) % 360
  viewer.rotate(newRotation)
})

document.getElementById('searchBtn')?.addEventListener('click', async () => {
  updateStatus('Searching...')
  try {
    await viewer.search('the')
    updateStatus('Search completed')
  } catch (error) {
    updateStatus(`Search failed: ${error.message}`, true)
  }
})

// 初始化 lucide 图标
function initLucideIcons() {
  const container = document.querySelector('.pdf-viewer-container')
  if (!container) return
  
  // 替换所有 data-icon 属性为相应的 lucide 图标
  const iconElements = container.querySelectorAll('[data-icon]')
  iconElements.forEach((el) => {
    const iconName = el.getAttribute('data-icon')
    if (iconName && icons[iconName]) {
      el.innerHTML = ''
      const icon = document.createElement('i')
      icon.setAttribute('data-lucide', iconName)
      el.appendChild(icon)
    }
  })
  
  // 初始化所有 lucide 图标
  createIcons({ icons })
}

// 初始化
initViewer()

// 自动加载示例PDF
setTimeout(() => {
  document.getElementById('loadSampleBtn')?.click()
}, 500)
