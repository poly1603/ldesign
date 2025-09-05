/**
 * PDF预览器核心类
 * 整合所有功能模块，提供完整的PDF预览功能
 */

import type {
  IPdfViewer,
  PdfInput,
  PdfViewerConfig,
  PdfViewerState,
  PdfDocumentInfo,
  PdfPageInfo,
  ZoomMode,
  RotationAngle,
  SearchOptions,
  SearchResult,
  DownloadOptions,
  PrintOptions,
  RenderOptions,
} from './types'
import { PdfDocumentManager } from './document-manager'
import { PdfPageRenderer } from './page-renderer'
import { EventManager } from './event-manager'

/**
 * PDF预览器实现
 */
export class PdfViewer implements IPdfViewer {
  private documentManager: PdfDocumentManager
  private pageRenderer: PdfPageRenderer
  private eventManager: EventManager
  private config: Required<PdfViewerConfig>
  private state: PdfViewerState

  constructor(config: PdfViewerConfig) {
    // 初始化管理器
    this.documentManager = new PdfDocumentManager()
    this.pageRenderer = new PdfPageRenderer()
    this.eventManager = new EventManager()

    // 设置默认配置
    this.config = {
      initialScale: 1,
      initialPage: 1,
      zoomMode: 'fit-width',
      renderOptions: {},
      enableToolbar: true,
      enableSidebar: true,
      enableSearch: true,
      enableThumbnails: true,
      enableFullscreen: true,
      enableDownload: true,
      enablePrint: true,
      customStyles: {},
      locale: 'zh-CN',
      ...config,
      container: config.container,
    }

    // 初始化状态
    this.state = {
      isDocumentLoaded: false,
      currentPage: this.config.initialPage,
      totalPages: 0,
      currentScale: this.config.initialScale,
      currentZoomMode: this.config.zoomMode,
      currentRotation: 0,
      isLoading: false,
      isFullscreen: false,
      searchState: {
        isSearching: false,
        query: '',
        currentMatch: 0,
        totalMatches: 0,
      },
    }

    // 初始化容器
    this.initializeContainer()
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    const { container } = this.config

    // 设置容器样式
    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.classList.add('ldesign-pdf-viewer')

    // 应用自定义样式
    Object.entries(this.config.customStyles).forEach(([property, value]) => {
      container.style.setProperty(property, value)
    })
  }

  /**
   * 加载PDF文档
   */
  async loadDocument(input: PdfInput): Promise<void> {
    try {
      this.state.isLoading = true
      this.eventManager.emit('loadProgress', 0)

      // 加载文档
      const document = await this.documentManager.loadDocument(input)

      // 更新状态
      this.state.isDocumentLoaded = true
      this.state.totalPages = document.numPages
      this.state.currentPage = Math.min(this.config.initialPage, document.numPages)

      // 获取文档信息
      const documentInfo = await this.documentManager.getDocumentInfo()
      this.eventManager.emit('documentLoaded', documentInfo)

      // 渲染当前页面
      await this.renderCurrentPage()

      this.state.isLoading = false
      this.eventManager.emit('loadProgress', 100)
    }
    catch (error) {
      this.state.isLoading = false
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      this.eventManager.emit('error', errorObj)
      throw errorObj
    }
  }

  /**
   * 跳转到指定页面
   */
  async goToPage(pageNumber: number): Promise<void> {
    if (!this.state.isDocumentLoaded) {
      throw new Error('No document loaded')
    }

    if (pageNumber < 1 || pageNumber > this.state.totalPages) {
      throw new Error(`Invalid page number: ${pageNumber}`)
    }

    if (pageNumber === this.state.currentPage) {
      return
    }

    this.state.currentPage = pageNumber
    await this.renderCurrentPage()

    // 触发页面变化事件
    const pageInfo = await this.getCurrentPageInfo()
    this.eventManager.emit('pageChanged', pageNumber, pageInfo)
  }

  /**
   * 上一页
   */
  async previousPage(): Promise<void> {
    if (this.state.currentPage > 1) {
      await this.goToPage(this.state.currentPage - 1)
    }
  }

  /**
   * 下一页
   */
  async nextPage(): Promise<void> {
    if (this.state.currentPage < this.state.totalPages) {
      await this.goToPage(this.state.currentPage + 1)
    }
  }

  /**
   * 设置缩放比例
   */
  setZoom(scale: number): void {
    if (scale <= 0) {
      throw new Error('Scale must be greater than 0')
    }

    this.state.currentScale = scale
    this.state.currentZoomMode = 'custom'
    this.renderCurrentPage()

    this.eventManager.emit('zoomChanged', scale, 'custom')
  }

  /**
   * 设置缩放模式
   */
  setZoomMode(mode: ZoomMode): void {
    this.state.currentZoomMode = mode

    // 根据模式计算缩放比例
    const scale = this.calculateScaleForMode(mode)
    this.state.currentScale = scale

    this.renderCurrentPage()
    this.eventManager.emit('zoomChanged', scale, mode)
  }

