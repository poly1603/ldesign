/**
 * PDF预览器核心类型定义
 * 定义了PDF预览器的所有核心接口和类型
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

/**
 * PDF文档输入类型
 * 支持多种输入方式：URL、File对象、ArrayBuffer等
 */
export type PdfInput = string | File | ArrayBuffer | Uint8Array

/**
 * 页面渲染输出介质（单页渲染目标）
 */
export type RenderSurface = 'canvas' | 'svg' | 'text'

/**
 * 缩放模式
 */
export type ZoomMode = 'fit-width' | 'fit-page' | 'auto' | 'custom'

/**
 * 旋转角度（以度为单位）
 */
export type RotationAngle = 0 | 90 | 180 | 270

/**
 * PDF页面信息
 */
export interface PdfPageInfo {
  /** 页面编号（从1开始） */
  pageNumber: number
  /** 页面宽度 */
  width: number
  /** 页面高度 */
  height: number
  /** 旋转角度 */
  rotation: RotationAngle
  /** 页面视口 */
  viewport: {
    width: number
    height: number
    scale: number
    rotation: RotationAngle
  }
}

/**
 * PDF文档信息
 */
export interface PdfDocumentInfo {
  /** 文档标题 */
  title?: string
  /** 作者 */
  author?: string
  /** 主题 */
  subject?: string
  /** 关键词 */
  keywords?: string
  /** 创建者 */
  creator?: string
  /** 生产者 */
  producer?: string
  /** 创建日期 */
  creationDate?: Date
  /** 修改日期 */
  modificationDate?: Date
  /** 总页数 */
  numPages: number
  /** 文件大小（字节） */
  fileSize?: number
  /** PDF版本 */
  pdfVersion?: string
}

/**
 * 渲染选项（单页渲染）
 */
export interface RenderOptions {
  /** 渲染介质 */
  mode?: RenderSurface
  /** 缩放比例 */
  scale?: number
  /** 旋转角度 */
  rotation?: RotationAngle
  /** 是否启用文本选择 */
  enableTextSelection?: boolean
  /** 是否启用注释 */
  enableAnnotations?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否使用高质量渲染 */
  useHighQuality?: boolean
  /** 文档ID（用于渲染缓存） */
  documentId?: string
}

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 搜索关键词 */
  query: string
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否全词匹配 */
  wholeWords?: boolean
  /** 是否高亮显示 */
  highlightAll?: boolean
  /** 搜索方向 */
  findPrevious?: boolean
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 匹配的页面编号 */
  pageNumber: number
  /** 匹配的文本 */
  text: string
  /** 匹配位置 */
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 匹配索引 */
  matchIndex: number
  /** 总匹配数 */
  totalMatches: number
}

/**
 * 缩略图选项
 */
export interface ThumbnailOptions {
  /** 缩略图宽度 */
  width?: number
  /** 缩略图高度 */
  height?: number
  /** 缩放比例 */
  scale?: number
  /** 是否启用缓存 */
  enableCache?: boolean
}

/**
 * 打印选项
 */
export interface PrintOptions {
  /** 打印页面范围 */
  pageRange?: string
  /** 是否适应页面 */
  fitToPage?: boolean
  /** 打印质量 */
  quality?: 'draft' | 'normal' | 'high'
  /** 是否显示打印对话框 */
  showDialog?: boolean
}

/**
 * 下载选项
 */
export interface DownloadOptions {
  /** 文件名 */
  filename?: string
  /** 是否保存为副本（当源为 URL 时尝试 fetch 后下载） */
  saveAsCopy?: boolean
}

/**
 * 预览器渲染模式（单页/多页）
 */
export type ViewerMode = 'single-page' | 'multi-page'

/**
 * 高度模式
 */
export type HeightMode = 'auto' | 'custom'

/**
 * PDF预览器配置
 */
