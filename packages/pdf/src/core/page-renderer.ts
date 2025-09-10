/**
 * PDF页面渲染器
 * 负责将PDF页面渲染到DOM元素中
 */

import type { PDFPageProxy } from 'pdfjs-dist'
import type { IPdfPageRenderer, RenderOptions, RotationAngle, PageRenderInfo } from './types'
import { RenderCacheManager } from '../utils/cache-manager'

/**
 * 多页渲染选项
 */
export interface MultiPageRenderOptions extends RenderOptions {
  /** 页面间距 */
  pageSpacing?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScroll?: boolean
  /** 可见页面缓冲区大小（以页为单位） */
  visibleBuffer?: number
}

/**
 * PDF页面渲染器实现
 */
export class PdfPageRenderer implements IPdfPageRenderer {
  private renderTasks = new Map<HTMLElement, any>()
  private textLayers = new Map<HTMLElement, HTMLElement>()
  private highlightLayers = new Map<HTMLElement, HTMLElement>()
  private pageRenderInfos = new Map<HTMLElement, PageRenderInfo[]>()
  private getPageFns = new Map<HTMLElement, (pageNumber: number) => Promise<PDFPageProxy>>()
  private multiPageOpts = new Map<HTMLElement, MultiPageRenderOptions>()
  private renderCache = new RenderCacheManager()

