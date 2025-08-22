/**
 * PDF查看器React Hook
 * 提供PDF文档的状态管理和操作方法
 */

import type {
  PdfError,
  PdfViewerConfig,
  PdfViewerState,
  SearchResult,
  UsePdfViewerOptions,
  UsePdfViewerReturn,
} from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'

// 模拟PDF查看器类（实际使用时从@ldesign/pdf导入）
class MockPdfViewer {
  private container: HTMLElement | null = null
  private config: PdfViewerConfig
  private currentPage = 0
  private totalPages = 0
  private zoomLevel = 1.0
  private pdfDocument: any = null
  private eventListeners = new Map<string, Function[]>()

  constructor(config: PdfViewerConfig = {}) {
    this.config = {
      enableCache: true,
      cacheSize: 50,
      enableWebGL: false,
      devicePixelRatio: window.devicePixelRatio || 1,
      ...config,
    }
  }

  setContainer(container: HTMLElement | null) {
    this.container = container
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, data?: any) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => callback(data))
    }
  }

  async loadPdf(source: string | File | ArrayBuffer): Promise<void> {
    this.emit('loadStart', { source })

    try {
      // 模拟加载过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        this.emit('loadProgress', { progress: i })
      }

      // 模拟PDF文档
      this.pdfDocument = {
        numPages: Math.floor(Math.random() * 20) + 5,
        source,
      }

      this.totalPages = this.pdfDocument.numPages
      this.currentPage = 1

      this.emit('loadSuccess', {
        totalPages: this.totalPages,
        source,
      })

      await this.renderPage(1)
    }
    catch (error) {
      this.emit('loadError', { error, source })
      throw error
    }
  }

  async renderPage(pageNumber: number): Promise<void> {
    if (!this.pdfDocument || pageNumber < 1 || pageNumber > this.totalPages) {
      throw new Error(`Invalid page number: ${pageNumber}`)
    }

    this.currentPage = pageNumber

    if (this.container) {
      // 模拟页面渲染
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      const baseWidth = 595
      const baseHeight = 842
      canvas.width = baseWidth * this.zoomLevel
      canvas.height = baseHeight * this.zoomLevel

      // 绘制模拟内容
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#cccccc'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#333333'
      ctx.font = `${16 * this.zoomLevel}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(
        `第 ${pageNumber} 页`,
        canvas.width / 2,
        50 * this.zoomLevel,
      )

      this.container.innerHTML = ''
      const pageDiv = document.createElement('div')
      pageDiv.className = 'pdf-page'
      pageDiv.appendChild(canvas)
      this.container.appendChild(pageDiv)
    }

    this.emit('pageRendered', {
      pageNumber,
      zoomLevel: this.zoomLevel,
    })
  }

  async nextPage(): Promise<boolean> {
    if (this.currentPage < this.totalPages) {
      await this.renderPage(this.currentPage + 1)
      return true
    }
    return false
  }

  async previousPage(): Promise<boolean> {
    if (this.currentPage > 1) {
      await this.renderPage(this.currentPage - 1)
      return true
    }
    return false
  }

  async goToPage(pageNumber: number): Promise<boolean> {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      await this.renderPage(pageNumber)
      return true
    }
    return false
  }

  async zoomIn(): Promise<void> {
    this.zoomLevel = Math.min(this.zoomLevel * 1.25, 3.0)
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async zoomOut(): Promise<void> {
    this.zoomLevel = Math.max(this.zoomLevel / 1.25, 0.25)
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async setZoom(level: number): Promise<void> {
    this.zoomLevel = Math.max(0.25, Math.min(level, 3.0))
    await this.renderPage(this.currentPage)
    this.emit('zoomChanged', { zoomLevel: this.zoomLevel })
  }

  async fitWidth(): Promise<void> {
    if (this.container) {
      const containerWidth = this.container.clientWidth - 40
      const baseWidth = 595
      const newZoom = containerWidth / baseWidth
      await this.setZoom(newZoom)
    }
  }

  async search(query: string): Promise<SearchResult[]> {
    // 模拟搜索结果
    const results: SearchResult[] = []
    for (let i = 1; i <= Math.min(3, this.totalPages); i++) {
      results.push({
        pageNumber: i,
        text: `找到匹配文本: ${query}`,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 600,
          width: query.length * 10,
          height: 20,
        },
      })
    }
    return results
  }

  getCurrentPage(): number {
    return this.currentPage
  }

  getTotalPages(): number {
    return this.totalPages
  }

  getZoomLevel(): number {
    return this.zoomLevel
  }

  isDocumentLoaded(): boolean {
    return this.pdfDocument !== null
  }

  updateConfig(config: Partial<PdfViewerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  destroy(): void {
    this.eventListeners.clear()
    this.pdfDocument = null
    this.currentPage = 0
    this.totalPages = 0
    this.zoomLevel = 1.0
  }
}

/**
 * PDF查看器Hook
 */
export function usePdfViewer(options: UsePdfViewerOptions = {}): UsePdfViewerReturn {
  const {
    config = {},
    initialPage = 1,
    initialZoom = 1.0,
    onPageChange,
    onZoomChange,
    onError,
  } = options

  // 状态管理
  const [state, setState] = useState<PdfViewerState>({
    currentPage: 0,
    totalPages: 0,
    zoomLevel: initialZoom,
    isLoading: false,
    loadProgress: 0,
    error: null,
    isDocumentLoaded: false,
  })

  // PDF查看器实例引用
  const viewerRef = useRef<MockPdfViewer | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  // 初始化查看器
  useEffect(() => {
    if (!viewerRef.current) {
      viewerRef.current = new MockPdfViewer(config)

      // 绑定事件监听器
      const viewer = viewerRef.current

      viewer.on('loadStart', () => {
        setState(prev => ({
          ...prev,
          isLoading: true,
          loadProgress: 0,
          error: null,
        }))
      })

      viewer.on('loadProgress', ({ progress }: { progress: number }) => {
        setState(prev => ({
          ...prev,
          loadProgress: progress,
        }))
      })

      viewer.on('loadSuccess', ({ totalPages }: { totalPages: number }) => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          totalPages,
          currentPage: initialPage,
          isDocumentLoaded: true,
          error: null,
        }))
      })

      viewer.on('loadError', ({ error }: { error: Error }) => {
        const pdfError: PdfError = {
          ...error,
          code: 'LOAD_ERROR',
        }
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: pdfError,
          isDocumentLoaded: false,
        }))
        onError?.(pdfError)
      })

      viewer.on('pageRendered', ({ pageNumber }: { pageNumber: number }) => {
        setState(prev => ({
          ...prev,
          currentPage: pageNumber,
        }))
        onPageChange?.(pageNumber)
      })

      viewer.on('zoomChanged', ({ zoomLevel }: { zoomLevel: number }) => {
        setState(prev => ({
          ...prev,
          zoomLevel,
        }))
        onZoomChange?.(zoomLevel)
      })
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [config, initialPage, onPageChange, onZoomChange, onError])

  // 设置容器
  const setContainer = useCallback((container: HTMLElement | null) => {
    containerRef.current = container
    if (viewerRef.current) {
      viewerRef.current.setContainer(container)
    }
  }, [])

  // 加载PDF
  const loadPdf = useCallback(async (src: string | File | ArrayBuffer) => {
    if (!viewerRef.current) {
      throw new Error('PDF viewer not initialized')
    }

    try {
      await viewerRef.current.loadPdf(src)
    }
    catch (error) {
      const pdfError: PdfError = {
        name: 'PdfError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'LOAD_FAILED',
      }
      setState(prev => ({
        ...prev,
        error: pdfError,
        isLoading: false,
      }))
      throw pdfError
    }
  }, [])

  // 页面导航
  const nextPage = useCallback(async (): Promise<boolean> => {
    if (!viewerRef.current)
      return false
    return await viewerRef.current.nextPage()
  }, [])

  const previousPage = useCallback(async (): Promise<boolean> => {
    if (!viewerRef.current)
      return false
    return await viewerRef.current.previousPage()
  }, [])

  const goToPage = useCallback(async (page: number): Promise<boolean> => {
    if (!viewerRef.current)
      return false
    return await viewerRef.current.goToPage(page)
  }, [])

  // 缩放控制
  const zoomIn = useCallback(async (): Promise<void> => {
    if (!viewerRef.current)
      return
    await viewerRef.current.zoomIn()
  }, [])

  const zoomOut = useCallback(async (): Promise<void> => {
    if (!viewerRef.current)
      return
    await viewerRef.current.zoomOut()
  }, [])

  const setZoom = useCallback(async (zoom: number): Promise<void> => {
    if (!viewerRef.current)
      return
    await viewerRef.current.setZoom(zoom)
  }, [])

  const fitWidth = useCallback(async (): Promise<void> => {
    if (!viewerRef.current)
      return
    await viewerRef.current.fitWidth()
  }, [])

  // 搜索
  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!viewerRef.current)
      return []
    return await viewerRef.current.search(query)
  }, [])

  // 设置配置
  const setConfig = useCallback((newConfig: Partial<PdfViewerConfig>) => {
    if (viewerRef.current) {
      viewerRef.current.updateConfig(newConfig)
    }
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    setState({
      currentPage: 0,
      totalPages: 0,
      zoomLevel: initialZoom,
      isLoading: false,
      loadProgress: 0,
      error: null,
      isDocumentLoaded: false,
    })

    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = new MockPdfViewer(config)
    }
  }, [config, initialZoom])

  return {
    state,
    loadPdf,
    nextPage,
    previousPage,
    goToPage,
    zoomIn,
    zoomOut,
    setZoom,
    fitWidth,
    search,
    setConfig,
    reset,
    setContainer,
  } as UsePdfViewerReturn & { setContainer: (container: HTMLElement | null) => void }
}

export default usePdfViewer
