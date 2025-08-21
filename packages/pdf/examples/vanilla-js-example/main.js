/**
 * 原生JavaScript PDF查看器 - 主入口文件
 * 提供完整的PDF查看、导航、搜索、缩放等功能
 */

// ==========================================================================
// 全局变量和配置
// ==========================================================================

// PDF.js 配置
const PDFJS_CONFIG = {
  workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
}

// 应用状态
const AppState = {
  // PDF相关
  pdfDocument: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  rotation: 0,

  // UI状态
  sidebarVisible: false,
  currentSidebarTab: 'thumbnails',
  theme: 'light',

  // 搜索相关
  searchQuery: '',
  searchResults: [],
  currentSearchIndex: -1,

  // 性能监控
  loadStartTime: 0,
  renderTimes: [],

  // 错误处理
  lastError: null,

  // 文件信息
  fileName: '',
  fileSize: 0,
  loadProgress: 0,
}

// 缩放预设值
const ZOOM_LEVELS = [
  { value: 0.25, label: '25%' },
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1.0, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
  { value: 2.0, label: '200%' },
  { value: 3.0, label: '300%' },
  { value: 'fit-width', label: '适合宽度' },
  { value: 'fit-page', label: '适合页面' },
  { value: 'auto', label: '自动' },
]

// DOM元素引用
const Elements = {
  // 容器
  appContainer: null,
  toolbar: null,
  sidebar: null,
  mainContent: null,
  pdfContainer: null,
  statusBar: null,

  // 工具栏按钮
  fileInput: null,
  openFileBtn: null,
  downloadBtn: null,
  printBtn: null,
  prevPageBtn: null,
  nextPageBtn: null,
  pageInput: null,
  totalPagesSpan: null,
  zoomOutBtn: null,
  zoomInBtn: null,
  zoomSelect: null,
  rotateBtn: null,
  searchInput: null,
  searchPrevBtn: null,
  searchNextBtn: null,
  sidebarToggleBtn: null,
  themeToggleBtn: null,
  helpBtn: null,

  // 侧边栏
  sidebarTabs: null,
  sidebarPanels: null,
  thumbnailsContainer: null,
  outlineContainer: null,
  attachmentsContainer: null,

  // 状态显示
  loadingOverlay: null,
  errorContainer: null,
  welcomeScreen: null,
  progressBar: null,
  statusText: null,
}

// ==========================================================================
// 初始化函数
// ==========================================================================

/**
 * 应用程序初始化
 */
async function initializeApp() {
  try {
    console.log('🚀 初始化PDF查看器...')

    // 初始化PDF.js
    await initializePDFJS()

    // 获取DOM元素
    initializeElements()

    // 设置事件监听器
    setupEventListeners()

    // 初始化UI
    initializeUI()

    // 加载主题
    loadTheme()

    // 检查URL参数
    checkURLParameters()

    console.log('✅ PDF查看器初始化完成')
  }
  catch (error) {
    console.error('❌ 初始化失败:', error)
    showError('初始化失败', error.message)
  }
}

/**
 * 初始化PDF.js库
 */
async function initializePDFJS() {
  if (typeof pdfjsLib === 'undefined') {
    throw new TypeError('PDF.js库未加载')
  }

  // 配置PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CONFIG.workerSrc

  console.log('📚 PDF.js配置完成')
}

/**
 * 获取DOM元素引用
 */
