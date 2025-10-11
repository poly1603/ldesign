import type { PDFDocumentProxy } from 'pdfjs-dist'
import { DocumentManager } from './DocumentManager'
import { PageRenderer } from './PageRenderer'
import type {
  PDFViewerConfig,
  ZoomType,
  RotationAngle,
  SearchResult,
  IPDFViewer,
  PDFViewerEvents
} from '../types'

/**
 * PDF查看器
 * 主要的查看器类，整合文档管理和页面渲染
 */
export class PDFViewer implements IPDFViewer {
  private config: Required<PDFViewerConfig>
  private container: HTMLElement
  private documentManager: DocumentManager
  private pageRenderer: PageRenderer
  private currentPage: number = 1
  private currentScale: number = 1.0
  private currentRotation: RotationAngle = 0
  private pageContainers: Map<number, HTMLElement> = new Map()
  private viewerElement: HTMLElement | null = null
  private toolbarElement: HTMLElement | null = null
  private thumbnailContainer: HTMLElement | null = null
  private thumbnailCache: Map<number, HTMLCanvasElement> = new Map()
  private loadingElement: HTMLElement | null = null
  private continuousMode: boolean = false
  private scrollSyncEnabled: boolean = true

  constructor(config: PDFViewerConfig) {
    this.config = this.mergeConfig(config)
    this.container = this.resolveContainer(config.container)
    this.documentManager = new DocumentManager(this.config.workerSrc)
    this.pageRenderer = new PageRenderer(this.config.maxCachePages)

    this.initialize()
  }

  /**
   * 合并配置
   */
  private mergeConfig(config: PDFViewerConfig): Required<PDFViewerConfig> {
    return {
      container: config.container,
      url: config.url || '',
      scale: config.scale || 1.0,
      page: config.page || 1,
      enableTextSelection: config.enableTextSelection ?? true,
      enableToolbar: config.enableToolbar ?? true,
      enableThumbnails: config.enableThumbnails ?? false,
      enableSearch: config.enableSearch ?? true,
      renderMode: config.renderMode || 'canvas',
      maxCachePages: config.maxCachePages || 20,
      enableVirtualScroll: config.enableVirtualScroll ?? false,
      workerSrc: config.workerSrc || '',
      cMapUrl: config.cMapUrl || 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: config.cMapPacked ?? true,
      toolbar: config.toolbar || {},
      theme: config.theme || {}
    }
  }

  /**
   * 解析容器元素
   */
  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  /**
   * 初始化查看器
   */
  private initialize(): void {
    // 创建查看器结构
    this.createViewerStructure()

    // 转发文档管理器事件
    this.documentManager.on('document-loaded', (doc) => this.handleDocumentLoaded(doc))
    this.documentManager.on('document-error', (error) => {
      this.hideLoading()
      this.emit('document-error', error)
    })
    this.documentManager.on('loading-progress', (progress) => {
      this.updateLoadingProgress(progress)
      this.emit('loading-progress', progress)
    })
    this.documentManager.on('search-results', (results) => this.emit('search-results', results))

    // 设置滚动监听
    this.setupScrollSync()

    // 如果提供了URL，自动加载
    if (this.config.url) {
      this.loadDocument(this.config.url)
    }
  }

  /**
   * 创建查看器结构
   */
  private createViewerStructure(): void {
    // 清空容器
    this.container.innerHTML = ''
    this.container.className = 'pdf-viewer-container'

    // 创建工具栏
    if (this.config.enableToolbar) {
      this.toolbarElement = this.createToolbar()
      this.container.appendChild(this.toolbarElement)
    }

    // 创建主内容区域
    const mainContent = document.createElement('div')
    mainContent.className = 'pdf-main-content'

    // 创建缩略图面板
    if (this.config.enableThumbnails) {
      this.thumbnailContainer = this.createThumbnailPanel()
      mainContent.appendChild(this.thumbnailContainer)
    }

    // 创建查看器主体
    this.viewerElement = document.createElement('div')
    this.viewerElement.className = 'pdf-viewer-content'
    mainContent.appendChild(this.viewerElement)

    this.container.appendChild(mainContent)

    // 应用样式
    this.applyStyles()
  }

