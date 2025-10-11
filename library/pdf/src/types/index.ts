import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'

/**
 * PDF查看器配置选项
 */
export interface PDFViewerConfig {
  /** 容器元素或选择器 */
  container: string | HTMLElement
  /** PDF文件URL或Uint8Array */
  url?: string | Uint8Array
  /** 初始缩放级别 (0.1-5.0) */
  scale?: number
  /** 初始���码 (1-based) */
  page?: number
  /** 是否启用文本选择 */
  enableTextSelection?: boolean
  /** 是否启用工具栏 */
  enableToolbar?: boolean
  /** 是否启用缩略图 */
  enableThumbnails?: boolean
  /** 是否启用搜索 */
  enableSearch?: boolean
  /** 渲染模式 */
  renderMode?: 'canvas' | 'svg'
  /** 最大缓存页数 */
  maxCachePages?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScroll?: boolean
  /** Worker路径 */
  workerSrc?: string
  /** CMap URL */
  cMapUrl?: string
  /** 是否压缩CMap */
  cMapPacked?: boolean
  /** 自定义工具栏配置 */
  toolbar?: ToolbarConfig
  /** 主题配置 */
  theme?: ThemeConfig
}

/**
 * 工具栏配置
 */
export interface ToolbarConfig {
  /** 是否显示缩放按钮 */
  showZoom?: boolean
  /** 是否显示页面导航 */
  showPageNav?: boolean
  /** 是否显示下载按钮 */
  showDownload?: boolean
  /** 是否显示打印按钮 */
  showPrint?: boolean
  /** 是否显示旋转按钮 */
  showRotate?: boolean
  /** 自定义按钮 */
  customButtons?: CustomButton[]
}

/**
 * 自定义按钮
 */
export interface CustomButton {
  /** 按钮ID */
  id: string
  /** 按钮文本 */
  text: string
  /** 按钮图标 */
  icon?: string
  /** 点击事件处理 */
  onClick: () => void
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string
  /** 背景色 */
  backgroundColor?: string
  /** 工具栏背景色 */
  toolbarBackground?: string
  /** 字体颜色 */
  textColor?: string
}

/**
 * 页面渲染信息
 */
export interface PageRenderInfo {
  /** 页码 */
  pageNumber: number
  /** PDF页面对象 */
  page: PDFPageProxy
  /** 缩放比例 */
  scale: number
  /** 旋转角度 */
  rotation: number
  /** 渲染任务 */
  task?: RenderTask
}

/**
 * 文档加载进度
 */
export interface LoadProgress {
  /** 已加载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
}

/**
 * 缩放类型
 */
export type ZoomType = 'in' | 'out' | 'fit-width' | 'fit-height' | 'fit-page' | 'auto' | number

/**
 * 旋转角��
 */
export type RotationAngle = 0 | 90 | 180 | 270

/**
 * 事件类型
 */
export interface PDFViewerEvents {
  /** 文档加载完成 */
  'document-loaded': (doc: PDFDocumentProxy) => void
  /** 文档加载失败 */
  'document-error': (error: Error) => void
  /** 页面渲染完成 */
  'page-rendered': (info: PageRenderInfo) => void
  /** 页面更改 */
  'page-changed': (pageNumber: number) => void
  /** 缩放更改 */
  'zoom-changed': (scale: number) => void
  /** 旋转更改 */
  'rotation-changed': (rotation: RotationAngle) => void
  /** 加载进度 */
  'loading-progress': (progress: LoadProgress) => void
  /** 搜索结果 */
  'search-results': (results: SearchResult[]) => void
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 页码 */
  pageNumber: number
  /** 匹配文本 */
  text: string
  /** 匹配位置 */
  index: number
}

/**
 * 缓存项
 */
export interface CacheItem<T> {
  /** 缓存键 */
  key: string
  /** 缓存值 */
  value: T
  /** 创建时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
}

/**
 * PDF查看器实例
 */
export interface IPDFViewer {
  /** 加载PDF文档 */
  loadDocument(url: string | Uint8Array): Promise<PDFDocumentProxy>
  /** 跳转到指定页 */
  goToPage(pageNumber: number): Promise<void>
  /** 下一页 */
  nextPage(): Promise<void>
  /** 上一页 */
  previousPage(): Promise<void>
  /** 设置缩放 */
  setZoom(zoom: ZoomType): void
  /** 旋转页面 */
  rotate(angle: RotationAngle): void
  /** 搜索文本 */
  search(text: string): Promise<SearchResult[]>
  /** 下载PDF */
  download(filename?: string): void
  /** 打印PDF */
  print(): void
  /** 销毁实例 */
  destroy(): void
  /** 获取当前页码 */
  getCurrentPage(): number
  /** 获取总页数 */
  getTotalPages(): number
  /** 获取当前缩放比例 */
  getCurrentZoom(): number
  /** 添加事件监听 */
  on<K extends keyof PDFViewerEvents>(event: K, handler: PDFViewerEvents[K]): void
  /** 移除事件监听 */
  off<K extends keyof PDFViewerEvents>(event: K, handler: PDFViewerEvents[K]): void
}