  /**
   * 渲染PDF页面
   */
  async renderPage(
    page: PDFPageProxy,
    container: HTMLElement,
    options: RenderOptions = {}
  ): Promise<void> {
    try {
      // 取消之前的渲染任务
      await this.cancelRenderTask(container)

      // 清理容器
      this.cleanupContainer(container)

      // 设置默认选项
      const renderOptions = {
        mode: 'canvas' as const,
        scale: 1,
        rotation: 0 as RotationAngle,
        enableTextSelection: true,
        enableAnnotations: true,
        backgroundColor: '#ffffff',
        useHighQuality: true,
        ...options,
      }

      // 获取页面视口
      const viewport = page.getViewport({
        scale: renderOptions.scale,
        rotation: renderOptions.rotation,
      })

      // 根据渲染模式选择渲染方法
      switch (renderOptions.mode) {
        case 'canvas':
          await this.renderToCanvas(page, container, viewport, renderOptions)
          break
        case 'svg':
          await this.renderToSvg(page, container, viewport, renderOptions)
          break
        case 'text':
          await this.renderTextOnly(page, container, viewport, renderOptions)
          break
        default:
          throw new Error(`Unsupported render mode: ${renderOptions.mode}`)
      }

      // 渲染文本层（如果启用）
      if (renderOptions.enableTextSelection && renderOptions.mode !== 'text') {
        await this.renderTextLayer(page, container, viewport)
      }

      // 渲染注释层（如果启用）
      if (renderOptions.enableAnnotations) {
        await this.renderAnnotationLayer(page, container, viewport)
      }
    }
    catch (error) {
      throw new Error(`Failed to render page: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 渲染所有页面（多页模式）
   */
  async renderAllPages(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    totalPages: number,
    container: HTMLElement,
    options: MultiPageRenderOptions = {}
  ): Promise<PageRenderInfo[]> {
    try {
      // 取消之前的渲染任务
      await this.cancelRenderTask(container)

      // 清理容器
      this.cleanupContainer(container)

      // 设置默认选项
      const renderOptions = {
        mode: 'canvas' as const,
        scale: 1,
        rotation: 0 as RotationAngle,
        enableTextSelection: true,
        enableAnnotations: true,
        backgroundColor: '#ffffff',
        useHighQuality: true,
        pageSpacing: 20,
        enableVirtualScroll: false,
        visibleBuffer: 2,
        ...options,
      }

      this.multiPageOpts.set(container, renderOptions)
      this.getPageFns.set(container, getPage)

      const pageInfos: PageRenderInfo[] = []
      let currentOffsetTop = 0

      // 预创建所有页面容器，并计算高度与偏移（渲染延后）
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await getPage(pageNumber)
        const viewport = page.getViewport({
          scale: renderOptions.scale,
          rotation: renderOptions.rotation,
        })

        const pageContainer = document.createElement('div')
        pageContainer.className = 'pdf-page-container'
        pageContainer.style.position = 'relative'
        pageContainer.style.marginBottom = `${renderOptions.pageSpacing}px`
        pageContainer.style.width = `${viewport.width}px`
        pageContainer.style.height = `${viewport.height}px`
        pageContainer.setAttribute('data-page-number', pageNumber.toString())

        const pageInfo: PageRenderInfo = {
          pageNumber,
          canvas: undefined as any,
          container: pageContainer,
          viewport,
          offsetTop: currentOffsetTop,
          height: viewport.height,
        }

        pageInfos.push(pageInfo)
        container.appendChild(pageContainer)
        currentOffsetTop += viewport.height + renderOptions.pageSpacing

        // 非虚拟滚动模式，直接渲染可见内容（与旧行为一致）
        if (!renderOptions.enableVirtualScroll) {
          const canvas = await this.renderPageToCanvas(page, pageContainer, viewport, renderOptions)
          pageInfo.canvas = canvas
          if (renderOptions.enableTextSelection && renderOptions.mode !== 'text') {
            await this.renderTextLayer(page, pageContainer, viewport)
          }
          if (renderOptions.enableAnnotations) {
            await this.renderAnnotationLayer(page, pageContainer, viewport)
          }
        }
      }

      // 保存页面渲染信息
      this.pageRenderInfos.set(container, pageInfos)

      // 虚拟滚动：初始化渲染首屏
      if (renderOptions.enableVirtualScroll) {
        const initialScrollTop = (container as any).scrollTop || 0
        const containerHeight = (container as any).clientHeight || pageInfos[0]?.height || 0
        await this.updateVisiblePages(container, initialScrollTop, containerHeight, renderOptions)
      }

      return pageInfos
    }
    catch (error) {
      throw new Error(`Failed to render all pages: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取页面渲染信息
   */
  getPageRenderInfos(container: HTMLElement): PageRenderInfo[] {
    return this.pageRenderInfos.get(container) || []
  }

  /**
   * 根据滚动位置计算当前可见页面
   */
  calculateVisiblePages(
    container: HTMLElement,
    scrollTop: number,
    containerHeight: number
  ): { currentPage: number; visiblePages: number[] } {
    const pageInfos = this.pageRenderInfos.get(container) || []
    if (pageInfos.length === 0) {
      return { currentPage: 1, visiblePages: [] }
    }

    const visiblePages: number[] = []
    let currentPage = 1

    for (const pageInfo of pageInfos) {
      const pageTop = pageInfo.offsetTop
      const pageBottom = pageTop + pageInfo.height

      // 检查页面是否在可见区域内
      if (pageBottom > scrollTop && pageTop < scrollTop + containerHeight) {
        visiblePages.push(pageInfo.pageNumber)

        // 计算当前主要可见页面（占可见区域最大的页面）
        const visibleTop = Math.max(pageTop, scrollTop)
        const visibleBottom = Math.min(pageBottom, scrollTop + containerHeight)
        const visibleHeight = visibleBottom - visibleTop

        if (visibleHeight > containerHeight * 0.5) {
          currentPage = pageInfo.pageNumber
        }
      }
    }

    // 如果没有页面占据超过50%的可见区域，选择第一个可见页面
    if (visiblePages.length > 0 && !visiblePages.includes(currentPage)) {
      currentPage = visiblePages[0]
    }

    return { currentPage, visiblePages }
  }

  /**
   * 获取指定页面的滚动位置
   */
  getPageScrollPosition(container: HTMLElement, pageNumber: number): number {
    const pageInfos = this.pageRenderInfos.get(container) || []
    const pageInfo = pageInfos.find(info => info.pageNumber === pageNumber)
    return pageInfo ? pageInfo.offsetTop : 0
  }

  /**
   * 根据可视区域更新需要渲染/回收的页面（虚拟滚动）
   */
  async updateVisiblePages(
    container: HTMLElement,
    scrollTop: number,
    containerHeight: number,
    options?: MultiPageRenderOptions,
  ): Promise<void> {
    const pageInfos = this.pageRenderInfos.get(container) || []
    if (pageInfos.length === 0) return

    const opts = options ?? this.multiPageOpts.get(container) ?? {
      visibleBuffer: 2,
      enableVirtualScroll: true,
      mode: 'canvas' as const,
      enableTextSelection: true,
      enableAnnotations: true,
    }

    if (!opts.enableVirtualScroll) return

    const { visiblePages } = this.calculateVisiblePages(container, scrollTop, containerHeight)
    const buffer = Math.max(0, opts.visibleBuffer ?? 2)
    const minTarget = Math.max(1, (visiblePages[0] || 1) - buffer)
    const maxTarget = Math.min(pageInfos.length, (visiblePages[visiblePages.length - 1] || 1) + buffer)

    const targetSet = new Set<number>()
    for (let p = minTarget; p <= maxTarget; p++) targetSet.add(p)

    const getPage = this.getPageFns.get(container)
    if (!getPage) return

    // 渲染目标范围内未渲染的页面，回收范围外已渲染的页面
    for (const info of pageInfos) {
      const pageContainer = info.container
      const existingCanvas = (pageContainer.querySelector && pageContainer.querySelector('canvas')) as HTMLCanvasElement | null

      if (targetSet.has(info.pageNumber)) {
        if (!existingCanvas) {
          // 渲染
          const page = await getPage(info.pageNumber)
          const canvas = await this.renderPageToCanvas(page, pageContainer, info.viewport, opts)
          info.canvas = canvas

          if (opts.enableTextSelection && opts.mode !== 'text') {
            await this.renderTextLayer(page, pageContainer, info.viewport)
          }
          if (opts.enableAnnotations) {
            await this.renderAnnotationLayer(page, pageContainer, info.viewport)
          }
        }
      } else if (existingCanvas) {
        // 回收（移除canvas与相关层）
        await this.cancelRenderTask(pageContainer)
        try {
          existingCanvas.remove()
          const tl = pageContainer.querySelector('.textLayer') as HTMLElement | null
          if (tl) tl.remove()
          const al = pageContainer.querySelector('.annotationLayer') as HTMLElement | null
          if (al) al.remove()
          const hl = pageContainer.querySelector('.highlightLayer') as HTMLElement | null
          if (hl) hl.remove()
        } catch {}
        info.canvas = undefined as any
      }
    }
  }

  /**
   * 渲染页面到Canvas（返回canvas元素）
   */
  private async renderPageToCanvas(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<HTMLCanvasElement> {
    const scale = options.scale ?? 1
    const rotation = options.rotation ?? 0

    // 先尝试缓存命中
    if (options.documentId) {
      const cached = this.renderCache.getCachedRender(options.documentId, page.pageNumber, scale, rotation)
      if (cached) {
        const cloned = document.createElement('canvas')
        cloned.width = cached.width
        cloned.height = cached.height
        const cctx = cloned.getContext('2d')
        if (cctx) cctx.drawImage(cached, 0, 0)
        cloned.style.width = `${viewport.width}px`
        cloned.style.height = `${viewport.height}px`
        container.appendChild(cloned)
        return cloned
      }
    }

    // 创建canvas元素
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    // 设置canvas尺寸
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`

    // 设置背景色
    if (options.backgroundColor) {
      canvas.style.backgroundColor = options.backgroundColor
    }

    // 设置高质量渲染
    if (options.useHighQuality) {
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = viewport.width * devicePixelRatio
      canvas.height = viewport.height * devicePixelRatio
      context.scale(devicePixelRatio, devicePixelRatio)
    }

    // 渲染页面 - PDF.js 3.x 格式
    const renderContext = {
      canvasContext: context,
      viewport,
    }

    try {
      console.log(`开始渲染PDF页面 ${page.pageNumber} 到Canvas...`)
      const renderTask = page.render(renderContext)
      this.renderTasks.set(container, renderTask)

      await renderTask.promise
      console.log(`PDF页面 ${page.pageNumber} 渲染完成`)
    } catch (error) {
      console.error(`PDF页面 ${page.pageNumber} 渲染失败:`, error)
      throw error
    }

    // 写入缓存
    if (options.documentId) {
      this.renderCache.cacheRender(options.documentId, page.pageNumber, scale, rotation, canvas)
    }

    // 将canvas添加到容器
    container.appendChild(canvas)
    return canvas
  }

  /**
   * 渲染到Canvas
   */
  private async renderToCanvas(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    await this.renderPageToCanvas(page, container, viewport, options)
  }

  /**
   * 渲染到SVG
   */
  private async renderToSvg(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', viewport.width.toString())
    svg.setAttribute('height', viewport.height.toString())
    svg.style.backgroundColor = options.backgroundColor || '#ffffff'

    // 渲染页面到SVG - PDF.js 3.x 格式
    const renderContext = {
      canvasContext: svg as any,
      viewport,
    }

    const renderTask = page.render(renderContext)
    this.renderTasks.set(container, renderTask)

    await renderTask.promise

    // 将SVG添加到容器
    container.appendChild(svg)
  }

  /**
   * 仅渲染文本
   */
  private async renderTextOnly(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any,
    options: RenderOptions
  ): Promise<void> {
    // 创建文本容器
    const textContainer = document.createElement('div')
    textContainer.style.width = `${viewport.width}px`
    textContainer.style.height = `${viewport.height}px`
    textContainer.style.backgroundColor = options.backgroundColor || '#ffffff'
    textContainer.style.position = 'relative'
    textContainer.style.overflow = 'hidden'

    // 渲染文本层
    await this.renderTextLayer(page, textContainer, viewport)

    container.appendChild(textContainer)
  }

  /**
   * 渲染文本层
   */
  private async renderTextLayer(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any
  ): Promise<void> {
    try {
      // 获取文本内容
      const textContent = await page.getTextContent()

      // 创建文本层容器
      const textLayerDiv = document.createElement('div')
      textLayerDiv.className = 'textLayer'
      textLayerDiv.style.position = 'absolute'
      textLayerDiv.style.left = '0'
      textLayerDiv.style.top = '0'
      textLayerDiv.style.right = '0'
      textLayerDiv.style.bottom = '0'
      textLayerDiv.style.overflow = 'hidden'
      textLayerDiv.style.opacity = '0.2'
      textLayerDiv.style.lineHeight = '1.0'

      // 渲染文本项
      const textDivs: HTMLElement[] = []
      const textContentItemsStr: string[] = []

      // 手动渲染文本内容（兼容性更好）
      textContent.items.forEach((item: any, index: number) => {
        const textDiv = document.createElement('span')
        textDiv.textContent = item.str
        textDiv.style.position = 'absolute'
        textDiv.style.whiteSpace = 'pre'
        textDiv.style.color = 'transparent'
        textDiv.style.userSelect = 'text'

        // 设置文本位置和样式
        const transform = viewport.transform
        const [x, y] = transform.slice(4, 6)
        textDiv.style.left = `${item.transform[4] + x}px`
        textDiv.style.top = `${viewport.height - (item.transform[5] + y)}px`
        textDiv.style.fontSize = `${Math.abs(item.transform[0])}px`

        textLayerDiv.appendChild(textDiv)
        textDivs.push(textDiv)
        textContentItemsStr.push(item.str)
      })

      // 保存文本层引用
      this.textLayers.set(container, textLayerDiv)

      // 添加到容器
      container.appendChild(textLayerDiv)
    }
    catch (error) {
      console.warn('Failed to render text layer:', error)
    }
  }

  /**
   * 渲染注释层
   */
  private async renderAnnotationLayer(
    page: PDFPageProxy,
    container: HTMLElement,
    viewport: any
  ): Promise<void> {
    try {
      // 获取注释
      const annotations = await page.getAnnotations()

      if (annotations.length === 0) {
        return
      }

      // 创建注释层容器
      const annotationLayerDiv = document.createElement('div')
      annotationLayerDiv.className = 'annotationLayer'
      annotationLayerDiv.style.position = 'absolute'
      annotationLayerDiv.style.left = '0'
      annotationLayerDiv.style.top = '0'
      annotationLayerDiv.style.right = '0'
      annotationLayerDiv.style.bottom = '0'

      // 手动渲染注释（简化版本）
      annotations.forEach((annotation: any) => {
        if (annotation.subtype === 'Link' && annotation.url) {
          const link = document.createElement('a')
          link.href = annotation.url
          link.target = '_blank'
          link.style.position = 'absolute'
          link.style.display = 'block'
          link.style.backgroundColor = 'rgba(0, 0, 255, 0.1)'
          link.style.border = '1px solid rgba(0, 0, 255, 0.3)'

          // 设置链接位置
          const rect = annotation.rect
          if (rect && rect.length >= 4) {
            const [x1, y1, x2, y2] = rect
            link.style.left = `${Math.min(x1, x2)}px`
            link.style.top = `${viewport.height - Math.max(y1, y2)}px`
            link.style.width = `${Math.abs(x2 - x1)}px`
            link.style.height = `${Math.abs(y2 - y1)}px`
          }

          annotationLayerDiv.appendChild(link)
        }
      })

      // 添加到容器
      container.appendChild(annotationLayerDiv)
    }
    catch (error) {
      console.warn('Failed to render annotation layer:', error)
    }
  }

  /**
   * 取消渲染任务
   */
  private async cancelRenderTask(container: HTMLElement): Promise<void> {
    const renderTask = this.renderTasks.get(container)
    if (renderTask) {
      try {
        await renderTask.cancel()
      }
      catch (error) {
        // 忽略取消错误
      }
      this.renderTasks.delete(container)
    }
  }

  /**
   * 清理容器
   */
  private cleanupContainer(container: HTMLElement): void {
    // 移除文本层引用
    this.textLayers.delete(container)

    // 清除高亮层
    this.clearAllHighlights(container)

    // 移除页面渲染信息
    this.pageRenderInfos.delete(container)

    // 清空容器内容
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }

  /**
   * 清理所有渲染内容
   */
  clearCacheForDocument(documentId: string): void {
    this.renderCache.clearDocument(documentId)
  }

  cleanup(): void {
    // 取消所有渲染任务
    for (const [container] of this.renderTasks) {
      this.cancelRenderTask(container)
    }

    // 清理引用
    this.renderTasks.clear()
    this.textLayers.clear()
    this.highlightLayers.clear()
    this.pageRenderInfos.clear()
  }

  /** 更新所有页面的高亮覆盖层 */
  updateHighlightsForAll(container: HTMLElement, results: import('./types').SearchResult[]): void {
    const pageInfos = this.pageRenderInfos.get(container) || []
    const resultsByPage = new Map<number, import('./types').SearchResult[]>()
    for (const r of results) {
      if (!resultsByPage.has(r.pageNumber)) resultsByPage.set(r.pageNumber, [])
      resultsByPage.get(r.pageNumber)!.push(r)
    }

    for (const info of pageInfos) {
      const pageContainer = info.container
      const pageResults = resultsByPage.get(info.pageNumber) || []
      this.renderHighlights(pageContainer, pageResults)
    }
  }

  /** 清理所有高亮覆盖层 */
  clearAllHighlights(container: HTMLElement): void {
    try {
      const layers = container.querySelectorAll('.highlightLayer')
      layers.forEach(layer => layer.remove())
    } catch {}
  }

  /** 渲染某页面的高亮覆盖层 */
  private renderHighlights(pageContainer: HTMLElement, results: import('./types').SearchResult[]): void {
    // 先移除旧层
    const old = pageContainer.querySelector('.highlightLayer') as HTMLElement | null
    if (old) old.remove()

    if (!results || results.length === 0) return

    const layer = document.createElement('div')
    layer.className = 'highlightLayer'
    layer.style.position = 'absolute'
    layer.style.left = '0'
    layer.style.top = '0'
    layer.style.right = '0'
    layer.style.bottom = '0'
    layer.style.pointerEvents = 'none'

    for (const r of results) {
      const el = document.createElement('div')
      el.className = 'highlight'
      el.style.position = 'absolute'
      el.style.left = `${r.position.x}px`
      el.style.top = `${r.position.y}px`
      el.style.width = `${r.position.width}px`
      el.style.height = `${r.position.height}px`
      el.style.backgroundColor = 'rgba(255, 230, 0, 0.35)'
      el.style.borderRadius = '2px'
      layer.appendChild(el)
    }

    pageContainer.appendChild(layer)
    this.highlightLayers.set(pageContainer, layer)
  }
}
