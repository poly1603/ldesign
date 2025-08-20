/**
 * PDF预览组件包 - 核心类型定义
 * 提供完整的TypeScript类型系统
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * PDF源类型
 */
export type PdfSource = string | ArrayBuffer | Uint8Array | File

/**
 * 页面视口
 */
export interface PageViewport {
  width: number
  height: number
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
  transform: number[]
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  scale?: number
  rotation?: number
  viewport?: PageViewport
  background?: string
  enableWebGL?: boolean
  renderTextLayer?: boolean
  renderAnnotations?: boolean
  intent?: 'display' | 'print'
  annotationMode?: number
  printAnnotationStorage?: any
  isOffscreenCanvasSupported?: boolean
  canvasFactory?: any
  optionalContentConfigPromise?: Promise<any>
  annotationCanvasMap?: Map<string, HTMLCanvasElement>
  pageColors?: any
}

/**
 * 渲染结果
 */
export interface RenderResult {
  promise: Promise<void>
  cancel: () => void
}

/**
 * 加载选项
 */
export interface LoadOptions {
  password?: string
  cMapUrl?: string
  cMapPacked?: boolean
  enableXfa?: boolean
  docBaseUrl?: string
  httpHeaders?: Record<string, string>
  withCredentials?: boolean
  maxImageSize?: number
  isEvalSupported?: boolean
  disableFontFace?: boolean
  disableRange?: boolean
  disableStream?: boolean
  disableAutoFetch?: boolean
  pdfBug?: boolean
  onProgress?: (progress: { loaded: number; total: number }) => void
  onError?: (error: Error) => void
}

/**
 * 文本内容
 */
export interface TextContent {
  items: TextItem[]
  styles: Record<string, TextStyle>
}

export interface TextItem {
  str: string
  dir: string
  width: number
  height: number
  transform: number[]
  fontName: string
  hasEOL: boolean
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  ascent: number
  descent: number
  vertical: boolean
}

/**
 * 文本提取选项
 */
export interface TextExtractionOptions {
  normalizeWhitespace?: boolean
  disableCombineTextItems?: boolean
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  maxSize: number
  maxItems: number
  ttl: number
  strategy: 'lru' | 'lfu' | 'fifo'
}

// ============================================================================
// 核心实例接口
// ============================================================================

/**
 * PDF文档接口
 */
export interface PdfDocument {
  readonly numPages: number
  readonly fingerprint: string
  readonly loadingTask: any

  getPage: (pageNumber: number) => Promise<PdfPage>
  getMetadata: () => Promise<DocumentMetadata>
  getOutline: () => Promise<OutlineNode[] | null>
  getPermissions: () => Promise<number[] | null>
  destroy: () => void
}

/**
 * PDF页面接口
 */
export interface PdfPage {
  readonly pageNumber: number
  readonly pageIndex: number
  readonly rotate: number
  readonly ref: any
  readonly userUnit: number
  readonly view: number[]

  getViewport: (options: { scale: number; rotation?: number }) => PageViewport
  render: (renderContext: RenderContext) => RenderResult
  getTextContent: (options?: TextExtractionOptions) => Promise<TextContent>
  getAnnotations: (options?: { intent?: string }) => Promise<any[]>
  cleanup: () => void
}

/**
 * 渲染上下文
 */
export interface RenderContext {
  canvasContext: CanvasRenderingContext2D
  viewport: PageViewport
  intent?: string
  enableWebGL?: boolean | undefined
  renderInteractiveForms?: boolean
  transform?: number[]
  imageLayer?: any
  background?: string
}

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  info: DocumentInfo
  metadata: any
  contentDispositionFilename?: string
  contentLength?: number
}

export interface DocumentInfo {
  Title?: string
  Author?: string
  Subject?: string
  Keywords?: string
  Creator?: string
  Producer?: string
  CreationDate?: string
  ModDate?: string
  Trapped?: string
}

/**
 * 大纲节点
 */
export interface OutlineNode {
  title: string
  bold?: boolean
  italic?: boolean
  color?: number[]
  dest?: any
  url?: string
  unsafeUrl?: string
  newWindow?: boolean
  count?: number
  items?: OutlineNode[]
}

// ============================================================================
// 缓存系统类型
// ============================================================================

/**
 * 缓存项
 */
export interface CacheItem<T = any> {
  key: string
  value: T
  size: number
  accessTime: number
  createTime: number
  ttl: number | undefined
}

/**
 * 缓存统计
 */
export interface CacheStats {
  hits: number
  misses: number
  size: number
  itemCount: number
  hitRate: number
}

/**
 * LRU缓存接口
 */
