/**
 * PDF阅读器类型定义文件
 * 定义了PDF阅读器相关的所有类型接口
 */

import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'

/**
 * 阅读模式
 */
export type PDFReadingMode = 'single' | 'continuous'

/**
 * PDF阅读器配置选项
 */
export interface PDFReaderOptions {
  /** 容器元素或选择器 */
  container: HTMLElement | string
  /** PDF文件URL或ArrayBuffer */
  src?: string | ArrayBuffer | Uint8Array
  /** 初始页码（从1开始） */
  initialPage?: number
  /** 初始缩放比例 */
  initialScale?: number
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示缩略图 */
  showThumbnails?: boolean
  /** 是否启用搜索功能 */
  enableSearch?: boolean
  /** 是否启用注释功能 */
  enableAnnotations?: boolean
  /** 阅读模式：单页或连续滚动 */
  readingMode?: PDFReadingMode
  /** 主题配置 */
  theme?: 'light' | 'dark' | 'auto'
  /** 自定义样式类名 */
  className?: string
  /** 工作线程URL */
  workerSrc?: string
}

/**
 * PDF页面渲染选项
 */
export interface PDFPageRenderOptions {
  /** 页码（从1开始） */
  pageNumber: number
  /** 缩放比例 */
  scale?: number
  /** 旋转角度（0, 90, 180, 270） */
  rotation?: number
  /** 渲染质量 */
  quality?: number
}

/**
 * PDF搜索选项
 */
export interface PDFSearchOptions {
  /** 搜索关键词 */
  query: string
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否全词匹配 */
  wholeWords?: boolean
  /** 搜索方向 */
  direction?: 'forward' | 'backward'
  /** 起始页码 */
  startPage?: number
}

/**
 * PDF搜索结果
 */
export interface PDFSearchResult {
  /** 页码 */
  pageNumber: number
  /** 匹配的文本 */
  text: string
  /** 匹配位置 */
  matches: Array<{
    /** 开始位置 */
    begin: number
    /** 结束位置 */
    end: number
    /** 边界框 */
    rect: [number, number, number, number]
  }>
}

/**
 * PDF页面信息
 */
export interface PDFPageInfo {
  /** 页码 */
  pageNumber: number
  /** 页面宽度 */
  width: number
  /** 页面高度 */
  height: number
  /** 旋转角度 */
  rotation: number
  /** 缩放比例 */
  scale: number
}

/**
 * PDF文档信息
 */
export interface PDFDocumentInfo {
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
  /** PDF版本 */
  pdfFormatVersion?: string
}

/**
 * PDF阅读器事件类型
 */
export interface PDFReaderEvents {
  /** 文档加载完成 */
  'document-loaded': (info: PDFDocumentInfo) => void
  /** 页面变化 */
  'page-changed': (pageNumber: number) => void
  /** 缩放变化 */
  'scale-changed': (scale: number) => void
  /** 搜索结果 */
  'search-results': (results: PDFSearchResult[]) => void
  /** 错误事件 */
  'error': (error: Error) => void
  /** 加载进度 */
  'loading-progress': (progress: number) => void
}

/**
 * PDF阅读器状态
 */
export interface PDFReaderState {
  /** 是否已加载文档 */
  isLoaded: boolean
  /** 当前页码 */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 当前缩放比例 */
  scale: number
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在搜索 */
  isSearching: boolean
  /** 当前阅读模式 */
  readingMode: PDFReadingMode
}

/**
 * 内部使用的页面缓存项
 */
export interface PDFPageCache {
  /** 页面代理对象 */
  page: PDFPageProxy
  /** 渲染任务 */
  renderTask?: RenderTask
  /** Canvas元素 */
  canvas?: HTMLCanvasElement
  /** 文本层元素 */
  textLayer?: HTMLElement
  /** 注释层元素 */
  annotationLayer?: HTMLElement
}

/**
 * 工具栏按钮配置
 */
export interface ToolbarButton {
  /** 按钮ID */
  id: string
  /** 按钮标题 */
  title: string
  /** 按钮图标 */
  icon: string
  /** 点击处理函数 */
  onClick: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示 */
  visible?: boolean
}
