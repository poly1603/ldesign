// PDF查看器配置接口
export interface PdfViewerConfig {
  // 基础功能配置
  enableSearch?: boolean
  enableThumbnails?: boolean
  enableDownload?: boolean
  enablePrint?: boolean
  enableFullscreen?: boolean
  
  // 渲染配置
  renderOptions?: RenderOptions
  initialZoom?: number | 'fit-width' | 'fit-page' | 'auto'
  initialPage?: number
  
  // 缓存和性能
  cacheSize?: number
  preloadPages?: number
  enableVirtualScrolling?: boolean
  maxCanvasSize?: number
  
  // 主题和样式
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  
  // 交互配置
  enableKeyboardShortcuts?: boolean
  enableMouseWheel?: boolean
  enableTouch?: boolean
  
  // 侧边栏配置
  sidebarWidth?: string | number
  defaultSidebarOpen?: boolean
  
  // 调试配置
  enableDebug?: boolean
  logLevel?: 'silent' | 'error' | 'warn' | 'info' | 'verbose'
}

// 渲染选项接口
export interface RenderOptions {
  scale?: number
  rotation?: number
  enableWebGL?: boolean
  textLayerMode?: 'disable' | 'enable' | 'enhance'
  annotationMode?: 'disable' | 'enable' | 'enable_forms' | 'enable_storage'
  imageResourcesPath?: string
  maxImageSize?: number
  isEvalSupported?: boolean
  disableFontFace?: boolean
  useOnlyCssZoom?: boolean
  verbosity?: number
}

// PDF信息接口
export interface PdfInfo {
  numPages: number
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
  keywords?: string
  version?: string
  pageSize?: {
    width: number
    height: number
  }
  fileSize?: number
  encrypted?: boolean
}

// 搜索结果接口
export interface SearchResult {
  pageIndex: number
  textContent: string
  matchIndex: number
  matchLength: number
  context: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
}

// 搜索选项接口
export interface SearchOptions {
  query: string
  caseSensitive?: boolean
  wholeWords?: boolean
  highlightAll?: boolean
  findPrevious?: boolean
}

// PDF错误接口
export interface PdfError {
  name: string
  message: string
  code?: string | number
  stack?: string
  details?: any
}

// 页面渲染状态
export interface PageRenderState {
  pageNumber: number
  isLoading: boolean
  isRendered: boolean
  error?: PdfError
  canvas?: HTMLCanvasElement
  textLayer?: HTMLElement
  annotationLayer?: HTMLElement
}

// 缩略图接口
export interface ThumbnailInfo {
  pageNumber: number
  canvas: HTMLCanvasElement
  width: number
  height: number
  isLoading: boolean
  error?: PdfError
}

// 文件上传接口
export interface FileUploadOptions {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onProgress?: (progress: number) => void
  onSuccess?: (file: File) => void
  onError?: (error: Error) => void
}

// 加载状态接口
export interface LoadingState {
  isLoading: boolean
  progress: number
  stage: 'idle' | 'parsing' | 'initializing' | 'rendering' | 'complete' | 'error'
  message?: string
  error?: PdfError
}

// 缩放状态接口
export interface ZoomState {
  level: number
  mode: 'custom' | 'fit-width' | 'fit-page' | 'auto'
  min: number
  max: number
  step: number
}

// 导航状态接口
export interface NavigationState {
  currentPage: number
  totalPages: number
  canGoPrevious: boolean
  canGoNext: boolean
  pageInput: string
}

// 主题配置接口
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    border: string
    accent: string
  }
  fonts: {
    family: string
    size: {
      small: string
      medium: string
      large: string
    }
  }
  spacing: {
    small: string
    medium: string
    large: string
  }
  borderRadius: string
  shadows: {
    small: string
    medium: string
    large: string
  }
}

// 工具栏项目接口
export interface ToolbarItem {
  id: string
  type: 'button' | 'separator' | 'group' | 'input' | 'select'
  label?: string
  icon?: string
  tooltip?: string
  disabled?: boolean
  visible?: boolean
  action?: () => void
  children?: ToolbarItem[]
}

// 键盘快捷键接口
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: string
  description: string
}

// 性能监控接口
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  averagePageRenderTime: number
  totalPages: number
  renderedPages: number
}

// 事件类型定义
export type PdfViewerEvent = 
  | 'load-start'
  | 'load-progress'
  | 'load-success'
  | 'load-error'
  | 'page-change'
  | 'zoom-change'
  | 'search-start'
  | 'search-result'
  | 'search-complete'
  | 'render-start'
  | 'render-complete'
  | 'render-error'
  | 'theme-change'
  | 'fullscreen-change'

// 事件处理器类型
export type EventHandler<T = any> = (data: T) => void

// 组件Props类型
export interface PdfViewerProps {
  file?: File | string | null
  config?: PdfViewerConfig
  className?: string
}

export interface PdfControlsProps {
  currentPage: number
  totalPages: number
  zoomLevel: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomToFit: () => void
  onZoomToWidth: () => void
}

export interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
  onFileSelect: (files: File[]) => void
  onError?: (error: Error) => void
}

export interface LoadingIndicatorProps {
  isLoading: boolean
  progress?: number
  message?: string
  className?: string
}

export interface ErrorBoundaryProps {
  fallback?: any
  onError?: (error: Error, errorInfo: any) => void
}

// Composables返回类型
export interface UsePdfViewerReturn {
  // 状态
  isLoading: Ref<boolean>
  loadingState: Ref<LoadingState>
  pdfInfo: Ref<PdfInfo | null>
  currentPage: Ref<number>
  totalPages: Ref<number>
  zoomState: Ref<ZoomState>
  searchResults: Ref<SearchResult[]>
  error: Ref<PdfError | null>
  
  // 方法
  loadPdf: (file: File | string) => Promise<void>
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (zoom: number | string) => void
  search: (options: SearchOptions) => Promise<SearchResult[]>
  clearSearch: () => void
  downloadPdf: () => void
  printPdf: () => void
  destroy: () => void
}

export interface UseFileUploadReturn {
  isUploading: Ref<boolean>
  uploadProgress: Ref<number>
  uploadFile: (file: File) => Promise<void>
  uploadFiles: (files: File[]) => Promise<void>
  cancelUpload: () => void
}

export interface UseThemeReturn {
  theme: Ref<'light' | 'dark' | 'auto'>
  isDark: Ref<boolean>
  themeConfig: Ref<ThemeConfig>
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  toggleTheme: () => void
}

// Vue特定类型
import type { Ref, ComputedRef } from 'vue'

// 导出所有类型
export * from '@ldesign/pdf'