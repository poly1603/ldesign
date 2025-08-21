/**
 * PDF预览组件基础使用示例
 * 展示如何使用PDF预览组件的核心功能
 */

// 模拟PDF预览组件的导入（实际使用时应该从npm包导入）
// import { createPdfViewer } from '@ldesign/pdf';

/**
 * 模拟PDF预览组件的实现
 * 在实际项目中，这些功能由@ldesign/pdf包提供
 */
class MockPdfViewer {
  constructor(options = {}) {
    this.container = options.container
    this.enableCache = options.enableCache || true
    this.cacheSize = options.cacheSize || 50

    this.currentPage = 0
    this.totalPages = 0
    this.zoomLevel = 1.0
    this.pdfDocument = null
    this.isLoading = false

    this.eventListeners = new Map()

    console.log('PDF Viewer initialized with options:', options)
  }

  // 事件系统
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data))
    }
  }

  // 模拟PDF加载
  async loadPdf(source) {
    this.isLoading = true
    this.emit('loadStart', { source })

    try {
      // 模拟加载过程
      await this.simulateLoading()

      // 模拟PDF文档数据
      this.pdfDocument = {
        numPages: Math.floor(Math.random() * 20) + 5, // 5-24页
        source,
      }

      this.totalPages = this.pdfDocument.numPages
      this.currentPage = 1

      this.emit('loadSuccess', {
        totalPages: this.totalPages,
        source,
      })

      // 渲染第一页
      await this.renderPage(1)
    }
    catch (error) {
      this.emit('loadError', { error, source })
      throw error
    }
    finally {
      this.isLoading = false
    }
  }

  // 模拟加载进度
  async simulateLoading() {
    const steps = 10
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))
      this.emit('loadProgress', {
        progress: (i / steps) * 100,
        step: i,
        total: steps,
      })
    }
  }

  // 渲染页面
  async renderPage(pageNumber) {
    if (!this.pdfDocument || pageNumber < 1 || pageNumber > this.totalPages) {
      throw new Error(`Invalid page number: ${pageNumber}`)
    }

    this.currentPage = pageNumber

    // 模拟页面渲染
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 设置画布尺寸（模拟A4纸张比例）
    const baseWidth = 595
    const baseHeight = 842
    canvas.width = baseWidth * this.zoomLevel
    canvas.height = baseHeight * this.zoomLevel

    // 绘制模拟PDF页面
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制边框
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // 绘制页面内容（模拟文本）
    ctx.fillStyle = '#333333'
    ctx.font = `${16 * this.zoomLevel}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(
      `第 ${pageNumber} 页`,
      canvas.width / 2,
      50 * this.zoomLevel,
    )

    ctx.font = `${12 * this.zoomLevel}px Arial`
    ctx.fillText(
      `这是PDF文档的第${pageNumber}页内容`,
      canvas.width / 2,
      100 * this.zoomLevel,
    )

    ctx.fillText(
      `缩放级别: ${Math.round(this.zoomLevel * 100)}%`,
      canvas.width / 2,
      130 * this.zoomLevel,
    )

    // 绘制一些模拟的文本行
    for (let i = 0; i < 10; i++) {
      ctx.fillText(
        `这是第${i + 1}行示例文本内容，用于演示PDF页面渲染效果。`,
        canvas.width / 2,
        (200 + i * 30) * this.zoomLevel,
      )
    }

    // 清空容器并添加新页面
    this.container.innerHTML = ''
    const pageDiv = document.createElement('div')
    pageDiv.className = 'pdf-page'
    pageDiv.appendChild(canvas)
    this.container.appendChild(pageDiv)

    this.emit('pageRendered', {
      pageNumber,
      zoomLevel: this.zoomLevel,
    })
  }

  // 页面导航
  async nextPage() {
    if (this.currentPage < this.totalPages) {
      await this.renderPage(this.currentPage + 1)
      return true
    }
    return false
  }

  async previousPage() {
    if (this.currentPage > 1) {
      await this.renderPage(this.currentPage - 1)
      return true
    }
    return false
  }

  async goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      await this.renderPage(pageNumber)
      return true
    }
    return false
  }

  // 缩放控制
  async zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel * 1.25, 3.0)
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel / 1.25, 0.25)
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async setZoom(level) {
    this.zoomLevel = Math.max(0.25, Math.min(level, 3.0))
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async fitWidth() {
    // 模拟适应宽度的计算
    const containerWidth = this.container.clientWidth - 40 // 减去边距
    const baseWidth = 595 // A4宽度
    const newZoom = containerWidth / baseWidth
    await this.setZoom(newZoom)
  }

  // 获取当前状态
  getCurrentPage() {
    return this.currentPage
  }

  getTotalPages() {
    return this.totalPages
  }

  getZoomLevel() {
    return this.zoomLevel
  }

  isDocumentLoaded() {
    return this.pdfDocument !== null
  }
}

/**
 * 应用程序主类
 */
class PDFViewerApp {
  constructor() {
    this.viewer = null
    this.elements = {}
    this.init()
  }

  // 初始化应用
  init() {
    this.initElements()
    this.initViewer()
    this.bindEvents()
    this.updateUI()

    console.log('PDF Viewer App initialized')
  }

  // 初始化DOM元素引用
  initElements() {
    this.elements = {
      fileInput: document.getElementById('file-input'),
      pdfViewer: document.getElementById('pdf-viewer'),
      prevPage: document.getElementById('prev-page'),
      nextPage: document.getElementById('next-page'),
      currentPage: document.getElementById('current-page'),
      totalPages: document.getElementById('total-pages'),
      zoomIn: document.getElementById('zoom-in'),
      zoomOut: document.getElementById('zoom-out'),
      zoomLevel: document.getElementById('zoom-level'),
      fitWidth: document.getElementById('fit-width'),
      pageInput: document.getElementById('page-input'),
      goToPage: document.getElementById('go-to-page'),
      statusMessage: document.getElementById('status-message'),
      loadingProgress: document.getElementById('loading-progress'),
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      errorModal: document.getElementById('error-modal'),
      errorMessage: document.getElementById('error-message'),
      closeError: document.getElementById('close-error'),
    }
  }

  // 初始化PDF查看器
  initViewer() {
    this.viewer = new MockPdfViewer({
      container: this.elements.pdfViewer,
      enableCache: true,
      cacheSize: 50,
    })

    // 绑定查看器事件
    this.viewer.on('loadStart', (data) => {
      this.showLoadingProgress()
      this.setStatus('正在加载PDF文档...')
    })

    this.viewer.on('loadProgress', (data) => {
      this.updateLoadingProgress(data.progress)
    })

    this.viewer.on('loadSuccess', (data) => {
      this.hideLoadingProgress()
      this.setStatus(`PDF加载成功，共${data.totalPages}页`)
      this.updateUI()
    })

    this.viewer.on('loadError', (data) => {
      this.hideLoadingProgress()
      this.showError('PDF加载失败', data.error.message)
      this.setStatus('PDF加载失败')
    })

    this.viewer.on('pageRendered', (data) => {
      this.updateUI()
      this.setStatus(`显示第${data.pageNumber}页`)
    })

    this.viewer.on('zoomChanged', (data) => {
      this.updateUI()
    })
  }

  // 绑定事件监听器
  bindEvents() {
    // 文件选择
    this.elements.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file && file.type === 'application/pdf') {
        this.loadPdfFile(file)
      }
      else if (file) {
        this.showError('文件格式错误', '请选择PDF格式的文件')
      }
    })

    // 页面导航
    this.elements.prevPage.addEventListener('click', () => {
      this.viewer.previousPage()
    })

    this.elements.nextPage.addEventListener('click', () => {
      this.viewer.nextPage()
    })

    // 缩放控制
    this.elements.zoomIn.addEventListener('click', () => {
      this.viewer.zoomIn()
    })

    this.elements.zoomOut.addEventListener('click', () => {
      this.viewer.zoomOut()
    })

    this.elements.fitWidth.addEventListener('click', () => {
      this.viewer.fitWidth()
    })

    // 页面跳转
    this.elements.goToPage.addEventListener('click', () => {
      const pageNumber = Number.parseInt(this.elements.pageInput.value)
      if (pageNumber && pageNumber >= 1 && pageNumber <= this.viewer.getTotalPages()) {
        this.viewer.goToPage(pageNumber)
      }
      else {
        this.showError('页码错误', '请输入有效的页码')
      }
    })

    this.elements.pageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.elements.goToPage.click()
      }
    })

    // 错误模态框
    this.elements.closeError.addEventListener('click', () => {
      this.hideError()
    })

    this.elements.errorModal.addEventListener('click', (e) => {
      if (e.target === this.elements.errorModal) {
        this.hideError()
      }
    })

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (!this.viewer.isDocumentLoaded())
        return

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          this.viewer.previousPage()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          this.viewer.nextPage()
          break
        case '+':
        case '=':
          e.preventDefault()
          this.viewer.zoomIn()
          break
        case '-':
          e.preventDefault()
          this.viewer.zoomOut()
          break
        case '0':
          e.preventDefault()
          this.viewer.fitWidth()
          break
      }
    })
  }

  // 加载PDF文件
  async loadPdfFile(file) {
    try {
      // 在实际应用中，这里会读取文件内容
      // 现在我们只是模拟加载过程
      const fileUrl = URL.createObjectURL(file)
      await this.viewer.loadPdf(fileUrl)
    }
    catch (error) {
      this.showError('加载失败', error.message)
    }
  }

  // 更新UI状态
  updateUI() {
    const isLoaded = this.viewer.isDocumentLoaded()
    const currentPage = this.viewer.getCurrentPage()
    const totalPages = this.viewer.getTotalPages()
    const zoomLevel = this.viewer.getZoomLevel()

    // 更新页面信息
    this.elements.currentPage.textContent = currentPage
    this.elements.totalPages.textContent = totalPages
    this.elements.zoomLevel.textContent = Math.round(zoomLevel * 100)

    // 更新按钮状态
    this.elements.prevPage.disabled = !isLoaded || currentPage <= 1
    this.elements.nextPage.disabled = !isLoaded || currentPage >= totalPages
    this.elements.zoomIn.disabled = !isLoaded || zoomLevel >= 3.0
    this.elements.zoomOut.disabled = !isLoaded || zoomLevel <= 0.25
    this.elements.fitWidth.disabled = !isLoaded
    this.elements.pageInput.disabled = !isLoaded
    this.elements.goToPage.disabled = !isLoaded

    // 更新页面输入框
    if (isLoaded) {
      this.elements.pageInput.max = totalPages
      this.elements.pageInput.value = ''
    }
  }

  // 状态管理
  setStatus(message) {
    this.elements.statusMessage.textContent = message
  }

  showLoadingProgress() {
    this.elements.loadingProgress.style.display = 'flex'
    this.updateLoadingProgress(0)
  }

  hideLoadingProgress() {
    this.elements.loadingProgress.style.display = 'none'
  }

  updateLoadingProgress(progress) {
    this.elements.progressFill.style.width = `${progress}%`
    this.elements.progressText.textContent = `加载中... ${Math.round(progress)}%`
  }

  showError(title, message) {
    this.elements.errorMessage.textContent = `${title}: ${message}`
    this.elements.errorModal.style.display = 'flex'
  }

  hideError() {
    this.elements.errorModal.style.display = 'none'
  }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  new PDFViewerApp()
})

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PDFViewerApp, MockPdfViewer }
}