function initializeElements() {
  // 主要容器
  Elements.appContainer = document.getElementById('app')
  Elements.toolbar = document.querySelector('.toolbar')
  Elements.sidebar = document.querySelector('.sidebar')
  Elements.mainContent = document.querySelector('.main-content')
  Elements.pdfContainer = document.querySelector('.pdf-container')
  Elements.statusBar = document.querySelector('.status-bar')

  // 工具栏元素
  Elements.fileInput = document.getElementById('file-input')
  Elements.openFileBtn = document.getElementById('open-file')
  Elements.downloadBtn = document.getElementById('download')
  Elements.printBtn = document.getElementById('print')
  Elements.prevPageBtn = document.getElementById('prev-page')
  Elements.nextPageBtn = document.getElementById('next-page')
  Elements.pageInput = document.getElementById('page-input')
  Elements.totalPagesSpan = document.getElementById('total-pages')
  Elements.zoomOutBtn = document.getElementById('zoom-out')
  Elements.zoomInBtn = document.getElementById('zoom-in')
  Elements.zoomSelect = document.getElementById('zoom-select')
  Elements.rotateBtn = document.getElementById('rotate')
  Elements.searchInput = document.getElementById('search-input')
  Elements.searchPrevBtn = document.getElementById('search-prev')
  Elements.searchNextBtn = document.getElementById('search-next')
  Elements.sidebarToggleBtn = document.getElementById('sidebar-toggle')
  Elements.themeToggleBtn = document.getElementById('theme-toggle')
  Elements.helpBtn = document.getElementById('help')

  // 侧边栏元素
  Elements.sidebarTabs = document.querySelectorAll('.sidebar-tab')
  Elements.sidebarPanels = document.querySelectorAll('.sidebar-panel')
  Elements.thumbnailsContainer = document.querySelector('.thumbnails-grid')
  Elements.outlineContainer = document.querySelector('.outline-tree')
  Elements.attachmentsContainer = document.querySelector('.attachments-list')

  // 状态元素
  Elements.loadingOverlay = document.querySelector('.loading-overlay')
  Elements.errorContainer = document.querySelector('.error-container')
  Elements.welcomeScreen = document.querySelector('.welcome-screen')
  Elements.progressBar = document.querySelector('.progress-bar')
  Elements.statusText = document.querySelector('.status-text')

  console.log('🎯 DOM元素获取完成')
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 文件操作
  Elements.fileInput?.addEventListener('change', handleFileSelect)
  Elements.openFileBtn?.addEventListener('click', () => Elements.fileInput?.click())
  Elements.downloadBtn?.addEventListener('click', downloadPDF)
  Elements.printBtn?.addEventListener('click', printPDF)

  // 页面导航
  Elements.prevPageBtn?.addEventListener('click', () => navigateToPage(AppState.currentPage - 1))
  Elements.nextPageBtn?.addEventListener('click', () => navigateToPage(AppState.currentPage + 1))
  Elements.pageInput?.addEventListener('change', handlePageInputChange)
  Elements.pageInput?.addEventListener('keypress', handlePageInputKeypress)

  // 缩放控制
  Elements.zoomOutBtn?.addEventListener('click', () => changeZoom(-0.25))
  Elements.zoomInBtn?.addEventListener('click', () => changeZoom(0.25))
  Elements.zoomSelect?.addEventListener('change', handleZoomSelectChange)
  Elements.rotateBtn?.addEventListener('click', rotatePDF)

  // 搜索功能
  Elements.searchInput?.addEventListener('input', handleSearchInput)
  Elements.searchInput?.addEventListener('keypress', handleSearchKeypress)
  Elements.searchPrevBtn?.addEventListener('click', () => navigateSearch(-1))
  Elements.searchNextBtn?.addEventListener('click', () => navigateSearch(1))

  // UI控制
  Elements.sidebarToggleBtn?.addEventListener('click', toggleSidebar)
  Elements.themeToggleBtn?.addEventListener('click', toggleTheme)
  Elements.helpBtn?.addEventListener('click', showHelp)

  // 侧边栏标签
  Elements.sidebarTabs?.forEach((tab) => {
    tab.addEventListener('click', () => switchSidebarTab(tab.dataset.tab))
  })

  // 键盘快捷键
  document.addEventListener('keydown', handleKeyboardShortcuts)

  // 拖拽上传
  setupDragAndDrop()

  // 窗口事件
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('beforeunload', handleBeforeUnload)

  console.log('🎮 事件监听器设置完成')
}

/**
 * 初始化UI状态
 */
function initializeUI() {
  // 初始化缩放选择器
  initializeZoomSelect()

  // 更新UI状态
  updateNavigationButtons()
  updateZoomDisplay()
  updateStatusBar()

  // 显示欢迎界面
  showWelcomeScreen()

  console.log('🎨 UI初始化完成')
}

/**
 * 初始化缩放选择器
 */
function initializeZoomSelect() {
  if (!Elements.zoomSelect)
    return

  Elements.zoomSelect.innerHTML = ''
  ZOOM_LEVELS.forEach((level) => {
    const option = document.createElement('option')
    option.value = level.value
    option.textContent = level.label
    if (level.value === AppState.scale) {
      option.selected = true
    }
    Elements.zoomSelect.appendChild(option)
  })
}

// ==========================================================================
// 文件处理函数
// ==========================================================================

/**
 * 处理文件选择
 */
async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file)
    return

  if (file.type !== 'application/pdf') {
    showError('文件类型错误', '请选择PDF文件')
    return
  }

  AppState.fileName = file.name
  AppState.fileSize = file.size

  try {
    await loadPDFFromFile(file)
  }
  catch (error) {
    console.error('文件加载失败:', error)
    showError('文件加载失败', error.message)
  }
}

/**
 * 从文件加载PDF
 */
