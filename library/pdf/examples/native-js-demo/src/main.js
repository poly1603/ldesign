// Use workspace source paths in dev to avoid package exports blocking deep imports
import '../../../src/adapt/vue/PdfViewer.less'
import { PdfViewer } from '../../../src/index.ts'

// Demo configuration
const DEFAULT_PDF = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
const WORKER_SRC = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

const qs = (sel) => document.querySelector(sel)
const qsa = (sel) => Array.from(document.querySelectorAll(sel))

// DOM refs
const containerRef = qs('#viewer-container')
const pdfMainRef = qs('#pdf-main')
const sidebarRef = qs('#sidebar')
const thumbnailsContainerRef = qs('#thumbnails')

const btnPrev = qs('#btn-prev')
const btnNext = qs('#btn-next')
const inputPage = qs('#input-page')
const pageTotalEl = qs('#page-total')
const btnZoomOut = qs('#btn-zoom-out')
const btnZoomIn = qs('#btn-zoom-in')
const selectZoom = qs('#select-zoom')
const btnRotate = qs('#btn-rotate')
const btnSearchToggle = qs('#btn-search-toggle')
const btnSidebarToggle = qs('#btn-sidebar-toggle')
const btnFullscreen = qs('#btn-fullscreen')
const btnDownload = qs('#btn-download')
const btnPrint = qs('#btn-print')

const searchBar = qs('#search-bar')
const inputSearch = qs('#input-search')
const btnFindPrev = qs('#btn-find-prev')
const btnFindNext = qs('#btn-find-next')
const btnSearchClose = qs('#btn-search-close')
const searchResultsEl = qs('#search-results')

// Local UI state
let heightMode = 'auto' // 'auto' | 'custom'
let customHeight = '600px'
let showSidebar = true
let showSearch = false
let currentMatchIndex = -1
let searchResults = []
let lastThumbClick = false
let animateNextPage = false
let scrollTimeout = null
let currentVisiblePages = []
let uiCurrentPage = 1 // 用于UI联动的当前页（custom 模式下滚动时更新）

// Helper: apply height-mode classes to container and main wrapper
function applyHeightModeClasses() {
  if (!containerRef || !pdfMainRef) return
  if (heightMode === 'auto') {
    containerRef.classList.add('single-page', 'auto-height')
    containerRef.classList.remove('custom-height', 'page-animate')
    pdfMainRef.classList.add('auto-height-mode')
  } else {
    containerRef.classList.remove('single-page', 'auto-height', 'page-animate')
    containerRef.classList.add('custom-height')
    pdfMainRef.classList.remove('auto-height-mode')
  }
}

// Create viewer
const viewer = new PdfViewer({
  container: containerRef,
  initialScale: 1,
  initialPage: 1,
  zoomMode: 'fit-width',
  heightMode,
  renderMode: heightMode === 'auto' ? 'single-page' : 'multi-page',
  multiPageOptions: { enableVirtualScroll: true, visibleBuffer: 2, pageSpacing: 20 },
  workerSrc: WORKER_SRC,
})

// Load default PDF
viewer.loadDocument(DEFAULT_PDF).catch(console.error)

// Event bindings
viewer.on('documentLoaded', (info) => {
  pageTotalEl.textContent = `/ ${info.numPages}`
  uiCurrentPage = viewer.getCurrentPage()
  inputPage.value = uiCurrentPage
  // Ensure correct classes on first load (or after re-load)
  applyHeightModeClasses()
  if (showSidebar) setTimeout(generateThumbnails, 100)
  if (heightMode === 'auto') setTimeout(calculateAutoHeight, 100)
})

viewer.on('pageChanged', (pageNumber) => {
  uiCurrentPage = pageNumber
  inputPage.value = pageNumber
  updateThumbnailActiveState()
  if (heightMode === 'auto') {
    if (!lastThumbClick) scrollActiveThumbnailToTop()
    lastThumbClick = false
    setTimeout(calculateAutoHeight, 100)
  } else {
    scrollActiveThumbnailToTop()
  }
})

