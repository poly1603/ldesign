/**
 * PDF预览组件包 - 核心类型定义
 * 提供完整的TypeScript类型系统，确保类型安全性
 * 
 * @fileoverview 这个文件包含了PDF预览组件包的所有核心类型定义
 * 从基础的PDF源类型到复杂的Worker系统，每个类型都经过精心设计
 * 以确保最佳的开发体验和类型安全性 🚀
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * PDF文档源类型
 * 支持多种输入格式，让你的PDF加载变得更加灵活 📄
 * 
 * @example
 * ```typescript
 * // 从URL加载
 * const source1: PdfSource = 'https://example.com/document.pdf'
 * 
 * // 从文件加载
 * const source2: PdfSource = new File(['...'], 'document.pdf')
 * 
 * // 从二进制数据加载
 * const source3: PdfSource = new ArrayBuffer(1024)
 * ```
 */
export type PdfSource = string | ArrayBuffer | Uint8Array | File

/**
 * 页面视口配置
 * 定义PDF页面的显示参数，让每一页都完美呈现 🖼️
 */
export interface PageViewport {
  /** 视口宽度（像素） */
  readonly width: number
  /** 视口高度（像素） */
  readonly height: number
  /** 缩放比例 */
  readonly scale: number
  /** 旋转角度（度） */
  readonly rotation: number
  /** X轴偏移量 */
  readonly offsetX: number
  /** Y轴偏移量 */
  readonly offsetY: number
  /** 变换矩阵 */
  readonly transform: readonly number[]
}

/**
 * 渲染选项配置
 * 控制PDF页面渲染的各种参数，给你最大的控制权 🎨
 */
export interface RenderOptions {
  /** 缩放比例，默认1.0 */
  readonly scale?: number
  /** 旋转角度，默认0度 */
  readonly rotation?: number
  /** 自定义视口 */
  readonly viewport?: PageViewport
  /** 背景颜色，默认'white' */
  readonly background?: string
  /** 是否启用WebGL加速 */
  readonly enableWebGL?: boolean
  /** 是否渲染文本层 */
  readonly renderTextLayer?: boolean
  /** 是否渲染注释 */
  readonly renderAnnotations?: boolean
  /** 渲染意图：显示或打印 */
  readonly intent?: 'display' | 'print'
  /** 注释模式 */
  readonly annotationMode?: AnnotationMode
  /** 打印注释存储 */
  readonly printAnnotationStorage?: unknown
  /** 是否支持离屏Canvas */
  readonly isOffscreenCanvasSupported?: boolean
  /** Canvas工厂 */
  readonly canvasFactory?: CanvasFactory
  /** 可选内容配置Promise */
  readonly optionalContentConfigPromise?: Promise<unknown>
  /** 注释Canvas映射 */
  readonly annotationCanvasMap?: ReadonlyMap<string, HTMLCanvasElement>
  /** 页面颜色配置 */
  readonly pageColors?: PageColors
}

/**
 * 注释模式枚举
 */
export enum AnnotationMode {
  DISABLE = 0,
  ENABLE = 1,
  ENABLE_FORMS = 2,
  ENABLE_STORAGE = 3,
}

/**
 * Canvas工厂接口
 */
export interface CanvasFactory {
  create(width: number, height: number): {
    canvas: HTMLCanvasElement | OffscreenCanvas
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  }
  reset(canvasAndContext: {
    canvas: HTMLCanvasElement | OffscreenCanvas
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  }, width: number, height: number): void
  destroy(canvasAndContext: {
    canvas: HTMLCanvasElement | OffscreenCanvas
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  }): void
}

/**
 * 页面颜色配置
 */
export interface PageColors {
  background?: string
  foreground?: string
}

/**
 * 渲染结果
 * 包含渲染Promise和取消函数，让你能够控制渲染过程 ⚡
 */
export interface RenderResult {
  /** 渲染完成的Promise */
  readonly promise: Promise<void>
  /** 取消渲染的函数 */
  readonly cancel: () => void
}

/**
 * PDF文档加载选项
 * 提供丰富的加载配置，适应各种使用场景 ⚙️
 */