export interface LRUCache<T = any> {
  get: (key: string) => T | undefined
  set: (key: string, value: T, size?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  getStats: () => CacheStats
  resize: (maxSize: number, maxItems: number) => void
  destroy: () => void
}

// ============================================================================
// Worker系统类型
// ============================================================================

/**
 * Worker消息类型
 */
export interface WorkerMessage {
  id: string
  type: 'init' | 'render' | 'destroy' | 'response' | 'error'
  data?: any
  payload?: any
}

/**
 * Worker响应
 */
export interface WorkerResponse {
  id: string
  type: 'success' | 'error'
  data?: any
  error?: string | { message: string; stack?: string }
}

/**
 * Worker任务
 */
export interface WorkerTask {
  id: string
  type: string
  data: any
  priority: TaskPriority
  status: TaskStatus
  retries: number
  maxAttempts: number
  resolve: (value: any) => void
  reject: (error: Error) => void
}

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * 任务优先级
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Worker配置
 */
export interface WorkerConfig {
  maxWorkers?: number
  workerScript?: string
  enableLogging?: boolean
  taskTimeout?: number
  maxRetries?: number
}

/**
 * Worker管理器选项
 */
export interface WorkerManagerOptions {
  maxWorkers?: number
  workerScript?: string
  enableLogging?: boolean
  taskTimeout?: number
  maxRetries?: number
}

/**
 * Worker统计信息
 */
export interface WorkerStatistics {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  activeWorkers: number
  queuedTasks: number
  averageTaskTime: number
}

// ============================================================================
// 错误处理类型
// ============================================================================

/**
 * 错误代码
 */
export enum ErrorCode {
  // 加载错误
  LOAD_ERROR = 'LOAD_ERROR',
  LOAD_FAILED = 'LOAD_FAILED',
  INVALID_PDF = 'INVALID_PDF',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // 解析错误
  PARSE_ERROR = 'PARSE_ERROR',
  
  // 渲染错误
  RENDER_ERROR = 'RENDER_ERROR',
  RENDER_FAILED = 'RENDER_FAILED',
  CANVAS_ERROR = 'CANVAS_ERROR',
  WEBGL_ERROR = 'WEBGL_ERROR',
  
  // 页面错误
  PAGE_NOT_FOUND = 'PAGE_NOT_FOUND',
  INVALID_PAGE_NUMBER = 'INVALID_PAGE_NUMBER',
  
  // Worker错误
  WORKER_ERROR = 'WORKER_ERROR',
  WORKER_TIMEOUT = 'WORKER_TIMEOUT',
  
  // 缓存错误
  CACHE_ERROR = 'CACHE_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  
  // 权限错误
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  
  // 超时错误
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT'
}

/**
 * PDF错误类
 */
export interface PdfError extends Error {
  code: ErrorCode
  details?: any
  recoverable?: boolean
  timestamp?: number
  context?: Record<string, any>
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  handleError(error: PdfError): void
  getRecoveryStrategy(errorCode: ErrorCode): ErrorRecoveryStrategy
  onError(errorCode: ErrorCode, callback: (error: PdfError) => void): void
  onGlobalError(callback: (error: PdfError) => void): void
  removeErrorCallback(errorCode: ErrorCode, callback: (error: PdfError) => void): void
  getErrorStats(): Record<ErrorCode, number>
  clearErrorStats(): void
  shouldRetry(errorCode: ErrorCode, currentRetries: number): boolean
  calculateRetryDelay(errorCode: ErrorCode, retryCount: number): number
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  fallbackAction: string
}

// ============================================================================
// 事件系统类型
// ============================================================================

/**
 * 事件类型
 */
export type EventType = 
  | 'documentLoaded'
  | 'pageRendered'
  | 'renderProgress'
  | 'error'
  | 'cacheHit'
  | 'cacheMiss'
  | 'workerCreated'
  | 'workerDestroyed'
  | 'taskCompleted'
  | 'taskFailed'
  | 'engineInitialized'
  | 'loadProgress'
  | 'documentDestroyed'

/**
 * 事件监听器
 */
export type EventListener<T = any> = (data: T) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  on: <T>(event: EventType, listener: EventListener<T>) => void
  off: <T>(event: EventType, listener: EventListener<T>) => void
  emit: <T>(event: EventType, data?: T) => void
  once: <T>(event: EventType, listener: EventListener<T>) => void
}

// ============================================================================
// 性能监控类型
// ============================================================================

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  workerUtilization: number
  errorRate: number
}

/**
 * 性能监控器接口
 */
export interface PerformanceMonitor {
  startTiming: (label: string) => void
  endTiming: (label: string) => number
  recordMetric: (name: string, value: number) => void
  getMetrics: () => PerformanceMetrics
  reset: () => void
}