viewer.on('zoomChanged', () => {
  if (heightMode === 'auto') setTimeout(calculateAutoHeight, 100)
})
viewer.on('rotationChanged', () => {
  if (heightMode === 'auto') setTimeout(calculateAutoHeight, 100)
})
viewer.on('renderComplete', () => {
  if (heightMode === 'auto' && animateNextPage) {
    setTimeout(() => { containerRef.classList.remove('page-animate'); animateNextPage = false }, 260)
  }
})
viewer.on('allPagesRendered', () => {
  // 切换到自定义高度后，初次渲染完成时立即同步一次
  if (heightMode === 'custom') {
    setTimeout(() => syncVisibleAndThumbnails(), 50)
  }
})
viewer.on('visiblePagesChanged', (current, visible) => {
  currentVisiblePages = visible
  if (heightMode === 'custom') {
    // 以事件为准同步 UI 状态与缩略图
    if (current !== uiCurrentPage) {
      uiCurrentPage = current
      inputPage.value = uiCurrentPage
    }
    updateThumbnailActiveState()
    scrollActiveThumbnailToTop()
  }
})

// Toolbar actions
btnPrev.addEventListener('click', () => viewer.previousPage())
btnNext.addEventListener('click', () => viewer.nextPage())

inputPage.addEventListener('change', (e) => {
  const num = parseInt(e.target.value, 10)
  const total = viewer.getTotalPages()
  if (!isNaN(num) && num >= 1 && num <= total) {
    uiCurrentPage = num
    viewer.goToPage(num)
  }
})

btnZoomOut.addEventListener('click', () => viewer.zoomOut())
btnZoomIn.addEventListener('click', () => viewer.zoomIn())
selectZoom.addEventListener('change', (e) => {
  const val = e.target.value
  if (['fit-width', 'fit-page', 'auto'].includes(val)) {
    viewer.setZoomMode(val)
  } else {
    const s = parseFloat(val)
    if (!isNaN(s)) viewer.setZoom(s)
  }
})

btnRotate.addEventListener('click', () => {
  const r = viewer.getRotation()
  const next = ((r + 90) % 360)
  viewer.rotate(next)
})

btnSearchToggle.addEventListener('click', () => {
  showSearch = !showSearch
  searchBar.style.display = showSearch ? 'flex' : 'none'
  if (showSearch) setTimeout(() => inputSearch.focus(), 100)
})

btnSidebarToggle.addEventListener('click', () => {
  showSidebar = !showSidebar
  sidebarRef.style.display = showSidebar ? 'block' : 'none'
})

btnFullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen()
  else viewer.enterFullscreen()
})

btnDownload.addEventListener('click', () => {
  viewer.download().catch(console.error)
})
btnPrint.addEventListener('click', () => {
  viewer.print().catch(console.error)
})

// Search
inputSearch.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    await performSearch(inputSearch.value)
  } else if (e.key === 'Escape') {
    clearSearch()
    showSearch = false
    searchBar.style.display = 'none'
  }
})
btnFindNext.addEventListener('click', () => gotoMatch(1))
btnFindPrev.addEventListener('click', () => gotoMatch(-1))
btnSearchClose.addEventListener('click', () => { clearSearch(); showSearch = false; searchBar.style.display = 'none' })

async function performSearch(query) {
  if (!query || !query.trim()) return clearSearch()
  searchResults = await viewer.search({ query, caseSensitive: false, wholeWords: false, highlightAll: true })
  currentMatchIndex = searchResults.length > 0 ? 0 : -1
  updateSearchUi()
  await jumpToCurrentMatch()
}

function updateSearchUi() {
  searchResultsEl.textContent = searchResults.length ? `${currentMatchIndex + 1} / ${searchResults.length}` : ''
}

function clearSearch() {
  inputSearch.value = ''
  searchResults = []
  currentMatchIndex = -1
  updateSearchUi()
  if (typeof viewer.clearSearchHighlights === 'function') viewer.clearSearchHighlights()
}