export interface LoadOptions {
  /** PDF文档密码 */
  readonly password?: string
  /** 字符映射URL */
  readonly cMapUrl?: string
  /** 是否使用打包的字符映射 */
  readonly cMapPacked?: boolean
  /** 是否启用XFA表单 */
  readonly enableXfa?: boolean
  /** 文档基础URL */
  readonly docBaseUrl?: string
  /** HTTP请求头 */
  readonly httpHeaders?: Readonly<Record<string, string>>
  /** 是否携带凭证 */
  readonly withCredentials?: boolean
  /** 最大图片尺寸 */
  readonly maxImageSize?: number
  /** 是否支持eval */
  readonly isEvalSupported?: boolean
  /** 是否禁用字体 */
  readonly disableFontFace?: boolean
  /** 是否禁用范围请求 */
  readonly disableRange?: boolean
  /** 是否禁用流式加载 */
  readonly disableStream?: boolean
  /** 是否禁用自动获取 */
  readonly disableAutoFetch?: boolean
  /** 是否启用PDF调试 */
  readonly pdfBug?: boolean
  /** 加载进度回调 */
  readonly onProgress?: (progress: LoadProgress) => void
  /** 错误回调 */
  readonly onError?: (error: Error) => void
}

/**
 * 加载进度信息
 */
export interface LoadProgress {
  /** 已加载字节数 */
  readonly loaded: number
  /** 总字节数 */
  readonly total: number
  /** 加载百分比 */
  readonly percentage?: number
}

/**
 * 文本内容
 * 包含文本项和样式信息，让文本提取变得简单 📝
 */
export interface TextContent {
  /** 文本项数组 */
  readonly items: readonly TextItem[]
  /** 文本样式映射 */
  readonly styles: Readonly<Record<string, TextStyle>>
}

/**
 * 文本项
 * 单个文本元素的详细信息
 */
export interface TextItem {
  /** 文本字符串 */
  readonly str: string
  /** 文本方向 */
  readonly dir: string
  /** 文本宽度 */
  readonly width: number
  /** 文本高度 */
  readonly height: number
  /** 变换矩阵 */
  readonly transform: readonly number[]
  /** 字体名称 */
  readonly fontName: string
  /** 是否有行尾 */
  readonly hasEOL: boolean
}

/**
 * 文本样式
 * 定义文本的视觉样式
 */
export interface TextStyle {
  /** 字体族 */
  readonly fontFamily: string
  /** 字体大小 */
  readonly fontSize: number
  /** 上升高度 */
  readonly ascent: number
  /** 下降高度 */
  readonly descent: number
  /** 是否垂直排列 */
  readonly vertical: boolean
}

/**
 * 文本提取选项
 * 控制文本提取的行为
 */
export interface TextExtractionOptions {
  /** 是否标准化空白字符 */
  readonly normalizeWhitespace?: boolean
  /** 是否禁用文本项合并 */
  readonly disableCombineTextItems?: boolean
}

/**
 * 缓存配置选项
 * 优化内存使用和性能的缓存策略 🚀
 */
export interface CacheOptions {
  /** 最大缓存大小（字节） */
  readonly maxSize: number
  /** 最大缓存项数 */
  readonly maxItems: number
  /** 生存时间（毫秒） */
  readonly ttl: number
  /** 缓存策略 */
  readonly strategy: CacheStrategy
}

/**
 * 缓存策略枚举
 */
export type CacheStrategy = 'lru' | 'lfu' | 'fifo'

// ============================================================================
// 核心实例接口
// ============================================================================

/**
 * PDF文档接口
 * 表示一个已加载的PDF文档，提供页面访问和元数据获取 📚
 */
export interface PdfDocument {
  /** 总页数 */
  readonly numPages: number
  /** 文档指纹 */
  readonly fingerprint: string
  /** 加载任务 */
  readonly loadingTask: LoadingTask

  /**
   * 获取指定页面
   * @param pageNumber 页码（从1开始）
   */
  getPage(pageNumber: number): Promise<PdfPage>

  /**
   * 获取文档元数据
   */
  getMetadata(): Promise<DocumentMetadata>

  /**
   * 获取文档大纲
   */
  getOutline(): Promise<readonly OutlineNode[] | null>

  /**
   * 获取文档权限
   */
  getPermissions(): Promise<readonly number[] | null>

  /**
   * 销毁文档，释放资源
   */
  destroy(): void
}

/**
 * 加载任务接口
 */
export interface LoadingTask {
  /** 任务ID */
  readonly id: string
  /** 是否已销毁 */
  readonly destroyed: boolean
  /** 文档Promise */
  readonly promise: Promise<PdfDocument>
  /** 销毁任务 */
  destroy(): void
}

