/**
 * PDF阅读器核心类
 * 基于PDF.js实现的现代化PDF阅读器
 */

import * as pdfjsLib from 'pdfjs-dist'
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
  TextContent,
  GetTextContentParameters
} from 'pdfjs-dist'
import { EventEmitter } from './EventEmitter'
import type {
  PDFReaderOptions,
  PDFReaderEvents,
  PDFReaderState,
  PDFDocumentInfo,
  PDFPageInfo,
  PDFPageRenderOptions,
  PDFSearchOptions,
  PDFSearchResult,
  PDFPageCache,
  PDFReadingMode
} from '../types'
import {
  getElement,
  createElement,
  debounce,
  isValidPageNumber,
  clamp,
  generateId,
  isBrowserSupported,
  getDevicePixelRatio,
  calculateFitScale
} from '../utils'

/**
 * PDF阅读器核心类
 * 提供完整的PDF查看、导航、缩放等功能
 */
export class PDFReader extends EventEmitter<PDFReaderEvents> {
  /** 配置选项 */
  private options: Required<PDFReaderOptions>

  /** 容器元素 */
  private container: HTMLElement

  /** PDF文档代理对象 */
  private pdfDocument: PDFDocumentProxy | null = null

  /** 页面缓存 */
  private pageCache: Map<number, PDFPageCache> = new Map()

  /** 当前状态 */
  private state: PDFReaderState = {
    isLoaded: false,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,
    isLoading: false,
    isSearching: false,
    readingMode: 'single'
  }

  /** 渲染任务队列 */
  private renderTasks: Map<number, RenderTask> = new Map()

  /** 实例ID */
  private readonly instanceId: string

  /** DOM 引用 */
  private thumbnailPanel: HTMLElement | null = null
  private pageArea: HTMLElement | null = null

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: Omit<Required<PDFReaderOptions>, 'container'> = {
    src: '',
    initialPage: 1,
    initialScale: 1.0,
    showToolbar: true,
    showThumbnails: true,
    enableSearch: true,
    enableAnnotations: true,
    readingMode: 'single',
    theme: 'auto',
    className: '',
    workerSrc: ''
  }

  /**
   * 构造函数
   * @param options - 配置选项
   */
  constructor(options: PDFReaderOptions) {
    super()

    // 检查浏览器支持
    if (!isBrowserSupported()) {
      throw new Error('当前浏览器不支持PDF.js')
    }

    this.instanceId = generateId('pdf-reader')

    // 合并配置选项
    this.options = {
      ...PDFReader.DEFAULT_OPTIONS,
      ...options
    } as Required<PDFReaderOptions>

    // 获取容器元素
    this.container = getElement(this.options.container)

    // 初始化PDF.js Worker
    this.initializeWorker()

    // 初始化UI
    this.initializeUI()

    // 如果提供了src，自动加载文档
    if (this.options.src) {
      this.loadDocument(this.options.src).catch(error => {
        this.emit('error', error)
      })
    }
  }

  /**
   * 初始化PDF.js Worker
   * @private
   */
  private initializeWorker(): void {
    if (this.options.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = this.options.workerSrc
    } else {
      // 使用默认的Worker路径
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js'
    }
  }

  /**
   * 初始化UI界面
   * @private
   */
  private initializeUI(): void {
    // 清空容器
    this.container.innerHTML = ''

    // 添加基础样式类
    this.container.classList.add('ldesign-pdf-reader')
    if (this.options.className) {
      this.container.classList.add(this.options.className)
    }

    // 设置主题
    this.container.setAttribute('data-theme', this.options.theme)

    // 创建主要结构
    this.createMainStructure()

    // 绑定事件
    this.bindEvents()
  }