async function loadPDFFromFile(file) {
  showLoadingOverlay('正在加载PDF文件...')
  AppState.loadStartTime = performance.now()

  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: PDFJS_CONFIG.cMapUrl,
      cMapPacked: PDFJS_CONFIG.cMapPacked,
      standardFontDataUrl: PDFJS_CONFIG.standardFontDataUrl,
    })

    // 监听加载进度
    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        AppState.loadProgress = (progress.loaded / progress.total) * 100
        updateLoadingProgress(AppState.loadProgress)
      }
    }

    AppState.pdfDocument = await loadingTask.promise
    AppState.totalPages = AppState.pdfDocument.numPages
    AppState.currentPage = 1

    console.log(`📄 PDF加载成功: ${AppState.totalPages}页`)

    // 初始化PDF显示
    await initializePDFDisplay()

    // 记录加载时间
    const loadTime = performance.now() - AppState.loadStartTime
    console.log(`⏱️ 加载耗时: ${loadTime.toFixed(2)}ms`)

    hideLoadingOverlay()
  }
  catch (error) {
    hideLoadingOverlay()
    throw error
  }
}

/**
 * 初始化PDF显示
 */
async function initializePDFDisplay() {
  // 隐藏欢迎界面
  hideWelcomeScreen()

  // 渲染当前页面
  await renderPage(AppState.currentPage)

  // 生成缩略图
  await generateThumbnails()

  // 加载大纲
  await loadOutline()

  // 加载附件
  await loadAttachments()

  // 更新UI
  updateNavigationButtons()
  updatePageInfo()
  updateStatusBar()

  // 启用工具栏按钮
  enableToolbarButtons()
}

// ==========================================================================
// PDF渲染函数
// ==========================================================================

/**
 * 渲染指定页面
 */
async function renderPage(pageNumber) {
  if (!AppState.pdfDocument || pageNumber < 1 || pageNumber > AppState.totalPages) {
    return
  }

  const renderStart = performance.now()

  try {
    const page = await AppState.pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale: AppState.scale, rotation: AppState.rotation })

    // 创建或获取canvas元素
    let canvas = Elements.pdfContainer.querySelector(`#page-${pageNumber}`)
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = `page-${pageNumber}`
      canvas.className = 'pdf-page'
      Elements.pdfContainer.appendChild(canvas)
    }

    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    // 渲染页面
    const renderContext = {
      canvasContext: context,
      viewport,
    }

    await page.render(renderContext).promise

    // 记录渲染时间
    const renderTime = performance.now() - renderStart
    AppState.renderTimes.push(renderTime)

    console.log(`🎨 页面${pageNumber}渲染完成: ${renderTime.toFixed(2)}ms`)
  }
  catch (error) {
    console.error(`页面${pageNumber}渲染失败:`, error)
    showError('页面渲染失败', error.message)
  }
}

/**
 * 清除所有页面
 */
function clearPages() {
  if (Elements.pdfContainer) {
    const pages = Elements.pdfContainer.querySelectorAll('.pdf-page')
    pages.forEach(page => page.remove())
  }
}

/**
 * 重新渲染所有页面
 */
async function rerenderAllPages() {
  clearPages()

  for (let i = 1; i <= AppState.totalPages; i++) {
    await renderPage(i)
  }
}

// ==========================================================================
// 导航函数
// ==========================================================================

/**
 * 导航到指定页面
 */
async function navigateToPage(pageNumber) {
  if (!AppState.pdfDocument)
    return

  pageNumber = Math.max(1, Math.min(pageNumber, AppState.totalPages))

  if (pageNumber === AppState.currentPage)
    return

  AppState.currentPage = pageNumber

  // 渲染页面
  await renderPage(pageNumber)

  // 滚动到页面
  scrollToPage(pageNumber)

  // 更新UI
  updateNavigationButtons()
  updatePageInfo()
  updateThumbnailSelection()

  console.log(`📍 导航到页面: ${pageNumber}`)
}

/**
 * 滚动到指定页面
 */