function gotoMatch(dir) {
  if (!searchResults.length) return
  currentMatchIndex = (currentMatchIndex + dir + searchResults.length) % searchResults.length
  updateSearchUi()
  void jumpToCurrentMatch()
}

async function jumpToCurrentMatch() {
  const m = searchResults[currentMatchIndex]
  if (!m) return
  if (heightMode === 'custom') {
    const pageTop = viewer.getPageScrollPosition(m.pageNumber)
    const targetTop = Math.max(0, pageTop + m.position.y - 40)
    containerRef.scrollTo({ top: targetTop, behavior: 'smooth' })
  } else {
    animateNextPage = true
    containerRef.classList.add('page-animate')
    await viewer.goToPage(m.pageNumber)
  }
}

// Thumbnails
async function generateThumbnails() {
  try {
    thumbnailsContainerRef.innerHTML = ''
    const doc = await viewer.getDocument()
    if (!doc) return
    const total = viewer.getTotalPages()
    const items = []

    for (let i = 1; i <= total; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 0.2 })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
      items.push({ pageNumber: i, canvas })
    }

    items.sort((a, b) => a.pageNumber - b.pageNumber)
    for (const item of items) {
      const el = document.createElement('div')
      el.className = `pdf-thumbnail ${viewer.getCurrentPage() === item.pageNumber ? 'active' : ''}`
      el.setAttribute('data-page-number', String(item.pageNumber))
      el.title = `第 ${item.pageNumber} 页`
      el.addEventListener('click', () => handleThumbnailClick(item.pageNumber))

      const imgWrap = document.createElement('div')
      imgWrap.className = 'thumbnail-image'
      imgWrap.appendChild(item.canvas)
      el.appendChild(imgWrap)

      const label = document.createElement('div')
      label.className = 'thumbnail-label'
      label.textContent = String(item.pageNumber)
      el.appendChild(label)

      thumbnailsContainerRef.appendChild(el)
    }

    scrollActiveThumbnailToTop()
  } catch (e) {
    console.error('Failed to generate thumbnails:', e)
  }
}

function updateThumbnailActiveState() {
  const current = uiCurrentPage
  qsa('.pdf-thumbnail').forEach((el) => el.classList.remove('active'))
  const active = thumbnailsContainerRef.querySelector(`.pdf-thumbnail[data-page-number="${current}"]`)
  if (active) active.classList.add('active')
}

function scrollActiveThumbnailToTop() {
  const current = uiCurrentPage
  const active = thumbnailsContainerRef.querySelector(`.pdf-thumbnail[data-page-number="${current}"]`)
  if (active) {
    // 确保选中的缩略图滚动到容器顶部，留出少量边距
    const targetScrollTop = Math.max(0, active.offsetTop - 8)
    thumbnailsContainerRef.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
  }
}

function handleThumbnailClick(pageNumber) {
  lastThumbClick = true
  if (heightMode === 'custom') {
    const pos = viewer.getPageScrollPosition(pageNumber)
    containerRef.scrollTo({ top: pos, behavior: 'smooth' })
    uiCurrentPage = pageNumber
    inputPage.value = pageNumber
    updateThumbnailActiveState()
    scrollActiveThumbnailToTop()
  } else {
    animateNextPage = true
    containerRef.classList.add('page-animate')
    uiCurrentPage = pageNumber
    viewer.goToPage(pageNumber)
  }
}

