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
  HeightMode,
  ViewerMode,
  PageRenderInfo,
} from './types'
import { PdfDocumentManager } from './document-manager'
import { PdfPageRenderer } from './page-renderer'
import { EventManager } from './event-manager'
import { getFileNameFromUrl } from '../utils/file-utils'
import { parsePageRange } from '../utils/pdf-utils'

/**
 * PDF预览器实现
 */
export class PdfViewer implements IPdfViewer {
  private documentManager: PdfDocumentManager
  private pageRenderer: PdfPageRenderer
  private eventManager: EventManager
  private config: PdfViewerConfig
  private state: PdfViewerState
  private lastSearchResults: import('./types').SearchResult[] = []
  private lastDocumentInfo: PdfDocumentInfo | null = null
  private currentDocumentId: string | null = null

  constructor(config: PdfViewerConfig) {
    // 初始化管理器
    this.documentManager = new PdfDocumentManager({ workerSrc: config.workerSrc, workerPort: config.workerPort as any, workerModule: config.workerModule as any })
    this.pageRenderer = new PdfPageRenderer()
    this.eventManager = new EventManager()

    // 设置默认配置
    this.config = {
      initialScale: 1,
      initialPage: 1,
      zoomMode: 'fit-width',
      renderMode: 'single-page',
      heightMode: 'auto',
      renderOptions: {},
      multiPageOptions: {
        pageSpacing: 20,
        enableVirtualScroll: false,
        visibleBuffer: 2,
      },
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
      currentPage: this.config.initialPage ?? 1,
      totalPages: 0,
      currentScale: this.config.initialScale ?? 1,
      currentZoomMode: this.config.zoomMode ?? 'fit-width',
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
    if (this.config.customStyles) {
      Object.entries(this.config.customStyles).forEach(([property, value]) => {
        container.style.setProperty(property, value)
      })
    }
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

      // 清理上一文档的渲染缓存
      const newDocId = this.documentManager.getDocumentId()
      if (this.currentDocumentId && this.currentDocumentId !== newDocId) {
        this.pageRenderer.clearCacheForDocument(this.currentDocumentId)
      }
      this.currentDocumentId = newDocId || null

      // 更新状态
      this.state.isDocumentLoaded = true
      this.state.totalPages = document.numPages
      this.state.currentPage = Math.min(this.config.initialPage ?? 1, document.numPages)

      // 获取文档信息
      const documentInfo = await this.documentManager.getDocumentInfo()
      this.lastDocumentInfo = documentInfo
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
   * 搜索文本（基础实现：逐页遍历 textContent）
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    if (!this.state.isDocumentLoaded) {
      throw new Error('No document loaded')
    }

    const queryRaw = options.query || ''
    const query = options.caseSensitive ? queryRaw : queryRaw.toLowerCase()
    if (!query.trim()) return []

    this.state.searchState.isSearching = true
    this.state.searchState.query = options.query

    const results: SearchResult[] = []

    try {
      for (let pageNumber = 1; pageNumber <= this.state.totalPages; pageNumber++) {
        const page = await this.documentManager.getPage(pageNumber)
        const viewport = page.getViewport({
          scale: this.state.currentScale,
          rotation: this.state.currentRotation,
        })
        const textContent: any = await page.getTextContent()

        for (const item of textContent.items) {
          const text: string = String(item.str ?? '')
          const haystack = options.caseSensitive ? text : text.toLowerCase()

          // 简单匹配（可选全词）
          let indices: number[] = []
          if (options.wholeWords) {
            const pattern = new RegExp(`(^|\b)${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\b|$)`, options.caseSensitive ? 'g' : 'gi')
            let m: RegExpExecArray | null
            while ((m = pattern.exec(text)) !== null) {
              indices.push(m.index)
            }
          } else {
            let idx = haystack.indexOf(query)
            while (idx !== -1) {
              indices.push(idx)
              idx = haystack.indexOf(query, idx + 1)
            }
          }

          if (indices.length === 0) continue

          // 估算位置（简化版，根据 item.transform 与字体大小估算）
          const [a, , , d, e, f] = item.transform || [1, 0, 0, 1, 0, 0]
          const fontSize = Math.abs(a || 12)
          const x = (e || 0)
          const y = viewport.height - (f || 0)
          const widthPerChar = fontSize * 0.6

          indices.forEach((start, indexInItem) => {
            const width = widthPerChar * queryRaw.length
            const height = fontSize
            results.push({
              pageNumber,
              text,
              position: { x: x + start * widthPerChar, y: y - height, width, height },
              matchIndex: indexInItem,
              totalMatches: indices.length,
            })
          })
        }
      }

      this.state.searchState.totalMatches = results.length
      this.state.searchState.currentMatch = results.length > 0 ? 1 : 0
      this.eventManager.emit('searchResult', results)

      // 保存并应用高亮
      this.lastSearchResults = results
      this.pageRenderer.updateHighlightsForAll(this.config.container, results)
      return results
    } finally {
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

  // 便捷方法补充
  getCurrentPage(): number { return this.state.currentPage }
  getTotalPages(): number { return this.state.totalPages }
  getScale(): number { return this.state.currentScale }
  getRotation(): RotationAngle { return this.state.currentRotation }
  isFullscreen(): boolean { return this.state.isFullscreen }
  fitToWidth(): void { this.setZoomMode('fit-width') }
  fitToPage(): void { this.setZoomMode('fit-page') }
  clearSearchHighlights(): void { this.lastSearchResults = []; this.pageRenderer.clearAllHighlights(this.config.container) }

  /**
   * 下载PDF
   */
  async download(options: DownloadOptions = {}): Promise<void> {
    if (!this.config.enableDownload) {
      return
    }

    try {
      const data = this.documentManager.getOriginalData()
      let blobUrl: string | null = null

      // 生成默认文件名：Title -> URL 文件名 -> document.pdf
      const defaultName = this.lastDocumentInfo?.title
        || (typeof data === 'string' ? getFileNameFromUrl(data) : 'document.pdf')
      const filename = options.filename || defaultName

      if (typeof data === 'string') {
        // URL 源：如需保存副本则尝试fetch后生成Blob，否则直接跳转下载
        if (options.saveAsCopy) {
          try {
            const resp = await fetch(data, { mode: 'cors' as RequestMode })
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
            const buf = await resp.arrayBuffer()
            blobUrl = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }))
          } catch (e) {
            // CORS 等失败场景，回退为直接下载 URL（可能被浏览器拦截为新标签打开）
            blobUrl = data
          }
        } else {
          blobUrl = data
        }
      } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        const buf = data instanceof Uint8Array ? data.slice().buffer : data
        blobUrl = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }))
      }

      if (!blobUrl) return

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      if (blobUrl.startsWith('blob:')) {
        setTimeout(() => URL.revokeObjectURL(blobUrl!), 2000)
      }
    } catch (error) {
      this.eventManager.emit('error', error as Error)
    }
  }

  /**
   * 打印PDF
   */
  async print(options: PrintOptions = {}): Promise<void> {
    if (!this.config.enablePrint) {
      return
    }

    const needsCustomPipeline = Boolean(options.pageRange) || Boolean(options.fitToPage) || Boolean(options.quality && options.quality !== 'normal')

    try {
      if (!needsCustomPipeline) {
        // 默认：走浏览器内置 PDF 打印
        const data = this.documentManager.getOriginalData()
        let url: string | null = null
        if (typeof data === 'string') url = data
        else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
          const buf = data instanceof Uint8Array ? data.slice().buffer : data
          url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }))
        }
        if (!url) return
        const printWindow = window.open(url)
        if (printWindow) {
          const onLoad = () => {
            try { printWindow.focus(); printWindow.print() } finally {
              if (url!.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(url!), 2000)
              printWindow.close()
            }
          }
          if (printWindow.document?.readyState === 'complete') onLoad()
          else printWindow.addEventListener('load', onLoad, { once: true })
        }
        return
      }

      // 自定义打印：按页渲染为 Canvas 并打印
      const doc = await this.documentManager.getDocument()
      if (!doc) throw new Error('No document loaded')

      const total = doc.numPages
      const pages = options.pageRange ? parsePageRange(options.pageRange, total) : Array.from({ length: total }, (_, i) => i + 1)
      if (!pages.length) pages.push(this.state.currentPage)

      const quality = options.quality || 'normal'
      const scaleMap: Record<string, number> = { draft: 1, normal: 2, high: 3 }
      const baseScale = scaleMap[quality] ?? 2

      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      // 基础样式：去边距，按页分页
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>
  @page { margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page { page-break-after: always; display: flex; justify-content: center; align-items: center; }
  canvas { display: block; ${options.fitToPage ? 'width: 100%; height: auto;' : ''} }
</style>
</head><body></body></html>`)

      // 渲染所选页
      for (const p of pages) {
        const page = await doc.getPage(p)
        // 以当前缩放为基准，叠加质量倍数，尽量保证打印清晰
        const scale = (this.state.currentScale || 1) * baseScale * (window.devicePixelRatio || 1)
        const viewport = page.getViewport({ scale, rotation: this.state.currentRotation })

        const wrapper = printWindow.document.createElement('div')
        wrapper.className = 'page'
        const canvas = printWindow.document.createElement('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        canvas.width = viewport.width
        canvas.height = viewport.height
        if (!options.fitToPage) {
          canvas.style.width = `${viewport.width}px`
          canvas.style.height = `${viewport.height}px`
        }
        wrapper.appendChild(canvas)
        printWindow.document.body.appendChild(wrapper)

        await page.render({ canvasContext: ctx, viewport }).promise
      }

      // 打印并关闭
      const doPrint = () => { try { printWindow.focus(); printWindow.print() } finally { printWindow.close() } }
      if (printWindow.document?.readyState === 'complete') doPrint()
      else printWindow.addEventListener('load', doPrint, { once: true })
    } catch (error) {
      this.eventManager.emit('error', error as Error)
    }
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
  async getDocumentInfo(): Promise<PdfDocumentInfo | null> {
    if (!this.state.isDocumentLoaded) {
      return null
    }

    return await this.documentManager.getDocumentInfo()
  }

  /**
   * 获取PDF文档对象
   */
  async getDocument(): Promise<any> {
    return this.documentManager.getDocument()
  }

  /**
   * 渲染当前页面
   */
  private async renderCurrentPage(): Promise<void> {
    if (!this.state.isDocumentLoaded) {
      return
    }

    try {
      if (this.config.renderMode === 'multi-page') {
        await this.renderAllPages()
      } else {
        await this.renderSinglePage()
      }
    }
    catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Render failed')
      this.eventManager.emit('error', errorObj)
    }
  }

  /**
   * 渲染单页模式
   */
  private async renderSinglePage(): Promise<void> {
    const page = await this.documentManager.getPage(this.state.currentPage)
    const renderOptions: RenderOptions = {
      scale: this.state.currentScale,
      rotation: this.state.currentRotation,
      documentId: this.documentManager.getDocumentId() || undefined,
      ...this.config.renderOptions,
    }

    await this.pageRenderer.renderPage(page, this.config.container, renderOptions)
    this.eventManager.emit('renderComplete', this.state.currentPage)
    // 渲染后更新高亮（单页模式）
    if (this.lastSearchResults.length) {
      this.pageRenderer.updateHighlightsForAll(this.config.container, this.lastSearchResults)
    }
    // 预加载后续页面以提升翻页体验
    const buffer = this.config.multiPageOptions?.visibleBuffer ?? 2
    await this.documentManager.preloadPages(this.state.currentPage + 1, this.state.currentPage + buffer)
  }

  /**
   * 渲染多页模式
   */
  private async renderAllPages(): Promise<void> {
    const getPage = (pageNumber: number) => this.documentManager.getPage(pageNumber)
    const multiPageOptions = {
      scale: this.state.currentScale,
      rotation: this.state.currentRotation,
      documentId: this.documentManager.getDocumentId() || undefined,
      ...this.config.renderOptions,
      ...this.config.multiPageOptions,
    }

    const pageInfos = await this.pageRenderer.renderAllPages(
      getPage,
      this.state.totalPages,
      this.config.container,
      multiPageOptions
    )

    this.eventManager.emit('renderComplete', this.state.currentPage)
    this.eventManager.emit('allPagesRendered', pageInfos)
    // 渲染后更新高亮（多页模式）
    if (this.lastSearchResults.length) {
      this.pageRenderer.updateHighlightsForAll(this.config.container, this.lastSearchResults)
    }
  }

  /**
   * 获取页面渲染信息
   */
  getPageRenderInfos(): PageRenderInfo[] {
    return this.pageRenderer.getPageRenderInfos(this.config.container)
  }

  /**
   * 计算可见页面
   */
  calculateVisiblePages(scrollTop: number, containerHeight: number): { currentPage: number; visiblePages: number[] } {
    return this.pageRenderer.calculateVisiblePages(this.config.container, scrollTop, containerHeight)
  }

  /** 更新可见页面（虚拟滚动按需渲染/回收） */
  updateVisiblePages(scrollTop: number, containerHeight: number): void {
    const options = {
      ...this.config.renderOptions,
      ...this.config.multiPageOptions,
      scale: this.state.currentScale,
      rotation: this.state.currentRotation,
      documentId: this.documentManager.getDocumentId() || undefined,
    }
    void this.pageRenderer.updateVisiblePages(this.config.container, scrollTop, containerHeight, options as any)
      .then(() => {
        if (this.lastSearchResults.length) {
          // 下一帧更新高亮，确保Canvas等节点已就绪
          requestAnimationFrame(() => this.pageRenderer.updateHighlightsForAll(this.config.container, this.lastSearchResults))
        }
      })
  }

  /**
   * 获取页面滚动位置
   */
  getPageScrollPosition(pageNumber: number): number {
    return this.pageRenderer.getPageScrollPosition(this.config.container, pageNumber)
  }

  /**
   * 设置渲染模式
   */
  setRenderMode(mode: ViewerMode): void {
    if (this.config.renderMode !== mode) {
      this.config.renderMode = mode
      this.renderCurrentPage()
    }
  }

  /**
   * 设置高度模式
   */
  setHeightMode(mode: HeightMode, customHeight?: string | number): void {
    this.config.heightMode = mode
    if (customHeight !== undefined) {
      this.config.customHeight = customHeight
    }

    // 根据高度模式自动设置渲染模式，并默认启用虚拟滚动（固定高度更适合多页+虚拟化）
    if (mode === 'auto') {
      this.setRenderMode('single-page')
    } else {
      // 开启多页+虚拟滚动
      this.config.multiPageOptions = {
        pageSpacing: 20,
        visibleBuffer: 2,
        enableVirtualScroll: true,
        ...this.config.multiPageOptions,
      }
      this.setRenderMode('multi-page')
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
   * 根据缩放模式计算缩放比例（同步、基于当前渲染的DOM信息估算）
   */
  private calculateScaleForMode(mode: ZoomMode): number {
    const container = this.config.container
    const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
    const containerWidth = container.clientWidth || 0
    const containerHeight = container.clientHeight || 0

    if (!canvas || containerWidth === 0) {
      // 无法获取有效参考时，保持现有缩放比例
      return this.state.currentScale
    }

    const parsePx = (v: string | null): number => (v && v.endsWith('px')) ? parseFloat(v) : NaN
    const styledWidth = parsePx(canvas.style.width) || canvas.width
    const styledHeight = parsePx(canvas.style.height) || canvas.height

    const currentScale = this.state.currentScale
    const widthScale = styledWidth ? (containerWidth / styledWidth) * currentScale : currentScale
    // 计算高度基准：custom 模式使用容器高度，auto 模式退化为按宽度适配
    const effectiveHeight = this.config.heightMode === 'custom'
      ? (containerHeight || (typeof this.config.customHeight === 'number' ? this.config.customHeight : 0))
      : 0
    const heightScale = (this.config.heightMode === 'custom' && styledHeight)
      ? (effectiveHeight / styledHeight) * currentScale
      : widthScale

    const clamp = (n: number) => Math.max(0.1, Math.min(5, n))

    switch (mode) {
      case 'fit-width':
        return clamp(widthScale)
      case 'fit-page':
        return clamp(Math.min(widthScale, heightScale))
      case 'auto':
        return this.config.heightMode === 'custom'
          ? clamp(Math.min(widthScale, heightScale))
          : clamp(widthScale)
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