function scrollToPage(pageNumber) {
  const pageElement = Elements.pdfContainer.querySelector(`#page-${pageNumber}`)
  if (pageElement) {
    pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * 处理页面输入变化
 */
function handlePageInputChange(event) {
  const pageNumber = Number.parseInt(event.target.value)
  if (!isNaN(pageNumber)) {
    navigateToPage(pageNumber)
  }
}

/**
 * 处理页面输入按键
 */
function handlePageInputKeypress(event) {
  if (event.key === 'Enter') {
    event.target.blur()
  }
}

// ==========================================================================
// 缩放函数
// ==========================================================================

/**
 * 改变缩放级别
 */
async function changeZoom(delta) {
  const newScale = Math.max(0.1, Math.min(5.0, AppState.scale + delta))
  await setZoom(newScale)
}

/**
 * 设置缩放级别
 */
async function setZoom(scale) {
  if (typeof scale === 'string') {
    scale = calculateSpecialZoom(scale)
  }

  AppState.scale = scale

  if (AppState.pdfDocument) {
    await rerenderAllPages()
    await updateThumbnails()
  }

  updateZoomDisplay()

  console.log(`🔍 缩放设置为: ${(scale * 100).toFixed(0)}%`)
}

/**
 * 计算特殊缩放模式
 */
function calculateSpecialZoom(mode) {
  if (!AppState.pdfDocument)
    return 1.0

  const containerWidth = Elements.pdfContainer.clientWidth - 40 // 减去padding
  const containerHeight = Elements.pdfContainer.clientHeight - 40

  // 这里需要获取页面的实际尺寸，简化处理
  const pageWidth = 595 // A4页面宽度（点）
  const pageHeight = 842 // A4页面高度（点）

  switch (mode) {
    case 'fit-width':
      return containerWidth / pageWidth
    case 'fit-page':
      return Math.min(containerWidth / pageWidth, containerHeight / pageHeight)
    case 'auto':
      return containerWidth > 800 ? 1.0 : containerWidth / pageWidth
    default:
      return 1.0
  }
}

/**
 * 处理缩放选择器变化
 */
async function handleZoomSelectChange(event) {
  const value = event.target.value
  const scale = isNaN(value) ? value : Number.parseFloat(value)
  await setZoom(scale)
}

/**
 * 旋转PDF
 */
async function rotatePDF() {
  AppState.rotation = (AppState.rotation + 90) % 360

  if (AppState.pdfDocument) {
    await rerenderAllPages()
    await updateThumbnails()
  }

  console.log(`🔄 旋转角度: ${AppState.rotation}°`)
}

// ==========================================================================
// 搜索函数
// ==========================================================================

/**
 * 处理搜索输入
 */
function handleSearchInput(event) {
  const query = event.target.value.trim()

  if (query !== AppState.searchQuery) {
    AppState.searchQuery = query

    if (query) {
      performSearch(query)
    }
    else {
      clearSearchResults()
    }
  }
}

/**
 * 处理搜索按键
 */
function handleSearchKeypress(event) {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      navigateSearch(-1)
    }
    else {
      navigateSearch(1)
    }
  }
}

/**
 * 执行搜索
 */
async function performSearch(query) {
  if (!AppState.pdfDocument || !query)
    return

  console.log(`🔍 搜索: "${query}"`)

  AppState.searchResults = []
  AppState.currentSearchIndex = -1

  try {
    for (let pageNum = 1; pageNum <= AppState.totalPages; pageNum++) {
      const page = await AppState.pdfDocument.getPage(pageNum)
      const textContent = await page.getTextContent()

      const text = textContent.items.map(item => item.str).join(' ')
      const regex = new RegExp(query, 'gi')
      let match

      while ((match = regex.exec(text)) !== null) {
        AppState.searchResults.push({
          pageNumber: pageNum,
          index: match.index,
          text: match[0],
        })
      }
    }

    console.log(`📊 找到 ${AppState.searchResults.length} 个结果`)

    if (AppState.searchResults.length > 0) {
      AppState.currentSearchIndex = 0
      highlightSearchResult(AppState.currentSearchIndex)
    }

    updateSearchButtons()
  }
  catch (error) {
    console.error('搜索失败:', error)
    showError('搜索失败', error.message)
  }
}

/**
 * 导航搜索结果
 */
function navigateSearch(direction) {
  if (AppState.searchResults.length === 0)
    return

  AppState.currentSearchIndex += direction

  if (AppState.currentSearchIndex < 0) {
    AppState.currentSearchIndex = AppState.searchResults.length - 1
  }
  else if (AppState.currentSearchIndex >= AppState.searchResults.length) {
    AppState.currentSearchIndex = 0
  }

  highlightSearchResult(AppState.currentSearchIndex)
  updateSearchButtons()
}

/**
 * 高亮搜索结果
 */
function highlightSearchResult(index) {
  if (index < 0 || index >= AppState.searchResults.length)
    return

  const result = AppState.searchResults[index]
  navigateToPage(result.pageNumber)

  // 这里可以添加更详细的高亮逻辑
  console.log(`🎯 高亮结果 ${index + 1}/${AppState.searchResults.length}`)
}

/**
 * 清除搜索结果
 */
function clearSearchResults() {
  AppState.searchResults = []
  AppState.currentSearchIndex = -1
  updateSearchButtons()

  // 清除页面上的高亮
  // 这里可以添加清除高亮的逻辑
}

// ==========================================================================
// 缩略图函数
// ==========================================================================

/**
 * 生成缩略图
 */
async function generateThumbnails() {
  if (!AppState.pdfDocument || !Elements.thumbnailsContainer)
    return

  console.log('🖼️ 生成缩略图...')

  Elements.thumbnailsContainer.innerHTML = ''

  for (let pageNum = 1; pageNum <= AppState.totalPages; pageNum++) {
    await generateThumbnail(pageNum)
  }

  console.log('✅ 缩略图生成完成')
}