// Auto height calculation
async function calculateAutoHeight() {
  try {
    const doc = await viewer.getDocument()
    if (!doc) return
    const page = await doc.getPage(uiCurrentPage)
    const viewport = page.getViewport({ scale: viewer.getScale(), rotation: viewer.getRotation() })
    // 说明：.pdf-container 本身有上下各 20px 的 padding（共 40px）
    // CSS 中 height 指的是内容区高度，不包含 padding。
    // 因此此处应使用页面的 CSS 高度 viewport.height，避免重复叠加 40px。
    const contentHeight = viewport.height

    containerRef.style.height = `${contentHeight}px`
    containerRef.style.minHeight = 'auto'
    containerRef.style.maxHeight = 'none'
    containerRef.style.overflow = 'visible'
    // 同步左侧缩略图容器高度（去除固定值以避免布局拉伸，交给 flex 自适应）
    thumbnailsContainerRef.style.height = ''
    thumbnailsContainerRef.style.overflowY = 'auto'
    // 确保类名正确（切换模式后可能丢失）
    applyHeightModeClasses()
  } catch (e) {
    console.error('Failed to calculate auto height:', e)
  }
}

// Custom height scroll listener (virtual scroll)
function syncVisibleAndThumbnails() {
  if (heightMode !== 'custom') return
  const scrollTop = containerRef.scrollTop
  const ch = containerRef.clientHeight
  const info = viewer.calculateVisiblePages(scrollTop, ch)
  viewer.updateVisiblePages(scrollTop, ch)
  if (info.currentPage !== uiCurrentPage) {
    uiCurrentPage = info.currentPage
    inputPage.value = uiCurrentPage
    updateThumbnailActiveState()
    // 只有在页面真正改变时才滚动缩略图，避免频繁滚动
    scrollActiveThumbnailToTop()
  }
}

containerRef.addEventListener('scroll', () => {
  if (heightMode !== 'custom') return
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    syncVisibleAndThumbnails()
  }, 100)
})

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target === inputSearch) return
  if (e.key === 'ArrowLeft') btnPrev.click()
  if (e.key === 'ArrowRight') btnNext.click()
  if (e.ctrlKey && (e.key === '+' || e.key === '=')) { e.preventDefault(); btnZoomIn.click() }
  if (e.ctrlKey && e.key === '-') { e.preventDefault(); btnZoomOut.click() }
})

// 选择示例PDF & 上传文件 & 高度模式联动
qsa('.sample-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const url = btn.getAttribute('data-url')
    if (!url) return
    try { await viewer.loadDocument(url); uiCurrentPage = viewer.getCurrentPage(); inputPage.value = uiCurrentPage } catch (e) { console.error(e) }
  })
})

const fileInput = document.getElementById('file-input')
if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    try { await viewer.loadDocument(file); uiCurrentPage = viewer.getCurrentPage(); inputPage.value = uiCurrentPage } catch (e) { console.error(e) }
  })
}

qsa('input[name="height-mode"]').forEach(r => {
  r.addEventListener('change', () => {
    const val = document.querySelector('input[name="height-mode"]:checked').value
    heightMode = val
    document.getElementById('custom-height-wrap').style.display = heightMode === 'custom' ? 'block' : 'none'
    // Toggle classes to match Vue demo behavior
    applyHeightModeClasses()

if (heightMode === 'auto') {
      viewer.setHeightMode('auto')
      // Reset container styles for auto-height
      containerRef.style.overflow = 'visible'
      setTimeout(calculateAutoHeight, 100)
    } else {
      const h = document.getElementById('custom-height').value || customHeight
      customHeight = h
      viewer.setHeightMode('custom', customHeight)
      containerRef.style.height = customHeight
      containerRef.style.overflow = 'auto'
      // 清理左侧固定高度，回归flex
      thumbnailsContainerRef.style.height = ''
      thumbnailsContainerRef.style.overflowY = ''
      // 在多页模式启用后，等一帧计算当前可见页并联动缩略图
      setTimeout(() => syncVisibleAndThumbnails(), 120)
    }
  })
})

document.getElementById('custom-height')?.addEventListener('input', (e) => {
  customHeight = e.target.value || '600px'
  if (heightMode === 'custom') {
    viewer.setHeightMode('custom', customHeight)
    containerRef.style.height = customHeight
    containerRef.style.overflow = 'auto'
    applyHeightModeClasses()
    setTimeout(() => syncVisibleAndThumbnails(), 80)
  }
})

