// 适配器导出

// 导入用于创建默认实例
import { createHttpClient } from './factory'

export {
  AdapterFactory,
  AlovaAdapter,
  AxiosAdapter,
  BaseAdapter,
  createAdapter,
  FetchAdapter,
  isAdapterAvailable,
} from './adapters'

// 核心类导出
export { HttpClientImpl as HttpClient } from './client'

// 开发工具导出
export {
  createDevTools,
  globalDevTools,
  HttpDevTools,
} from './devtools'

export type {
  DevToolsConfig,
  RequestRecord,
} from './devtools'

// Engine 插件导出
export {
  createHttpEnginePlugin,
  createHttpPlugin,
  defaultHttpEnginePlugin,
  httpPlugin,
} from './engine'

// Engine 插件类型导出
export type { HttpEnginePluginOptions } from './engine'

// 重新导出工厂函数
export { createHttpClient } from './factory'

// 功能中间件导出
export {
  withCache,
} from './features/cache'

// GraphQL 功能导出
export {
  createGraphQLClient,
  GraphQLClient,
  GraphQLClientError,
  isGraphQLError,
} from './features/graphql'

export type {
  GraphQLClientConfig,
  GraphQLError,
  GraphQLRequestConfig,
  GraphQLResponse,
  GraphQLVariables,
} from './features/graphql'

// Mock 功能导出
export {
  createMockAdapter,
  createMockInterceptor,
  MockAdapter,
} from './features/mock'

export type {
  MockMatcher,
  MockResponse,
  MockRule,
  MockStats,
} from './features/mock'

export {
  withRetry,
} from './features/retry'

// SSE 功能导出
export {
  BasicSSEClient,
  createBasicSSEClient,
  createSSEClient,
  SSEClient,
  SSEStatus,
} from './features/sse'

export type {
  SSEClientConfig,
  SSEEvent,
  SSEEventListener,
} from './features/sse'

// WebSocket 功能导出
export {
  createWebSocketClient,
  WebSocketClient,
  WebSocketStatus,
} from './features/websocket'

export type {
  WebSocketClientConfig,
  WebSocketEventListener,
  WebSocketEventType,
  WebSocketMessage,
} from './features/websocket'

// 拦截器导出
export {
  authInterceptor,
  cacheInterceptor,
  contentTypeInterceptor,
  createAuthInterceptor,
  createBaseURLInterceptor,
  createResponseTimeInterceptor,
  createRetryInterceptor,
  errorHandlingInterceptor,
  errorLoggerInterceptor,
  InterceptorManagerImpl as InterceptorManager,
  loggingInterceptor,
  requestIdInterceptor,
  requestLoggerInterceptor,
  responseLoggerInterceptor,
  retryInterceptor,
  statusCodeInterceptor,
  timeoutInterceptor,
  timestampInterceptor,
} from './interceptors'

// 核心类型导出
export type * from './types'

// 类型工具导出
export {
  assertType,
  createEnum,
  createTypedError,
  deepClone,
  isArray,
  isFunction,
  isNonNull,
  isNumber,
  isObject,
  isString,
  safeGet,
  safeGetNested,
  safeJsonParse,
  typedEntries,
  typedFilter,
  typedKeys,
  typedMerge,
  typedValues,
  wrapPromise,
} from './types/utils'

// 导出类型工具类型
export type {
  AllowsRequestBody,
  AllStatusCode,
  ArrayToUnion,
  BuildUrlWithParams,
  ClientErrorStatusCode,
  DeepMerge,
  DistributiveOmit,
  ExtractPathParams,
  FunctionKeys,
  FunctionsOnly,
  IsPromise,
  NonFunctionKeys,
  PropertiesOnly,
  ReadonlyTuple,
  RequestBodyType,
  ServerErrorStatusCode,
  StatusCodeMessages,
  StrictEnum,
  SuccessStatusCode,
  UnionToIntersection,
  UnwrapPromise,
} from './types/utils'

// 工具函数导出
export {
  buildQueryString,
  buildURL,
  combineURLs,
  createHttpError,
  delay,
  ErrorClassifier,
  generateId,
  HttpStatus,
  isAbsoluteURL,
  isArrayBuffer,
  isBlob,
  isFormData,
  isURLSearchParams,
  mergeConfig,
} from './utils'

// 批处理导出
export {
  BatchManager,
  createBatchManager,
} from './utils/batch'

export type {
  BatchConfig,
  BatchStats,
} from './utils/batch'

// 缓存功能导出
export {
  CacheManager,
  createCacheManager,
  createEnhancedCacheManager,
  createLocalStorage,
  createMemoryStorage,
  EnhancedCacheManager,
  LocalStorageCacheStorage,
  MemoryCacheStorage,
} from './utils/cache'

// 导出缓存相关类型
export type {
  CacheItemMetadata,
  CacheStats,
  EnhancedCacheConfig,
  EnhancedCacheItem,
} from './utils/cache'

// 取消功能导出
export {
  CancelManager,
  CancelTokenSource,
  createCancelTokenSource,
  createTimeoutCancelToken,
  globalCancelManager,
  isCancelError,
} from './utils/cancel'

// 并发控制导出
export {
  ConcurrencyManager,
  createConcurrencyManager,
  createDeduplicationKeyGenerator,
  createDeduplicationManager,
  createRateLimitManager,
  DeduplicationKeyGenerator,
  DeduplicationManager,
  RateLimitManager,
  DeduplicationManager as RequestDeduplicator,
} from './utils/concurrency'