  /**
   * 创建主要UI结构
   * @private
   */
  private createMainStructure(): void {
    const mainContainer = createElement('div', 'pdf-main-container')

    // 创建工具栏
    if (this.options.showToolbar) {
      const toolbar = this.createToolbar()
      mainContainer.appendChild(toolbar)
    }

    // 创建内容区域
    const contentArea = createElement('div', 'pdf-content-area')

    // 创建缩略图面板
    if (this.options.showThumbnails) {
      this.thumbnailPanel = createElement('div', 'pdf-thumbnail-panel')
      this.thumbnailPanel.id = `${this.instanceId}-thumbnail-panel`
      contentArea.appendChild(this.thumbnailPanel)
    }

    // 创建页面显示区域
    this.pageArea = createElement('div', 'pdf-page-area')
    this.pageArea.id = `${this.instanceId}-page-area`
    contentArea.appendChild(this.pageArea)

    mainContainer.appendChild(contentArea)
    this.container.appendChild(mainContainer)
  }

  /**
   * 创建工具栏
   * @private
   * @returns 工具栏元素
   */
  private createToolbar(): HTMLElement {
    const toolbar = createElement('div', 'pdf-toolbar')
    toolbar.id = `${this.instanceId}-toolbar`

    // 导航按钮组
    const navGroup = createElement('div', 'pdf-toolbar-group')

    const prevBtn = createElement('button', 'pdf-btn pdf-btn-prev', {
      title: '上一页',
      'data-action': 'prev-page'
    })
    prevBtn.innerHTML = '◀'

    const nextBtn = createElement('button', 'pdf-btn pdf-btn-next', {
      title: '下一页',
      'data-action': 'next-page'
    })
    nextBtn.innerHTML = '▶'

    const pageInfo = createElement('span', 'pdf-page-info')
    pageInfo.id = `${this.instanceId}-page-info`
    pageInfo.textContent = '0 / 0'

    navGroup.appendChild(prevBtn)
    navGroup.appendChild(pageInfo)
    navGroup.appendChild(nextBtn)

    // 缩放按钮组
    const zoomGroup = createElement('div', 'pdf-toolbar-group')

    const zoomOutBtn = createElement('button', 'pdf-btn pdf-btn-zoom-out', {
      title: '缩小',
      'data-action': 'zoom-out'
    })
    zoomOutBtn.innerHTML = '−'

    const zoomInBtn = createElement('button', 'pdf-btn pdf-btn-zoom-in', {
      title: '放大',
      'data-action': 'zoom-in'
    })
    zoomInBtn.innerHTML = '+'

    const fitWidthBtn = createElement('button', 'pdf-btn pdf-btn-fit-width', {
      title: '适合宽度',
      'data-action': 'fit-width'
    })
    fitWidthBtn.innerHTML = '↔'

    const fitPageBtn = createElement('button', 'pdf-btn pdf-btn-fit-page', {
      title: '适合页面',
      'data-action': 'fit-page'
    })
    fitPageBtn.innerHTML = '▭'

    const scaleInfo = createElement('span', 'pdf-scale-info')
    scaleInfo.id = `${this.instanceId}-scale-info`
    scaleInfo.textContent = '100%'

    zoomGroup.appendChild(zoomOutBtn)
    zoomGroup.appendChild(scaleInfo)
    zoomGroup.appendChild(zoomInBtn)
    zoomGroup.appendChild(fitWidthBtn)
    zoomGroup.appendChild(fitPageBtn)

    // 阅读模式切换
    const modeGroup = createElement('div', 'pdf-toolbar-group')
    const modeToggleBtn = createElement('button', 'pdf-btn pdf-btn-toggle-mode', {
      title: '切换阅读模式',
      'data-action': 'toggle-mode',
      id: `${this.instanceId}-mode-toggle`
    })
    modeToggleBtn.textContent = this.options.readingMode === 'continuous' ? '滚动阅读' : '单页阅读'
    modeGroup.appendChild(modeToggleBtn)

    toolbar.appendChild(navGroup)
    toolbar.appendChild(zoomGroup)
    toolbar.appendChild(modeGroup)

    return toolbar
  }