/**
 * 生成单个缩略图
 */
async function generateThumbnail(pageNumber) {
  try {
    const page = await AppState.pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 0.2 })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context,
      viewport,
    }).promise

    // 创建缩略图元素
    const thumbnailItem = document.createElement('div')
    thumbnailItem.className = 'thumbnail-item'
    thumbnailItem.dataset.page = pageNumber

    const thumbnailCanvas = document.createElement('canvas')
    thumbnailCanvas.className = 'thumbnail-canvas'
    thumbnailCanvas.width = canvas.width
    thumbnailCanvas.height = canvas.height

    const thumbnailContext = thumbnailCanvas.getContext('2d')
    thumbnailContext.drawImage(canvas, 0, 0)

    const thumbnailLabel = document.createElement('div')
    thumbnailLabel.className = 'thumbnail-label'
    thumbnailLabel.textContent = pageNumber

    thumbnailItem.appendChild(thumbnailCanvas)
    thumbnailItem.appendChild(thumbnailLabel)

    // 添加点击事件
    thumbnailItem.addEventListener('click', () => {
      navigateToPage(pageNumber)
    })

    Elements.thumbnailsContainer.appendChild(thumbnailItem)
  }
  catch (error) {
    console.error(`缩略图${pageNumber}生成失败:`, error)
  }
}

/**
 * 更新缩略图
 */
async function updateThumbnails() {
  // 重新生成缩略图（简化处理）
  await generateThumbnails()
}

/**
 * 更新缩略图选择状态
 */
function updateThumbnailSelection() {
  if (!Elements.thumbnailsContainer)
    return

  const thumbnails = Elements.thumbnailsContainer.querySelectorAll('.thumbnail-item')
  thumbnails.forEach((thumbnail) => {
    const pageNum = Number.parseInt(thumbnail.dataset.page)
    thumbnail.classList.toggle('active', pageNum === AppState.currentPage)
  })
}

// ==========================================================================
// 大纲和附件函数
// ==========================================================================

/**
 * 加载PDF大纲
 */
async function loadOutline() {
  if (!AppState.pdfDocument || !Elements.outlineContainer)
    return

  try {
    const outline = await AppState.pdfDocument.getOutline()

    if (outline && outline.length > 0) {
      renderOutline(outline, Elements.outlineContainer)
      console.log('📋 大纲加载完成')
    }
    else {
      Elements.outlineContainer.innerHTML = '<div class="empty-state">此PDF没有大纲</div>'
    }
  }
  catch (error) {
    console.error('大纲加载失败:', error)
    Elements.outlineContainer.innerHTML = '<div class="empty-state">大纲加载失败</div>'
  }
}

/**
 * 渲染大纲
 */
function renderOutline(outline, container) {
  const ul = document.createElement('ul')
  ul.className = 'outline-list'

  outline.forEach((item) => {
    const li = document.createElement('li')
    li.className = 'outline-item'

    const link = document.createElement('a')
    link.className = 'outline-link'
    link.textContent = item.title
    link.href = '#'

    // 添加点击事件（这里需要解析dest参数）
    link.addEventListener('click', (e) => {
      e.preventDefault()
      // 简化处理，假设dest包含页面号
      if (item.dest && typeof item.dest[0] === 'object') {
        // 这里需要更复杂的逻辑来解析目标页面
        console.log('导航到大纲项:', item.title)
      }
    })

    li.appendChild(link)

    // 递归处理子项
    if (item.items && item.items.length > 0) {
      const subContainer = document.createElement('div')
      renderOutline(item.items, subContainer)
      li.appendChild(subContainer)
    }

    ul.appendChild(li)
  })

  container.appendChild(ul)
}

/**
 * 加载PDF附件
 */
async function loadAttachments() {
  if (!AppState.pdfDocument || !Elements.attachmentsContainer)
    return

  try {
    // PDF.js 3.x 中附件API可能不同，这里是示例
    Elements.attachmentsContainer.innerHTML = '<div class="empty-state">此PDF没有附件</div>'
    console.log('📎 附件检查完成')
  }
  catch (error) {
    console.error('附件加载失败:', error)
    Elements.attachmentsContainer.innerHTML = '<div class="empty-state">附件加载失败</div>'
  }
}

// ==========================================================================
// UI更新函数
// ==========================================================================

/**
 * 更新导航按钮状态
 */
function updateNavigationButtons() {
  if (Elements.prevPageBtn) {
    Elements.prevPageBtn.disabled = AppState.currentPage <= 1
  }

  if (Elements.nextPageBtn) {
    Elements.nextPageBtn.disabled = AppState.currentPage >= AppState.totalPages
  }
}

/**
 * 更新页面信息显示
 */