export type {
  DeduplicationStats,
} from './utils/concurrency'

// 导出去重相关类型
export type {
  DeduplicationKeyConfig,
} from './utils/concurrency'

// 调试工具导出
export {
  createDebugInterceptor,
  createHttpDebugger,
  DebugLevel,
  HttpDebugger,
} from './utils/debugger'

export type {
  DebugEvent,
  DebuggerConfig,
  PerformanceMetrics as DebugPerformanceMetrics,
  RequestLog,
  ResponseLog,
} from './utils/debugger'

export {
  createDownloadChunks,
  createRangeHeader,
  DownloadProgressCalculator,
  formatDownloadSpeed,
  formatTimeRemaining,
  getFilenameFromResponse,
  getFilenameFromURL,
  getMimeTypeFromFilename,
  isPreviewableFile,
  mergeDownloadChunks,
  parseContentRange,
  saveFileToLocal,
  supportsRangeRequests,
} from './utils/download'

// 错误处理导出
export {
  builtinRecoveryStrategies,
  ErrorAnalyzer,
  ErrorHandler,
  ErrorType,
  RetryManager,
  TimeoutManager,
} from './utils/error'

// 导出错误处理相关类型
export type {
  ErrorRecoveryStrategy,
  ErrorStats,
} from './utils/error'

// 日志管理器导出
export {
  createLogger,
  devLogger,
  logger,
  Logger,
  LogLevel,
} from './utils/logger'

export type {
  LoggerConfig,
} from './utils/logger'

// 内存监控导出
export {
  createMemoryMonitor,
  globalMemoryCleaner,
  globalMemoryMonitor,
  MemoryCleaner,
  MemoryMonitor,
} from './utils/memory'

export type {
  MemoryMonitorConfig,
  MemoryStats,
  MemoryUsage,
} from './utils/memory'

// 性能监控导出
export {
  createRequestMonitor,
  defaultMonitor,
  RequestMonitor,
} from './utils/monitor'

export type {
  MonitorConfig,
  PerformanceMetrics,
  PerformanceStats,
} from './utils/monitor'

// 网络状态导出
export {
  ConnectionType,
  createNetworkInterceptor,
  createNetworkMonitor,
  globalNetworkMonitor,
  NetworkMonitor,
  NetworkStatus,
  waitForOnline,
} from './utils/network'

export type {
  NetworkInfo,
  NetworkMonitorConfig,
} from './utils/network'

// 离线队列导出
export {
  createOfflineQueueManager,
  OfflineQueueManager,
} from './utils/offline'

export type {
  OfflineQueueConfig,
  OfflineQueueStats,
} from './utils/offline'

// 连接池导出
export {
  createRequestPool,
  defaultPool,
  RequestPool,
} from './utils/pool'

export type {
  ConnectionInfo,
  PoolConfig,
  PoolStats,
} from './utils/pool'

// 优先级队列导出
export {
  createPriorityQueue,
  determinePriority,
  Priority,
  PriorityQueue,
} from './utils/priority'

export type {
  PriorityItem,
  PriorityQueueConfig,
  PriorityQueueStats,
} from './utils/priority'

// 请求去重导出
export {
  defaultKeyGenerator,
  generateRequestKey,
  DeduplicationKeyGenerator as RequestDeduplicationKeyGenerator,
} from './utils/request-dedup'

export type {
  DeduplicationKeyConfig as RequestDeduplicationKeyConfig,
} from './utils/request-dedup'

// 签名功能导出
export {
  createSignatureInterceptor,
  createSignatureManager,
  SignatureManager,
} from './utils/signature'

export type {
  SignatureConfig,
  SignatureResult,
} from './utils/signature'

// 智能重试导出
export {
  createSmartRetryInterceptor,
  createSmartRetryManager,
  globalSmartRetryManager,
  RetryStrategy,
  SmartRetryManager,
} from './utils/smartRetry'

export type {
  RetryDecision,
  SmartRetryConfig,
} from './utils/smartRetry'

// 请求追踪导出
export {
  consoleExporter,
  createRequestTracer,
  createTraceInterceptor,
  globalTracer,
  RequestTracer,
  Span,
  SpanStatus,
  SpanType,
  Trace,
} from './utils/trace'

export type {
  TraceConfig,
  TraceContext,
  TraceSpan,
  TraceTag,
} from './utils/trace'

// 数据转换导出
export {
  createDataTransformer,
  createDataTransformInterceptor,
  DataTransformer,
  globalDataTransformer,
  nullToUndefined,
  transformBigInts,
  transformDates,
} from './utils/transformer'

export type {
  TransformerConfig,
} from './utils/transformer'

// 文件上传下载导出
export {
  createFileChunks,
  createFilePreviewURL,
  createUploadFormData,
  FileValidationError,
  formatFileSize,
  generateFileHash,
  getFileExtension,
  isAudioFile,
  isDocumentFile,
  isImageFile,
  isVideoFile,
  ProgressCalculator,
  revokeFilePreviewURL,
  validateFile,
} from './utils/upload'

// Vue 相关导出
export * from './vue'

/**
 * 创建默认的 HTTP 客户端实例
 */
export const http = createHttpClient()

// 默认导出（为了兼容性保留，但推荐使用命名导出）
export default createHttpClient