  /**
   * 绑定事件监听器
   * @private
   */
  private bindEvents(): void {
    // 工具栏按钮事件
    this.container.addEventListener('click', this.handleToolbarClick.bind(this))

    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this))

    // 窗口大小变化事件
    window.addEventListener('resize', debounce(this.handleResize.bind(this), 300))
  }

  /**
   * 处理工具栏点击事件
   * @private
   * @param event - 点击事件
   */
  private handleToolbarClick(event: Event): void {
    const target = event.target as HTMLElement
    const action = target.getAttribute('data-action')

    if (!action) return

    switch (action) {
      case 'prev-page':
        this.previousPage()
        break
      case 'next-page':
        this.nextPage()
        break
      case 'zoom-in':
        this.zoomIn()
        break
      case 'zoom-out':
        this.zoomOut()
        break
      case 'fit-width':
        this.fitWidth()
        break
      case 'fit-page':
        this.fitPage()
        break
      case 'toggle-mode':
        this.setReadingMode(this.state.readingMode === 'single' ? 'continuous' : 'single')
        break
    }
  }

  /**
   * 处理键盘事件
   * @private
   * @param event - 键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 只在容器获得焦点时处理键盘事件
    if (!this.container.contains(document.activeElement)) return

    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault()
        this.previousPage()
        break
      case 'ArrowRight':
      case 'PageDown':
        event.preventDefault()
        this.nextPage()
        break
      case 'Home':
        event.preventDefault()
        this.goToPage(1)
        break
      case 'End':
        event.preventDefault()
        this.goToPage(this.state.totalPages)
        break
      case '+':
      case '=':
        if (event.ctrlKey) {
          event.preventDefault()
          this.zoomIn()
        }
        break
      case '-':
        if (event.ctrlKey) {
          event.preventDefault()
          this.zoomOut()
        }
        break
    }
  }

  /**
   * 处理窗口大小变化事件
   * @private
   */
  private handleResize(): void {
    if (this.state.isLoaded) {
      this.rerenderCurrentPage()
    }
  }

  /**
   * 加载PDF文档
   * @param src - PDF文件URL或ArrayBuffer
   * @returns Promise
   */
  async loadDocument(src?: string | ArrayBuffer | Uint8Array): Promise<void> {
    const source = src || this.options.src
    if (!source) {
      throw new Error('未提供PDF文件源')
    }

    this.state.isLoading = true
    this.emit('loading-progress', 0)

    try {
      // 加载PDF文档
      const loadingTask = pdfjsLib.getDocument(source)

      // 监听加载进度
      loadingTask.onProgress = (progress) => {
        const percent = progress.loaded / progress.total
        this.emit('loading-progress', percent)
      }

      this.pdfDocument = await loadingTask.promise

      // 更新状态
      this.state.isLoaded = true
      this.state.totalPages = this.pdfDocument.numPages
      this.state.currentPage = clamp(this.options.initialPage, 1, this.state.totalPages)
      this.state.scale = this.options.initialScale
      this.state.isLoading = false
      this.state.readingMode = this.options.readingMode

      // 获取文档信息
      const documentInfo = await this.getDocumentInfo()

      // 渲染缩略图
      if (this.options.showThumbnails) {
        await this.renderThumbnails()
      }

      // 渲染页面（根据阅读模式）
      if (this.state.readingMode === 'continuous') {
        await this.renderAllPages()
        this.scrollToPageCanvas(this.state.currentPage)
      } else {
        await this.renderPage(this.state.currentPage)
      }

      // 更新UI
      this.updateUI()

      // 触发文档加载完成事件
      this.emit('document-loaded', documentInfo!)
      this.emit('loading-progress', 1)

    } catch (error) {
      this.state.isLoading = false
      this.emit('error', error as any)
      throw error
    }
  }

  /**
   * 获取文档信息
   * @returns 文档信息
   */
  async getDocumentInfo(): Promise<PDFDocumentInfo | null> {
    if (!this.pdfDocument) return null

    try {
      const metadata = await this.pdfDocument.getMetadata()
      const info = metadata.info

      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        subject: info.Subject || undefined,
        keywords: info.Keywords || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
        numPages: this.pdfDocument.numPages,
        pdfFormatVersion: this.pdfDocument.pdfInfo?.PDFFormatVersion
      }
    } catch (error) {
      console.warn('获取文档信息失败:', error)
      return {
        numPages: this.pdfDocument.numPages
      }
    }
  }

  /**
   * 更新UI显示
   * @private
   */
  private updateUI(): void {
    // 更新页面信息
    const pageInfo = document.getElementById(`${this.instanceId}-page-info`)
    if (pageInfo) {
      pageInfo.textContent = `${this.state.currentPage} / ${this.state.totalPages}`
    }

    // 更新缩放信息
    const scaleInfo = document.getElementById(`${this.instanceId}-scale-info`)
    if (scaleInfo) {
      scaleInfo.textContent = `${Math.round(this.state.scale * 100)}%`
    }

    // 更新阅读模式切换按钮文本
    const modeToggle = document.getElementById(`${this.instanceId}-mode-toggle`)
    if (modeToggle) {
      modeToggle.textContent = this.state.readingMode === 'continuous' ? '滚动阅读' : '单页阅读'
    }

    // 更新缩略图高亮
    this.updateActiveThumbnail()
  }

  /**
   * 渲染指定页面
   * @param pageNumber - 页码
   * @param options - 渲染选项
   * @returns Promise
   */
  async renderPage(pageNumber: number, options?: Partial<PDFPageRenderOptions>): Promise<void> {
    if (!this.pdfDocument || !isValidPageNumber(pageNumber, this.state.totalPages)) {
      throw new Error(`无效的页码: ${pageNumber}`)
    }

    // 如果是单页阅读模式，先清空页面区域
    if (this.state.readingMode === 'single' && this.pageArea) {
      this.pageArea.innerHTML = ''
    }

    // 取消之前的渲染任务
    const existingTask = this.renderTasks.get(pageNumber)
    if (existingTask) {
      existingTask.cancel()
      this.renderTasks.delete(pageNumber)
    }

    try {
      // 获取页面
      const page = await this.pdfDocument.getPage(pageNumber)

      // 计算渲染参数
      const scale = options?.scale || this.state.scale
      const rotation = options?.rotation || 0
      const viewport = page.getViewport({ scale, rotation })

      // 创建或获取Canvas
      const canvas = this.getOrCreateCanvas(pageNumber)
      const context = canvas.getContext('2d')!

      // 设置Canvas尺寸
      const devicePixelRatio = getDevicePixelRatio()
      canvas.width = viewport.width * devicePixelRatio
      canvas.height = viewport.height * devicePixelRatio
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`

      // 缩放上下文以适应设备像素比
      context.scale(devicePixelRatio, devicePixelRatio)

      // 渲染页面
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      const renderTask = page.render(renderContext)
      this.renderTasks.set(pageNumber, renderTask)

      await renderTask.promise

      // 缓存页面信息
      this.pageCache.set(pageNumber, {
        page,
        canvas,
        renderTask
      })

      // 清理渲染任务
      this.renderTasks.delete(pageNumber)

    } catch (error) {
      this.renderTasks.delete(pageNumber)
      this.emit('error', error as any)
      throw error
    }
  }

  /**
   * 获取或创建Canvas元素
   * @private
   * @param pageNumber - 页码
   * @returns Canvas元素
   */
  private getOrCreateCanvas(pageNumber: number): HTMLCanvasElement {
    const pageArea = this.pageArea || document.getElementById(`${this.instanceId}-page-area`)!
    const canvasId = `${this.instanceId}-canvas-${pageNumber}`

    let canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) {
      canvas = createElement('canvas', 'pdf-page-canvas', { id: canvasId })
      pageArea.appendChild(canvas)
    }

    return canvas
  }

  /**
   * 重新渲染当前页面
   * @private
   */
  private async rerenderCurrentPage(): Promise<void> {
    if (this.state.isLoaded) {
      await this.renderPage(this.state.currentPage)
    }
  }

  /**
   * 跳转到指定页面
   * @param pageNumber - 页码
   * @returns Promise
   */
  async goToPage(pageNumber: number): Promise<void> {
    if (!isValidPageNumber(pageNumber, this.state.totalPages)) {
      throw new Error(`无效的页码: ${pageNumber}`)
    }

    if (pageNumber === this.state.currentPage) return

    this.state.currentPage = pageNumber

    if (this.state.readingMode === 'continuous') {
      // 连续模式下，滚动到该页
      this.scrollToPageCanvas(pageNumber)
    } else {
      await this.renderPage(pageNumber)
    }

    this.updateUI()
    this.emit('page-changed', pageNumber)
  }

  /**
   * 上一页
   * @returns Promise
   */
  async previousPage(): Promise<void> {
    if (this.state.currentPage > 1) {
      await this.goToPage(this.state.currentPage - 1)
    }
  }

  /**
   * 下一页
   * @returns Promise
   */
  async nextPage(): Promise<void> {
    if (this.state.currentPage < this.state.totalPages) {
      await this.goToPage(this.state.currentPage + 1)
    }
  }

  /**
   * 设置缩放比例
   * @param scale - 缩放比例
   */
  setScale(scale: number): void {
    const newScale = clamp(scale, 0.1, 5.0)
    if (newScale === this.state.scale) return

    this.state.scale = newScale
    this.rerenderCurrentPage()
    this.updateUI()
    this.emit('scale-changed', newScale)
  }

  /**
   * 放大
   */
  zoomIn(): void {
    this.setScale(this.state.scale * 1.2)
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    this.setScale(this.state.scale / 1.2)
  }

  /**
   * 适合宽度
   */
  fitWidth(): void {
    if (!this.pdfDocument || !this.pageArea) return

    // 基于当前页尺寸计算适合宽度的缩放比例
    void this.pdfDocument.getPage(this.state.currentPage).then(page => {
      const viewport = page.getViewport({ scale: 1.0 })
      const containerWidth = this.pageArea!.clientWidth
      const scale = clamp(containerWidth / viewport.width, 0.1, 5.0)
      this.setScale(scale)
    })
  }

  /**
   * 适合页面
   */
  fitPage(): void {
    if (!this.pdfDocument || !this.pageArea) return

    // 基于当前页尺寸计算适合容器的缩放比例（宽高中取小）
    void this.pdfDocument.getPage(this.state.currentPage).then(page => {
      const viewport = page.getViewport({ scale: 1.0 })
      const containerRect = this.pageArea!.getBoundingClientRect()
      const scale = clamp(
        calculateFitScale(containerRect.width, containerRect.height, viewport.width, viewport.height, 20),
        0.1,
        5.0
      )
      this.setScale(scale)
    })
  }

  /**
   * 搜索文本
   * @param query - 搜索关键词
   * @param options - 搜索选项
   * @returns 搜索结果
   */
  async search(query: string, options?: PDFSearchOptions): Promise<PDFSearchResult[]> {
    if (!this.pdfDocument || !query.trim()) {
      return []
    }

    this.state.isSearching = true
    const results: PDFSearchResult[] = []

    try {
      const searchOptions = {
        caseSensitive: false,
        wholeWords: false,
        direction: 'forward' as const,
        startPage: 1,
        ...options
      }

      const startPage = searchOptions.startPage
      const endPage = this.state.totalPages

      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const page = await this.pdfDocument.getPage(pageNum)
        const textContent = await page.getTextContent()

        // 搜索文本内容
        const pageText = textContent.items
          .filter(item => 'str' in item)
          .map(item => (item as any).str)
          .join(' ')

        // 执行搜索
        const searchRegex = new RegExp(
          searchOptions.wholeWords ? `\\b${query}\\b` : query,
          searchOptions.caseSensitive ? 'g' : 'gi'
        )

        let match
        const matches: PDFSearchResult['matches'] = []

        while ((match = searchRegex.exec(pageText)) !== null) {
          matches.push({
            begin: match.index,
            end: match.index + match[0].length,
            rect: [0, 0, 0, 0] // 这里需要计算实际的边界框
          })
        }

        if (matches.length > 0) {
          results.push({
            pageNumber: pageNum,
            text: pageText,
            matches
          })
        }
      }

      this.emit('search-results', results)
      return results

    } finally {
      this.state.isSearching = false
    }
  }

  /**
   * 获取当前状态
   * @returns 当前状态
   */
  getState(): PDFReaderState {
    return { ...this.state }
  }

  /**
   * 切换/设置阅读模式
   * @param mode - 阅读模式
   */
  setReadingMode(mode: PDFReadingMode): void {
    if (this.state.readingMode === mode) return
    this.state.readingMode = mode
    this.options.readingMode = mode

    if (!this.state.isLoaded) return

    if (mode === 'continuous') {
      // 渲染所有页面并滚动到当前页
      void this.renderAllPages().then(() => this.scrollToPageCanvas(this.state.currentPage))
    } else {
      // 仅渲染当前页
      void this.renderPage(this.state.currentPage)
    }

    this.updateUI()
  }

  /**
   * 渲染所有页面（连续模式）
   */
  private async renderAllPages(): Promise<void> {
    if (!this.pdfDocument) return
    if (this.pageArea) this.pageArea.innerHTML = ''
    for (let num = 1; num <= this.state.totalPages; num++) {
      await this.renderPage(num)
    }
  }

  /**
   * 渲染缩略图
   */
  private async renderThumbnails(): Promise<void> {
    if (!this.pdfDocument || !this.thumbnailPanel) return

    this.thumbnailPanel.innerHTML = ''

    for (let num = 1; num <= this.state.totalPages; num++) {
      try {
        const page = await this.pdfDocument.getPage(num)
        const viewport = page.getViewport({ scale: 0.25 })

        const item = createElement('div', 'pdf-thumbnail-item', { 'data-page-number': String(num) })
        const canvas = createElement('canvas', 'pdf-thumbnail-canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!

        const dpr = getDevicePixelRatio()
        canvas.width = viewport.width * dpr
        canvas.height = viewport.height * dpr
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        ctx.scale(dpr, dpr)

        await page.render({ canvasContext: ctx, viewport }).promise

        const label = createElement('div', 'pdf-thumbnail-label')
        label.textContent = `${num}`

        item.appendChild(canvas)
        item.appendChild(label)

        item.addEventListener('click', () => {
          void this.goToPage(num)
        })

        this.thumbnailPanel.appendChild(item)
      } catch (e) {
        // 忽略单页失败
        console.warn(`缩略图渲染失败: 第${num}页`, e)
      }
    }

    this.updateActiveThumbnail()
  }

  /**
   * 更新缩略图高亮并滚动到可视区域
   */
  private updateActiveThumbnail(): void {
    if (!this.thumbnailPanel) return
    const items = this.thumbnailPanel.querySelectorAll('.pdf-thumbnail-item')
    items.forEach((el) => el.classList.remove('active'))
    const active = this.thumbnailPanel.querySelector(`.pdf-thumbnail-item[data-page-number="${this.state.currentPage}"]`) as HTMLElement | null
    if (active) {
      active.classList.add('active')
      // 确保缩略图面板独立滚动到可见区域
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  /**
   * 将指定页的画布滚动到视口中（连续模式）
   */
  private scrollToPageCanvas(pageNumber: number): void {
    const canvas = document.getElementById(`${this.instanceId}-canvas-${pageNumber}`)
    if (canvas && this.pageArea) {
      canvas.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (this.state.readingMode === 'single') {
      void this.renderPage(pageNumber)
    }
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    // 取消所有渲染任务
    this.renderTasks.forEach(task => task.cancel())
    this.renderTasks.clear()

    // 清理页面缓存
    this.pageCache.clear()

    // 关闭PDF文档
    if (this.pdfDocument) {
      this.pdfDocument.destroy()
      this.pdfDocument = null
    }

    // 移除事件监听器
    this.removeAllListeners()

    // 清空容器
    this.container.innerHTML = ''
    this.container.classList.remove('ldesign-pdf-reader')

    // 重置状态
    this.state = {
      isLoaded: false,
      currentPage: 1,
      totalPages: 0,
      scale: 1.0,
      isLoading: false,
      isSearching: false,
      readingMode: 'single'
    }
  }
}
