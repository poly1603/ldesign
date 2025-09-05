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
 * PDF页面渲染模式
 */
export type RenderMode = 'canvas' | 'svg' | 'text'

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
 * 渲染选项
 */
export interface RenderOptions {
  /** 渲染模式 */
  mode?: RenderMode
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
  /** 是否保存为副本 */
  saveAsCopy?: boolean
}

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
  /** 渲染选项 */
  renderOptions?: RenderOptions
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
  download(options?: DownloadOptions): void
  /** 打印PDF */
  print(options?: PrintOptions): void
  /** 获取当前状态 */
  getState(): PdfViewerState
  /** 获取文档信息 */
  getDocumentInfo(): PdfDocumentInfo | null
  /** 销毁预览器 */
  destroy(): void

  /** 事件订阅 */
  on<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
  off<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
  once<K extends keyof PdfViewerEvents>(event: K, listener: PdfViewerEvents[K]): void
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
  /** 销毁文档 */
  destroy(): void
}