export interface PdfViewerConfig {
  /** 容器元素 */
  container: HTMLElement
  /** 初始缩放比例 */
  initialScale?: number
  /** 初始页面 */
  initialPage?: number
  /** 缩放模式 */
  zoomMode?: ZoomMode
  /** 渲染模式（单页/多页） */
  renderMode?: ViewerMode
  /** 高度模式 */
  heightMode?: HeightMode
  /** 自定义高度（当heightMode为custom时） */
  customHeight?: string | number
  /** 渲染选项 */
  renderOptions?: RenderOptions
  /** 多页渲染选项 */
  multiPageOptions?: MultiPageRenderOptions
  /** 是否启用工具栏 */
  enableToolbar?: boolean
  /** 是否启用侧边栏 */
  enableSidebar?: boolean
  /** 是否启用搜索 */
  enableSearch?: boolean
  /** 是否启用缩略图 */
  enableThumbnails?: boolean
  /** 是否启用全屏 */
  enableFullscreen?: boolean
  /** 是否启用下载 */
  enableDownload?: boolean
  /** 是否启用打印 */
  enablePrint?: boolean
  /** 自定义样式 */
  customStyles?: Record<string, string>
  /** 本地化配置 */
  locale?: string
  /** 自定义 PDF.js worker 路径 */
  workerSrc?: string | URL
  /** 直接传入已创建的 Worker 实例 */
  workerPort?: Worker
  /** 提供 module worker 的 URL（将以 { type: 'module' } 创建） */
  workerModule?: string | URL
}

/**
 * 事件类型
 */
export interface PdfViewerEvents {
  /** 文档加载完成 */
  documentLoaded: (info: PdfDocumentInfo) => void
  /** 页面变化 */
  pageChanged: (pageNumber: number, pageInfo: PdfPageInfo) => void
  /** 缩放变化 */
  zoomChanged: (scale: number, zoomMode: ZoomMode) => void
  /** 旋转变化 */
  rotationChanged: (rotation: RotationAngle) => void
  /** 搜索结果 */
  searchResult: (results: SearchResult[]) => void
  /** 错误事件 */
  error: (error: Error) => void
  /** 加载进度 */
  loadProgress: (progress: number) => void
  /** 渲染完成 */
  renderComplete: (pageNumber: number) => void
  /** 所有页面渲染完成 */
  allPagesRendered: (pageInfos: PageRenderInfo[]) => void
  /** 可见页面变化 */
  visiblePagesChanged: (currentPage: number, visiblePages: number[]) => void
}

/**
 * PDF预览器状态
 */
export interface PdfViewerState {
  /** 是否已加载文档 */
  isDocumentLoaded: boolean
  /** 当前页面编号 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 当前缩放比例 */
  currentScale: number
  /** 当前缩放模式 */
  currentZoomMode: ZoomMode
  /** 当前旋转角度 */
  currentRotation: RotationAngle
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否全屏模式 */
  isFullscreen: boolean
  /** 搜索状态 */
  searchState: {
    isSearching: boolean
    query: string
    currentMatch: number
    totalMatches: number
  }
}

/**
 * PDF预览器核心接口
 */
export interface IPdfViewer {
  /** 加载PDF文档 */
  loadDocument(input: PdfInput): Promise<void>
  /** 跳转到指定页面 */
  goToPage(pageNumber: number): Promise<void>
  /** 上一页 */
  previousPage(): Promise<void>
  /** 下一页 */
  nextPage(): Promise<void>
  /** 设置缩放比例 */
  setZoom(scale: number): void
  /** 设置缩放模式 */
  setZoomMode(mode: ZoomMode): void
  /** 放大 */
  zoomIn(): void
  /** 缩小 */
  zoomOut(): void
  /** 旋转页面 */
  rotate(angle: RotationAngle): void
  /** 搜索文本 */
  search(options: SearchOptions): Promise<SearchResult[]>
  /** 进入全屏 */
  enterFullscreen(): void
  /** 退出全屏 */
  exitFullscreen(): void
  /** 下载PDF */
  download(options?: DownloadOptions): Promise<void>
  /** 打印PDF */
  print(options?: PrintOptions): Promise<void>
  /** 获取当前状态 */
  getState(): PdfViewerState
  /** 获取文档信息 */
  getDocumentInfo(): Promise<PdfDocumentInfo | null>
  /** 获取PDF.js文档对象 */
  getDocument(): Promise<any>
  /** 销毁预览器 */
  destroy(): void

  /** 便捷方法 */
  getCurrentPage(): number
  getTotalPages(): number
  getScale(): number
  getRotation(): RotationAngle
  isFullscreen(): boolean
  fitToWidth(): void
  fitToPage(): void
  /** 清除搜索高亮 */
  clearSearchHighlights(): void