  /**
   * 放大
   */
  zoomIn(): void {
    const newScale = this.state.currentScale * 1.25
    this.setZoom(Math.min(newScale, 5)) // 最大5倍
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    const newScale = this.state.currentScale / 1.25
    this.setZoom(Math.max(newScale, 0.1)) // 最小0.1倍
  }

  /**
   * 旋转页面
   */
  rotate(angle: RotationAngle): void {
    this.state.currentRotation = angle
    this.renderCurrentPage()
    this.eventManager.emit('rotationChanged', angle)
  }

  /**
   * 搜索文本
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.state.isDocumentLoaded) {
      throw new Error('No document loaded')
    }

    this.state.searchState.isSearching = true
    this.state.searchState.query = options.query

    try {
      // 实现搜索逻辑
      const results: SearchResult[] = []
      // TODO: 实现实际的搜索功能

      this.state.searchState.totalMatches = results.length
      this.state.searchState.currentMatch = results.length > 0 ? 1 : 0

      this.eventManager.emit('searchResult', results)
      return results
    }
    finally {
      this.state.searchState.isSearching = false
    }
  }

  /**
   * 进入全屏
   */
  enterFullscreen(): void {
    if (!this.config.enableFullscreen) {
      return
    }

    const container = this.config.container
    if (container.requestFullscreen) {
      container.requestFullscreen()
      this.state.isFullscreen = true
    }
  }

  /**
   * 退出全屏
   */
  exitFullscreen(): void {
    if (document.exitFullscreen && this.state.isFullscreen) {
      document.exitFullscreen()
      this.state.isFullscreen = false
    }
  }

  /**
   * 下载PDF
   */
  download(options: DownloadOptions = {}): void {
    if (!this.config.enableDownload) {
      return
    }

    // TODO: 实现下载功能
    console.log('Download PDF:', options)
  }

  /**
   * 打印PDF
   */
  print(options: PrintOptions = {}): void {
    if (!this.config.enablePrint) {
      return
    }

    // TODO: 实现打印功能
    console.log('Print PDF:', options)
  }

  /**
   * 获取当前状态
   */
  getState(): PdfViewerState {
    return { ...this.state }
  }

  /**
   * 获取文档信息
   */
  getDocumentInfo(): PdfDocumentInfo | null {
    if (!this.state.isDocumentLoaded) {
      return null
    }

    // TODO: 返回缓存的文档信息
    return null
  }

  /**
   * 渲染当前页面
   */
  private async renderCurrentPage(): Promise<void> {
    if (!this.state.isDocumentLoaded) {
      return
    }

    try {
      const page = await this.documentManager.getPage(this.state.currentPage)
      const renderOptions: RenderOptions = {
        scale: this.state.currentScale,
        rotation: this.state.currentRotation,
        ...this.config.renderOptions,
      }

      await this.pageRenderer.renderPage(page, this.config.container, renderOptions)
      this.eventManager.emit('renderComplete', this.state.currentPage)
    }
    catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Render failed')
      this.eventManager.emit('error', errorObj)
    }
  }

  /**
   * 获取当前页面信息
   */
  private async getCurrentPageInfo(): Promise<PdfPageInfo> {
    const page = await this.documentManager.getPage(this.state.currentPage)
    const viewport = page.getViewport({
      scale: this.state.currentScale,
      rotation: this.state.currentRotation,
    })

    return {
      pageNumber: this.state.currentPage,
      width: viewport.width,
      height: viewport.height,
      rotation: this.state.currentRotation,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        scale: this.state.currentScale,
        rotation: this.state.currentRotation,
      },
    }
  }

  /**
   * 根据缩放模式计算缩放比例
   */
  private calculateScaleForMode(mode: ZoomMode): number {
    // TODO: 实现根据容器大小和页面大小计算缩放比例
    switch (mode) {
      case 'fit-width':
        return 1
      case 'fit-page':
        return 1
      case 'auto':
        return 1
      default:
        return this.state.currentScale
    }
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof import('./types').PdfViewerEvents>(
    event: K,
    listener: import('./types').PdfViewerEvents[K]
  ): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof import('./types').PdfViewerEvents>(
    event: K,
    listener: import('./types').PdfViewerEvents[K]
  ): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof import('./types').PdfViewerEvents>(
    event: K,
    listener: import('./types').PdfViewerEvents[K]
  ): void {
    this.eventManager.once(event, listener as any)
  }

  /**
   * 销毁预览器
   */
  destroy(): void {
    this.pageRenderer.cleanup()
    this.documentManager.destroy()
    this.eventManager.destroy()

    // 清理容器
    const container = this.config.container
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    container.classList.remove('ldesign-pdf-viewer')
  }
}