  /**
   * 创建工具栏
   */
  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div')
    toolbar.className = 'pdf-toolbar'

    const toolbarConfig = this.config.toolbar

    if (toolbarConfig.showPageNav !== false) {
      toolbar.appendChild(this.createPageNavigation())
    }

    if (toolbarConfig.showZoom !== false) {
      toolbar.appendChild(this.createZoomControls())
    }

    if (toolbarConfig.showRotate !== false) {
      toolbar.appendChild(this.createRotateButton())
    }

    if (toolbarConfig.showDownload !== false) {
      toolbar.appendChild(this.createDownloadButton())
    }

    if (toolbarConfig.showPrint !== false) {
      toolbar.appendChild(this.createPrintButton())
    }

    return toolbar
  }

  /**
   * 显示Loading
   */
  private showLoading(message: string = 'Loading PDF...'): void {
    if (!this.viewerElement) return

    this.loadingElement = document.createElement('div')
    this.loadingElement.className = 'pdf-loading'
    this.loadingElement.innerHTML = `
      <div class="pdf-loading-spinner"></div>
      <span>${message}</span>
    `
    this.viewerElement.appendChild(this.loadingElement)
  }

  /**
   * 隐藏Loading
   */
  private hideLoading(): void {
    if (this.loadingElement && this.loadingElement.parentElement) {
      this.loadingElement.remove()
      this.loadingElement = null
    }
  }

  /**
   * 更新Loading进度
   */
  private updateLoadingProgress(progress: any): void {
    if (!this.loadingElement) return

    const percent = Math.round((progress.loaded / progress.total) * 100)
    const span = this.loadingElement.querySelector('span')
    if (span) {
      span.textContent = `Loading: ${percent}%`
    }
  }

  /**
   * 设置滚动同步
   */
  private setupScrollSync(): void {
    if (!this.viewerElement) return

    let scrollTimeout: NodeJS.Timeout | null = null

    this.viewerElement.addEventListener('scroll', () => {
      if (!this.scrollSyncEnabled) return

      if (scrollTimeout) clearTimeout(scrollTimeout)

      // 计算当前可见页面
      const scrollTop = this.viewerElement!.scrollTop
      const viewportHeight = this.viewerElement!.clientHeight
      const centerY = scrollTop + viewportHeight / 2

      let closestPage = 1
      let minDistance = Infinity

      this.pageContainers.forEach((container, pageNum) => {
        const rect = container.getBoundingClientRect()
        const containerTop = scrollTop + rect.top
        const containerCenter = containerTop + rect.height / 2
        const distance = Math.abs(containerCenter - centerY)

        if (distance < minDistance) {
          minDistance = distance
          closestPage = pageNum
        }
      })

      if (closestPage !== this.currentPage) {
        this.currentPage = closestPage
        this.updateToolbar()
        this.updateThumbnailHighlight(closestPage)
        this.scrollThumbnailIntoView(closestPage)
      }
    })
  }

  /**
   * 滚动缩略图到视图中
   */
  private scrollThumbnailIntoView(pageNumber: number): void {
    if (!this.thumbnailContainer) return

    const thumbnailItem = this.thumbnailContainer.querySelector(
      `.pdf-thumbnail-item[data-page-number="${pageNumber}"]`
    )

    if (thumbnailItem) {
      thumbnailItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }

  /**
   * 创建缩略图面板
   */
  private createThumbnailPanel(): HTMLElement {
    const panel = document.createElement('div')
    panel.className = 'pdf-thumbnail-panel'

    const header = document.createElement('div')
    header.className = 'pdf-thumbnail-header'
    header.innerHTML = '<span data-icon="list"></span><span>Pages</span>'

    const thumbnailList = document.createElement('div')
    thumbnailList.className = 'pdf-thumbnail-list'

    panel.appendChild(header)
    panel.appendChild(thumbnailList)

    return panel
  }


  /**
   * 创建页面导航
   */
  private createPageNavigation(): HTMLElement {
    const nav = document.createElement('div')
    nav.className = 'pdf-page-nav'

    const prevBtn = document.createElement('button')
    prevBtn.innerHTML = '<span data-icon="chevron-left"></span>'
    prevBtn.title = 'Previous Page'
    prevBtn.onclick = () => this.previousPage()

    const pageInfo = document.createElement('span')
    pageInfo.className = 'pdf-page-info'
    pageInfo.textContent = `${this.currentPage} / ${this.getTotalPages()}`

    const nextBtn = document.createElement('button')
    nextBtn.innerHTML = '<span data-icon="chevron-right"></span>'
    nextBtn.title = 'Next Page'
    nextBtn.onclick = () => this.nextPage()

    nav.appendChild(prevBtn)
    nav.appendChild(pageInfo)
    nav.appendChild(nextBtn)

    return nav
  }

  /**
   * 创建缩放控件
   */
  private createZoomControls(): HTMLElement {
    const controls = document.createElement('div')
    controls.className = 'pdf-zoom-controls'

    const zoomOutBtn = document.createElement('button')
    zoomOutBtn.innerHTML = '<span data-icon="zoom-out"></span>'
    zoomOutBtn.title = 'Zoom Out'
    zoomOutBtn.onclick = () => this.setZoom('out')

    const zoomInfo = document.createElement('span')
    zoomInfo.className = 'pdf-zoom-info'
    zoomInfo.textContent = `${Math.round(this.currentScale * 100)}%`

    const zoomInBtn = document.createElement('button')
    zoomInBtn.innerHTML = '<span data-icon="zoom-in"></span>'
    zoomInBtn.title = 'Zoom In'
    zoomInBtn.onclick = () => this.setZoom('in')

    const fitWidthBtn = document.createElement('button')
    fitWidthBtn.innerHTML = '<span data-icon="arrow-left-right"></span>'
    fitWidthBtn.title = 'Fit Width'
    fitWidthBtn.onclick = () => this.setZoom('fit-width')

    controls.appendChild(zoomOutBtn)
    controls.appendChild(zoomInfo)
    controls.appendChild(zoomInBtn)
    controls.appendChild(fitWidthBtn)

    return controls
  }

  /**
   * 创建旋转按钮
   */
  private createRotateButton(): HTMLElement {
    const btn = document.createElement('button')
    btn.innerHTML = '<span data-icon="rotate-cw"></span>'
    btn.title = 'Rotate'
    btn.className = 'pdf-rotate-btn'
    btn.onclick = () => this.rotate(((this.currentRotation + 90) % 360) as RotationAngle)
    return btn
  }

  /**
   * 创建下载按钮
   */
  private createDownloadButton(): HTMLElement {
    const btn = document.createElement('button')
    btn.innerHTML = '<span data-icon="download"></span>'
    btn.title = 'Download'
    btn.className = 'pdf-download-btn'
    btn.onclick = () => this.download()
    return btn
  }

  /**
   * 创建打印按钮
   */
  private createPrintButton(): HTMLElement {
    const btn = document.createElement('button')
    btn.innerHTML = '<span data-icon="printer"></span>'
    btn.title = 'Print'
    btn.className = 'pdf-print-btn'
    btn.onclick = () => this.print()
    return btn
  }

  /**
   * 应用样式
   */
  private applyStyles(): void {
    const style = document.createElement('style')
    const theme = this.config.theme

    style.textContent = `
      .pdf-viewer-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: ${theme.backgroundColor || '#525659'};
        color: ${theme.textColor || '#fff'};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .pdf-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        background: ${theme.toolbarBackground || '#323639'};
        border-bottom: 1px solid #1a1a1a;
        flex-shrink: 0;
      }
      .pdf-toolbar button {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        padding: 8px;
        background: ${theme.primaryColor || '#444'};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
      }
      .pdf-toolbar button:hover {
        background: ${theme.primaryColor || '#555'};
        transform: translateY(-1px);
      }
      .pdf-toolbar button:active {
        transform: translateY(0);
      }
      .pdf-toolbar button svg {
        width: 20px;
        height: 20px;
      }
      .pdf-page-nav, .pdf-zoom-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pdf-page-info, .pdf-zoom-info {
        padding: 0 12px;
        font-size: 14px;
        font-weight: 500;
        min-width: 80px;
        text-align: center;
      }
      .pdf-main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      .pdf-thumbnail-panel {
        width: 200px;
        background: #2a2a2a;
        border-right: 1px solid #1a1a1a;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .pdf-thumbnail-header {
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        border-bottom: 1px solid #1a1a1a;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pdf-thumbnail-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      .pdf-thumbnail-item {
        margin-bottom: 8px;
        padding: 8px;
        background: #333;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        border: 2px solid transparent;
      }
      .pdf-thumbnail-item:hover {
        background: #3a3a3a;
      }
      .pdf-thumbnail-item.active {
        border-color: ${theme.primaryColor || '#0969da'};
        background: #3a3a3a;
      }
      .pdf-thumbnail-canvas {
        width: 100%;
        display: block;
        border-radius: 2px;
      }
      .pdf-thumbnail-label {
        margin-top: 4px;
        font-size: 12px;
        text-align: center;
        color: #aaa;
      }
      .pdf-viewer-content {
        flex: 1;
        overflow: auto;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        scroll-behavior: smooth;
        position: relative;
        background: #525659;
      }
      .pdf-page-container {
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        width: 100%;
        max-width: none;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pdf-page-canvas {
        display: block;
        width: 100%;
        height: auto;
        max-width: 100%;
      }
      .pdf-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
      }
      .pdf-loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #444;
        border-top-color: ${theme.primaryColor || '#0969da'};
        border-radius: 50%;
        animation: pdf-spin 0.8s linear infinite;
      }
      @keyframes pdf-spin {
        to { transform: rotate(360deg); }
      }
      .pdf-thumbnail-item.loading {
        opacity: 0.5;
        position: relative;
      }
      .pdf-thumbnail-item.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        border: 2px solid #444;
        border-top-color: ${theme.primaryColor || '#0969da'};
        border-radius: 50%;
        animation: pdf-spin 0.8s linear infinite;
      }
      .pdf-thumbnail-list::-webkit-scrollbar,
      .pdf-viewer-content::-webkit-scrollbar {
        width: 8px;
      }
      .pdf-thumbnail-list::-webkit-scrollbar-track,
      .pdf-viewer-content::-webkit-scrollbar-track {
        background: #1a1a1a;
      }
      .pdf-thumbnail-list::-webkit-scrollbar-thumb,
      .pdf-viewer-content::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 4px;
      }
      .pdf-thumbnail-list::-webkit-scrollbar-thumb:hover,
      .pdf-viewer-content::-webkit-scrollbar-thumb:hover {
        background: #666;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * 处理文档加载完成
   */
  private async handleDocumentLoaded(doc: PDFDocumentProxy): Promise<void> {
    this.emit('document-loaded', doc)

    // 更新工具栏
    this.updateToolbar()

    // 生成缩略图
    if (this.config.enableThumbnails) {
      this.generateThumbnails()
    }

    // 判断渲染模式
    if (this.continuousMode) {
      // 连续模式: 渲染所有页面
      await this.renderAllPages()
    } else {
      // 单页模式: 只渲染当前页
      await this.goToPage(this.config.page)
    }

    this.hideLoading()
  }

  /**
   * 渲染所有页面（连续模式）- 优化版
   */
  private async renderAllPages(): Promise<void> {
    if (!this.viewerElement) return

    this.viewerElement.innerHTML = ''
    const totalPages = this.getTotalPages()

    // 只创建容器，不立即渲染
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const pageContainer = document.createElement('div')
      pageContainer.className = 'pdf-page-container'
      pageContainer.dataset.pageNumber = String(pageNum)
      
      // 设置一个默认高度，防止布局闪烁
      pageContainer.style.minHeight = '800px'
      pageContainer.style.background = '#fff'
      pageContainer.style.position = 'relative'
      
      this.pageContainers.set(pageNum, pageContainer)
      this.viewerElement.appendChild(pageContainer)
    }

    // 只渲染第一页
    const firstContainer = this.pageContainers.get(1)
    if (firstContainer) {
      await this.renderPageInContainer(1, firstContainer)
    }

    // 设置当前页
    this.currentPage = 1
    this.updateThumbnailHighlight(1)

    // 设置 Intersection Observer 用于懒加载
    this.setupLazyLoading()
  }

  /**
   * 设置懒加载
   */
  private setupLazyLoading(): void {
    if (!this.viewerElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target as HTMLElement
            const pageNum = parseInt(container.dataset.pageNumber || '0')
            
            // 如果还没有渲染，就渲染它
            if (pageNum && !container.querySelector('canvas')) {
              this.renderPageInContainer(pageNum, container)
              // 渲染后取消监听
              observer.unobserve(container)
            }
          }
        })
      },
      {
        root: this.viewerElement,
        rootMargin: '400px', // 提前400px开始加载
        threshold: 0.01
      }
    )

    // 监听所有页面容器
    this.pageContainers.forEach((container) => {
      observer.observe(container)
    })
  }

  /**
   * 在容器中渲染页面
   */
  private async renderPageInContainer(pageNum: number, container: HTMLElement): Promise<void> {
    try {
      const page = await this.documentManager.getPage(pageNum)
      await this.pageRenderer.renderPage(
        page,
        container,
        this.currentScale,
        this.currentRotation
      )
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error)
    }
  }

  /**
   * 生成所有页面的缩略图 - 优化版
   */
  private async generateThumbnails(): Promise<void> {
    if (!this.thumbnailContainer) return

    const thumbnailList = this.thumbnailContainer.querySelector('.pdf-thumbnail-list')
    if (!thumbnailList) return

    const totalPages = this.getTotalPages()

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const thumbnailItem = document.createElement('div')
      thumbnailItem.className = 'pdf-thumbnail-item loading'
      thumbnailItem.dataset.pageNumber = String(pageNum)

      const canvas = document.createElement('canvas')
      canvas.className = 'pdf-thumbnail-canvas'
      // 设置默认尺寸防止闪烁
      canvas.width = 120
      canvas.height = 160

      const label = document.createElement('div')
      label.className = 'pdf-thumbnail-label'
      label.textContent = `Page ${pageNum}`

      thumbnailItem.appendChild(canvas)
      thumbnailItem.appendChild(label)
      thumbnailList.appendChild(thumbnailItem)

      // 点击缩略图跳转到对应页面
      thumbnailItem.onclick = () => {
        if (this.continuousMode) {
          const pageContainer = this.pageContainers.get(pageNum)
          if (pageContainer) {
            this.scrollSyncEnabled = false
            pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setTimeout(() => {
              this.currentPage = pageNum
              this.updateToolbar()
              this.updateThumbnailHighlight(pageNum)
              this.scrollSyncEnabled = true
            }, 500)
          }
        } else {
          this.goToPage(pageNum)
        }
      }

      // 分批渲染缩略图，每次间隔50ms，快速加载
      setTimeout(() => {
        this.renderThumbnail(pageNum, canvas, thumbnailItem)
      }, pageNum * 50)
    }
  }

  /**
   * 渲染单个缩略图 - 优化版
   */
  private async renderThumbnail(pageNum: number, canvas: HTMLCanvasElement, thumbnailItem: HTMLElement): Promise<void> {
    try {
      const page = await this.documentManager.getPage(pageNum)
      // 使用更小的比例减少内存占用
      const viewport = page.getViewport({ scale: 0.15 })

      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext('2d', { 
        alpha: false, // 禁用alpha通道提升性能
        willReadFrequently: false 
      })
      if (!context) return

      // 使用低质量渲染
      await page.render({
        canvasContext: context,
        viewport: viewport,
        intent: 'display'
      }).promise

      this.thumbnailCache.set(pageNum, canvas)
      thumbnailItem.classList.remove('loading')
    } catch (error) {
      console.error(`Error rendering thumbnail ${pageNum}:`, error)
      thumbnailItem.classList.remove('loading')
    }
  }

  /**
   * 更新工具栏
   */
  private updateToolbar(): void {
    if (!this.toolbarElement) return

    const pageInfo = this.toolbarElement.querySelector('.pdf-page-info')
    if (pageInfo) {
      pageInfo.textContent = `${this.currentPage} / ${this.getTotalPages()}`
    }

    const zoomInfo = this.toolbarElement.querySelector('.pdf-zoom-info')
    if (zoomInfo) {
      zoomInfo.textContent = `${Math.round(this.currentScale * 100)}%`
    }
  }

  /**
   * 预渲染相邻页面
   */
  private async prerenderAdjacentPages(): Promise<void> {
    const totalPages = this.getTotalPages()
    const pagesToPrerender = []

    // 预渲染前后各2页
    for (let offset = 1; offset <= 2; offset++) {
      const prevPage = this.currentPage - offset
      const nextPage = this.currentPage + offset

      if (prevPage >= 1) {
        pagesToPrerender.push(prevPage)
      }
      if (nextPage <= totalPages) {
        pagesToPrerender.push(nextPage)
      }
    }

    // 并行预渲染
    await Promise.all(
      pagesToPrerender.map(async (pageNum) => {
        try {
          const page = await this.documentManager.getPage(pageNum)
          await this.pageRenderer.prerenderPage(page, this.currentScale, this.currentRotation)
        } catch (error) {
          // 忽略预渲染错误
        }
      })
    )
  }

  /**
   * 加载PDF文档
   */
  async loadDocument(url: string | Uint8Array): Promise<PDFDocumentProxy> {
    this.showLoading('Loading PDF...')
    try {
      const doc = await this.documentManager.loadDocument(url, {
        cMapUrl: this.config.cMapUrl,
        cMapPacked: this.config.cMapPacked
      })
      return doc
    } catch (error) {
      this.hideLoading()
      throw error
    }
  }

  /**
   * 设置渲染模式
   */
  setRenderMode(continuous: boolean): void {
    if (this.continuousMode === continuous) return

    this.continuousMode = continuous

    // 如果已经加载了文档，重新渲染
    if (this.getTotalPages() > 0) {
      if (continuous) {
        this.renderAllPages()
      } else {
        this.goToPage(this.currentPage)
      }
    }
  }

  /**
   * 跳转到指定页
   */
  async goToPage(pageNumber: number): Promise<void> {
    const totalPages = this.getTotalPages()

    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(`Invalid page number: ${pageNumber}. Must be between 1 and ${totalPages}`)
    }

    this.currentPage = pageNumber

    // 获取或创建页面容器
    let pageContainer = this.pageContainers.get(pageNumber)

    if (!pageContainer) {
      pageContainer = document.createElement('div')
      pageContainer.className = 'pdf-page-container'
      pageContainer.dataset.pageNumber = String(pageNumber)
      this.pageContainers.set(pageNumber, pageContainer)
    }

    // 清空查看器内容
    if (this.viewerElement) {
      this.viewerElement.innerHTML = ''
      this.viewerElement.appendChild(pageContainer)
    }

    // 渲染页面
    const page = await this.documentManager.getPage(pageNumber)
    const renderInfo = await this.pageRenderer.renderPage(
      page,
      pageContainer,
      this.currentScale,
      this.currentRotation
    )

    this.emit('page-changed', pageNumber)
    this.emit('page-rendered', renderInfo)

    // 更新工具栏
    this.updateToolbar()

    // 更新缩略图高亮
    this.updateThumbnailHighlight(pageNumber)

    // 预渲染相邻页面
    this.prerenderAdjacentPages()
  }

  /**
   * 更新缩略图高亮
   */
  private updateThumbnailHighlight(pageNumber: number): void {
    if (!this.thumbnailContainer) return

    const thumbnailItems = this.thumbnailContainer.querySelectorAll('.pdf-thumbnail-item')
    thumbnailItems.forEach((item) => {
      const itemPageNum = parseInt(item.getAttribute('data-page-number') || '0')
      if (itemPageNum === pageNumber) {
        item.classList.add('active')
      } else {
        item.classList.remove('active')
      }
    })
  }

  /**
   * 下一页
   */
  async nextPage(): Promise<void> {
    if (this.currentPage < this.getTotalPages()) {
      await this.goToPage(this.currentPage + 1)
    }
  }

  /**
   * 上一页
   */
  async previousPage(): Promise<void> {
    if (this.currentPage > 1) {
      await this.goToPage(this.currentPage - 1)
    }
  }

  /**
   * 设置缩放
   */
  setZoom(zoom: ZoomType): void {
    if (typeof zoom === 'number') {
      this.currentScale = Math.max(0.1, Math.min(5.0, zoom))
    } else {
      switch (zoom) {
        case 'in':
          this.currentScale = Math.min(5.0, this.currentScale * 1.2)
          break
        case 'out':
          this.currentScale = Math.max(0.1, this.currentScale / 1.2)
          break
        case 'fit-width':
          this.currentScale = this.calculateFitWidthScale()
          break
        case 'fit-height':
          this.currentScale = this.calculateFitHeightScale()
          break
        case 'fit-page':
          this.currentScale = this.calculateFitPageScale()
          break
        case 'auto':
          this.currentScale = 1.0
          break
      }
    }

    this.emit('zoom-changed', this.currentScale)
    this.updateToolbar()

    // 重新渲染当前页
    this.goToPage(this.currentPage)
  }

  /**
   * 计算适应宽度的缩放比例
   */
  private calculateFitWidthScale(): number {
    // 简化实现，返回默认值
    return 1.0
  }

  /**
   * 计算适应高度的缩放比例
   */
  private calculateFitHeightScale(): number {
    // 简化实现，返回默认值
    return 1.0
  }

  /**
   * 计算适应页面的缩放比例
   */
  private calculateFitPageScale(): number {
    // 简化实现，返回默认值
    return 1.0
  }

  /**
   * 旋转页面
   */
  rotate(angle: RotationAngle): void {
    this.currentRotation = angle
    this.pageRenderer.setRotation(angle)
    this.emit('rotation-changed', angle)

    // 重新渲染当前页
    this.goToPage(this.currentPage)
  }

  /**
   * 搜索文本
   */
  async search(text: string): Promise<SearchResult[]> {
    return await this.documentManager.searchText(text)
  }

  /**
   * 下载PDF
   */
  download(filename?: string): void {
    if (typeof this.config.url === 'string') {
      const link = document.createElement('a')
      link.href = this.config.url
      link.download = filename || 'document.pdf'
      link.click()
    }
  }

  /**
   * 打印PDF
   */
  print(): void {
    window.print()
  }

  /**
   * 获取当前页码
   */
  getCurrentPage(): number {
    return this.currentPage
  }

  /**
   * 获取总页数
   */
  getTotalPages(): number {
    return this.documentManager.getPageCount()
  }

  /**
   * 获取当前缩放比例
   */
  getCurrentZoom(): number {
    return this.currentScale
  }

  /**
   * 添加事件监听
   */
  on<K extends keyof PDFViewerEvents>(event: K, handler: PDFViewerEvents[K]): void {
    this.documentManager.on(event, handler)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof PDFViewerEvents>(event: K, handler: PDFViewerEvents[K]): void {
    this.documentManager.off(event, handler)
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof PDFViewerEvents>(event: K, ...args: Parameters<PDFViewerEvents[K]>): void {
    this.documentManager.emit(event, ...args)
  }

  /**
   * 销毁查看器
   */
  async destroy(): Promise<void> {
    // 取消所有渲染任务
    this.pageRenderer.destroy()

    // 销毁文档管理器
    await this.documentManager.destroy()

    // 清空容器
    this.container.innerHTML = ''

    // 清理引用
    this.pageContainers.clear()
    this.viewerElement = null
    this.toolbarElement = null
  }
}