  /** 获取页面渲染信息 */
  getPageRenderInfos(): PageRenderInfo[]
  /** 计算可见页面 */
  calculateVisiblePages(scrollTop: number, containerHeight: number): { currentPage: number; visiblePages: number[] }
  /** 更新可见页面（虚拟滚动渲染/回收） */
  updateVisiblePages(scrollTop: number, containerHeight: number): void
  /** 获取页面滚动位置 */
  getPageScrollPosition(pageNumber: number): number
  /** 设置渲染模式 */
  setRenderMode(mode: ViewerMode): void
  /** 设置高度模式 */
  setHeightMode(mode: HeightMode, customHeight?: string | number): void

  /** 事件订阅 */
  on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
  off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
  once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
}

/**
 * 页面渲染信息
 */
export interface PageRenderInfo {
  pageNumber: number
  canvas?: HTMLCanvasElement
  container: HTMLElement
  viewport: any
  offsetTop: number
  height: number
}

/**
 * 多页渲染选项
 */
export interface MultiPageRenderOptions extends RenderOptions {
  /** 页面间距 */
  pageSpacing?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScroll?: boolean
  /** 可见页面缓冲区大小 */
  visibleBuffer?: number
}

/**
 * PDF页面渲染器接口
 */
export interface IPdfPageRenderer {
  /** 渲染页面 */
  renderPage(
    page: PDFPageProxy,
    container: HTMLElement,
    options: RenderOptions
  ): Promise<void>
  /** 渲染所有页面（可启用虚拟滚动） */
  renderAllPages(
    getPage: (pageNumber: number) => Promise<PDFPageProxy>,
    totalPages: number,
    container: HTMLElement,
    options: MultiPageRenderOptions
  ): Promise<PageRenderInfo[]>
  /** 获取页面渲染信息 */
  getPageRenderInfos(container: HTMLElement): PageRenderInfo[]
  /** 计算可见页面 */
  calculateVisiblePages(
    container: HTMLElement,
    scrollTop: number,
    containerHeight: number
  ): { currentPage: number; visiblePages: number[] }
  /** 更新可见页面（渲染可见+缓冲，回收不可见） */
  updateVisiblePages(
    container: HTMLElement,
    scrollTop: number,
    containerHeight: number,
    options?: MultiPageRenderOptions,
  ): Promise<void>
  /** 更新所有页面的高亮覆盖层 */
  updateHighlightsForAll(container: HTMLElement, results: SearchResult[]): void
  /** 清理所有高亮覆盖层 */
  clearAllHighlights(container: HTMLElement): void
  /** 清理指定文档的渲染缓存 */
  clearCacheForDocument(documentId: string): void
  /** 获取页面滚动位置 */
  getPageScrollPosition(container: HTMLElement, pageNumber: number): number
  /** 清理渲染内容 */
  cleanup(): void
}

/**
 * PDF文档管理器接口
 */
export interface IPdfDocumentManager {
  /** 加载文档 */
  loadDocument(input: PdfInput): Promise<PDFDocumentProxy>
  /** 获取页面 */
  getPage(pageNumber: number): Promise<PDFPageProxy>
  /** 获取文档信息 */
  getDocumentInfo(): Promise<PdfDocumentInfo>
  /** 获取当前文档 */
  getDocument(): PDFDocumentProxy | null
  /** 是否已加载文档 */
  hasDocument(): boolean
  /** 获取总页数 */
  getPageCount(): number
  /** 预加载页面 */
  preloadPages(startPage: number, endPage: number): Promise<void>
  /** 清理页面缓存 */
  clearPageCache(): void
  /** 获取原始输入数据（URL 或二进制） */
  getOriginalData(): string | ArrayBuffer | Uint8Array | null
  /** 销毁文档 */
  destroy(): Promise<void>
}
export interface IPdfDocumentManager {
  /** 加载文档 */
  loadDocument(input: PdfInput): Promise<PDFDocumentProxy>
  /** 获取页面 */
  getPage(pageNumber: number): Promise<PDFPageProxy>
  /** 获取文档信息 */
  getDocumentInfo(): Promise<PdfDocumentInfo>
  /** 销毁文档 */
  destroy(): void
}