/**
 * PDF页面接口
 * 表示PDF文档中的单个页面，提供渲染和内容获取功能 📄
 */
export interface PdfPage {
  /** 页码（从1开始） */
  readonly pageNumber: number
  /** 页面索引（从0开始） */
  readonly pageIndex: number
  /** 页面旋转角度 */
  readonly rotate: number
  /** 页面引用 */
  readonly ref: PageRef | null
  /** 用户单位 */
  readonly userUnit: number
  /** 页面视图框 */
  readonly view: readonly number[]

  /**
   * 获取页面视口
   * @param options 视口选项
   */
  getViewport(options: ViewportOptions): PageViewport

  /**
   * 渲染页面
   * @param renderContext 渲染上下文
   */
  render(renderContext: RenderContext): RenderResult

  /**
   * 获取文本内容
   * @param options 文本提取选项
   */
  getTextContent(options?: TextExtractionOptions): Promise<TextContent>

  /**
   * 获取页面注释
   * @param options 注释选项
   */
  getAnnotations(options?: AnnotationOptions): Promise<readonly Annotation[]>

  /**
   * 清理页面资源
   */
  cleanup(): void
}

/**
 * 页面引用
 */
export interface PageRef {
  readonly num: number
  readonly gen: number
}

/**
 * 视口选项
 */
export interface ViewportOptions {
  /** 缩放比例 */
  readonly scale: number
  /** 旋转角度 */
  readonly rotation?: number
  /** 偏移X */
  readonly offsetX?: number
  /** 偏移Y */
  readonly offsetY?: number
  /** 是否开启DPI感知 */
  readonly dontFlip?: boolean
}

/**
 * 注释选项
 */
export interface AnnotationOptions {
  /** 注释意图 */
  readonly intent?: string
}

/**
 * 注释接口
 */
export interface Annotation {
  readonly id: string
  readonly type: string
  readonly subtype: string
  readonly rect: readonly number[]
  readonly contents: string
  readonly title: string
}

/**
 * 渲染上下文
 * 包含渲染PDF页面所需的所有信息 🎨
 */
export interface RenderContext {
  /** Canvas 2D上下文 */
  readonly canvasContext: CanvasRenderingContext2D
  /** 页面视口 */
  readonly viewport: PageViewport
  /** 渲染意图 */
  readonly intent?: string
  /** 是否启用WebGL */
  readonly enableWebGL?: boolean
  /** 是否渲染交互式表单 */
  readonly renderInteractiveForms?: boolean
  /** 变换矩阵 */
  readonly transform?: readonly number[]
  /** 图像层 */
  readonly imageLayer?: ImageLayer
  /** 背景色 */
  readonly background?: string
}

/**
 * 图像层接口
 */
export interface ImageLayer {
  beginLayout(): void
  endLayout(): void
  appendImage(args: ImageLayerRenderArgs): void
}

/**
 * 图像层渲染参数
 */
export interface ImageLayerRenderArgs {
  objId: string
  left: number
  top: number
  width: number
  height: number
  matrix: readonly number[]
  imgData: ImageData
}

/**
 * 文档元数据
 * 包含PDF文档的详细信息 📋
 */
export interface DocumentMetadata {
  /** 基本信息 */
  readonly info: DocumentInfo
  /** XMP元数据 */
  readonly metadata: XmpMetadata | null
  /** 内容处置文件名 */
  readonly contentDispositionFilename?: string
  /** 内容长度 */
  readonly contentLength?: number
}

/**
 * 文档基本信息
 */
export interface DocumentInfo {
  readonly Title?: string
  readonly Author?: string
  readonly Subject?: string
  readonly Keywords?: string
  readonly Creator?: string
  readonly Producer?: string
  readonly CreationDate?: string
  readonly ModDate?: string
  readonly Trapped?: string
}

/**
 * XMP元数据
 */
export interface XmpMetadata {
  readonly title?: string
  readonly creator?: string
  readonly description?: string
  readonly subject?: string
  readonly producer?: string
  readonly creationDate?: Date
  readonly modificationDate?: Date
}

/**
 * 大纲节点
 * 表示PDF文档的目录结构 📖
 */