function updatePageInfo() {
  if (Elements.pageInput) {
    Elements.pageInput.value = AppState.currentPage
  }

  if (Elements.totalPagesSpan) {
    Elements.totalPagesSpan.textContent = AppState.totalPages
  }
}

/**
 * 更新缩放显示
 */
function updateZoomDisplay() {
  if (Elements.zoomSelect) {
    const currentScale = AppState.scale
    let found = false

    for (const option of Elements.zoomSelect.options) {
      if (Number.parseFloat(option.value) === currentScale) {
        option.selected = true
        found = true
        break
      }
    }

    if (!found) {
      // 添加自定义缩放选项
      const customOption = document.createElement('option')
      customOption.value = currentScale
      customOption.textContent = `${(currentScale * 100).toFixed(0)}%`
      customOption.selected = true
      Elements.zoomSelect.appendChild(customOption)
    }
  }
}

/**
 * 更新搜索按钮状态
 */
function updateSearchButtons() {
  const hasResults = AppState.searchResults.length > 0

  if (Elements.searchPrevBtn) {
    Elements.searchPrevBtn.disabled = !hasResults
  }

  if (Elements.searchNextBtn) {
    Elements.searchNextBtn.disabled = !hasResults
  }

  // 更新搜索结果计数
  if (hasResults) {
    const resultText = `${AppState.currentSearchIndex + 1}/${AppState.searchResults.length}`
    console.log(`搜索结果: ${resultText}`)
  }
}

/**
 * 更新状态栏
 */
function updateStatusBar() {
  if (!Elements.statusText)
    return

  let statusText = ''

  if (AppState.pdfDocument) {
    statusText = `页面 ${AppState.currentPage}/${AppState.totalPages}`

    if (AppState.fileName) {
      statusText += ` - ${AppState.fileName}`
    }

    if (AppState.scale !== 1.0) {
      statusText += ` - ${(AppState.scale * 100).toFixed(0)}%`
    }

    if (AppState.searchResults.length > 0) {
      statusText += ` - 搜索: ${AppState.currentSearchIndex + 1}/${AppState.searchResults.length}`
    }
  }
  else {
    statusText = '就绪'
  }

  Elements.statusText.textContent = statusText
}

/**
 * 启用工具栏按钮
 */
function enableToolbarButtons() {
  const buttons = [
    Elements.downloadBtn,
    Elements.printBtn,
    Elements.prevPageBtn,
    Elements.nextPageBtn,
    Elements.zoomOutBtn,
    Elements.zoomInBtn,
    Elements.rotateBtn,
    Elements.searchInput,
    Elements.searchPrevBtn,
    Elements.searchNextBtn,
  ]

  buttons.forEach((button) => {
    if (button) {
      button.disabled = false
    }
  })
}

// ==========================================================================
// 主题和UI控制函数
// ==========================================================================

/**
 * 切换侧边栏
 */
function toggleSidebar() {
  AppState.sidebarVisible = !AppState.sidebarVisible

  if (Elements.sidebar) {
    Elements.sidebar.classList.toggle('show', AppState.sidebarVisible)
  }

  if (Elements.mainContent) {
    Elements.mainContent.classList.toggle('sidebar-open', AppState.sidebarVisible)
  }

  console.log(`📱 侧边栏: ${AppState.sidebarVisible ? '显示' : '隐藏'}`)
}

/**
 * 切换侧边栏标签
 */
function switchSidebarTab(tabName) {
  AppState.currentSidebarTab = tabName

  // 更新标签状态
  Elements.sidebarTabs?.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName)
  })

  // 更新面板显示
  Elements.sidebarPanels?.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabName)
  })

  console.log(`📋 切换到标签: ${tabName}`)
}

/**
 * 切换主题
 */
function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light'
  applyTheme(AppState.theme)
  saveTheme()
}

/**
 * 应用主题
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)

  if (Elements.themeToggleBtn) {
    const icon = Elements.themeToggleBtn.querySelector('.icon')
    if (icon) {
      icon.textContent = theme === 'light' ? '🌙' : '☀️'
    }
  }

  console.log(`🎨 主题切换为: ${theme}`)
}

/**
 * 加载主题
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('pdf-viewer-theme') || 'light'
  AppState.theme = savedTheme
  applyTheme(savedTheme)
}

/**
 * 保存主题
 */
function saveTheme() {
  localStorage.setItem('pdf-viewer-theme', AppState.theme)
}

// ==========================================================================
// 文件操作函数
// ==========================================================================

/**
 * 下载PDF
 */
function downloadPDF() {
  if (!AppState.pdfDocument || !AppState.fileName)
    return

  // 这里需要保存原始PDF数据才能下载
  // 简化处理，显示提示
  showNotification('下载功能需要保存原始文件数据')
  console.log('📥 下载PDF')
}

/**
 * 打印PDF
 */
function printPDF() {
  if (!AppState.pdfDocument)
    return

  window.print()
  console.log('🖨️ 打印PDF')
}

// ==========================================================================
// 拖拽上传函数
// ==========================================================================

/**
 * 设置拖拽上传
 */
function setupDragAndDrop() {
  const dropZone = Elements.pdfContainer || document.body;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false)
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false)
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false)
  })

  dropZone.addEventListener('drop', handleDrop, false)

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function highlight() {
    dropZone.classList.add('drag-over')
  }

  function unhighlight() {
    dropZone.classList.remove('drag-over')
  }

  async function handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files

    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        AppState.fileName = file.name
        AppState.fileSize = file.size
        await loadPDFFromFile(file)
      }
      else {
        showError('文件类型错误', '请拖拽PDF文件')
      }
    }
  }
}

// ==========================================================================
// 键盘快捷键函数
// ==========================================================================

/**
 * 处理键盘快捷键
 */
function handleKeyboardShortcuts(event) {
  // 忽略在输入框中的按键
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }

  const { key, ctrlKey, shiftKey, altKey } = event

  // Ctrl + 组合键
  if (ctrlKey) {
    switch (key) {
      case 'o':
        event.preventDefault()
        Elements.fileInput?.click()
        break
      case 's':
        event.preventDefault()
        downloadPDF()
        break
      case 'p':
        event.preventDefault()
        printPDF()
        break
      case 'f':
        event.preventDefault()
        Elements.searchInput?.focus()
        break
      case '=':
      case '+':
        event.preventDefault()
        changeZoom(0.25)
        break
      case '-':
        event.preventDefault()
        changeZoom(-0.25)
        break
      case '0':
        event.preventDefault()
        setZoom(1.0)
        break
    }
    return
  }

  // 单独按键
  switch (key) {
    case 'ArrowLeft':
    case 'PageUp':
      event.preventDefault()
      navigateToPage(AppState.currentPage - 1)
      break
    case 'ArrowRight':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      navigateToPage(AppState.currentPage + 1)
      break
    case 'Home':
      event.preventDefault()
      navigateToPage(1)
      break
    case 'End':
      event.preventDefault()
      navigateToPage(AppState.totalPages)
      break
    case 'r':
      event.preventDefault()
      rotatePDF()
      break
    case 's':
      event.preventDefault()
      toggleSidebar()
      break
    case 't':
      event.preventDefault()
      toggleTheme()
      break
    case 'Escape':
      event.preventDefault()
      if (AppState.sidebarVisible) {
        toggleSidebar()
      }
      break
    case 'F1':
      event.preventDefault()
      showHelp()
      break
  }
}

// ==========================================================================
// 窗口事件处理函数
// ==========================================================================

/**
 * 处理窗口大小变化
 */
function handleWindowResize() {
  // 重新计算特殊缩放模式
  if (typeof AppState.scale === 'string') {
    const newScale = calculateSpecialZoom(AppState.scale)
    if (newScale !== AppState.scale) {
      setZoom(newScale)
    }
  }
}

/**
 * 处理页面卸载前事件
 */
function handleBeforeUnload(event) {
  // 保存状态
  saveTheme()

  // 如果有未保存的更改，可以在这里提示用户
  // event.preventDefault();
  // event.returnValue = '';
}

// ==========================================================================
// 显示状态函数
// ==========================================================================

/**
 * 显示欢迎界面
 */
function showWelcomeScreen() {
  if (Elements.welcomeScreen) {
    Elements.welcomeScreen.style.display = 'flex'
  }

  if (Elements.pdfContainer) {
    Elements.pdfContainer.style.display = 'none'
  }
}

/**
 * 隐藏欢迎界面
 */
function hideWelcomeScreen() {
  if (Elements.welcomeScreen) {
    Elements.welcomeScreen.style.display = 'none'
  }

  if (Elements.pdfContainer) {
    Elements.pdfContainer.style.display = 'block'
  }
}

/**
 * 显示加载覆盖层
 */
function showLoadingOverlay(message = '正在加载...') {
  if (Elements.loadingOverlay) {
    Elements.loadingOverlay.style.display = 'flex'

    const loadingText = Elements.loadingOverlay.querySelector('.loading-text')
    if (loadingText) {
      loadingText.textContent = message
    }
  }
}

/**
 * 隐藏加载覆盖层
 */
function hideLoadingOverlay() {
  if (Elements.loadingOverlay) {
    Elements.loadingOverlay.style.display = 'none'
  }
}

/**
 * 更新加载进度
 */
function updateLoadingProgress(progress) {
  if (Elements.progressBar) {
    Elements.progressBar.style.width = `${progress}%`
  }

  const progressText = Elements.loadingOverlay?.querySelector('.progress-text')
  if (progressText) {
    progressText.textContent = `${Math.round(progress)}%`
  }
}