export interface OutlineNode {
  /** 标题 */
  readonly title: string
  /** 是否粗体 */
  readonly bold?: boolean
  /** 是否斜体 */
  readonly italic?: boolean
  /** 颜色值 */
  readonly color?: readonly number[]
  /** 目标 */
  readonly dest?: Destination
  /** 链接URL */
  readonly url?: string
  /** 不安全URL */
  readonly unsafeUrl?: string
  /** 是否在新窗口打开 */
  readonly newWindow?: boolean
  /** 项目计数 */
  readonly count?: number
  /** 子项目 */
  readonly items?: readonly OutlineNode[]
}

/**
 * 目标类型
 */
export type Destination = readonly (string | number)[]

// ============================================================================
// 缓存系统类型
// ============================================================================

/**
 * 缓存项
 */
export interface CacheItem<T = unknown> {
  readonly key: string
  readonly value: T
  readonly size: number
  readonly accessTime: number
  readonly createTime: number
  readonly ttl: number | undefined
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly size: number
  readonly itemCount: number
  readonly hitRate: number
}

/**
 * LRU缓存接口
 */
export interface LRUCache<T = unknown> {
  get(key: string): T | undefined
  set(key: string, value: T, size?: number): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  getStats(): CacheStats
  resize(maxSize: number, maxItems: number): void
  destroy(): void
}

// ============================================================================
// Worker系统类型
// ============================================================================

/**
 * Worker消息类型
 */
export interface WorkerMessage {
  readonly id: string
  readonly type: WorkerMessageType
  readonly data?: unknown
  readonly payload?: unknown
}

export type WorkerMessageType = 'init' | 'render' | 'destroy' | 'response' | 'error'

/**
 * Worker响应
 */
export interface WorkerResponse {
  readonly id: string
  readonly type: 'success' | 'error'
  readonly data?: unknown
  readonly error?: string | WorkerError
}

export interface WorkerError {
  readonly message: string
  readonly stack?: string
}

/**
 * Worker任务
 */
export interface WorkerTask {
  readonly id: string
  readonly type: string
  readonly data: unknown
  readonly priority: TaskPriority
  readonly status: TaskStatus
  readonly retries: number
  readonly maxAttempts: number
  readonly resolve: (value: unknown) => void
  readonly reject: (error: Error) => void
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

/**
 * Worker配置
 */
export interface WorkerConfig {
  readonly maxWorkers?: number
  readonly workerScript?: string
  readonly enableLogging?: boolean
  readonly taskTimeout?: number
  readonly maxRetries?: number
}

/**
 * Worker统计信息
 */
export interface WorkerStatistics {
  readonly totalTasks: number
  readonly completedTasks: number
  readonly failedTasks: number
  readonly activeWorkers: number
  readonly queuedTasks: number
  readonly averageTaskTime: number
}

// ============================================================================
// 错误处理类型
// ============================================================================

/**
 * 错误代码枚举
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
  readonly code: ErrorCode
  readonly details?: unknown
  readonly recoverable?: boolean
  readonly timestamp?: number
  readonly context?: Readonly<Record<string, unknown>>
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
  getErrorStats(): Readonly<Record<ErrorCode, number>>
  clearErrorStats(): void
  shouldRetry(errorCode: ErrorCode, currentRetries: number): boolean
  calculateRetryDelay(errorCode: ErrorCode, retryCount: number): number
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  readonly maxRetries: number
  readonly retryDelay: number
  readonly backoffMultiplier: number
  readonly fallbackAction: string
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
export type EventListener<T = unknown> = (data: T) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  on<T>(event: EventType, listener: EventListener<T>): void
  off<T>(event: EventType, listener: EventListener<T>): void
  emit<T>(event: EventType, data?: T): void
  once<T>(event: EventType, listener: EventListener<T>): void
}

// ============================================================================
// 性能监控类型
// ============================================================================

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  readonly loadTime: number
  readonly renderTime: number
  readonly memoryUsage: number
  readonly cacheHitRate: number
  readonly workerUtilization: number
  readonly errorRate: number
}

/**
 * 性能监控器接口
 */
export interface PerformanceMonitor {
  startTiming(label: string): void
  endTiming(label: string): number
  recordMetric(name: string, value: number): void
  getMetrics(): PerformanceMetrics
  reset(): void
}

// ============================================================================
// 通用工具类型
// ============================================================================

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 可空类型
 */
export type Nullable<T> = T | null

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T