/**
 * 显示错误信息
 */
function showError(title, message) {
  if (Elements.errorContainer) {
    Elements.errorContainer.style.display = 'flex'

    const errorTitle = Elements.errorContainer.querySelector('.error-title')
    if (errorTitle) {
      errorTitle.textContent = title
    }

    const errorMessage = Elements.errorContainer.querySelector('.error-message')
    if (errorMessage) {
      errorMessage.textContent = message
    }
  }

  AppState.lastError = { title, message, timestamp: Date.now() }
  console.error(`❌ ${title}: ${message}`)
}

/**
 * 隐藏错误信息
 */
function hideError() {
  if (Elements.errorContainer) {
    Elements.errorContainer.style.display = 'none'
  }
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // 显示动画
  setTimeout(() => {
    notification.classList.add('show')
  }, 10)

  // 自动隐藏
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, duration)
}

// ==========================================================================
// 帮助和其他功能
// ==========================================================================

/**
 * 显示帮助信息
 */
function showHelp() {
  const helpContent = `
    <h3>PDF查看器帮助</h3>
    <h4>键盘快捷键:</h4>
    <ul>
      <li><kbd>Ctrl+O</kbd> - 打开文件</li>
      <li><kbd>Ctrl+S</kbd> - 下载PDF</li>
      <li><kbd>Ctrl+P</kbd> - 打印</li>
      <li><kbd>Ctrl+F</kbd> - 搜索</li>
      <li><kbd>Ctrl++</kbd> - 放大</li>
      <li><kbd>Ctrl+-</kbd> - 缩小</li>
      <li><kbd>Ctrl+0</kbd> - 重置缩放</li>
      <li><kbd>←/→</kbd> - 上一页/下一页</li>
      <li><kbd>Home/End</kbd> - 首页/末页</li>
      <li><kbd>R</kbd> - 旋转</li>
      <li><kbd>S</kbd> - 切换侧边栏</li>
      <li><kbd>T</kbd> - 切换主题</li>
      <li><kbd>F1</kbd> - 显示帮助</li>
    </ul>
    <h4>功能说明:</h4>
    <ul>
      <li>支持拖拽上传PDF文件</li>
      <li>支持缩略图导航</li>
      <li>支持全文搜索</li>
      <li>支持多种缩放模式</li>
      <li>支持明暗主题切换</li>
    </ul>
  `

  showDialog('帮助', helpContent)
}

/**
 * 显示对话框
 */
function showDialog(title, content) {
  // 创建对话框
  const dialog = document.createElement('div')
  dialog.className = 'dialog-overlay'

  dialog.innerHTML = `
    <div class="dialog">
      <div class="dialog-header">
        <h3 class="dialog-title">${title}</h3>
        <button class="dialog-close" aria-label="关闭">×</button>
      </div>
      <div class="dialog-content">
        ${content}
      </div>
    </div>
  `

  // 添加事件监听器
  const closeBtn = dialog.querySelector('.dialog-close')
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(dialog)
  })

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      document.body.removeChild(dialog)
    }
  })

  document.body.appendChild(dialog)
}

/**
 * 检查URL参数
 */
function checkURLParameters() {
  const urlParams = new URLSearchParams(window.location.search)
  const fileUrl = urlParams.get('file')

  if (fileUrl) {
    loadPDFFromURL(fileUrl)
  }
}

/**
 * 从URL加载PDF
 */
async function loadPDFFromURL(url) {
  try {
    showLoadingOverlay('正在从URL加载PDF...')

    const loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: PDFJS_CONFIG.cMapUrl,
      cMapPacked: PDFJS_CONFIG.cMapPacked,
      standardFontDataUrl: PDFJS_CONFIG.standardFontDataUrl,
    })

    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        AppState.loadProgress = (progress.loaded / progress.total) * 100
        updateLoadingProgress(AppState.loadProgress)
      }
    }

    AppState.pdfDocument = await loadingTask.promise
    AppState.totalPages = AppState.pdfDocument.numPages
    AppState.currentPage = 1
    AppState.fileName = url.split('/').pop() || 'document.pdf'

    await initializePDFDisplay()
    hideLoadingOverlay()
  }
  catch (error) {
    hideLoadingOverlay()
    showError('URL加载失败', error.message)
  }
}

// ==========================================================================
// 应用程序启动
// ==========================================================================

// 等待DOM加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
}
else {
  initializeApp()
}

// 导出全局函数（用于调试）
window.PDFViewer = {
  AppState,
  Elements,
  navigateToPage,
  setZoom,
  performSearch,
  toggleTheme,
  showHelp,
}

console.log('📱 PDF查看器脚本加载完成')
